@echo off
REM Vercel Deployment Script with Multiple Fallbacks

echo 🚀 Starting Vercel deployment with fallbacks...

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: package.json not found
    exit /b 1
)

echo 📦 Installing dependencies with legacy peer deps...
npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo ❌ Error: Failed to install dependencies
    exit /b 1
)

echo 🏗️ Testing minimal build...
npm run build:minimal
if %errorlevel% neq 0 (
    echo ❌ Error: Minimal build failed
    exit /b 1
)

echo ✅ Minimal build successful!

echo 🔧 Preparing for Vercel deployment...
echo.
echo Current configuration:
echo - Using minimal Vite config
echo - Legacy peer deps enabled
echo - Build command: npm run build:minimal
echo.

echo 📝 Next steps:
echo 1. Commit and push your changes
echo 2. Vercel will use the minimal configuration
echo 3. If it still fails, try alternative platforms
echo.

echo 🚀 Committing changes...
git add .
git commit -m "Deploy with minimal Vite config for Vercel compatibility"
if %errorlevel% neq 0 (
    echo ⚠️ Warning: Git commit failed, but files are ready
)

echo.
echo ✅ Ready to deploy! Run: git push
echo.
echo If Vercel still fails, check VERCEL_EMERGENCY_FIX.md for alternatives.

pause
