/**
 * User Model
 * Roles: super_admin, owner
 * Scalable: add new roles to enum array when needed
 * super_admin: admin panel only, full access
 * owner: frontend users, can upload/manage own properties
 */

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

// ─── Allowed roles — add new roles here when needed ───────────────
const ROLES = ['super_admin', 'owner'];

const userSchema = new mongoose.Schema(
  {
    // Basic Info
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 8 },
    phone:    { type: String },
    avatar:   { type: String },

    // Role — scalable: add to ROLES array above to support new roles
    role: {
      type:    String,
      enum:    ROLES,
      default: 'owner',
    },

    // Account Status
    isVerified: { type: Boolean, default: false }, // future email verification
    isApproved: { type: Boolean, default: true },  // true by default, can be used for future roles
    isActive:   { type: Boolean, default: true },  // ban/unban

    // Password Reset
    resetPasswordToken:   { type: String },
    resetPasswordExpire:  { type: Date },

    // Email Verification
    emailVerifyToken:     { type: String },
    emailVerifyExpire:    { type: Date },

    // Extra Info — flexible object for future role-specific data
    // e.g. { licenseNumber, agency } for future 'agent' role
    extraInfo: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
