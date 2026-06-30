const { z } = require('zod');
const { isoDateString } = require('./commonSchemas');

// ─────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────
const loginSchema = z.object({
  usuari_cd: z.string().min(1, 'El código de usuario es requerido').max(8),
  usuari_co: z.string().min(1, 'La contraseña es requerida'),
}).strict();

const registerSchema = z.object({
  rolusr_id: z.number().int().positive('El ID de rol debe ser un entero positivo'),
  usuari_nm: z.string().min(1, 'El nombre es requerido').max(30),
  usuari_ap: z.string().min(1, 'El apellido es requerido').max(30),
  usuari_cd: z.string().min(1, 'El código de usuario es requerido').max(8),
  usuari_co: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').max(100),
  usuari_em: z.string().email('Correo electrónico inválido').max(100).optional().nullable(),
}).strict();

// Recuperar contraseña: ahora que tm_usuari tiene columna usuari_em
const passwordRecoverSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
}).strict();

const passwordResetSchema = z.object({
  token: z.string().min(1, 'El token es requerido'),
  newPassword: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
}).strict();

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
  newPassword: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres'),
}).strict();

const updateProfileSchema = z.object({
  usuari_nm: z.string().min(1, 'El nombre no puede estar vacío').max(30).optional(),
  usuari_ap: z.string().min(1, 'El apellido no puede estar vacío').max(30).optional(),
  usuari_em: z.string().email('Correo electrónico inválido').optional().nullable(),
}).strict();

// ─────────────────────────────────────────────
// ROLES
// ─────────────────────────────────────────────
const createRolSchema = z.object({
  rolusr_id: z.number().int().positive().optional(),
  rolusr_nm: z.string().min(1, 'El nombre del rol es requerido').max(30),
  rolusr_ds: z.string().max(255).optional(),
}).strict();

const updateRolSchema = createRolSchema.partial();

// ─────────────────────────────────────────────
// USUARIOS
// ─────────────────────────────────────────────
const createUsuarioSchema = z.object({
  rolusr_id: z.number().int().positive('El ID de rol debe ser un entero positivo'),
  usuari_nm: z.string().min(1, 'El nombre es requerido').max(30),
  usuari_ap: z.string().min(1, 'El apellido es requerido').max(30),
  usuari_cd: z.string().min(1, 'El código de usuario es requerido').max(8),
  usuari_co: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').max(100),
  usuari_em: z.string().email('Correo electrónico inválido').max(100).optional().nullable(),
  usuari_es: z.string().min(1, 'El estado es requerido').max(10),
}).strict();

const updateUsuarioSchema = createUsuarioSchema.omit({ usuari_co: true }).partial();

// ─────────────────────────────────────────────
// TIPOS DE CONTRIBUYENTE
// ─────────────────────────────────────────────
const createTipoContribuyenteSchema = z.object({
  tipcon_nm: z.string().min(1, 'El nombre del tipo es requerido').max(30),
}).strict();

const updateTipoContribuyenteSchema = createTipoContribuyenteSchema.partial();

// ─────────────────────────────────────────────
// CONTRIBUYENTES
// ─────────────────────────────────────────────
const createContribuyenteSchema = z.object({
  tipcon_id: z.number().int().positive('El ID de tipo de contribuyente debe ser positivo'),
  contri_ri: z.string().min(1, 'El RIF/CI es requerido').max(15),
  contri_nr: z.string().min(1, 'El nombre o razón social es requerida').max(50),
  contri_em: z.string().email('Correo electrónico inválido').max(50),
  contri_es: z.string().max(15).default('Activo'),
}).strict();

const updateContribuyenteSchema = createContribuyenteSchema.partial();

// ─────────────────────────────────────────────
// SECTORES
// ─────────────────────────────────────────────
const createSectorSchema = z.object({
  sector_nm: z.string().min(1, 'El nombre del sector es requerido').max(30),
}).strict();

