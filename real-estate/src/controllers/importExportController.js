/**
 * Import/Export Controller
 * Export: CSV/Excel with filters
 * Import: CSV/Excel with validation, duplicate handling
 * Template: downloadable sample file
 * Logs: history of all operations
 */

const Property        = require('../models/Property');
const Purpose         = require('../models/Purpose');
const Location        = require('../models/Location');
const PropertyType    = require('../models/PropertyType');
const ImportExportLog = require('../models/ImportExportLog');
const {
  parseSheet, parseJSON, mapRow, generateExport, generateTemplate, generateErrorReport,
} = require('../services/importExportService');

// ─── GET /api/v1/admin/import-export/template/:format ────────────
exports.downloadTemplate = (req, res) => {
  const fmt    = ['csv','excel','json'].includes(req.params.format) ? req.params.format : 'csv';
  const buffer = generateTemplate(fmt);

  const extMap  = { csv: 'csv', excel: 'xlsx', json: 'json' };
  const mimeMap = {
    csv:   'text/csv',
    excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    json:  'application/json',
  };

  res.setHeader('Content-Disposition', `attachment; filename="property-template.${extMap[fmt]}"`);
  res.setHeader('Content-Type', mimeMap[fmt]);
  res.send(buffer);
};

// ─── POST /api/v1/admin/import-export/export ─────────────────────
exports.exportProperties = async (req, res) => {
  try {
    const { format = 'csv', startDate, endDate, limit, status, source } = req.body;

    const filter = {};
    if (status) filter.status = status;
    if (source) filter.source = source;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate)   filter.createdAt.$lte = new Date(endDate);
    }

    let query = Property.find(filter).sort({ createdAt: -1 });
    if (limit) query = query.limit(Number(limit));

    const properties = await query;
    const buffer = generateExport(properties, ['csv','excel','json'].includes(format) ? format : 'csv');
    const extMap  = { csv: 'csv', excel: 'xlsx', json: 'json' };
    const mimeMap = {
      csv:   'text/csv',
      excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      json:  'application/json',
    };
    const fmt = ['csv','excel','json'].includes(format) ? format : 'csv';

    // Log
    await ImportExportLog.create({
      type: 'export', format: fmt,
      performedBy: req.user._id,
      exportedCount: properties.length,
      filters: { startDate, endDate, limit, status, source },
    });

    res.setHeader('Content-Disposition', `attachment; filename="properties-export-${Date.now()}.${extMap[fmt]}"`);
    res.setHeader('Content-Type', mimeMap[fmt]);
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Export failed', error: error.message });
  }
};

