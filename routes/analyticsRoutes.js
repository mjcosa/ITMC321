const express = require('express');
const { generateForecastReport } = require('../services/forecastingService');
const router = express.Router();

router.get('/', generateForecastReport);

module.exports = router;