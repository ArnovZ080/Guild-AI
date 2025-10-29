#!/bin/bash
# Deploy Frontend to Firebase Hosting

set -e

echo "🚀 Deploying Frontend to Firebase Hosting..."
echo "============================================="

# Navigate to frontend directory
cd frontend

# Set environment variables for build
export VITE_API_URL="https://guild-ai-api-881782424.us-central1.run.app"
export VITE_API_BASE_URL="https://guild-ai-api-881782424.us-central1.run.app"
export VITE_ORCHESTRATOR_BASE_URL="https://guild-ai-api-881782424.us-central1.run.app/api/orchestrator"

# Build the frontend with environment variables
echo "📦 Building frontend with environment variables..."
npm run build

# Deploy to Firebase Hosting
echo "🌐 Deploying to Firebase Hosting..."
firebase deploy --only hosting

echo "✅ Frontend deployed successfully!"
echo ""
echo "🔗 Your frontend is available at:"
firebase hosting:channel:list --json | jq -r '.channels[0].url'

