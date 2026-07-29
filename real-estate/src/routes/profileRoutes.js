/**
 * Profile Routes — Public
 */

const express = require('express');
const router  = express.Router();
const { getPublicProfile, getAgents } = require('../controllers/profileController');

router.get('/',    getAgents);
router.get('/:id', getPublicProfile);

module.exports = router;
