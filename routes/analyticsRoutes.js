const express = require('express');
const forecastController = require('../controller/forecastController');
const router = express.Router();

router.get('/', forecastController.getForecastReport);

module.exports = router;