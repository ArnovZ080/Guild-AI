#!/bin/bash
# Deploy Frontend to Google Cloud Storage

set -e

echo "🚀 Deploying Frontend to Google Cloud Storage..."
echo "================================================"

# Navigate to frontend directory
cd frontend

# Set environment variables for build
export VITE_API_URL="https://guild-ai-api-881782424.us-central1.run.app"
export VITE_API_BASE_URL="https://guild-ai-api-881782424.us-central1.run.app"
export VITE_ORCHESTRATOR_BASE_URL="https://guild-ai-api-881782424.us-central1.run.app/api/orchestrator"

# Build the frontend with environment variables
echo "📦 Building frontend with environment variables..."
npm run build

# Upload to Google Cloud Storage
echo "🌐 Uploading to Google Cloud Storage..."
gsutil -m cp -r dist/* gs://your-bucket-name/

# Set public access
echo "🔓 Setting public access..."
gsutil -m acl ch -r -u AllUsers:R gs://your-bucket-name/*

# Optional: Set up CDN
echo "⚡ Setting up CDN..."
gsutil web set -m index.html -e 404.html gs://your-bucket-name

echo "✅ Frontend deployed successfully!"
echo ""
echo "🔗 Your frontend is available at:"
echo "https://storage.googleapis.com/your-bucket-name/index.html"

