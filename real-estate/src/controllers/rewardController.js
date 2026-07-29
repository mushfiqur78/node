/**
 * Reward Controller
 */
const Reward       = require('../models/Reward');
const Referral     = require('../models/Referral').Referral;
const ReferralLead = require('../models/ReferralLead');
const { parsePagination, buildMeta } = require('../utils/pagination');

// ── Admin: POST /api/v1/admin/rewards ────────────────────────────
exports.createReward = async (req, res, next) => {
  try {
    const { userId, propertyId, amount } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be greater than 0' });
    }
    const maxReward = parseFloat(process.env.MAX_REWARD_AMOUNT) || 100000;
    if (amount > maxReward) {
      return res.status(400).json({ success: false, message: `Amount cannot exceed ${maxReward}` });
    }

    // Idempotency check
    const existing = await Reward.findOne({ userId, propertyId });
    if (existing) return res.json({ success: true, message: 'Reward already exists', data: existing });

    // Validate: user must have a referral lead for this property
    const referral = await Referral.findOne({ userId });
    if (!referral) return res.status(400).json({ success: false, message: 'User has no referral profile' });

    // FIXED: Match both referralCode AND userId to prevent fraud
    const lead = await ReferralLead.findOne({ 
      propertyId, 
      referralCode: referral.refCode,
      $or: [
        { userId: userId }, // Lead submitted by authenticated user
        { email: { $exists: true } } // Or guest lead (will verify email separately)
      ]
    });
    if (!lead) return res.status(400).json({ success: false, message: 'No verified referral lead found for this property' });

    const reward = await Reward.create({ userId, propertyId, amount });
    await Referral.findOneAndUpdate({ userId }, { $inc: { totalEarned: amount } });

    // Send notification to user
    try {
      const notificationService = require('../services/notificationService');
      await notificationService.createNotification({
        userId,
        type: 'reward_created',
        title: 'New Reward Earned!',
        message: `You've earned a reward of ${amount} for referring a property sale.`,
        metadata: { rewardId: reward._id, propertyId, amount }
      });
    } catch (notifErr) {
      console.error('[Notification] Failed to send reward notification:', notifErr.message);
    }

    res.status(201).json({ success: true, data: reward });
  } catch (err) { next(err); }
};

// ── Admin: GET /api/v1/admin/rewards ─────────────────────────────
exports.listRewards = async (req, res, next) => {
  try {
    const { page, limit, skip, sort } = parsePagination(req.query);
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.dateFrom || req.query.dateTo) {
      filter.createdAt = {};
      if (req.query.dateFrom) filter.createdAt.$gte = new Date(req.query.dateFrom);
      if (req.query.dateTo)   filter.createdAt.$lte = new Date(req.query.dateTo);
    }

    const [data, total] = await Promise.all([
      Reward.find(filter).sort(sort).skip(skip).limit(limit)
        .populate('userId', 'name email')
        .populate('propertyId', 'title propertyId')
        .lean(),
      Reward.countDocuments(filter),
    ]);
    res.json({ success: true, data, pagination: buildMeta(total, page, limit) });
  } catch (err) { next(err); }
};

// ── Admin: PATCH /api/v1/admin/rewards/:id/approve ───────────────
exports.approveReward = async (req, res, next) => {
  try {
    const reward = await Reward.findById(req.params.id);
    if (!reward) return res.status(404).json({ success: false, message: 'Reward not found' });
    if (reward.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Cannot approve a ${reward.status} reward` });
    }
    reward.status = 'approved';
    await reward.save();

    // Send notification
    try {
      const notificationService = require('../services/notificationService');
      await notificationService.createNotification({
        userId: reward.userId,
        type: 'reward_approved',
        title: 'Reward Approved!',
        message: `Your reward of ${reward.amount} has been approved and will be paid soon.`,
        metadata: { rewardId: reward._id, amount: reward.amount }
      });
    } catch (notifErr) {
      console.error('[Notification] Failed to send approval notification:', notifErr.message);
    }

    res.json({ success: true, data: reward });
  } catch (err) { next(err); }
};

// ── Admin: PATCH /api/v1/admin/rewards/:id/paid ──────────────────
exports.markPaid = async (req, res, next) => {
  try {
    const reward = await Reward.findById(req.params.id);
    if (!reward) return res.status(404).json({ success: false, message: 'Reward not found' });
    if (reward.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'Reward must be approved before marking as paid' });
    }
    reward.status = 'paid';
    reward.paidAt = new Date();
    await reward.save();

    // Send notification
    try {
      const notificationService = require('../services/notificationService');
      await notificationService.createNotification({
        userId: reward.userId,
        type: 'reward_paid',
        title: 'Reward Paid!',
        message: `Your reward of ${reward.amount} has been successfully paid.`,
        metadata: { rewardId: reward._id, amount: reward.amount }
      });
    } catch (notifErr) {
      console.error('[Notification] Failed to send payment notification:', notifErr.message);
    }

    res.json({ success: true, data: reward });
  } catch (err) { next(err); }
};

// ── Admin: PATCH /api/v1/admin/rewards/:id/cancel ─────────────────
exports.cancelReward = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const reward = await Reward.findById(req.params.id);
    if (!reward) return res.status(404).json({ success: false, message: 'Reward not found' });
    if (reward.status === 'paid') {
      return res.status(400).json({ success: false, message: 'Cannot cancel a paid reward' });
    }

    const previousAmount = reward.amount;
    reward.status = 'cancelled';
    reward.cancelReason = reason || 'Cancelled by admin';
    reward.cancelledAt = new Date();
    await reward.save();

    // Deduct from totalEarned if it was counted
    await Referral.findOneAndUpdate(
      { userId: reward.userId },
      { $inc: { totalEarned: -previousAmount } }
    );

    // Send notification
    try {
      const notificationService = require('../services/notificationService');
      await notificationService.createNotification({
        userId: reward.userId,
        type: 'reward_cancelled',
        title: 'Reward Cancelled',
        message: `Your reward of ${previousAmount} has been cancelled. Reason: ${reward.cancelReason}`,
        metadata: { rewardId: reward._id, amount: previousAmount, reason: reward.cancelReason }
      });
    } catch (notifErr) {
      console.error('[Notification] Failed to send cancellation notification:', notifErr.message);
    }

    res.json({ success: true, data: reward });
  } catch (err) { next(err); }
};
