const RolModel = require('../models/roles.model');

exports.list = async (req, res, next) => {
  try {
    const items = await RolModel.list();
    res.json(items);
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const item = await RolModel.getById(req.params.id);
    if (!item) return next({ status: 404, message: 'Rol no encontrado' });
    res.json(item);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const item = await RolModel.create(req.body);
    res.status(201).json(item);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const exists = await RolModel.getById(req.params.id);
    if (!exists) return next({ status: 404, message: 'Rol no encontrado' });
    const item = await RolModel.update(req.params.id, req.body);
    res.json(item);
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const exists = await RolModel.getById(req.params.id);
    if (!exists) return next({ status: 404, message: 'Rol no encontrado' });
    await RolModel.remove(req.params.id);
    res.status(204).send();
  } catch (err) { next(err); }
};
