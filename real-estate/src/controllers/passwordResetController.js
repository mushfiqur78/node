/**
 * Password Reset Controller
 * Forgot password → email with reset link
 * Reset password → verify token → set new password
 */

const crypto = require('crypto');
const User   = require('../models/User');
const jwt    = require('jsonwebtoken');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// ─── POST /api/auth/forgot-password ──────────────────────────────
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const user = await User.findOne({ email });

    // Don't reveal if email exists
    if (!user) {
      return res.json({ success: true, message: 'If this email exists, a reset link has been sent' });
    }

    if (user.role === 'super_admin') {
      return res.status(403).json({ success: false, message: 'Use admin panel for password reset' });
    }

    // Generate token
    const resetToken  = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken  = hashedToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 min
    await user.save({ validateBeforeSave: false });

    const SiteConfig = require('../models/SiteConfig');
    const config     = await SiteConfig.findOne();
    const frontendUrl = config?.frontendUrl || process.env.FRONTEND_URL || 'http://localhost:3001';
    const resetUrl   = `${frontendUrl}/reset-password/${resetToken}`;

    try {
      const { sendPasswordResetEmail } = require('../services/emailService');
      await sendPasswordResetEmail({ email: user.email, name: user.name, resetUrl });
    } catch (emailErr) {
      user.resetPasswordToken  = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ success: false, message: 'Email could not be sent. Check SMTP settings.' });
    }

    res.json({ success: true, message: 'Password reset link sent to your email' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── POST /api/auth/reset-password/:token ────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }

    // Hash the token from URL to compare with DB
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken:  hashedToken,
      resetPasswordExpire: { $gt: Date.now() }, // not expired
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    // Set new password
    user.password            = password;
    user.resetPasswordToken  = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Password reset successful',
      data: {
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── GET /api/auth/verify-reset-token/:token — check if token valid
exports.verifyResetToken = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken:  hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    res.json({ success: true, message: 'Token is valid', data: { email: user.email } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
