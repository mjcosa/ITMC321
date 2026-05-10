const inventoryService = require('../services/inventoryService');

const getAllInventory = async (req, res) => {
  try {
    const inventory = await inventoryService.getAllInventory();
    return res.status(200).json(inventory);
  } catch (error) {
    return res.status(502).json({ message: 'Failed to fetch inventory from upstream service', error: error.message });
  }
};

const getInventoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await inventoryService.getInventoryById(id);

    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    return res.status(200).json(item);
  } catch (error) {
    return res.status(502).json({ message: 'Failed to fetch inventory item from upstream service', error: error.message });
  }
};

module.exports = {
  getAllInventory,
  getInventoryById,
};
