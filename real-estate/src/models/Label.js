/**
 * Status Model (formerly Label)
 * Admin-configurable property status tags (e.g. Featured, Hot Deal, New Launch)
 */
const mongoose = require('mongoose');

const statusSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, unique: true, trim: true },
    color:    { type: String, default: '#000000' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Status', statusSchema);
