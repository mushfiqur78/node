/**
 * Property Expiry Controller
 * Manages property expiry dates
 * Expired: expiryDate < now
 * Near expiry: expiryDate within warningDays from now
 * No expiry: expiryDate is null → ignored in all expiry calculations
 */

const Property       = require('../models/Property');
const GeneralSetting = require('../models/GeneralSetting');

// ─── Helper: get warning days from settings ───────────────────────
const getWarningDays = async () => {
  const settings = await GeneralSetting.findOne();
  return settings?.expiryWarningDays || 7;
};

// ─── GET /api/v1/admin/expiry/expired ─────────────────────────────
exports.getExpiredProperties = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const now  = new Date();
    const skip = (Number(page) - 1) * Number(limit);

    const filter = {
      expiryDate: { $ne: null, $lt: now },
    };

    const total = await Property.countDocuments(filter);
    const properties = await Property.find(filter)
      .populate('type',     'name')
      .populate('location', 'name city')
      .populate('purpose',  'name')
      .populate('owner',    'name email')
      .sort({ expiryDate: 1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      message: 'Expired properties fetched',
      data: { properties, total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── GET /api/v1/admin/expiry/near-expiry ─────────────────────────
exports.getNearExpiryProperties = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const now          = new Date();
    const warningDays  = await getWarningDays();
    const warningDate  = new Date(now.getTime() + warningDays * 24 * 60 * 60 * 1000);
    const skip         = (Number(page) - 1) * Number(limit);

    const filter = {
      expiryDate: { $ne: null, $gte: now, $lte: warningDate },
    };

    const total = await Property.countDocuments(filter);
    const properties = await Property.find(filter)
      .populate('type',     'name')
      .populate('location', 'name city')
      .populate('purpose',  'name')
      .populate('owner',    'name email')
      .sort({ expiryDate: 1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      message: 'Near expiry properties fetched',
      data: { properties, total, warningDays, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── GET /api/v1/admin/expiry/summary ────────────────────────────
exports.getExpirySummary = async (req, res) => {
  try {
    const now         = new Date();
    const warningDays = await getWarningDays();
    const warningDate = new Date(now.getTime() + warningDays * 24 * 60 * 60 * 1000);

    const [expired, nearExpiry, withExpiry] = await Promise.all([
      Property.countDocuments({ expiryDate: { $ne: null, $lt: now } }),
      Property.countDocuments({ expiryDate: { $ne: null, $gte: now, $lte: warningDate } }),
      Property.countDocuments({ expiryDate: { $ne: null } }),
    ]);

    res.json({
      success: true,
      data: { expired, nearExpiry, withExpiry, warningDays },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── PUT /api/v1/admin/expiry/:id/renew ──────────────────────────
exports.renewExpiry = async (req, res) => {
  try {
    const { expiryDate } = req.body;

    if (!expiryDate) {
      return res.status(400).json({ success: false, message: 'expiryDate is required' });
    }

    const date = new Date(expiryDate);
    if (isNaN(date.getTime()) || date <= new Date()) {
      return res.status(400).json({ success: false, message: 'expiryDate must be a future date' });
    }

    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { expiryDate: date },
      { new: true }
    );

    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

    res.json({ success: true, message: 'Expiry date updated', data: { property } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── DELETE /api/v1/admin/expiry/:id — remove expiry date ────────
exports.removeExpiry = async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { expiryDate: null },
      { new: true }
    );
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

    res.json({ success: true, message: 'Expiry date removed', data: { property } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── PUT /api/v1/admin/expiry/settings ───────────────────────────
exports.updateExpirySettings = async (req, res) => {
  try {
    const { expiryWarningDays } = req.body;
    const days = Number(expiryWarningDays);

    if (!days || days < 1 || days > 365) {
      return res.status(400).json({ success: false, message: 'Warning days must be between 1 and 365' });
    }

    let settings = await GeneralSetting.findOne();
    if (!settings) settings = await GeneralSetting.create({});
    settings.expiryWarningDays = days;
    await settings.save();

    res.json({ success: true, message: 'Expiry settings updated', data: { expiryWarningDays: days } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
