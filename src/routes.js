const express = require('express');
const router = express.Router();

router.use('/api/bitacoras', require('./routes/bitacoras'));
router.use('/api/tarifas', require('./routes/tarifas'));
router.use('/api/bancos', require('./routes/bancos'));
router.use('/api/categorias', require('./routes/categorias'));
router.use('/api/contribuyentes', require('./routes/contribuyentes'));
router.use('/api/direcciones', require('./routes/direcciones'));
router.use('/api/inmuebles', require('./routes/inmuebles'));
router.use('/api/metodos', require('./routes/metodos'));
router.use('/api/roles', require('./routes/roles'));
router.use('/api/sectores', require('./routes/sectores'));
router.use('/api/servicios', require('./routes/servicios'));
router.use('/api/tipos-contribuyente', require('./routes/tiposContribuyente'));
router.use('/api/usuarios', require('./routes/usuarios'));
router.use('/api/vehiculos', require('./routes/vehiculos'));
router.use('/api/cobros', require('./routes/cobros'));
router.use('/api/detalles-cobros', require('./routes/detallesCobros'));
router.use('/api/deudas', require('./routes/deudas'));

router.get('/health', (_req, res) => res.json({ status: 'ok' }));

module.exports = router;
