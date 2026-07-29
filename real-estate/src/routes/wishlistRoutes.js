/**
 * Wishlist Routes — Protected (login required)
 */

const express = require('express');
const router  = express.Router();
const { getWishlist, toggleWishlist, checkWishlist, clearWishlist } = require('../controllers/wishlistController');
const { protect } = require('../middleware/auth');

router.use(protect); // all routes require login

router.get('/',                      getWishlist);
router.post('/:propertyId',          toggleWishlist);
router.get('/check/:propertyId',     checkWishlist);
router.delete('/clear',              clearWishlist);

module.exports = router;
