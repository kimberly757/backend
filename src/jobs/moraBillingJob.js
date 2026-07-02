const { query, pool } = require('../config/database');

/**
 * Aplica un recargo del 5% a deudas que tienen más de 2 años sin pagar.
 * Solo se aplica una vez por deuda (se usa un flag mora_aplicada).
 */
const applyMoraToOldDebts = async () => {
  const client = await pool.connect();
  try {
    // 1. Asegurar que la columna mora_aplicada exista de forma segura
    await client.query(`
      ALTER TABLE tt_deudas 
      ADD COLUMN IF NOT EXISTS mora_aplicada BOOLEAN DEFAULT FALSE;
    `);

    await client.query('BEGIN');

    // 2. Seleccionar deudas pendientes con más de 2 años donde no se haya aplicado mora
    // Usamos FOR UPDATE SKIP LOCKED para no interferir con cobros concurrentes
    const result = await client.query(`
      SELECT deudas_id, deudas_mt, contri_id 
      FROM tt_deudas 
      WHERE deudas_es = 'Pendiente' 
        AND mora_aplicada = FALSE 
        AND deudas_fe < CURRENT_DATE - INTERVAL '2 years'
      FOR UPDATE SKIP LOCKED
    `);

    const deudas = result.rows;
    let appliedCount = 0;

    for (const deuda of deudas) {
      const montoOriginal = parseFloat(deuda.deudas_mt);
      const nuevoMonto = montoOriginal * 1.05; // +5%

      await client.query(`
        UPDATE tt_deudas 
        SET deudas_mt = $1, mora_aplicada = TRUE 
        WHERE deudas_id = $2
      `, [nuevoMonto, deuda.deudas_id]);

      appliedCount++;
    }

    if (appliedCount > 0) {
      // Registrar acción en bitácora
      await client.query(`
        INSERT INTO th_bitaco (usuari_id, bitaco_ac, bitaco_fe) 
        VALUES (2, $1, CURRENT_TIMESTAMP)
      `, [`[Sistema] Se aplicó mora del 5% a ${appliedCount} deuda(s) con más de 2 años de antigüedad.`]);
    }

    await client.query('COMMIT');
    console.log(`[Mora Job] Proceso completado. Moras aplicadas: ${appliedCount}`);
    
    return { applied: appliedCount };
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Mora Job] Error al aplicar mora automática:', err);
  } finally {
    client.release();
  }
};

let activeMoraInterval = null;

const start = () => {
  // Comprobar una vez al día (cada 24 horas)
  const intervalMs = 24 * 60 * 60 * 1000;
  
  console.log('[Mora Job] Tarea automática programada iniciada (comprobaciones diarias).');
  
  // Ejecutar inmediatamente al inicio
  applyMoraToOldDebts();

  activeMoraInterval = setInterval(() => {
    applyMoraToOldDebts();
  }, intervalMs);
};

const stop = () => {
  if (activeMoraInterval) {
    clearInterval(activeMoraInterval);
    activeMoraInterval = null;
    console.log('[Mora Job] Tarea automática detenida.');
  }
};

module.exports = {
  applyMoraToOldDebts,
  start,
  stop
};
