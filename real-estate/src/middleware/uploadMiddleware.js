/**
 * Upload Middleware
 * Wraps multer for property image uploads
 * featuredImage: single file
 * gallery: up to 10 files
 */

const upload = require('../config/multer');

// For property create/update: accept featuredImage + gallery
const uploadPropertyImages = upload.fields([
  { name: 'featuredImage', maxCount: 1 },
  { name: 'gallery', maxCount: 10 },
]);

// Middleware wrapper with error handling
const handlePropertyUpload = (req, res, next) => {
  uploadPropertyImages(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

module.exports = { handlePropertyUpload };
