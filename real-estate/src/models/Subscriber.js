const mongoose = require('mongoose');

const subscriberSchema = new mongoose.Schema(
  {
    name:      { type: String, trim: true, default: '' },
    email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
    isActive:  { type: Boolean, default: true },
    source:    { type: String, default: 'newsletter' }, // newsletter, footer, etc.
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subscriber', subscriberSchema);
