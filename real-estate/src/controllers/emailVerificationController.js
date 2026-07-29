/**
 * Email Verification Controller
 * Send verification email after registration
 * Verify email with token
 */

const crypto = require('crypto');
const User   = require('../models/User');

// ─── POST /api/auth/send-verification ────────────────────────────
exports.sendVerification = async (req, res) => {
  try {
    // Check if email verification is enabled
    const GeneralSetting = require('../models/GeneralSetting');
    const settings = await GeneralSetting.findOne();
    if (!settings?.emailVerificationRequired) {
      return res.status(400).json({ success: false, message: 'Email verification is not required' });
    }

    const user = await User.findById(req.user._id);

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Email already verified' });
    }

    const verifyToken  = crypto.randomBytes(32).toString('hex');
    const hashedToken  = crypto.createHash('sha256').update(verifyToken).digest('hex');

    user.emailVerifyToken  = hashedToken;
    user.emailVerifyExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await user.save({ validateBeforeSave: false });

    const SiteConfig = require('../models/SiteConfig');
    const config     = await SiteConfig.findOne();
    const frontendUrl = config?.frontendUrl || process.env.FRONTEND_URL || 'http://localhost:3001';
    const verifyUrl  = `${frontendUrl}/verify-email/${verifyToken}`;

    try {
      const { sendVerificationEmail } = require('../services/emailService');
      await sendVerificationEmail({ email: user.email, name: user.name, verifyUrl });
    } catch (emailErr) {
      return res.status(500).json({ success: false, message: 'Email could not be sent' });
    }

    res.json({ success: true, message: 'Verification email sent' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── GET /api/auth/verify-email/:token ───────────────────────────
exports.verifyEmail = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      emailVerifyToken:  hashedToken,
      emailVerifyExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
    }

    user.isVerified        = true;
    user.emailVerifyToken  = undefined;
    user.emailVerifyExpire = undefined;
    await user.save({ validateBeforeSave: false });

    res.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
