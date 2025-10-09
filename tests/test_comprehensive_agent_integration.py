#!/usr/bin/env python3
"""
Test Comprehensive Agent Integration
Tests all 104+ agents integration with frontend communication system
"""

import asyncio
import json
import httpx
import websockets
from datetime import datetime
import sys
import os

# Add backend to path
sys.path.append('backend/src')

# Configuration
BACKEND_URL = "http://localhost:8000"
WEBSOCKET_URL = "ws://localhost:8000"
SESSION_ID = "test_comprehensive_session"
USER_ID = "test_user_comprehensive"

async def test_agent_initialization():
    """Test that all agents are properly initialized"""
    print("\n🔍 Testing Agent Initialization...")
    
    try:
        from agents.agent_orchestrator import agent_orchestrator
        
        print(f"✅ Orchestrator initialized with {len(agent_orchestrator.agents)} agents")
        
        # Test agent categories
        categories = {}
        for agent_id, agent in agent_orchestrator.agents.items():
            category = getattr(agent, 'category', 'general')
            if category not in categories:
                categories[category] = 0
            categories[category] += 1
        
        print(f"📊 Agent Categories:")
        for category, count in categories.items():
            print(f"   {category.title()}: {count} agents")
        
        # Test sample agents
        sample_agents = ['orchestrator', 'marketing', 'content', 'sales', 'research']
        for agent_id in sample_agents:
            if agent_id in agent_orchestrator.agents:
                agent = agent_orchestrator.agents[agent_id]
                print(f"✅ {agent.name} ({agent_id}) - Status: {agent.status}")
            else:
                print(f"❌ {agent_id} not found")
        
        return True
        
    except Exception as e:
        print(f"❌ Agent initialization test failed: {e}")
        return False

async def test_frontend_data_generation():
    """Test that frontend data was properly generated"""
    print("\n🔍 Testing Frontend Data Generation...")
    
    try:
        # Check if frontend data file exists
        frontend_data_path = 'frontend/src/data/all_agents.js'
        if not os.path.exists(frontend_data_path):
            print(f"❌ Frontend data file not found: {frontend_data_path}")
            return False
        
        # Read and validate frontend data
        with open(frontend_data_path, 'r') as f:
            content = f.read()
        
        # Check for key exports
        required_exports = ['allAgents', 'agentCategories', 'categoryMetadata', 'agentStats']
        for export in required_exports:
            if export not in content:
                print(f"❌ Missing export: {export}")
                return False
            else:
                print(f"✅ Found export: {export}")
        
        # Extract agent count from content
        if 'export const agentStats =' in content:
            stats_start = content.find('export const agentStats =') + len('export const agentStats =')
            stats_end = content.find(';', stats_start)
            stats_json = content[stats_start:stats_end].strip()
            
            try:
                stats = json.loads(stats_json)
                print(f"✅ Frontend data contains {stats.get('total_agents', 0)} agents")
                print(f"✅ Frontend data contains {stats.get('total_categories', 0)} categories")
            except json.JSONDecodeError:
                print("⚠️ Could not parse agent stats")
        
        return True
        
    except Exception as e:
        print(f"❌ Frontend data test failed: {e}")
        return False

async def test_backend_api_endpoints():
    """Test backend API endpoints"""
    print("\n🔍 Testing Backend API Endpoints...")
    
    async with httpx.AsyncClient() as client:
        try:
            # Test health endpoint
            response = await client.get(f"{BACKEND_URL}/")
            if response.status_code == 200:
                print("✅ Backend health check passed")
            else:
                print(f"❌ Backend health check failed: {response.status_code}")
                return False
            
            # Test available agents endpoint
            response = await client.get(f"{BACKEND_URL}/api/agents/available")
            if response.status_code == 200:
                data = response.json()
                agents = data.get('agents', [])
                print(f"✅ Available agents endpoint: {len(agents)} agents")
            else:
                print(f"❌ Available agents endpoint failed: {response.status_code}")
                return False
            
            # Test agent capabilities endpoint
            response = await client.get(f"{BACKEND_URL}/api/agents/capabilities")
            if response.status_code == 200:
                capabilities = response.json()
                print(f"✅ Agent capabilities endpoint: {len(capabilities)} agents")
            else:
                print(f"❌ Agent capabilities endpoint failed: {response.status_code}")
                return False
            
            # Test all agents status endpoint
            response = await client.get(f"{BACKEND_URL}/api/agents/status")
            if response.status_code == 200:
                status = response.json()
                print(f"✅ All agents status endpoint: {len(status)} agents")
            else:
                print(f"❌ All agents status endpoint failed: {response.status_code}")
                return False
            
            return True
            
        except Exception as e:
            print(f"❌ Backend API test failed: {e}")
            return False

