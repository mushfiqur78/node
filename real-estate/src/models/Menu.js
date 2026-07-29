/**
 * Menu Model
 * Dynamic navigation menu system
 * Supports nested menus via parentId (parent-child relationship)
 * Admin-managed: create, update, delete, reorder
 */

const mongoose = require('mongoose');
const slugify  = require('slugify');

const menuSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, trim: true, unique: true },

    // Link target
    url:    { type: String, trim: true },   // external or internal URL
    target: { type: String, enum: ['_self', '_blank'], default: '_self' },

    // Hierarchy
    parentId: {
      type:    mongoose.Schema.Types.ObjectId,
      ref:     'Menu',
      default: null,
    },

    // Display
    order:    { type: Number, default: 0 },
    icon:     { type: String },             // optional icon name
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

// Auto-generate slug from name
menuSchema.pre('save', async function (next) {
  if (this.isNew || this.isModified('name')) {
    if (!this.slug) {
      const base   = slugify(this.name, { lower: true, strict: true });
      const exists = await mongoose.model('Menu').findOne({ slug: base, _id: { $ne: this._id } });
      this.slug    = exists ? `${base}-${Date.now()}` : base;
    }
  }
  next();
});

module.exports = mongoose.model('Menu', menuSchema);
