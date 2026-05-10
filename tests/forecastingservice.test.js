const mongoose = require('mongoose');
require('dotenv').config(); // 1. LOAD ENV VARIABLES
const { calculateForecasts } = require('../services/forecastingService');
const Forecast = require('../models/forecast');
const PricingStrategy = require('../models/pricing');

// Mock Data representing what would normally come from your CSVs or APIs
const mockUploadedData = {
  inventory: [
    { productId: 'PROD-A', productName: 'Scarcity Item', currentStock: 10, price: 100 }, // Will trigger +5% price
    { productId: 'PROD-B', productName: 'Overstocked Item', currentStock: 500, price: 50 }, // Will trigger -10% price
    { productId: 'PROD-C', productName: 'Balanced Item', currentStock: 30, price: 20 }  // Will trigger NO price change
  ],
  sales: [
    // PROD-A has high sales (Baseline 40 -> Predicts 44)
    { productId: 'PROD-A', quantity: 20, date: '2023-10-01' },
    { productId: 'PROD-A', quantity: 20, date: '2023-10-02' },
    // PROD-B has low sales (Baseline 10 -> Predicts 11)
    { productId: 'PROD-B', quantity: 5, date: '2023-10-01' },
    { productId: 'PROD-B', quantity: 5, date: '2023-10-02' },
    // PROD-C has balanced sales (Baseline 10 -> Predicts 11)
    { productId: 'PROD-C', quantity: 10, date: '2023-10-01' }
  ]
};

describe('Forecasting & Pricing ETL Pipeline', () => {
  
  // 2. INCREASE JEST TIMEOUT TO 30 SECONDS
  jest.setTimeout(30000); 

  beforeAll(async () => {
    // Jest will now correctly read your Atlas URI from the .env file
    const TEST_DB_URI = process.env.TEST_MONGO_URI || 'mongodb://localhost:27017/ForecastingApp_TEST';
    
    // Add connection options to prevent hanging
    await mongoose.connect(TEST_DB_URI, {
      serverSelectionTimeoutMS: 10000, // Stop trying after 10 seconds instead of hanging forever
    });
  });

  beforeEach(async () => {
    await Forecast.deleteMany({});
    await PricingStrategy.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  it('should successfully compute forecasts, generate pricing, and save to MongoDB', async () => {
    
    // EXECUTE THE SERVICE
    const result = await calculateForecasts(mockUploadedData);

    // --- ASSERTIONS: CHECK THE RETURNED JSON ARRAY ---
    expect(result).toBeDefined();
    expect(result.length).toBe(3); // We passed in 3 products

    // Find our specific products in the result array
    const prodA = result.find(r => r.product_id === 'PROD-A');
    const prodB = result.find(r => r.product_id === 'PROD-B');
    const prodC = result.find(r => r.product_id === 'PROD-C');

    // Test Math Logic: PROD-A (Scarcity)
    expect(prodA.forecast.predicted_demand_next_30_days).toBe(44); // 40 * 1.1
    expect(prodA.forecast.suggested_restock_qty).toBe(54); // (44 predict + 20 safety) - 10 stock
    expect(prodA.analytics.stockout_risk).toBe('High');
    expect(prodA.pricing.suggested_price).toBe(105); // 100 * 1.05

    // Test Math Logic: PROD-B (Overstock)
    expect(prodB.forecast.suggested_restock_qty).toBe(0); // 500 stock is plenty
    expect(prodB.pricing.suggested_price).toBe(45); // 50 * 0.90

    // Test Math Logic: PROD-C (Balanced)
    expect(prodC.pricing.suggested_price).toBe(20); // Unchanged


    // --- ASSERTIONS: CHECK THE ACTUAL MONGODB ---
    const savedForecasts = await Forecast.find({});
    const savedPricing = await PricingStrategy.find({});

    // Verify Forecasts were saved
    expect(savedForecasts.length).toBe(3); // All 3 products get a forecast
    expect(savedForecasts[0].graphData.length).toBeGreaterThan(0); // Ensure graph arrays saved

    // Verify Pricing Strategies were saved conditionally
    // PROD-C had no price change, so only A and B should be saved!
    expect(savedPricing.length).toBe(2); 
    
    const scarcityPricingRecord = savedPricing.find(p => p.productId === 'PROD-A');
    expect(scarcityPricingRecord.status).toBe('Pending Approval');
    expect(scarcityPricingRecord.elasticityScore).toBe(0.8);
  });
});