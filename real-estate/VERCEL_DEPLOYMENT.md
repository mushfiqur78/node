# Vercel Deployment Guide

## Prerequisites

1. **MongoDB Atlas Account** (for cloud database)
   - Create a free account at https://www.mongodb.com/cloud/atlas
   - Create a cluster and get your connection string
   - Whitelist all IPs (0.0.0.0/0) for Vercel serverless functions

2. **Vercel Account**
   - Sign up at https://vercel.com

## Deployment Steps

### 1. Set Up MongoDB Atlas

1. Go to MongoDB Atlas Dashboard
2. Create a new cluster (Free M0 tier is sufficient for testing)
3. Create a database user with password
4. Get your connection string (looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/<dbname>?retryWrites=true&w=majority
   ```
5. In Network Access, add `0.0.0.0/0` to allow connections from anywhere (required for Vercel)

### 2. Deploy to Vercel

#### Option A: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI globally
npm install -g vercel

# Navigate to the real-estate folder
cd node/real-estate

# Login to Vercel
vercel login

# Deploy
vercel

# For production deployment
vercel --prod
```

#### Option B: Using Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click "Add New Project"
3. Import your Git repository (GitHub, GitLab, or Bitbucket)
4. Set Root Directory to: `node/real-estate`
5. Configure environment variables (see below)
6. Click "Deploy"

### 3. Configure Environment Variables in Vercel

In your Vercel project settings, add these environment variables:

```
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/real-estate?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=30d
FRONTEND_URL=https://your-frontend.vercel.app
PROPERTY_ID_PREFIX=D
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=Real Estate <your_email@gmail.com>
ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://your-admin.vercel.app
REFERRAL_COOKIE_TTL_DAYS=30
COUPON_RESERVATION_TTL_MINUTES=30
GEO_API_URL=https://ipapi.co
MAX_CLICKS_PER_IP_PER_DAY=50
MAX_LEADS_PER_IP_PER_DAY=10
MAX_CONVERSION_RATE=30
MAX_REWARD_AMOUNT=100000
```

### 4. Test Your Deployment

After deployment, test your API:

```bash
# Health check
curl https://your-app.vercel.app/

# API v1 test
curl https://your-app.vercel.app/api/v1/config
```

## Common Issues & Solutions

### Issue 1: 404 NOT_FOUND Error

**Solution:** 
- Ensure `vercel.json` is properly configured
- Check that `api/index.js` exists
- Verify MongoDB connection string is correct

### Issue 2: Database Connection Failed

**Solution:**
- Verify MongoDB Atlas allows connections from `0.0.0.0/0`
- Check that MONGO_URI environment variable is set correctly
- Ensure database user has proper permissions

### Issue 3: CORS Errors

**Solution:**
- Add your frontend domain to `ALLOWED_ORIGINS` environment variable
- Format: `https://domain1.com,https://domain2.com` (comma-separated, no spaces)

### Issue 4: Timeout Errors

**Solution:**
- Vercel has a 10-second timeout on Hobby plan
- Optimize database queries
- Consider upgrading to Pro plan for 60-second timeout

## Project Structure

```
node/real-estate/
├── api/
│   └── index.js          # Vercel serverless entry point
├── src/
│   ├── app.js            # Express application
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   └── middleware/       # Custom middleware
├── vercel.json           # Vercel configuration
├── package.json
└── .env.example         # Environment variables template
```

## API Endpoints

After deployment, your API will be available at:

- Base URL: `https://your-app.vercel.app/`
- API v1: `https://your-app.vercel.app/api/v1/`
- Health Check: `https://your-app.vercel.app/`

## Updating Your Deployment

```bash
# Make your changes
git add .
git commit -m "Update message"
git push

# Vercel will automatically redeploy
# Or manually redeploy:
vercel --prod
```

## Important Notes

1. **File Uploads**: Vercel serverless functions are stateless. For file uploads, consider using:
   - AWS S3
   - Cloudinary
   - Vercel Blob Storage

2. **Cron Jobs**: For scheduled tasks (like in `src/jobs/`), use:
   - Vercel Cron Jobs (add to vercel.json)
   - External cron service (like cron-job.org)

3. **Database**: Always use MongoDB Atlas or another cloud database. Local MongoDB won't work on Vercel.

4. **Environment Variables**: Never commit `.env` file. Always use Vercel's environment variable settings.

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify all environment variables are set
3. Test MongoDB connection separately
4. Check Vercel function logs in the dashboard
