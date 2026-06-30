/**
 * Test de esquemas Zod del backend SERMAB.
 * Verifica que los schemas rechacen datos inválidos y acepten datos válidos.
 */

const {
  createRolSchema,
  createUsuarioSchema,
  createContribuyenteSchema,
  createServicioSchema,
  createTarifaSchema,
  createDeudaSchema,
  createCobroSchema,
  loginSchema,
} = require('../src/validators/domainSchemas');

describe('Schema: createRolSchema', () => {
  it('acepta datos válidos', () => {
    const result = createRolSchema.safeParse({ rolusr_nm: 'Administrador' });
    expect(result.success).toBe(true);
  });
  it('rechaza sin nombre', () => {
    const result = createRolSchema.safeParse({});
    expect(result.success).toBe(false);
  });
  it('rechaza campos extra (strict)', () => {
    const result = createRolSchema.safeParse({ rolusr_nm: 'Admin', extra: 'no permitido' });
    expect(result.success).toBe(false);
  });
});

describe('Schema: createUsuarioSchema', () => {
  const valid = {
    rolusr_id: 1,
    usuari_nm: 'Juan',
    usuari_ap: 'Pérez',
    usuari_cd: 'jperez01',
    usuari_co: 'password123',
    usuari_es: 'Activo',
  };
  it('acepta datos válidos', () => {
    expect(createUsuarioSchema.safeParse(valid).success).toBe(true);
  });
  it('rechaza contraseña corta', () => {
    const result = createUsuarioSchema.safeParse({ ...valid, usuari_co: '123' });
    expect(result.success).toBe(false);
  });
  it('rechaza sin rolusr_id', () => {
    const { rolusr_id, ...rest } = valid;
    expect(createUsuarioSchema.safeParse(rest).success).toBe(false);
  });
});

describe('Schema: createContribuyenteSchema', () => {
  const valid = {
    tipcon_id: 1,
    contri_ri: 'V-12345678',
    contri_nr: 'Juan Pérez',
    contri_em: 'juan@example.com',
  };
  it('acepta datos válidos', () => {
    expect(createContribuyenteSchema.safeParse(valid).success).toBe(true);
  });
  it('rechaza correo inválido', () => {
    const result = createContribuyenteSchema.safeParse({ ...valid, contri_em: 'no-es-email' });
    expect(result.success).toBe(false);
  });
});

describe('Schema: createServicioSchema', () => {
  it('acepta datos válidos', () => {
    const result = createServicioSchema.safeParse({
      catego_id: 1,
      servic_nm: 'Aseo Urbano',
      servic_ds: 'Recolección de desechos sólidos',
    });
    expect(result.success).toBe(true);
  });
  it('rechaza sin descripción', () => {
    const result = createServicioSchema.safeParse({ catego_id: 1, servic_nm: 'Aseo' });
    expect(result.success).toBe(false);
  });
});

describe('Schema: createTarifaSchema', () => {
  it('acepta datos válidos', () => {
    const result = createTarifaSchema.safeParse({
      servic_id: 1,
      tarifa_mt: 150.00,
      tarifa_fi: '2024-01-01',
    });
    expect(result.success).toBe(true);
  });
  it('rechaza fecha con formato incorrecto', () => {
    const result = createTarifaSchema.safeParse({
      servic_id: 1,
      tarifa_mt: 150.00,
      tarifa_fi: '01/01/2024',
    });
    expect(result.success).toBe(false);
  });
  it('rechaza monto negativo', () => {
    const result = createTarifaSchema.safeParse({
      servic_id: 1,
      tarifa_mt: -50,
      tarifa_fi: '2024-01-01',
    });
    expect(result.success).toBe(false);
  });
});

describe('Schema: loginSchema', () => {
  it('acepta credenciales válidas', () => {
    const result = loginSchema.safeParse({ usuari_cd: 'admin', usuari_co: 'pass123' });
    expect(result.success).toBe(true);
  });
  it('rechaza sin contraseña', () => {
    const result = loginSchema.safeParse({ usuari_cd: 'admin' });
    expect(result.success).toBe(false);
  });
  it('rechaza campos extra', () => {
    const result = loginSchema.safeParse({ usuari_cd: 'admin', usuari_co: 'pass', extra: 'x' });
    expect(result.success).toBe(false);
  });
});

describe('Schema: numericIdParam', () => {
  const { numericIdParam } = require('../src/validators/commonSchemas');
  it('acepta ID numérico positivo', () => {
    expect(numericIdParam.safeParse({ id: '5' }).success).toBe(true);
  });
  it('rechaza ID cero', () => {
    expect(numericIdParam.safeParse({ id: '0' }).success).toBe(false);
  });
  it('rechaza ID texto', () => {
    expect(numericIdParam.safeParse({ id: 'abc' }).success).toBe(false);
  });
  it('rechaza ID negativo', () => {
    expect(numericIdParam.safeParse({ id: '-1' }).success).toBe(false);
  });
});
