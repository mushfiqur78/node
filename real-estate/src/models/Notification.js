/**
 * Notification Model
 * In-app notifications for admin dashboard
 * Types: new_enquiry, property_submitted, property_approved, property_rejected, new_user
 */

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['new_enquiry', 'property_submitted', 'property_approved', 'property_rejected', 'new_user'],
      required: true,
      index: true,
    },
    title:   { type: String, required: true },
    message: { type: String, required: true },
    link:    { type: String },           // dashboard link to navigate to
    isRead:  { type: Boolean, default: false, index: true },

    // References
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
    user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    enquiry:  { type: mongoose.Schema.Types.ObjectId, ref: 'Enquiry' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
