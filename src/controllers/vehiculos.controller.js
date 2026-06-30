const VehiculoModel = require('../models/vehiculos.model');

exports.list = async (_req, res) => {
  try {
    const items = await VehiculoModel.list();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const item = await VehiculoModel.getById(req.params.id);
    if (!item) return res.status(404).json({ message: 'No encontrado' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const item = await VehiculoModel.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const item = await VehiculoModel.update(req.params.id, req.body);
    if (!item) return res.status(404).json({ message: 'No encontrado' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const item = await VehiculoModel.remove(req.params.id);
    if (!item) return res.status(404).json({ message: 'No encontrado' });
    res.json({ message: 'Eliminado correctamente', item });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
