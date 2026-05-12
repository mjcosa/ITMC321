/**
 * Middleware to protect routes accessed by external subsystems via API Key
 */
const verifyApiKey = (req, res, next) => {
  // Get the key from the custom header
  const apiKey = req.headers['x-api-key'];

  // Check key if it matches the local API key
  if (!apiKey || apiKey !== process.env.INVENTORY_API_KEY) {
    console.warn(`🚨 Blocked unauthorized M2M request from IP: ${req.ip}`);
    return res.status(401).json({ 
      success: false, 
      message: 'Unauthorized: Invalid or missing API Key' 
    });
  }

  next();
};

module.exports = { verifyApiKey };