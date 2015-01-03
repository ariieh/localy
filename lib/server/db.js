var bookshelf;

/* Initialize knex with env dependent config */
var knexConfig = projRequire('/knexfile.js');
var config = process.env.DATABASE_URL ? knexConfig.production : knexConfig.development;
var knex = require('knex')(config);

/* Initialize Bookshelf */
exports.bookshelf = bookshelf = require('bookshelf')(knex);

/* User model */
exports.User = bookshelf.Model.extend({
  tableName: 'users',
  hasTimestamps: true
});

exports.Users = bookshelf.Collection.extend({
  model: exports.User
});

/* Room joins model */
exports.RoomJoin = bookshelf.Model.extend({
  tableName: 'rooms_users',
  hasTimestamps: true
});

exports.RoomJoins = bookshelf.Collection.extend({
  model: exports.RoomJoin
});

/* Room model */
exports.Room = bookshelf.Model.extend({
  tableName: 'rooms',
  hasTimestamps: true
});

exports.Rooms = bookshelf.Collection.extend({
  model: exports.Room
});

/* Chat model */
exports.Chat = bookshelf.Model.extend({
  tableName: 'chats',
  hasTimestamps: true
});

exports.Chats = bookshelf.Collection.extend({
  model: exports.Chat
});
