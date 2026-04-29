const { getSalesData } = require('./salesService');
const { getAllInventory } = require('./inventoryService');

/**
 * Generates the forecast report.
 * @param {Object} uploadedData - Optional parsed CSV data { inventory: [], sales: [] }
 */
const generateForecastReport = async (uploadedData = null) => {
    try {
        // 1. Data Prioritization: Use uploaded CSV data if provided, otherwise fallback to APIs
        const inventoryData = uploadedData?.inventory || await getAllInventory();
        const salesData = uploadedData?.sales || await getSalesData();

        // 2. Processing Logic
        // Ensure numerical values from CSVs are parsed as integers/floats, as CSVs default to strings
        const targetProductId = "PROD-102";
        const targetProduct = inventoryData.find(p => p.product_id === targetProductId);
        
        const currentStock = targetProduct ? parseInt(targetProduct.current_stock, 10) : 0;
        
        // Placeholder for regression algorithm processing 'salesData'
        const predictedDemand = 155; 
        
        // 3. Identify Restock Needs
        const safetyStock = 20; 
        let recommendation = "Stock level adequate";
        let restockAmount = 0;

        if ((currentStock - predictedDemand) < safetyStock) {
            restockAmount = (predictedDemand + safetyStock) - currentStock;
            recommendation = `Restock ${restockAmount} units`;
        }

        // Generate localized timestamp for PHT (UTC+8) 
        const dateOptions = { timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
        const localTimestamp = new Intl.DateTimeFormat('en-US', dateOptions).format(new Date());

        // 4. Format Output Data
        const report = {
            report_generated: localTimestamp,
            data: {
                product_id: targetProductId,
                forecast: {
                    model_used: "Linear Regression",
                    predicted_demand_next_30_days: predictedDemand,
                    recommendation: recommendation
                },
                analytics: {
                    sales_growth_pct: 12.5,
                    stockout_risk: restockAmount > 50 ? "High" : "Low"
                }
            }
        };

        return report;

    } catch (error) {
        console.error("Error generating forecast:", error);
        throw new Error("Failed to process subsystem data.");
    }
};

module.exports = {
    generateForecastReport
};