# Vercel Deployment গাইড (বাংলা)

## প্রয়োজনীয় জিনিস

1. **MongoDB Atlas Account** (ক্লাউড ডাটাবেসের জন্য)
   - https://www.mongodb.com/cloud/atlas এ ফ্রি একাউন্ট তৈরি করুন
   - একটি ক্লাস্টার তৈরি করুন এবং কানেকশন স্ট্রিং নিন
   - Vercel serverless functions এর জন্য সব IP (0.0.0.0/0) whitelist করুন

2. **Vercel Account**
   - https://vercel.com এ সাইন আপ করুন

## ডিপ্লয়মেন্ট ধাপসমূহ

### ১. MongoDB Atlas সেটআপ করুন

1. MongoDB Atlas Dashboard এ যান
2. নতুন ক্লাস্টার তৈরি করুন (টেস্টিং এর জন্য Free M0 tier যথেষ্ট)
3. পাসওয়ার্ড সহ একটি ডাটাবেস ইউজার তৈরি করুন
4. আপনার connection string নিন (এরকম দেখতে):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/<dbname>?retryWrites=true&w=majority
   ```
5. Network Access এ, `0.0.0.0/0` যোগ করুন (Vercel এর জন্য প্রয়োজনীয়)

### ২. Vercel এ Deploy করুন

#### অপশন A: Vercel CLI ব্যবহার করে (সুপারিশকৃত)

```bash
# Vercel CLI গ্লোবালি ইনস্টল করুন
npm install -g vercel

# real-estate ফোল্ডারে যান
cd node/real-estate

# Vercel এ লগইন করুন
vercel login

# Deploy করুন
vercel

# Production deployment এর জন্য
vercel --prod
```

#### অপশন B: Vercel Dashboard ব্যবহার করে

1. https://vercel.com/dashboard এ যান
2. "Add New Project" ক্লিক করুন
3. আপনার Git repository ইমপোর্ট করুন (GitHub, GitLab, অথবা Bitbucket)
4. Root Directory সেট করুন: `node/real-estate`
5. Environment variables কনফিগার করুন (নিচে দেখুন)
6. "Deploy" ক্লিক করুন

### ৩. Vercel এ Environment Variables কনফিগার করুন

আপনার Vercel প্রজেক্ট সেটিংসে, এই environment variables যোগ করুন:

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

### ৪. আপনার Deployment টেস্ট করুন

Deployment এর পর, আপনার API টেস্ট করুন:

```bash
# Health check
curl https://your-app.vercel.app/

# API v1 test
curl https://your-app.vercel.app/api/v1/config
```

## সাধারণ সমস্যা এবং সমাধান

### সমস্যা ১: 404 NOT_FOUND Error

**সমাধান:** 
- নিশ্চিত করুন `vercel.json` সঠিকভাবে কনফিগার করা আছে
- চেক করুন `api/index.js` আছে কিনা
- MongoDB connection string সঠিক আছে কিনা যাচাই করুন

### সমস্যা ২: Database Connection Failed

**সমাধান:**
- যাচাই করুন MongoDB Atlas `0.0.0.0/0` থেকে কানেকশন অনুমোদন করে
- চেক করুন MONGO_URI environment variable সঠিকভাবে সেট করা আছে
- নিশ্চিত করুন database user এর সঠিক permissions আছে

### সমস্যা ৩: CORS Errors

**সমাধান:**
- আপনার frontend domain `ALLOWED_ORIGINS` environment variable এ যোগ করুন
- ফরম্যাট: `https://domain1.com,https://domain2.com` (কমা দিয়ে আলাদা, স্পেস নেই)

### সমস্যা ৪: Timeout Errors

**সমাধান:**
- Vercel এর Hobby plan এ ১০ সেকেন্ড timeout আছে
- Database queries অপটিমাইজ করুন
- ৬০ সেকেন্ড timeout এর জন্য Pro plan এ আপগ্রেড বিবেচনা করুন

## প্রজেক্ট স্ট্রাকচার

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

Deployment এর পর, আপনার API এখানে উপলব্ধ হবে:

- Base URL: `https://your-app.vercel.app/`
- API v1: `https://your-app.vercel.app/api/v1/`
- Health Check: `https://your-app.vercel.app/`

## আপনার Deployment আপডেট করা

```bash
# আপনার পরিবর্তন করুন
git add .
git commit -m "Update message"
git push

# Vercel স্বয়ংক্রিয়ভাবে redeploy করবে
# অথবা ম্যানুয়ালি redeploy করুন:
vercel --prod
```

## গুরুত্বপূর্ণ নোট

1. **File Uploads**: Vercel serverless functions stateless। File uploads এর জন্য বিবেচনা করুন:
   - AWS S3
   - Cloudinary
   - Vercel Blob Storage

2. **Cron Jobs**: Scheduled tasks এর জন্য (`src/jobs/` এর মত), ব্যবহার করুন:
   - Vercel Cron Jobs (vercel.json এ যোগ করুন)
   - External cron service (যেমন cron-job.org)

3. **Database**: সবসময় MongoDB Atlas বা অন্য cloud database ব্যবহার করুন। Local MongoDB Vercel এ কাজ করবে না।

4. **Environment Variables**: কখনো `.env` ফাইল commit করবেন না। সবসময় Vercel এর environment variable settings ব্যবহার করুন।

## প্রয়োজনীয় পরিবর্তনসমূহ

আপনার কোড এখন Vercel deployment এর জন্য প্রস্তুত। এই পরিবর্তনগুলো করা হয়েছে:

1. ✅ `api/index.js` - Serverless function handler আপডেট করা হয়েছে
2. ✅ `vercel.json` - Vercel configuration অপটিমাইজ করা হয়েছে
3. ✅ `.env.example` - Environment variables এর টেমপ্লেট তৈরি করা হয়েছে
4. ✅ Deployment গাইড তৈরি করা হয়েছে (ইংরেজি এবং বাংলা)

এখন আপনি deploy করতে পারেন!
