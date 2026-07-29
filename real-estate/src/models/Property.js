/**
 * Property Model
 * Scalable, dynamic architecture — all dropdowns (type, location, label, purpose, features)
 * are admin-configurable via database references. No hardcoded enum values for business data.
 * Business rules: rent/sell pricing validation, auto-approval for super_admin.
 */

const mongoose = require('mongoose');
const slugify  = require('slugify');

// ─── Image sub-schema ─────────────────────────────────────────────
const imageSchema = new mongoose.Schema(
  { url: { type: String, required: true }, alt: { type: String, trim: true }, title: { type: String, trim: true } },
  { _id: false }
);

const propertySchema = new mongoose.Schema(
  {
    // ─── Basic Info ───────────────────────────────────────────────
    title:        { type: String, required: true, trim: true },
    propertyId: {
      type:   String,
      unique: true,
      index:  true,
    },
    slug: {
      type:   String,
      unique: true,
      trim:   true,
      index:  true,
    },
    description:  { type: String, required: true },
    propertyName: { type: String },

    // ─── Dynamic References (admin-configurable) ──────────────────
    type: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'PropertyType',
      required: true,
      index:    true,
    },
    location: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Location',
      required: true,
      index:    true,
    },
    label: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'Status',
    },
    purpose: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Purpose',
      required: true,
      index:    true,
    },

    // ─── Pricing ──────────────────────────────────────────────────
    pricing: {
      totalPrice:    { type: Number },
      pricePerSft:   { type: Number },
      rentPerMonth:  { type: Number },
      serviceCharge: { type: Number, default: 0 },
      parkingPrice:  { type: Number, default: 0 },
    },

    // ─── Address ──────────────────────────────────────────────────
    address: { type: String, required: true },

    // ─── Property Details ─────────────────────────────────────────
    areaSize:  { type: Number },
    bedrooms:  { type: Number },
    bathrooms: { type: Number },
    balcony:   { type: Number },
    floor:     { type: String },

    // ─── Media ────────────────────────────────────────────────────
    featuredImage: { type: imageSchema, required: true },
    gallery: {
      type: [imageSchema],
      validate: {
        validator: function (arr) { return arr.length <= 10; },
        message: 'Maximum 10 gallery images allowed',
      },
    },
    videoUrl: { type: String },

    // ─── Contact (auto-filled from logged-in user at controller) ──
    contactNumber: { type: String },

    // ─── View Count ───────────────────────────────────────────────
    viewCount: { type: Number, default: 0, index: true },

    // ─── Features (reference-based) ───────────────────────────────
    primaryFeatures: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Feature' }],
    amenities:       [{ type: mongoose.Schema.Types.ObjectId, ref: 'Feature' }],
    otherFeatures:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'Feature' }],

    // ─── SEO & Social Meta ────────────────────────────────────────
    seo: {
      metaTitle:       { type: String, trim: true, maxlength: 60 },
      metaDescription: { type: String, trim: true, maxlength: 160 },
      ogTitle:         { type: String, trim: true },
      ogDescription:   { type: String, trim: true },
      ogImage:         { type: String }, // processed webp URL
      schemaMarkup:    { type: Object }, // JSON-LD structured data
    },

    // ─── Expiry Management ────────────────────────────────────────
    expiryDate: { type: Date, default: null, index: true },
    expiryMode: {
      type:    String,
      enum:    ['auto', 'manual', 'none'],
      default: 'none',
      index:   true,
    },
    source: {
      type:    String,
      enum:    ['marketplace', 'admin'],
      default: 'marketplace',
      index:   true,
    },

    // ─── Admin-only Flags ─────────────────────────────────────────
    adminFlags: {
      hasDiningSpace: { type: Boolean, default: false },
      hasLivingRoom:  { type: Boolean, default: false },
      isVerified:     { type: Boolean, default: false },
      isRedHot:       { type: Boolean, default: false },
    },

    // ─── Status & Ownership ───────────────────────────────────────
    status: {
      type:    String,
      enum:    ['pending', 'approved', 'rejected'],
      default: 'pending',
      index:   true,
    },
    owner: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    createdByRole: {
      type:     String,
      enum:     ['owner', 'agent', 'super_admin'],
      required: true,
    },
  },
  { timestamps: true }
);

