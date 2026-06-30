const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { query } = require('../config/database');
const { hashPassword } = require('./passwordService');
const { sendEmail } = require('./emailService');

const RECOVERY_SECRET = env.jwt.secret + '_recovery';

/**
 * Genera un token JWT temporal de recuperación de contraseña (expira en 1 hora).
 * @param {number} userId - ID del usuario.
 * @returns {string} Token firmado.
 */
const generateRecoveryToken = (userId) => {
  return jwt.sign(
    { userId, purpose: 'password-reset' },
    RECOVERY_SECRET,
    { expiresIn: '1h' }
  );
};

/**
 * Valida un token de recuperación de contraseña.
 * @param {string} token
 * @returns {{ userId: number, purpose: string }} Payload del token.
 * @throws {Error} Si el token es inválido, expirado o el propósito no coincide.
 */
const validateRecoveryToken = (token) => {
  const payload = jwt.verify(token, RECOVERY_SECRET);
  if (payload.purpose !== 'password-reset') {
    throw new Error('Token de propósito inválido');
  }
  return payload;
};

/**
 * Genera la plantilla HTML para el correo de recuperación de contraseña.
 * @param {string} recoveryUrl - URL con el token de recuperación.
 * @returns {string} HTML del correo.
 */
const getRecoveryEmailHtml = (recoveryUrl) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: #1a3c6e; color: #fff; padding: 24px; text-align: center; }
    .body { padding: 32px; color: #333; }
    .btn { display: inline-block; margin: 24px 0; padding: 12px 32px; background: #1a3c6e; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold; }
    .footer { padding: 16px; text-align: center; font-size: 12px; color: #999; background: #f9f9f9; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 SERMAB - Recuperación de Contraseña</h1>
    </div>
    <div class="body">
      <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en el sistema SERMAB.</p>
      <p>Haz clic en el siguiente botón para establecer una nueva contraseña. Este enlace es válido por <strong>1 hora</strong>.</p>
      <p style="text-align: center;">
        <a href="${recoveryUrl}" class="btn">Restablecer Contraseña</a>
      </p>
      <p>Si no solicitaste este cambio, puedes ignorar este correo. Tu contraseña actual no será modificada.</p>
      <p style="font-size: 12px; color: #888;">Si el botón no funciona, copia y pega este enlace en tu navegador:<br/>${recoveryUrl}</p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} SERMAB - Sistema de Gestión Municipal. Todos los derechos reservados.
    </div>
  </div>
</body>
</html>
`;

/**
 * Envía el correo de recuperación de contraseña al usuario.
 * @param {{ email: string, userId: number }} param0
 */
const sendRecoveryEmail = async ({ email, userId }) => {
  const token = generateRecoveryToken(userId);
  const recoveryUrl = `${env.frontendUrl}/reset-password?token=${token}`;
  const html = getRecoveryEmailHtml(recoveryUrl);

  await sendEmail({
    to: email,
    subject: 'Recuperación de contraseña - SERMAB',
    html,
  });

  return { token }; // Retornamos el token solo para testing/log
};

/**
 * Restablece la contraseña del usuario dado un token válido.
 * @param {string} token - Token de recuperación.
 * @param {string} newPassword - Nueva contraseña en texto plano.
 */
const resetPassword = async (token, newPassword) => {
  const { userId } = validateRecoveryToken(token);
  const hash = await hashPassword(newPassword);
  const result = await query(
    'UPDATE tm_usuari SET usuari_co = $1 WHERE usuari_id = $2 RETURNING usuari_id',
    [hash, userId]
  );
  if (!result.rows[0]) {
    throw new Error('Usuario no encontrado');
  }
  return result.rows[0];
};

module.exports = {
  generateRecoveryToken,
  validateRecoveryToken,
  getRecoveryEmailHtml,
  sendRecoveryEmail,
  resetPassword,
};
