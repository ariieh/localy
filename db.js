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

/* Initialize User model */
exports.User = exports.bookshelf.Model.extend({
  tableName: 'users'
});