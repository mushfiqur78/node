/**
 * Admin Dashboard Stats for Referral system
 */
const { Referral, ReferralClick } = require('../models/Referral');
const Reward                      = require('../models/Reward');
const { Coupon }                  = require('../models/Coupon');
const ReferralLead                = require('../models/ReferralLead');
const { parsePagination, buildMeta } = require('../utils/pagination');

// ── GET /api/v1/admin/referral-stats ─────────────────────────────
exports.getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalReferrals,
      totalClicks,
      conversionsAgg,
      rewardAgg,
      totalCoupons,
      activeCoupons,
      totalLeads,
    ] = await Promise.all([
      Referral.countDocuments(),
      ReferralClick.countDocuments(),
      Referral.aggregate([{ $group: { _id: null, total: { $sum: '$conversions' } } }]),
      Reward.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 }, amount: { $sum: '$amount' } } },
      ]),
      Coupon.countDocuments(),
      Coupon.countDocuments({ isActive: true, expiryDate: { $gt: new Date() } }),
      ReferralLead.countDocuments(),
    ]);

    const rewardMap = { pending: 0, approved: 0, paid: 0, cancelled: 0, totalAmount: 0 };
    rewardAgg.forEach(({ _id, count, amount }) => {
      if (_id in rewardMap) rewardMap[_id] = count;
      // totalAmount = only paid rewards (actual money disbursed)
      if (_id === 'paid') rewardMap.totalAmount = amount;
    });

    res.json({
      success: true,
      data: {
        referrals: {
          total:       totalReferrals,
          totalClicks: totalClicks,
          conversions: conversionsAgg[0]?.total ?? 0,
        },
        rewards: {
          total:       rewardMap.pending + rewardMap.approved + rewardMap.paid + rewardMap.cancelled,
          pending:     rewardMap.pending,
          approved:    rewardMap.approved,
          paid:        rewardMap.paid,
          cancelled:   rewardMap.cancelled,
          totalAmount: rewardMap.totalAmount,
        },
        coupons: { total: totalCoupons, active: activeCoupons },
        leads:   { total: totalLeads },
      },
    });
  } catch (err) { next(err); }
};

// ── GET /api/v1/admin/referral-clicks ────────────────────────────
exports.getClicks = async (req, res, next) => {
  try {
    const { page, limit, skip, sort } = parsePagination(req.query);
    const filter = {};
    if (req.query.source) filter.source = req.query.source;
    if (req.query.dateFrom || req.query.dateTo) {
      filter.createdAt = {};
      if (req.query.dateFrom) filter.createdAt.$gte = new Date(req.query.dateFrom);
      if (req.query.dateTo)   filter.createdAt.$lte = new Date(req.query.dateTo);
    }

    const [data, total] = await Promise.all([
      ReferralClick.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      ReferralClick.countDocuments(filter),
    ]);
    res.json({ success: true, data, pagination: buildMeta(total, page, limit) });
  } catch (err) { next(err); }
};

// ── GET /api/v1/admin/referral-analytics ─────────────────────────
exports.getAnalytics = async (req, res, next) => {
  try {
    const { dateFrom, dateTo } = req.query;
    const dateFilter = {};
    if (dateFrom || dateTo) {
      dateFilter.createdAt = {};
      if (dateFrom) dateFilter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) dateFilter.createdAt.$lte = new Date(dateTo);
    }

    // Top referrers by conversions
    const topReferrers = await Referral.find()
      .sort({ conversions: -1 })
      .limit(10)
      .populate('userId', 'name email')
      .lean();

    // Top referrers by earnings
    const topEarners = await Referral.find()
      .sort({ totalEarned: -1 })
      .limit(10)
      .populate('userId', 'name email')
      .lean();

    // Click sources breakdown
    const clicksBySource = await ReferralClick.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$source', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Clicks by device type
    const clicksByDevice = await ReferralClick.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$device.device', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Daily clicks trend (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const dailyClicks = await ReferralClick.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Conversion rate by referrer
    const conversionRates = await Referral.aggregate([
      { $match: { totalClicks: { $gt: 0 } } },
      {
        $project: {
          userId: 1,
          refCode: 1,
          totalClicks: 1,
          conversions: 1,
          conversionRate: {
            $multiply: [{ $divide: ['$conversions', '$totalClicks'] }, 100],
          },
        },
      },
      { $sort: { conversionRate: -1 } },
      { $limit: 10 },
    ]);

    // Lead status breakdown
    const leadsByStatus = await ReferralLead.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Geographic distribution (top countries)
    const topCountries = await ReferralClick.aggregate([
      { $match: { 'geo.country': { $ne: null }, ...dateFilter } },
      { $group: { _id: '$geo.country', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      success: true,
      data: {
        topReferrers,
        topEarners,
        clicksBySource,
        clicksByDevice,
        dailyClicks,
        conversionRates,
        leadsByStatus,
        topCountries,
      },
    });
  } catch (err) { next(err); }
};
