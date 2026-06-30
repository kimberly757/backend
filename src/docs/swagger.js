const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const env = require('../config/env');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SERMAB API',
      version: '1.0.0',
      description:
        'API REST del Sistema SERMAB para gestión de contribuyentes, cobros y servicios municipales.',
      contact: {
        name: 'SERMAB Dev Team',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.port}/api`,
        description: 'Servidor de desarrollo',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtenido al hacer login en /api/auth/login',
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Token ausente o inválido',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                  errors: { type: 'array', items: {} },
                },
              },
            },
          },
        },
        ValidationError: {
          description: 'Datos de entrada inválidos',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string', example: 'Datos de entrada inválidos' },
                  errors: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        field: { type: 'string' },
                        message: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        NotFoundError: {
          description: 'Recurso no encontrado',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                  errors: { type: 'array', items: {} },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerSpec, swaggerUi };
