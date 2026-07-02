const { verifyAccessToken, extractBearerToken } = require('../services/jwtService');

/**
 * Middleware de autenticación JWT.
 * Extrae el token Bearer del header Authorization,
 * lo verifica y guarda el payload en req.auth.
 * Retorna 401 si el token está ausente, es inválido o expiró.
 */
const requireAuth = (req, res, next) => {
  const token = extractBearerToken(req);

  if (!token) {
    return res.status(401).json({
      message: 'Acceso no autorizado. Se requiere token de autenticación.',
      errors: [],
    });
  }

  try {
    const payload = verifyAccessToken(token);
    req.auth = payload;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'El token de sesión ha expirado. Inicia sesión nuevamente.',
        errors: [],
      });
    }
    return res.status(401).json({
      message: 'Token de autenticación inválido.',
      errors: [],
    });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.auth) {
    return res.status(401).json({ message: 'No autenticado', errors: [] });
  }
  
  if (req.auth.rol !== 1) {
    return res.status(403).json({
      message: 'Acceso denegado. Se requieren permisos de Administrador.',
      errors: []
    });
  }
  
  next();
};

module.exports = { requireAuth, requireAdmin };
