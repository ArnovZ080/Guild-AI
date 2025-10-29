#!/bin/bash

echo "🔒 Fixing Google Cloud SQL Security Issues"
echo "=========================================="

# Set your project and instance details
PROJECT_ID="guild-ai-080"
INSTANCE_NAME="guild-ai-sql"
REGION="us-central1"

echo "📋 Current instance status:"
gcloud sql instances describe $INSTANCE_NAME --project=$PROJECT_ID

echo ""
echo "🔧 Applying security fixes..."

# 1. Remove public IP and use private networking
echo "1. Removing public IP access..."
gcloud sql instances patch $INSTANCE_NAME \
  --no-assign-ip \
  --network=projects/$PROJECT_ID/global/networks/default \
  --project=$PROJECT_ID

# 2. Force SSL connections
echo "2. Enabling SSL-only connections..."
gcloud sql instances patch $INSTANCE_NAME \
  --require-ssl \
  --project=$PROJECT_ID

# 3. Enable audit logging
echo "3. Enabling audit logging..."
gcloud sql instances patch $INSTANCE_NAME \
  --database-flags=log_statement=all,log_min_duration_statement=0,log_connections=on,log_disconnections=on \
  --project=$PROJECT_ID

# 4. Set password policies
echo "4. Setting password policies..."
gcloud sql instances patch $INSTANCE_NAME \
  --database-flags=password_check_user_name=on,password_check_ole_name=on \
  --project=$PROJECT_ID

# 5. Upgrade resources (adjust based on your needs)
echo "5. Upgrading resources..."
gcloud sql instances patch $INSTANCE_NAME \
  --tier=db-custom-2-4096 \
  --storage-size=50GB \
  --storage-type=SSD \
  --project=$PROJECT_ID

# 6. Enable automated backups
echo "6. Enabling automated backups..."
gcloud sql instances patch $INSTANCE_NAME \
  --backup-start-time=03:00 \
  --retained-backups-count=7 \
  --retained-transaction-log-days=7 \
  --project=$PROJECT_ID

# 7. Enable point-in-time recovery
echo "7. Enabling point-in-time recovery..."
gcloud sql instances patch $INSTANCE_NAME \
  --enable-bin-log \
  --project=$PROJECT_ID

echo ""
echo "✅ Security fixes applied!"
echo ""
echo "📋 Updated instance status:"
gcloud sql instances describe $INSTANCE_NAME --project=$PROJECT_ID

echo ""
echo "🔍 Next steps:"
echo "1. Update your Cloud Run service to use private IP"
echo "2. Update your application connection strings"
echo "3. Test the connection from your application"
echo "4. Monitor the instance for any issues"
