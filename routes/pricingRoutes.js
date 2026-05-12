const express = require('express');
const router = express.Router();
const pricingController = require('../controllers/pricingController');
const { protect, authorize } = require('../middleware/authMiddleware');

const { verifyApiKey } = require('../middleware/apiAuthMiddleware');

router.get('/recommendations', verifyApiKey, pricingController.fetchPricingRecommendations);

module.exports = router;