const { ZodError } = require('zod');

/**
 * Middleware genérico de validación con Zod.
 * Recibe un objeto con esquemas opcionales para body, query y params.
 * Parsea los datos, los sanea y los reasigna al objeto req.
 * Si hay errores, los propaga con next(error).
 *
 * @param {{ body?: ZodSchema, query?: ZodSchema, params?: ZodSchema }} schemas
 * @returns {import('express').RequestHandler}
 */
const validateZod = (schemas = {}) => {
  return (req, res, next) => {
    const errors = [];

    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) {
        errors.push(...result.error.issues.map((issue) => ({
          field: `params.${issue.path.join('.')}`,
          message: issue.message,
        })));
      } else {
        req.params = result.data;
      }
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) {
        errors.push(...result.error.issues.map((issue) => ({
          field: `query.${issue.path.join('.')}`,
          message: issue.message,
        })));
      } else {
        req.query = result.data;
      }
    }

    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) {
        errors.push(...result.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })));
      } else {
        req.body = result.data;
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        message: 'Datos de entrada inválidos',
        errors,
      });
    }

    next();
  };
};

module.exports = { validateZod };
