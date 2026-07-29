@echo off
echo.
echo Real Estate API - Vercel Deployment
echo =====================================
echo.

REM Check if vercel CLI is installed
where vercel >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Vercel CLI is not installed.
    echo Installing Vercel CLI...
    call npm install -g vercel
    echo Vercel CLI installed successfully!
)

REM Run configuration test
echo.
echo Running pre-deployment checks...
node test-vercel.js

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Pre-deployment checks failed. Please fix errors before deploying.
    pause
    exit /b 1
)

echo.
echo All checks passed!
echo.

REM Ask user if they want to deploy
set /p deploy="Do you want to deploy to Vercel now? (y/n): "

if /i "%deploy%"=="y" (
    echo.
    echo Starting deployment...
    echo.
    
    REM Ask for production deployment
    set /p prod="Deploy to production? (y/n): "
    
    if /i "%prod%"=="y" (
        echo Deploying to production...
        call vercel --prod
    ) else (
        echo Deploying to preview...
        call vercel
    )
    
    echo.
    echo Deployment complete!
    echo.
    echo Don't forget to:
    echo    1. Set environment variables in Vercel dashboard
    echo    2. Update FRONTEND_URL and ALLOWED_ORIGINS
    echo    3. Test your API endpoints
    echo.
) else (
    echo.
    echo Deployment cancelled.
    echo.
    echo When you're ready to deploy, run:
    echo    vercel          (for preview)
    echo    vercel --prod   (for production)
    echo.
)

pause
