@echo off
echo.
echo ========================================
echo   Vercel Deployment - All Projects
echo ========================================
echo.
echo This will deploy all three projects:
echo   1. Backend API (real-estate)
echo   2. Admin Panel (real-estate-admin)
echo   3. Frontend (real-estate-frontend)
echo.

REM Check if vercel CLI is installed
where vercel >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Vercel CLI is not installed.
    echo.
    echo Installing Vercel CLI...
    call npm install -g vercel
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install Vercel CLI
        pause
        exit /b 1
    )
    echo [SUCCESS] Vercel CLI installed!
)

echo [INFO] Vercel CLI found!
echo.

REM Deploy Backend
echo ========================================
echo   Deploying Backend API
echo ========================================
echo.
cd real-estate
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] real-estate folder not found!
    pause
    exit /b 1
)

echo [INFO] Running pre-deployment check...
node test-vercel.js
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Pre-deployment check found issues
    echo.
    set /p continue="Continue anyway? (y/n): "
    if /i not "%continue%"=="y" (
        cd ..
        pause
        exit /b 1
    )
)

echo.
echo [INFO] Deploying backend...
echo.
set /p backend_prod="Deploy backend to production? (y/n): "
if /i "%backend_prod%"=="y" (
    call vercel --prod
) else (
    call vercel
)

cd ..
echo.
echo [SUCCESS] Backend deployment initiated!
echo.

REM Ask if user wants to deploy admin
set /p deploy_admin="Deploy Admin Panel? (y/n): "
if /i "%deploy_admin%"=="y" (
    echo ========================================
    echo   Deploying Admin Panel
    echo ========================================
    echo.
    cd real-estate-admin
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] real-estate-admin folder not found!
        cd ..
    ) else (
        echo [INFO] Deploying admin panel...
        echo.
        set /p admin_prod="Deploy admin to production? (y/n): "
        if /i "%admin_prod%"=="y" (
            call vercel --prod
        ) else (
            call vercel
        )
        cd ..
        echo.
        echo [SUCCESS] Admin panel deployment initiated!
        echo.
    )
)

REM Ask if user wants to deploy frontend
set /p deploy_frontend="Deploy Frontend? (y/n): "
if /i "%deploy_frontend%"=="y" (
    echo ========================================
    echo   Deploying Frontend
    echo ========================================
    echo.
    cd real-estate-frontend
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] real-estate-frontend folder not found!
        cd ..
    ) else (
        echo [INFO] Deploying frontend...
        echo.
        set /p frontend_prod="Deploy frontend to production? (y/n): "
        if /i "%frontend_prod%"=="y" (
            call vercel --prod
        ) else (
            call vercel
        )
        cd ..
        echo.
        echo [SUCCESS] Frontend deployment initiated!
        echo.
    )
)

echo.
echo ========================================
echo   Deployment Complete!
echo ========================================
echo.
echo [IMPORTANT] Don't forget to:
echo   1. Set environment variables in Vercel Dashboard
echo   2. Update API URLs in admin and frontend
echo   3. Test all deployments
echo.
echo Backend Environment Variables needed:
echo   - MONGO_URI
echo   - JWT_SECRET
echo   - NODE_ENV=production
echo   - FRONTEND_URL
echo   - ALLOWED_ORIGINS
echo.
echo Admin/Frontend Environment Variables needed:
echo   - REACT_APP_API_URL (your backend URL)
echo.
echo Visit: https://vercel.com/dashboard to configure
echo.
pause
