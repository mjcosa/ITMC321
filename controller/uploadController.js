const { generateForecastReport } = require('../services/forecastingService');
const { parseCSVBuffer } = require('../utils/csvHelper');

/**
 * Handles the uploading and processing of inventory and sales CSV data.
 */
const uploadForecastData = async (req, res) => {
    try {
        const files = req.files;
        let uploadedData = { inventory: null, sales: null };

        // Process Inventory CSV if uploaded
        if (files && files['inventory_file']) {
            uploadedData.inventory = await parseCSVBuffer(files['inventory_file'][0].buffer);
        }

        // Process Sales CSV if uploaded
        if (files && files['sales_file']) {
            uploadedData.sales = await parseCSVBuffer(files['sales_file'][0].buffer);
        }

        // Execute processing logic with the injected CSV data
        const forecastReport = await generateForecastReport(uploadedData);
        
        res.status(200).json({
            message: "CSV data successfully processed.",
            report: forecastReport
        });

    } catch (error) {
        console.error("CSV Processing Error:", error);
        res.status(400).json({ 
            error: "Bad Request", 
            message: "Failed to parse CSV files. Ensure they are correctly formatted." 
        });
    }
};

module.exports = {
    uploadForecastData
};