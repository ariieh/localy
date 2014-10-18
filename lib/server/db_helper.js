var server = projRequire('/index.js');
var knex = server.knex;
var MathLib = server.MathLib;
var DB = server.DB;

module.exports = {
  /* User operations */

  userCount: function(callback) {
    knex('users').count('id').then(function(res) {
      callback(parseInt(res[0].count));
    });
  },

  createUser: function(attributes, callback) {
    new DB.User({
      username: attributes.username,
      latitude: attributes.latitude,
      longitude: attributes.longitude,
      socket_id: attributes.socket_id
    }).save().then(function(user) {
      callback(user);
    });
  },

  destroyUser: function(user, callback) {
    user.destroy().then(function() {
      module.exports.userCount(function(count) {
        callback(count);
      });
    });
  },

  findUserBySocketID: function(socketID, callback) {
    DB.Users
      .query({where: {socket_id: socketID}})
      .fetchOne()
      .then(function(user) {
        callback(user);
      });
  },

  findUsersInRadius: function(lat, lon, callback) {
    var bounds = MathLib.radiusBounds(lat, lon);

    var latDelta = bounds.radian.latDelta;
    
    var lon = bounds.radian.lon;
    var lat = bounds.radian.lat;
    
    var minLat = bounds.radian.minLat;
    var maxLat = bounds.radian.maxLat;
    
    var minLon = bounds.radian.minLon;
    var maxLon = bounds.radian.maxLon;

    knex
        .select('*')
        .from('users')
        .whereRaw('(latitude >= ? AND latitude <= ?) '
                  + 'AND (longitude >= ? AND longitude <= ?) '
                  + 'AND (acos(sin(?) * sin(latitude) + cos(?) * cos(latitude) * cos(longitude - (?))) <= ?)',
                  [minLat, maxLat, minLon, maxLon, lat, lat, lon, latDelta])
        .then(function(users) {
          callback(users);
        });
  },

  /* Room operations */

  findRoomsContainingUser: function(userID, callback) {
    // Need to be able to get this working with Bookshelf!

    knex
        .select('rooms.*')
        .from('users')
        .innerJoin('rooms_users', 'users.id', 'rooms_users.user_id')
        .innerJoin('rooms', 'rooms.id', 'rooms_users.room_id')
        .where('users.socket_id', '=', userID)
        .then(function(rooms) {
          callback(rooms);
        });
  },

  findOrCreateRoom: function(placename, callback) {
    DB.Rooms.query({where: {roomname: placename}}).fetchOne().then(function(existingRoom) {
      var newRoom = (existingRoom || new DB.Room( {roomname: placename} ));
      newRoom.save().then(function(room) {
        callback(room);
      });
    });
  },

  joinRoom: function(userID, roomID, callback) {
    DB.RoomJoins
      .query({where: {user_id: userID, room_id: roomID}})
      .fetchOne()
      .then(function(roomjoin) {
        if (!roomjoin) {
          new DB.RoomJoin({
            user_id: userID,
            room_id: roomID
          }).save().then(function(roomjoin) {
            callback(roomjoin);
          });
        } else {
            callback(roomjoin);
        }
      });


  }

}
