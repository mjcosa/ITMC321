const { generateForecastReport } = require('../services/forecastingService');

const getForecastReport = async (req, res) => {
  try {
    const report = await generateForecastReport();
    return res.status(200).json(report);
  } catch (error) {
    console.error('Forecast controller error:', error);
    return res.status(502).json({
      message: 'Failed to generate forecast report',
      error: error.message,
    });
  }
};

module.exports = {
  getForecastReport,
};
