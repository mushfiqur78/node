const express    = require('express');
const router     = express.Router();
const ctrl       = require('../controllers/referralController');
const { protect, optionalAuth } = require('../middleware/auth');
const { validateTrackClick } = require('../middleware/referralValidation');

// Public — sets referral cookie (optional auth to prevent self-referral tracking)
router.post('/click', optionalAuth, validateTrackClick, ctrl.trackClick);

// Protected
router.get('/me',           protect, ctrl.getMyReferral);
router.get('/my-referrals', protect, ctrl.getMyReferrals);
router.get('/earnings',     protect, ctrl.getEarnings);
router.get('/performance',  protect, ctrl.getPerformance);
router.patch('/toggle-active', protect, ctrl.toggleActive);
router.patch('/set-expiry',    protect, ctrl.setExpiry);

module.exports = router;
