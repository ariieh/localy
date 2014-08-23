/* Initialize db */
var knex = require('knex')({
  client: 'pg',
  connection: {
    adapter : 'postgresql',
		encoding : 'unicode',
		pool : '5',
    database : 'Localy_dev'
  }
});

knex.schema.createTable('users', function (table) {
  table.increments();
  table.integer('userID');
	table.decimal('latitude');
	table.decimal('longitude');
	
	table.index('latitude');
	table.index('longitude');
  table.timestamps();
});

/* Initialize Bookshelf */
exports.bookshelf = require('bookshelf')(knex);

/* Initialize User model */
exports.User = exports.bookshelf.Model.extend({
  tableName: 'users'
});