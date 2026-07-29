/**
 * Referral Controller
 * Thin layer — delegates all logic to service functions
 */
const { Referral, ReferralClick } = require('../models/Referral');
const Reward                      = require('../models/Reward');
const { generateRefCode }         = require('../utils/codeGenerator');
const { parseDevice, detectSource } = require('../utils/deviceParser');
const { parsePagination, buildMeta } = require('../utils/pagination');
const { sign, verify }            = require('../utils/cookieSigner');

const REFERRAL_COOKIE_TTL = parseInt(process.env.REFERRAL_COOKIE_TTL_DAYS, 10) || 30;
const CLICK_DEDUP_WINDOW  = 30; // minutes

// ── POST /api/v1/referral/click?ref=CODE ──────────────────────────
exports.trackClick = async (req, res, next) => {
  try {
    const refCode     = req.query.ref;
    const ip          = req.ip || 'unknown';
    const userAgent   = req.headers['user-agent'] || '';
    const referer     = req.headers['referer']    || '';
    const sourceParam = req.query.source          || '';

    // Guard: ref param is required
    if (!refCode || typeof refCode !== 'string' || refCode.trim() === '') {
      return res.status(400).json({ success: false, message: 'ref query parameter is required' });
    }

    const referral = await Referral.findOne({ refCode });
    if (!referral) return res.status(404).json({ success: false, message: 'Invalid referral code' });

    // Check if referral link is active
    if (!referral.isActive) {
      return res.status(403).json({ success: false, message: 'This referral link has been deactivated' });
    }

    // Check if referral link has expired
    if (referral.expiresAt && new Date() > referral.expiresAt) {
      return res.status(410).json({ success: false, message: 'This referral link has expired' });
    }

    // Prevent self-referral
    if (req.user && referral.userId.toString() === req.user._id.toString()) {
      return res.status(200).json({ success: true, message: 'Self-referral ignored', data: { selfReferral: true } });
    }

    // Fraud detection
    const fraudDetectionService = require('../services/fraudDetectionService');
    const fraudCheck = await fraudDetectionService.checkSuspiciousIP(ip);
    
    if (fraudCheck.isSuspicious) {
      console.warn('[Fraud] Suspicious click detected:', { refCode, ip, fraudCheck });
      // Continue but log for admin review
    }

    const device = parseDevice(userAgent);
    const source = detectSource(referer, sourceParam);

    // Dedup: same IP + refCode within window
    const since  = new Date(Date.now() - CLICK_DEDUP_WINDOW * 60 * 1000);
    const exists = await ReferralClick.findOne({ refCode, ip, createdAt: { $gte: since } }).lean();

    let click;
    if (!exists) {
      click = await ReferralClick.create({
        refCode, ip,
        userId: req.user?._id || null,
        source, device,
      });
      await Referral.findOneAndUpdate({ refCode }, { $inc: { totalClicks: 1 } });
    } else {
      click = exists;
    }

    // Set signed referral cookie
    res.cookie('ref', sign(refCode), {
      maxAge:   REFERRAL_COOKIE_TTL * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: 'lax',
      secure:   process.env.NODE_ENV === 'production',
    });

    res.json({ 
      success: true, 
      message: 'Referral click tracked', 
      data: { click, duplicate: !!exists },
      fraudWarning: fraudCheck.isSuspicious ? 'High activity detected from your IP' : null,
    });
  } catch (err) { next(err); }
};

// ── GET /api/v1/referral/me ───────────────────────────────────────
exports.getMyReferral = async (req, res, next) => {
  try {
    // findOneAndUpdate with upsert — atomic, safe under concurrent requests
    const referral = await Referral.findOneAndUpdate(
      { userId: req.user._id },
      { $setOnInsert: { userId: req.user._id, refCode: generateRefCode() } },
      { upsert: true, new: true }
    );
    res.json({ success: true, data: referral });
  } catch (err) { next(err); }
};

// ── GET /api/v1/referral/my-referrals ────────────────────────────
exports.getMyReferrals = async (req, res, next) => {
  try {
    const { page, limit, skip, sort } = parsePagination(req.query);
    const [data, total] = await Promise.all([
      Referral.find({ referredBy: req.user._id })
        .populate('userId', 'name email')
        .sort(sort).skip(skip).limit(limit).lean(),
      Referral.countDocuments({ referredBy: req.user._id }),
    ]);
    res.json({ success: true, data, pagination: buildMeta(total, page, limit) });
  } catch (err) { next(err); }
};

