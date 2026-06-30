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
  const result = await query(`SELECT * FROM ${tableName} ORDER BY ${idColumn} DESC`);
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
