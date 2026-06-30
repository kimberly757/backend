const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'SERMAB API' });
});

router.use('/auth',            require('./auth'));
router.use('/roles',           require('./roles'));
router.use('/usuarios',        require('./usuarios'));
router.use('/tipos-contribuyente', require('./tiposContribuyente'));
router.use('/contribuyentes',  require('./contribuyentes'));
router.use('/sectores',        require('./sectores'));
router.use('/categorias',      require('./categorias'));
router.use('/servicios',       require('./servicios'));
router.use('/tarifas',         require('./tarifas'));
router.use('/bancos',          require('./bancos'));
router.use('/metodos',         require('./metodos'));
router.use('/direcciones',     require('./direcciones'));
router.use('/inmuebles',       require('./inmuebles'));
router.use('/vehiculos',       require('./vehiculos'));
router.use('/deudas',          require('./deudas'));
router.use('/cobros',          require('./cobros'));
router.use('/detalles-cobros', require('./detallesCobros'));
router.use('/bitacoras',       require('./bitacoras'));

module.exports = router;
