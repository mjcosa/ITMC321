const express = require('express');
const inventoryController = require('../controller/inventoryController');
const { validateInventoryId } = require('../validators/inventoryValidators');

const router = express.Router();

router.get('/inventory', inventoryController.getAllInventory);
router.get('/inventory/:id', validateInventoryId, inventoryController.getInventoryById);

module.exports = router;
