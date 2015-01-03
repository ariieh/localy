'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.createTable('users', function (table) {
    table.increments('id');
    table.string('username');
    table.string('socket_id');
    table.boolean('active').defaultTo(true);
    table.decimal('latitude', '9', '7');
    table.decimal('longitude', '9', '7');

    table.index('username');
    table.index('socket_id');
    table.index('latitude');
    table.index('longitude');
    table.timestamps();
  });  
};

exports.down = function(knex, Promise) {
  
};
