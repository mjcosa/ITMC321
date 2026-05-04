const express = require('express');
const salesService = require('../services/salesService');

const router = express.Router();

router.get('/', salesService.getPaymentData);
router.get('/', salesService.getOrderData);

module.exports = router;
