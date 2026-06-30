const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const modelsDir = path.join(root, 'src', 'models');
fs.mkdirSync(modelsDir, { recursive: true });

const entities = [
  {
    name: 'bitacoras',
    table: 'th_bitaco',
    idColumn: 'bitaco_id',
    schema: {
      bitaco_id: { type: 'integer', primaryKey: true, nullable: false },
      usuari_id: { type: 'integer', nullable: false, references: 'tm_usuari.usuari_id' },
      bitaco_ac: { type: 'varchar', length: 50, nullable: false },
      bitaco_fe: { type: 'timestamp', nullable: false, default: 'CURRENT_TIMESTAMP' }
    }
  },
  {
    name: 'tarifas',
    table: 'th_tarifa',
    idColumn: 'tarifa_id',
    schema: {
      tarifa_id: { type: 'integer', primaryKey: true, nullable: false },
      servic_id: { type: 'integer', nullable: false, references: 'tm_servic.servic_id' },
      tarifa_mt: { type: 'numeric', precision: 12, scale: 2, nullable: false },
      tarifa_fi: { type: 'date', nullable: false },
      tarifa_ff: { type: 'date', nullable: true }
    }
  },
  {
    name: 'bancos',
    table: 'tm_bancos',
    idColumn: 'bancos_id',
    schema: {
      bancos_id: { type: 'integer', primaryKey: true, nullable: false },
      bancos_nm: { type: 'varchar', length: 30, nullable: false }
    }
  },
  {
    name: 'categorias',
    table: 'tm_catego',
    idColumn: 'catego_id',
    schema: {
      catego_id: { type: 'integer', primaryKey: true, nullable: false },
      catego_nm: { type: 'varchar', length: 30, nullable: false }
    }
  },
  {
    name: 'contribuyentes',
    table: 'tm_contri',
    idColumn: 'contri_id',
    schema: {
      contri_id: { type: 'integer', primaryKey: true, nullable: false },
      tipcon_id: { type: 'integer', nullable: false, references: 'tm_tipcon.tipcon_id' },
      contri_ri: { type: 'varchar', length: 15, nullable: false },
      contri_nr: { type: 'varchar', length: 50, nullable: false },
      contri_em: { type: 'varchar', length: 50, nullable: false },
      contri_es: { type: 'varchar', length: 15, nullable: false, default: 'Activo' }
    }
  },
  {
    name: 'direcciones',
    table: 'tm_direcc',
    idColumn: 'direcc_id',
    schema: {
      direcc_id: { type: 'integer', primaryKey: true, nullable: false },
      contri_id: { type: 'integer', nullable: false, references: 'tm_contri.contri_id' },
      sector_id: { type: 'integer', nullable: false, references: 'tm_sector.sector_id' },
      direcc_ds: { type: 'varchar', length: 100, nullable: false },
      direcc_tp: { type: 'varchar', length: 20, nullable: false }
    }
  },
  {
    name: 'inmuebles',
    table: 'tm_inmueb',
    idColumn: 'inmueb_id',
    schema: {
      inmueb_id: { type: 'integer', primaryKey: true, nullable: false },
      contri_id: { type: 'integer', nullable: false, references: 'tm_contri.contri_id' },
      inmueb_ct: { type: 'varchar', length: 20, nullable: false },
      inmueb_dr: { type: 'varchar', length: 100, nullable: false },
      inmueb_tp: { type: 'varchar', length: 20, nullable: false }
    }
  },
  {
    name: 'metodos',
    table: 'tm_metodo',
    idColumn: 'metodo_id',
    schema: {
      metodo_id: { type: 'integer', primaryKey: true, nullable: false },
      metodo_nm: { type: 'varchar', length: 30, nullable: false }
    }
  },
  {
    name: 'roles',
    table: 'tm_rolusr',
    idColumn: 'rolusr_id',
    schema: {
      rolusr_id: { type: 'integer', primaryKey: true, nullable: false },
      rolusr_nm: { type: 'varchar', length: 20, nullable: false },
      rolusr_ds: { type: 'text', nullable: false }
    }
  },
  {
    name: 'sectores',
    table: 'tm_sector',
    idColumn: 'sector_id',
    schema: {
      sector_id: { type: 'integer', primaryKey: true, nullable: false },
      sector_nm: { type: 'varchar', length: 50, nullable: false }
    }
  },
  {
    name: 'servicios',
    table: 'tm_servic',
    idColumn: 'servic_id',
    schema: {
      servic_id: { type: 'integer', primaryKey: true, nullable: false },
      catego_id: { type: 'integer', nullable: false, references: 'tm_catego.catego_id' },
      servic_nm: { type: 'varchar', length: 30, nullable: false },
      servic_ds: { type: 'text', nullable: false }
    }
  },
  {
    name: 'tiposContribuyente',
    table: 'tm_tipcon',
    idColumn: 'tipcon_id',
    schema: {
      tipcon_id: { type: 'integer', primaryKey: true, nullable: false },
      tipcon_nm: { type: 'varchar', length: 30, nullable: false }
    }
  },
  {
    name: 'usuarios',
    table: 'tm_usuari',
    idColumn: 'usuari_id',
    schema: {
      usuari_id: { type: 'integer', primaryKey: true, nullable: false },
      rolusr_id: { type: 'integer', nullable: false, references: 'tm_rolusr.rolusr_id' },
      usuari_nm: { type: 'varchar', length: 30, nullable: false },
      usuari_ap: { type: 'varchar', length: 30, nullable: false },
      usuari_cd: { type: 'varchar', length: 8, nullable: false },
      usuari_co: { type: 'varchar', length: 50, nullable: false },
      usuari_es: { type: 'varchar', length: 10, nullable: false },
      usuari_fe: { type: 'timestamp', nullable: false, default: 'CURRENT_TIMESTAMP' }
    }
  },
  {
    name: 'vehiculos',
    table: 'tm_vehicu',
    idColumn: 'vehicu_id',
    schema: {
      vehicu_id: { type: 'integer', primaryKey: true, nullable: false },
      contri_id: { type: 'integer', nullable: false, references: 'tm_contri.contri_id' },
      vehicu_pl: { type: 'varchar', length: 10, nullable: false },
      vehicu_ma: { type: 'varchar', length: 20, nullable: false },
      vehicu_mo: { type: 'varchar', length: 20, nullable: false }
    }
  },
  {
    name: 'cobros',
    table: 'tt_cobros',
    idColumn: 'cobros_id',
    schema: {
      cobros_id: { type: 'integer', primaryKey: true, nullable: false },
      contri_id: { type: 'integer', nullable: false, references: 'tm_contri.contri_id' },
      usuari_id: { type: 'integer', nullable: false, references: 'tm_usuari.usuari_id' },
      metodo_id: { type: 'integer', nullable: false, references: 'tm_metodo.metodo_id' },
      bancos_id: { type: 'integer', nullable: true, references: 'tm_bancos.bancos_id' },
      cobros_mt: { type: 'numeric', precision: 12, scale: 2, nullable: false },
      cobros_rb: { type: 'varchar', length: 20, nullable: true },
      cobros_fh: { type: 'timestamp', nullable: false, default: 'CURRENT_TIMESTAMP' },
      cobros_es: { type: 'varchar', length: 10, nullable: false }
    }
  },
  {
    name: 'detallesCobros',
    table: 'tt_detall',
    idColumn: 'detall_id',
    schema: {
      detall_id: { type: 'integer', primaryKey: true, nullable: false },
      cobros_id: { type: 'integer', nullable: false, references: 'tt_cobros.cobros_id' },
      deudas_id: { type: 'integer', nullable: false, references: 'tt_deudas.deudas_id' },
      detall_mt: { type: 'numeric', precision: 12, scale: 2, nullable: false }
    }
  },
  {
    name: 'deudas',
    table: 'tt_deudas',
    idColumn: 'deudas_id',
    schema: {
      deudas_id: { type: 'integer', primaryKey: true, nullable: false },
      contri_id: { type: 'integer', nullable: false, references: 'tm_contri.contri_id' },
      servic_id: { type: 'integer', nullable: false, references: 'tm_servic.servic_id' },
      tarifa_id: { type: 'integer', nullable: false, references: 'th_tarifa.tarifa_id' },
      deudas_mt: { type: 'numeric', precision: 12, scale: 2, nullable: false },
      deudas_fe: { type: 'date', nullable: false },
      deudas_es: { type: 'varchar', length: 10, nullable: false }
    }
  }
];

