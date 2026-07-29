/**
 * Banner Routes — Public
 */
const express = require('express');
const router  = express.Router();
const { getBanners } = require('../controllers/bannerController');
router.get('/', getBanners);
module.exports = router;
