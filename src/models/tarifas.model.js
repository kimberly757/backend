const { query } = require('../config/database');

const tableName = 'th_tarifa';
const idColumn = 'tarifa_id';
const schema = {
  "tarifa_id": {
    "type": "integer",
    "primaryKey": true,
    "nullable": false
  },
  "servic_id": {
    "type": "integer",
    "nullable": false,
    "references": "tm_servic.servic_id"
  },
  "tarifa_mt": {
    "type": "numeric",
    "precision": 12,
    "scale": 2,
    "nullable": false
  },
  "tarifa_fi": {
    "type": "date",
    "nullable": false
  },
  "tarifa_ff": {
    "type": "date",
    "nullable": true
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
