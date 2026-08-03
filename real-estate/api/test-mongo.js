/**
 * Direct MongoDB Connection Test for Vercel Serverless
 */

const mongoose = require('mongoose');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const startTime = Date.now();
  let step = 'Starting';

  try {
    step = 'Checking environment variables';
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    
    if (!mongoUri) {
      return res.status(500).json({
        success: false,
        step,
        error: 'MONGO_URI not found in environment variables',
        availableEnvVars: Object.keys(process.env).filter(k => k.includes('MONGO')),
      });
    }

    step = 'Validating connection string format';
    const uriInfo = {
      length: mongoUri.length,
      prefix: mongoUri.substring(0, 30) + '...',
      hasPassword: mongoUri.includes(':') && mongoUri.includes('@'),
      hasCluster: mongoUri.includes('mongodb.net'),
      hasDatabaseName: mongoUri.split('/').length > 3 && mongoUri.split('/')[3].includes('?') ? mongoUri.split('/')[3].split('?')[0] : 'NO_DATABASE',
    };

    step = 'Attempting MongoDB connection';
    
    // Close any existing connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }

    // Connect with detailed options
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 1,
      minPoolSize: 1,
    });

    step = 'Connection successful, testing database access';
    
    // Try to list collections
    const collections = await mongoose.connection.db.listCollections().toArray();

    const elapsed = Date.now() - startTime;

    return res.status(200).json({
      success: true,
      message: 'MongoDB connection successful!',
      connectionTime: `${elapsed}ms`,
      uriInfo,
      database: {
        name: mongoose.connection.name,
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        collections: collections.map(c => c.name),
        collectionsCount: collections.length,
      },
      step,
    });

  } catch (error) {
    const elapsed = Date.now() - startTime;

    return res.status(500).json({
      success: false,
      step,
      error: error.message,
      errorName: error.name,
      elapsed: `${elapsed}ms`,
      stack: error.stack,
      mongooseState: mongoose.connection.readyState,
    });
  }
};
