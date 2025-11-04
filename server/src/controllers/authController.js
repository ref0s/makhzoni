const adminModel = require('../models/adminModel');
const bcrypt = require('bcrypt');

const login = (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const admin = adminModel.findByEmail(email);

  if (!admin || !bcrypt.compareSync(password, admin.password)) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  res.json({
    message: 'Login successful',
    admin: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
    },
  });
};

module.exports = {
  login,
};
