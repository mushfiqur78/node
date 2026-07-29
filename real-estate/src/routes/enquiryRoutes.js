/**
 * Enquiry Routes — Public
 */

const express = require('express');
const router  = express.Router();
const { submitEnquiry, submitGeneralEnquiry } = require('../controllers/enquiryController');
const { validate, enquiryRules } = require('../middleware/validate');

router.post('/',         enquiryRules, validate, submitEnquiry);
router.post('/general',  submitGeneralEnquiry);

module.exports = router;
