const express = require('express');
const salesService = require('../services/salesService');

const router = express.Router();

router.get('/', salesService.getSalesData);

module.exports = router;
