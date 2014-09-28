'use strict';

// init projRequire
require('./projRequire');

/* Initialize server and sockets */
var express = require('express');
var app = exports.app = express();

var http = require('http').Server(app);
var io = exports.io = require('socket.io')(http);

/* DB */
var DB = exports.DB = require('./lib/server/db.js');
var knex = exports.knex = DB.bookshelf.knex;

/* Math */
var MathLib = exports.MathLib = require('./lib/server/math.js');

/* DB helper functions */
var DBHelper = exports.DBHelper = require('./lib/server/db_helper.js');

/* Router */
var router = exports.router = require('./lib/server/router.js');

/* Misc */
var msgAllRooms = function(rooms, msg, userID, type) {
	for (var i = 0; i < rooms.length; i++) {
		io.sockets.in(rooms[i].roomname).emit('chat message', msg, userID, type);
	}
}

/* IO connections */
io.on('connection', function(socket) {
  io.to(socket.id).emit('connected');
	
	socket.on('load map', function(userID) {
		knex.select().table('users').then(function(users) {
	    io.to(userID).emit('load map', users);
		});
	});

  socket.on('load marker', function(position, username, userID, placename) {
  	DBHelper.createUser({
			username: username,
			latitude: MathLib.degToRad(position[0]),
			longitude: MathLib.degToRad(position[1]),
			socket_id: userID
  	}, function(user) {
  		DBHelper.findOrCreateRoom(placename, function(room) {
  			DBHelper.joinRoom(user.id, room.id, function(roomjoin) {
					socket.join(placename);
			    io.emit('load marker', user);
					DBHelper.userCount(function(count) { io.emit('user count', count); });
  			});
  		});
  	});
  });
			
	socket.on('chat message', function(msg, userID, type) {
		// Need to be able to get this working with Bookshelf!
		DBHelper.findRoomsContainingUser(userID, function(rooms) {
			msgAllRooms(rooms, msg, userID, type);
		});
	});
	
	socket.on('radius message', function(msg, userID, type, lat, lon) {
		DBHelper.findUsersInRadius(lat, lon, function(users) {
			for (var i = 0; i < rows.length; i++) {
				var user = rows[i];
		  	io.to(user.socket_id).emit('chat message', msg, userID, type, lat, lon);
			}
	  });
	});
			
	socket.on('disconnect', function(event) {
		DBHelper.findUserBySocketID(socket.id, function(user) {
      DBHelper.destroyUser(user, function(count) {
        io.emit('user count', count);
        io.emit('delete marker', user.attributes.socket_id);
      });
    });
	});
  
});
	
/* Server */
	http.listen(3000, function() {
	  console.log('listening on *:3000');
	});
