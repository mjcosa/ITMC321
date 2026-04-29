// Fetch product availability and current stock levels
const getAllInventory = async () => {
  const response = await fetch(`//inventory`);

  if (!response.ok) {
    throw new Error(`Upstream service returned ${response.status}`);
  }

  return response.json();
};

module.exports = {
  getAllInventory,
};
