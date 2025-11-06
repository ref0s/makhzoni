const db = require('./db');

const findByEmail = (email) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT id, email, password, name FROM admins WHERE email = ?', [email], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

module.exports = {
  findByEmail,
};