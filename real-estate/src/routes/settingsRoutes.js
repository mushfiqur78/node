/**
 * Settings Routes — Public
 * GET /api/settings → site-wide settings for frontend
 */

const express = require('express');
const router  = express.Router();
const { getSettings } = require('../controllers/generalSettingController');

router.get('/', getSettings);

module.exports = router;
