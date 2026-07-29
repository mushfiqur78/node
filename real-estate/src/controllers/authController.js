/**
 * Auth Controller - Frontend Users (owner & agent)
 * Handles register, login, profile for owner and agent roles only
 */

const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Only 'owner' role allowed for public registration
    // super_admin is created via seed only
    if (role && role !== 'owner') {
      return res.status(400).json({ success: false, message: 'Invalid role. Only owner registration is allowed.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({
      name, email, password, phone,
      role:       'owner',
      isApproved: true,
    });

    const token = generateToken(user._id);

    // Send welcome email
    try {
      const { sendWelcomeEmail } = require('../services/emailService');
      await sendWelcomeEmail({ email: user.email, name: user.name, role: user.role });
    } catch (emailErr) {
      console.error('[Email] Welcome email failed:', emailErr.message);
    }

    // In-app notification for admin
    try {
      const { notifyNewUser } = require('../services/notificationService');
      await notifyNewUser({ user });
    } catch {}

    // Bind referral code from cookie if present
    try {
      const refCode = req.cookies?.ref
        ? require('../utils/cookieSigner').verify(req.cookies.ref)
        : null;
      if (refCode) {
        const { bindOnSignup } = require('../controllers/referralController');
        await bindOnSignup(user._id, refCode);
      } else {
        // Create a blank referral profile so the user has a refCode to share
        const { Referral } = require('../models/Referral');
        const { generateRefCode } = require('../utils/codeGenerator');
        await Referral.findOneAndUpdate(
          { userId: user._id },
          { $setOnInsert: { userId: user._id, refCode: generateRefCode() } },
          { upsert: true, new: true }
        );
      }
    } catch (refErr) {
      console.error('[Referral] Bind on signup failed:', refErr.message);
    }

    // Auto-send verification email if enabled
    try {
      const GeneralSetting = require('../models/GeneralSetting');
      const settings = await GeneralSetting.findOne();
      if (settings?.emailVerificationRequired) {
        const crypto = require('crypto');
        const verifyToken  = crypto.randomBytes(32).toString('hex');
        const hashedToken  = crypto.createHash('sha256').update(verifyToken).digest('hex');
        user.emailVerifyToken  = hashedToken;
        user.emailVerifyExpire = Date.now() + 24 * 60 * 60 * 1000;
        await user.save({ validateBeforeSave: false });

        const SiteConfig  = require('../models/SiteConfig');
        const config      = await SiteConfig.findOne();
        const frontendUrl = config?.frontendUrl || process.env.FRONTEND_URL || 'http://localhost:3001';
        const verifyUrl   = `${frontendUrl}/verify-email/${verifyToken}`;

        const { sendVerificationEmail } = require('../services/emailService');
        await sendVerificationEmail({ email: user.email, name: user.name, verifyUrl });
      }
    } catch (verifyErr) {
      console.error('[Email] Verification email failed:', verifyErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Block super_admin from frontend login
    if (user.role === 'super_admin') {
      return res.status(403).json({ success: false, message: 'Please use the admin panel to login' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account has been suspended' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  res.json({ success: true, message: 'Profile fetched', data: { user: req.user } });
};

// POST /api/auth/upload-avatar
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }

    const { processAndSave } = require('../services/imageService');
    const media = await processAndSave(
      req.file,
      { alt: req.user.name, title: 'Avatar' },
      req.user._id
    );

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: media.url },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Avatar updated',
      data: { user, avatarUrl: media.url },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// PUT /api/auth/update-profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, avatar },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ success: true, message: 'Profile updated', data: { user } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// POST /api/auth/change-password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
