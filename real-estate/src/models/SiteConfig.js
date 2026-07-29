/**
 * SiteConfig Model
 * Stores site-wide technical configuration
 * Singleton — one document only
 * Includes: frontendUrl, backendUrl, googleAnalyticsId, etc.
 */

const mongoose = require('mongoose');

const siteConfigSchema = new mongoose.Schema(
  {
    frontendUrl:        { type: String, trim: true, default: '' },
    backendUrl:         { type: String, trim: true, default: '' },
    googleAnalyticsId:  { type: String, trim: true },  // GA4: G-XXXXXXXXXX
    googleTagManagerId: { type: String, trim: true },  // GTM-XXXXXXX
    googleSearchConsole:{ type: String, trim: true },  // verification meta tag content
    facebookPixelId:    { type: String, trim: true },
    defaultOgImage:     { type: String, trim: true },  // fallback OG image URL
    twitterHandle:      { type: String, trim: true },  // @handle
  },
  { timestamps: true }
);

module.exports = mongoose.model('SiteConfig', siteConfigSchema);
