/**
 * Main Express App
 * Entry point for Real Estate Management API
 * API Version: v1
 */

require('dotenv').config();
const express       = require('express');
const cors          = require('cors');
const helmet        = require('helmet');
const morgan        = require('morgan');
const rateLimit     = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser  = require('cookie-parser');
const connectDB     = require('./config/db');
const seedAdmin     = require('./config/seed');
const { protect, authorize } = require('./middleware/auth');
const errorHandler  = require('./middleware/errorHandler');

const app = express();

// Trust proxy — correct req.ip behind Nginx/load balancer
app.set('trust proxy', 1);

// Initialize database connection and seed (for serverless)
let isInitialized = false;
const initializeApp = async () => {
  if (isInitialized) return;
  
  try {
    console.log('Initializing database connection...');
    await connectDB();
    console.log('Database connected successfully');
    
    await seedAdmin();
    console.log('Admin seeded successfully');
    
    // Only start jobs in non-serverless environment
    if (!process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
      require('./jobs').startJobs();
    }
    
    isInitialized = true;
  } catch (error) {
    console.error('App initialization error:', error);
    // Don't throw in serverless, let individual requests handle it
  }
};

// Initialize immediately but don't wait
initializeApp().catch(err => console.error('Init error:', err));

// ─── Middleware to ensure DB is connected ─────────────────────────
app.use(async (req, res, next) => {
  try {
    // Ensure initialization is complete
    if (!isInitialized) {
      await initializeApp();
    }
    next();
  } catch (error) {
    console.error('Initialization middleware error:', error);
    return res.status(503).json({ 
      success: false, 
      message: 'Service temporarily unavailable. Database connection failed.',
      error: error.message 
    });
  }
});

// ─── Unhandled Rejection & Exception ─────────────────────────────
process.on('unhandledRejection', (err) => console.error('[UnhandledRejection]', err.message));
process.on('uncaughtException',  (err) => { 
  console.error('[UncaughtException]', err.message); 
  // Don't exit in serverless
  if (!process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
    process.exit(1);
  }
});

// ─── Security ─────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' }, contentSecurityPolicy: false }));
app.use(mongoSanitize());

// ─── Logging ──────────────────────────────────────────────────────
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ─── Rate Limiting ────────────────────────────────────────────────
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, max: 200,
  message: { success: false, message: 'Too many requests, please try again later' },
  standardHeaders: true, legacyHeaders: false,
}));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 10,
  message: { success: false, message: 'Too many login attempts, please try again later' },
});

// ─── General Middleware ───────────────────────────────────────────
const getAllowedOrigins = () => {
  const configuredOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
    : [];

  return configuredOrigins.length > 0
    ? configuredOrigins
    : ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'];
};

app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();
    // Allow all Vercel deployments and configured origins
    const isAllowed = !origin || allowedOrigins.includes(origin) || /(^|\.)vercel\.app$/i.test(origin);

    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));

// ─── API v1 Router ────────────────────────────────────────────────
const v1 = express.Router();

v1.use('/auth',         authLimiter, require('./routes/authRoutes'));
v1.use('/admin/auth',   authLimiter, require('./routes/adminAuthRoutes'));
v1.use('/properties',   require('./routes/propertyRoutes'));
v1.use('/properties',   require('./routes/advancedSearchRoutes')); // Advanced search
v1.use('/config',       require('./routes/configRoutes'));
v1.use('/enquiries',    require('./routes/enquiryRoutes'));
v1.use('/blogs',        require('./routes/blogRoutes'));
v1.use('/menus',        require('./routes/menuRoutes'));
v1.use('/seo',          require('./routes/seoRoutes'));
v1.use('/settings',     require('./routes/settingsRoutes'));
v1.use('/wishlist',     require('./routes/wishlistRoutes'));
v1.use('/profiles',     require('./routes/profileRoutes'));
v1.use('/testimonials', require('./routes/testimonialRoutes'));
v1.use('/banners',      require('./routes/bannerRoutes'));
v1.use('/about',        require('./routes/aboutPageRoutes'));
v1.use('/contact-page', require('./routes/contactPageRoutes'));
v1.use('/subscribers',  require('./routes/subscriberRoutes'));
v1.use('/stats',        require('./routes/statsRoutes')); // Site statistics
v1.get('/site-config',  require('./controllers/siteConfigController').getSiteConfig);
v1.get('/sitemap.xml',  require('./controllers/sitemapController').getSitemap);
// ─── Referral System (public endpoints) ──────────────────────────
v1.use('/referral',        require('./routes/referralRoutes'));
v1.use('/coupons',         require('./routes/couponRoutes'));
v1.use('/referral-leads',  require('./routes/referralLeadRoutes'));
// ─── Admin (super_admin only) ─────────────────────────────────────
v1.use('/admin',        protect, authorize('super_admin'), require('./routes/adminRoutes'));

app.use('/api/v1', v1);

// ─── Legacy redirect /api/* → /api/v1/* (backward compatibility) ─
app.use('/api', (req, res, next) => {
  // Skip if already /api/v1
  if (req.path.startsWith('/v1')) return next();
  req.url = req.url;
  res.redirect(301, `/api/v1${req.originalUrl.replace('/api', '')}`);
});

// ─── Health Check ─────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Real Estate API', version: 'v1', env: process.env.NODE_ENV || 'development' });
});

app.get('/api/v1/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API is healthy', 
    timestamp: new Date().toISOString(),
    database: isInitialized ? 'connected' : 'initializing'
  });
});

// Debug endpoint to check MongoDB connection
app.get('/api/v1/debug/mongo', async (req, res) => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.MONGO_URL;
    
    res.json({
      success: true,
      debug: {
        hasMongoUri: !!mongoUri,
        mongoUriLength: mongoUri ? mongoUri.length : 0,
        mongoUriPrefix: mongoUri ? mongoUri.substring(0, 25) + '...' : 'NOT_SET',
        isInitialized,
        mongooseReadyState: require('mongoose').connection.readyState,
        readyStateText: ['disconnected', 'connected', 'connecting', 'disconnecting'][require('mongoose').connection.readyState],
        allEnvVars: Object.keys(process.env).filter(key => key.includes('MONGO')),
      }
    });
  } catch (error) {
    res.json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

// ─── 404 ──────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// ─── Global Error Handler ─────────────────────────────────────────
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

// Export for Vercel serverless
module.exports = app;

// Only listen if not in serverless environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}
