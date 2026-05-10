const express = require('express');
const cronController = require('../controllers/cronController');

const router = express.Router();
router.get('/cron', cronController.runAutomatedPipeline);

module.exports = router;