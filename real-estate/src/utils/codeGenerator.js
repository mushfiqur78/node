const crypto = require('crypto');

/**
 * Generates a short, URL-safe unique referral code
 */
const generateRefCode = (length = 8) =>
  crypto.randomBytes(length).toString('base64url').slice(0, length).toUpperCase();

module.exports = { generateRefCode };
