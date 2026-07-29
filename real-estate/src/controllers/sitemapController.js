/**
 * Sitemap Controller
 * Dynamic XML sitemap for SEO
 * Includes: static pages, properties, blog posts
 * Served at GET /sitemap.xml
 */

const Property = require('../models/Property');
const Blog     = require('../models/Blog');

const escapeXml = (str) => String(str || '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const urlEntry = (loc, lastmod, changefreq = 'weekly', priority = '0.7') => `
  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;

exports.getSitemap = async (req, res) => {
  try {
    const BASE = process.env.FRONTEND_URL || 'https://yourdomain.com';
    const now  = new Date().toISOString().split('T')[0];

    const urls = [];

    // ── Static pages ──────────────────────────────────────────────
    const staticPages = [
      { path: '/',          changefreq: 'daily',   priority: '1.0' },
      { path: '/properties',changefreq: 'daily',   priority: '0.9' },
      { path: '/blog',      changefreq: 'weekly',  priority: '0.8' },
      { path: '/agents',    changefreq: 'weekly',  priority: '0.7' },
      { path: '/about',     changefreq: 'monthly', priority: '0.6' },
      { path: '/contact',   changefreq: 'monthly', priority: '0.6' },
    ];

    staticPages.forEach(({ path, changefreq, priority }) => {
      urls.push(urlEntry(`${BASE}${path}`, now, changefreq, priority));
    });

    // ── Properties ────────────────────────────────────────────────
    const properties = await Property.find({ status: 'approved', source: 'marketplace' })
      .select('slug updatedAt')
      .lean();

    properties.forEach(p => {
      if (p.slug) {
        const lastmod = p.updatedAt ? new Date(p.updatedAt).toISOString().split('T')[0] : now;
        urls.push(urlEntry(`${BASE}/properties/${p.slug}`, lastmod, 'weekly', '0.8'));
      }
    });

    // ── Blog posts ────────────────────────────────────────────────
    const blogs = await Blog.find({ status: 'published' })
      .select('slug updatedAt')
      .lean();

    blogs.forEach(b => {
      if (b.slug) {
        const lastmod = b.updatedAt ? new Date(b.updatedAt).toISOString().split('T')[0] : now;
        urls.push(urlEntry(`${BASE}/blog/${b.slug}`, lastmod, 'monthly', '0.7'));
      }
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    res.status(500).send('Error generating sitemap');
  }
};
