/**
 * Testimonial Model
 * Client reviews and testimonials
 * Admin-managed: create, update, delete, toggle active
 */

const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema(
  {
    name:       { type: String, required: true, trim: true },
    designation:{ type: String, trim: true },   // e.g. "CEO, ABC Company"
    company:    { type: String, trim: true },
    avatar: {
      url:   { type: String },
      alt:   { type: String, trim: true },
      title: { type: String, trim: true },
    },
    message:    { type: String, required: true },
    rating:     { type: Number, min: 1, max: 5, default: 5 },
    order:      { type: Number, default: 0 },
    isActive:   { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Testimonial', testimonialSchema);
