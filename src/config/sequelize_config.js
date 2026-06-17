const { DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT } = require('./server_config');

// Used by Sequelize CLI for migrations and seeders
module.exports = {
    development: {
        username: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME,
        host: DB_HOST,
        port: DB_PORT,
        dialect: 'postgres',
    },
    production: {
        username: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME,
        host: DB_HOST,
        port: DB_PORT,
        dialect: 'postgres',
    },
};
