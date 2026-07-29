const express    = require('express');
const router     = express.Router();
const ctrl       = require('../controllers/referralLeadController');
const { optionalAuth } = require('../middleware/auth');
const { validateSubmitLead } = require('../middleware/referralValidation');

// Public — guests can submit leads, token optional
router.post('/', optionalAuth, validateSubmitLead, ctrl.submitLead);

module.exports = router;
