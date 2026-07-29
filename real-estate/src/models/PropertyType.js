/**
 * PropertyType Model
 * Admin-configurable property types (e.g. Apartment, Villa, Office)
 */
const mongoose = require('mongoose');

const propertyTypeSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, unique: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PropertyType', propertyTypeSchema);
