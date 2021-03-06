'use strict';

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

/* Date */
var DateLib = exports.DateLib = require('./lib/server/date.js');

/* Misc helper */
var Helper = exports.Helper = require('./lib/server/helper.js');

/* DB helper functions */
var DBHelper = exports.DBHelper = require('./lib/server/db_helper.js');

/* Router */
var router = exports.router = require('./lib/server/router.js');

/* Database */
var pg = require('pg');

/* Event routing */
var eventRouter = require('socket.io-events')();
io.use(eventRouter);

/* Antispam */
var antiSpam = require('./lib/server/anti_spam.js');

/* Asynchronous looping */
var lupus = require('lupus');

//Favicon
var favicon = require('serve-favicon');
app.use(favicon(__dirname + '/vendor/images/favicon.ico'));

// Clear out any users that were left as active
DBHelper.deactiveAllActiveUsers();

/* IO connections */
io.on('connection', function(socket) {
  antiSpam.spamAuthenticate(socket);

  eventRouter.on("*", function(sock, args, next){
    if (antiSpam.spamFunctionsToCheck.contains(args[0])) antiSpam.addSpam(socket);
    next();
  });

  io.to(socket.id).emit('connected');
	
	socket.on('load map', function(userID) {
    DBHelper.activeUsers(function(users) {
      io.to(userID).emit('load map', users);
    });
	});

  socket.on('load marker', function(position, username, userID, placename) {
    placename = Helper.sanitizeMessage(placename);
    username = Helper.sanitizeMessage(username);
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
					DBHelper.activeUserCount(function(count) { io.emit('user count', count); });
  			});
  		});
  	});
  });

  socket.on('join room', function(roomname) {
    roomname = Helper.sanitizeMessage(roomname);
    DBHelper.findUserBySocketID(socket.id, function(user) {
      DBHelper.findOrCreateRoom(roomname, function(room) {
        DBHelper.joinRoom(user.id, room.id, function(roomjoin) {
          socket.join(roomname);
        });
      });
    });
  });

  socket.on('get chats from room', function(roomname) {
    roomname = Helper.sanitizeMessage(roomname);
    DBHelper.findOrCreateRoom(roomname, function(room) {
      DBHelper.getLatestChatsByRoom(room.get("id"), function(chats) {
        lupus(0, chats.length, function(i) {
          i = chats.length - 1 - i;
          var msg = chats[i].message;
          var user_id = chats[i].user_id;
          DB.Users.query({where: {id: user_id}}).fetchOne().then(function(user) {
            var socketID = user.get("socket_id");
            var username = user.get("username");
            var date = new Date(user.get("created_at"));
            var timestamp = DateLib.formatTimestamp(date);

            io.to(socket.id).emit('chat message', 'hood', msg, socketID, roomname, { username: username, timestamp: timestamp });
          });
        });
      });
    });
  });

  socket.on('leave room', function(roomname) {
    roomname = Helper.sanitizeMessage(roomname);
    DBHelper.findUserBySocketID(socket.id, function(user) {
      DBHelper.findOrCreateRoom(roomname, function(room) {
        DBHelper.leaveRoom(user.id, room.id, function(roomjoin) {
          socket.leave(roomname);
        });
      });
    });
  });

  socket.on('individual message', function(msg, fromSocketID, toSocketID, options) {
    msg = Helper.sanitizeMessage(msg);
    io.to(toSocketID).emit('chat message', 'individual', msg, fromSocketID, toSocketID + ":" + fromSocketID, options);
    io.to(fromSocketID).emit('chat message', 'individual', msg, fromSocketID, fromSocketID + ":" + toSocketID, options);
  });

  socket.on('hood message', function(msg, socketID, hood) {
    msg = Helper.sanitizeMessage(msg);
    DBHelper.findUserBySocketID(socketID, function(user) {
      DBHelper.findOrCreateRoom(hood, function(room){
        DBHelper.createChat(msg, user.get("id"), room.get("id"), function(chat) {
          var username = user.get("username");
          var date = new Date(user.get("created_at"));
          var timestamp = DateLib.formatTimestamp(date);

          io.sockets.in(hood).emit('chat message', 'hood', msg, socketID, hood, { username: username, timestamp: timestamp });
        });
      });
    });
  });

	socket.on('global message', function(msg, userID, type) {
    msg = Helper.sanitizeMessage(msg);
		DBHelper.findRoomsContainingUser(userID, function(rooms) {
      lupus (0, rooms.length, function(i) {
        io.sockets.in(rooms[i].roomname).emit('chat message', 'global', msg, userID, type);
      });
		});
	});
	
	socket.on('radius message', function(msg, userID, type, options) {
    msg = Helper.sanitizeMessage(msg);

		DBHelper.findActiveUsersInRadius(options.lat, options.lon, function(users) {
			lupus (0, users.length, function(i) {
		  	io.to(users[i].socket_id).emit('chat message', 'radius', msg, userID, type, options);
			});
	  });
	});
			
	socket.on('disconnect', function(event) {
		DBHelper.findUserBySocketID(socket.id, function(user) {
      if (user) {
        DBHelper.deactivateUser(user, function(count) {
          io.emit('user count', count);
          io.emit('delete marker', socket.id);
        });
      }
    });
	});
  
});
	
/* Server */
var port = process.env.PORT || 3000;
http.listen(port, function() {
  console.log("Listening on port %d", port);
});
