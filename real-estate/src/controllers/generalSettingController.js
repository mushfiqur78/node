/**
 * General Setting Controller
 * Singleton pattern — always one document
 * Public : GET settings
 * Admin  : GET + upsert + logo upload
 */

const GeneralSetting = require('../models/GeneralSetting');
const { processAndSave } = require('../services/imageService');

// ─── GET /api/settings — public ──────────────────────────────────
exports.getSettings = async (req, res) => {
  try {
    let settings = await GeneralSetting.findOne();
    if (!settings) settings = await GeneralSetting.create({});
    res.json({ success: true, message: 'Settings fetched', data: { settings } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── PUT /api/admin/settings — admin upsert ───────────────────────
exports.updateSettings = async (req, res) => {
  try {
    const body = { ...req.body };

    // Parse social if JSON string
    if (body.social && typeof body.social === 'string') {
      body.social = JSON.parse(body.social);
    }

    // Parse smtp if JSON string
    if (body.smtp && typeof body.smtp === 'string') {
      body.smtp = JSON.parse(body.smtp);
    }

    // Parse emailTemplates if JSON string
    if (body.emailTemplates && typeof body.emailTemplates === 'string') {
      body.emailTemplates = JSON.parse(body.emailTemplates);
    }

    // Handle logo upload
    if (req.files?.siteLogo?.[0]) {
      const media = await processAndSave(req.files.siteLogo[0], { alt: 'Site Logo' }, req.user._id);
      body.siteLogo = media.url;
    }

    // Handle favicon upload
    if (req.files?.favicon?.[0]) {
      const media = await processAndSave(req.files.favicon[0], { alt: 'Favicon' }, req.user._id);
      body.favicon = media.url;
    }

    let settings = await GeneralSetting.findOne();
    if (settings) {
      Object.assign(settings, body);
      await settings.save();
    } else {
      settings = await GeneralSetting.create(body);
    }

    res.json({ success: true, message: 'Settings updated', data: { settings } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── POST /api/admin/settings/test-email ─────────────────────────
exports.testEmail = async (req, res) => {
  try {
    const { sendEmail } = require('../services/emailService');
    const adminEmail = req.body.email || req.user.email;

    // Temporarily bypass the enabled check for test
    const nodemailer = require('nodemailer');
    const GeneralSetting = require('../models/GeneralSetting');
    const settings = await GeneralSetting.findOne();

    let transportConfig;
    if (settings?.smtp?.host && settings?.smtp?.user && settings?.smtp?.pass) {
      transportConfig = {
        host:   settings.smtp.host,
        port:   settings.smtp.port || 587,
        secure: settings.smtp.secure || false,
        auth:   { user: settings.smtp.user, pass: settings.smtp.pass },
      };
    } else if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      transportConfig = {
        host:   process.env.SMTP_HOST,
        port:   Number(process.env.SMTP_PORT) || 587,
        secure: false,
        auth:   { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      };
    } else {
      return res.status(400).json({ success: false, message: 'SMTP not configured' });
    }

    const transporter = nodemailer.createTransport(transportConfig);
    const from = settings?.smtp?.from || process.env.EMAIL_FROM || 'Real Estate <noreply@example.com>';

    await transporter.sendMail({
      from,
      to:      adminEmail,
      subject: 'Test Email — SMTP Configuration',
      html:    `<p>Your SMTP configuration is working correctly! ✅</p><p>Sent at: ${new Date().toLocaleString()}</p>`,
    });

    res.json({ success: true, message: `Test email sent to ${adminEmail}` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'SMTP test failed', error: error.message });
  }
};
