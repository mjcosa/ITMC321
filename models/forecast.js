const mongoose = require('mongoose');

const forecastSchema = new mongoose.Schema({
  productId: { 
    type: String, 
    required: true, 
    index: true 
  },
  productName: { type: String },
  targetPeriod: { type: String, default: 'Next 30 Days' },
  predictedDemand: { type: Number, required: true },
  suggestedRestockQty: { type: Number, required: true },
  stockoutRisk: { 
    type: String, 
    enum: ['Low', 'Medium', 'High'], 
    required: true 
  },
  modelUsed: { type: String, required: true },

  forecastRecommendation: { type: String, default: '' },
  suggestedPrice: { type: Number },
  pricingReason: { type: String, default: '' },
  totalHistoricalSales: { type: Number, default: 0 },

  salesHistory: {
    daily: { type: Map, of: Number, default: {} },
    weekly: { type: Map, of: Number, default: {} },
    monthly: { type: Map, of: Number, default: {} }
  },


  graphData: [{
    date: { type: String },
    historical_sales: { type: Number }
  }]
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Forecast', forecastSchema);