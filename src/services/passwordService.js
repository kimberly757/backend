const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

/**
 * Genera el hash bcrypt de una contraseña en texto plano.
 * @param {string} plaintext - Contraseña en texto plano.
 * @returns {Promise<string>} Hash de la contraseña.
 */
const hashPassword = async (plaintext) => {
  return bcrypt.hash(plaintext, SALT_ROUNDS);
};

/**
 * Compara una contraseña en texto plano con un hash bcrypt.
 * @param {string} plaintext - Contraseña en texto plano.
 * @param {string} hash - Hash almacenado.
 * @returns {Promise<boolean>} true si coinciden.
 */
const verifyPassword = async (plaintext, hash) => {
  return bcrypt.compare(plaintext, hash);
};

module.exports = { hashPassword, verifyPassword };
