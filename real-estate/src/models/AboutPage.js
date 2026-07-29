/**
 * AboutPage Model
 * Singleton — one document only
 * Manages all content for the frontend About page
 */

const mongoose = require('mongoose');

const aboutPageSchema = new mongoose.Schema(
  {
    // ── Hero Section ──────────────────────────────────────────────
    hero: {
      heading:    { type: String, default: 'About Us' },
      subheading: { type: String, default: 'Your trusted real estate partner in Bangladesh' },
      image:      { type: String, default: '' },  // background image URL
    },

    // ── Company Overview ──────────────────────────────────────────
    overview: {
      title:       { type: String, default: 'Who We Are' },
      description: { type: String, default: '' },
      image:       { type: String, default: '' },
    },

    // ── Stats / Numbers ───────────────────────────────────────────
    stats: [
      {
        label: { type: String },
        value: { type: String },
        icon:  { type: String, default: 'building' },
      }
    ],

    // ── Mission & Vision ──────────────────────────────────────────
    mission: {
      title:       { type: String, default: 'Our Mission' },
      description: { type: String, default: '' },
    },
    vision: {
      title:       { type: String, default: 'Our Vision' },
      description: { type: String, default: '' },
    },

    // ── Why Choose Us ─────────────────────────────────────────────
    whyUs: {
      title:    { type: String, default: 'Why Choose Us' },
      subtitle: { type: String, default: '' },
      items: [
        {
          title:       { type: String },
          description: { type: String },
          icon:        { type: String, default: 'check' },
        }
      ],
    },

    // ── Team Members ──────────────────────────────────────────────
    team: {
      title:    { type: String, default: 'Meet Our Team' },
      subtitle: { type: String, default: '' },
      members: [
        {
          name:       { type: String },
          role:       { type: String },
          image:      { type: String, default: '' },
          bio:        { type: String, default: '' },
          facebook:   { type: String, default: '' },
          linkedin:   { type: String, default: '' },
          phone:      { type: String, default: '' },
        }
      ],
    },

    // ── Contact Info ──────────────────────────────────────────────
    contact: {
      address:  { type: String, default: '' },
      phone:    { type: String, default: '' },
      email:    { type: String, default: '' },
      mapEmbed: { type: String, default: '' },  // Google Maps embed URL
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AboutPage', aboutPageSchema);
