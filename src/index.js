const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

const { FRONTEND_URL } = require('./config/server_config');
const swaggerSpec = require('./config/swagger_config');
const apiRouter = require('./routes/api_router');

const app = express();

// ─── Built-in middlewares ──────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Third-party middlewares ───────────────────────────────────────────────────
app.use(cors({ origin: [FRONTEND_URL], credentials: true }));
app.use(morgan('dev'));

// ─── Swagger docs ──────────────────────────────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ─── Health check ──────────────────────────────────────────────────────────────
app.get('/ping', (_req, res) => {
    res.json({ status: 'ok', message: 'Pong' });
});

// ─── API routes ────────────────────────────────────────────────────────────────
app.use('/api', apiRouter);

// ─── 404 catch-all ─────────────────────────────────────────────────────────────
app.all('*', (_req, res) => {
    res.status(404).json({ success: false, message: '404 — Route not found' });
});

module.exports = app;
