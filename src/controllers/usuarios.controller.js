const UsuarioModel = require('../models/usuarios.model');
const { hashPassword, verifyPassword } = require('../services/passwordService');
const { signAccessToken } = require('../services/jwtService');

/**
 * Elimina datos sensibles del objeto usuario antes de enviarlo al cliente.
 * @param {object} user
 */
const toSafeUser = (user) => {
  if (!user) return null;
  const { usuari_co, ...safe } = user;
  return safe;
};

exports.list = async (req, res, next) => {
  try {
    const items = await UsuarioModel.list();
    res.json(items.map(toSafeUser));
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const item = await UsuarioModel.getById(req.params.id);
    if (!item) return next({ status: 404, message: 'Usuario no encontrado' });
    res.json(toSafeUser(item));
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (data.usuari_co) {
      data.usuari_co = await hashPassword(data.usuari_co);
    }
    const item = await UsuarioModel.create(data);
    res.status(201).json(toSafeUser(item));
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const exists = await UsuarioModel.getById(req.params.id);
    if (!exists) return next({ status: 404, message: 'Usuario no encontrado' });
    const item = await UsuarioModel.update(req.params.id, req.body);
    res.json(toSafeUser(item));
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const exists = await UsuarioModel.getById(req.params.id);
    if (!exists) return next({ status: 404, message: 'Usuario no encontrado' });
    await UsuarioModel.remove(req.params.id);
    res.status(204).send();
  } catch (err) { next(err); }
};

/**
 * Login: valida credenciales y retorna JWT.
 */
exports.login = async (req, res, next) => {
  try {
    const { usuari_cd, usuari_co } = req.body;
    const { query } = require('../config/database');
    const result = await query(
      'SELECT * FROM tm_usuari WHERE usuari_cd = $1',
      [usuari_cd]
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({
        message: 'Credenciales incorrectas',
        errors: [],
      });
    }

    const valid = await verifyPassword(usuari_co, user.usuari_co);
    if (!valid) {
      return res.status(401).json({
        message: 'Credenciales incorrectas',
        errors: [],
      });
    }

    if (user.usuari_es !== 'Activo') {
      return res.status(403).json({
        message: 'El usuario está inactivo. Contacta al administrador.',
        errors: [],
      });
    }

    const token = signAccessToken({
      id: user.usuari_id,
      codigo: user.usuari_cd,
      rol: user.rolusr_id,
    });

    res.json({
      message: 'Inicio de sesión exitoso',
      token,
      user: toSafeUser(user),
    });
  } catch (err) { next(err); }
};
