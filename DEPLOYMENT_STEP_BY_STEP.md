# 🎯 Step-by-Step Deployment Guide (ছবি সহ নির্দেশনা)

## 🚨 আপনার সমস্যা: 404 NOT_FOUND

**কারণ:** Vercel আপনার code খুঁজে পাচ্ছে না কারণ Root Directory set করা নেই।

**সমাধান:** নিচের steps follow করুন।

---

## 📋 Prerequisites (আগে যা করতে হবে)

### ✅ Step 0: MongoDB Atlas Setup

1. **যান:** https://www.mongodb.com/cloud/atlas
2. **Sign Up** করুন (Gmail দিয়ে হবে)
3. **Create Cluster** → **Free Shared** select করুন
4. **Region:** Singapore বা কাছাকাছি select করুন
5. **Create Cluster** ক্লিক করুন (2-5 মিনিট সময় লাগবে)

### ✅ Step 0.1: Database User তৈরি

1. Left sidebar → **Database Access**
2. **Add New Database User** ক্লিক করুন
3. **Username:** `dbuser` (বা যেকোনো নাম)
4. **Password:** Strong password দিন (কপি করে রাখুন!)
5. **Database User Privileges:** Read and write to any database
6. **Add User** ক্লিক করুন

### ✅ Step 0.2: Network Access Setup

1. Left sidebar → **Network Access**
2. **Add IP Address** ক্লিক করুন
3. **Allow Access from Anywhere** select করুন
4. IP: `0.0.0.0/0` automatically add হবে
5. **Confirm** ক্লিক করুন

### ✅ Step 0.3: Connection String নিন

1. Left sidebar → **Database** → **Connect**
2. **Connect your application** select করুন
3. **Driver:** Node.js, **Version:** 4.1 or later
4. Connection string কপি করুন:
   ```
   mongodb+srv://dbuser:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. `<password>` এর জায়গায় আপনার actual password দিন
6. শেষে database name যোগ করুন: `/real-estate`
   ```
   mongodb+srv://dbuser:mypassword@cluster0.xxxxx.mongodb.net/real-estate?retryWrites=true&w=majority
   ```

---

## 🚀 Main Deployment Steps

### 📦 Step 1: Vercel Account তৈরি

1. **যান:** https://vercel.com
2. **Sign Up** → **Continue with GitHub** (recommended)
3. GitHub authorize করুন

### 📦 Step 2: GitHub এ Push করুন (যদি করা না থাকে)

```bash
# Terminal এ:
cd G:\brokerage-backend

# Git initialize (যদি করা না থাকে)
git init
git add .
git commit -m "Initial commit"

# GitHub এ নতুন repository তৈরি করুন: brokerage-backend
# তারপর:
git remote add origin https://github.com/your-username/brokerage-backend.git
git branch -M main
git push -u origin main
```

---

## 🎯 Step 3: Backend API Deploy (সবচেয়ে গুরুত্বপূর্ণ!)

### 3.1: Vercel Dashboard এ যান

1. https://vercel.com/dashboard
2. **Add New...** → **Project** ক্লিক করুন

### 3.2: Repository Import করুন

1. **Import Git Repository** section এ
2. আপনার `brokerage-backend` repository খুঁজুন
3. **Import** ক্লিক করুন

### 3.3: Configure Project (⚠️ এটা সবচেয়ে গুরুত্বপূর্ণ!)

```
┌─────────────────────────────────────────┐
│ Configure Project                       │
├─────────────────────────────────────────┤
│                                         │
│ Project Name:                           │
│ ┌─────────────────────────────────────┐ │
│ │ real-estate-api                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Framework Preset:                       │
│ ┌─────────────────────────────────────┐ │
│ │ Other                         ▼     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Root Directory:    ← এটা অবশ্যই দিন!   │
│ ┌─────────────────────────────────────┐ │
│ │ real-estate                    📁   │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Build and Output Settings               │
│ ┌─────────────────────────────────────┐ │
│ │ Build Command: (leave empty)        │ │
│ │ Output Directory: (leave empty)     │ │
│ │ Install Command: npm install        │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**গুরুত্বপূর্ণ:**
- **Root Directory:** অবশ্যই `real-estate` লিখুন
- **Framework Preset:** "Other" select করুন
- Build Command খালি রাখুন

