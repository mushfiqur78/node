/**
 * Feature Model
 * Admin-configurable property features
 * Used for primaryFeatures, amenities, otherFeatures
 * category field groups features for frontend display
 */
const mongoose = require('mongoose');

const featureSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, unique: true, trim: true },
    category: {
      type: String,
      enum: ['primary', 'amenity', 'other'],
      default: 'other',
    },
    icon:     { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Feature', featureSchema);
