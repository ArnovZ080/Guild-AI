#!/usr/bin/env python3
"""
Simple test script to verify LLM connectivity and basic agent functionality
"""

import asyncio
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'guild', 'src'))

from guild.src.models.llm import Llm, LlmModels
from guild.src.core.llm_client import LlmClient

async def test_llm_connectivity():
    """Test basic LLM connectivity with TinyLlama"""
    print("🧪 Testing LLM Connectivity with TinyLlama...")
    
    try:
        # Create LLM client with TinyLlama
        llm = Llm(provider="ollama", model="tinyllama")
        client = LlmClient(llm)
        
        # Simple test prompt
        test_prompt = """
        You are a business strategy expert. 
        A solopreneur wants to grow their SaaS revenue by 50% in 6 months.
        They currently have 100 customers and $10k monthly revenue.
        
        Provide a brief 3-step strategy in JSON format:
        {
            "strategy_name": "Revenue Growth Strategy",
            "steps": [
                {"step": "Step 1", "description": "Brief description"},
                {"step": "Step 2", "description": "Brief description"},
                {"step": "Step 3", "description": "Brief description"}
            ]
        }
        """
        
        print("📡 Sending request to TinyLlama...")
        response = await client.chat(test_prompt)
        
        print("✅ LLM Response received!")
        print("📝 Response:")
        print("-" * 50)
        print(response)
        print("-" * 50)
        
        return True
        
    except Exception as e:
        print(f"❌ LLM connectivity test failed: {e}")
        return False

async def test_agent_prompt():
    """Test a simple agent prompt"""
    print("\n🧪 Testing Simple Agent Prompt...")
    
    try:
        llm = Llm(provider="ollama", model="tinyllama")
        client = LlmClient(llm)
        
        # Test a content strategist prompt
        content_prompt = """
        You are a Content Strategist Agent for a SaaS business.
        
        Business: SaaS tool for small businesses
        Goal: Create content to support 50% revenue growth
        Audience: Small business owners and solopreneurs
        
        Create a content strategy with 3 key content types:
        1. Blog posts
        2. Social media content  
        3. Email campaigns
        
        For each, provide:
        - Content theme
        - Target audience
        - Key message
        - Success metric
        
        Format as JSON.
        """
        
        print("📡 Testing Content Strategist Agent...")
        response = await client.chat(content_prompt)
        
        print("✅ Agent prompt test successful!")
        print("📝 Content Strategy Response:")
        print("-" * 50)
        print(response)
        print("-" * 50)
        
        return True
        
    except Exception as e:
        print(f"❌ Agent prompt test failed: {e}")
        return False

async def test_workflow_generation():
    """Test workflow generation"""
    print("\n🧪 Testing Workflow Generation...")
    
    try:
        llm = Llm(provider="ollama", model="tinyllama")
        client = LlmClient(llm)
        
        workflow_prompt = """
        You are an Orchestrator Agent. Create a workflow for this business goal:
        
        Goal: "Grow revenue by 50% in 6 months"
        Business: SaaS with 100 customers, $10k monthly revenue
        
        Create a 3-step workflow with:
        1. Strategy planning
        2. Content creation
        3. Marketing execution
        
        For each step, specify:
        - Agent type needed
        - Task description
        - Expected output
        - Dependencies
        
        Format as JSON with workflow_name, description, and tasks array.
        """
        
        print("📡 Testing Workflow Generation...")
        response = await client.chat(workflow_prompt)
        
        print("✅ Workflow generation test successful!")
        print("📝 Workflow Response:")
        print("-" * 50)
        print(response)
        print("-" * 50)
        
        return True
        
    except Exception as e:
        print(f"❌ Workflow generation test failed: {e}")
        return False

async def main():
    """Main test function"""
    print("🎯 Guild-AI Simple Agent Test with TinyLlama")
    print("=" * 60)
    
    # Test 1: Basic LLM connectivity
    llm_success = await test_llm_connectivity()
    
    # Test 2: Agent prompt
    agent_success = await test_agent_prompt()
    
    # Test 3: Workflow generation
    workflow_success = await test_workflow_generation()
    
    print("\n" + "=" * 60)
    print("📊 Test Results Summary:")
    print(f"  LLM Connectivity: {'✅ PASS' if llm_success else '❌ FAIL'}")
    print(f"  Agent Prompts: {'✅ PASS' if agent_success else '❌ FAIL'}")
    print(f"  Workflow Generation: {'✅ PASS' if workflow_success else '❌ FAIL'}")
    
    if llm_success and agent_success and workflow_success:
        print("\n🎉 All basic systems are functional with TinyLlama!")
        print("🚀 The agent system is ready for full implementation")
        print("\n📋 Next Steps:")
        print("  1. Fix circular import issues in orchestrator")
        print("  2. Connect frontend to backend agent system")
        print("  3. Implement real workflow execution")
        print("  4. Activate platform connectors")
    else:
        print("\n⚠️ Some systems need attention before full deployment")

if __name__ == "__main__":
    asyncio.run(main())
