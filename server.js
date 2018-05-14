var express = require('express');
var app = express();

app.use(express.static('www'));

var server = app.listen(80, function () {
  console.log('Example app listening on port 3000!');
});

app.use('/calculadora', express.static('www/calculadora/docs'));

app.use('/tareas', express.static('www/tareas'));
