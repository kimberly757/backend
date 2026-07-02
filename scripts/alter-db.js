require('dotenv').config();
const { pool } = require('../src/config/database');

async function run() {
  try {
    console.log('Iniciando alteración de base de datos...');
    
    // Agregar columna de frecuencia
    await pool.query(`
      ALTER TABLE tm_servic 
      ADD COLUMN IF NOT EXISTS servic_fr VARCHAR(20) DEFAULT 'Mensual';
    `);
    console.log('✅ Columna "servic_fr" agregada o ya existente en "tm_servic".');

    // Agregar columna de estado
    await pool.query(`
      ALTER TABLE tm_servic 
      ADD COLUMN IF NOT EXISTS servic_es VARCHAR(15) DEFAULT 'Activo';
    `);
    console.log('✅ Columna "servic_es" agregada o ya existente en "tm_servic".');

    // Agregar columna de referencia de pago
    await pool.query(`
      ALTER TABLE tt_cobros 
      ADD COLUMN IF NOT EXISTS cobros_rf VARCHAR(50) DEFAULT NULL;
    `);
    console.log('✅ Columna "cobros_rf" agregada o ya existente en "tt_cobros".');

    // Verificar estructura actual de la tabla
    const res = await pool.query(`
      SELECT column_name, data_type, character_maximum_length 
      FROM information_schema.columns 
      WHERE table_name = 'tm_servic';
    `);
    console.log('Estructura actual de "tm_servic":', res.rows);

  } catch (error) {
    console.error('❌ Error al alterar la base de datos:', error);
  } finally {
    await pool.end();
  }
}

run();
