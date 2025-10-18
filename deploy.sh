#!/bin/bash

# MedLearn Deployment Script
echo "🚀 Starting MedLearn deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Error: Node.js 18+ required. Current version: $(node --version)"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to install dependencies"
    exit 1
fi

# Run security audit
echo "🔒 Running security audit..."
npm audit --audit-level=high

# Build the project
echo "🏗️ Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Error: Build failed"
    exit 1
fi

echo "✅ Build completed successfully!"

# Check if dist directory exists
if [ ! -d "dist" ]; then
    echo "❌ Error: dist directory not found after build"
    exit 1
fi

echo "📁 Build output:"
ls -la dist/

# Test the build
echo "🧪 Testing build..."
npm run preview &
PREVIEW_PID=$!

# Wait for preview to start
sleep 5

# Test health endpoint
if curl -f http://localhost:4173/api/health > /dev/null 2>&1; then
    echo "✅ Health check passed"
else
    echo "⚠️ Health check failed (this is normal for preview mode)"
fi

# Kill preview process
kill $PREVIEW_PID 2>/dev/null

echo "🎉 Deployment preparation complete!"
echo ""
echo "Next steps:"
echo "1. Set environment variables in your deployment platform"
echo "2. Deploy to your chosen platform (Vercel, Firebase, etc.)"
echo "3. Test the deployed application"
echo ""
echo "Required environment variables:"
echo "- MONGO_URI"
echo "- NODE_ENV=production"
echo "- CORS_ORIGINS"
echo "- ADMIN_EMAILS (optional)"
