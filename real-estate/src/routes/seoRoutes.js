/**
 * SEO Routes — Public
 * GET /api/seo/:page → fetch SEO settings for a specific page
 */

const express = require('express');
const router  = express.Router();
const { getSeoByPage } = require('../controllers/seoController');

router.get('/:page', getSeoByPage);

module.exports = router;
