var express = require('express');
var app = express();
var path = require('path');

app.use('/static', express.static(__dirname + '/dist/static/'));

app.get('/', function(req, res){
    res.sendFile(path.join(__dirname + '/dist/index.html'));
});

app.listen(8080);
console.log('App running on port 8080...');
