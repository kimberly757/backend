const env = require('../config/env');

/**
 * Middleware 404 para rutas inexistentes.
 */
const notFound = (req, res, _next) => {
  res.status(404).json({
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
    errors: [],
  });
};

/**
 * Manejador centralizado de errores.
 * Traduce errores del sistema a respuestas HTTP estandarizadas.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const isDev = env.nodeEnv !== 'production';

  // ── Error de sintaxis JSON en el body ──────────────────────────────────────
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      message: 'JSON malformado en el cuerpo de la petición',
      errors: [],
    });
  }

  // ── Errores de validación Zod (propagados manualmente) ────────────────────
  if (err.name === 'ZodError') {
    const errors = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    return res.status(400).json({
      message: 'Datos de entrada inválidos',
      errors,
    });
  }

  // ── Errores JWT ────────────────────────────────────────────────────────────
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: 'El token de sesión ha expirado. Inicia sesión nuevamente.',
      errors: [],
    });
  }
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      message: 'Token de autenticación inválido.',
      errors: [],
    });
  }

  // ── Errores de PostgreSQL ──────────────────────────────────────────────────
  if (err.code === '23503') {
    return res.status(400).json({
      message: 'Error de integridad referencial: el registro relacionado no existe.',
      errors: [{ field: err.detail || 'foreign_key', message: err.detail || err.message }],
    });
  }
  if (err.code === '23505') {
    return res.status(409).json({
      message: 'Ya existe un registro con esos datos únicos.',
      errors: [{ field: err.detail || 'unique', message: err.detail || err.message }],
    });
  }
  if (err.code === '23502') {
    return res.status(400).json({
      message: 'Falta un campo requerido en la base de datos.',
      errors: [{ field: err.column || 'unknown', message: err.message }],
    });
  }

  // ── 404 personalizado (lanzado desde controladores) ───────────────────────
  if (err.status === 404) {
    return res.status(404).json({
      message: err.message || 'Recurso no encontrado',
      errors: [],
    });
  }

  // ── Error genérico 500 ────────────────────────────────────────────────────
  console.error('❌ Error interno:', err);
  return res.status(500).json({
    message: 'Error interno del servidor',
    errors: isDev ? [{ field: 'stack', message: err.stack }] : [],
  });
};

module.exports = { notFound, errorHandler };
