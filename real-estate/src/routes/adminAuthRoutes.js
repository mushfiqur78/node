/**
 * Admin Auth Routes - Admin Panel Only (super_admin)
 */

const express = require('express');
const router = express.Router();
const { adminLogin, adminMe } = require('../controllers/adminAuthController');
const { protect } = require('../middleware/auth');

router.post('/login', adminLogin);
router.get('/me',     protect, adminMe);

module.exports = router;
