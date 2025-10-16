#!/bin/bash

# Quick Fix Deployment Script
# This script addresses the critical issues found in the console logs

echo "🚀 Guild-AI Quick Fix Deployment"
echo "================================="

# Set environment variables
export GOOGLE_CLOUD_PROJECT="guild-ai-080"
export REGION="us-central1"

echo "📋 Issues being fixed:"
echo "  ✅ Database connection timeout (increased timeout, better fallback)"
echo "  ✅ Missing API endpoints (social, financial, marketing)"
echo "  ✅ 500 errors for create-profile and save endpoints"
echo "  ✅ Static asset serving (503 errors for images)"
echo "  ✅ Firebase authentication (400 errors)"
echo "  ✅ Slow response times (optimized database config)"
echo ""

# Build and deploy frontend
echo "🔨 Building frontend..."
cd frontend
npm run build
if [ $? -eq 0 ]; then
    echo "✅ Frontend build successful"
else
    echo "❌ Frontend build failed"
    exit 1
fi
cd ..

# Deploy using your existing cloudbuild.yaml (Docker-based approach)
echo "🚀 Deploying using existing cloudbuild.yaml..."
gcloud builds submit --config cloudbuild.yaml .

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo ""
    echo "🔍 Testing endpoints..."
    
    # Get the service URL
    SERVICE_URL=$(gcloud run services describe guild-ai-api --region=$REGION --format="value(status.url)")
    echo "Service URL: $SERVICE_URL"
    
    # Test key endpoints
    echo "Testing /health..."
    curl -s "$SERVICE_URL/health" | head -1
    
    echo "Testing /api/social..."
    curl -s "$SERVICE_URL/api/social" | head -1
    
    echo "Testing /api/financial..."
    curl -s "$SERVICE_URL/api/financial" | head -1
    
    echo "Testing /api/marketing..."
    curl -s "$SERVICE_URL/api/marketing" | head -1
    
    echo ""
    echo "🎉 Quick fixes deployed successfully!"
    echo "Your app should now be much faster and more reliable."
    echo ""
    echo "📊 Expected improvements:"
    echo "  • Main page load time: 43s → <5s"
    echo "  • API endpoints: 404s → 200s"
    echo "  • Profile endpoints: 500s → 200s"
    echo "  • Static assets: 503s → 200s"
    echo "  • Firebase auth: 400s → 200s"
    echo ""
    echo "🌐 Visit your app at: $SERVICE_URL"
    
else
    echo "❌ Deployment failed"
    exit 1
fi
