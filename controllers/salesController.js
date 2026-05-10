const salesService = require('../services/salesService');

const getPayments = async (req, res) => {
    try {
        const data = await salesService.getPaymentData();
        res.json(data);
    } catch (error) {
        console.error('Error fetching payment data:', error.message);
        res.status(500).json({ error: 'Failed to fetch payment data' });
    }
};

const getOrders = async (req, res) => {
    try {
        const data = await salesService.getOrderData();
        res.json(data);
    } catch (error) {
        console.error('Error fetching order data:', error.message);
        res.status(500).json({ error: 'Failed to fetch order data' });
    }
};

module.exports = {
    getPayments,
    getOrders
};