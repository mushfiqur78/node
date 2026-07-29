const express    = require('express');
const router     = express.Router();
const ctrl       = require('../controllers/couponController');
const { protect } = require('../middleware/auth');

// Public — list active public coupons (no auth required)
router.get('/public', ctrl.getPublicCoupons);

// User-facing (authenticated)
router.get( '/check',   protect, ctrl.checkCoupon);
router.post('/apply',   protect, ctrl.applyCoupon);
router.post('/confirm', protect, ctrl.confirmCoupon);
router.post('/cancel',  protect, ctrl.cancelCoupon);

module.exports = router;
