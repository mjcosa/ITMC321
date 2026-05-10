// Fetch product availability and current stock levels
const getAllInventory = async () => {
  const response = await fetch(`${process.env.INVENTORY_URI}/api/inventory`);

  if (!response.ok) {
    throw new Error(`Upstream service returned ${response.status}`);
  }

  return response.json();
};

// Get inventory by id logic
/* const getInventorybyId = async () => {
  const response = await fetch(`https://inventory-subsystem-api.onrender.com/api/inventory`);

  if (!response.ok) {
    throw new Error(`Upstream service returned ${response.status}`);
  }

  return response.json();
}; */

module.exports = {
  getAllInventory,
};
