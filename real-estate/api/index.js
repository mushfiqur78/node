/**
 * Vercel Serverless Function Entry Point
 * This file exports the Express app for Vercel's serverless environment
 */

// Load environment variables first
require('dotenv').config();

// Set Vercel environment flag
process.env.VERCEL = 'true';
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// Import Express app
let app;

try {
  app = require('../src/app');
} catch (error) {
  console.error('Failed to load app:', error);
  throw error;
}

// Export the Express app directly for Vercel
// Vercel's @vercel/node runtime handles the serverless wrapper automatically
module.exports = app;
module.exports.default = app;
