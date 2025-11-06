const db = require('./db');

const createCategory = ({ id, name, color = null, icon = null }) => {
  return new Promise((resolve, reject) => {
    const statement = db.prepare(
      `INSERT INTO categories (id, name, color, icon)
       VALUES (?, ?, ?, ?)`
    );

    statement.run(id, name, color, icon, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id, name, color, icon });
      }
    });
  });
};

const updateCategory = (id, { name, color = null, icon = null }) => {
  return new Promise((resolve, reject) => {
    const statement = db.prepare(
      `UPDATE categories
       SET name = ?, color = ?, icon = ?
       WHERE id = ?`
    );

    statement.run(name, color, icon, id, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(getCategoryById(id));
      }
    });
  });
};

const deleteCategory = (id) => {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM categories WHERE id = ?', [id], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ changes: this.changes });
      }
    });
  });
};

const getCategoryById = (id) => {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT id, name, color, icon
       FROM categories
       WHERE id = ?`,
      [id],
      (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      }
    );
  });
};

const getAllCategories = () => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT id, name, color, icon
       FROM categories
       ORDER BY name COLLATE NOCASE`,
      [],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      }
    );
  });
};

const getDependentItems = (id) => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT id, name
       FROM items
       WHERE categoryId = ?`,
      [id],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      }
    );
  });
};

const getCategoryByName = (name) => {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT id, name, color, icon
       FROM categories
       WHERE LOWER(name) = LOWER(?)`,
      [name],
      (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      }
    );
  });
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