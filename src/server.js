const app = require('./index');
const sequelize = require('./config/db_config');
const { PORT } = require('./config/server_config');

async function startServer() {
    try {
        await sequelize.authenticate();
        console.log('Connected to PostgreSQL via Sequelize');
        console.log('Run "npm run db:migrate" to apply migrations if not done yet');

        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
            console.log(`Swagger docs at  http://localhost:${PORT}/api-docs`);
        });
    } catch (error) {
        console.error('Database connection failed:', error.message);
        process.exit(1);
    }
}

startServer();
