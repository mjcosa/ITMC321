const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const path = require('path');
const inventoryRoutes = require('./routes/inventoryRoutes'); 
const analyticsRoutes = require('./routes/analyticsRoutes'); 
const salesRoutes = require('./routes/salesRoutes'); 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();
app.use(cors());
app.use(express.json());

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
