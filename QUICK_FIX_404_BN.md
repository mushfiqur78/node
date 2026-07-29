# 🚨 404 Error তাড়াতাড়ি ঠিক করুন (Quick Fix)

## সমস্যা
Vercel এ deploy করার পর **404 NOT_FOUND** error আসছে।

## কারণ
Vercel **Root Directory** খুঁজে পাচ্ছে না। আপনার code `real-estate` folder এ কিন্তু Vercel root এ খুঁজছে।

---

## ✅ সমাধান (2 মিনিটে ঠিক হবে)

### পদ্ধতি ১: Vercel Dashboard থেকে (সবচেয়ে সহজ)

#### ধাপ ১: Vercel Dashboard এ যান
```
https://vercel.com/dashboard
```

#### ধাপ ২: আপনার Project select করুন
- যে project এ 404 আসছে সেটা ক্লিক করুন

#### ধাপ ৩: Settings এ যান
- উপরে **Settings** tab ক্লিক করুন

#### ধাপ ৪: General scroll করুন
- **General** section এ scroll down করুন
- **Root Directory** section খুঁজুন

#### ধাপ ৫: Root Directory Edit করুন
- **Root Directory** এর পাশে **Edit** button ক্লিক করুন
- লিখুন: `real-estate`
- **Save** ক্লিক করুন

#### ধাপ ৬: Redeploy করুন
1. **Deployments** tab এ যান
2. সবচেয়ে উপরের (latest) deployment এ **⋯** (three dots) ক্লিক করুন
3. **Redeploy** select করুন
4. ⚠️ **Important:** "Use existing Build Cache" এর check mark **সরিয়ে দিন**
5. **Redeploy** button ক্লিক করুন
6. 2-3 মিনিট wait করুন

#### ধাপ ৭: Test করুন
- Deployment complete হলে **Visit** ক্লিক করুন
- অথবা browser এ আপনার URL open করুন

**✅ Success দেখতে হবে:**
```json
{
  "success": true,
  "message": "Real Estate API",
  "version": "v1",
  "env": "production"
}
```

---

### পদ্ধতি ২: CLI থেকে (Terminal ব্যবহার করে)

#### ধাপ ১: Terminal open করুন

#### ধাপ ২: real-estate folder এ যান
```bash
cd G:\brokerage-backend\real-estate
```

#### ধাপ ৩: Vercel CLI install করুন (যদি না থাকে)
```bash
npm install -g vercel
```

#### ধাপ ৪: Vercel login করুন
```bash
vercel login
```
- Browser open হবে
- Login করুন

#### ধাপ ৫: Fresh deploy করুন
```bash
vercel --prod --force
```

#### Questions আসবে:
```
? Set up and deploy "~/real-estate"? 
→ Y চাপুন

? Which scope do you want to deploy to?
→ আপনার account select করুন

? Link to existing project?
→ Y চাপুন (যদি আগে deploy করে থাকেন)
→ N চাপুন (যদি নতুন হয়)

? What's your project's name?
→ real-estate-api (বা যেকোনো নাম)

? In which directory is your code located?
→ ./ লিখুন
```

#### ধাপ ৬: Wait করুন
- 2-3 মিনিট লাগবে
- শেষে URL দেখাবে

#### ধাপ ৭: Test করুন
- দেওয়া URL browser এ open করুন

---

## ⚙️ Environment Variables (গুরুত্বপূর্ণ!)

Deploy করার পর **অবশ্যই** environment variables set করতে হবে:

### কিভাবে set করবেন:

1. Vercel Dashboard → Your Project
2. **Settings** → **Environment Variables**
3. নিচের variables গুলো add করুন:

```
Name: MONGO_URI
Value: mongodb+srv://username:password@cluster.mongodb.net/real-estate
Environments: ✓ Production ✓ Preview ✓ Development

Name: JWT_SECRET
Value: your_secret_key_change_this_minimum_32_characters
Environments: ✓ Production ✓ Preview ✓ Development

Name: NODE_ENV
Value: production
Environments: ✓ Production ✓ Preview ✓ Development

Name: FRONTEND_URL
Value: https://your-frontend.vercel.app
Environments: ✓ Production ✓ Preview ✓ Development

Name: ALLOWED_ORIGINS
Value: https://your-frontend.vercel.app,https://your-admin.vercel.app
Environments: ✓ Production ✓ Preview ✓ Development
```

### Environment Variables add করার পর:
- **Deployments** → Latest → ⋯ → **Redeploy**

---

## 🧪 Test করার জন্য URLs

Deploy successful হলে এই URLs test করুন:

### 1. Health Check:
```
https://your-app.vercel.app/
```
**Expected Response:**
```json
{
  "success": true,
  "message": "Real Estate API",
  "version": "v1",
  "env": "production"
}
```

### 2. Config Endpoint:
```
https://your-app.vercel.app/api/v1/config
```

