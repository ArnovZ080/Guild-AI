#!/bin/bash
# entrypoint.sh - Wait for dependencies before starting the API server

set -e

echo "🚀 Guild-AI API Server - Waiting for dependencies..."

# Wait for Redis (VPC Connector: 10.87.64.4:6379)
echo "🔍 Checking Redis connection (VPC Connector: 10.87.64.4:6379)..."

python3 << 'PYEOF'
import socket
import time
import sys

host = '10.87.64.4'
port = 6379
timeout = 30
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
        time.sleep(2)

if not connected:
    print(f"❌ Error: Redis connection failed after {timeout} seconds. Exiting.")
    sys.exit(1)
else:
    print("✅ VPC Connector is ready!")
    sys.exit(0)
PYEOF

if [ $? -ne 0 ]; then
    echo "❌ Redis health check failed. Exiting."
    exit 1
fi

# Now that network is ready, start the API server
echo "🚀 Starting FastAPI server..."
# The main application startup command
exec uvicorn api_server.src.main:app --host 0.0.0.0 --port 5000
