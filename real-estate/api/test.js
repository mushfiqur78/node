/**
 * Simple Test Endpoint to Debug 500 Error
 * This helps identify what's causing the failure
 */

module.exports = (req, res) => {
  try {
    // Check environment variables
    const envCheck = {
      timestamp: new Date().toISOString(),
      nodeEnv: process.env.NODE_ENV || 'not set',
      mongoUri: process.env.MONGO_URI ? 'SET' : 'NOT SET',
      jwtSecret: process.env.JWT_SECRET ? 'SET' : 'NOT SET',
      vercelEnv: process.env.VERCEL ? 'SET' : 'NOT SET',
      allEnvKeys: Object.keys(process.env).filter(key => 
        key.includes('MONGO') || 
        key.includes('JWT') || 
        key.includes('NODE_ENV')
      )
    };

    res.status(200).json({
      success: true,
      message: 'Test endpoint working!',
      environment: envCheck
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
};
