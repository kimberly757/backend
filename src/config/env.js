const Joi = require('joi');
require('dotenv').config();

const envSchema = Joi.object({
  PORT: Joi.number().default(3000),
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),

  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_NAME: Joi.string().required(),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),

  JWT_SECRET: Joi.string().min(16).required(),
  JWT_EXPIRES_IN: Joi.string().default('24h'),

  EMAIL_TRANSPORT: Joi.string().valid('log', 'smtp', 'emailjs').default('log'),
  SMTP_HOST: Joi.string().when('EMAIL_TRANSPORT', { is: 'smtp', then: Joi.required(), otherwise: Joi.optional() }),
  SMTP_PORT: Joi.number().when('EMAIL_TRANSPORT', { is: 'smtp', then: Joi.required(), otherwise: Joi.optional() }),
  SMTP_USER: Joi.string().allow('').optional(),
  SMTP_PASS: Joi.string().allow('').optional(),
  EMAILJS_SERVICE_ID: Joi.string().allow('').optional(),
  EMAILJS_TEMPLATE_ID: Joi.string().allow('').optional(),
  EMAILJS_PUBLIC_KEY: Joi.string().allow('').optional(),
  EMAILJS_PRIVATE_KEY: Joi.string().allow('').optional(),

  FRONTEND_URL: Joi.string().uri().default('http://localhost:5173'),
}).unknown(true);

const { error, value } = envSchema.validate(process.env, { abortEarly: false });

if (error) {
  console.error('❌ Error de configuración de variables de entorno:');
  error.details.forEach((d) => console.error(`   • ${d.message}`));
  process.exit(1);
}

module.exports = {
  port: value.PORT,
  nodeEnv: value.NODE_ENV,
  db: {
    host: value.DB_HOST,
    port: value.DB_PORT,
    name: value.DB_NAME,
    user: value.DB_USER,
    password: value.DB_PASSWORD,
  },
  jwt: {
    secret: value.JWT_SECRET,
    expiresIn: value.JWT_EXPIRES_IN,
  },
  email: {
    transport: value.EMAIL_TRANSPORT,
    smtp: {
      host: value.SMTP_HOST,
      port: value.SMTP_PORT,
      user: value.SMTP_USER,
      pass: value.SMTP_PASS,
    },
    emailjs: {
      serviceId: value.EMAILJS_SERVICE_ID,
      templateId: value.EMAILJS_TEMPLATE_ID,
      publicKey: value.EMAILJS_PUBLIC_KEY,
      privateKey: value.EMAILJS_PRIVATE_KEY,
    },
  },
  frontendUrl: value.FRONTEND_URL,
};
