const express = require('express');
const salesService = require('../services/salesService');

const router = express.Router();

router.get('/payments', salesService.getPaymentData);
router.get('/order', salesService.getOrderData);

module.exports = router;
