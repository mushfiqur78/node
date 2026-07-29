const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/contactPageController');
router.get('/', ctrl.getContactPage);
module.exports = router;
