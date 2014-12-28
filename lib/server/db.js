var bookshelf;

/* Initialize db */
var knex = require('knex')({
  client: 'pg',
  connection: {
    adapter : 'postgresql',
		encoding : 'unicode',
		pool : '5',
    database : process.env.DATABASE_URL
  }
});

/* Initialize Bookshelf */
exports.bookshelf = bookshelf = require('bookshelf')(knex);

/* User model */
exports.User = bookshelf.Model.extend({
  tableName: 'users'
});

exports.Users = bookshelf.Collection.extend({
  model: exports.User
});

/* Room joins model */
exports.RoomJoin = bookshelf.Model.extend({
  tableName: 'rooms_users'
});

exports.RoomJoins = bookshelf.Collection.extend({
  model: exports.RoomJoin
});

/* Room model */
exports.Room = bookshelf.Model.extend({
  tableName: 'rooms'
});

exports.Rooms = bookshelf.Collection.extend({
  model: exports.Room
});