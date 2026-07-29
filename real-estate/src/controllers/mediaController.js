/**
 * Media Controller
 * Admin media library — upload, search, update meta, delete
 */

const Media = require('../models/Media');
const { processAndSave, deleteImage } = require('../services/imageService');
const upload = require('../config/multer');

// GET /api/admin/media — list & search
exports.getMedia = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (search) filter.$text = { $search: search };

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Media.countDocuments(filter);
    const items = await Media.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ success: true, message: 'Media fetched', data: { items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// POST /api/admin/media/upload — upload new image to library
exports.uploadMedia = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file provided' });

    const meta  = req.body.meta ? JSON.parse(req.body.meta) : {};
    const media = await processAndSave(req.file, meta, req.user._id);

    res.status(201).json({ success: true, message: 'Uploaded', data: { media } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// PUT /api/admin/media/:id — update alt & title
exports.updateMedia = async (req, res) => {
  try {
    const { alt, title } = req.body;
    const media = await Media.findByIdAndUpdate(req.params.id, { alt, title }, { new: true });
    if (!media) return res.status(404).json({ success: false, message: 'Not found' });

    res.json({ success: true, message: 'Updated', data: { media } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// DELETE /api/admin/media/:id
exports.deleteMedia = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) return res.status(404).json({ success: false, message: 'Not found' });

    deleteImage(media.url);
    await media.deleteOne();

    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
