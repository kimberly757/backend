const { query } = require('../config/database');

const tableName = 'tt_deudas';
const idColumn = 'deudas_id';
const schema = {
  "deudas_id": {
    "type": "integer",
    "primaryKey": true,
    "nullable": false
  },
  "contri_id": {
    "type": "integer",
    "nullable": false,
    "references": "tm_contri.contri_id"
  },
  "servic_id": {
    "type": "integer",
    "nullable": false,
    "references": "tm_servic.servic_id"
  },
  "tarifa_id": {
    "type": "integer",
    "nullable": false,
    "references": "th_tarifa.tarifa_id"
  },
  "deudas_mt": {
    "type": "numeric",
    "precision": 12,
    "scale": 2,
    "nullable": false
  },
  "deudas_fe": {
    "type": "date",
    "nullable": false
  },
  "deudas_es": {
    "type": "varchar",
    "length": 10,
    "nullable": false
  }
};

const list = async (filters = {}) => {
  let queryStr = `
    SELECT d.*, c.contri_ri, c.contri_nr, c.tipcon_id, s.servic_nm, s.servic_fr
    FROM ${tableName} d
    JOIN tm_contri c ON d.contri_id = c.contri_id
    JOIN tm_servic s ON d.servic_id = s.servic_id
  `;
  const conditions = [];
  const params = [];
  
  if (filters.estado) {
    conditions.push(`d.deudas_es = $${conditions.length + 1}`);
    params.push(filters.estado);
  }
  if (filters.contri_id) {
    conditions.push(`d.contri_id = $${conditions.length + 1}`);
    params.push(parseInt(filters.contri_id));
  }

  if (conditions.length > 0) {
    queryStr += ` WHERE ${conditions.join(' AND ')}`;
  }
  
  queryStr += ` ORDER BY d.${idColumn} DESC`;

  const result = await query(queryStr, params);
  return result.rows;
};

const getById = async (id) => {
  const result = await query(`
    SELECT d.*, c.contri_ri, c.contri_nr, c.tipcon_id, s.servic_nm, s.servic_fr
    FROM ${tableName} d
    JOIN tm_contri c ON d.contri_id = c.contri_id
    JOIN tm_servic s ON d.servic_id = s.servic_id
    WHERE d.${idColumn} = $1
  `, [id]);
  return result.rows[0];
};

const create = async (data = {}) => {
  const fields = Object.keys(data);
  if (!fields.length) {
    const result = await query(`INSERT INTO ${tableName} DEFAULT VALUES RETURNING *`);
    return result.rows[0];
  }

  const values = Object.values(data);
  const placeholders = values.map((_, index) => `$${index + 1}`);
  const result = await query(
    `INSERT INTO ${tableName} (${fields.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`,
    values
  );
  return result.rows[0];
};

const update = async (id, data = {}) => {
  const entries = Object.entries(data);
  if (!entries.length) return null;

  const assignments = entries.map(([field], index) => `${field} = $${index + 1}`);
  const values = entries.map(([, value]) => value);
  const result = await query(
    `UPDATE ${tableName} SET ${assignments.join(', ')} WHERE ${idColumn} = $${values.length + 1} RETURNING *`,
    [...values, id]
  );
  return result.rows[0];
};

const remove = async (id) => {
  const result = await query(`DELETE FROM ${tableName} WHERE ${idColumn} = $1 RETURNING *`, [id]);
  return result.rows[0];
};

