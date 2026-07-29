/**
 * Auth Middleware
 * protect()    - verify JWT token
 * authorize()  - check user role
 * isApproved() - check agent approval status
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT and attach user to request
exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired' });
  }
};

// Role-based access control
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not allowed to access this route`,
      });
    }
    next();
  };
};

// Approval check — for roles that require admin approval before acting
// Currently no role requires approval, but kept for future extensibility
// Usage: add role to APPROVAL_REQUIRED_ROLES when needed
const APPROVAL_REQUIRED_ROLES = []; // e.g. ['agent'] if agent role is added later

exports.isApproved = (req, res, next) => {
  if (APPROVAL_REQUIRED_ROLES.includes(req.user.role) && !req.user.isApproved) {
    return res.status(403).json({
      success: false,
      message: 'Account pending admin approval',
    });
  }
  next();
};

/**
 * Optional auth — attaches req.user if a valid Bearer token is present.
 * Does NOT block the request if no token or invalid token.
 * Used for public routes that benefit from knowing who the user is (e.g. referral click).
 */
exports.optionalAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return next();
  const jwt  = require('jsonwebtoken');
  jwt.verify(header.slice(7), process.env.JWT_SECRET, async (err, decoded) => {
    if (!err && decoded) {
      req.user = await User.findById(decoded.id).select('-password');
    }
    next();
  });
};
