/**
 * AboutPage Controller
 * Public:  GET /api/v1/about
 * Admin:   GET + PUT /api/v1/admin/about
 *          POST /api/v1/admin/about/upload-image  (image uploads)
 */

const AboutPage = require('../models/AboutPage');
const { processAndSave } = require('../services/imageService');

// ── GET /api/v1/about — public ────────────────────────────────────
exports.getAboutPage = async (req, res) => {
  try {
    let about = await AboutPage.findOne();
    if (!about) about = await AboutPage.create({});
    res.json({ success: true, data: { about } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ── GET /api/v1/admin/about — admin ──────────────────────────────
exports.adminGetAboutPage = async (req, res) => {
  try {
    let about = await AboutPage.findOne();
    if (!about) about = await AboutPage.create({});
    res.json({ success: true, data: { about } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ── PUT /api/v1/admin/about — admin update ────────────────────────
exports.updateAboutPage = async (req, res) => {
  try {
    const body = req.body;

    // Parse JSON strings (sent from FormData)
    ['stats', 'whyUs', 'team', 'hero', 'overview', 'mission', 'vision', 'contact'].forEach(key => {
      if (body[key] && typeof body[key] === 'string') {
        try { body[key] = JSON.parse(body[key]); } catch {}
      }
    });

    let about = await AboutPage.findOne();
    if (about) {
      Object.assign(about, body);
      await about.save();
    } else {
      about = await AboutPage.create(body);
    }

    res.json({ success: true, message: 'About page updated', data: { about } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ── POST /api/v1/admin/about/upload-image — upload section image ──
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file provided' });
    const media = await processAndSave(req.file, { alt: req.body.alt || 'About image' }, req.user._id);
    res.json({ success: true, data: { url: media.url } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
