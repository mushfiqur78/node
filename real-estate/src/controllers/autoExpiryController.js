/**
 * Auto Expiry Controller
 * Admin manages default expiry duration
 * Optional bulk update for existing auto properties
 */

const GeneralSetting = require('../models/GeneralSetting');
const Property       = require('../models/Property');
const { calculateExpiryDate } = require('../services/autoExpiryService');

// ─── GET /api/v1/admin/auto-expiry/settings ───────────────────────
exports.getSettings = async (req, res) => {
  try {
    let settings = await GeneralSetting.findOne();
    if (!settings) settings = await GeneralSetting.create({});

    res.json({
      success: true,
      data: {
        autoExpiryEnabled:  settings.autoExpiryEnabled  || false,
        autoExpiryDuration: settings.autoExpiryDuration || 90,
        autoExpiryUnit:     settings.autoExpiryUnit     || 'days',
        expiryWarningDays:  settings.expiryWarningDays  || 7,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── PUT /api/v1/admin/auto-expiry/settings ───────────────────────
exports.updateSettings = async (req, res) => {
  try {
    const {
      autoExpiryEnabled, autoExpiryDuration, autoExpiryUnit,
      expiryWarningDays, applyToExisting,
    } = req.body;

    // Validate
    const duration = Number(autoExpiryDuration);
    const warnDays = Number(expiryWarningDays);
    if (duration < 1 || duration > 3650) {
      return res.status(400).json({ success: false, message: 'Duration must be between 1 and 3650' });
    }
    if (!['days', 'months'].includes(autoExpiryUnit)) {
      return res.status(400).json({ success: false, message: 'Unit must be days or months' });
    }

    let settings = await GeneralSetting.findOne();
    if (!settings) settings = await GeneralSetting.create({});

    settings.autoExpiryEnabled  = Boolean(autoExpiryEnabled);
    settings.autoExpiryDuration = duration;
    settings.autoExpiryUnit     = autoExpiryUnit;
    if (warnDays >= 1) settings.expiryWarningDays = warnDays;
    await settings.save();

    let bulkUpdated = 0;

    // Optional: apply new duration to existing auto properties
    if (applyToExisting && autoExpiryEnabled) {
      const autoProps = await Property.find({ expiryMode: 'auto' });

      await Promise.all(autoProps.map(async (p) => {
        const newExpiry = calculateExpiryDate(p.createdAt, duration, autoExpiryUnit);
        p.expiryDate = newExpiry;
        await p.save();
        bulkUpdated++;
      }));
    }

    res.json({
      success: true,
      message: `Settings saved${bulkUpdated ? `. ${bulkUpdated} auto properties updated.` : ''}`,
      data: {
        autoExpiryEnabled:  settings.autoExpiryEnabled,
        autoExpiryDuration: settings.autoExpiryDuration,
        autoExpiryUnit:     settings.autoExpiryUnit,
        expiryWarningDays:  settings.expiryWarningDays,
        bulkUpdated,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── GET /api/v1/admin/auto-expiry/preview ────────────────────────
// Preview what expiry date would be for a new property
exports.previewExpiry = async (req, res) => {
  try {
    const { duration, unit, baseDate } = req.query;
    const base = baseDate ? new Date(baseDate) : new Date();
    const d    = Number(duration) || 90;
    const u    = ['days', 'months'].includes(unit) ? unit : 'days';

    const expiryDate = calculateExpiryDate(base, d, u);

    res.json({
      success: true,
      data: {
        baseDate:   base.toISOString().split('T')[0],
        expiryDate: expiryDate.toISOString().split('T')[0],
        duration: d,
        unit: u,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── GET /api/v1/admin/auto-expiry/stats ─────────────────────────
exports.getAutoExpiryStats = async (req, res) => {
  try {
    const [autoTotal, autoExpired, autoActive] = await Promise.all([
      Property.countDocuments({ expiryMode: 'auto' }),
      Property.countDocuments({ expiryMode: 'auto', expiryDate: { $lt: new Date() } }),
      Property.countDocuments({ expiryMode: 'auto', expiryDate: { $gte: new Date() } }),
    ]);

    res.json({
      success: true,
      data: { autoTotal, autoExpired, autoActive, manualTotal: await Property.countDocuments({ expiryMode: 'manual' }) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
