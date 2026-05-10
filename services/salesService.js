// Fetch past records and customer purchase history
const getPaymentData = async () => {
    console.log("Fetching from Customer & Order Management Subsystem...");
    const response = await fetch(`${process.env.SALES_URI}/api/payments`)

    if (!response.ok) {
    throw new Error(`Upstream service returned ${response.status}`);
  }

  return response.json();
};

const getOrderData = async () => {
    console.log("Fetching from Customer & Order Management Subsystem...");
    const response = await fetch(`${process.env.SALES_URI}/api/orders`)

    if (!response.ok) {
        throw new Error(`Upstream service returned ${response.status}`);
    }

    return response.json();
};

const getSalesData = async () => {
    return getOrderData();
};

module.exports = {
    getPaymentData,
    getOrderData,
    getSalesData
};