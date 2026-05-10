const express = require('express');
const multer = require('multer');
const forecastingController = require('../controllers/forecastController');

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.get('/generate-report', forecastingController.getForecastReport);

// 2. Manual CSV Upload Route (Admin Fallback)
router.post('/upload-report', upload.fields([
    { name: 'inventory_file', maxCount: 1 },
    { name: 'sales_file', maxCount: 1 }
]), forecastingController.uploadForecastData);

module.exports = router;