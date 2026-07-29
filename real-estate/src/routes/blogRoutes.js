/**
 * Blog Routes
 * Public: GET published blogs, single post
 * Admin: full CRUD (protected)
 */

const express = require('express');
const router  = express.Router();
const { getBlogs, getBlog } = require('../controllers/blogController');

// Public
router.get('/',      getBlogs);
router.get('/:slug', getBlog);

module.exports = router;