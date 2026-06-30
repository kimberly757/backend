const { sendRecoveryEmail, resetPassword } = require('../services/passwordRecoveryService');
const { query } = require('../config/database');
const { hashPassword, verifyPassword } = require('../services/passwordService');
const { signAccessToken } = require('../services/jwtService');

/**
 * POST /api/auth/register
 * Crea una nueva cuenta de usuario (registro público).
 * La contraseña se almacena hasheada con bcrypt.
 * El rol por defecto es el de menor privilegio (se puede configurar).
 */
exports.register = async (req, res, next) => {
  try {
    const { rolusr_id, usuari_nm, usuari_ap, usuari_cd, usuari_co, usuari_em } = req.body;

    // Verificar que el código de usuario no esté en uso
    const existing = await query(
      'SELECT usuari_id FROM tm_usuari WHERE usuari_cd = $1',
      [usuari_cd]
    );
    if (existing.rows[0]) {
      return res.status(409).json({
        message: 'El código de usuario ya está en uso.',
        errors: [{ field: 'usuari_cd', message: 'Ya existe un usuario con ese código' }],
      });
    }

    // Verificar que el email no esté en uso (si se proporcionó)
    if (usuari_em) {
      const existingEmail = await query(
        'SELECT usuari_id FROM tm_usuari WHERE usuari_em = $1',
        [usuari_em]
      );
      if (existingEmail.rows[0]) {
        return res.status(409).json({
          message: 'El correo electrónico ya está registrado.',
          errors: [{ field: 'usuari_em', message: 'Ya existe un usuario con ese correo' }],
        });
      }
    }

    // Auto-crear rol de administrador si la base de datos está limpia y se solicita rolusr_id = 1
    if (rolusr_id === 1) {
      const rolesCheck = await query('SELECT rolusr_id FROM tm_rolusr LIMIT 1');
      if (rolesCheck.rows.length === 0) {
        await query('INSERT INTO tm_rolusr (rolusr_id, rolusr_nm) VALUES (1, $1)', ['Administrador']);
        console.log('💡 Rol "Administrador" (ID: 1) creado automáticamente por encontrarse vacío.');
      }
    }

    const passwordHash = await hashPassword(usuari_co);

    const result = await query(
      `INSERT INTO tm_usuari (rolusr_id, usuari_nm, usuari_ap, usuari_cd, usuari_co, usuari_em, usuari_es)
       VALUES ($1, $2, $3, $4, $5, $6, 'Activo')
       RETURNING usuari_id, rolusr_id, usuari_nm, usuari_ap, usuari_cd, usuari_em, usuari_es, usuari_fe`,
      [rolusr_id, usuari_nm, usuari_ap, usuari_cd, passwordHash, usuari_em || null]
    );

    const newUser = result.rows[0];

    const token = signAccessToken({
      id: newUser.usuari_id,
      codigo: newUser.usuari_cd,
      rol: newUser.rolusr_id,
    });

    res.status(201).json({
      message: 'Usuario registrado exitosamente.',
      token,
      user: newUser,
    });
  } catch (err) { next(err); }
};

/**
 * POST /api/auth/recover
 * Solicita recuperación de contraseña por código de usuario (usuari_cd).
 * NOTA: tm_usuari no tiene columna de email; se usa usuari_cd como identificador.
 * En modo EMAIL_TRANSPORT=log, el token aparece en la consola del servidor.
 */
exports.recover = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await query(
      'SELECT usuari_id, usuari_em FROM tm_usuari WHERE usuari_em = $1',
      [email]
    );
    const user = result.rows[0];

    // Por seguridad, siempre respondemos igual (no revelar si el email existe)
    if (user && user.usuari_em) {
      await sendRecoveryEmail({ email: user.usuari_em, userId: user.usuari_id });
    }

    res.json({
      message: 'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.',
    });
  } catch (err) { next(err); }
};

/**
 * POST /api/auth/reset
 * Restablece la contraseña usando el token de recuperación.
 */
exports.reset = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    await resetPassword(token, newPassword);
    res.json({ message: 'Contraseña restablecida correctamente.' });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'El enlace de recuperación ha expirado.', errors: [] });
    }
    if (err.name === 'JsonWebTokenError' || err.message === 'Token de propósito inválido') {
      return res.status(400).json({ message: 'Token de recuperación inválido.', errors: [] });
    }
    next(err);
  }
};

/**
 * PUT /api/auth/change-password
 * Cambia la contraseña del usuario autenticado (requiere token JWT activo).
 * Verifica la contraseña actual antes de permitir el cambio.
 */
exports.changePassword = async (req, res, next) => {
  try {
    const userId = req.auth.id; // viene del middleware requireAuth
    const { currentPassword, newPassword } = req.body;

    // Obtener hash actual
    const result = await query(
      'SELECT usuari_co FROM tm_usuari WHERE usuari_id = $1',
      [userId]
    );
    const user = result.rows[0];
    if (!user) return next({ status: 404, message: 'Usuario no encontrado' });

    // Verificar contraseña actual
    const valid = await verifyPassword(currentPassword, user.usuari_co);
    if (!valid) {
      return res.status(401).json({
        message: 'La contraseña actual es incorrecta.',
        errors: [],
      });
    }

    // Hashear y actualizar nueva contraseña
    const newHash = await hashPassword(newPassword);
    await query(
      'UPDATE tm_usuari SET usuari_co = $1 WHERE usuari_id = $2',
      [newHash, userId]
    );

    res.json({ message: 'Contraseña cambiada correctamente.' });
  } catch (err) { next(err); }
};

/**
 * GET /api/auth/profile
 * Obtiene el perfil del usuario autenticado (sin contraseña).
 */
exports.getProfile = async (req, res, next) => {
  try {
    const userId = req.auth.id;
    const result = await query(
      'SELECT usuari_id, rolusr_id, usuari_nm, usuari_ap, usuari_cd, usuari_em, usuari_es, usuari_fe FROM tm_usuari WHERE usuari_id = $1',
      [userId]
    );
    const user = result.rows[0];
    if (!user) return next({ status: 404, message: 'Usuario no encontrado' });
    res.json(user);
  } catch (err) { next(err); }
};

/**
 * PUT /api/auth/profile
 * Actualiza el perfil del usuario autenticado (nombre, apellido).
 * No permite cambiar rol, código ni contraseña desde aquí.
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.auth.id;
    const { usuari_nm, usuari_ap, usuari_em } = req.body;

    const updates = {};
    if (usuari_nm) updates.usuari_nm = usuari_nm;
    if (usuari_ap) updates.usuari_ap = usuari_ap;
    if (usuari_em !== undefined) updates.usuari_em = usuari_em;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: 'No se proporcionaron campos para actualizar.',
        errors: [],
      });
    }

    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const assignments = fields.map((f, i) => `${f} = $${i + 1}`);

    const result = await query(
      `UPDATE tm_usuari SET ${assignments.join(', ')} WHERE usuari_id = $${values.length + 1}
       RETURNING usuari_id, rolusr_id, usuari_nm, usuari_ap, usuari_cd, usuari_em, usuari_es, usuari_fe`,
      [...values, userId]
    );

    res.json(result.rows[0]);
  } catch (err) { next(err); }
};
