/**
 * SEO Settings Controller
 * Public : GET by page (frontend uses this)
 * Admin  : upsert, list all, delete
 */

const SeoSetting = require('../models/SeoSetting');

// ─── GET /api/seo/:page — public ─────────────────────────────────
exports.getSeoByPage = async (req, res) => {
  try {
    const seo = await SeoSetting.findOne({ page: req.params.page.toLowerCase() });
    if (!seo) return res.status(404).json({ success: false, message: 'SEO settings not found for this page' });

    res.json({ success: true, message: 'SEO fetched', data: { seo } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── GET /api/admin/seo — admin list all ─────────────────────────
exports.getAllSeo = async (req, res) => {
  try {
    const settings = await SeoSetting.find().sort({ page: 1 });
    res.json({ success: true, message: 'SEO settings fetched', data: { settings } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── POST /api/admin/seo — create or update (upsert) ─────────────
exports.upsertSeo = async (req, res) => {
  try {
    const {
      page, metaTitle, metaDescription, metaKeywords,
      ogTitle, ogDescription, ogImage,
      canonicalUrl, robots,
    } = req.body;

    if (!page) return res.status(400).json({ success: false, message: 'page is required' });

    const seo = await SeoSetting.findOneAndUpdate(
      { page: page.toLowerCase() },
      {
        page: page.toLowerCase(),
        metaTitle, metaDescription, metaKeywords,
        ogTitle, ogDescription, ogImage,
        canonicalUrl, robots,
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({ success: true, message: 'SEO settings saved', data: { seo } });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'SEO settings for this page already exist' });
    }
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── DELETE /api/admin/seo/:id ────────────────────────────────────
exports.deleteSeo = async (req, res) => {
  try {
    const seo = await SeoSetting.findByIdAndDelete(req.params.id);
    if (!seo) return res.status(404).json({ success: false, message: 'SEO setting not found' });

    res.json({ success: true, message: 'SEO setting deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
