require('./config/env'); // Validar .env PRIMERO (falla rápido si faltan variables)

const { testConnection } = require('./config/database');
const env = require('./config/env');
const app = require('./app');
const billingJob = require('./jobs/aseoUrbanoBillingJob');

const start = async () => {
  try {
    await testConnection();
    billingJob.start();
  } catch (err) {
    console.error('❌ No se pudo conectar a la base de datos:', err.message);
    process.exit(1);
  }

  app.listen(env.port, () => {
    console.log(`🚀 Servidor SERMAB corriendo en http://localhost:${env.port}`);
    console.log(`📖 Documentación API: http://localhost:${env.port}/api/docs`);
    console.log(`🌍 Entorno: ${env.nodeEnv}`);
  });
};

start();
