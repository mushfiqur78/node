/**
 * Banner Controller
 * Public: GET active banners/sliders based on homepageHeroMode
 * Admin: full CRUD + reorder + toggle + mode switch
 */

const Banner        = require('../models/Banner');
const GeneralSetting = require('../models/GeneralSetting');
const { processAndSave, deleteImage } = require('../services/imageService');

// ─── GET /api/banners — public ────────────────────────────────────
// Returns active items based on current homepageHeroMode setting
exports.getBanners = async (req, res) => {
  try {
    const settings = await GeneralSetting.findOne();
    const mode     = settings?.homepageHeroMode || 'slider';

    const banners = await Banner.find({ isActive: true, type: mode }).sort({ order: 1 });
    res.json({ success: true, message: 'Banners fetched', data: { banners, mode } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── GET /api/admin/banners — admin all ──────────────────────────
exports.adminGetBanners = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = type ? { type } : {};
    const banners = await Banner.find(filter).sort({ order: 1 });
    const settings = await GeneralSetting.findOne();
    res.json({
      success: true, message: 'Banners fetched',
      data: { banners, mode: settings?.homepageHeroMode || 'slider' },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── POST /api/admin/banners ──────────────────────────────────────
exports.createBanner = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Image is required' });

    const data  = { ...req.body };
    if (data.order) data.order = Number(data.order);

    const media = await processAndSave(req.file, { alt: data.imageAlt || data.title || 'Banner', title: data.imageTitle || '' }, req.user._id);
    data.image  = { url: media.url, alt: media.alt, title: media.title };
    delete data.imageAlt;
    delete data.imageTitle;

    const banner = await Banner.create(data);
    res.status(201).json({ success: true, message: 'Banner created', data: { banner } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── PUT /api/admin/banners/:id ───────────────────────────────────
exports.updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ success: false, message: 'Not found' });

    const data = { ...req.body };
    if (data.order) data.order = Number(data.order);

    if (req.file) {
      deleteImage(banner.image?.url);
      const meta = { alt: data.imageAlt || data.title || 'Banner', title: data.imageTitle || '' };
      const media = await processAndSave(req.file, meta, req.user._id);
      data.image  = { url: media.url, alt: media.alt, title: media.title };
    } else if (data.imageAlt !== undefined || data.imageTitle !== undefined) {
      data.image = {
        url:   banner.image?.url   || '',
        alt:   data.imageAlt   ?? banner.image?.alt   ?? '',
        title: data.imageTitle ?? banner.image?.title ?? '',
      };
    }
    delete data.imageAlt;
    delete data.imageTitle;

    const updated = await Banner.findByIdAndUpdate(req.params.id, data, { new: true });
    res.json({ success: true, message: 'Updated', data: { banner: updated } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── PATCH /api/admin/banners/:id/toggle ─────────────────────────
exports.toggleBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ success: false, message: 'Not found' });
    banner.isActive = !banner.isActive;
    await banner.save();
    res.json({ success: true, message: banner.isActive ? 'Activated' : 'Deactivated', data: { banner } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── PUT /api/admin/banners/reorder ──────────────────────────────
exports.reorderBanners = async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) return res.status(400).json({ success: false, message: 'items array required' });
    await Promise.all(items.map(({ id, order }) => Banner.findByIdAndUpdate(id, { order })));
    res.json({ success: true, message: 'Reordered' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── PUT /api/admin/banners/mode — switch banner/slider mode ─────
exports.setMode = async (req, res) => {
  try {
    const { mode } = req.body;
    if (!['banner', 'slider'].includes(mode)) {
      return res.status(400).json({ success: false, message: 'mode must be banner or slider' });
    }
    let settings = await GeneralSetting.findOne();
    if (!settings) settings = await GeneralSetting.create({});
    settings.homepageHeroMode = mode;
    await settings.save();
    res.json({ success: true, message: `Homepage hero set to ${mode}`, data: { mode } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── DELETE /api/admin/banners/:id ───────────────────────────────
exports.deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ success: false, message: 'Not found' });
    deleteImage(banner.image?.url);
    await banner.deleteOne();
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
