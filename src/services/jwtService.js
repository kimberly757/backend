const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * Firma un token de acceso JWT.
 * @param {object} payload - Datos a incluir en el token.
 * @returns {string} Token firmado.
 */
const signAccessToken = (payload) => {
  return jwt.sign(payload, env.jwt.secret, { expiresIn: env.jwt.expiresIn });
};

/**
 * Verifica y decodifica un token JWT.
 * @param {string} token - Token a verificar.
 * @returns {object} Payload decodificado.
 * @throws {JsonWebTokenError | TokenExpiredError}
 */
const verifyAccessToken = (token) => {
  return jwt.verify(token, env.jwt.secret);
};

/**
 * Extrae el Bearer token del header Authorization.
 * @param {import('express').Request} req
 * @returns {string|null} Token o null si no existe.
 */
const extractBearerToken = (req) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.slice(7);
};

module.exports = { signAccessToken, verifyAccessToken, extractBearerToken };
