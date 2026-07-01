const express = require('express');
const { generateAseoUrbanoDebts } = require('../jobs/aseoUrbanoBillingJob');

const router = express.Router();

router.post('/run-aseo-billing', async (req, res, next) => {
  try {
    const targetDate = req.body.fecha ? new Date(req.body.fecha) : new Date();
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({ error: 'La fecha proporcionada no es válida' });
    }
    const result = await generateAseoUrbanoDebts(targetDate);
    res.json({
      message: 'Proceso de facturación manual ejecutado con éxito',
      ...result
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
