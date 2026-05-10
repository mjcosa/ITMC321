const express = require('express');
const cronController = require('../controllers/cronController');

const router = express.Router();
// This creates the endpoint: GET /api/forecasts/cron
router.get('/cron', cronController.runAutomatedPipeline);

module.exports = router;