const forecastingService = require('../services/forecastingService');

const runAutomatedPipeline = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    
    await forecastingService.calculateForecasts();
    
    return res.status(200).json({ success: true, message: 'Pipeline executed successfully' });
  } catch (error) {
    console.error('[VERCEL CRON] Pipeline failed:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  runAutomatedPipeline
};