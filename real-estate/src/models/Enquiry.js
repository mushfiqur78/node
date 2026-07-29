/**
 * Enquiry Model
 * Guest or logged-in users can send enquiries on properties
 * No login required
 */

const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema(
  {
    property: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Property',
      required: false,
      index:    true,
    },
    name:    { type: String, required: true, trim: true },
    email:   { type: String, required: true, lowercase: true },
    phone:   { type: String },
    message: { type: String, required: true },
    isRead:  { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Enquiry', enquirySchema);
