/**
 * Geo Lookup Job
 * Resolves IP → location for unresolved ReferralClicks.
 * Runs every 5 minutes. Idempotent — marks each click resolved after success.
 * Uses ipapi.co free tier (no API key needed for low volume).
 */
const https  = require('https');
const { ReferralClick } = require('../models/Referral');

const GEO_API_URL = process.env.GEO_API_URL || 'https://ipapi.co';

const fetchGeo = (ip) =>
  new Promise((resolve) => {
    const url = `${GEO_API_URL}/${ip}/json/`;
    https.get(url, (res) => {
      let raw = '';
      res.on('data', (c) => (raw += c));
      res.on('end', () => {
        try {
          const json = JSON.parse(raw);
          if (json.error) return resolve(null);
          resolve({
            country: json.country_name || null,
            city:    json.city         || null,
            lat:     json.latitude     || null,
            lon:     json.longitude    || null,
          });
        } catch { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });

const PRIVATE_IP = /^(127\.|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|::1|localhost)/;

const run = async () => {
  const clicks = await ReferralClick.find({ geoResolved: false }).limit(50).lean();
  let resolved = 0;

  for (const click of clicks) {
    // Skip private/local IPs — mark resolved so they don't loop
    if (!click.ip || click.ip === 'unknown' || PRIVATE_IP.test(click.ip)) {
      await ReferralClick.findByIdAndUpdate(click._id, { geoResolved: true });
      continue;
    }

    const geo = await fetchGeo(click.ip);
    await ReferralClick.findByIdAndUpdate(click._id, {
      geo:         geo || {},
      geoResolved: true,
    });
    if (geo) resolved++;

    // Throttle — respect free-tier rate limits
    await new Promise((r) => setTimeout(r, 250));
  }

  return resolved;
};

module.exports = { run };
