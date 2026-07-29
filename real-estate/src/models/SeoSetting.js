/**
 * SeoSetting Model
 * One record per page — unique page identifier
 * Used for global SEO management from admin dashboard
 */

const mongoose = require('mongoose');

const seoSettingSchema = new mongoose.Schema(
  {
    // Unique page identifier (e.g. 'home', 'properties', 'blog', 'about')
    page: {
      type:     String,
      required: true,
      unique:   true,
      trim:     true,
      lowercase: true,
      index:    true,
    },

    // Basic SEO
    metaTitle:       { type: String, trim: true, maxlength: 60 },
    metaDescription: { type: String, trim: true, maxlength: 160 },
    metaKeywords:    { type: String, trim: true }, // comma-separated

    // Open Graph (Social)
    ogTitle:       { type: String, trim: true },
    ogDescription: { type: String, trim: true },
    ogImage:       { type: String, trim: true }, // URL

    // Technical SEO
    canonicalUrl: { type: String, trim: true },
    robots: {
      type:    String,
      trim:    true,
      default: 'index, follow',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SeoSetting', seoSettingSchema);
