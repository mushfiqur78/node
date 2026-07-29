/**
 * Simple Health Check - No Database Connection
 * This will help verify if the basic setup works
 */

module.exports = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Health check passed!',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'not set'
  });
};
