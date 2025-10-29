#!/bin/bash
# Deploy Orchestrator Fix Script

set -e

echo "🚀 Deploying Orchestrator Fix..."
echo "=================================="

# Step 1: Deploy Backend Changes
echo "📦 Step 1: Deploying Backend Changes..."

cd api_server

# Deploy to Cloud Run
echo "🌐 Deploying to Cloud Run..."
gcloud run deploy guild-ai-api \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --timeout 900 \
  --memory 2Gi \
  --cpu 2 \
  --max-instances 10

echo "✅ Backend deployed successfully!"

# Step 2: Test Backend
echo "🧪 Step 2: Testing Backend..."

echo "Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s https://guild-ai-api-881782424.us-central1.run.app/api/orchestrator/health)
echo "Health response: $HEALTH_RESPONSE"

if echo "$HEALTH_RESPONSE" | grep -q '"status":"healthy"'; then
    echo "✅ Health endpoint working"
else
    echo "❌ Health endpoint failed"
    exit 1
fi

echo "Testing chat endpoint..."
CHAT_RESPONSE=$(curl -s -X POST https://guild-ai-api-881782424.us-central1.run.app/api/orchestrator/chat/process \
  -H "Content-Type: application/json" \
  -d '{"objective": "Hi, how are you?", "user_id": "test_user"}')

echo "Chat response: $CHAT_RESPONSE"

if echo "$CHAT_RESPONSE" | grep -q '"success":true'; then
    echo "✅ Chat endpoint working"
else
    echo "❌ Chat endpoint failed"
    echo "Response: $CHAT_RESPONSE"
fi

echo ""
echo "🎉 Orchestrator Fix Deployment Complete!"
echo "=================================="
echo ""
echo "📋 Next Steps:"
echo "1. Update frontend environment variables"
echo "2. Deploy frontend changes"
echo "3. Test complete system"
echo ""
echo "🔗 Test URLs:"
echo "Health: https://guild-ai-api-881782424.us-central1.run.app/api/orchestrator/health"
echo "Chat: https://guild-ai-api-881782424.us-central1.run.app/api/orchestrator/chat/process"
echo ""
echo "📊 Expected Results:"
echo "- Health endpoint shows gemini_initialized: true"
echo "- Chat endpoint returns intelligent responses"
echo "- No more 422 errors"
echo "- Orchestrator provides business-focused responses"

