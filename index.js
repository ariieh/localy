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

var destroyUser = function(user){
	var socketID = user.attributes.socket_id;
	
	user.destroy().then(function(){
		userCount(function(count){ 
			io.emit('user count', count);
			io.emit('delete marker', socketID);
		});
	});
}

var msgAllRooms = function(rooms, msg, userID){
	for (var i = 0; i < rooms.length; i++){
		io.sockets.in(rooms[i].roomname).emit('chat message', msg, userID);
	}
}

var degToRad = function(deg){
	return deg * (Math.PI / 180);
}

var radToDeg = function(rad){
	return rad * (180 / Math.PI);
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
	
	  socket.on('load marker', function(position, username, userID, placename){
			new DB.User({
				socket_id: userID,
				username: username,
				latitude: degToRad(position[0]),
				longitude: degToRad(position[1])
			}).save().then(function(user){
				
				DB.Rooms.query({where: {roomname: placename}}).fetchOne().then(function(existingRoom){
						var newRoom = (existingRoom || new DB.Room( {roomname: placename} ));
						
						newRoom.save().then(function(room){
							new DB.RoomJoin({
								user_id: user.id,
								room_id: room.id
							}).save().then(function(roomjoin){
								socket.join(placename);
						    io.emit('load marker', user);
								userCount(function(count){ io.emit('user count', count); });
							});
						});
				  	
				});				
			});
	  });
		
		socket.on('swap room', function(socketID, placename){
			DB.Users.query({where: {socket_id: socketID}}).fetchOne().then(function(user){

				DB.Rooms.query({where: {roomname: placename}}).fetchOne().then(function(existingRoom){
						var newRoom = (existingRoom || new DB.Room( {roomname: placename} ));
						
						newRoom.save().then(function(room){						
							knex('rooms_users').where('user_id', user.id).del().then(function(){
								new DB.RoomJoin({
									user_id: user.id,
									room_id: room.id
								}).save().then(function(roomjoin){
									for (var i = 0; i < socket.rooms.length; i++){
										if (socket.rooms[i] !== socket.id) socket.leave(socket.rooms[i]);
									}
									
									socket.join(placename);
								});		
							});
						});
						
				});
				
			});
		});
		
		socket.on('chat message', function(msg, userID){
			// Need to be able to get this working with Bookshelf!
			knex
					.select('rooms.*')
					.from('users')
					.innerJoin('rooms_users', 'users.id', 'rooms_users.user_id')
					.innerJoin('rooms', 'rooms.id', 'rooms_users.room_id')
					.where('users.socket_id', '=', userID)
					.then(function(rooms){
						msgAllRooms(rooms, msg, userID);
					});
		});
		
		socket.on('radius message', function(msg, userID, lat, lon){
			lat = degToRad(lat);
			lon = degToRad(lon);
			
			//All distances in miles
			var earthRadius = 3959;
			var localRadius = 0.02;
			
			var latDelta = localRadius / earthRadius;
			var lonDelta = Math.asin(Math.sin(latDelta) / Math.cos(lat));
			
			var minLat = lat - latDelta;
			var maxLat = lat + latDelta;
			
			var minLon = lon - lonDelta;
			var maxLon = lon + lonDelta;			

			knex
					.select('*')
					.from('users')
					.whereRaw('(latitude >= ? AND latitude <= ?) AND (longitude >= ? AND longitude <= ?) AND (acos(sin(?) * sin(latitude) + cos(?) * cos(latitude) * cos(longitude - (?))) <= ?)', [minLat, maxLat, minLon, maxLon, lat, lat, lon, latDelta])
					.then(function(rows){
						for (var i = 0; i < rows.length; i++){
							var user = rows[i];
					    io.to(user.socket_id).emit('chat message', msg, userID);
						}
					});
			
		});
				
		socket.on('disconnect', function(event){			
			DB.Users
			  .query({where: {socket_id: socket.id}})
			  .fetchOne()
			  .then(destroyUser);
		});
	});
	
/* Server */
	http.listen(3000, function(){
	  console.log('listening on *:3000');
	});