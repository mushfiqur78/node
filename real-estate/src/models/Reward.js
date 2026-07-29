const mongoose = require('mongoose');

/**
 * Referral reward — created when a property is sold
 * Unique per user+property to prevent duplicate rewards
 */
const rewardSchema = new mongoose.Schema(
  {
    userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    amount:     { type: Number, required: true, min: 0 },
    status:     { type: String, enum: ['pending', 'approved', 'paid', 'cancelled'], default: 'pending', index: true },
    paidAt:     { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    cancelReason: { type: String, default: null },
  },
  { timestamps: true }
);

// Prevent duplicate reward per user per property sale
rewardSchema.index({ userId: 1, propertyId: 1 }, { unique: true });

module.exports = mongoose.model('Reward', rewardSchema);
