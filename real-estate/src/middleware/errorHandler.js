/**
 * Global Error Handler Middleware
 * Catches all unhandled errors and returns consistent response
 * Must be registered LAST in app.js
 */

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message    = err.message    || 'Server Error';

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    statusCode = 400;
    message    = 'Invalid ID format';
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message    = `${field} already exists`;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message    = Object.values(err.errors).map(e => e.message).join(', ');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError')  { statusCode = 401; message = 'Invalid token'; }
  if (err.name === 'TokenExpiredError')  { statusCode = 401; message = 'Token expired'; }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE')    { statusCode = 400; message = 'File too large (max 10MB)'; }
  if (err.code === 'LIMIT_FILE_COUNT')   { statusCode = 400; message = 'Too many files'; }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') { statusCode = 400; message = 'Unexpected file field'; }

  console.error(`[Error] ${statusCode} — ${message}`, process.env.NODE_ENV === 'development' ? err.stack : '');

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
