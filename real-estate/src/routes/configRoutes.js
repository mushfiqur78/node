/**
 * Config Routes
 * Public: GET active items (for frontend dropdowns)
 * Admin: full CRUD (protected)
 */

const express = require('express');
const router  = express.Router();
const { getAll, create, update, remove, toggleActive } = require('../controllers/configController');

// Public — frontend uses these for dropdowns (active only)
router.get('/public/:resource', async (req, res, next) => {
  req.query.isActive = 'true';
  next();
}, getAll);

// Public — get single location by slug
router.get('/public/locations/slug/:slug', async (req, res) => {
  try {
    const Location = require('../models/Location');
    const location = await Location.findOne({ slug: req.params.slug, isActive: true });
    if (!location) return res.status(404).json({ success: false, message: 'Location not found' });
    res.json({ success: true, data: { location } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Admin CRUD
router.get('/:resource',              getAll);
router.post('/:resource',             create);
router.put('/:resource/:id',          update);
router.delete('/:resource/:id',       remove);
router.patch('/:resource/:id/toggle', toggleActive);

module.exports = router;
