const pricingService = require('../services/pricingService');

const fetchPricingRecommendations = async (req, res) => {
  try {
    // Extract optional query parameters from the URL
    const { status, productId } = req.query;
    
    // Build a filter object based on what the external system requested
    let filters = {};
    if (status) filters.status = status;
    if (productId) filters.productId = productId;

    const recommendations = await pricingService.getPricingRecommendations(filters);

    return res.status(200).json({
      success: true,
      count: recommendations.length,
      data: recommendations
    });

  } catch (error) {
    console.error('Error in Pricing Controller:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch pricing recommendations.',
      error: error.message
    });
  }
};

module.exports = {
  fetchPricingRecommendations,
};