### 3.4: Environment Variables যোগ করুন

**Environment Variables** section এ **Add** ক্লিক করুন:

```
Name: MONGO_URI
Value: mongodb+srv://dbuser:password@cluster.mongodb.net/real-estate?retryWrites=true&w=majority
Environments: ✓ Production ✓ Preview ✓ Development

Name: JWT_SECRET
Value: your_super_secret_key_min_32_characters_long_12345
Environments: ✓ Production ✓ Preview ✓ Development

Name: NODE_ENV
Value: production
Environments: ✓ Production ✓ Preview ✓ Development

Name: FRONTEND_URL
Value: https://your-frontend.vercel.app (এখনকার জন্য খালি রাখতে পারেন)
Environments: ✓ Production ✓ Preview ✓ Development

Name: ALLOWED_ORIGINS
Value: https://your-frontend.vercel.app (এখনকার জন্য * দিতে পারেন)
Environments: ✓ Production ✓ Preview ✓ Development

Name: SMTP_HOST (Optional - email এর জন্য)
Value: smtp.gmail.com
Environments: ✓ Production ✓ Preview ✓ Development

Name: SMTP_PORT (Optional)
Value: 587
Environments: ✓ Production ✓ Preview ✓ Development

Name: SMTP_USER (Optional)
Value: your_email@gmail.com
Environments: ✓ Production ✓ Preview ✓ Development

Name: SMTP_PASS (Optional)
Value: your_gmail_app_password
Environments: ✓ Production ✓ Preview ✓ Development
```

### 3.5: Deploy করুন

1. **Deploy** button ক্লিক করুন
2. Wait করুন (2-3 মিনিট)
3. ✅ **Congratulations!** দেখলে deployment successful

### 3.6: Test করুন

1. Deployment complete হলে **Visit** button ক্লিক করুন
2. অথবা URL টা কপি করুন (যেমন: `https://real-estate-api-xyz123.vercel.app`)
3. Browser এ open করুন

**সফল হলে এমন দেখাবে:**
```json
{
  "success": true,
  "message": "Real Estate API",
  "version": "v1",
  "env": "production"
}
```

**✅ যদি এটা দেখান, তাহলে সফল!**

**❌ যদি 404 দেখায়:**
- Settings → General → Root Directory check করুন
- `real-estate` আছে কিনা দেখুন
- না থাকলে add করুন এবং Redeploy করুন

---

## 🎯 Step 4: Admin Panel Deploy (Optional)

Same process, কিন্তু:
- Project Name: `real-estate-admin`
- Root Directory: `real-estate-admin`
- Environment Variable: `REACT_APP_API_URL=https://your-backend.vercel.app/api/v1`

---

## 🎯 Step 5: Frontend Deploy (Optional)

Same process, কিন্তু:
- Project Name: `real-estate-frontend`
- Root Directory: `real-estate-frontend`
- Environment Variable: `REACT_APP_API_URL=https://your-backend.vercel.app/api/v1`

---

## 🔧 যদি এখনও 404 আসে

### Fix Method 1: Vercel Dashboard থেকে

1. Vercel Dashboard → Your Project (real-estate-api)
2. **Settings** tab ক্লিক করুন
3. **General** section এ scroll করুন
4. **Root Directory** খুঁজুন
5. যদি empty থাকে, **Edit** ক্লিক করুন
6. `real-estate` type করুন
7. **Save** করুন
8. **Deployments** tab এ যান
9. Latest deployment এ **⋯** (three dots) ক্লিক করুন
10. **Redeploy** select করুন
11. **Use existing Build Cache** uncheck করুন
12. **Redeploy** ক্লিক করুন

### Fix Method 2: CLI থেকে Fresh Deploy

