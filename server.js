var express = require('express');
var fs = require('fs');
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

var server = app.listen(80, function () {
  console.log('Example app listening on port 3000!');
});

app.use('/calculadora', express.static('www/calculadora/docs'));

app.use('/tareas', express.static('www/tareas'));

//if(fs.exists('./data.json')){
//  var datos = []  ;
//}else{
//  var data = JSON.parse(fs.readFileSync('./data.json','utf-8',function(){}));
//  var datos = data  ;  
//}

fs.open('./data.json','r',function(err,fd){
  if(err){
    this.datos = []  ;
  }else{
    var data = JSON.parse(fs.readFileSync('./data.json','utf-8',function(){}));
    this.datos = data  ;  
  }
});
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
  console.log(datos);  
  for (const dato of datos) {
    
    dato.id =x;

    html +=  
    
    "<tr>"+
      "<td class='center'>[id]</td>"+
      "<td class='center'>[nombre]</td>"+
      "<td>[tarea]</td>"+
      "<td style='text-align:center;'>"+  
        "<form action='/borrar/tarea' method='POST'>"+
          "<input type='hidden' name='id' value='"+x+"'>"+
          "<input type='submit' value='X' name='d'>"+
        "</form>"+
        "<form action='/editar/tarea' method='POST'>"+
          "<input type='hidden' name='id' value='"+x+"'>"+
          "<input type='submit' value='E' name='d'>"+
        "</form>"+
      "</td>"+
    "</tr>";
  
    html = html.replace('[id]',x);
    html = html.replace('[nombre]',dato.name);
    html = html.replace('[tarea]',dato.task);

    x++;
  }
   
    return html;
}

function storeTask(task){
  fs.writeFile('./data.json',JSON.stringify(task),function(err){
      console.log("## Fichero de datos actualizado");
  });
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
  

app.get('/',function(req,res){
  console.log("# Entra en la peticion GET");
  var nombre = req.query.nombre;
  var tarea = req.query.tarea;
  var html = fs.readFile('./www/tareas/index.html', 'utf8',function(err,text){
    if(req.query.nombre !== undefined){
        datos.push({
          name:nombre,
          task:tarea,
          id:0
        });
    }
    text = text.replace('[sustituir]',addTask());
    clearHeader(res);
    res.send(text);
  })

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
  console.log("# Entra en la petición POST");
  fs.readFile('./www/tareas/index.html','utf8',function(err,txt){
    if(req.body.nombre != undefined){
      var tarea = {
        name:req.body.nombre || "",
        task:req.body.tarea || "",
        id:0
      }; 
      datos.push(tarea);
      storeTask(datos);
    }
    text = txt.replace("[sustituir]",addTask());  
    clearHeader(res);
    res.send(text);
  });
});

/**
 * app.post('/borrar/tarea', function (req, res)
 * Borra el dato del array , que viene dado por el id.
 */
app.post('/borrar/tarea', function (req, res) {
   console.log("array antes de splice",datos);
   datos.splice(req.body.id,1);
   storeTask(datos);
   console.log("array despues de splice",datos);
   clearHeader(res);
   res.redirect(307,'/');
});
app.post('/editar/tarea', function (req, res) {
  var task = 0;
  fs.readFile('./www/tareas/editar.html','utf8',function(err,txt){
      
     for(dato of datos){
        if(dato.id = req.body.id){
          task = dato;
        }
      }
    text = txt.replace("[nombre]",task.name);  
    text = text.replace("[tarea]",task.task);  
    console.log(text);
    res.send(text);
  });
});

app.post('/actualizar/tarea', function (req, res) {
  var task = 0;
  fs.readFile('./www/tareas/editar.html','utf8',function(err,txt){
      
    for(dato of datos){
      if(dato.id = req.body.id){
        task = dato;
      }
    }

    text = txt.replace("[nombre]",task.name);  
    text = text.replace("[tarea]",task.task);  
    console.log(text);
    res.send(text);
  });
  res.redirect(307,'/');
});
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


app.use(express.static('www/tareas'));