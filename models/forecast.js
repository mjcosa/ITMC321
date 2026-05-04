const mongoose = require('mongoose');

const forecastSchema = new mongoose.Schema(
  {
    report_generated: Date,
    data: {
        product_id: String,
    forecast: {
      model_used: String,
      predicted_demand_next_30_days: [Number],
      recommendation: String,
    },
    analytics: {
      sales_growth_pct: Number,
      stockout_risk: String,
    },
  },
});

module.exports = mongoose.model('Forecast', forecastSchema);
