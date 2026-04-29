const express = require('express');
const multer = require('multer');
const { uploadForecastData } = require('../controllers/analyticsController');

const router = express.Router();

// Configure Multer for in-memory file storage
const upload = multer({ storage: multer.memoryStorage() });

/**
 * POST /api/analytics/forecast/upload
 * Route definition mapped to the controller function
 */
router.post(
    '/forecast/upload', 
    upload.fields([
        { name: 'inventory_file', maxCount: 1 },
        { name: 'sales_file', maxCount: 1 }
    ]), 
    uploadForecastData
);

module.exports = router;