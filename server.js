var express = require('express');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.use(express.static('www'));

var server = app.listen(80, function () {
  console.log('Example app listening on port 3000!');
});

app.use('/calculadora', express.static('www/calculadora/docs'));

app.use('/tareas', express.static('www/tareas'));

//app.get('/datos',function(req,res){
//  console.log(req.query);
//  res.send("Nombre : "+req.query.nombre +" <br> Tarea : "+req.query.tarea|| '');
//});

app.post('/datos',function(req,res){
  console.log(req.body);
  res.send("Nombre : "+req.body.nombre +" <br> Tarea : "+req.body.tarea|| '');
  
});

app.get('/',function(req,res){
  res.send('Hola mundo!');
  console.log('Peticion recibida!');
});