const buildModelContent = (entity) => `const { query } = require('../config/db');

const tableName = '${entity.table}';
const idColumn = '${entity.idColumn}';
const schema = ${JSON.stringify(entity.schema, null, 2)};

const list = async () => {
  const result = await query(\`SELECT * FROM \${tableName} ORDER BY \${idColumn} DESC\`);
  return result.rows;
};

const getById = async (id) => {
  const result = await query(\`SELECT * FROM \${tableName} WHERE \${idColumn} = $1\`, [id]);
  return result.rows[0];
};

const create = async (data = {}) => {
  const fields = Object.keys(data);
  if (!fields.length) {
    const result = await query(\`INSERT INTO \${tableName} DEFAULT VALUES RETURNING *\`);
    return result.rows[0];
  }

  const values = Object.values(data);
  const placeholders = values.map((_, index) => \`$\${index + 1}\`);
  const result = await query(
    \`INSERT INTO \${tableName} (\${fields.join(', ')}) VALUES (\${placeholders.join(', ')}) RETURNING *\`,
    values
  );
  return result.rows[0];
};

const update = async (id, data = {}) => {
  const entries = Object.entries(data);
  if (!entries.length) return null;

  const assignments = entries.map(([field], index) => \`\${field} = $\${index + 1}\`);
  const values = entries.map(([, value]) => value);
  const result = await query(
    \`UPDATE \${tableName} SET \${assignments.join(', ')} WHERE \${idColumn} = $\${values.length + 1} RETURNING *\`,
    [...values, id]
  );
  return result.rows[0];
};

const remove = async (id) => {
  const result = await query(\`DELETE FROM \${tableName} WHERE \${idColumn} = $1 RETURNING *\`, [id]);
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
`;

for (const entity of entities) {
  const filePath = path.join(modelsDir, `${entity.name}.model.js`);
  fs.writeFileSync(filePath, buildModelContent(entity));
}

console.log(`Modelos actualizados: ${entities.length}`);
