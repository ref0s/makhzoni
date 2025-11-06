const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const dbPath = path.join(__dirname, '..', 'data', 'makhzoni.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the makhzoni database.');
});

const setup = () => {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS admins (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        name TEXT NOT NULL
      );
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        color TEXT,
        icon TEXT
      );
    `);

    db.run(`
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

    db.get('SELECT id FROM admins WHERE email = ? LIMIT 1', ['admin@example.com'], (err, admin) => {
      if (err) {
        return console.error(err.message);
      }
      if (!admin) {
        const hashedPassword = bcrypt.hashSync('password123', 10);
        db.run('INSERT INTO admins (id, email, password, name) VALUES (?, ?, ?, ?)', ['admin-1', 'admin@example.com', hashedPassword, 'Admin User']);
      }
    });
  });
};

setup();

module.exports = db;