const express = require('express');
const router = express.Router();
const pricingController = require('../controllers/pricingController');

router.get('/recommendations', pricingController.fetchPricingRecommendations);

module.exports = router;