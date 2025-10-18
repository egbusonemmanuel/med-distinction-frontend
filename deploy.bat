@echo off
REM MedLearn Deployment Script for Windows

echo 🚀 Starting MedLearn deployment...

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: package.json not found. Please run this script from the project root.
    exit /b 1
)

REM Check Node.js version
for /f "tokens=1" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js version: %NODE_VERSION%

REM Install dependencies
echo 📦 Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo ❌ Error: Failed to install dependencies
    exit /b 1
)

REM Run security audit
echo 🔒 Running security audit...
npm audit --audit-level=high

REM Build the project
echo 🏗️ Building project...
npm run build
if %errorlevel% neq 0 (
    echo ❌ Error: Build failed
    exit /b 1
)

echo ✅ Build completed successfully!

REM Check if dist directory exists
if not exist "dist" (
    echo ❌ Error: dist directory not found after build
    exit /b 1
)

echo 📁 Build output:
dir dist

echo 🎉 Deployment preparation complete!
echo.
echo Next steps:
echo 1. Set environment variables in your deployment platform
echo 2. Deploy to your chosen platform (Vercel, Firebase, etc.)
echo 3. Test the deployed application
echo.
echo Required environment variables:
echo - MONGO_URI
echo - NODE_ENV=production
echo - CORS_ORIGINS
echo - ADMIN_EMAILS (optional)

pause
