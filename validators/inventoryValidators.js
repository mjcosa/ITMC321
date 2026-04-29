const validateInventoryId = (req, res, next) => {
  const { id } = req.params;

  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    return res.status(400).json({ message: 'Inventory ID is required and must be a non-empty string.' });
  }

  return next();
};

module.exports = {
  validateInventoryId,
};
