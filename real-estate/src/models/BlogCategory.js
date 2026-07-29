/**
 * BlogCategory Model
 * Admin-configurable blog categories
 */
const mongoose = require('mongoose');

const blogCategorySchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, unique: true, trim: true },
    slug:     { type: String, unique: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

blogCategorySchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }
  next();
});

module.exports = mongoose.model('BlogCategory', blogCategorySchema);