// ── GET /api/v1/referral/earnings ────────────────────────────────
exports.getEarnings = async (req, res, next) => {
  try {
    const [referral, rewards] = await Promise.all([
      Referral.findOne({ userId: req.user._id }),
      Reward.find({ userId: req.user._id }).lean(),
    ]);
    if (!referral) return res.status(404).json({ success: false, message: 'Referral profile not found' });

    const realTimeClicks = await ReferralClick.countDocuments({ refCode: referral.refCode });
    res.json({
      success: true,
      data: {
        totalEarned:     referral.totalEarned,
        totalClicks:     realTimeClicks,
        cachedClicks:    referral.totalClicks,
        conversions:     referral.conversions,
        rewardBreakdown: rewards,
      },
    });
  } catch (err) { next(err); }
};

// ── POST /api/v1/referral/bind (called internally after signup) ──
exports.bindOnSignup = async (userId, refCode) => {
  if (!refCode) return;
  
  try {
    const referrer = await Referral.findOne({ refCode });
    if (!referrer) return;
    if (referrer.userId.toString() === userId.toString()) return;

    const newCode = generateRefCode();
    await Referral.findOneAndUpdate(
      { userId },
      { $setOnInsert: { userId, refCode: newCode, referredBy: referrer.userId } },
      { upsert: true, new: true }
    );
    await Referral.findOneAndUpdate({ refCode }, { $inc: { conversions: 1 } });
  } catch (err) {
    console.error('[Referral] bindOnSignup error:', err.message);
    throw err; // Re-throw to ensure caller knows it failed
  }
};

// ── PATCH /api/v1/referral/toggle-active ─────────────────────────
exports.toggleActive = async (req, res, next) => {
  try {
    const referral = await Referral.findOne({ userId: req.user._id });
    if (!referral) {
      return res.status(404).json({ success: false, message: 'Referral profile not found' });
    }

    referral.isActive = !referral.isActive;
    await referral.save();

    res.json({ 
      success: true, 
      message: `Referral link ${referral.isActive ? 'activated' : 'deactivated'}`,
      data: referral 
    });
  } catch (err) { next(err); }
};

// ── PATCH /api/v1/referral/set-expiry ────────────────────────────
exports.setExpiry = async (req, res, next) => {
  try {
    const { expiresAt } = req.body;
    
    if (expiresAt && new Date(expiresAt) <= new Date()) {
      return res.status(400).json({ success: false, message: 'Expiry date must be in the future' });
    }

    const referral = await Referral.findOne({ userId: req.user._id });
    if (!referral) {
      return res.status(404).json({ success: false, message: 'Referral profile not found' });
    }

    referral.expiresAt = expiresAt ? new Date(expiresAt) : null;
    await referral.save();

    res.json({ 
      success: true, 
      message: expiresAt ? 'Expiry date set' : 'Expiry date removed',
      data: referral 
    });
  } catch (err) { next(err); }
};

// ── GET /api/v1/referral/performance ─────────────────────────────
exports.getPerformance = async (req, res, next) => {
  try {
    const referral = await Referral.findOne({ userId: req.user._id });
    if (!referral) {
      return res.status(404).json({ success: false, message: 'Referral profile not found' });
    }

    // Get click trend (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const clickTrend = await ReferralClick.aggregate([
      { $match: { refCode: referral.refCode, createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Source breakdown
    const sourceBreakdown = await ReferralClick.aggregate([
      { $match: { refCode: referral.refCode } },
      { $group: { _id: '$source', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Device breakdown
    const deviceBreakdown = await ReferralClick.aggregate([
      { $match: { refCode: referral.refCode } },
      { $group: { _id: '$device.device', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Conversion rate
    const conversionRate = referral.totalClicks > 0 
      ? ((referral.conversions / referral.totalClicks) * 100).toFixed(2)
      : 0;

    res.json({
      success: true,
      data: {
        summary: {
          totalClicks: referral.totalClicks,
          conversions: referral.conversions,
          conversionRate: `${conversionRate}%`,
          totalEarned: referral.totalEarned,
        },
        clickTrend,
        sourceBreakdown,
        deviceBreakdown,
      },
    });
  } catch (err) { next(err); }
};
