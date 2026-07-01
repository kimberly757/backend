const DeudaModel = require('../models/deudas.model');

exports.list = async (req, res) => {
  try {
    if (req.query.contri_id) {
      await DeudaModel.autoGeneratePeriods(parseInt(req.query.contri_id));
    }
    const items = await DeudaModel.list(req.query);
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const item = await DeudaModel.getById(req.params.id);
    if (!item) return res.status(404).json({ message: 'No encontrado' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const item = await DeudaModel.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const item = await DeudaModel.update(req.params.id, req.body);
    if (!item) return res.status(404).json({ message: 'No encontrado' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const item = await DeudaModel.remove(req.params.id);
    if (!item) return res.status(404).json({ message: 'No encontrado' });
    res.json({ message: 'Eliminado correctamente', item });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
