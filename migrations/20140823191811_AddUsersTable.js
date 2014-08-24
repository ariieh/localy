'use strict';

exports.up = function(knex, Promise) {
	return knex.schema.createTable('users', function (table) {
	  table.increments('id');
	  table.string('name');
	  table.string('socket_id');
		table.decimal('latitude');
		table.decimal('longitude');
	
		table.index('socket_id');
		table.index('latitude');
		table.index('longitude');
	  table.timestamps();
	});  
};

exports.down = function(knex, Promise) {
  
};
