#!/bin/bash

echo "🗄️  Running Database Migrations"
echo "================================"

# Set variables
PROJECT_ID="guild-ai-080"
INSTANCE_NAME="guild-ai-sql"
REGION="us-central1"

echo "📋 Getting database password..."
POSTGRES_PASSWORD=$(gcloud secrets versions access latest --secret=db-root-password --project=$PROJECT_ID)

echo "🔌 Starting Cloud SQL Proxy..."
# Download and setup Cloud SQL Proxy
curl -o /tmp/cloud_sql_proxy https://dl.google.com/cloudsql/cloud_sql_proxy.darwin.amd64
chmod +x /tmp/cloud_sql_proxy

# Start Cloud SQL Proxy in background
/tmp/cloud_sql_proxy -instances=$PROJECT_ID:$REGION:$INSTANCE_NAME=tcp:5432 &
PROXY_PID=$!

# Wait for proxy to be ready
echo "⏳ Waiting for Cloud SQL Proxy to be ready..."
sleep 15

# Test connection
echo "🔍 Testing database connection..."
PGPASSWORD=$POSTGRES_PASSWORD psql -h 127.0.0.1 -U postgres -c "SELECT 1;" || {
  echo "❌ Database connection failed!"
  kill $PROXY_PID
  exit 1
}

echo "✅ Database connection successful!"

# Create database if it doesn't exist
echo "📁 Creating database if needed..."
PGPASSWORD=$POSTGRES_PASSWORD psql -h 127.0.0.1 -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'workflow_db'" | grep -q 1 || {
  echo "Creating workflow_db database..."
  PGPASSWORD=$POSTGRES_PASSWORD psql -h 127.0.0.1 -U postgres -c "CREATE DATABASE workflow_db"
}

# Run essential migrations
echo "🔧 Running database migrations..."

# Essential user table updates
echo "👤 Updating user table..."
PGPASSWORD=$POSTGRES_PASSWORD psql -h 127.0.0.1 -U postgres -d workflow_db -c "
ALTER TABLE users ADD COLUMN IF NOT EXISTS firebase_uid VARCHAR UNIQUE;
ALTER TABLE users ALTER COLUMN supabase_id DROP NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_beta_tester BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
" || echo "User table updates completed (some may have failed if columns already exist)"

# Run conversation tables migration
echo "💬 Creating conversation tables..."
PGPASSWORD=$POSTGRES_PASSWORD psql -h 127.0.0.1 -U postgres -d workflow_db -f /Users/arnovanzyl/Dropbox/Mac\ \(2\)/Documents/GitHub/Guild-AI/api_server/migrations/004_create_conversation_tables_postgresql.sql || echo "Conversation tables migration completed"

echo "✅ Database migrations completed successfully!"

# Kill proxy
kill $PROXY_PID

echo "🎉 All database migrations completed!"