const updateSectorSchema = createSectorSchema.partial();

// ─────────────────────────────────────────────
// CATEGORIAS
// ─────────────────────────────────────────────
const createCategoriaSchema = z.object({
  catego_nm: z.string().min(1, 'El nombre de la categoría es requerido').max(30),
}).strict();

const updateCategoriaSchema = createCategoriaSchema.partial();

// ─────────────────────────────────────────────
// SERVICIOS
// ─────────────────────────────────────────────
const createServicioSchema = z.object({
  catego_id: z.number().int().positive('El ID de categoría debe ser positivo'),
  servic_nm: z.string().min(1, 'El nombre del servicio es requerido').max(30),
  servic_ds: z.string().min(1, 'La descripción del servicio es requerida'),
}).strict();

const updateServicioSchema = createServicioSchema.partial();

// ─────────────────────────────────────────────
// TARIFAS
// ─────────────────────────────────────────────
const createTarifaSchema = z.object({
  servic_id: z.number().int().positive('El ID de servicio debe ser positivo'),
  tarifa_mt: z.number().positive('El monto de la tarifa debe ser mayor a 0'),
  tarifa_fi: isoDateString,
  tarifa_ff: isoDateString.optional().nullable(),
}).strict();

const updateTarifaSchema = createTarifaSchema.partial();

// ─────────────────────────────────────────────
// BANCOS
// ─────────────────────────────────────────────
const createBancoSchema = z.object({
  bancos_nm: z.string().min(1, 'El nombre del banco es requerido').max(30),
}).strict();

const updateBancoSchema = createBancoSchema.partial();

// ─────────────────────────────────────────────
// MÉTODOS DE PAGO
// ─────────────────────────────────────────────
const createMetodoSchema = z.object({
  metodo_nm: z.string().min(1, 'El nombre del método de pago es requerido').max(30),
}).strict();

const updateMetodoSchema = createMetodoSchema.partial();

// ─────────────────────────────────────────────
// DIRECCIONES
// ─────────────────────────────────────────────
const createDireccionSchema = z.object({
  contri_id: z.number().int().positive('El ID de contribuyente debe ser positivo'),
  sector_id: z.number().int().positive('El ID de sector debe ser positivo'),
  direcc_ds: z.string().min(1, 'La descripción de la dirección es requerida').max(100),
  direcc_tp: z.string().min(1, 'El tipo de dirección es requerido').max(20),
}).strict();

const updateDireccionSchema = createDireccionSchema.partial();

// ─────────────────────────────────────────────
// INMUEBLES
// ─────────────────────────────────────────────
const createInmuebleSchema = z.object({
  contri_id: z.number().int().positive('El ID de contribuyente debe ser positivo'),
  inmueb_ct: z.string().min(1, 'El catastro del inmueble es requerido').max(20),
  inmueb_dr: z.string().min(1, 'La dirección del inmueble es requerida').max(100),
  inmueb_tp: z.string().min(1, 'El tipo de inmueble es requerido').max(20),
}).strict();

const updateInmuebleSchema = createInmuebleSchema.partial();

// ─────────────────────────────────────────────
// VEHÍCULOS
// ─────────────────────────────────────────────
const createVehiculoSchema = z.object({
  contri_id: z.number().int().positive('El ID de contribuyente debe ser positivo'),
  vehicu_pl: z.string().min(1, 'La placa del vehículo es requerida').max(10),
  vehicu_mr: z.string().min(1, 'La marca del vehículo es requerida').max(30),
  vehicu_md: z.string().min(1, 'El modelo del vehículo es requerido').max(30),
}).strict();

const updateVehiculoSchema = createVehiculoSchema.partial();