```bash
# Terminal এ:
cd G:\brokerage-backend\real-estate

# Vercel CLI install
npm install -g vercel

# Login
vercel login

# Fresh deploy
vercel --prod --force
```

First time deploy হলে এই questions আসবে:
```
? Set up and deploy "~/brokerage-backend/real-estate"? Y
? Which scope? [Your Account Name]
? Link to existing project? N
? What's your project's name? real-estate-api
? In which directory is your code located? ./
```

**Note:** "In which directory" এ শুধু `./` দিন কারণ আপনি already `real-estate` folder এ আছেন।

---

## 📊 Deployment Checklist

### Backend API:
- [ ] MongoDB Atlas cluster তৈরি করেছি
- [ ] Database user তৈরি করেছি
- [ ] Network Access (0.0.0.0/0) set করেছি
- [ ] Connection string কপি করেছি
- [ ] Vercel এ project import করেছি
- [ ] Root Directory: `real-estate` set করেছি
- [ ] Environment variables add করেছি:
  - [ ] MONGO_URI
  - [ ] JWT_SECRET
  - [ ] NODE_ENV
  - [ ] FRONTEND_URL (optional)
  - [ ] ALLOWED_ORIGINS (optional)
- [ ] Deploy করেছি
- [ ] Test করেছি (https://your-app.vercel.app/)
- [ ] Success response পেয়েছি

### Admin Panel (Optional):
- [ ] Root Directory: `real-estate-admin` set করেছি
- [ ] REACT_APP_API_URL set করেছি
- [ ] Deploy করেছি

### Frontend (Optional):
- [ ] Root Directory: `real-estate-frontend` set করেছি
- [ ] REACT_APP_API_URL set করেছি
- [ ] Deploy করেছি

---

## 🆘 Still Getting 404?

### Debug Steps:

1. **Check Deployment Logs:**
   - Vercel Dashboard → Your Project → Deployments
   - Latest deployment ক্লিক করুন
   - **Building** এবং **Logs** tab check করুন
   - Error খুঁজুন

2. **Verify File Structure:**
   ```bash
   # আপনার local এ check করুন:
   cd G:\brokerage-backend\real-estate
   dir
   
   # এগুলো থাকতে হবে:
   # - api/index.js
   # - src/app.js
   # - vercel.json
   # - package.json
   ```

3. **Check vercel.json:**
   ```bash
   cd real-estate
   type vercel.json
   ```
   
   এমন দেখাতে হবে:
   ```json
   {
     "version": 2,
     "builds": [{
       "src": "api/index.js",
       "use": "@vercel/node"
     }]
   }
   ```

4. **Manual Redeploy:**
   - Dashboard → Deployments → Latest → ⋯ → Redeploy
   - **Use existing Build Cache:** OFF করুন
   - Redeploy করুন

---

## 📞 Contact URLs After Deployment

আপনার URLs এমন হবে:

- **Backend API:** `https://real-estate-api-[random].vercel.app`
- **Admin Panel:** `https://real-estate-admin-[random].vercel.app`
- **Frontend:** `https://real-estate-frontend-[random].vercel.app`

এই URLs গুলো:
1. কপি করে রাখুন
2. Admin ও Frontend এর environment variables এ backend URL দিন
3. Backend এর ALLOWED_ORIGINS এ admin ও frontend URLs দিন

---

## ✅ Success Indicators

আপনার deployment successful হয়েছে যদি:

1. ✅ Vercel Dashboard এ "Ready" status দেখায়
2. ✅ Visit করলে JSON response আসে (404 না)
3. ✅ https://your-app.vercel.app/ → Success message
4. ✅ https://your-app.vercel.app/api/v1/config → Config data

---

## 🎉 You're Done!

Deployment successful হলে:
- ✅ Backend API live
- ✅ MongoDB connected
- ✅ API endpoints accessible
- ✅ Ready for frontend integration

**Next:** Admin ও Frontend deploy করুন একই process এ!

---

**সমস্যা হলে:** VERCEL_DEPLOY_INSTRUCTIONS.md দেখুন বিস্তারিত troubleshooting এর জন্য।
