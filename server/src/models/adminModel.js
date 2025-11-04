const db = require('./db');

const findByEmail = (email) => {
  return db
    .prepare('SELECT id, email, password, name FROM admins WHERE email = ?')
    .get(email);
};

module.exports = {
  findByEmail,
};
