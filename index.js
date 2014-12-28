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

/* Database */
var pg = require('pg');

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

  socket.on('join room', function(roomname) {
    DBHelper.findUserBySocketID(socket.id, function(user) {
      DBHelper.findOrCreateRoom(roomname, function(room) {
        DBHelper.joinRoom(user.id, room.id, function(roomjoin) {
          socket.join(roomname);
        });
      });
    });
  });

  socket.on('leave room', function(roomname) {
    DBHelper.findUserBySocketID(socket.id, function(user) {
      DBHelper.findOrCreateRoom(roomname, function(room) {
        DBHelper.leaveRoom(user.id, room.id, function(roomjoin) {
          socket.leave(roomname);
        });
      });
    });
  });

  socket.on('individual message', function(msg, fromUserID, toUserID, options) {
    io.to(toUserID).emit('chat message', 'individual', msg, fromUserID, toUserID + ":" + fromUserID, options);
    io.to(fromUserID).emit('chat message', 'individual', msg, fromUserID, fromUserID + ":" + toUserID, options);
  });

  socket.on('hood message', function(msg, userID, hood) {
    io.sockets.in(hood).emit('chat message', 'hood', msg, userID, hood);
  });

	socket.on('global message', function(msg, userID, type) {
		DBHelper.findRoomsContainingUser(userID, function(rooms) {
      for (var i = 0; i < rooms.length; i++) {
        io.sockets.in(rooms[i].roomname).emit('chat message', 'global', msg, userID, type);
      }
		});
	});
	
	socket.on('radius message', function(msg, userID, type, options) {
    var lat = options.lat;
    var lon = options.lon;

		DBHelper.findUsersInRadius(lat, lon, function(users) {
			for (var i = 0; i < users.length; i++) {
				var user = users[i];
		  	io.to(user.socket_id).emit('chat message', 'radius', msg, userID, type, options);
			}
	  });
	});
			
	socket.on('disconnect', function(event) {
		DBHelper.findUserBySocketID(socket.id, function(user) {
      DBHelper.destroyUser(user, function(count) {
        io.emit('user count', count);
        io.emit('delete marker', socket.id);
      });
    });
	});
  
});
	
/* Server */
var port = process.env.PORT || 3000;
http.listen(port, function() {
  console.log("Listening on port %d", port);
});
