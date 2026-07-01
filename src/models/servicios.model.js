const { query } = require('../config/database');

const tableName = 'tm_servic';
const idColumn = 'servic_id';
const schema = {
  "servic_id": {
    "type": "integer",
    "primaryKey": true,
    "nullable": false
  },
  "catego_id": {
    "type": "integer",
    "nullable": false,
    "references": "tm_catego.catego_id"
  },
  "servic_nm": {
    "type": "varchar",
    "length": 30,
    "nullable": false
  },
  "servic_ds": {
    "type": "text",
    "nullable": false
  },
  "servic_fr": {
    "type": "varchar",
    "length": 20,
    "nullable": false
  },
  "servic_es": {
    "type": "varchar",
    "length": 15,
    "nullable": false
  }
};

const list = async () => {
  const result = await query(`
    SELECT s.*, c.catego_nm, t.tarifa_mt as "montoBase", t.tarifa_id
    FROM ${tableName} s
    LEFT JOIN tm_catego c ON s.catego_id = c.catego_id
    LEFT JOIN th_tarifa t ON s.servic_id = t.servic_id AND t.tarifa_ff IS NULL
    ORDER BY s.servic_id DESC
  `);
  return result.rows;
};

const getById = async (id) => {
  const result = await query(`
    SELECT s.*, c.catego_nm, t.tarifa_mt as "montoBase", t.tarifa_id
    FROM ${tableName} s
    LEFT JOIN tm_catego c ON s.catego_id = c.catego_id
    LEFT JOIN th_tarifa t ON s.servic_id = t.servic_id AND t.tarifa_ff IS NULL
    WHERE s.${idColumn} = $1
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
