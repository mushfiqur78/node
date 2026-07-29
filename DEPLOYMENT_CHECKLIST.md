# ✅ Vercel Deployment Checklist

Print করে রাখুন এবং একটা একটা করে চেক করুন।

---

## 📋 Part 1: MongoDB Atlas Setup (5 মিনিট)

### Step 1: Account তৈরি
- [ ] https://www.mongodb.com/cloud/atlas এ গিয়েছি
- [ ] Gmail দিয়ে Sign Up করেছি
- [ ] Email verify করেছি

### Step 2: Cluster তৈরি
- [ ] "Create a Cluster" ক্লিক করেছি
- [ ] **Free Shared (M0)** select করেছি
- [ ] **Cloud Provider:** AWS select করেছি
- [ ] **Region:** Singapore (ap-south-1) select করেছি
- [ ] Cluster Name: `Cluster0` (default রেখেছি)
- [ ] "Create Cluster" ক্লিক করেছি
- [ ] 2-5 মিনিট wait করেছি

### Step 3: Database User তৈরি
- [ ] Left sidebar → **Database Access** ক্লিক করেছি
- [ ] "Add New Database User" ক্লিক করেছি
- [ ] Authentication Method: **Password** selected
- [ ] Username লিখেছি: `_________________`
- [ ] Password লিখেছি: `_________________`
- [ ] Password কপি করে save করেছি
- [ ] Database User Privileges: **Read and write to any database**
- [ ] "Add User" ক্লিক করেছি

### Step 4: Network Access Setup
- [ ] Left sidebar → **Network Access** ক্লিক করেছি
- [ ] "Add IP Address" ক্লিক করেছি
- [ ] **"Allow Access from Anywhere"** ক্লিক করেছি
- [ ] IP: `0.0.0.0/0` confirm করেছি
- [ ] "Confirm" ক্লিক করেছি

### Step 5: Connection String
- [ ] Left sidebar → **Database** → **Connect** ক্লিক করেছি
- [ ] "Connect your application" select করেছি
- [ ] Driver: **Node.js**, Version: **4.1 or later**
- [ ] Connection string কপি করেছি
- [ ] `<password>` এর জায়গায় actual password দিয়েছি
- [ ] শেষে `/real-estate` যোগ করেছি
- [ ] Final connection string:
  ```
  mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/real-estate?retryWrites=true&w=majority
  ```
- [ ] এটা কোথাও save করেছি

---

## 📋 Part 2: Vercel Account Setup (2 মিনিট)

- [ ] https://vercel.com এ গিয়েছি
- [ ] "Sign Up" ক্লিক করেছি
- [ ] **"Continue with GitHub"** select করেছি
- [ ] GitHub authorize করেছি
- [ ] Vercel Dashboard দেখতে পাচ্ছি

---

## 📋 Part 3: Code Push to GitHub (যদি করা না থাকে)

- [ ] GitHub এ নতুন repository তৈরি করেছি: `brokerage-backend`
- [ ] Local terminal এ:
  ```bash
  cd G:\brokerage-backend
  git init
  git add .
  git commit -m "Initial commit"
  git remote add origin https://github.com/username/brokerage-backend.git
  git branch -M main
  git push -u origin main
  ```
- [ ] GitHub এ code দেখতে পাচ্ছি

---

## 📋 Part 4: Backend API Deployment (মূল পার্ট - 10 মিনিট)

### Step 1: Import Repository
- [ ] https://vercel.com/dashboard এ গিয়েছি
- [ ] "Add New..." → "Project" ক্লিক করেছি
- [ ] `brokerage-backend` repository খুঁজে পেয়েছি
- [ ] "Import" ক্লিক করেছি

### Step 2: Configure Project ⚠️ (সবচেয়ে গুরুত্বপূর্ণ!)
- [ ] **Project Name:** `real-estate-api` লিখেছি
- [ ] **Framework Preset:** "Other" select করেছি
- [ ] **Root Directory:** এখানে ক্লিক করে `real-estate` লিখেছি ⭐
- [ ] **Build Command:** খালি রেখেছি
- [ ] **Output Directory:** খালি রেখেছি
- [ ] **Install Command:** `npm install` (default আছে)

