/**
 * ImportExportLog Model
 * Tracks all import/export operations
 * Who, when, what type, results
 */

const mongoose = require('mongoose');

const importExportLogSchema = new mongoose.Schema(
  {
    type:       { type: String, enum: ['import', 'export'], required: true },
    format:     { type: String, enum: ['csv', 'excel', 'json'], required: true },
    performedBy:{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Import stats
    totalRows:    { type: Number, default: 0 },
    imported:     { type: Number, default: 0 },
    updated:      { type: Number, default: 0 },
    skipped:      { type: Number, default: 0 },
    failed:       { type: Number, default: 0 },

    // Export stats
    exportedCount: { type: Number, default: 0 },

    // Error details for download
    errorRows: [{ row: Number, field: String, message: String, data: mongoose.Schema.Types.Mixed }],

    // Filters used (for export)
    filters: { type: mongoose.Schema.Types.Mixed },

    status: { type: String, enum: ['processing', 'completed', 'failed'], default: 'completed' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ImportExportLog', importExportLogSchema);
