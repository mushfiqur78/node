const mongoose = require('mongoose');

// Cache connection for serverless
let cachedConnection = null;

const connectDB = async () => {
  // Return cached connection if available
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log('Using cached MongoDB connection');
    return cachedConnection;
  }

  try {
    // Support common MongoDB URI env names for deployment environments
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.MONGO_URL;

    console.log('Attempting MongoDB connection...');
    console.log('MONGO_URI exists:', !!mongoUri);
    console.log('MONGO_URI length:', mongoUri ? mongoUri.length : 0);
    console.log('MONGO_URI prefix:', mongoUri ? mongoUri.substring(0, 20) : 'N/A');

    if (!mongoUri) {
      throw new Error('MONGO_URI, MONGODB_URI, or MONGO_URL environment variable is not defined');
    }

    // Configure mongoose for serverless
    mongoose.set('strictQuery', false);

    // Connect to MongoDB with extended timeout for serverless cold starts
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 30000, // Increased to 30 seconds for serverless cold starts
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      maxPoolSize: 10,
      minPoolSize: 1,
    });

    console.log(`MongoDB Connected Successfully: ${conn.connection.host}`);
    console.log(`Database Name: ${conn.connection.name}`);
    
    // Cache the connection
    cachedConnection = conn;
    
    return conn;
  } catch (error) {
    console.error(`DB Connection Error: ${error.message}`);
    console.error(`Error Stack: ${error.stack}`);
    
    // In serverless, don't exit process, just throw error
    if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
      throw error;
    } else {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
