'use strict';

exports.up = function(knex, Promise) {
	return knex.schema.createTable('users', function (table) {
	  table.increments('id');
	  table.string('name');
	  table.integer('userID');
		table.decimal('latitude');
		table.decimal('longitude');
	
		table.index('userID');
		table.index('latitude');
		table.index('longitude');
	  table.timestamps();
	});  
};

exports.down = function(knex, Promise) {
  
};
