#!/bin/bash

# Deploy Guild-AI Frontend to Netlify
# This script builds and deploys the fixed version

echo "🚀 Building Guild-AI Frontend for Netlify deployment..."

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist/

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Build the project
echo "🔨 Building project..."
pnpm build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "📁 Build files are in the 'dist' directory"
    echo ""
    echo "🌐 To deploy to Netlify:"
    echo "1. Go to your Netlify dashboard"
    echo "2. Drag and drop the 'dist' folder to deploy"
    echo "   OR"
    echo "3. Use Netlify CLI: npx netlify deploy --prod --dir=dist"
    echo ""
    echo "🔧 Build optimizations applied:"
    echo "   - Fixed circular dependency issues"
    echo "   - Added manual chunking for better performance"
    echo "   - Optimized dependencies"
else
    echo "❌ Build failed! Please check the errors above."
    exit 1
fi
