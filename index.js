'use strict';

/* Initialize server and sockets */
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

/* DB */
var DB = require('./db.js');
app.set('bookshelf', DB.bookshelf);

/* Data */
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
			size += 1;
			
	    io.to(userID).emit('load map', serverMarkerData);
			io.emit('user count', size);
		});
	
	  socket.on('load marker', function(position, name, userID, placeName){
			new DB.user({
				userID: userID,
				name: name,
				latitude: position[0],
				longitude: position[1]
			}).save();
			
			serverMarkerData[userID] = {coords: {lat: position[0], lon: position[1]}, name: name, rooms: [placeName]};			
			socket.join(placeName);
	    io.emit('load marker', serverMarkerData[userID].coords, name, userID);
	  });
		
		socket.on('chat message', function(msg, userID){
			for (var i = 0; i < serverMarkerData[userID].rooms.length; i++){
				io.sockets.in(serverMarkerData[userID].rooms[i]).emit('chat message', msg, userID);				
			}
		});
				
		socket.on('disconnect', function(){
			size -= 1;
			
			delete serverMarkerData[socket.id];
			io.emit('user count', size);
	    io.emit('delete marker', socket.id);
		});
				
	});
	
/* Server */
	http.listen(3000, function(){
	  console.log('listening on *:3000');
	});