const itemModel = require('../models/itemModel');
const { v4: uuidv4 } = require('uuid');

const listItems = (req, res) => {
  const items = itemModel.getItems();
  res.json(items);
};

const listLowStockItems = (req, res) => {
  const items = itemModel.getLowStockItems();
  res.json(items);
};

const createItem = (req, res) => {
  const { name, categoryId, quantity, minThreshold, price } = req.body;

  if (!name || quantity === undefined || minThreshold === undefined || price === undefined) {
    return res.status(400).json({ message: 'Missing required fields: name, quantity, minThreshold, price' });
  }

  const id = uuidv4();
  const item = itemModel.createItem({
    id,
    name,
    categoryId,
    quantity,
    minThreshold,
    price,
  });
  res.status(201).json(item);
};

const updateItem = (req, res) => {
  const { id } = req.params;
  const { name, categoryId, quantity, minThreshold, price, delta } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'Item ID is required' });
  }

  let fieldsToUpdate = { name, categoryId, quantity, minThreshold, price };

  if (delta !== undefined) {
    const existingItem = itemModel.getItemById(id);
    if (!existingItem) {
      return res.status(404).json({ message: 'Item not found' });
    }
    fieldsToUpdate.quantity = existingItem.quantity + delta;
  }

  const item = itemModel.updateItem(id, fieldsToUpdate);

  if (!item) {
    return res.status(404).json({ message: 'Item not found' });
  }

  res.json({
    message: 'Stock updated successfully',
    item,
  });
};

const deleteItem = (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: 'Item ID is required' });
  }

  const changes = itemModel.deleteItem(id);

  if (changes.changes === 0) {
    return res.status(404).json({ message: 'Item not found' });
  }

  res.json({ success: true });
};

module.exports = {
  listItems,
  listLowStockItems,
  createItem,
  updateItem,
  deleteItem,
};
