/**
 * Vercel Serverless Function Entry Point
 * This file exports the Express app for Vercel's serverless environment
 */

// Load environment variables
require('dotenv').config();

// Mark as Vercel environment
process.env.VERCEL = 'true';

// Import the Express app
const app = require('../src/app');

// Vercel serverless function handler
// This wraps the Express app to work with Vercel's serverless architecture
const handler = (req, res) => {
  // Set serverless-specific headers
  res.setHeader('X-Powered-By', 'Vercel');
  
  // Forward the request to Express
  return app(req, res);
};

// Export for Vercel
module.exports = handler;
module.exports.default = handler;
