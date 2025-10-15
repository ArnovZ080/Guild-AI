#!/bin/bash
# entrypoint.sh - Wait for dependencies before starting the API server

set -e

echo "🚀 Guild-AI API Server - Checking dependencies..."

# Check if Redis is available (VPC Connector: 10.87.64.4:6379)
echo "🔍 Checking Redis connection (VPC Connector: 10.87.64.4:6379)..."

python3 << 'PYEOF'
import socket
import time
import sys
import os

host = '10.87.64.4'
port = 6379
timeout = 10  # Reduced timeout for faster startup
start_time = time.time()
connected = False

print(f"Attempting to connect to Redis at {host}:{port}...")

while time.time() - start_time < timeout:
    try:
        s = socket.create_connection((host, port), timeout=2)
        s.close()
        connected = True
        print(f"✅ Redis is ready at {host}:{port}")
        break
    except socket.error as e:
        elapsed = int(time.time() - start_time)
        print(f"⏳ Waiting for Redis... ({elapsed}s elapsed)")
        time.sleep(1)

if not connected:
    print(f"⚠️  Warning: Redis connection failed after {timeout} seconds.")
    print("📝 Continuing without Redis - some features may be limited.")
    print("💡 To enable full functionality, ensure Redis is available at 10.87.64.4:6379")
    # Set environment variable to indicate Redis is unavailable
    os.environ['REDIS_AVAILABLE'] = 'false'
else:
    print("✅ Redis is connected!")
    os.environ['REDIS_AVAILABLE'] = 'true'

sys.exit(0)
PYEOF

# Start the API server regardless of Redis status
echo "🚀 Starting FastAPI server..."
echo "📡 Server will start on port 5000"
echo "🌐 API will be available at http://0.0.0.0:5000"

# Add timeout and retry logic for startup
echo "⏳ Starting application with timeout protection..."

# The main application startup command with timeout
timeout 60 uvicorn api_server.src.main:app --host 0.0.0.0 --port 5000 --workers 1 --timeout-keep-alive 30

# If timeout occurs, try again with minimal configuration
if [ $? -eq 124 ]; then
    echo "⚠️  First startup attempt timed out. Trying with minimal configuration..."
    exec uvicorn api_server.src.main:app --host 0.0.0.0 --port 5000 --workers 1 --timeout-keep-alive 10
else
    echo "✅ Application started successfully"
fi
