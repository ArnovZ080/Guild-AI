#!/usr/bin/env python3
"""
Guild-AI Integration Test Script
Tests the frontend-backend integration
"""

import asyncio
import json
import websockets
import requests
import time
import sys
import os

# Add backend src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend', 'src'))

async def test_websocket_connection():
    """Test WebSocket connection"""
    print("🔌 Testing WebSocket connection...")
    
    try:
        uri = "ws://localhost:8000/ws/general"
        async with websockets.connect(uri) as websocket:
            # Send test message
            await websocket.send("Hello from test!")
            
            # Receive response
            response = await websocket.recv()
            print(f"✅ WebSocket response: {response}")
            
    except Exception as e:
        print(f"❌ WebSocket test failed: {e}")
        return False
    
    return True

def test_api_endpoints():
    """Test API endpoints"""
    print("🌐 Testing API endpoints...")
    
    base_url = "http://localhost:8000"
    
    # Test root endpoint
    try:
        response = requests.get(f"{base_url}/")
        if response.status_code == 200:
            print("✅ Root endpoint working")
        else:
            print(f"❌ Root endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Root endpoint test failed: {e}")
        return False
    
    # Test health endpoint
    try:
        response = requests.get(f"{base_url}/health")
        if response.status_code == 200:
            health_data = response.json()
            print(f"✅ Health check passed: {health_data}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check test failed: {e}")
        return False
    
    # Test available agents endpoint
    try:
        response = requests.get(f"{base_url}/api/agents/available")
        if response.status_code == 200:
            agents_data = response.json()
            print(f"✅ Available agents: {len(agents_data.get('agents', []))} agents")
        else:
            print(f"❌ Available agents endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Available agents test failed: {e}")
        return False
    
    return True

def test_task_execution():
    """Test task execution"""
    print("🚀 Testing task execution...")
    
    base_url = "http://localhost:8000"
    
    # Test task execution
    try:
        task_data = {
            "description": "Create a test blog post about AI",
            "context": {
                "topic": "AI testing",
                "target_audience": "developers",
                "tone": "technical"
            },
            "priority": "normal"
        }
        
        response = requests.post(
            f"{base_url}/api/agents/execute",
            json=task_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Task execution started: {result}")
            return result.get('session_id')
        else:
            print(f"❌ Task execution failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Task execution test failed: {e}")
        return False

async def test_agent_communication(session_id):
    """Test agent communication via WebSocket"""
    print("💬 Testing agent communication...")
    
    try:
        uri = f"ws://localhost:8000/api/agents/ws/default_user/{session_id}"
        async with websockets.connect(uri) as websocket:
            print("✅ Connected to agent WebSocket")
            
            # Wait for agent messages
            try:
                message = await asyncio.wait_for(websocket.recv(), timeout=10.0)
                message_data = json.loads(message)
                print(f"✅ Received agent message: {message_data.get('message_type')}")
                
                # If it's a clarification request, send a response
                if message_data.get('message_type') == 'clarification_request':
                    print("📝 Agent asked for clarification, sending response...")
                    
                    response = {
                        "type": "user_response",
                        "message_id": message_data.get('id'),
                        "session_id": session_id,
                        "response": "Please create a technical blog post about AI automation for developers",
                        "timestamp": time.time()
                    }
                    
                    await websocket.send(json.dumps(response))
                    print("✅ Sent clarification response")
                
                return True
                
            except asyncio.TimeoutError:
                print("⏰ Timeout waiting for agent message")
                return False
                
    except Exception as e:
        print(f"❌ Agent communication test failed: {e}")
        return False

def main():
    """Run all integration tests"""
    print("🧪 Guild-AI Integration Test Suite")
    print("=" * 50)
    
    # Test 1: API Endpoints
    if not test_api_endpoints():
        print("❌ API endpoint tests failed")
        return False
    
    # Test 2: WebSocket Connection
    if not asyncio.run(test_websocket_connection()):
        print("❌ WebSocket connection test failed")
        return False
    
    # Test 3: Task Execution
    session_id = test_task_execution()
    if not session_id:
        print("❌ Task execution test failed")
        return False
    
    # Test 4: Agent Communication
    if not asyncio.run(test_agent_communication(session_id)):
        print("❌ Agent communication test failed")
        return False
    
    print("\n🎉 All integration tests passed!")
    print("✅ Frontend-backend integration is working correctly")
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
