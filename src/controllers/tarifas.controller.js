const TarifaModel = require('../models/tarifas.model');

exports.list = async (_req, res) => {
  try {
    const items = await TarifaModel.list();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const item = await TarifaModel.getById(req.params.id);
    if (!item) return res.status(404).json({ message: 'No encontrado' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const item = await TarifaModel.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const item = await TarifaModel.update(req.params.id, req.body);
    if (!item) return res.status(404).json({ message: 'No encontrado' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const item = await TarifaModel.remove(req.params.id);
    if (!item) return res.status(404).json({ message: 'No encontrado' });
    res.json({ message: 'Eliminado correctamente', item });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
