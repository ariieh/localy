var bookshelf;

/* Initialize db */
var knex = require('knex')({
  client: 'postgresql',
  connection: {
    adapter : 'postgresql',
		encoding : 'unicode',
		pool : '5',
    database : 'localy_development'
  }
});

/* Initialize Bookshelf */
exports.bookshelf = bookshelf = require('bookshelf')(knex);

/* User model */
var User, Users;

exports.User = User = bookshelf.Model.extend({
  tableName: 'users',
  rooms: function() {
    return this.belongsToMany(Room);
  }
});

exports.Users = Users = bookshelf.Collection.extend({
  model: User
});

/* Room model */
var Room;

exports.Room = Room = bookshelf.Model.extend({
  tableName: 'rooms',
  users: function() {
    return this.belongsToMany(User);
  }
});

/* Room joins model */
var RoomJoin;

exports.RoomJoin = RoomJoin = bookshelf.Model.extend({
  tableName: 'rooms_users'
});