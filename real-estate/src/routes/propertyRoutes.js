/**
 * Property Routes - Frontend users (owner & agent)
 * Public: GET all approved, GET single
 * Protected: create, update, delete, my properties
 */

const express = require('express');
const router = express.Router();
const {
  createProperty,
  getProperties,
  getProperty,
  getPropertyBySlug,
  getRelatedProperties,
  updateProperty,
  deleteProperty,
  getMyProperties,
} = require('../controllers/propertyController');
const { protect, isApproved } = require('../middleware/auth');
const { handlePropertyUpload } = require('../middleware/uploadMiddleware');

// Public routes
router.get('/',              getProperties);
router.get('/my',            protect, getMyProperties);
router.get('/slug/:slug',    getPropertyBySlug);
router.get('/:id/related',   getRelatedProperties);
router.get('/:id',           getProperty);

// Protected routes (owner & agent, agent must be approved)
router.post('/',    protect, isApproved, handlePropertyUpload, createProperty);
router.put('/:id',  protect, isApproved, handlePropertyUpload, updateProperty);
router.delete('/:id', protect, deleteProperty);

module.exports = router;
