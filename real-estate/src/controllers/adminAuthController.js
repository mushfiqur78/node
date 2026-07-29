/**
 * Admin Auth Controller - Admin Panel Only
 * Handles login and profile for super_admin role only
 */

const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// POST /api/admin/auth/login
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Only super_admin allowed
    if (user.role !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account has been suspended' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Admin login successful',
      data: {
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// GET /api/admin/auth/me
exports.adminMe = async (req, res) => {
  res.json({ success: true, message: 'Admin profile fetched', data: { user: req.user } });
};
