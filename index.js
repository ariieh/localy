var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

/* Router */
//Root
app.get('/', function(req, res){ res.sendfile('index.html'); });

//Vendor
app.get('/vendor/:file', function(req, res){ res.sendfile('vendor/' + req.params.file); });
app.get('/vendor/images/:image', function(req, res){ res.sendfile('vendor/images/' + req.params.image); });

//JavaScript library
app.get('/lib/:file', function(req, res){ res.sendfile('lib/' + req.params.file); });

//Stylesheets
app.get('/stylesheets/:file', function(req, res){ res.sendfile('stylesheets/' + req.params.file); });

/* IO connections */
io.on('connection', function(socket){
});

/* Server */
http.listen(3000, function(){
  console.log('listening on *:3000');
});