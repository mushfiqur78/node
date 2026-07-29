/**
 * Blog Model
 * Admin-managed blog posts with SEO support
 * Supports categories, tags, featured image, and rich content
 */

const mongoose = require('mongoose');
const slugify  = require('slugify');

const blogSchema = new mongoose.Schema(
  {
    // ─── Basic Info ───────────────────────────────────────────────
    title:   { type: String, required: true, trim: true },
    slug: {
      type:   String,
      unique: true,
      trim:   true,
      index:  true,
    },
    excerpt: { type: String, trim: true, maxlength: 300 }, // short summary
    content: { type: String, required: true },             // rich HTML/markdown

    // ─── Featured Image ───────────────────────────────────────────
    featuredImage: {
      url:   { type: String },
      alt:   { type: String, trim: true },
      title: { type: String, trim: true },
    },

    // ─── Taxonomy ─────────────────────────────────────────────────
    category: { type: String, trim: true },
    tags:     [{ type: String, trim: true }],

    // ─── Author ───────────────────────────────────────────────────
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'User',
    },

    // ─── Status ───────────────────────────────────────────────────
    status: {
      type:    String,
      enum:    ['draft', 'published'],
      default: 'draft',
      index:   true,
    },
    publishedAt: { type: Date },

    // ─── SEO ──────────────────────────────────────────────────────
    seo: {
      metaTitle:       { type: String, trim: true, maxlength: 60 },
      metaDescription: { type: String, trim: true, maxlength: 160 },
      ogTitle:         { type: String, trim: true },
      ogDescription:   { type: String, trim: true },
      ogImage:         { type: String },
      schemaMarkup:    { type: Object },
    },
  },
  { timestamps: true }
);

// ─── Auto-generate slug from title ────────────────────────────────
blogSchema.pre('save', async function (next) {
  // Slug
  if (this.isNew || this.isModified('title')) {
    if (!this.slug) {
      const base   = slugify(this.title, { lower: true, strict: true });
      const exists = await mongoose.model('Blog').findOne({ slug: base, _id: { $ne: this._id } });
      this.slug    = exists ? `${base}-${Date.now()}` : base;
    }
  }

  // Set publishedAt when status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  // SEO fallbacks
  if (!this.seo) this.seo = {};
  if (!this.seo.metaTitle)       this.seo.metaTitle       = this.title?.substring(0, 60);
  if (!this.seo.metaDescription) this.seo.metaDescription = this.excerpt?.substring(0, 160);
  if (!this.seo.ogTitle)         this.seo.ogTitle         = this.title;
  if (!this.seo.ogDescription)   this.seo.ogDescription   = this.excerpt?.substring(0, 160);
  if (!this.seo.ogImage)         this.seo.ogImage         = this.featuredImage?.url;

  // Auto JSON-LD schema
  if (!this.seo.schemaMarkup) {
    this.seo.schemaMarkup = {
      '@context': 'https://schema.org',
      '@type':    'BlogPosting',
      headline:   this.title,
      description: this.excerpt,
      image:      this.featuredImage?.url,
      author: {
        '@type': 'Organization',
        name:    'Real Estate',
      },
      datePublished: this.publishedAt || this.createdAt,
      url: `${process.env.FRONTEND_URL || ''}/blog/${this.slug}`,
    };
  }

  next();
});

module.exports = mongoose.model('Blog', blogSchema);
