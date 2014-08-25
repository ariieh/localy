'use strict';

/* Initialize server and sockets */
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

/* DB */
var DB = require('./db.js');
var knex = DB.bookshelf.knex;

/* Helper functions */
var userCount = function(callback){
	knex('users').count('id').then(function(res){
		callback(parseInt(res[0].count));
	});
}

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
						userCount(function(count){ io.emit('user count', count); });
					});
				});
			});

	  });
		
		socket.on('chat message', function(msg, userID){
			// Need to be able to get this working with Bookshelf!
			knex
					.select("rooms.*")
					.from('users')
					.innerJoin('rooms_users', 'users.id', 'rooms_users.user_id')
					.innerJoin('rooms', 'rooms.id', 'rooms_users.room_id')
					.where('users.socket_id', '=', userID)
					.then(function(rooms){
						for (var i = 0; i < rooms.length; i++){
							io.sockets.in(rooms[i].name).emit('chat message', msg, userID);
						}
					});
		});
				
		socket.on('disconnect', function(event){			
			DB.Users
			  .query({where: {socket_id: socket.id}})
			  .fetchOne()
			  .then(function(user) {
					user.destroy().then(function(){
						userCount(function(count){ 
							io.emit('user count', count);
							io.emit('delete marker', socket.id);
						});
					});
			  });
		});
	});
	
/* Server */
	http.listen(3000, function(){
	  console.log('listening on *:3000');
	});