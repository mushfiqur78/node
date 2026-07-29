@echo off
echo.
echo ========================================
echo   Push Fixes to Git and Vercel
echo ========================================
echo.

echo [INFO] Checking git status...
git status

echo.
echo [INFO] Adding changes...
git add .

echo.
set /p commit_msg="Enter commit message (or press Enter for default): "
if "%commit_msg%"=="" set commit_msg=Fix serverless MongoDB connection and 500 error

echo.
echo [INFO] Committing with message: %commit_msg%
git commit -m "%commit_msg%"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [WARNING] No changes to commit or commit failed
    echo.
    set /p continue="Continue with push anyway? (y/n): "
    if /i not "%continue%"=="y" (
        echo.
        echo [INFO] Operation cancelled
        pause
        exit /b 0
    )
)

echo.
echo [INFO] Pushing to remote repository...
git push

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [SUCCESS] Changes pushed to Git!
    echo.
    echo Vercel will automatically detect the changes and redeploy.
    echo.
    echo [INFO] Monitor deployment:
    echo    1. Go to: https://vercel.com/dashboard
    echo    2. Click your project
    echo    3. Go to "Deployments" tab
    echo    4. Watch the latest deployment
    echo.
    echo [INFO] Check logs after deployment:
    echo    Deployments → Latest → Logs
    echo.
    echo [INFO] Test after deployment:
    echo    Visit: https://your-app.vercel.app/
    echo.
) else (
    echo.
    echo [ERROR] Failed to push to Git
    echo.
    echo Possible solutions:
    echo   1. Check if you have internet connection
    echo   2. Verify git remote is set: git remote -v
    echo   3. Check if you're logged in: git config user.name
    echo   4. Try pushing manually: git push origin main
    echo.
)

pause
