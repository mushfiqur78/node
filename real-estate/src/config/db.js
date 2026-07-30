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
    // Support both MONGO_URI and MONGODB_URI for deployment environments
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error('MONGO_URI or MONGODB_URI environment variable is not defined');
    }

    // Configure mongoose for serverless
    mongoose.set('strictQuery', false);

    // Connect to MongoDB with serverless-friendly options
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000, // Timeout after 10 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Cache the connection
    cachedConnection = conn;
    
    return conn;
  } catch (error) {
    console.error(`DB Connection Error: ${error.message}`);
    
    // In serverless, don't exit process, just throw error
    if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
      throw error;
    } else {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
