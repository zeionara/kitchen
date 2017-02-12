var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');

var app = new express();
var jsonParser = bodyParser.json();
var connection = mysql.createConnection({
  host : "127.0.0.1",
  user : "root",
  password: "stopper",
  database : "dbmain",
});

app.use(express.static(__dirname + "/public"));
app.get("/",function(request,response){
  response.end("Main page");
});

app.post("/addnew_handler",jsonParser,function(request,response){
    if(!request.body) return response.sendStatus(400);

    connection.query("INSERT INTO cooks (name, surname, patronymic, russian, italian, japanese, morningshifts, eveningshifts, "+
    "necessityshiftstime, dayduration, necessitydayduration, workingmode_5_2, workingmode_2_2) "+
    "VALUES ('"+request.body.name+"', '"+request.body.surname+"', '"+request.body.patronymic+"', "+request.body.russian+", "+request.body.italian+", "+
    request.body.japanese+", "+request.body.morningshifts+", "+request.body.eveningshifts+", "+request.body.necessityshiftstime+", "+request.body.dayduration+
    ", "+request.body.necessitydayduration+", "+request.body.workingmode_5_2+", "+request.body.workingmode_2_2+");",function(error,result,fields){
      console.log(error);
      console.log(result);
    });

    console.log(request.body);
    response.json("Accepted");
});

app.post("/load_cooks_handler",jsonParser,function(request, response){
  console.log("Loading info ...");

  connection.query("SELECT * FROM cooks",function(error,result,fields){
    console.log(error);
    if(error) return response.json(error);
    console.log(result);
    response.json(result);
  });


});

app.listen(3000);
