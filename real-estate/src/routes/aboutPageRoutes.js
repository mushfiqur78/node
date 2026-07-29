const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/aboutPageController');

// Public
router.get('/', ctrl.getAboutPage);

module.exports = router;
