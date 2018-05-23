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



/**
 * function leerDB(cb)
 * Función que lee los datos de la base de datos
 * @param {callback} cb 
 */

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
      "<td >[tarea]</td>"+
      "<td class='center'>[tiempo]</td>"+
      "<td style='text-align:center;'>"+  
        "<div class='botones'><form action='/borrar/tarea' method='POST'>"+
          "<input type='hidden' name='id' value='"+dato.id+"'>"+
          "<input type='submit' value='Eliminar' name='d'>"+
        "</form>"+
        "<form action='/editar/tarea' method='POST'>"+
          "<input type='hidden' name='id' value='"+dato.id+"'>"+
          "<input type='submit' value='Editar' name='d'>"+
        "</form>"+
       "</div>"+
      "</td>"+
    "</tr>";
  
    html = html.replace('[id]',dato.id);
    html = html.replace('[nombre]',dato.nombre);
    html = html.replace('[tarea]',dato.tarea);
    html = html.replace('[tiempo]',dato.tiempo);

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
 * @param {integer} tiempo 
 */
function resetForm(text,action,nombre = "",tareas ="",id="",tiempo=""){
  text = text.split("[ip]").join(ip);
  text = text.replace('[action]',action);
  text = text.replace('[id]',id);
  text = text.replace("[nombre]",nombre);  
  text = text.replace("[tarea]",tareas);  
  text = text.replace("[tiempo]",tiempo); 

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

/**
 * función para el inicio de la aplciación
 */
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
        txt = txt.replace('[tiempo_sustituir]', addGrant());
        txt = txt.replace('[tiempo_tabla]', numColspan+1);
        
        clearHeader(res);
        res.send(resetForm(txt,ip));
      });
    }
  });
});

/**
 * función que se encarga de la petición POST , cuando se quiere
 * insetar un dato 
 */
app.post('/',function(req,res){
  console.log("# Entra en la petición POST - Se inserta un dato");
    if(req.body.nombre != undefined){
      var  post = [
        req.body.nombre || "", 
        req.body.tarea || "",
        req.body.tiempo || "",
      ];
      var q = 'INSERT INTO tareas (nombre,tarea,tiempo) VALUES (?,?,?)';
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
  connection.query("select * from tareas",function(error,result){
    if(error){
     throw error;
    }else{
      fs.readFile('./www/tareas/index.html','utf8',function(err,txt){
        datos = result;
        for(dato of datos){
          if(dato.id == req.body.id){
            task = dato;
          }
        }
        txt = txt.replace('[sustituir]', addTask());
        clearHeader(res);
        res.send(resetForm(txt,ip+"/actualizar/tarea",task.nombre,task.tarea,task.id,task.tiempo));
      });
    }
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
    connection.query('UPDATE tareas SET nombre = ? , tarea = ? , tiempo = ?  WHERE id = ?', 
      [req.body.nombre, req.body.tarea, req.body.tiempo, req.body.id], 
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

var numColspan = 0;
function addGrant(){
  numColspan = 0;
  var html = "";
  var usersTimes = [];
  var nameuser = "";
  var repeats = [];
  for (const dato of datos) {
    if(numColspan <= dato.tiempo){
      numColspan = dato.tiempo;
    }
    var occurrences = datos.filter(function(val) {
      return val.nombre === dato.nombre;
    });
    if(occurrences.length != 1){
      repeats.push(occurrences);
    }else{
      usersTimes.push({
        nombre : dato.nombre,
        color: '#'+(Math.random()*0xFFFFFF<<0).toString(16),
        tiempo : dato.tiempo
      });
    }
  }
  var x = 0;
  for (const repeat of repeats) {
    x++;
    if(x % 2 == 0){
      let time = 0 , nombre = "";
      for (const r of repeat) {
        console.log(r);
        time += r.tiempo;
        nombre = r.nombre;
      }  
        usersTimes.push({
          nombre : nombre,
          tiempo : time,
          color: '#'+(Math.random()*0xFFFFFF<<0).toString(16)
        });
    }
    
  }

  
  for (const userTime of usersTimes) {
    html += "<tr><td stlye='background-color:white;'>"+userTime.nombre+"</td>"
    for (let index = 0; index < numColspan; index++) {
      if(index < userTime.tiempo){

        html += "<td style='width:1px;heigth:1px;background-color:"+userTime.color+";'>"+(index+1)+"</td>"
      }else{
        
        html += "<td ></td>"
      }
    }

    html += "</tr>";
  }
  return html;
}
