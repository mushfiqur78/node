/**
 * Location Model
 * Admin-configurable locations/areas (e.g. Gulshan, Dhanmondi, Uttara)
 */
const mongoose = require('mongoose');
const slugify  = require('slugify');

const locationSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, unique: true, trim: true },
    slug:     { type: String, unique: true, sparse: true, trim: true },
    city:     { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Auto-generate slug from name
locationSchema.pre('save', async function (next) {
  if (this.isNew || this.isModified('name')) {
    const base   = slugify(this.name, { lower: true, strict: true });
    const exists = await mongoose.model('Location').findOne({ slug: base, _id: { $ne: this._id } });
    this.slug    = exists ? `${base}-${Date.now()}` : base;
  }
  next();
});

module.exports = mongoose.model('Location', locationSchema);
