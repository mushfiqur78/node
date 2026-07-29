const ContactPage = require('../models/ContactPage');

// GET /api/v1/contact-page — public
exports.getContactPage = async (req, res) => {
  try {
    let page = await ContactPage.findOne();
    if (!page) page = await ContactPage.create({});
    res.json({ success: true, data: { page } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// GET /api/v1/admin/contact-page — admin
exports.adminGet = async (req, res) => {
  try {
    let page = await ContactPage.findOne();
    if (!page) page = await ContactPage.create({});
    res.json({ success: true, data: { page } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// PUT /api/v1/admin/contact-page — admin update
exports.adminUpdate = async (req, res) => {
  try {
    const body = req.body;
    ['offices', 'social', 'hero'].forEach(k => {
      if (body[k] && typeof body[k] === 'string') {
        try { body[k] = JSON.parse(body[k]); } catch {}
      }
    });
    let page = await ContactPage.findOne();
    if (page) { Object.assign(page, body); await page.save(); }
    else page = await ContactPage.create(body);
    res.json({ success: true, message: 'Contact page updated', data: { page } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
