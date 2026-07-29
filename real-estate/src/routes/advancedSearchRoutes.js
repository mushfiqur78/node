const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/advancedSearchController');
const { protect, optionalAuth } = require('../middleware/auth');

// ─── Public Routes ────────────────────────────────────────────────
// Advanced search (POST for complex filters)
router.post('/search', ctrl.advancedSearch);

// Search suggestions (autocomplete)
router.get('/search/suggestions', ctrl.getSearchSuggestions);

// Get available filter options with counts
router.get('/search/filters', ctrl.getAvailableFilters);

// Popular searches and trending properties
router.get('/search/popular', ctrl.getPopularSearches);

// ─── Protected Routes (Saved Searches) ────────────────────────────
// Save a search
router.post('/search/save', protect, ctrl.saveSearch);

// Get all saved searches
router.get('/search/saved', protect, ctrl.getSavedSearches);

// Get specific saved search with results
router.get('/search/saved/:id', protect, ctrl.getSavedSearchById);

// Update saved search
router.patch('/search/saved/:id', protect, ctrl.updateSavedSearch);

// Delete saved search
router.delete('/search/saved/:id', protect, ctrl.deleteSavedSearch);

module.exports = router;
