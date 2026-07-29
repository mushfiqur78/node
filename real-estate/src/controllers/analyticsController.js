/**
 * Analytics Controller
 * Advanced stats for admin dashboard
 * Property views over time, popular locations/types, enquiry trends
 */

const Property   = require('../models/Property');
const Enquiry    = require('../models/Enquiry');
const User       = require('../models/User');

// ─── GET /api/v1/admin/analytics/overview ────────────────────────
exports.getOverview = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const since = new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000);

    const [
      newProperties, newUsers, newEnquiries,
      totalViews,
    ] = await Promise.all([
      Property.countDocuments({ createdAt: { $gte: since } }),
      User.countDocuments({ createdAt: { $gte: since }, role: { $ne: 'super_admin' } }),
      Enquiry.countDocuments({ createdAt: { $gte: since } }),
      Property.aggregate([{ $group: { _id: null, total: { $sum: '$viewCount' } } }]),
    ]);

    res.json({
      success: true,
      data: {
        period: `Last ${days} days`,
        newProperties,
        newUsers,
        newEnquiries,
        totalViews: totalViews[0]?.total || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── GET /api/v1/admin/analytics/views-over-time ─────────────────
exports.getViewsOverTime = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const since = new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000);

    // Properties created per day
    const propertiesPerDay = await Property.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
        views: { $sum: '$viewCount' },
      }},
      { $sort: { _id: 1 } },
    ]);

    // Enquiries per day
    const enquiriesPerDay = await Enquiry.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      }},
      { $sort: { _id: 1 } },
    ]);

    // New users per day
    const usersPerDay = await User.aggregate([
      { $match: { createdAt: { $gte: since }, role: { $ne: 'super_admin' } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      }},
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      data: { propertiesPerDay, enquiriesPerDay, usersPerDay },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── GET /api/v1/admin/analytics/popular-locations ───────────────
exports.getPopularLocations = async (req, res) => {
  try {
    const data = await Property.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$location', count: { $sum: 1 }, totalViews: { $sum: '$viewCount' } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'locations', localField: '_id', foreignField: '_id', as: 'location' } },
      { $unwind: { path: '$location', preserveNullAndEmpty: true } },
      { $project: { name: '$location.name', city: '$location.city', count: 1, totalViews: 1 } },
    ]);

    res.json({ success: true, data: { locations: data } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── GET /api/v1/admin/analytics/popular-types ───────────────────
exports.getPopularTypes = async (req, res) => {
  try {
    const data = await Property.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$type', count: { $sum: 1 }, totalViews: { $sum: '$viewCount' } } },
      { $sort: { count: -1 } },
      { $lookup: { from: 'propertytypes', localField: '_id', foreignField: '_id', as: 'type' } },
      { $unwind: { path: '$type', preserveNullAndEmpty: true } },
      { $project: { name: '$type.name', count: 1, totalViews: 1 } },
    ]);

    res.json({ success: true, data: { types: data } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── GET /api/v1/admin/analytics/top-properties ──────────────────
exports.getTopProperties = async (req, res) => {
  try {
    const { limit = 10, sortBy = 'viewCount' } = req.query;
    const allowedSort = ['viewCount', 'createdAt'];
    const sort = allowedSort.includes(sortBy) ? sortBy : 'viewCount';

    const properties = await Property.find({ status: 'approved' })
      .select('title propertyId featuredImage viewCount createdAt pricing purpose location')
      .populate('location', 'name')
      .populate('purpose',  'name')
      .sort({ [sort]: -1 })
      .limit(Number(limit));

    res.json({ success: true, data: { properties } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── GET /api/v1/admin/analytics/purpose-breakdown ───────────────
exports.getPurposeBreakdown = async (req, res) => {
  try {
    const data = await Property.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$purpose', count: { $sum: 1 } } },
      { $lookup: { from: 'purposes', localField: '_id', foreignField: '_id', as: 'purpose' } },
      { $unwind: { path: '$purpose', preserveNullAndEmpty: true } },
      { $project: { name: '$purpose.name', count: 1 } },
    ]);

    res.json({ success: true, data: { breakdown: data } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
