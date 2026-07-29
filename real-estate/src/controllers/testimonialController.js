/**
 * Testimonial Controller
 * Public: GET active testimonials
 * Admin: full CRUD + reorder + toggle
 */

const Testimonial = require('../models/Testimonial');
const { processAndSave, deleteImage } = require('../services/imageService');

// ─── GET /api/testimonials — public (active only) ─────────────────
exports.getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    res.json({ success: true, message: 'Testimonials fetched', data: { testimonials } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── GET /api/admin/testimonials — admin all ──────────────────────
exports.adminGetTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, message: 'Testimonials fetched', data: { testimonials } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── POST /api/admin/testimonials ────────────────────────────────
exports.createTestimonial = async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.rating) data.rating = Number(data.rating);
    if (data.order)  data.order  = Number(data.order);

    if (req.file) {
      const meta = { alt: data.avatarAlt || data.name, title: data.avatarTitle || '' };
      const media = await processAndSave(req.file, meta, req.user._id);
      data.avatar = { url: media.url, alt: media.alt, title: media.title };
    }
    delete data.avatarAlt;
    delete data.avatarTitle;

    const testimonial = await Testimonial.create(data);
    res.status(201).json({ success: true, message: 'Testimonial created', data: { testimonial } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── PUT /api/admin/testimonials/:id ─────────────────────────────
exports.updateTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) return res.status(404).json({ success: false, message: 'Not found' });

    const data = { ...req.body };
    if (data.rating) data.rating = Number(data.rating);
    if (data.order)  data.order  = Number(data.order);

    if (req.file) {
      if (testimonial.avatar?.url) deleteImage(testimonial.avatar.url);
      const meta = { alt: data.avatarAlt || data.name || testimonial.name, title: data.avatarTitle || '' };
      const media = await processAndSave(req.file, meta, req.user._id);
      data.avatar = { url: media.url, alt: media.alt, title: media.title };
    } else if (data.avatarAlt !== undefined || data.avatarTitle !== undefined) {
      // Update meta without changing image
      data.avatar = {
        url:   testimonial.avatar?.url   || '',
        alt:   data.avatarAlt   ?? testimonial.avatar?.alt   ?? '',
        title: data.avatarTitle ?? testimonial.avatar?.title ?? '',
      };
    }
    delete data.avatarAlt;
    delete data.avatarTitle;

    const updated = await Testimonial.findByIdAndUpdate(req.params.id, data, { new: true });
    res.json({ success: true, message: 'Updated', data: { testimonial: updated } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── PATCH /api/admin/testimonials/:id/toggle ─────────────────────
exports.toggleTestimonial = async (req, res) => {
  try {
    const t = await Testimonial.findById(req.params.id);
    if (!t) return res.status(404).json({ success: false, message: 'Not found' });
    t.isActive = !t.isActive;
    await t.save();
    res.json({ success: true, message: t.isActive ? 'Activated' : 'Deactivated', data: { testimonial: t } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── PUT /api/admin/testimonials/reorder ─────────────────────────
exports.reorderTestimonials = async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) return res.status(400).json({ success: false, message: 'items array required' });
    await Promise.all(items.map(({ id, order }) => Testimonial.findByIdAndUpdate(id, { order })));
    res.json({ success: true, message: 'Reordered' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── DELETE /api/admin/testimonials/:id ──────────────────────────
exports.deleteTestimonial = async (req, res) => {
  try {
    const t = await Testimonial.findById(req.params.id);
    if (!t) return res.status(404).json({ success: false, message: 'Not found' });
    if (t.avatar) deleteImage(t.avatar);
    await t.deleteOne();
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
