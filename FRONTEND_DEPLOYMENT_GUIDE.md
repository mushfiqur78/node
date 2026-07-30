# Frontend Deployment Guide

## ✅ Pre-deployment Checklist
- [x] Fixed all TypeScript errors (0 errors)
- [x] Created vercel.json configuration
- [x] Added production image domain in next.config.ts
- [x] Pushed changes to GitHub

## 🚀 Deployment Steps

### Step 1: Import Project to Vercel
1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your GitHub account and choose the **"node"** repository
4. Click "Import"

### Step 2: Configure Project Settings
1. **Project Name**: `real-estate-frontend` (or any name you prefer)
2. **Framework Preset**: Next.js (should be auto-detected)
3. **Root Directory**: Click "Edit" and type `real-estate-frontend` ✅ IMPORTANT!
4. **Build Command**: Leave as default (`npm run build`)
5. **Output Directory**: Leave as default (`.next`)
6. **Install Command**: Leave as default (`npm install`)

### Step 3: Add Environment Variables
Click "Environment Variables" and add:

**Variable Name**: `NEXT_PUBLIC_API_URL`  
**Value**: `https://node-flax-eight.vercel.app/api/v1`

Make sure to check all three environments:
- ✅ Production
- ✅ Preview
- ✅ Development

### Step 4: Deploy
1. Click "Deploy" button
2. Wait for deployment (usually 2-3 minutes)
3. Once deployed, you'll get a URL like: `https://real-estate-frontend-xyz.vercel.app`

### Step 5: Update Backend CORS Settings
After frontend is deployed, you need to update the backend to allow requests from the frontend URL.

1. Go to your backend Vercel project: https://vercel.com/dashboard
2. Find the **"node"** project (backend API)
3. Go to Settings → Environment Variables
4. Add or update `ALLOWED_ORIGINS`:
   ```
   ALLOWED_ORIGINS=https://real-estate-frontend-xyz.vercel.app,https://node-owig-lblt6czfwr-my-node1.vercel.app
   ```
   (Replace `real-estate-frontend-xyz.vercel.app` with your actual frontend URL)
5. Save and redeploy the backend

### Step 6: Test Frontend
1. Visit your frontend URL
2. Test the following:
   - ✅ Home page loads
   - ✅ Property listings display
   - ✅ Can view property details
   - ✅ Contact form works
   - ✅ Can register/login

## 🔧 Troubleshooting

### If you see "404 NOT_FOUND"
- Check that Root Directory is set to `real-estate-frontend`
- Redeploy with "Use existing Build Cache" unchecked

### If you see "500 INTERNAL_SERVER_ERROR"
- Check the deployment logs in Vercel
- Verify environment variable `NEXT_PUBLIC_API_URL` is set correctly
- Make sure the backend API is running

### If images don't load
- Check that `next.config.ts` has the correct image domain
- Verify the backend URL is accessible

### If API calls fail
- Check browser console for CORS errors
- Update backend `ALLOWED_ORIGINS` to include frontend URL
- Verify `NEXT_PUBLIC_API_URL` environment variable

## 📝 Summary

**Backend API URL**: https://node-flax-eight.vercel.app  
**Admin Panel URL**: https://node-owig-lblt6czfwr-my-node1.vercel.app  
**Frontend URL**: (Will be generated after deployment)

**Environment Variables Needed**:
- `NEXT_PUBLIC_API_URL=https://node-flax-eight.vercel.app/api/v1`

**Backend CORS Update Needed**:
- Add frontend URL to `ALLOWED_ORIGINS` in backend environment variables

---

## 🎉 After Successful Deployment

All three applications will be live:
1. ✅ **Backend API** - Handling all data and business logic
2. ✅ **Admin Panel** - Managing properties, users, and content
3. ✅ **Frontend** - Public-facing website for property browsing

Remember to update the backend `ALLOWED_ORIGINS` after getting the frontend URL!
