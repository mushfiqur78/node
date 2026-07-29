/**
 * Token Controller
 * Refresh JWT token before expiry
 * Client sends current valid token → gets new token
 */

const jwt  = require('jsonwebtoken');
const User = require('../models/User');

// ─── POST /api/auth/refresh-token ────────────────────────────────
exports.refreshToken = async (req, res) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    // Verify current token (even if close to expiry)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user    = await User.findById(decoded.id).select('-password');

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'User not found or suspended' });
    }

    // Issue new token
    const newToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.json({
      success: true,
      message: 'Token refreshed',
      data: {
        token: newToken,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      },
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired, please login again' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};
