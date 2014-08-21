'use strict';

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var size = 0;

var serverMarkerData = {};

/* Router */
	//Root
	app.get('/', function(req, res){ res.sendfile('index.html'); });

	//Vendor
	app.get('/vendor/:file', function(req, res){ res.sendfile('vendor/' + req.params.file); });
	app.get('/vendor/images/:image', function(req, res){ res.sendfile('vendor/images/' + req.params.image); });
	app.get('/vendor/leaflet.markercluster/dist/:file', function(req, res){
		res.sendfile('vendor/leaflet.markercluster/dist/' + req.params.file);
	});

	app.get('/stylesheets/images/:image', function(req, res){ res.sendfile('vendor/images/' + req.params.image); });

	//JavaScript library
	app.get('/lib/:file', function(req, res){ res.sendfile('lib/' + req.params.file); });

	//Stylesheets
	app.get('/stylesheets/:file', function(req, res){ res.sendfile('stylesheets/' + req.params.file); });

/* IO connections */
	io.on('connection', function(socket){
		
		socket.on('load map', function(userID){
	    io.to(userID).emit('load map', serverMarkerData);
			size += 1;
			io.emit('user count', size);
		});
	
	  socket.on('load marker', function(coords, name, userID, placeName){
			serverMarkerData[userID] = {coords:coords, name:name};
			socket.join(placeName);
	    io.emit('load marker', coords, name, userID);
	  });
		
		socket.on('disconnect', function(){
			size -= 1;
			delete serverMarkerData[socket.id];
			io.emit('user count', size);
	    io.emit('delete marker', socket.id);
		});
		
		socket.on('chat message', function(msg, userID, placeName){
			io.sockets.in(placeName).emit('chat message', msg, userID);
		});
		
	});
	
/* Server */
	http.listen(3000, function(){
	  console.log('listening on *:3000');
	});