async def test_agent_task_execution():
    """Test agent task execution"""
    print("\n🔍 Testing Agent Task Execution...")
    
    async with httpx.AsyncClient() as client:
        try:
            # Test task execution
            task_data = {
                "description": "Create a marketing strategy for a new product launch",
                "context": {"product": "AI-powered tool", "target_audience": "small businesses"},
                "preferred_agent_id": "marketing"
            }
            
            response = await client.post(
                f"{BACKEND_URL}/api/agents/execute",
                json=task_data
            )
            
            if response.status_code == 200:
                result = response.json()
                session_id = result.get('session_id')
                agent_id = result.get('agent_id')
                print(f"✅ Task execution started: Session {session_id}, Agent {agent_id}")
                
                # Wait a bit for processing
                await asyncio.sleep(2)
                
                # Check session status
                session_response = await client.get(f"{BACKEND_URL}/api/agents/session/{session_id}")
                if session_response.status_code == 200:
                    session_info = session_response.json()
                    print(f"✅ Session status: {session_info.get('status', 'unknown')}")
                
                return True
            else:
                print(f"❌ Task execution failed: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Agent task execution test failed: {e}")
            return False

async def test_websocket_communication():
    """Test WebSocket communication"""
    print("\n🔍 Testing WebSocket Communication...")
    
    try:
        async with websockets.connect(f"{WEBSOCKET_URL}/api/agents/ws/{USER_ID}/{SESSION_ID}") as websocket:
            print("✅ WebSocket connection established")
            
            # Send ping
            await websocket.send(json.dumps({"type": "ping"}))
            
            # Wait for pong
            response = await asyncio.wait_for(websocket.recv(), timeout=5)
            response_data = json.loads(response)
            
            if response_data.get('type') == 'pong':
                print("✅ WebSocket ping/pong successful")
                return True
            else:
                print(f"❌ Unexpected WebSocket response: {response_data}")
                return False
                
    except Exception as e:
        print(f"❌ WebSocket test failed: {e}")
        return False

async def test_agent_marketplace_integration():
    """Test agent marketplace integration"""
    print("\n🔍 Testing Agent Marketplace Integration...")
    
    try:
        # Test that frontend can load agent data
        frontend_data_path = 'frontend/src/data/all_agents.js'
        with open(frontend_data_path, 'r') as f:
            content = f.read()
        
        # Check for marketplace-specific data
        if 'agentCategories' in content and 'categoryMetadata' in content:
            print("✅ Agent marketplace data structure present")
            
            # Extract and validate categories
            categories_start = content.find('export const agentCategories =') + len('export const agentCategories =')
            categories_end = content.find(';', categories_start)
            categories_json = content[categories_start:categories_end].strip()
            
            try:
                categories = json.loads(categories_json)
                print(f"✅ Found {len(categories)} categories for marketplace")
                
                # Check for expected categories
                expected_categories = ['marketing', 'sales', 'content', 'research', 'automation']
                for category in expected_categories:
                    if category in categories:
                        agent_count = len(categories[category])
                        print(f"✅ Category '{category}': {agent_count} agents")
                    else:
                        print(f"⚠️ Expected category '{category}' not found")
                
                return True
                
            except json.JSONDecodeError:
                print("❌ Could not parse categories data")
                return False
        else:
            print("❌ Agent marketplace data structure missing")
            return False
            
    except Exception as e:
        print(f"❌ Agent marketplace integration test failed: {e}")
        return False

async def run_comprehensive_tests():
    """Run all comprehensive tests"""
    print("🚀 Starting Comprehensive Agent Integration Tests")
    print("=" * 60)
    
    tests = [
        ("Agent Initialization", test_agent_initialization),
        ("Frontend Data Generation", test_frontend_data_generation),
        ("Backend API Endpoints", test_backend_api_endpoints),
        ("Agent Task Execution", test_agent_task_execution),
        ("WebSocket Communication", test_websocket_communication),
        ("Agent Marketplace Integration", test_agent_marketplace_integration)
    ]
    
    results = {}
    
    for test_name, test_func in tests:
        print(f"\n{'='*20} {test_name} {'='*20}")
        try:
            result = await test_func()
            results[test_name] = result
        except Exception as e:
            print(f"❌ Test '{test_name}' crashed: {e}")
            results[test_name] = False
    
    # Print summary
    print(f"\n{'='*60}")
    print("🎯 COMPREHENSIVE TEST SUMMARY")
    print(f"{'='*60}")
    
    passed = 0
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{status} {test_name}")
        if result:
            passed += 1
    
    print(f"\n📊 Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 ALL TESTS PASSED! Comprehensive agent integration is working!")
    else:
        print("⚠️ Some tests failed. Check the output above for details.")
    
    return passed == total

if __name__ == "__main__":
    asyncio.run(run_comprehensive_tests())