### Step 3: Environment Variables যোগ করা
প্রতিটি variable এর জন্য:
- [ ] "Add" button ক্লিক করছি
- [ ] Name লিখছি
- [ ] Value paste করছি
- [ ] ✓ Production, ✓ Preview, ✓ Development সব চেক করছি

#### Variables (একটা একটা করে add করুন):

**1. MONGO_URI**
- [ ] Name: `MONGO_URI`
- [ ] Value: `mongodb+srv://username:password@cluster.mongodb.net/real-estate?retryWrites=true&w=majority`
- [ ] ✓ All environments checked
- [ ] "Add" clicked

**2. JWT_SECRET**
- [ ] Name: `JWT_SECRET`
- [ ] Value: `your_super_secret_key_minimum_32_characters_long_12345678`
- [ ] ✓ All environments checked
- [ ] "Add" clicked

**3. NODE_ENV**
- [ ] Name: `NODE_ENV`
- [ ] Value: `production`
- [ ] ✓ All environments checked
- [ ] "Add" clicked

**4. FRONTEND_URL** (এখনকার জন্য temporary)
- [ ] Name: `FRONTEND_URL`
- [ ] Value: `http://localhost:3000` (পরে change করবেন)
- [ ] ✓ All environments checked
- [ ] "Add" clicked

**5. ALLOWED_ORIGINS** (এখনকার জন্য)
- [ ] Name: `ALLOWED_ORIGINS`
- [ ] Value: `*` (পরে specific domains দেবেন)
- [ ] ✓ All environments checked
- [ ] "Add" clicked

**6-9. Email Config (Optional - skip করতে পারেন)**
- [ ] `SMTP_HOST`: `smtp.gmail.com`
- [ ] `SMTP_PORT`: `587`
- [ ] `SMTP_USER`: `your_email@gmail.com`
- [ ] `SMTP_PASS`: `your_gmail_app_password`

### Step 4: Deploy
- [ ] সব environment variables add করা শেষ
- [ ] **"Deploy"** button ক্লিক করেছি
- [ ] Building... দেখছি
- [ ] 2-3 মিনিট wait করছি

### Step 5: Deployment Complete
- [ ] "Congratulations!" বা "Ready" দেখছি
- [ ] Deployment URL কপি করেছি: `_________________________________`
- [ ] URL কোথাও save করেছি

---

## 📋 Part 5: Testing (2 মিনিট)

### Test 1: Health Check
- [ ] Browser এ গিয়েছি: `https://your-app.vercel.app/`
- [ ] এই response পেয়েছি:
  ```json
  {
    "success": true,
    "message": "Real Estate API",
    "version": "v1",
    "env": "production"
  }
  ```
- [ ] ✅ Success!

### Test 2: Config Endpoint
- [ ] Browser এ গিয়েছি: `https://your-app.vercel.app/api/v1/config`
- [ ] Data দেখছি (404 না)
- [ ] ✅ Success!

### Test 3: Properties Endpoint
- [ ] Browser এ গিয়েছি: `https://your-app.vercel.app/api/v1/properties`
- [ ] Response পেয়েছি
- [ ] ✅ Success!

---

## 📋 Part 6: যদি 404 Error আসে (Troubleshooting)

### Fix 1: Root Directory Check
- [ ] Vercel Dashboard → My Project → **Settings**
- [ ] **General** section এ scroll করেছি
- [ ] **Root Directory** দেখেছি
- [ ] যদি খালি বা ভুল থাকে:
  - [ ] "Edit" ক্লিক করেছি
  - [ ] `real-estate` লিখেছি
  - [ ] "Save" ক্লিক করেছি

