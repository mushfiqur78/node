/**
 * Menu Routes — Public
 * GET /api/menus → active menus as nested tree
 */

const express = require('express');
const router  = express.Router();
const { getMenus } = require('../controllers/menuController');

router.get('/', getMenus);

module.exports = router;
