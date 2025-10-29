#!/usr/bin/env python3
"""
Guild-AI Backend Startup Script
"""

import sys
import os
import subprocess
import logging

# Add the src directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

def start_server():
    """Start the Guild-AI backend server"""
    try:
        print("🚀 Starting Guild-AI Backend Server...")
        print("📍 Server will be available at: http://localhost:8000")
        print("📚 API Documentation: http://localhost:8000/docs")
        print("🔌 WebSocket endpoint: ws://localhost:8000/ws/general")
        print("=" * 60)
        
        # Start the server
        subprocess.run([
            sys.executable, "-m", "uvicorn",
            "main:app",
            "--host", "0.0.0.0",
            "--port", "8000",
            "--reload",
            "--log-level", "info"
        ], cwd=os.path.dirname(__file__))
        
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    start_server()
