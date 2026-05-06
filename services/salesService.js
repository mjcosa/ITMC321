// Fetch past records and customer purchase history
const getPaymentData = async () => {
    console.log("Fetching from Customer & Order Management Subsystem...");
    const response = await fetch('https://customer-and-order-mgmt-system-back.vercel.app/api/payments')
    if (!response.ok) {
    throw new Error(`Upstream service returned ${response.status}`);
  }

  return response.json();
};

const getOrderData = async () => {
    console.log("Fetching from Customer & Order Management Subsystem...");
    const response = await fetch('https://customer-and-order-mgmt-system-back.vercel.app/api/orders')
    if (!response.ok) {
        throw new Error(`Upstream service returned ${response.status}`);
    }

    return response.json();
};


module.exports = {
    getPaymentData,
    getOrderData
};