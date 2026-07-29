/**
 * GeneralSetting Model
 * Single document — site-wide settings
 * Uses singleton pattern (only one record)
 */

const mongoose = require('mongoose');

const generalSettingSchema = new mongoose.Schema(
  {
    // Site Identity
    siteName:    { type: String, trim: true, default: 'Real Estate' },
    siteTagline: { type: String, trim: true },
    siteLogo:    { type: String },  // URL
    favicon:     { type: String },  // URL

    // Contact Info
    email:       { type: String, trim: true, lowercase: true },
    phone:       { type: String, trim: true },
    whatsapp:    { type: String, trim: true },
    address:     { type: String, trim: true },

    // Social Links
    social: {
      facebook:  { type: String, trim: true },
      instagram: { type: String, trim: true },
      twitter:   { type: String, trim: true },
      linkedin:  { type: String, trim: true },
      youtube:   { type: String, trim: true },
    },

    // Footer
    footerText:    { type: String, trim: true },
    copyrightText: { type: String, trim: true },

    // Scripts (analytics, chat widgets etc.)
    headerScripts: { type: String }, // injected in <head>
    footerScripts: { type: String }, // injected before </body>

    // Maintenance
    maintenanceMode: { type: Boolean, default: false },

    // Email Notifications — granular control
    emailNotifications: { type: Boolean, default: false },

    // Individual notification toggles
    notifyEnquiry:         { type: Boolean, default: false },
    notifyPropertySubmit:  { type: Boolean, default: false },
    notifyPropertyApproved:{ type: Boolean, default: false },
    notifyPropertyRejected:{ type: Boolean, default: false },

    // Email Verification (require users to verify email after registration)
    emailVerificationRequired: { type: Boolean, default: false },

    // Email Templates (customizable)
    emailTemplates: {
      // Verification email
      verificationSubject: { type: String, default: 'Verify Your Email Address' },
      verificationBody:    { type: String, default: 'Thank you for registering! Please verify your email address by clicking the button below.' },
      // Welcome email
      welcomeSubject:      { type: String, default: 'Welcome to Real Estate Platform!' },
      welcomeBody:         { type: String, default: 'Thank you for joining our real estate platform.' },
      // Enquiry notification (to admin)
      enquirySubject:      { type: String, default: 'New Property Enquiry' },
      enquiryBody:         { type: String, default: 'You have received a new enquiry for the property.' },
      // Property submitted (to admin)
      propertySubmitSubject: { type: String, default: 'New Property Submitted for Review' },
      propertySubmitBody:    { type: String, default: 'A new property has been submitted and is awaiting your approval.' },
      // Property approved (to owner)
      propertyApprovedSubject: { type: String, default: 'Your Property Has Been Approved' },
      propertyApprovedBody:    { type: String, default: 'Your property has been approved and is now live on our platform.' },
      // Property rejected (to owner)
      propertyRejectedSubject: { type: String, default: 'Your Property Was Not Approved' },
      propertyRejectedBody:    { type: String, default: 'Unfortunately, your property has not been approved. Please contact support for more information.' },
    },

    // Homepage hero display mode
    homepageHeroMode: {
      type:    String,
      enum:    ['banner', 'slider'],
      default: 'slider',
    },

    // Property Expiry Warning — days before expiry to show warning
    expiryWarningDays: { type: Number, default: 7 },

    // Auto Expiry Configuration
    autoExpiryEnabled:  { type: Boolean, default: false },
    autoExpiryDuration: { type: Number,  default: 90 },
    autoExpiryUnit:     { type: String,  enum: ['days', 'months'], default: 'days' },

    // SMTP Configuration (stored in DB, overrides .env)
    smtp: {
      host:     { type: String, trim: true },
      port:     { type: Number, default: 587 },
      user:     { type: String, trim: true },
      pass:     { type: String },           // stored as-is (use HTTPS in production)
      from:     { type: String, trim: true }, // "Site Name <email>"
      secure:   { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('GeneralSetting', generalSettingSchema);
