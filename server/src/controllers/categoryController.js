const categoryModel = require('../models/categoryModel');
const itemModel = require('../models/itemModel');
const { uuid } = require('uuidv4');

const listCategories = (req, res) => {
  const categories = categoryModel.getAllCategories();
  res.json(categories);
};

const createCategory = (req, res) => {
  const { name, color, icon } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Category name is required' });
  }

  // Check if category with the same name already exists (case-insensitive)
  if (categoryModel.getCategoryByName(name)) {
    return res.status(409).json({ message: 'Category with this name already exists' });
  }

  const id = uuidv4();
  const category = categoryModel.createCategory({
    id,
    name,
    color,
    icon,
  });
  res.status(201).json(category);
};

const updateCategory = (req, res) => {
  const { id } = req.params;
  const { name, color, icon } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'Category ID is required' });
  }

  if (!name && !color && !icon) {
    return res.status(400).json({ message: 'At least one field (name, color, or icon) is required for update' });
  }

  const existingCategory = categoryModel.getCategoryById(id);
  if (!existingCategory) {
    return res.status(404).json({ message: 'Category not found' });
  }

  // Check for duplicate name if name is being updated
  if (name && name !== existingCategory.name && categoryModel.getCategoryByName(name)) {
    return res.status(409).json({ message: 'Category with this name already exists' });
  }

  const category = categoryModel.updateCategory(id, { name, color, icon });

  res.json(category);
};

const deleteCategory = (req, res) => {
  const { id } = req.params;
  const { force } = req.query;

  if (!id) {
    return res.status(400).json({ message: 'Category ID is required' });
  }

  const existingCategory = categoryModel.getCategoryById(id);
  if (!existingCategory) {
    return res.status(404).json({ message: 'Category not found' });
  }

  const dependentItems = categoryModel.getDependentItems(id);

  if (dependentItems.length > 0 && force !== 'true') {
    return res.status(409).json({
      success: false,
      message: 'Category has dependent items. Use ?force=true to delete.',
      dependentItems,
    });
  }

  // Clear categoryId from dependent items
  itemModel.clearCategoryFromItems(id);

  const changes = categoryModel.deleteCategory(id);

  if (changes.changes === 0) {
    return res.status(404).json({ message: 'Category not found' });
  }

  res.json({ success: true });
};

const listItemsByCategory = (req, res) => {
  const { categoryId } = req.params;

  if (!categoryId) {
    return res.status(400).json({ message: 'Category ID is required' });
  }

  const items = itemModel.getItemsByCategoryId(categoryId);
  res.json(items);
};

module.exports = {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  listItemsByCategory,
};
