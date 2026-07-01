const { pool } = require('../config/database');
const ServicioModel = require('../models/servicios.model');

exports.list = async (_req, res) => {
  try {
    const items = await ServicioModel.list();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const item = await ServicioModel.getById(req.params.id);
    if (!item) return res.status(404).json({ message: 'No encontrado' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  const { catego_id, servic_nm, servic_ds, servic_fr, montoBase } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Insert into tm_servic
    const resServic = await client.query(
      'INSERT INTO tm_servic (catego_id, servic_nm, servic_ds, servic_fr, servic_es) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [catego_id, servic_nm, servic_ds, servic_fr || 'Mensual', 'Activo']
    );
    const service = resServic.rows[0];
    
    // Insert into th_tarifa
    const parsedMonto = parseFloat(montoBase) || 0;
    const resTarifa = await client.query(
      'INSERT INTO th_tarifa (servic_id, tarifa_mt, tarifa_fi) VALUES ($1, $2, CURRENT_DATE) RETURNING *',
      [service.servic_id, parsedMonto]
    );
    
    await client.query('COMMIT');
    
    res.status(201).json({
      ...service,
      montoBase: parsedMonto,
      tarifa_id: resTarifa.rows[0].tarifa_id
    });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const { catego_id, servic_nm, servic_ds, servic_fr, servic_es, montoBase } = req.body;
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Update service fields in tm_servic
    const resServic = await client.query(
      `UPDATE tm_servic 
       SET catego_id = $1, servic_nm = $2, servic_ds = $3, servic_fr = $4, servic_es = $5 
       WHERE servic_id = $6 RETURNING *`,
      [catego_id, servic_nm, servic_ds, servic_fr, servic_es || 'Activo', id]
    );
    
    if (resServic.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Servicio no encontrado' });
    }
    
    const service = resServic.rows[0];
    
    // Check active tariff
    const resActiveTarifa = await client.query(
      'SELECT * FROM th_tarifa WHERE servic_id = $1 AND tarifa_ff IS NULL',
      [id]
    );
    
    const activeTarifa = resActiveTarifa.rows[0];
    const newMonto = parseFloat(montoBase) || 0;
    
    if (!activeTarifa) {
      // If no active tariff exists, create one
      await client.query(
        'INSERT INTO th_tarifa (servic_id, tarifa_mt, tarifa_fi) VALUES ($1, $2, CURRENT_DATE)',
        [id, newMonto]
      );
    } else if (parseFloat(activeTarifa.tarifa_mt) !== newMonto) {
      // If the price changed, close the old one and create a new one
      await client.query(
        'UPDATE th_tarifa SET tarifa_ff = CURRENT_DATE WHERE tarifa_id = $1',
        [activeTarifa.tarifa_id]
      );
      await client.query(
        'INSERT INTO th_tarifa (servic_id, tarifa_mt, tarifa_fi) VALUES ($1, $2, CURRENT_DATE)',
        [id, newMonto]
      );
    }
    
    await client.query('COMMIT');
    
    res.json({
      ...service,
      montoBase: newMonto
    });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};

exports.remove = async (req, res) => {
  const { id } = req.params;
  try {
    // Logical delete by marking as Inactive
    const result = await pool.query(
      "UPDATE tm_servic SET servic_es = 'Inactivo' WHERE servic_id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No encontrado' });
    }
    res.json({ message: 'Eliminado correctamente', item: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

