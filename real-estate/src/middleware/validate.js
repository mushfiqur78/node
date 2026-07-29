/**
 * Validation Middleware
 * Uses express-validator to validate request inputs
 * Returns consistent error response on validation failure
 */

const { validationResult, body, param } = require('express-validator');

// Run validation and return errors if any
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors:  errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ── Auth Validators ───────────────────────────────────────────────
const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 50 }).withMessage('Name max 50 chars'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
];

const loginRules = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const changePasswordRules = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
];

const forgotPasswordRules = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
];

const resetPasswordRules = [
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  param('token').notEmpty().withMessage('Reset token is required'),
];

// ── Enquiry Validators ────────────────────────────────────────────
const enquiryRules = [
  body('propertyId').notEmpty().withMessage('Property ID is required').isMongoId().withMessage('Invalid property ID'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('message').trim().notEmpty().withMessage('Message is required').isLength({ max: 1000 }).withMessage('Message max 1000 chars'),
];

module.exports = {
  validate,
  registerRules,
  loginRules,
  changePasswordRules,
  forgotPasswordRules,
  resetPasswordRules,
  enquiryRules,
};
