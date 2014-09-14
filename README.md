# README #

Steps to get up and running:

*   Install [Node.js](http://nodejs.org/download).
*   Install [Socket.IO](http://socket.io/): `npm install socket.io`
*   Install [Express.js](http://expressjs.com/): `npm install express`
*   Install [Knex.js](http://knexjs.org/): `npm install knex`
*   Install [Bookshelf.js](http://bookshelfjs.org/): `npm install bookshelf`
*   Install and run [Postgres.app](http://postgresapp.com/).

Then:

*   Create PostgreSQL DB. Run `psql`, then in command line: `create database localy_development;`
*   In the app directory run migrations: `knex migrate:latest`