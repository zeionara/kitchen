var express = require('express');
var app = new express();
app.use(express.static(__dirname + "/public"));
app.get("/",function(request,response){
  response.end("Main page");
});
app.listen(3000);
