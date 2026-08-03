/**
 * MongoDB Connection Test Endpoint
 */

const mongoose = require('mongoose');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

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
        error: 'MONGO_URI not found',
        allMongoVars: Object.keys(process.env).filter(k => k.includes('MONGO')),
      });
    }

    step = 'Parsing connection string';
    const uriInfo = {
      length: mongoUri.length,
      prefix: mongoUri.substring(0, 30) + '...',
      hasPassword: mongoUri.includes(':') && mongoUri.includes('@'),
      hasCluster: mongoUri.includes('mongodb.net'),
      dbName: mongoUri.split('/')[3] ? mongoUri.split('/')[3].split('?')[0] : 'NO_DATABASE',
    };

    step = 'Connecting to MongoDB';
    
    // Close any existing connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }

    // Try to connect
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 1,
    });

    step = 'Testing database access';
    const collections = await mongoose.connection.db.listCollections().toArray();

    const elapsed = Date.now() - startTime;

    return res.status(200).json({
      success: true,
      message: 'MongoDB connection successful!',
      elapsed: `${elapsed}ms`,
      uriInfo,
      database: {
        name: mongoose.connection.name,
        host: mongoose.connection.host,
        collections: collections.map(c => c.name),
        count: collections.length,
      },
    });

  } catch (error) {
    const elapsed = Date.now() - startTime;

    return res.status(500).json({
      success: false,
      step,
      error: error.message,
      errorCode: error.code,
      elapsed: `${elapsed}ms`,
    });
  }
};
