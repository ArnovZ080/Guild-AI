#!/usr/bin/env python3
"""
Test Script for Blueprint Engine

This script tests the new blueprint engine for super-agents.
"""

import sys
import os

# Add the guild package to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'guild'))

def test_blueprint_engine():
    print("🏗️ Testing Blueprint Engine for Super-Agents")
    print("=" * 50)
    
    try:
        # Test 1: Import the blueprint engine
        print("📦 Test 1: Import blueprint engine...")
        from guild.src.core.blueprint_engine import BlueprintEngine, Blueprint, BlueprintStep
        print("✅ Import successful!")
        
        # Test 2: Create blueprint engine (without orchestrator for now)
        print("\n🔧 Test 2: Create blueprint engine...")
        
        # Mock orchestrator
        class MockOrchestrator:
            pass
        
        orchestrator = MockOrchestrator()
        blueprint_engine = BlueprintEngine(orchestrator)
        print("✅ Blueprint engine created!")
        
        # Test 3: List loaded blueprints
        print("\n📋 Test 3: List loaded blueprints...")
        blueprints = blueprint_engine.list_blueprints()
        
        if blueprints:
            print(f"✅ Found {len(blueprints)} blueprints:")
            for bp in blueprints:
                print(f"   📁 {bp['name']} ({bp['id']})")
                print(f"      Steps: {bp['step_count']}")
                print(f"      Trigger: {bp['trigger'].get('type', 'manual')}")
        else:
            print("⚠️ No blueprints loaded (this is expected if directory doesn't exist)")
        
        # Test 4: Test blueprint structure
        print("\n🏗️ Test 4: Test blueprint structure...")
        
        # Create a test blueprint
        test_steps = [
            BlueprintStep(
                name="test_step",
                agent="test_agent",
                input="Test input",
                output="test_output"
            )
        ]
        
        test_blueprint = Blueprint(
            id="test_blueprint",
            name="Test Blueprint",
            description="A test blueprint",
            trigger={"type": "manual"},
            steps=test_steps
        )
        
        print("✅ Test blueprint structure created successfully!")
        print(f"   ID: {test_blueprint.id}")
        print(f"   Name: {test_blueprint.name}")
        print(f"   Steps: {len(test_blueprint.steps)}")
        
        print("\n🎉 Blueprint engine test completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_blueprint_engine()
    if success:
        print("\n🏗️ Your super-agents are ready to become cloud employees!")
    else:
        print("\n❌ Blueprint engine test failed.")
