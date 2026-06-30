const { query } = require('../src/config/database');
const { hashPassword } = require('../src/services/passwordService');

async function seed() {
  try {
    console.log('🌱 Iniciando la creación de usuarios de prueba...');

    // 1. Asegurar roles
    const rolesCheck = await query('SELECT rolusr_id FROM tm_rolusr WHERE rolusr_id IN (1, 2)');
    const rolesIds = rolesCheck.rows.map(r => r.rolusr_id);

    if (!rolesIds.includes(1)) {
      await query(
        "INSERT INTO tm_rolusr (rolusr_id, rolusr_nm, rolusr_ds) VALUES (1, 'Administrador', 'Rol de Administrador')"
      );
      console.log('✔️ Rol Administrador creado');
    }
    if (!rolesIds.includes(2)) {
      await query(
        "INSERT INTO tm_rolusr (rolusr_id, rolusr_nm, rolusr_ds) VALUES (2, 'Cajera', 'Rol de Cajera')"
      );
      console.log('✔️ Rol Cajera creado');
    }

    // 2. Encriptar contraseñas de prueba
    const adminPasswordHash = await hashPassword('12345678');
    const cajeraPasswordHash = await hashPassword('caja123');

    // 3. Crear/Actualizar Administrador: jperez01
    const adminCheck = await query("SELECT usuari_id FROM tm_usuari WHERE usuari_cd = 'jperez01'");
    if (adminCheck.rows.length > 0) {
      await query(
        "UPDATE tm_usuari SET usuari_co = $1, rolusr_id = 1, usuari_es = 'Activo' WHERE usuari_cd = 'jperez01'",
        [adminPasswordHash]
      );
      console.log('✔️ Contraseña de Administrador (jperez01) restablecida a "12345678"');
    } else {
      await query(
        `INSERT INTO tm_usuari (rolusr_id, usuari_nm, usuari_ap, usuari_cd, usuari_co, usuari_em, usuari_es)
         VALUES (1, 'Juan', 'Pérez', 'jperez01', $1, 'juan@ejemplo.com', 'Activo')`,
        [adminPasswordHash]
      );
      console.log('✔️ Administrador (jperez01) creado con contraseña "12345678"');
    }

    // 4. Crear/Actualizar Cajera: caja01
    const cajeraCheck = await query("SELECT usuari_id FROM tm_usuari WHERE usuari_cd = 'caja01'");
    if (cajeraCheck.rows.length > 0) {
      await query(
        "UPDATE tm_usuari SET usuari_co = $1, rolusr_id = 2, usuari_es = 'Activo' WHERE usuari_cd = 'caja01'",
        [cajeraPasswordHash]
      );
      console.log('✔️ Contraseña de Cajera (caja01) restablecida a "caja123"');
    } else {
      await query(
        `INSERT INTO tm_usuari (rolusr_id, usuari_nm, usuari_ap, usuari_cd, usuari_co, usuari_em, usuari_es)
         VALUES (2, 'María', 'López', 'caja01', $1, 'maria@ejemplo.com', 'Activo')`,
        [cajeraPasswordHash]
      );
      console.log('✔️ Cajera (caja01) creada con contraseña "caja123"');
    }

    console.log('🎉 Usuarios de prueba listos.');
  } catch (err) {
    console.error('❌ Error al poblar base de datos:', err);
  } finally {
    process.exit(0);
  }
}

seed();
