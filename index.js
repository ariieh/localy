var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

/* Router */
//Root
app.get('/', function(req, res){
  res.sendfile('index.html');
});

//Vendor
app.get('/vendor/jquery.js', function(req, res){ res.sendfile('vendor/jquery.js'); });

//JavaScript library
app.get('/lib/geolocation.js', function(req, res){ res.sendfile('lib/geolocation.js'); });

/* IO connections */
io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
});

/* Server */
http.listen(3000, function(){
  console.log('listening on *:3000');
});