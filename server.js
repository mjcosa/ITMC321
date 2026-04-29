// Create .env file for the mongodb connection
// require("dotenv").config();

const express = require('express');
const cors = require('cors');
const inventoryRoutes = require('./routes/inventoryRoutes'); // Import the router
const analyticsRoutes = require('./routes/analyticsRoutes'); // Import the router
const salesRoutes = require('./routes/salesRoutes'); // Import the router

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Mount the analytics router
// All routes inside analyticsRoutes will now be prefixed with '/api/analytics'
app.use('/api/v1/analytics/forecast/', analyticsRoutes);
app.use('/api/v1/analytics/inventory/', inventoryRoutes);
app.use('/api/v1/analytics/sales/', salesRoutes);

app.listen(PORT, () => {
    console.log(`Demand Forecasting Subsystem running on port ${PORT}`);
});