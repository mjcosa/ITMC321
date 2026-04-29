const INVENTORY_API_URL = process.env.INVENTORY_API_URL;

if (!INVENTORY_API_URL) {
  throw new Error('Missing required environment variable INVENTORY_API_URL');
}

const getAllInventory = async () => {
  const response = await fetch(`${INVENTORY_API_URL}/inventory`);

  if (!response.ok) {
    throw new Error(`Upstream service returned ${response.status}`);
  }

  return response.json();
};

const getInventoryById = async (id) => {
  const response = await fetch(`${INVENTORY_API_URL}/inventory/${encodeURIComponent(id)}`);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Upstream service returned ${response.status}`);
  }

  return response.json();
};

module.exports = {
  getAllInventory,
  getInventoryById,
};
