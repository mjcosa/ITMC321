const express = require('express');
const salesController = require('../controllers/salesController');

const router = express.Router();

router.get('/payments', salesController.getPayments);
router.get('/orders', salesController.getOrders);

module.exports = router;
