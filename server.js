// Create .env file for the mongodb connection
// require("dotenv").config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const inventoryRoutes = require('./routes/inventoryRoutes'); 
const analyticsRoutes = require('./routes/analyticsRoutes'); 
const salesRoutes = require('./routes/salesRoutes'); 

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve frontend static files from /public
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/v1/forecast/', analyticsRoutes);
app.use('/api/v1/inventory/', inventoryRoutes);
app.use('/api/v1/sales/', salesRoutes);

app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Demand Forecasting Subsystem running on port ${PORT}`);
});
