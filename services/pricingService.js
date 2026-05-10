const PricingStrategy = require('../models/pricing');

const getPricingRecommendations = async (filters = {}) => {
  const pricingData = await PricingStrategy.find(filters).sort({ createdAt: -1 });
  return pricingData;
};

module.exports = {
  getPricingRecommendations,
};