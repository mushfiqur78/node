/**
 * Seed File
 * Creates default super_admin on first server start
 */

const User = require('../models/User');

const seedAdmin = async () => {
  try {
    const existing = await User.findOne({ email: 'admin@gmail.com' });
    if (!existing) {
      await User.create({
        name: 'Super Admin',
        email: 'admin@gmail.com',
        password: '123456789',
        role: 'super_admin',
        isApproved: true,
        isActive: true,
      });
      console.log('Super Admin created: admin@gmail.com / 123456789');
    }
  } catch (err) {
    console.error('Seed error:', err.message);
  }
};

module.exports = seedAdmin;
