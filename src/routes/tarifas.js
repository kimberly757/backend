const express = require('express');
const controller = require('../controllers/tarifas.controller');
const { requireAuth, requireAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', requireAuth, controller.list);
router.get('/:id', requireAuth, controller.getById);
router.post('/', requireAuth, requireAdmin, controller.create);
router.put('/:id', requireAuth, requireAdmin, controller.update);
router.delete('/:id', requireAuth, requireAdmin, controller.remove);

module.exports = router;
