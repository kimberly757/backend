const express = require('express');
const controller = require('../controllers/cobros.controller');
const { validateZod } = require('../middlewares/validateZod');
const { createCobroSchema, updateCobroSchema } = require('../validators/domainSchemas');
const { requireAuth, requireAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/cierre', requireAuth, controller.cierreDiario);
router.get('/', requireAuth, controller.list);
router.get('/:id', requireAuth, controller.getById);
router.post('/', requireAuth, validateZod({ body: createCobroSchema }), controller.create);
router.put('/:id', requireAuth, validateZod({ body: updateCobroSchema }), controller.update);
router.delete('/:id', requireAuth, requireAdmin, controller.remove);

module.exports = router;
