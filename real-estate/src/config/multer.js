/**
 * Multer Configuration
 * Memory storage — files processed by Sharp before saving to disk
 * Accepts: jpg, jpeg, png only
 */

const multer = require('multer');
const path = require('path');

const ALLOWED_TYPES = [
  'image/jpeg', 'image/jpg', 'image/png',
  'text/csv', 'application/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const fileFilter = (req, file, cb) => {
  const isImage = ['image/jpeg', 'image/jpg', 'image/png'].includes(file.mimetype);
  const isSpreadsheet = [
    'text/csv', 'application/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ].includes(file.mimetype) || file.originalname.match(/\.(csv|xlsx|xls)$/i);

  const isJSON = file.mimetype === 'application/json' || file.originalname.endsWith('.json');

  if (isImage || isSpreadsheet || isJSON) {
    cb(null, true);
  } else {
    cb(new Error('Only jpg, jpeg, png, csv, xlsx, json formats are allowed'), false);
  }
};

const upload = multer({
  storage: multer.memoryStorage(), // keep in memory for Sharp processing
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
  fileFilter,
});

module.exports = upload;
