const itemModel = require('../models/itemModel');
const { v4: uuid } = require('uuid');

const listItems = async (req, res) => {
  try {
    const items = await itemModel.getItems();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const listLowStockItems = async (req, res) => {
  try {
    const items = await itemModel.getLowStockItems();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createItem = async (req, res) => {
  const { name, categoryId, quantity, minThreshold, price } = req.body;

  if (!name || quantity === undefined || minThreshold === undefined || price === undefined) {
    return res.status(400).json({ message: 'Missing required fields: name, quantity, minThreshold, price' });
  }

  try {
    const id = uuid();
    const item = await itemModel.createItem({
      id,
      name,
      categoryId,
      quantity,
      minThreshold,
      price,
    });
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateItem = async (req, res) => {
  const { id } = req.params;
  const { name, categoryId, quantity, minThreshold, price, delta } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'Item ID is required' });
  }

  try {
    let fieldsToUpdate = { name, categoryId, quantity, minThreshold, price };

    if (delta !== undefined) {
      const existingItem = await itemModel.getItemById(id);
      if (!existingItem) {
        return res.status(404).json({ message: 'Item not found' });
      }
      fieldsToUpdate.quantity = existingItem.quantity + delta;
    }

    const item = await itemModel.updateItem(id, fieldsToUpdate);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json({
      message: 'Stock updated successfully',
      item,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteItem = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: 'Item ID is required' });
  }

  try {
    const changes = await itemModel.deleteItem(id);

    if (changes.changes === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  listItems,
  listLowStockItems,
  createItem,
  updateItem,
  deleteItem,
};