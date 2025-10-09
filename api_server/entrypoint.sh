#!/bin/bash
# Entrypoint script for Guild-AI API Server
# Ensures database and Redis connections are ready before starting the application

set -e

echo "🚀 Guild-AI API Server Starting..."

# Configuration
MAX_RETRIES=30
RETRY_INTERVAL=2

# Function to check PostgreSQL connection
check_postgres() {
    echo "🔍 Checking PostgreSQL connection..."
    
    # Try to connect using Python and psycopg2
    python3 << 'PYEOF'
import os
import sys
import time
import psycopg2

try:
    # Get connection details from environment
    cloudsql_conn_name = os.getenv('CLOUDSQL_CONNECTION_NAME')
    
    if cloudsql_conn_name:
        # Cloud Run: Use Unix socket
        host = f'/cloudsql/{cloudsql_conn_name}'
        print(f"Connecting via Unix socket: {host}")
    else:
        # Local: Use host/port
        host = os.getenv('POSTGRES_HOST', 'db')
        print(f"Connecting via TCP: {host}")
    
    # Attempt connection
    conn = psycopg2.connect(
        host=host,
        port=os.getenv('POSTGRES_PORT', '5432'),
        database=os.getenv('POSTGRES_DB', 'workflow_db'),
        user=os.getenv('POSTGRES_USER', 'postgres'),
        password=os.getenv('POSTGRES_PASSWORD', 'password'),
        connect_timeout=5
    )
    conn.close()
    print("✅ PostgreSQL connection successful!")
    sys.exit(0)
except Exception as e:
    print(f"❌ PostgreSQL connection failed: {e}")
    sys.exit(1)
PYEOF
}

# Function to check Redis connection
check_redis() {
    echo "🔍 Checking Redis connection..."
    
    python3 << 'PYEOF'
import os
import sys
import redis

try:
    redis_host = os.getenv('REDIS_HOST', 'redis')
    redis_port = int(os.getenv('REDIS_PORT', '6379'))
    
    print(f"Connecting to Redis at {redis_host}:{redis_port}")
    
    r = redis.Redis(
        host=redis_host,
        port=redis_port,
        db=0,
        socket_connect_timeout=5,
        socket_timeout=5
    )
    r.ping()
    print("✅ Redis connection successful!")
    sys.exit(0)
except Exception as e:
    print(f"❌ Redis connection failed: {e}")
    sys.exit(1)
PYEOF
}

# Wait for PostgreSQL
echo "⏳ Waiting for PostgreSQL to be ready..."
retry_count=0
until check_postgres; do
    retry_count=$((retry_count + 1))
    if [ $retry_count -ge $MAX_RETRIES ]; then
        echo "❌ PostgreSQL connection failed after $MAX_RETRIES attempts"
        exit 1
    fi
    echo "⏳ PostgreSQL not ready, retrying in ${RETRY_INTERVAL}s... (attempt $retry_count/$MAX_RETRIES)"
    sleep $RETRY_INTERVAL
done

# Wait for Redis
echo "⏳ Waiting for Redis to be ready..."
retry_count=0
until check_redis; do
    retry_count=$((retry_count + 1))
    if [ $retry_count -ge $MAX_RETRIES ]; then
        echo "❌ Redis connection failed after $MAX_RETRIES attempts"
        exit 1
    fi
    echo "⏳ Redis not ready, retrying in ${RETRY_INTERVAL}s... (attempt $retry_count/$MAX_RETRIES)"
    sleep $RETRY_INTERVAL
done

echo "✅ All dependencies ready!"
echo "🚀 Starting Guild-AI API Server..."

# Execute the main command (passed as arguments to this script)
exec "$@"

