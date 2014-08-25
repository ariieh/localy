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

/* Room model */
exports.Room = bookshelf.Model.extend({
  tableName: 'rooms'
});
