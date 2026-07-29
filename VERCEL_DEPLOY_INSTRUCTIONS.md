# 🚀 Vercel Deployment Instructions - IMPORTANT!

## ⚠️ CRITICAL: Root Directory Configuration

আপনার project structure এমন:
```
brokerage-backend/
├── real-estate/           # Backend API
├── real-estate-admin/     # Admin Panel
└── real-estate-frontend/  # Frontend
```

Vercel deploy করার সময় আপনাকে **অবশ্যই** Root Directory specify করতে হবে।

---

## 🎯 সঠিক Deployment Method

### Method 1: Vercel Dashboard থেকে (সবচেয়ে সহজ)

#### Backend API Deploy করতে:

1. **Vercel Dashboard** (https://vercel.com/dashboard) এ যান
2. "Add New Project" ক্লিক করুন
3. আপনার GitHub/GitLab repository import করুন
4. **Configure Project** page এ:
   
   ```
   Project Name: real-estate-api (বা যেকোনো নাম)
   Framework Preset: Other
   Root Directory: real-estate    ← এটা অবশ্যই set করতে হবে!
   ```

5. **Environment Variables** যোগ করুন:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/real-estate
   JWT_SECRET=your_secret_key_here
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend.vercel.app
   ALLOWED_ORIGINS=https://your-frontend.vercel.app
   ```

6. "Deploy" ক্লিক করুন

#### Admin Panel Deploy করতে:

1. "Add New Project" আবার ক্লিক করুন
2. Same repository select করুন
3. **Root Directory: real-estate-admin** set করুন
4. Deploy করুন

#### Frontend Deploy করতে:

1. "Add New Project" আবার ক্লিক করুন
2. Same repository select করুন
3. **Root Directory: real-estate-frontend** set করুন
4. Deploy করুন

---

### Method 2: Vercel CLI থেকে

#### Backend API:

```bash
cd real-estate
vercel --prod
```

প্রথম deployment এ এই questions আসবে:
```
? Set up and deploy "~/brokerage-backend/real-estate"? [Y/n] Y
? Which scope do you want to deploy to? [Your Account]
? Link to existing project? [N/y] N
? What's your project's name? real-estate-api
? In which directory is your code located? ./ 
```

#### Admin Panel:

```bash
cd ../real-estate-admin
vercel --prod
```

#### Frontend:

```bash
cd ../real-estate-frontend
vercel --prod
```

---

## 🔧 যদি ইতিমধ্যে Wrong Configuration এ Deploy করেছেন

### Fix করার জন্য:

1. Vercel Dashboard এ যান
2. আপনার project select করুন
3. **Settings** → **General** এ যান
4. **Root Directory** খুঁজুন
5. `real-estate` type করুন (backend এর জন্য)
6. Save করুন
7. **Deployments** tab এ যান
8. Latest deployment এ "..." ক্লিক করে "Redeploy" করুন

---

## 🧪 Test করার জন্য

Deploy এর পর:

```bash
# Backend API test
curl https://your-backend-url.vercel.app/

# Expected response:
{
  "success": true,
  "message": "Real Estate API",
  "version": "v1",
  "env": "production"
}

# API endpoint test
curl https://your-backend-url.vercel.app/api/v1/config
```

---

## 📝 প্রতিটি Project এর জন্য আলাদা Deployment

| Project | Root Directory | Vercel URL Example |
|---------|---------------|-------------------|
| Backend API | `real-estate` | `real-estate-api.vercel.app` |
| Admin Panel | `real-estate-admin` | `real-estate-admin.vercel.app` |
| Frontend | `real-estate-frontend` | `real-estate-frontend.vercel.app` |

---

## ⚡ Quick Fix Script

আমি একটি script তৈরি করেছি যা সব projects deploy করবে:

**Windows (PowerShell):**
```powershell
# Backend
cd real-estate
vercel --prod
cd ..

# Admin
cd real-estate-admin
vercel --prod
cd ..

# Frontend
cd real-estate-frontend
vercel --prod
cd ..
```

**Mac/Linux (Bash):**
```bash
#!/bin/bash

# Backend
cd real-estate && vercel --prod && cd ..

# Admin
cd real-estate-admin && vercel --prod && cd ..

# Frontend
cd real-estate-frontend && vercel --prod && cd ..
```

---

## 🎯 Environment Variables (সব projects এর জন্য)

### Backend (real-estate):
```env
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/real-estate
JWT_SECRET=your_secret_key_change_this
NODE_ENV=production
FRONTEND_URL=https://your-frontend.vercel.app
ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://your-admin.vercel.app
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=Real Estate <your_email@gmail.com>
```

### Admin Panel (real-estate-admin):
```env
REACT_APP_API_URL=https://your-backend.vercel.app/api/v1
NODE_ENV=production
```

### Frontend (real-estate-frontend):
```env
REACT_APP_API_URL=https://your-backend.vercel.app/api/v1
NODE_ENV=production
```

---

## ❌ Common Mistakes (এড়িয়ে চলুন)

1. ❌ Root directory set না করা
2. ❌ Wrong folder name দেওয়া
3. ❌ Environment variables set না করা
4. ❌ একই project তিনবার deploy করা (আলাদা আলাদা করতে হবে)

---

## ✅ সঠিক পদ্ধতি

1. ✅ প্রতিটি folder (backend, admin, frontend) আলাদাভাবে deploy করুন
2. ✅ Root Directory সঠিকভাবে set করুন
3. ✅ প্রতিটির জন্য আলাদা project name দিন
4. ✅ সঠিক environment variables set করুন
5. ✅ Backend deploy করে তার URL admin ও frontend এ use করুন

---

## 🆘 এখনও 404 Error আসলে

1. Vercel Dashboard → Your Project → Settings → General
2. "Root Directory" check করুন
3. যদি empty বা wrong থাকে, `real-estate` set করুন
4. Save করুন
5. Deployments → Latest → Redeploy করুন

অথবা:

```bash
# Delete এবং fresh deploy
cd real-estate
vercel --prod --force
```

---

## 📞 Next Steps

1. ✅ MongoDB Atlas setup করুন (if not done)
2. ✅ Backend deploy করুন (Root Directory: `real-estate`)
3. ✅ Environment variables set করুন
4. ✅ Test করুন: `https://your-backend.vercel.app/`
5. ✅ Admin deploy করুন (Root Directory: `real-estate-admin`)
6. ✅ Frontend deploy করুন (Root Directory: `real-estate-frontend`)

---

**Important:** প্রতিটি project আলাদাভাবে deploy করতে হবে, একই repository থেকে কিন্তু different root directories দিয়ে।

এখন deploy করুন এবং 404 error চলে যাবে! 🚀
