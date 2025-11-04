const db = require('./db');

const createCategory = ({ id, name, color = null, icon = null }) => {
  const statement = db.prepare(
    `INSERT INTO categories (id, name, color, icon)
     VALUES (?, ?, ?, ?)`
  );

  statement.run(id, name, color, icon);

  return { id, name, color, icon };
};

const updateCategory = (id, { name, color = null, icon = null }) => {
  const statement = db.prepare(
    `UPDATE categories
     SET name = ?, color = ?, icon = ?
     WHERE id = ?`
  );

  statement.run(name, color, icon, id);

  return getCategoryById(id);
};

const deleteCategory = (id) => {
  return db
    .prepare('DELETE FROM categories WHERE id = ?')
    .run(id);
};

const getCategoryById = (id) => {
  return db
    .prepare(
      `SELECT id, name, color, icon
       FROM categories
       WHERE id = ?`
    )
    .get(id);
};

const getAllCategories = () => {
  return db
    .prepare(
      `SELECT id, name, color, icon
       FROM categories
       ORDER BY name COLLATE NOCASE`
    )
    .all();
};

const getDependentItems = (id) => {
  return db
    .prepare(
      `SELECT id, name
       FROM items
       WHERE categoryId = ?`
    )
    .all(id);
};

const getCategoryByName = (name) => {
  return db
    .prepare(
      `SELECT id, name, color, icon
       FROM categories
       WHERE LOWER(name) = LOWER(?)`
    )
    .get(name);
};

module.exports = {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryById,
  getAllCategories,
  getCategoryByName,
  getDependentItems,
};
