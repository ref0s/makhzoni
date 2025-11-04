const path = require('path');
const Database = require('better-sqlite3');

const bcrypt = require('bcrypt');

const dbPath = path.join(__dirname, '..', '..', 'data', 'makhzoni.db');
const db = new Database(dbPath);

const setup = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      color TEXT,
      icon TEXT
    );

    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      minThreshold INTEGER NOT NULL,
      price REAL NOT NULL,
      categoryId TEXT,
      lastUpdated TEXT NOT NULL,
      FOREIGN KEY (categoryId) REFERENCES categories(id)
    );
  `);

  const admin = db
    .prepare('SELECT id FROM admins WHERE email = ? LIMIT 1')
    .get('admin@example.com');

  if (!admin) {
    const hashedPassword = bcrypt.hashSync('password123', 10);
    db.prepare(
      'INSERT INTO admins (id, email, password, name) VALUES (?, ?, ?, ?)'
    ).run('admin-1', 'admin@example.com', hashedPassword, 'Admin User');
  }
};

setup();

module.exports = db;