### 3. Properties Endpoint:
```
https://your-app.vercel.app/api/v1/properties
```

---

## 📋 Checklist (এগুলো করেছেন কিনা check করুন)

### MongoDB Setup:
- [ ] MongoDB Atlas account তৈরি করেছি
- [ ] Free cluster তৈরি করেছি
- [ ] Database user তৈরি করেছি (username + password)
- [ ] Network Access এ 0.0.0.0/0 add করেছি
- [ ] Connection string কপি করেছি

### Vercel Setup:
- [ ] Vercel account তৈরি করেছি
- [ ] GitHub repository import করেছি
- [ ] Root Directory: `real-estate` set করেছি ← **সবচেয়ে গুরুত্বপূর্ণ!**
- [ ] Environment variables add করেছি:
  - [ ] MONGO_URI
  - [ ] JWT_SECRET
  - [ ] NODE_ENV
- [ ] Deploy করেছি
- [ ] Test করেছি

---

## ❌ এখনও 404 আসলে

### Check করুন:

#### 1. Root Directory সঠিক আছে কিনা:
- Vercel Dashboard → Project → Settings → General
- **Root Directory** দেখুন
- `real-estate` লেখা আছে কিনা
- না থাকলে add করুন এবং redeploy করুন

#### 2. Files আছে কিনা:
Local এ check করুন:
```bash
cd G:\brokerage-backend\real-estate
dir
```

এগুলো থাকতে হবে:
- ✅ api/index.js
- ✅ src/app.js
- ✅ vercel.json
- ✅ package.json

#### 3. vercel.json check করুন:
```bash
type vercel.json
```

এমন দেখাতে হবে:
```json
{
  "version": 2,
  "name": "real-estate-api",
  "builds": [{
    "src": "api/index.js",
    "use": "@vercel/node",
    "config": { "maxDuration": 30 }
  }],
  "routes": [
    { "src": "/uploads/(.*)", "dest": "/uploads/$1" },
    { "src": "/(.*)", "dest": "/api/index.js" }
  ]
}
```

#### 4. Deployment Logs দেখুন:
- Vercel Dashboard → Deployments → Latest
- **Logs** tab ক্লিক করুন
- Error আছে কিনা দেখুন

---

## 🎯 সঠিক Project Structure

আপনার structure এমন হতে হবে:

```
brokerage-backend/              ← Git repository root
├── real-estate/               ← Backend (Root Directory এটা হবে)
│   ├── api/
│   │   └── index.js          ← Vercel entry point
│   ├── src/
│   │   ├── app.js
│   │   ├── controllers/
│   │   ├── models/
│   │   └── routes/
│   ├── vercel.json
│   └── package.json
├── real-estate-admin/         ← Admin Panel
└── real-estate-frontend/      ← Frontend
```

**গুরুত্বপূর্ণ:** Vercel deploy করার সময় **Root Directory** অবশ্যই `real-estate` হতে হবে।

---

## 🚀 একবারে সব ঠিক করুন

### Windows এ:
```bash
cd G:\brokerage-backend\real-estate
npm install -g vercel
vercel login
vercel --prod --force
```

### প্রশ্ন এলে:
- Set up and deploy? → **Y**
- Which scope? → **Your account**
- Link to existing? → **N** (fresh deploy এর জন্য)
- Project name? → **real-estate-api**
- Code directory? → **./** (শুধু dot slash)

---

## ✅ Success হয়েছে কিনা বুঝবেন যেভাবে

### ✅ Successful Deployment:
- Vercel Dashboard এ **"Ready"** status
- Visit করলে JSON response (404 error না)
- Health check URL কাজ করছে
- API endpoints accessible

### ❌ Failed Deployment:
- 404 NOT_FOUND error
- 500 Internal Server Error
- "NOT_FOUND" message
- Blank page বা loading forever

---

## 📞 পরবর্তী পদক্ষেপ

Deploy successful হলে:

1. ✅ Backend URL কপি করুন
2. ✅ MongoDB Atlas এ data দেখুন
3. ✅ API endpoints test করুন (Postman দিয়ে)
4. ✅ Admin panel deploy করুন (Root Directory: `real-estate-admin`)
5. ✅ Frontend deploy করুন (Root Directory: `real-estate-frontend`)
6. ✅ সব URLs একসাথে configure করুন

---

## 🆘 Help

বিস্তারিত গাইড:
- **Step by step:** `DEPLOYMENT_STEP_BY_STEP.md`
- **Full instructions:** `VERCEL_DEPLOY_INSTRUCTIONS.md`

Automated deployment:
```bash
deploy-all.bat
```

---

**মনে রাখুন:** Root Directory সঠিক না হলে 404 আসবেই!

**Solution:** Settings → General → Root Directory → `real-estate` → Save → Redeploy

এটা করলেই হবে! 🎉
