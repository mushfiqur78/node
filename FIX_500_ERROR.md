# 🔧 Fix 500 Internal Server Error (FUNCTION_INVOCATION_FAILED)

## ✅ অগ্রগতি!
আপনার 404 error চলে গেছে! এখন 500 error আসছে যার মানে:
- ✅ Vercel আপনার code খুঁজে পেয়েছে
- ✅ Root Directory সঠিক আছে
- ❌ কিন্তু code execute করতে সমস্যা হচ্ছে

## 🎯 সমস্যার কারণ

**FUNCTION_INVOCATION_FAILED** error সাধারণত হয় যখন:
1. Environment variables missing বা incorrect
2. MongoDB connection failed
3. Code এ syntax error
4. Dependencies missing

---

## ✅ সমাধান (ধাপে ধাপে)

### Step 1: Environment Variables Check করুন

#### 1.1: Vercel Dashboard এ যান
```
https://vercel.com/dashboard → Your Project → Settings → Environment Variables
```

#### 1.2: এই variables অবশ্যই থাকতে হবে:

| Variable Name | Example Value | Required |
|--------------|---------------|----------|
| `MONGO_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/real-estate?retryWrites=true&w=majority` | ✅ YES |
| `JWT_SECRET` | `your_super_secret_key_at_least_32_characters_long_12345` | ✅ YES |
| `NODE_ENV` | `production` | ✅ YES |
| `FRONTEND_URL` | `https://your-frontend.vercel.app` | ⚪ Optional |
| `ALLOWED_ORIGINS` | `*` or `https://your-frontend.vercel.app` | ⚪ Optional |

#### 1.3: চেক করুন প্রতিটি variable এ:
- ✓ **Production** checked
- ✓ **Preview** checked
- ✓ **Development** checked

#### 1.4: যদি কোনো variable missing থাকে:
1. "Add" button ক্লিক করুন
2. Name এবং Value দিন
3. সব environments check করুন
4. "Save" ক্লিক করুন

---

### Step 2: MongoDB Connection String যাচাই করুন

#### 2.1: Connection String Format
```
mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/DATABASE?retryWrites=true&w=majority
```

#### 2.2: সাধারণ ভুল:

❌ **Wrong:**
```
mongodb+srv://dbuser:<password>@cluster.mongodb.net/
```

✅ **Correct:**
```
mongodb+srv://dbuser:actual_password_here@cluster0.abc123.mongodb.net/real-estate?retryWrites=true&w=majority
```

#### 2.3: Check করুন:
- [ ] `<password>` replace করেছেন actual password দিয়ে
- [ ] Database name (`/real-estate`) শেষে আছে
- [ ] Special characters (যদি password এ থাকে) URL encoded করা আছে
- [ ] Cluster name সঠিক আছে

#### 2.4: MongoDB Atlas এ Network Access Check:
1. MongoDB Atlas Dashboard → Network Access
2. যাচাই করুন: `0.0.0.0/0` আছে কিনা
3. Status: **Active** হতে হবে

---

### Step 3: Code Changes Push করুন

আমি আপনার code এ এই পরিবর্তন করেছি:

1. ✅ `api/index.js` - Serverless handler fixed
2. ✅ `src/config/db.js` - Connection caching এবং serverless support
3. ✅ `src/app.js` - Initialization middleware added

এখন এই changes Vercel এ deploy করতে হবে:

#### Option A: Git Push (If using GitHub)
```bash
cd G:\brokerage-backend
git add .
git commit -m "Fix serverless MongoDB connection"
git push

# Vercel will automatically redeploy
```

#### Option B: Manual Redeploy
```
1. Vercel Dashboard → Your Project
2. Deployments tab
3. Latest deployment → ⋯ (three dots)
4. "Redeploy"
5. ⚠️ Uncheck "Use existing Build Cache"
6. Click "Redeploy"
```

---

### Step 4: Deployment Logs দেখুন

#### 4.1: Logs Access করুন:
```
Vercel Dashboard → Your Project → Deployments → Latest Deployment
```

#### 4.2: দুইটি tabs check করুন:

**Building Tab:**
- Build successful হয়েছে কিনা
- Red errors আছে কিনা

**Function Logs Tab (Runtime):**
- "MongoDB Connected" message আছে কিনা
- কোনো error messages আছে কিনা

#### 4.3: সাধারণ Error Messages:

**Error: "MONGO_URI environment variable is not defined"**
→ Solution: Environment Variables add করুন এবং redeploy করুন

**Error: "MongoServerSelectionError: connection timeout"**
→ Solution: MongoDB Atlas এ 0.0.0.0/0 whitelist করুন

**Error: "Authentication failed"**
→ Solution: MONGO_URI তে username/password check করুন

---

### Step 5: Test করুন

Deployment complete হলে test করুন:

#### Test 1: Health Check
```
https://your-app.vercel.app/
```

**✅ Expected Response:**
```json
{
  "success": true,
  "message": "Real Estate API",
  "version": "v1",
  "env": "production"
}
```

#### Test 2: Config Endpoint
```
https://your-app.vercel.app/api/v1/config
```

**✅ Expected:** JSON data (not 500 error)

