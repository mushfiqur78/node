const mongoose = require('mongoose');

/**
 * SavedSearch Model
 * Allows users to save their search criteria and get alerts
 */
const savedSearchSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    filters: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    alertEnabled: {
      type: Boolean,
      default: true,
      index: true,
    },
    alertFrequency: {
      type: String,
      enum: ['instant', 'daily', 'weekly'],
      default: 'daily',
    },
    lastAlertSent: {
      type: Date,
      default: null,
    },
    matchCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Index for efficient queries
savedSearchSchema.index({ userId: 1, createdAt: -1 });
savedSearchSchema.index({ alertEnabled: 1, alertFrequency: 1 });

module.exports = mongoose.model('SavedSearch', savedSearchSchema);
