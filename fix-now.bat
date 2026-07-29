@echo off
cls
echo.
echo ========================================
echo   QUICK FIX - Push Debug Code
echo ========================================
echo.

echo [STEP 1/4] Checking git status...
echo.
git status
echo.

echo [STEP 2/4] Adding all changes...
git add .
echo.

echo [STEP 3/4] Committing changes...
git commit -m "Add debug endpoints to fix 500 error"
echo.

echo [STEP 4/4] Pushing to GitHub...
git push
echo.

if %ERRORLEVEL% EQU 0 (
    echo ========================================
    echo   SUCCESS! Code pushed to GitHub
    echo ========================================
    echo.
    echo Vercel will automatically redeploy in 2-3 minutes.
    echo.
    echo NEXT STEPS:
    echo.
    echo 1. Wait 2-3 minutes for deployment
    echo.
    echo 2. Check deployment status:
    echo    https://vercel.com/dashboard
    echo.
    echo 3. Test these URLs in your browser:
    echo.
    echo    Health Check:
    echo    https://your-app.vercel.app/health
    echo.
    echo    Environment Check:
    echo    https://your-app.vercel.app/test
    echo.
    echo 4. Based on results:
    echo.
    echo    - If /health works: Good! Check /test next
    echo    - If /test shows "NOT SET": Add environment variables
    echo    - If /test shows "SET": Check MongoDB Atlas
    echo.
    echo ========================================
    echo   Detailed Instructions
    echo ========================================
    echo.
    echo Read these files for help:
    echo.
    echo   EMERGENCY_FIX.md - Quick diagnosis
    echo   STEP_BY_STEP_NOW.md - Detailed steps
    echo   FIX_500_ERROR.md - Complete guide
    echo.
    echo ========================================
    echo.
    echo Waiting for Vercel deployment...
    echo Check: https://vercel.com/dashboard
    echo.
) else (
    echo ========================================
    echo   ERROR! Failed to push
    echo ========================================
    echo.
    echo Possible reasons:
    echo.
    echo 1. No changes to commit
    echo    - This is OK if you already pushed
    echo    - Check Vercel dashboard for deployment
    echo.
    echo 2. Git not configured
    echo    - Run: git config --global user.name "Your Name"
    echo    - Run: git config --global user.email "your@email.com"
    echo.
    echo 3. Not in git repository
    echo    - Make sure you're in: G:\brokerage-backend
    echo    - Run: git init
    echo    - Run: git remote add origin your-repo-url
    echo.
    echo 4. Network issue
    echo    - Check internet connection
    echo    - Try again later
    echo.
)

echo.
echo Press any key to exit...
pause >nul
