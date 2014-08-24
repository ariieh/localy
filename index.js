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
			new DB.User({
				socket_id: userID,
				name: name,
				latitude: position[0],
				longitude: position[1]
			}).save().then(function(user){
				new DB.Room({
					name: placeName
				}).save().then(function(room){
					new DB.RoomJoin({
						user_id: user.id,
						room_id: room.id
					}).save();
				});
			});
			
			socket.join(placeName);
	    io.emit('load marker', {lat: position[0], lon: position[1]}, name, userID);
	  });
		
		socket.on('chat message', function(msg, userID){
			users
			  .query('where', 'socket_id', '=', userID)
			  .fetch()
			  .then(function(collection) {
					console.log(collection);
			  });
			
			// for (var i = 0; i < serverMarkerData[userID].rooms.length; i++){
			// 	io.sockets.in(serverMarkerData[userID].rooms[i]).emit('chat message', msg, userID);
			// }
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