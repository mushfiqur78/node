const mongoose = require('mongoose');

/**
 * Coupon definition
 */
const couponSchema = new mongoose.Schema(
  {
    code:        { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    type:        { type: String, enum: ['fixed', 'percent'], required: true },
    value:       { type: Number, required: true, min: 0 },
    maxUses:     { type: Number, required: true, min: 0 },  // 0 = unlimited
    usedCount:   { type: Number, default: 0, min: 0 },
    isPublic:    { type: Boolean, default: false },
    ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    // Links to existing Property model
    propertyId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Property', default: null },
    expiryDate:  { type: Date, required: true, index: true },
    isActive:    { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

couponSchema.index({ isActive: 1, expiryDate: 1 });

/**
 * Coupon usage record — one per user per coupon application
 */
const couponUsageSchema = new mongoose.Schema(
  {
    userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    couponId: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon', required: true },
    status:   { type: String, enum: ['reserved', 'confirmed', 'cancelled'], default: 'reserved', index: true },
  },
  { timestamps: true }
);

couponUsageSchema.index({ userId: 1, couponId: 1 });
couponUsageSchema.index({ couponId: 1, status: 1 });

const Coupon      = mongoose.model('Coupon', couponSchema);
const CouponUsage = mongoose.model('CouponUsage', couponUsageSchema);

module.exports = { Coupon, CouponUsage };
