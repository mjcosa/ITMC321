const mongoose = require('mongoose');

const forecastSchema = new mongoose.Schema({
  productId: { 
    type: String, 
    required: true, 
    index: true // Crucial for fast dashboard querying
  },
  productName: { 
    type: String 
  },
  targetPeriod: { 
    type: String, 
    default: 'Next 30 Days' 
  },
  predictedDemand: { 
    type: Number, 
    required: true 
  },
  suggestedRestockQty: { 
    type: Number, 
    required: true 
  },
  stockoutRisk: { 
    type: String, 
    enum: ['Low', 'Medium', 'High'],
    required: true 
  },
  modelUsed: { 
    type: String, 
    required: true 
  },
  graphData: [{
    date: { type: String },
    historical_sales: { type: Number }
  }]
}, { 
  timestamps: true // Automatically creates 'createdAt' and 'updatedAt'
});

module.exports = mongoose.model('Forecast', forecastSchema);