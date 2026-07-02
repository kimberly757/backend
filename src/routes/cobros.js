const express = require('express');
const controller = require('../controllers/cobros.controller');
const { validateZod } = require('../middlewares/validateZod');
const { createCobroSchema, updateCobroSchema } = require('../validators/domainSchemas');

const router = express.Router();

router.get('/', controller.list);
router.get('/:id', controller.getById);
router.post('/', validateZod({ body: createCobroSchema }), controller.create);
router.put('/:id', validateZod({ body: updateCobroSchema }), controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
