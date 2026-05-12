const express = require('express');
const cronController = require('../controllers/cronController');

const router = express.Router();
router.get('/', cronController.runAutomatedPipeline);

module.exports = router;
