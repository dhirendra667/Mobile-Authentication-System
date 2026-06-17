const { Sequelize } = require('sequelize');

const { DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, NODE_ENV } = require('./server_config');

// Sequelize instance connected to PostgreSQL
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    port: DB_PORT,
    dialect: 'postgres',
    logging: NODE_ENV === 'development' ? console.log : false,
});

module.exports = sequelize;
