'use strict';

exports.up = function(knex, Promise) {
	return knex.schema.createTable('rooms_users', function (table) {
	  table.increments('id');
	  table.integer('room_id');
	  table.integer('user_id');

		table.index('room_id');
		table.index('user_id');
	  table.timestamps();
	});
};

exports.down = function(knex, Promise) {
  
};
