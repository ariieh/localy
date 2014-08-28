'use strict';

exports.up = function(knex, Promise) {
	return knex.schema.createTable('rooms', function (table) {
	  table.increments('id');
	  table.string('roomname');

		table.index('roomname');
	  table.timestamps();
	});  
};

exports.down = function(knex, Promise) {
  
};