const autoGeneratePeriods = async (contri_id) => {
  if (!contri_id) return;
  
  // 1. Consultar todos los servicios asignados históricamente al contribuyente
  const res = await query(`
    SELECT d.servic_id, MIN(d.deudas_fe) as fecha_inicio, MAX(d.deudas_fe) as fecha_fin, 
           MAX(d.tarifa_id) as tarifa_id, MAX(d.deudas_mt) as deudas_mt, s.servic_fr
    FROM tt_deudas d
    JOIN tm_servic s ON d.servic_id = s.servic_id
    WHERE d.contri_id = $1
    GROUP BY d.servic_id, s.servic_fr
  `, [contri_id]);
  
  const assignedServices = res.rows;
  if (!assignedServices.length) return;

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1; // 1-indexed

  for (const s of assignedServices) {
    const freq = s.servic_fr; // 'Mensual', 'Bimensual', 'Trimestral', 'Semestral', 'Anual', 'Único'
    if (freq === 'Único') continue;

    const lastDate = new Date(s.fecha_fin);
    if (isNaN(lastDate.getTime())) continue;

    const lastYear = lastDate.getUTCFullYear();
    const lastMonth = lastDate.getUTCMonth() + 1;

    // Calcular cuántos períodos faltan hasta el día de hoy
    if (freq === 'Mensual') {
      let tempYear = lastYear;
      let tempMonth = lastMonth + 1;

      while (tempYear < currentYear || (tempYear === currentYear && tempMonth <= currentMonth)) {
        if (tempMonth > 12) {
          tempMonth = 1;
          tempYear++;
        }
        if (tempYear > currentYear || (tempYear === currentYear && tempMonth > currentMonth)) {
          break;
        }

        const newDateStr = `${tempYear}-${String(tempMonth).padStart(2, '0')}-01`;
        
        // Insertar período faltante
        await query(`
          INSERT INTO tt_deudas (contri_id, servic_id, tarifa_id, deudas_mt, deudas_fe, deudas_es)
          VALUES ($1, $2, $3, $4, $5, 'Pendiente')
        `, [contri_id, s.servic_id, s.tarifa_id, s.deudas_mt, newDateStr]);

        tempMonth++;
      }
    } else if (freq === 'Trimestral') {
      let tempYear = lastYear;
      let tempMonth = lastMonth + 3;

      while (tempYear < currentYear || (tempYear === currentYear && tempMonth <= currentMonth)) {
        if (tempMonth > 12) {
          tempMonth = tempMonth - 12;
          tempYear++;
        }
        if (tempYear > currentYear || (tempYear === currentYear && tempMonth > currentMonth)) {
          break;
        }

        const newDateStr = `${tempYear}-${String(tempMonth).padStart(2, '0')}-01`;

        await query(`
          INSERT INTO tt_deudas (contri_id, servic_id, tarifa_id, deudas_mt, deudas_fe, deudas_es)
          VALUES ($1, $2, $3, $4, $5, 'Pendiente')
        `, [contri_id, s.servic_id, s.tarifa_id, s.deudas_mt, newDateStr]);

        tempMonth += 3;
      }
    } else if (freq === 'Anual') {
      let tempYear = lastYear + 1;

      while (tempYear <= currentYear) {
        const newDateStr = `${tempYear}-01-01`;

        await query(`
          INSERT INTO tt_deudas (contri_id, servic_id, tarifa_id, deudas_mt, deudas_fe, deudas_es)
          VALUES ($1, $2, $3, $4, $5, 'Pendiente')
        `, [contri_id, s.servic_id, s.tarifa_id, s.deudas_mt, newDateStr]);

        tempYear++;
      }
    } else if (freq === 'Bimensual') {
      let tempYear = lastYear;
      let tempMonth = lastMonth + 2;

      while (tempYear < currentYear || (tempYear === currentYear && tempMonth <= currentMonth)) {
        if (tempMonth > 12) {
          tempMonth = tempMonth - 12;
          tempYear++;
        }
        if (tempYear > currentYear || (tempYear === currentYear && tempMonth > currentMonth)) {
          break;
        }

        const newDateStr = `${tempYear}-${String(tempMonth).padStart(2, '0')}-01`;

        await query(`
          INSERT INTO tt_deudas (contri_id, servic_id, tarifa_id, deudas_mt, deudas_fe, deudas_es)
          VALUES ($1, $2, $3, $4, $5, 'Pendiente')
        `, [contri_id, s.servic_id, s.tarifa_id, s.deudas_mt, newDateStr]);

        tempMonth += 2;
      }
    } else if (freq === 'Semestral') {
      let tempYear = lastYear;
      let tempMonth = lastMonth + 6;

      while (tempYear < currentYear || (tempYear === currentYear && tempMonth <= currentMonth)) {
        if (tempMonth > 12) {
          tempMonth = tempMonth - 12;
          tempYear++;
        }
        if (tempYear > currentYear || (tempYear === currentYear && tempMonth > currentMonth)) {
          break;
        }

        const newDateStr = `${tempYear}-${String(tempMonth).padStart(2, '0')}-01`;

        await query(`
          INSERT INTO tt_deudas (contri_id, servic_id, tarifa_id, deudas_mt, deudas_fe, deudas_es)
          VALUES ($1, $2, $3, $4, $5, 'Pendiente')
        `, [contri_id, s.servic_id, s.tarifa_id, s.deudas_mt, newDateStr]);

        tempMonth += 6;
      }
    }
  }
};

module.exports = {
  tableName,
  idColumn,
  schema,
  list,
  getById,
  create,
  update,
  remove,
  autoGeneratePeriods
};
