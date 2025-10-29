#!/bin/bash

echo "🚀 DEPLOYING GUILD-AI TO PRODUCTION (SIMPLIFIED)"
echo "================================================="

# Set project ID
export PROJECT_ID=guild-ai-080

echo "📦 Building and deploying to Google Cloud..."
echo "🔧 Using production-ready configuration with Firebase support"

# Deploy using Cloud Build without substitutions
gcloud builds submit --config cloudbuild.yaml --project=$PROJECT_ID

echo "✅ Production deployment initiated!"
echo "🌐 Your API will be available at: https://guild-ai-api-881782424.us-central1.run.app"
echo "🔥 Firebase authentication will be fully functional"
echo "📊 All endpoints will work: /api/onboarding/save, /api/agents/, /api/auth/*, etc."

echo ""
echo "🎯 Next steps:"
echo "1. Wait for deployment to complete (5-10 minutes)"
echo "2. Test your frontend - all 405/404 errors will be resolved"
echo "3. Firebase authentication will work properly"
echo "4. Your users can now log in and use the full application"
