/* Initialize db */
var knex = require('knex')({
  client: 'pg',
  connection: {
    adapter : 'postgresql',
		encoding : 'unicode',
		pool : '5',
    database : 'localy_development'
  }
});

/* Initialize Bookshelf */
exports.bookshelf = require('bookshelf')(knex);

/* User model */
exports.User = exports.bookshelf.Model.extend({
  tableName: 'users',
  rooms: function() {
    return this.belongsToMany(Room);
  }
});

exports.Users = exports.bookshelf.Collection.extend({
  model: exports.User
});

/* Room model */
exports.Room = exports.bookshelf.Model.extend({
  tableName: 'rooms',
  users: function() {
    return this.belongsToMany(User);
  }
});

/* Room joins model */
exports.RoomJoin = exports.bookshelf.Model.extend({
  tableName: 'rooms_users'
});