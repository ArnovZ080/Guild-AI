#!/bin/bash
# Deploy Frontend to Google Cloud Run with Environment Variables

set -e

echo "🚀 Deploying Frontend to Google Cloud Run..."
echo "=============================================="

# Navigate to frontend directory
cd frontend

# Build the frontend
echo "📦 Building frontend..."
npm run build

# Deploy to Google Cloud Run with environment variables
echo "🌐 Deploying to Google Cloud Run..."

gcloud run deploy guild-ai-frontend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "VITE_API_URL=https://guild-ai-api-881782424.us-central1.run.app,VITE_API_BASE_URL=https://guild-ai-api-881782424.us-central1.run.app,VITE_ORCHESTRATOR_BASE_URL=https://guild-ai-api-881782424.us-central1.run.app/api/orchestrator" \
  --timeout 300 \
  --memory 1Gi \
  --cpu 1 \
  --max-instances 5

echo "✅ Frontend deployed successfully!"
echo ""
echo "🔗 Your frontend is now available at:"
gcloud run services describe guild-ai-frontend --region=us-central1 --format="value(status.url)"

echo ""
echo "🧪 Test the deployment:"
echo "1. Visit the frontend URL above"
echo "2. Try sending a chat message"
echo "3. Check browser console for any errors"
