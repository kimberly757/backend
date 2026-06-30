require('./config/env'); // Validar variables de entorno PRIMERO

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const env = require('./config/env');
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const { swaggerSpec, swaggerUi } = require('./docs/swagger');

const app = express();

// ── Middlewares de seguridad y utilidad ───────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: env.frontendUrl,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Documentación Swagger UI ──────────────────────────────────────────────────
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'SERMAB API Docs',
  customCss: '.swagger-ui .topbar { background-color: #1a3c6e; }',
}));
app.get('/api/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ── Rutas principales ─────────────────────────────────────────────────────────
app.use('/api', require('./routes/index'));

// ── Root ──────────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    message: 'SERMAB API está funcionando',
    version: '1.0.0',
    docs: `/api/docs`,
  });
});

// ── Manejo de errores (siempre al final) ──────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
