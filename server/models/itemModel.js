const db = require('./db');

const mapRowToItem = (row) => {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    quantity: row.quantity,
    minThreshold: row.minThreshold,
    price: row.price,
    categoryId: row.categoryId,
    categoryName: row.categoryName ?? null,
    lastUpdated: row.lastUpdated,
  };
};

const createItem = ({
  id,
  name,
  quantity,
  minThreshold,
  price,
  categoryId = null,
}) => {
  return new Promise((resolve, reject) => {
    const now = new Date().toISOString();
    const statement = db.prepare(
      `INSERT INTO items (
          id,
          name,
          quantity,
          minThreshold,
          price,
          categoryId,
          lastUpdated
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)`
    );

    statement.run(id, name, quantity, minThreshold, price, categoryId, now, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(getItemById(id));
      }
    });
  });
};

const updateItem = async (id, fields) => {
  const existing = await getItemById(id);

  if (!existing) {
    return null;
  }

  const updates = {
    name: fields.name ?? existing.name,
    quantity: fields.quantity ?? existing.quantity,
    minThreshold: fields.minThreshold ?? existing.minThreshold,
    price: fields.price ?? existing.price,
    categoryId:
      fields.categoryId !== undefined ? fields.categoryId : existing.categoryId,
  };

  const now = new Date().toISOString();

  return new Promise((resolve, reject) => {
    const statement = db.prepare(
      `UPDATE items
       SET name = ?,
           quantity = ?,
           minThreshold = ?,
           price = ?,
           categoryId = ?,
           lastUpdated = ?
       WHERE id = ?`
    );

    statement.run(
      updates.name,
      updates.quantity,
      updates.minThreshold,
      updates.price,
      updates.categoryId,
      now,
      id,
      function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(getItemById(id));
        }
      }
    );
  });
};

const deleteItem = (id) => {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM items WHERE id = ?', [id], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ changes: this.changes });
      }
    });
  });
};

const getItemById = (id) => {
  return new Promise((resolve, reject) => {
    const row = db.get(
      `SELECT
        i.id,
        i.name,
        i.quantity,
        i.minThreshold,
        i.price,
        i.categoryId,
        i.lastUpdated,
        c.name as categoryName
      FROM items i
      LEFT JOIN categories c ON c.id = i.categoryId
      WHERE i.id = ?`,
      [id],
      (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(mapRowToItem(row));
        }
      }
    );
  });
};

const getItems = () => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT
        i.id,
        i.name,
        i.quantity,
        i.minThreshold,
        i.price,
        i.categoryId,
        i.lastUpdated,
        c.name as categoryName
      FROM items i
      LEFT JOIN categories c ON c.id = i.categoryId
      ORDER BY i.name COLLATE NOCASE`,
      [],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(mapRowToItem));
        }
      }
    );
  });
};

const getLowStockItems = () => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT
        i.id,
        i.name,
        i.quantity,
        i.minThreshold,
        i.price,
        i.categoryId,
        i.lastUpdated,
        c.name as categoryName
      FROM items i
      LEFT JOIN categories c ON c.id = i.categoryId
      WHERE i.quantity < i.minThreshold
      ORDER BY i.quantity ASC`,
      [],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(mapRowToItem));
        }
      }
    );
  });
};

const getItemsByCategoryId = (categoryId) => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT
        i.id,
        i.name,
        i.quantity,
        i.minThreshold,
        i.price,
        i.categoryId,
        i.lastUpdated,
        c.name as categoryName
      FROM items i
      LEFT JOIN categories c ON c.id = i.categoryId
      WHERE i.categoryId = ?
      ORDER BY i.name COLLATE NOCASE`,
      [categoryId],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(mapRowToItem));
        }
      }
    );
  });
};

const clearCategoryFromItems = (categoryId) => {
  return new Promise((resolve, reject) => {
    db.run('UPDATE items SET categoryId = NULL WHERE categoryId = ?', [categoryId], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ changes: this.changes });
      }
    });
  });
};

module.exports = {
  createItem,
  updateItem,
  deleteItem,
  getItemById,
  getItems,
  getLowStockItems,
  getItemsByCategoryId,
  clearCategoryFromItems,
};