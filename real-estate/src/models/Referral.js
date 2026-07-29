const mongoose = require('mongoose');

/**
 * Referral profile — one per user
 */
const referralSchema = new mongoose.Schema(
  {
    userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    refCode:     { type: String, required: true, unique: true, index: true },
    referredBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    totalClicks: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    totalEarned: { type: Number, default: 0 },
    isActive:    { type: Boolean, default: true, index: true },
    expiresAt:   { type: Date, default: null },
  },
  { timestamps: true }
);

/**
 * Tracks every referral link click
 */
const referralClickSchema = new mongoose.Schema(
  {
    refCode:  { type: String, required: true, index: true },
    ip:       { type: String, required: true },
    userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    source:   { type: String, default: 'direct' },
    device: {
      os:      { type: String, default: 'Unknown' },
      browser: { type: String, default: 'Unknown' },
      device:  { type: String, default: 'desktop' },
    },
    geo: {
      country: { type: String, default: null },
      city:    { type: String, default: null },
      lat:     { type: Number, default: null },
      lon:     { type: Number, default: null },
    },
    geoResolved: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

referralClickSchema.index({ refCode: 1, ip: 1 });
referralClickSchema.index({ createdAt: 1 });

const Referral      = mongoose.model('Referral', referralSchema);
const ReferralClick = mongoose.model('ReferralClick', referralClickSchema);

module.exports = { Referral, ReferralClick };
