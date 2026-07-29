/**
 * Expired Coupon Reservations Cleanup Job
 * Cancels CouponUsage records stuck in 'reserved' status for > TTL minutes.
 * Rolls back usedCount atomically.
 * Idempotent — safe to run multiple times.
 */
const { Coupon, CouponUsage } = require('../models/Coupon');

const RESERVATION_TTL_MINUTES = parseInt(process.env.COUPON_RESERVATION_TTL_MINUTES, 10) || 30;

const run = async () => {
  const cutoff  = new Date(Date.now() - RESERVATION_TTL_MINUTES * 60 * 1000);
  const expired = await CouponUsage.find({
    status:    'reserved',
    createdAt: { $lt: cutoff },
  }).lean();

  let cleaned = 0;
  for (const usage of expired) {
    await Promise.all([
      CouponUsage.findByIdAndUpdate(usage._id, { status: 'cancelled' }),
      // Only decrement if usedCount > 0 to avoid going negative
      Coupon.findOneAndUpdate(
        { _id: usage.couponId, usedCount: { $gt: 0 } },
        { $inc: { usedCount: -1 } }
      ),
    ]);
    cleaned++;
  }

  return cleaned;
};

module.exports = { run };
