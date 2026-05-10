const mongoose = require('mongoose');

const pricingStrategySchema = new mongoose.Schema({
  productId: { 
    type: String, 
    required: true, 
    index: true 
  },
  currentPrice: { 
    type: Number, 
    required: true 
  },
  suggestedPrice: { 
    type: Number, 
    required: true 
  },
  elasticityScore: { 
    type: Number, 
    required: true 
  },
  strategyReason: { 
    type: String,
    required: true
  },
  status: { 
    type: String, 
    enum: ['Pending Approval', 'Applied', 'Rejected'], 
    default: 'Pending Approval' 
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('PricingStrategy', pricingStrategySchema);