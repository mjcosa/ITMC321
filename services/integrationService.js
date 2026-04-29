/**
 * integrationService.js
 * Handles data fetching from external internal subsystems.
 */

// Fetch product availability and current stock levels
const getInventoryData = async () => {
    console.log("[Integration] Fetching from Inventory Management Subsystem...");
    // TODO: Implement API call (e.g., axios.get('http://inventory-subsystem/api/stocks'))
    return [
        { product_id: "PROD-102", current_stock: 45, lead_time_days: 7 },
        { product_id: "PROD-103", current_stock: 12, lead_time_days: 14 }
    ];
};

// Fetch past records and customer purchase history
const getSalesData = async () => {
    console.log("[Integration] Fetching from Customer & Order Management Subsystem...");
    fetch('/api/v1/sales')
    .then(response => {
        if (!response.ok) { // Check if the response was successful
        throw new Error('Network response was not ok');
        }
        return response.json(); // Parse the JSON body
    })
    .then(data => console.log(data)) // Handle the parsed data
    .catch(error => console.error('Fetch error:', error)); // Handle network/parsing errors
};

module.exports = {
    getInventoryData,
    getSalesData,
};