const categoryModel = require('../models/categoryModel');
const itemModel = require('../models/itemModel');
const { v4: uuid } = require('uuid');

const listCategories = async (req, res) => {
  try {
    const categories = await categoryModel.getAllCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createCategory = async (req, res) => {
  const { name, color, icon } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Category name is required' });
  }

  try {
    // Check if category with the same name already exists (case-insensitive)
    const existingCategory = await categoryModel.getCategoryByName(name);
    if (existingCategory) {
      return res.status(409).json({ message: 'Category with this name already exists' });
    }

    const id = uuid();
    const category = await categoryModel.createCategory({
      id,
      name,
      color,
      icon,
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, color, icon } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'Category ID is required' });
  }

  if (!name && !color && !icon) {
    return res.status(400).json({ message: 'At least one field (name, color, or icon) is required for update' });
  }

  try {
    const existingCategory = await categoryModel.getCategoryById(id);
    if (!existingCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check for duplicate name if name is being updated
    if (name && name !== existingCategory.name) {
      const duplicateCategory = await categoryModel.getCategoryByName(name);
      if (duplicateCategory) {
        return res.status(409).json({ message: 'Category with this name already exists' });
      }
    }

    const category = await categoryModel.updateCategory(id, { name, color, icon });

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteCategory = async (req, res) => {
  const { id } = req.params;
  const { force } = req.query;

  if (!id) {
    return res.status(400).json({ message: 'Category ID is required' });
  }

  try {
    const existingCategory = await categoryModel.getCategoryById(id);
    if (!existingCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const dependentItems = await categoryModel.getDependentItems(id);

    if (dependentItems.length > 0 && force !== 'true') {
      return res.status(409).json({
        success: false,
        message: 'Category has dependent items. Use ?force=true to delete.',
        dependentItems,
      });
    }

    // Clear categoryId from dependent items
    await itemModel.clearCategoryFromItems(id);

    const changes = await categoryModel.deleteCategory(id);

    if (changes.changes === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const listItemsByCategory = async (req, res) => {
  const { categoryId } = req.params;

  if (!categoryId) {
    return res.status(400).json({ message: 'Category ID is required' });
  }

  try {
    const items = await itemModel.getItemsByCategoryId(categoryId);
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  listItemsByCategory,
};