// ─── POST /api/v1/admin/import-export/import ─────────────────────
exports.importProperties = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'File is required' });

    const isJSON = req.file.mimetype === 'application/json' || req.file.originalname.endsWith('.json');
    const format = isJSON ? 'json' : (req.file.mimetype.includes('csv') || req.file.originalname.endsWith('.csv') ? 'csv' : 'excel');

    let rows;
    try {
      rows = isJSON ? parseJSON(req.file.buffer) : parseSheet(req.file.buffer, format);
    } catch (parseErr) {
      return res.status(400).json({ success: false, message: `File parse error: ${parseErr.message}` });
    }

    if (!rows.length) return res.status(400).json({ success: false, message: 'File is empty or invalid' });

    const onDuplicate = req.body.onDuplicate || 'skip';

    // Chunk processing for large files
    const CHUNK_SIZE = 50;
    let imported = 0, updated = 0, skipped = 0, failed = 0;
    const allErrors = [];

    // Pre-load reference data for validation
    const [purposes, locations, types] = await Promise.all([
      Purpose.find().lean(),
      Location.find().lean(),
      PropertyType.find().lean(),
    ]);

    const purposeMap  = Object.fromEntries(purposes.map(p => [p.name.toLowerCase(), p._id]));
    const locationMap = Object.fromEntries(locations.map(l => [l.name.toLowerCase(), l._id]));
    const typeMap     = Object.fromEntries(types.map(t => [t.name.toLowerCase(), t._id]));

    for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
      const chunk = rows.slice(i, i + CHUNK_SIZE);

      await Promise.all(chunk.map(async (row, chunkIdx) => {
        const rowIndex = i + chunkIdx + 2;
        const { data, errors } = mapRow(row, rowIndex);

        if (errors.length) {
          failed++;
          allErrors.push(...errors.map(e => ({ ...e, data: row })));
          return;
        }

        // Resolve reference fields by name OR ObjectId
        const mongoose = require('mongoose');
        if (data.purpose && typeof data.purpose === 'string') {
          if (mongoose.Types.ObjectId.isValid(data.purpose)) {
            // already an ObjectId string — keep as-is
          } else {
            data.purpose = purposeMap[data.purpose.toLowerCase()] || null;
          }
        }
        if (data.location && typeof data.location === 'string') {
          if (mongoose.Types.ObjectId.isValid(data.location)) {
            // already an ObjectId string — keep as-is
          } else {
            data.location = locationMap[data.location.toLowerCase()] || null;
          }
        }
        if (data.type && typeof data.type === 'string') {
          if (mongoose.Types.ObjectId.isValid(data.type)) {
            // already an ObjectId string — keep as-is
          } else {
            data.type = typeMap[data.type.toLowerCase()] || null;
          }
        }

        // Set defaults
        if (!data.status) data.status = 'pending';
        if (!data.source) data.source = 'admin';
        if (!data.createdByRole) data.createdByRole = 'super_admin';
        if (data.source === 'admin' && data.status === 'pending') data.status = 'approved';
        if (!data.owner) data.owner = req.user._id;
        // Handle featuredImage — accept object or set placeholder
        if (!data.featuredImage) {
          // Check if original row has featuredImage object
          if (row.featuredImage?.url) {
            data.featuredImage = { url: row.featuredImage.url, alt: row.featuredImage.alt || data.title || '' };
          } else {
            data.featuredImage = { url: '/uploads/placeholder.webp', alt: data.title };
          }
        }

        try {
          // Check duplicate by slug or propertyId
          const dupFilter = [];
          if (data.slug)       dupFilter.push({ slug: data.slug });
          if (data.propertyId) dupFilter.push({ propertyId: data.propertyId });

          const existing = dupFilter.length ? await Property.findOne({ $or: dupFilter }) : null;

          if (existing) {
            if (onDuplicate === 'update') {
              await Property.findByIdAndUpdate(existing._id, data);
              updated++;
            } else {
              skipped++;
            }
          } else {
            await Property.create(data);
            imported++;
          }
        } catch (err) {
          failed++;
          allErrors.push({ row: rowIndex, field: 'general', message: err.message, data: row });
        }
      }));
    }

    // Log
    const log = await ImportExportLog.create({
      type: 'import', format,
      performedBy: req.user._id,
      totalRows: rows.length,
      imported, updated, skipped, failed,
      errorRows: allErrors.slice(0, 100), // store max 100 errors
    });

    res.json({
      success: true,
      message: 'Import completed',
      data: {
        logId:    log._id,
        totalRows: rows.length,
        imported, updated, skipped, failed,
        haserrorRows: allErrors.length > 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Import failed', error: error.message });
  }
};

// ─── GET /api/v1/admin/import-export/logs ────────────────────────
exports.getLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip  = (Number(page) - 1) * Number(limit);
    const total = await ImportExportLog.countDocuments();

    const logs = await ImportExportLog.find()
      .populate('performedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ success: true, data: { logs, total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── GET /api/v1/admin/import-export/logs/:id/errors ─────────────
exports.downloadErrorReport = async (req, res) => {
  try {
    const log = await ImportExportLog.findById(req.params.id);
    if (!log) return res.status(404).json({ success: false, message: 'Log not found' });

    const errorData = log.errorRows || [];
    if (!errorData.length) return res.status(404).json({ success: false, message: 'No errors in this log' });

    const fmt    = req.query.format === 'json' ? 'json' : 'csv';
    const buffer = generateErrorReport(errorData, fmt);
    const ext    = fmt === 'json' ? 'json' : 'csv';
    const mime   = fmt === 'json' ? 'application/json' : 'text/csv';

    res.setHeader('Content-Disposition', `attachment; filename="import-errors-${log._id}.${ext}"`);
    res.setHeader('Content-Type', mime);
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