#### Test 3: Database Connection
Check Function Logs:
```
Logs should show:
"Initializing database connection..."
"MongoDB Connected: cluster0.xxxxx.mongodb.net"
"Database connected successfully"
```

---

## 🔍 Debugging Steps

### যদি এখনও 500 error আসে:

#### Debug 1: Verify Environment Variables
```bash
# Vercel Dashboard → Settings → Environment Variables
# Screenshot নিন এবং verify করুন সব আছে কিনা
```

#### Debug 2: Check Logs in Real-time
```bash
# Terminal এ:
cd G:\brokerage-backend\real-estate
vercel logs your-deployment-url --follow
```

#### Debug 3: Test MongoDB Connection Locally
```bash
# Create a test file: test-mongo.js
const mongoose = require('mongoose');

const MONGO_URI = 'your_connection_string_here';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected Successfully');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Failed:', err.message);
    process.exit(1);
  });

# Run:
node test-mongo.js
```

#### Debug 4: Simple Health Check
Temporarily simplify your health check to verify basic functionality:

In `src/app.js`, the health check endpoint:
```javascript
app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Real Estate API', 
    version: 'v1', 
    env: process.env.NODE_ENV || 'development',
    mongoUri: process.env.MONGO_URI ? 'Set' : 'Not Set',  // Add this for debugging
    jwtSecret: process.env.JWT_SECRET ? 'Set' : 'Not Set'  // Add this for debugging
  });
});
```

এটা দেখাবে environment variables set আছে কিনা।

---

## 📋 Complete Checklist

### MongoDB Atlas:
- [ ] Cluster status: **Active**
- [ ] Database user created
- [ ] Password saved এবং সঠিক
- [ ] Network Access: `0.0.0.0/0` added এবং **Active**
- [ ] Connection string কপি করা আছে

### Vercel Environment Variables:
- [ ] `MONGO_URI` set করা আছে
  - [ ] Production ✓
  - [ ] Preview ✓
  - [ ] Development ✓
- [ ] `JWT_SECRET` set করা আছে (all envs)
- [ ] `NODE_ENV=production` set করা আছে (all envs)
- [ ] সব variables save করা আছে

### Code Changes:
- [ ] Updated code push/deploy করা হয়েছে
- [ ] Build successful
- [ ] No build errors in logs

### Testing:
- [ ] Health check endpoint কাজ করছে
- [ ] Logs এ "MongoDB Connected" দেখাচ্ছে
- [ ] No 500 errors
- [ ] API endpoints accessible

---

## 🎯 Quick Fix Commands

### Redeploy with Fresh Build:
```bash
# Dashboard method:
# Deployments → Latest → Redeploy (Build Cache OFF)
```

### Redeploy via CLI:
```bash
cd G:\brokerage-backend\real-estate
vercel --prod --force
```

### Check Logs:
```bash
vercel logs --follow
```

---

## 🆘 Still Getting 500 Error?

### Method 1: Fresh Deployment

1. Delete current project:
   ```
   Dashboard → Settings → Delete Project
   ```

2. Create new deployment:
   ```
   Dashboard → Add New Project
   Import Repository
   Root Directory: real-estate
   Add ALL environment variables
   Deploy
   ```

### Method 2: Test Locally First

```bash
cd G:\brokerage-backend\real-estate

# Create .env file with your actual values
# MONGO_URI=your_connection_string
# JWT_SECRET=your_secret
# NODE_ENV=development

# Install dependencies
npm install

# Start locally
npm start

# If it works locally, the issue is env variables in Vercel
```

### Method 3: Contact Support

যদি সব ঠিক করেও কাজ না করে:

1. Vercel Dashboard → Your Project → Help
2. "Contact Support" ক্লিক করুন
3. Error logs এবং screenshots attach করুন

---

## ✅ Success Indicators

আপনার deployment ঠিক হয়েছে যদি:

1. ✅ No 500 errors
2. ✅ Health check returns JSON
3. ✅ Logs show "MongoDB Connected"
4. ✅ API endpoints accessible
5. ✅ No function invocation errors

---

## 📝 Environment Variables Template

Copy this and fill in your values:

```env
# Required
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/real-estate?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_key_minimum_32_characters_long_change_this_12345678
NODE_ENV=production

# Optional
FRONTEND_URL=https://your-frontend.vercel.app
ALLOWED_ORIGINS=*

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
EMAIL_FROM=Real Estate <your_email@gmail.com>

# Referral System (Optional - defaults will work)
REFERRAL_COOKIE_TTL_DAYS=30
COUPON_RESERVATION_TTL_MINUTES=30
GEO_API_URL=https://ipapi.co
MAX_CLICKS_PER_IP_PER_DAY=50
MAX_LEADS_PER_IP_PER_DAY=10
MAX_CONVERSION_RATE=30
MAX_REWARD_AMOUNT=100000
PROPERTY_ID_PREFIX=D
```

---

**এই steps follow করলে 500 error fix হবে! 🚀**

**সবচেয়ে সাধারণ সমস্যা:** MONGO_URI সঠিকভাবে set করা নেই। Double-check করুন!
