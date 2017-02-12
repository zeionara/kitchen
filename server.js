var express = require('express');
var bodyParser = require('body-parser');

var app = new express();
var jsonParser = bodyParser.json();

app.use(express.static(__dirname + "/public"));
app.get("/",function(request,response){
  response.end("Main page");
});

app.post("/addnew_handler",jsonParser,function(request,response){
    if(!request.body) return response.sendStatus(400);
    console.log(request.body);
    response.json("Accepted");
});

app.listen(3000);
