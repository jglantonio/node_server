var express = require('express');
var fs = require('fs');
var app = express();
var bodyParser = require('body-parser');
var mysql      = require('mysql');

var datos = [];

var ip = 'http://192.168.0.43:3000'

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'master',
  password : '1234',
  database : 'tareasdb'
});
 
connection.connect(function(err){
  if(err){
    console.log("# Error de conexión");
    console.log(err);
  }else{
    console.log("# Conectado a la base de datos");
  }
});
 
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

var server = app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

app.use('/calculadora', express.static('www/calculadora/docs'));

app.use('/tareas', express.static('www/tareas'));



function leerDB(cb){
  var q = 'SELECT * FROM tareas';
  var query = connection.query( q, function (error, results) {
    if (error) {
      throw error;
    }else{
      datos = results;
      console.log(datos);
      cb();
    }
  });  
}

//if(fs.exists('./data.json')){
//  var datos = []  ;
//}else{
//  var data = JSON.parse(fs.readFileSync('./data.json','utf-8',function(){}));
//  var datos = data  ;  
//}

//fs.open('./data.json','r',function(err,fd){
//if(err){
//    this.datos = []  ;
//  }else{
//    var data = JSON.parse(fs.readFileSync('./data.json','utf-8',function(){}));
//    this.datos = data  ;  
//  }
// });
//app.get('/datos',function(req,res){
//  console.log(req.query);
//  res.send("Nombre : "+req.query.nombre +" <br> Tarea : "+req.query.tarea|| '');
//});

/**
 * function addTask()
 * Crea los elementos de la tabla.
 */
function addTask(){
  var html = "";
  var x = 0;
  for (const dato of datos) {
    
    html += 
    "<tr>"+
      "<td class='center'>[id]</td>"+
      "<td class='center'>[nombre]</td>"+
      "<td>[tarea]</td>"+
      "<td style='text-align:center;'>"+  
        "<div class='botones'><form action='/borrar/tarea' method='POST'>"+
          "<input type='hidden' name='id' value='"+dato.id+"'>"+
          "<input type='submit' value='Eliminar' name='d'>"+
        "</form>"+
        "<form action='/editar/tarea' method='POST'>"+
          "<input type='hidden' name='id' value='"+dato.id+"'>"+
          "<input type='submit' value='Editar' name='d'>"+
        "</form></div>"+
      "</td>"+
    "</tr>";
  
    html = html.replace('[id]',dato.id);
    html = html.replace('[nombre]',dato.nombre);
    html = html.replace('[tarea]',dato.tarea);

    x++;
  }
    return html;
}

/**
 * function log(level,message)
 * Define los niveles de log
 * @param {integer} level 
 * @param {string} message 
 */
 function log(level,message){
    text = '';
    for(let x = 0 ; x <= level ;x++){
      text+='#';
    }
    return text+' '+message;
 }

/**
 * function resetForm(text,action,nombre = "",tareas ="",id="")
 * Función que establece los campos que necesitan una inicialización
 * en el código html.
 * @param {string} text 
 * @param {string} action 
 * @param {string} nombre 
 * @param {string} tareas 
 * @param {integer} id 
 */
function resetForm(text,action,nombre = "",tareas ="",id=""){
  text = text.split("[ip]").join(ip);
  text = text.replace('[action]',action);
  text = text.replace('[id]',id);
  text = text.replace("[nombre]",nombre);  
  text = text.replace("[tarea]",tareas); 

  return text;
}

/**
 * function clearHeader(res)
 * Establece como Undefined las variables que entran por las
 * peticiones del header.
 * @param {Response} res 
 */
function clearHeader(res){
  res.header.nombre= undefined;
  res.header.tarea = undefined;
}


app.get('/',function(req,res){
  console.log("# Entra en la peticion GET");
  connection.query("select * from tareas",function(error,result){
    if(error){
     throw error;
    }else{
      fs.readFile('./www/tareas/index.html','utf8',function(err,txt){
        console.log("## Consulta realizada");
        datos = result;
        txt = txt.replace('[sustituir]', addTask());
        clearHeader(res);
        res.send(resetForm(txt,ip));
      });
    }
  });
});

/**
 * app.post('/datos',function(req,res)
 * Petición por el método POST , la url de '/datos' donde se necesita el body-parse
 * para que tramita los datos.
 */
// app.post('/datos',function(req,res){
//   console.log(req.body);
//   res.send("Nombre : "+req.body.nombre +" <br> Tarea : "+req.body.tarea|| '');
// });

app.post('/',function(req,res){
  console.log("# Entra en la petición POST - Se inserta un dato");
    if(req.body.nombre != undefined){
      var  post = [
        req.body.nombre || "", 
        req.body.tarea || ""
      ];
      var q = 'INSERT INTO tareas (nombre,tarea) VALUES (?,?)';
      var query = connection.query( q,post, function (error, results) {
        if (error) {
          throw error;
        }else{
          console.log("## Datos actualizados");
          res.redirect(301,'/');
        }
      });  
    }
});

/**
 * app.post('/borrar/tarea', function (req, res)
 * Borra el dato del array , que viene dado por el id.
 */
app.post('/borrar/tarea', function (req, res) {
  console.log('# Peticion DELETE de borrar la tarea dado un id')
  connection.query('DELETE FROM tareas WHERE id = "'+req.body.id+'"', function (error, results, fields) {
    if (error) throw error;
    else {
      console.log('## Dato borrado');
      res.redirect(301,'/');
    }
  })
});
/**
 * app.post('/editar/tarea', function (req, res)
 * Función que establece la edición de los campos , estableciendo
 * los valores que se piden
 * @param {Request} req
 * @param {Response} res
 */
app.post('/editar/tarea', function (req, res) {
  console.log("# Petición POST redirect de Editar");
  var task = 0;
  fs.readFile('./www/tareas/index.html','utf8',function(err,txt){
    for(dato of datos){
      if(dato.id == req.body.id){
        task = dato;
      }
    }
    console.log(task,req.body);
  
    res.send(resetForm(txt,ip+"/actualizar/tarea",task.nombre,task.tarea,task.id));
  });
});
/**
 * app.post('/actualizar/tarea', function (req, res)
 * Función que actualiza los datos.
 * @param {Request} req
 * @param {Response} res
 */
app.post('/actualizar/tarea', function (req, res) {
  console.log("# Peticion POST de EDITAR una tarea");
  fs.readFile('./www/tareas/index.html','utf8',function(err,txt){
    connection.query('UPDATE tareas SET nombre = ? , tarea = ? WHERE id = ?', [req.body.nombre, req.body.tarea, req.body.id], 
    function (error, results, fields) {
      if (error) throw error;
      else {
        console.log("## Dato actualizado");
        res.redirect(301,'/');
      }
    });
  });
});


app.use(express.static('www/tareas'));

app.get('/pruebas',function(req , res){
  var nombre = "pedro";
  connection.query("select * from tareas",function(error,result){
    if(error){
     throw error;
    }else{
      fs.readFile('./www/tareas/index.html','utf8',function(err,txt){
        console.log("## Consulta relaizada");
        datos = result;
        txt = txt.replace('[sustituir]', addTask());
        clearHeader(res);
        res.send(resetForm(txt,ip));
      });
    }
  });
});