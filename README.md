# README #

Steps to get up and running:

*   Install [Node.js](http://nodejs.org/download).
*   Navigate to the directory you've installed the app and install dependencies: `npm install`
*   Install and run [Postgres.app](http://postgresapp.com/) if you're on a Mac.

Then:

*   Create PostgreSQL DB. Run `psql`, then in command line: `create database localy_development;`
*   In the app directory run migrations: `knex migrate:latest`