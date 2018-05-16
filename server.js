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

//app.get('/datos',function(req,res){
//  console.log(req.query);
//  res.send("Nombre : "+req.query.nombre +" <br> Tarea : "+req.query.tarea|| '');
//});

var datos = [];
function addTask(){
  var html = "";
  var x = 0;
  for (const dato of datos) {
    
    dato.id =x;

    html +=  "<tr>"+
      "<td class='center'>[id]</td>"+
      "<td class='center'>[nombre]</td>"+
      "<td>[tarea]</td>"+
      "<td>"+  
         "<form action='/borrar/tarea' method='POST'>"+
            "<input type='hidden' name='id' value='"+x+"'>"+
            "<input type='submit' value='X' name='d'>"+
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
  console.log(req.headers);
  fs.readFile('./www/tareas/index.html','utf8',function(err,txt){
    if(req.body.nombre != undefined){
      datos.push({
        name:req.body.nombre || "",
        task:req.body.tarea || "",
        id:0
      });
    }
    
    text = txt.replace("[sustituir]",addTask());     
    res.send(text);
  });
});

app.post('/borrar/tarea', function (req, res) {
   console.log("array antes de splice",datos);
   datos.splice(req.body.id,1);
   console.log("array despues de splice",datos);
   res.redirect(307,'/');
});


app.use(express.static('www/tareas'));
