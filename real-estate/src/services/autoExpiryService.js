/**
 * Auto Expiry Service
 * Calculates expiry date based on admin settings
 * Used during property creation and bulk update
 */

const GeneralSetting = require('../models/GeneralSetting');

// ─── Get auto expiry settings ─────────────────────────────────────
exports.getAutoExpirySettings = async () => {
  const settings = await GeneralSetting.findOne();
  return {
    enabled:  settings?.autoExpiryEnabled  || false,
    duration: settings?.autoExpiryDuration || 90,
    unit:     settings?.autoExpiryUnit     || 'days',
  };
};

// ─── Calculate expiry date from a base date ───────────────────────
exports.calculateExpiryDate = (baseDate, duration, unit) => {
  const date = new Date(baseDate);
  if (unit === 'months') {
    date.setMonth(date.getMonth() + Number(duration));
  } else {
    date.setDate(date.getDate() + Number(duration));
  }
  return date;
};

// ─── Get expiry date for new property ────────────────────────────
exports.getNewPropertyExpiry = async (createdAt = new Date()) => {
  const { enabled, duration, unit } = await exports.getAutoExpirySettings();
  if (!enabled) return { expiryDate: null, expiryMode: 'none' };
  return {
    expiryDate: exports.calculateExpiryDate(createdAt, duration, unit),
    expiryMode: 'auto',
  };
};
