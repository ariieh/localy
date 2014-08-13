var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var serverMarkerData = {};

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
	
	socket.on('load map', function(userID){
    io.to(userID).emit('load map', serverMarkerData);
	});
	
  socket.on('load marker', function(coords, name, userID){
		serverMarkerData[userID] = [coords, name];
    io.emit('load marker', coords, name, userID);
  });
});

/* Server */
http.listen(3000, function(){
  console.log('listening on *:3000');
});