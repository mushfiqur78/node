/**
 * SiteConfig Controller
 * Singleton — get and upsert site configuration
 * Public: GET (frontend needs frontendUrl, analytics IDs)
 * Admin: GET + PUT
 */

const SiteConfig = require('../models/SiteConfig');

// ─── GET /api/site-config — public ───────────────────────────────
exports.getSiteConfig = async (req, res) => {
  try {
    let config = await SiteConfig.findOne();
    if (!config) config = await SiteConfig.create({});
    res.json({ success: true, message: 'Config fetched', data: { config } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── PUT /api/admin/site-config — admin ──────────────────────────
exports.updateSiteConfig = async (req, res) => {
  try {
    const {
      frontendUrl, backendUrl,
      googleAnalyticsId, googleTagManagerId,
      googleSearchConsole, facebookPixelId,
      defaultOgImage, twitterHandle,
    } = req.body;

    let config = await SiteConfig.findOne();
    if (config) {
      Object.assign(config, {
        frontendUrl, backendUrl,
        googleAnalyticsId, googleTagManagerId,
        googleSearchConsole, facebookPixelId,
        defaultOgImage, twitterHandle,
      });
      await config.save();
    } else {
      config = await SiteConfig.create(req.body);
    }

    // Also update FRONTEND_URL in memory for sitemap
    if (frontendUrl) process.env.FRONTEND_URL = frontendUrl;

    res.json({ success: true, message: 'Site config updated', data: { config } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
