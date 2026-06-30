const { z } = require('zod');

/**
 * Parámetro de ruta numérico entero positivo.
 * Uso: validateZod({ params: numericIdParam })
 */
const numericIdParam = z.object({
  id: z.coerce.number({
    invalid_type_error: 'El ID debe ser un número entero positivo',
  }).int('El ID debe ser un entero').positive('El ID debe ser mayor a 0'),
});

/**
 * Esquema de paginación básica para query params.
 */
const paginationQuery = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
}).partial();

/**
 * Validador de fecha en formato ISO YYYY-MM-DD.
 */
const isoDateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe estar en formato YYYY-MM-DD');

module.exports = { numericIdParam, paginationQuery, isoDateString };
