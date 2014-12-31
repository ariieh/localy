var bookshelf;

/* Initialize knex with env dependent config */
var knexConfig = projRequire('/knexfile.js');
var config = process.env.DATABASE_URL ? knexConfig.production : knexConfig.development;
var knex = require('knex')(config);

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