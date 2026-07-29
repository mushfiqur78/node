/**
 * Config Controller
 * Generic CRUD for all admin-configurable reference models:
 * PropertyType, Location, Label, Purpose, Feature
 * Uses a factory pattern to avoid code duplication
 */

const PropertyType = require('../models/PropertyType');
const Location     = require('../models/Location');
const Status       = require('../models/Label');
const Purpose      = require('../models/Purpose');
const Feature      = require('../models/Feature');
const BlogCategory = require('../models/BlogCategory');

const MODEL_MAP = {
  'property-types':  PropertyType,
  'locations':       Location,
  'statuses':        Status,
  'purposes':        Purpose,
  'features':        Feature,
  'blog-categories': BlogCategory,
};

// Resolve model from route param
const getModel = (key) => MODEL_MAP[key];

// GET /api/admin/config/:resource
exports.getAll = async (req, res) => {
  try {
    const Model = getModel(req.params.resource);
    if (!Model) return res.status(404).json({ success: false, message: 'Resource not found' });

    const { isActive, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (isActive !== undefined && isActive !== '') filter.isActive = isActive === 'true';

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Model.countDocuments(filter);
    const items = await Model.find(filter).skip(skip).limit(Number(limit)).sort({ createdAt: -1 });

    res.json({ success: true, message: 'Fetched', data: { items, total } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// POST /api/admin/config/:resource
exports.create = async (req, res) => {
  try {
    const Model = getModel(req.params.resource);
    if (!Model) return res.status(404).json({ success: false, message: 'Resource not found' });

    const item = await Model.create(req.body);
    res.status(201).json({ success: true, message: 'Created', data: { item } });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Name already exists' });
    }
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// PUT /api/admin/config/:resource/:id
exports.update = async (req, res) => {
  try {
    const Model = getModel(req.params.resource);
    if (!Model) return res.status(404).json({ success: false, message: 'Resource not found' });

    const item = await Model.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    res.json({ success: true, message: 'Updated', data: { item } });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Name already exists' });
    }
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// DELETE /api/admin/config/:resource/:id
exports.remove = async (req, res) => {
  try {
    const Model = getModel(req.params.resource);
    if (!Model) return res.status(404).json({ success: false, message: 'Resource not found' });

    const item = await Model.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// PATCH /api/admin/config/:resource/:id/toggle — toggle isActive
exports.toggleActive = async (req, res) => {
  try {
    const Model = getModel(req.params.resource);
    if (!Model) return res.status(404).json({ success: false, message: 'Resource not found' });

    const item = await Model.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    item.isActive = !item.isActive;
    await item.save();

    res.json({ success: true, message: `${item.isActive ? 'Activated' : 'Deactivated'}`, data: { item } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
