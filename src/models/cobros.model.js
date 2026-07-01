const { query } = require('../config/database');

const tableName = 'tt_cobros';
const idColumn = 'cobros_id';
const schema = {
  "cobros_id": {
    "type": "integer",
    "primaryKey": true,
    "nullable": false
  },
  "contri_id": {
    "type": "integer",
    "nullable": false,
    "references": "tm_contri.contri_id"
  },
  "usuari_id": {
    "type": "integer",
    "nullable": false,
    "references": "tm_usuari.usuari_id"
  },
  "metodo_id": {
    "type": "integer",
    "nullable": false,
    "references": "tm_metodo.metodo_id"
  },
  "bancos_id": {
    "type": "integer",
    "nullable": true,
    "references": "tm_bancos.bancos_id"
  },
  "cobros_mt": {
    "type": "numeric",
    "precision": 12,
    "scale": 2,
    "nullable": false
  },
  "cobros_rb": {
    "type": "varchar",
    "length": 20,
    "nullable": true
  },
  "cobros_fh": {
    "type": "timestamp",
    "nullable": false,
    "default": "CURRENT_TIMESTAMP"
  },
  "cobros_es": {
    "type": "varchar",
    "length": 10,
    "nullable": false
  }
};

const list = async () => {
  const result = await query(`
    SELECT 
      c.cobros_id,
      c.contri_id,
      c.usuari_id,
      c.metodo_id,
      c.bancos_id,
      c.cobros_mt,
      c.cobros_rb,
      c.cobros_fh,
      c.cobros_es,
      con.contri_nr as "contribuyente_nombre",
      con.contri_ri as "contribuyente_documento",
      con.tipcon_id,
      u.usuari_nm as "cajero_nombre",
      u.usuari_ap as "cajero_apellido",
      m.metodo_nm as "metodo_nombre",
      b.bancos_nm as "banco_nombre",
      (
        SELECT string_agg(s.servic_nm, ', ')
        FROM tt_detall d
        JOIN tt_deudas de ON d.deudas_id = de.deudas_id
        JOIN tm_servic s ON de.servic_id = s.servic_id
        WHERE d.cobros_id = c.cobros_id
      ) as "servicios_list"
    FROM tt_cobros c
    JOIN tm_contri con ON c.contri_id = con.contri_id
    JOIN tm_usuari u ON c.usuari_id = u.usuari_id
    JOIN tm_metodo m ON c.metodo_id = m.metodo_id
    LEFT JOIN tm_bancos b ON c.bancos_id = b.bancos_id
    ORDER BY c.cobros_id DESC
  `);
  return result.rows;
};

const getById = async (id) => {
  const result = await query(`SELECT * FROM ${tableName} WHERE ${idColumn} = $1`, [id]);
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

module.exports = {
  tableName,
  idColumn,
  schema,
  list,
  getById,
  create,
  update,
  remove
};
