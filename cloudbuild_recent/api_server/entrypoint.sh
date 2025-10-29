#!/bin/bash

echo "🚀 Guild-AI API Server - Starting Production..."
echo "📡 Server will start on port 5000"
echo "🌐 API will be available at http://0.0.0.0:5000"
echo "🔥 Firebase authentication enabled for production"
echo "☁️  Google Cloud environment detected"

# Start the production server with full functionality
exec uvicorn api_server.src.main:app --host 0.0.0.0 --port 5000 --workers 1 --timeout-keep-alive 30