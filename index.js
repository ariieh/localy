'use strict';

/* Initialize server and sockets */
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

/* DB */
var DB = require('./db.js');
var knex = DB.bookshelf.knex;

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
			knex.select().table('users').then(function(users){
		    io.to(userID).emit('load map', users);				
			});
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
					}).save().then(function(roomjoin){
						socket.join(placeName);
				    io.emit('load marker', user);
						knex('users').count('id').then(function(res){
							io.emit('user count', parseInt(res[0].count));
						});
					});
				});
			});

	  });
		
		socket.on('chat message', function(msg, userID){
			DB.Users
			  .query({where: {socket_id: userID}})
			  .fetchOne()
			  .then(function(model) {
					
					// for (var i = 0; i < model.rooms.length; i++){
					// 	io.sockets.in(serverMarkerData[userID].rooms[i]).emit('chat message', msg, userID);
					// }
			  });
			
		});
				
		socket.on('disconnect', function(event){			

			DB.Users
			  .query({where: {socket_id: socket.id}})
			  .fetchOne()
			  .then(function(user) {
					user.destroy();
			  });
			
			knex('users').count('id').then(function(res){
				io.emit('user count', res);
		    io.emit('delete marker', socket.id);				
			});
		});
				
	});
	
/* Server */
	http.listen(3000, function(){
	  console.log('listening on *:3000');
	});