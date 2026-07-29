/**
 * Media Model
 * Central media library — all uploaded images stored here
 * Properties reference images from this collection
 * Supports reuse across multiple properties
 */

const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema(
  {
    url:        { type: String, required: true, unique: true },
    alt:        { type: String, trim: true, default: '' },
    title:      { type: String, trim: true, default: '' },
    filename:   { type: String },
    size:       { type: Number }, // bytes
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// text index for search
mediaSchema.index({ alt: 'text', title: 'text', filename: 'text' });

module.exports = mongoose.model('Media', mediaSchema);
