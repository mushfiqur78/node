/**
 * Purpose Model
 * Admin-configurable property purposes (e.g. sell, rent)
 * name field is used in business logic for pricing validation
 */
const mongoose = require('mongoose');

const purposeSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, unique: true, trim: true, lowercase: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Purpose', purposeSchema);