// ─────────────────────────────────────────────
// DEUDAS
// ─────────────────────────────────────────────
const createDeudaSchema = z.object({
  contri_id: z.number().int().positive('El ID de contribuyente debe ser positivo'),
  servic_id: z.number().int().positive('El ID de servicio debe ser positivo'),
  tarifa_id: z.number().int().positive('El ID de tarifa debe ser positivo'),
  deudas_mt: z.number().positive('El monto de la deuda debe ser mayor a 0'),
  deudas_fe: isoDateString,
  deudas_es: z.string().min(1, 'El estado de la deuda es requerido').max(10),
}).strict();

const updateDeudaSchema = createDeudaSchema.partial();

// ─────────────────────────────────────────────
// COBROS
// ─────────────────────────────────────────────
const createCobroSchema = z.object({
  contri_id: z.number().int().positive('El ID de contribuyente debe ser positivo'),
  usuari_id: z.number().int().positive('El ID de usuario debe ser positivo'),
  metodo_id: z.number().int().positive('El ID de método de pago debe ser positivo'),
  bancos_id: z.number().int().positive().optional().nullable(),
  cobros_mt: z.number().positive('El monto del cobro debe ser mayor a 0'),
  cobros_rb: z.string().max(20).optional().nullable(),
  cobros_es: z.string().min(1, 'El estado del cobro es requerido').max(10),
  detalles: z.array(
    z.object({
      deudas_id: z.number().int().positive('El ID de deuda debe ser positivo'),
      detall_mt: z.number().positive('El monto del detalle debe ser mayor a 0'),
    })
  ).optional(),
}).strict();

const updateCobroSchema = createCobroSchema.omit({ detalles: true }).partial();

// ─────────────────────────────────────────────
// DETALLES DE COBROS
// ─────────────────────────────────────────────
const createDetalleCobrosSchema = z.object({
  cobros_id: z.number().int().positive('El ID de cobro debe ser positivo'),
  deudas_id: z.number().int().positive('El ID de deuda debe ser positivo'),
  detall_mt: z.number().positive('El monto del detalle debe ser mayor a 0'),
}).strict();

const updateDetalleCobrosSchema = createDetalleCobrosSchema.partial();

// ─────────────────────────────────────────────
// BITÁCORAS
// ─────────────────────────────────────────────
const createBitacoraSchema = z.object({
  usuari_id: z.number().int().positive('El ID de usuario debe ser positivo'),
  bitaco_ac: z.string().min(1, 'La acción de la bitácora es requerida').max(50),
}).strict();

const updateBitacoraSchema = createBitacoraSchema.partial();

module.exports = {
  // Auth
  loginSchema,
  registerSchema,
  passwordRecoverSchema,
  passwordResetSchema,
  changePasswordSchema,
  updateProfileSchema,
  // Roles
  createRolSchema, updateRolSchema,
  // Usuarios
  createUsuarioSchema, updateUsuarioSchema,
  // Tipos Contribuyente
  createTipoContribuyenteSchema, updateTipoContribuyenteSchema,
  // Contribuyentes
  createContribuyenteSchema, updateContribuyenteSchema,
  // Sectores
  createSectorSchema, updateSectorSchema,
  // Categorias
  createCategoriaSchema, updateCategoriaSchema,
  // Servicios
  createServicioSchema, updateServicioSchema,
  // Tarifas
  createTarifaSchema, updateTarifaSchema,
  // Bancos
  createBancoSchema, updateBancoSchema,
  // Métodos
  createMetodoSchema, updateMetodoSchema,
  // Direcciones
  createDireccionSchema, updateDireccionSchema,
  // Inmuebles
  createInmuebleSchema, updateInmuebleSchema,
  // Vehículos
  createVehiculoSchema, updateVehiculoSchema,
  // Deudas
  createDeudaSchema, updateDeudaSchema,
  // Cobros
  createCobroSchema, updateCobroSchema,
  // Detalles Cobros
  createDetalleCobrosSchema, updateDetalleCobrosSchema,
  // Bitácoras
  createBitacoraSchema, updateBitacoraSchema,
};
