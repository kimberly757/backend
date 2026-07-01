const CobroModel = require('../models/cobros.model');
const { pool } = require('../config/database');

exports.list = async (req, res, next) => {
  try {
    const items = await CobroModel.list();
    res.json(items);
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const item = await CobroModel.getById(req.params.id);
    if (!item) return next({ status: 404, message: 'Cobro no encontrado' });
    res.json(item);
  } catch (err) { next(err); }
};

/**
 * Crea un cobro y sus detalles en una sola transacción atómica.
 * Si falla cualquier inserción, se hace rollback completo.
 */
exports.create = async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { detalles, ...cobroData } = req.body;

    // Insertar el cobro principal
    const cobroFields = Object.keys(cobroData);
    const cobroValues = Object.values(cobroData);
    const cobroPlaceholders = cobroValues.map((_, i) => `$${i + 1}`);
    const cobroResult = await client.query(
      `INSERT INTO tt_cobros (${cobroFields.join(', ')}) VALUES (${cobroPlaceholders.join(', ')}) RETURNING *`,
      cobroValues
    );
    const cobro = cobroResult.rows[0];

    // Insertar los detalles si se proporcionaron
    const detallesCreados = [];
    if (detalles && detalles.length > 0) {
      for (const detalle of detalles) {
        const detResult = await client.query(
          `INSERT INTO tt_detall (cobros_id, deudas_id, detall_mt) VALUES ($1, $2, $3) RETURNING *`,
          [cobro.cobros_id, detalle.deudas_id, detalle.detall_mt]
        );
        detallesCreados.push(detResult.rows[0]);

        // Marcar la deuda como pagada
        await client.query(
          `UPDATE tt_deudas SET deudas_es = 'Pagada' WHERE deudas_id = $1`,
          [detalle.deudas_id]
        );
      }
    }

    await client.query('COMMIT');

    res.status(201).json({ ...cobro, detalles: detallesCreados });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

exports.update = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const exists = await CobroModel.getById(req.params.id);
    if (!exists) return next({ status: 404, message: 'Cobro no encontrado' });

    await client.query('BEGIN');

    // Update the cobro
    const keys = Object.keys(req.body);
    const values = Object.values(req.body);
    let item;
    if (keys.length > 0) {
      const assignments = keys.map((key, i) => `${key} = $${i + 1}`);
      const result = await client.query(
        `UPDATE tt_cobros SET ${assignments.join(', ')} WHERE cobros_id = $${keys.length + 1} RETURNING *`,
        [...values, req.params.id]
      );
      item = result.rows[0];
    } else {
      item = exists;
    }

    // If voiding the payment, revert deudas status to 'Pendiente'
    if (req.body.cobros_es === 'Anulado') {
      // Find associated deudas
      const detailsResult = await client.query(
        'SELECT deudas_id FROM tt_detall WHERE cobros_id = $1',
        [req.params.id]
      );
      const deudasIds = detailsResult.rows.map(row => row.deudas_id);
      if (deudasIds.length > 0) {
        await client.query(
          `UPDATE tt_deudas SET deudas_es = 'Pendiente' WHERE deudas_id = ANY($1::int[])`,
          [deudasIds]
        );
      }
    }

    await client.query('COMMIT');
    res.json(item);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

exports.remove = async (req, res, next) => {
  try {
    const exists = await CobroModel.getById(req.params.id);
    if (!exists) return next({ status: 404, message: 'Cobro no encontrado' });
    await CobroModel.remove(req.params.id);
    res.status(204).send();
  } catch (err) { next(err); }
};
