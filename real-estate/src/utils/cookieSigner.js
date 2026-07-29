const crypto = require('crypto');

/**
 * Signs a referral code with HMAC-SHA256 — prevents cookie tampering
 * Format: <code>.<16-char-signature>
 */
const sign = (code) => {
  const sig = crypto
    .createHmac('sha256', process.env.JWT_SECRET)
    .update(code)
    .digest('hex')
    .slice(0, 16);
  return `${code}.${sig}`;
};

/**
 * Verifies signed cookie value.
 * Returns original code on success, null on tamper/invalid.
 */
const verify = (value) => {
  if (!value || !value.includes('.')) return null;
  const lastDot = value.lastIndexOf('.');
  const code    = value.slice(0, lastDot);
  const sig     = value.slice(lastDot + 1);
  const expected = crypto
    .createHmac('sha256', process.env.JWT_SECRET)
    .update(code)
    .digest('hex')
    .slice(0, 16);
  const sigBuf      = Buffer.from(sig);
  const expectedBuf = Buffer.from(expected);
  if (sigBuf.length !== expectedBuf.length) return null;
  return crypto.timingSafeEqual(sigBuf, expectedBuf) ? code : null;
};

module.exports = { sign, verify };
