const { query, pool } = require('../config/database');

/**
 * Genera deudas de Aseo Urbano de forma idempotente para todos los contribuyentes
 * que posean inmuebles registrados en el municipio.
 * 
 * @param {Date} [targetDate] Fecha de facturación (opcional, por defecto primer día del mes actual)
 * @returns {Promise<{ processed: number, generated: number }>}
 */
const generateAseoUrbanoDebts = async (targetDate = new Date()) => {
  const billingYear = targetDate.getFullYear();
  const billingMonth = String(targetDate.getMonth() + 1).padStart(2, '0');
  const billingDateStr = `${billingYear}-${billingMonth}-01`;

  console.log(`[Billing Job] Iniciando facturación de Aseo Urbano para la fecha: ${billingDateStr}`);

  // 1. Obtener la tarifa vigente de Aseo Urbano (servic_id = 2)
  const tariffResult = await query(
    `SELECT * FROM th_tarifa 
     WHERE servic_id = 2 
     ORDER BY tarifa_fi DESC 
     LIMIT 1`
  );

  if (tariffResult.rows.length === 0) {
    throw new Error('No se encontró ninguna tarifa configurada para el servicio de Aseo Urbano (servic_id = 2)');
  }

  const activeTariff = tariffResult.rows[0];
  const tariffId = activeTariff.tarifa_id;
  const tariffAmount = parseFloat(activeTariff.tarifa_mt);

  // 2. Obtener todos los inmuebles
  const propertiesResult = await query(
    `SELECT inmueb_id, contri_id, inmueb_dr 
     FROM tm_inmueb`
  );

  const allProperties = propertiesResult.rows;
  let totalGenerated = 0;
  let totalProcessed = 0;

  // 3. Procesar propiedades de forma segura e independiente
  for (const prop of allProperties) {
    const contriId = parseInt(prop.contri_id);
    const inmuebId = parseInt(prop.inmueb_id);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Verificar si ya existe deudas de Aseo Urbano para este inmueble en este mes
      const existingResult = await client.query(
        `SELECT deudas_id 
         FROM tt_deudas 
         WHERE contri_id = $1 
           AND servic_id = 2 
           AND deudas_fe = $2 
           AND inmueb_id = $3`,
        [contriId, billingDateStr, inmuebId]
      );

      // Si ya existe, omitir
      if (existingResult.rows.length > 0) {
        await client.query('COMMIT');
        totalProcessed++;
        continue;
      }

      // Si no existe, crear la deuda de aseo enlazada al inmueble
      await client.query(
        `INSERT INTO tt_deudas (contri_id, servic_id, tarifa_id, deudas_mt, deudas_fe, deudas_es, inmueb_id) 
         VALUES ($1, 2, $2, $3, $4, 'Pendiente', $5)`,
        [contriId, tariffId, tariffAmount, billingDateStr, inmuebId]
      );

      // Registrar en Bitácora (Admin Juan, usuari_id = 2 como agente del sistema)
      const logAction = `[Aseo Urbano] Factura mensual automática generada para el contribuyente ID: ${contriId} (Inmueble: ${prop.inmueb_dr})`;
      await client.query(
        `INSERT INTO th_bitaco (usuari_id, bitaco_ac, bitaco_fe) 
         VALUES (2, $1, CURRENT_TIMESTAMP)`,
        [logAction]
      );

      totalGenerated++;
      await client.query('COMMIT');
      totalProcessed++;
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(`[Billing Job] Error al procesar facturación para el inmueble ${inmuebId}:`, err);
    } finally {
      client.release();
    }
  }

  console.log(`[Billing Job] Facturación completada. Inmuebles evaluados: ${totalProcessed}. Nuevas deudas generadas: ${totalGenerated}.`);
  return { processed: totalProcessed, generated: totalGenerated };
};

// Guardar referencia del temporizador activo para poder cancelarlo si se apaga el servidor
let activeInterval = null;

/**
 * Arranca la planificación del Cron Job mediante chequeos periódicos de hora.
 */
const start = () => {
  // Comprobación cada 1 hora (3,600,000 ms) para verificar si es medianoche del día 1
  const intervalMs = 3600000;
  let lastBilledMonthKey = '';

  console.log('[Billing Job] Tarea automática programada iniciada (comprobaciones de fecha cada hora).');

  activeInterval = setInterval(async () => {
    const now = new Date();
    // Si es el primer día de cualquier mes a la hora 0 (medianoche)
    if (now.getDate() === 1 && now.getHours() === 0) {
      const monthKey = `${now.getFullYear()}-${now.getMonth() + 1}`;
      if (lastBilledMonthKey !== monthKey) {
        lastBilledMonthKey = monthKey;
        try {
          await generateAseoUrbanoDebts(now);
        } catch (err) {
          console.error('[Billing Job] Error crítico en facturación automática programada:', err);
        }
      }
    }
  }, intervalMs);
};

/**
 * Detiene la tarea programada activa (útil para pruebas).
 */
const stop = () => {
  if (activeInterval) {
    clearInterval(activeInterval);
    activeInterval = null;
    console.log('[Billing Job] Tarea automática detenida.');
  }
};

module.exports = {
  generateAseoUrbanoDebts,
  start,
  stop
};
