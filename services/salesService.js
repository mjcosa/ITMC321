// Fetch past records and customer purchase history
const getPaymentData = async () => {
    console.log("Fetching from Customer & Order Management Subsystem...");
    fetch('https://customer-and-order-mgmt-system-back.vercel.app/api/payments/')
    .then(response => {
        if (!response.ok) { // Check if the response was successful
        throw new Error('Network response was not ok');
        }
        return response.json(); // Parse the JSON body
    })
    .then(data => console.log(data)) // Handle the parsed data
    .catch(error => console.error('Fetch error:', error)); // Handle network/parsing errors
};

const getOrderData = async () => {
    console.log("Fetching from Customer & Order Management Subsystem...");
    fetch('https://customer-and-order-mgmt-system-back.vercel.app/api/orders/')
    .then(response => {
        if (!response.ok) { // Check if the response was successful
        throw new Error('Network response was not ok');
        }
        return response.json(); // Parse the JSON body
    })
    .then(data => console.log(data)) // Handle the parsed data
    .catch(error => console.error('Fetch error:', error)); // Handle network/parsing errors
};


module.exports = {
    getPaymentData,
    getOrderData
};