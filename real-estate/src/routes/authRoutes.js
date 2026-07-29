/**
 * Auth Routes - Frontend Users (owner)
 * Register, Login, Profile, Password Reset, Email Verification, Token Refresh
 */

const express = require('express');
const router  = express.Router();
const { register, login, getMe, updateProfile, changePassword, uploadAvatar } = require('../controllers/authController');
const { forgotPassword, resetPassword, verifyResetToken }       = require('../controllers/passwordResetController');
const { sendVerification, verifyEmail }                          = require('../controllers/emailVerificationController');
const { refreshToken }                                           = require('../controllers/tokenController');
const { protect }                                                = require('../middleware/auth');
const upload                                                     = require('../config/multer');
const {
  validate, registerRules, loginRules,
  changePasswordRules, forgotPasswordRules, resetPasswordRules,
} = require('../middleware/validate');

// ── Auth ──────────────────────────────────────────────────────────
router.post('/register',        registerRules,       validate, register);
router.post('/login',           loginRules,          validate, login);
router.get('/me',               protect, getMe);
router.put('/update-profile',   protect, updateProfile);
router.post('/change-password', protect, changePasswordRules, validate, changePassword);
router.post('/upload-avatar',   protect, upload.single('avatar'), uploadAvatar);

// ── Password Reset ────────────────────────────────────────────────
router.post('/forgot-password',          forgotPasswordRules, validate, forgotPassword);
router.get('/verify-reset-token/:token', verifyResetToken);
router.post('/reset-password/:token',    resetPasswordRules,  validate, resetPassword);

// ── Email Verification ────────────────────────────────────────────
router.post('/send-verification', protect, sendVerification);
router.get('/verify-email/:token',        verifyEmail);

// ── Token Refresh ─────────────────────────────────────────────────
router.post('/refresh-token', refreshToken);

module.exports = router;