### Fix 2: Redeploy
- [ ] **Deployments** tab এ গিয়েছি
- [ ] Latest deployment এ **⋯** (three dots) ক্লিক করেছি
- [ ] "Redeploy" select করেছি
- [ ] ⚠️ "Use existing Build Cache" **uncheck** করেছি
- [ ] "Redeploy" ক্লিক করেছি
- [ ] Wait করছি
- [ ] Test করেছি - এখন কাজ করছে ✅

### Fix 3: Check Logs
- [ ] Deployments → Latest → **Logs** tab
- [ ] Red errors খুঁজেছি
- [ ] Error থাকলে fix করেছি

---

## 📋 Part 7: Admin Panel Deploy (Optional - 5 মিনিট)

- [ ] Vercel Dashboard → "Add New Project"
- [ ] Same repository (`brokerage-backend`) import করেছি
- [ ] Project Name: `real-estate-admin`
- [ ] **Root Directory:** `real-estate-admin` ⭐
- [ ] Environment Variable যোগ করেছি:
  - [ ] `REACT_APP_API_URL`: `https://your-backend.vercel.app/api/v1`
- [ ] Deploy করেছি
- [ ] Test করেছি

---

## 📋 Part 8: Frontend Deploy (Optional - 5 মিনিট)

- [ ] Vercel Dashboard → "Add New Project"
- [ ] Same repository (`brokerage-backend`) import করেছি
- [ ] Project Name: `real-estate-frontend`
- [ ] **Root Directory:** `real-estate-frontend` ⭐
- [ ] Environment Variable যোগ করেছি:
  - [ ] `REACT_APP_API_URL`: `https://your-backend.vercel.app/api/v1`
- [ ] Deploy করেছি
- [ ] Test করেছি

---

## 📋 Part 9: URLs Update (Final Step - 3 মিনিট)

### URLs Collect করা:
- [ ] Backend URL: `_________________________________`
- [ ] Admin URL: `_________________________________`
- [ ] Frontend URL: `_________________________________`

### Backend Environment Variables Update:
- [ ] Vercel → Backend Project → Settings → Environment Variables
- [ ] `FRONTEND_URL` edit করে actual frontend URL দিয়েছি
- [ ] `ALLOWED_ORIGINS` edit করে:
  ```
  https://your-frontend.vercel.app,https://your-admin.vercel.app
  ```
- [ ] Save করেছি
- [ ] Redeploy করেছি

### Admin/Frontend Environment Update:
- [ ] Admin project → Settings → Environment Variables
- [ ] `REACT_APP_API_URL` verify করেছি (backend URL আছে)
- [ ] Frontend project এও same করেছি
- [ ] উভয়ে redeploy করেছি

---

## ✅ Final Verification

### Backend:
- [ ] Health check কাজ করছে
- [ ] API endpoints accessible
- [ ] MongoDB connected (no errors in logs)
- [ ] CORS configured

### Admin:
- [ ] Login page open হচ্ছে
- [ ] API calls কাজ করছে
- [ ] No CORS errors

### Frontend:
- [ ] Home page load হচ্ছে
- [ ] Properties list দেখাচ্ছে
- [ ] API calls কাজ করছে
- [ ] No CORS errors

---

## 🎉 Deployment Complete!

- [ ] ✅ সব test pass করেছে
- [ ] ✅ URLs save করেছি
- [ ] ✅ Environment variables configured
- [ ] ✅ Production ready

---

## 📝 Notes (সমস্যা হলে লিখুন)

```
_________________________________________________________________

_________________________________________________________________

_________________________________________________________________

_________________________________________________________________

_________________________________________________________________
```

---

## 🆘 Help Resources

যদি আটকে যান:
- 📄 `QUICK_FIX_404_BN.md` - তাড়াতাড়ি fix
- 📖 `DEPLOYMENT_STEP_BY_STEP.md` - বিস্তারিত guide
- 🚀 `deploy-all.bat` - Automated script

---

**Checklist সম্পন্ন:** `____/____/________`  
**Deployed by:** `_________________`  
**Status:** ☐ Successful ☐ Issues ☐ In Progress
