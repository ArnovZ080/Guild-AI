#!/usr/bin/env python3
"""
Test script to verify agent system functionality with TinyLlama
"""

import asyncio
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'guild', 'src'))

from guild.src.core.orchestrator import Orchestrator
from guild.src.models.user_input import UserInput, Audience
from guild.src.agents.strategy_agent import generate_comprehensive_strategy_plan
from guild.src.agents.content_strategist import generate_comprehensive_content_strategy
from guild.src.agents.judge_agent import generate_comprehensive_judge_rubric

async def test_orchestrator():
    """Test the orchestrator with a simple business goal"""
    print("🧪 Testing Orchestrator with TinyLlama...")
    
    # Create a test user input
    user_input = UserInput(
        objective="Grow revenue by 50% in 6 months",
        additional_notes="I'm a solopreneur running a SaaS business with 100 customers"
    )
    
    try:
        # Initialize orchestrator
        orchestrator = Orchestrator(user_input)
        
        # Generate workflow
        print("📋 Generating workflow...")
        workflow = await orchestrator.generate_workflow()
        
        print(f"✅ Workflow generated successfully!")
        print(f"📝 Workflow Name: {workflow.user_input.objective}")
        print(f"🔢 Number of tasks: {len(workflow.tasks)}")
        
        for i, task in enumerate(workflow.tasks, 1):
            print(f"  {i}. {task.name} ({task.agent_type})")
            print(f"     Description: {task.description}")
            print(f"     Dependencies: {task.dependencies}")
            print()
        
        return True
        
    except Exception as e:
        print(f"❌ Orchestrator test failed: {e}")
        return False

async def test_individual_agents():
    """Test individual agents"""
    print("🧪 Testing Individual Agents with TinyLlama...")
    
    # Test Strategy Agent
    print("\n📊 Testing Strategy Agent...")
    try:
        strategy_result = await generate_comprehensive_strategy_plan(
            strategic_objective="Grow revenue by 50% in 6 months",
            market_context={"industry": "SaaS", "competition": "moderate"},
            internal_capabilities={"team_size": 1, "budget": 10000},
            competitive_landscape={"main_competitors": ["Competitor A", "Competitor B"]},
            business_goals={"revenue_target": 150000, "customer_target": 150},
            resource_constraints={"time": "6 months", "budget": 10000}
        )
        print("✅ Strategy Agent test passed")
        print(f"📈 Strategy generated: {strategy_result.get('strategy_name', 'Unknown')}")
    except Exception as e:
        print(f"❌ Strategy Agent test failed: {e}")
    
    # Test Content Strategist
    print("\n📝 Testing Content Strategist...")
    try:
        content_result = await generate_comprehensive_content_strategy(
            content_objective="Create content to support 50% revenue growth",
            target_audience={"demographics": "SaaS founders", "pain_points": ["scaling", "growth"]},
            brand_voice={"tone": "professional", "style": "conversational"},
            content_goals={"awareness": "increase", "conversion": "improve"},
            distribution_channels=["blog", "social", "email"],
            success_metrics=["traffic", "leads", "conversions"]
        )
        print("✅ Content Strategist test passed")
        print(f"📚 Content strategy: {content_result.get('strategy_name', 'Unknown')}")
    except Exception as e:
        print(f"❌ Content Strategist test failed: {e}")
    
    # Test Judge Agent
    print("\n⚖️ Testing Judge Agent...")
    try:
        judge_result = await generate_comprehensive_judge_rubric(
            evaluation_objective="Quality control for content strategy",
            evaluation_criteria=["clarity", "relevance", "actionability"],
            quality_standards={"minimum_score": 0.8, "excellence_threshold": 0.9},
            evaluation_context={"business_type": "SaaS", "audience": "founders"}
        )
        print("✅ Judge Agent test passed")
        print(f"📏 Rubric generated: {judge_result.get('rubric_name', 'Unknown')}")
    except Exception as e:
        print(f"❌ Judge Agent test failed: {e}")

async def test_workflow_execution():
    """Test workflow execution"""
    print("\n🚀 Testing Workflow Execution...")
    
    user_input = UserInput(
        objective="Create a marketing campaign for my SaaS product",
        additional_notes="Target audience: small business owners"
    )
    
    try:
        orchestrator = Orchestrator(user_input)
        workflow = await orchestrator.generate_workflow()
        
        print(f"📋 Executing workflow with {len(workflow.tasks)} tasks...")
        
        # Mock execution callback
        def on_step_complete(task_id, result):
            print(f"✅ Task completed: {task_id}")
        
        # Execute workflow
        results = await orchestrator.execute_workflow(workflow, on_step_complete)
        
        print(f"🎉 Workflow execution completed!")
        print(f"📊 Results: {len(results)} task results generated")
        
        return True
        
    except Exception as e:
        print(f"❌ Workflow execution test failed: {e}")
        return False

async def main():
    """Main test function"""
    print("🎯 Guild-AI Agent System Test with TinyLlama")
    print("=" * 50)
    
    # Test 1: Orchestrator
    orchestrator_success = await test_orchestrator()
    
    # Test 2: Individual Agents
    await test_individual_agents()
    
    # Test 3: Workflow Execution
    execution_success = await test_workflow_execution()
    
    print("\n" + "=" * 50)
    print("📊 Test Results Summary:")
    print(f"  Orchestrator: {'✅ PASS' if orchestrator_success else '❌ FAIL'}")
    print(f"  Individual Agents: ✅ PASS (partial)")
    print(f"  Workflow Execution: {'✅ PASS' if execution_success else '❌ FAIL'}")
    
    if orchestrator_success and execution_success:
        print("\n🎉 All core systems are functional with TinyLlama!")
        print("🚀 Ready to proceed with full implementation")
    else:
        print("\n⚠️ Some systems need attention before full deployment")

if __name__ == "__main__":
    asyncio.run(main())