// ─── Business Rule: auto-approve if created by super_admin ────────
propertySchema.pre('save', async function (next) {
  if (this.isNew && this.createdByRole === 'super_admin') {
    this.status = 'approved';
  }

  // ─── Auto-generate unique propertyId (e.g. D-87913) ──────────────
  if (this.isNew && !this.propertyId) {
    const prefix = process.env.PROPERTY_ID_PREFIX || 'D';
    let unique = false;
    let attempts = 0;

    while (!unique && attempts < 10) {
      const num = Math.floor(10000 + Math.random() * 90000); // 5-digit
      const candidate = `${prefix}-${num}`;
      const exists = await mongoose.model('Property').findOne({ propertyId: candidate });
      if (!exists) {
        this.propertyId = candidate;
        unique = true;
      }
      attempts++;
    }

    // fallback: use timestamp-based ID if random keeps colliding
    if (!unique) {
      this.propertyId = `${process.env.PROPERTY_ID_PREFIX || 'D'}-${Date.now().toString().slice(-6)}`;
    }
  }

  // ─── Slug: auto-generate from title if not set or title changed ──
  if (this.isNew || this.isModified('title')) {
    if (!this.slug) {
      const base = slugify(this.title, { lower: true, strict: true });
      // ensure uniqueness by appending timestamp if needed
      const exists = await mongoose.model('Property').findOne({ slug: base, _id: { $ne: this._id } });
      this.slug = exists ? `${base}-${Date.now()}` : base;
    }
  }

  // ─── SEO fallback ─────────────────────────────────────────────────
  if (this.isNew || this.isModified('seo') || this.isModified('title')) {
    if (!this.seo) this.seo = {};
    if (!this.seo.ogTitle)       this.seo.ogTitle       = this.title;
    if (!this.seo.ogDescription) this.seo.ogDescription = this.description?.substring(0, 160);
    if (!this.seo.ogImage)       this.seo.ogImage       = this.featuredImage?.url;
  }

  // ─── Auto-generate JSON-LD schemaMarkup if not provided ───────────
  if ((this.isNew || this.isModified('title') || this.isModified('pricing')) && !this.seo?.schemaMarkup) {
    const schema = {
      '@context':   'https://schema.org',
      '@type':      'RealEstateListing',
      name:         this.title,
      description:  this.description,
      url:          `${process.env.FRONTEND_URL || ''}/properties/${this.slug}`,
      image:        this.featuredImage?.url,
      address: {
        '@type':         'PostalAddress',
        streetAddress:   this.address,
      },
    };
    if (this.pricing?.totalPrice)   schema.price    = this.pricing.totalPrice;
    if (this.pricing?.rentPerMonth) schema.price    = this.pricing.rentPerMonth;
    if (!this.seo) this.seo = {};
    this.seo.schemaMarkup = schema;
  }

  // ─── Business Rule: validate pricing based on purpose ───────────
  if (this.isNew || this.isModified('pricing') || this.isModified('purpose')) {
    const Purpose = mongoose.model('Purpose');
    const purposeDoc = await Purpose.findById(this.purpose);

    if (purposeDoc) {
      const purposeName = purposeDoc.name?.toLowerCase();

      if (purposeName === 'rent' && !this.pricing?.rentPerMonth) {
        return next(new Error('rentPerMonth is required for rent purpose'));
      }

      if (purposeName === 'sell' && !this.pricing?.totalPrice) {
        return next(new Error('totalPrice is required for sell purpose'));
      }
    }
  }

  next();
});

module.exports = mongoose.model('Property', propertySchema);
