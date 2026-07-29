# 🚀 Quick Deployment Guide

## তাড়াতাড়ি Deploy করার জন্য (বাংলায়)

### ১ম ধাপ: MongoDB Atlas সেটআপ

1. https://www.mongodb.com/cloud/atlas এ যান এবং ফ্রি একাউন্ট তৈরি করুন
2. একটি ফ্রি ক্লাস্টার তৈরি করুন
3. Database Access এ গিয়ে নতুন user তৈরি করুন (username + password)
4. Network Access এ গিয়ে "Add IP Address" → "Allow Access from Anywhere" (0.0.0.0/0)
5. Connect ক্লিক করে "Connect your application" থেকে connection string কপি করুন

### ২য় ধাপ: Vercel এ Deploy

```bash
# Terminal খুলে এই commands চালান

# 1. Vercel CLI ইনস্টল করুন (যদি আগে না থাকে)
npm install -g vercel

# 2. real-estate ফোল্ডারে যান
cd node/real-estate

# 3. Vercel এ লগইন করুন
vercel login

# 4. Deploy করুন
vercel --prod
```

### ৩য় ধাপ: Environment Variables সেট করুন

Vercel Dashboard এ যান এবং Settings → Environment Variables এ:

**প্রয়োজনীয় Variables:**
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/real-estate?retryWrites=true&w=majority
JWT_SECRET=your_secret_key_change_this_123456789
NODE_ENV=production
FRONTEND_URL=https://your-frontend.vercel.app
ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

**Optional Variables** (ইমেইল ফিচার এর জন্য):
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
EMAIL_FROM=Real Estate <your_email@gmail.com>
```

### ৪র্থ ধাপ: টেস্ট করুন

Browser এ যান:
```
https://your-vercel-url.vercel.app/
```

আপনি এমন response পাবেন:
```json
{
  "success": true,
  "message": "Real Estate API",
  "version": "v1",
  "env": "production"
}
```

---

## Quick Deploy for English Speakers

### Step 1: Setup MongoDB Atlas

1. Go to https://www.mongodb.com/cloud/atlas and create a free account
2. Create a free cluster
3. Create database user (username + password) in Database Access
4. Add IP "0.0.0.0/0" in Network Access (Allow from Anywhere)
5. Get connection string from "Connect" → "Connect your application"

### Step 2: Deploy to Vercel

```bash
# Run these commands in terminal

# 1. Install Vercel CLI (if not already installed)
npm install -g vercel

# 2. Navigate to real-estate folder
cd node/real-estate

# 3. Login to Vercel
vercel login

# 4. Deploy
vercel --prod
```

### Step 3: Set Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

**Required Variables:**
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/real-estate?retryWrites=true&w=majority
JWT_SECRET=your_secret_key_change_this_123456789
NODE_ENV=production
FRONTEND_URL=https://your-frontend.vercel.app
ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

**Optional Variables** (for email features):
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
EMAIL_FROM=Real Estate <your_email@gmail.com>
```

### Step 4: Test

Open in browser:
```
https://your-vercel-url.vercel.app/
```

You should see:
```json
{
  "success": true,
  "message": "Real Estate API",
  "version": "v1",
  "env": "production"
}
```

---

## Automated Deployment (সহজ উপায়)

Windows এ:
```bash
quick-deploy.bat
```

Mac/Linux এ:
```bash
chmod +x quick-deploy.sh
./quick-deploy.sh
```

---

## সাধারণ সমস্যা (Common Issues)

### 404 Error পাচ্ছেন?
- `vercel.json` ফাইল check করুন
- Environment variables সেট করা আছে কিনা verify করুন
- Redeploy করুন: `vercel --prod`

### Database Connect হচ্ছে না?
- MongoDB Atlas এ IP whitelist check করুন (0.0.0.0/0 আছে কিনা)
- Connection string সঠিক আছে কিনা verify করুন
- Username/password এ special characters থাকলে URL encode করুন

### CORS Error?
- `ALLOWED_ORIGINS` এ আপনার frontend URL যোগ করুন
- Multiple domains এর জন্য comma দিয়ে আলাদা করুন: `https://domain1.com,https://domain2.com`

---

## সাহায্যের জন্য

বিস্তারিত গাইড দেখুন:
- English: `VERCEL_DEPLOYMENT.md`
- বাংলা: `VERCEL_DEPLOYMENT_BN.md`

Test করার জন্য:
```bash
node test-vercel.js
```
