const { body, query, validationResult } = require('express-validator');

/**
 * Validation middleware for referral system
 */

// Validation helper
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// Submit referral lead validation
exports.validateSubmitLead = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2-100 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone is required')
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/)
    .withMessage('Invalid phone number format'),
  body('propertyId')
    .notEmpty().withMessage('Property ID is required')
    .isMongoId().withMessage('Invalid property ID'),
  body('referralCode')
    .optional()
    .isString().withMessage('Referral code must be a string')
    .isLength({ min: 6, max: 20 }).withMessage('Invalid referral code format'),
  validate,
];

// Create reward validation
exports.validateCreateReward = [
  body('userId')
    .notEmpty().withMessage('User ID is required')
    .isMongoId().withMessage('Invalid user ID'),
  body('propertyId')
    .notEmpty().withMessage('Property ID is required')
    .isMongoId().withMessage('Invalid property ID'),
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0')
    .toFloat(),
  validate,
];

// Track click validation
exports.validateTrackClick = [
  query('ref')
    .notEmpty().withMessage('Referral code (ref) is required')
    .isString().withMessage('Referral code must be a string')
    .isLength({ min: 6, max: 20 }).withMessage('Invalid referral code format'),
  query('source')
    .optional()
    .isString().withMessage('Source must be a string')
    .isIn(['facebook', 'twitter', 'whatsapp', 'instagram', 'linkedin', 'email', 'direct', 'web'])
    .withMessage('Invalid source'),
  validate,
];

// Cancel reward validation
exports.validateCancelReward = [
  body('reason')
    .optional()
    .isString().withMessage('Reason must be a string')
    .isLength({ max: 500 }).withMessage('Reason cannot exceed 500 characters'),
  validate,
];

// List rewards filter validation
exports.validateListRewards = [
  query('status')
    .optional()
    .isIn(['pending', 'approved', 'paid', 'cancelled']).withMessage('Invalid status'),
  query('dateFrom')
    .optional()
    .isISO8601().withMessage('Invalid date format for dateFrom'),
  query('dateTo')
    .optional()
    .isISO8601().withMessage('Invalid date format for dateTo'),
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1-100'),
  validate,
];

// Update lead status validation
exports.validateUpdateLeadStatus = [
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['pending', 'contacted', 'converted', 'rejected']).withMessage('Invalid status'),
  body('notes')
    .optional()
    .isString().withMessage('Notes must be a string')
    .isLength({ max: 1000 }).withMessage('Notes cannot exceed 1000 characters'),
  validate,
];
