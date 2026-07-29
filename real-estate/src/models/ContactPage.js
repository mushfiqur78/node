/**
 * ContactPage Model — Singleton
 * Controls all content on the frontend Contact Us page
 */
const mongoose = require('mongoose');

const contactPageSchema = new mongoose.Schema(
  {
    hero: {
      heading:    { type: String, default: 'Contact Us' },
      subheading: { type: String, default: 'We are here to help you find your dream property' },
    },
    // Office locations (multiple)
    offices: [
      {
        label:   { type: String },   // e.g. "Head Office"
        address: { type: String },
        phone:   { type: String },
        email:   { type: String },
        hours:   { type: String },   // e.g. "Sat–Thu: 9am–6pm"
      }
    ],
    // Google Maps embed URL
    mapEmbed: { type: String, default: '' },
    // Social links
    social: {
      facebook:  { type: String, default: '' },
      instagram: { type: String, default: '' },
      linkedin:  { type: String, default: '' },
      whatsapp:  { type: String, default: '' },
    },
    // Whether to show the enquiry form
    showForm:    { type: Boolean, default: true },
    formHeading: { type: String, default: 'Send Us a Message' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ContactPage', contactPageSchema);
