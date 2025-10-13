#!/bin/bash

# Setup Admin and Beta Tester Access for Guild AI
# Run this script after deployment to configure access control

set -e  # Exit on error

PROJECT_ID="guild-ai-080"
REGION="us-central1"
SERVICE_NAME="guild-ai-api"

# Your admin email (change this to your email)
ADMIN_EMAIL="arnovzyl080@gmail.com"

# Beta tester emails (comma-separated, no spaces)
BETA_TESTERS="arnovzyl080@gmail.com,renault.agnes@gmail.com"

echo "🔧 Setting up Admin and Beta Tester access..."
echo ""
echo "Admin Email: $ADMIN_EMAIL"
echo "Beta Testers: $BETA_TESTERS"
echo ""

# Update Cloud Run service with admin and beta tester emails
echo "📝 Updating Cloud Run service..."
gcloud run services update $SERVICE_NAME \
  --region $REGION \
  --project $PROJECT_ID \
  --set-env-vars ADMIN_EMAILS="$ADMIN_EMAIL" \
  --update-env-vars BETA_TESTER_EMAILS="$BETA_TESTERS"

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Go to https://guildof1.com/signup"
echo "2. Sign up with: $ADMIN_EMAIL"
echo "3. You'll have full admin access!"
echo ""
echo "Beta testers can sign up with their emails:"
echo "$BETA_TESTERS" | tr ',' '\n' | sed 's/^/  - /'
echo ""
echo "Everyone else will be redirected to the waiting list."
echo ""
echo "🎉 Your platform is ready for beta testing!"

