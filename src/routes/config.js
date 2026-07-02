const express = require('express');
const { query } = require('../config/database');
const { requireAuth, requireAdmin } = require('../middlewares/authMiddleware');
const router = express.Router();

// GET /api/config/tasa-bcv - Público para cualquier usuario autenticado (cajeras y admins)
router.get('/tasa-bcv', requireAuth, async (req, res, next) => {
  try {
    const result = await query("SELECT config_vl FROM tm_config WHERE config_ky = 'tasa_bcv'");
    if (result.rows.length === 0) {
      return res.json({ tasa: 36.45 }); // Default fallback
    }
    res.json({ tasa: parseFloat(result.rows[0].config_vl) });
  } catch (err) {
    next(err);
  }
});

// PUT /api/config/tasa-bcv - Solo admins
router.put('/tasa-bcv', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { tasa } = req.body;
    if (!tasa || isNaN(parseFloat(tasa))) {
      return res.status(400).json({ error: 'Tasa BCV inválida' });
    }

    const result = await query(
      "UPDATE tm_config SET config_vl = $1 WHERE config_ky = 'tasa_bcv' RETURNING config_vl",
      [String(tasa)]
    );

    // Registrar en bitácora
    const usuari_id = req.auth ? req.auth.id : 2;
    await query(
      `INSERT INTO th_bitaco (usuari_id, bitaco_ac, bitaco_fe) VALUES ($1, $2, CURRENT_TIMESTAMP)`,
      [usuari_id || 2, `[Sistema] Actualizó la Tasa BCV a Bs. ${tasa}`]
    );

    res.json({ message: 'Tasa BCV actualizada', tasa: parseFloat(result.rows[0].config_vl) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
