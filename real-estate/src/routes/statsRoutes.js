/**
 * Stats Routes
 * Public routes for site statistics
 */

const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

// GET /api/stats/site - Get site statistics
router.get('/site', statsController.getSiteStats);

module.exports = router;
