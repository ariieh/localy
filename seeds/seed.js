'use strict';

exports.seed = function(knex, Promise) {
  return knex('users').insert({
    username: 'arieh',
    socket_id: '1234',
    latitude: 0.71068852446,
    longitude: -1.29145903291
  });
};
