const { getPaymentData } = require('./services/salesService');

(async () => {
  try {
    const data = await getPaymentData();
    console.log('Payment data:', data);
  } catch (error) {
    console.error('Error:', error.message);
  }
})();