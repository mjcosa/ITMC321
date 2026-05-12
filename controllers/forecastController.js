const forecastingService = require('../services/forecastingService');
const { parseCSVBuffer } = require('../utils/csvHelper'); 

// Fetches from APIs
const getForecastReport = async (req, res) => {
  try {
    const forecastData = await forecastingService.calculateForecasts(); 
    res.status(200).json({ success: true, data: forecastData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 2. The Manual Upload Method (Your CSV code)
const uploadForecastData = async (req, res) => {
  try {
    const files = req.files;
    let uploadedData = { inventory: null, sales: null };

    if (files && files['inventory_file']) {
      uploadedData.inventory = await parseCSVBuffer(files['inventory_file'][0].buffer);
    }
    if (files && files['sales_file']) {
      uploadedData.sales = await parseCSVBuffer(files['sales_file'][0].buffer);
    }

    // Passes the parsed CSV data to the exact same ETL pipeline
    const forecastData = await forecastingService.calculateForecasts(uploadedData);
    
    res.status(200).json({ success: true, message: "CSV processed.", data: forecastData });
  } catch (error) {
    console.error("CSV Processing Error:", error);
    res.status(400).json({ success: false, message: "Failed to parse CSV." });
  }
};

const fetchStoredForecasts = async (req, res) => {
  try {
    const { productId } = req.query;
    
    let filters = {};
    if (productId) filters.productId = productId;

    const forecasts = await forecastingService.getStoredForecasts(filters);

    return res.status(200).json({
      success: true,
      count: forecasts.length,
      data: forecasts
    });

  } catch (error) {
    console.error('Error fetching stored forecasts:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch forecasts from database.',
      error: error.message
    });
  }
};

module.exports = {
  getForecastReport,
  uploadForecastData,
  fetchStoredForecasts,
};