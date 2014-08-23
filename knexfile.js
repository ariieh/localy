// Update with your config settings.

module.exports = {

  development: {
    client: 'postgresql',
    connection: {
      database: 'localy_development'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'postgresql'
    }
  },

  staging: {
    client: 'postgresql',
    connection: {
      database: 'localy_staging'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'postgresql'
    }
  },

  production: {
    client: 'postgresql',
    connection: {
      database: 'localy_production'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'postgresql'
    }
  }

};