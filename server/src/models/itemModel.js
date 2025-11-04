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

  statement.run(id, name, quantity, minThreshold, price, categoryId, now);

  return getItemById(id);
};

const updateItem = (id, fields) => {
  const existing = getItemById(id);

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
    id
  );

  return getItemById(id);
};

const deleteItem = (id) => {
  return db.prepare('DELETE FROM items WHERE id = ?').run(id);
};

const getItemById = (id) => {
  const row = db
    .prepare(
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
      WHERE i.id = ?`
    )
    .get(id);

  return mapRowToItem(row);
};

const getItems = () => {
  const rows = db
    .prepare(
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
      ORDER BY i.name COLLATE NOCASE`
    )
    .all();

  return rows.map(mapRowToItem);
};

const getLowStockItems = () => {
  const rows = db
    .prepare(
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
      ORDER BY i.quantity ASC`
    )
    .all();

  return rows.map(mapRowToItem);
};

const getItemsByCategoryId = (categoryId) => {
  const rows = db
    .prepare(
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
      ORDER BY i.name COLLATE NOCASE`
    )
    .all(categoryId);

  return rows.map(mapRowToItem);
};

const clearCategoryFromItems = (categoryId) => {
  return db
    .prepare('UPDATE items SET categoryId = NULL WHERE categoryId = ?')
    .run(categoryId);
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
