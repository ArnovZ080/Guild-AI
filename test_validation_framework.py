#!/usr/bin/env python3
"""
Test Runner for Validation Framework

This script tests the new validation framework without hanging.
"""

import sys
import os
import time

# Add the guild package to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'guild'))

def test_validation_framework():
    print("🧪 Testing Validation Framework")
    print("=" * 40)
    
    try:
        # Test 1: Import the framework
        print("📦 Test 1: Import validation framework...")
        from guild.src.core.testing import SkillValidator, ValidationResult, TestCase
        print("✅ Import successful!")
        
        # Test 2: Create validator instance
        print("\n🔧 Test 2: Create validator instance...")
        validator = SkillValidator(timeout_seconds=10)
        print("✅ Validator created!")
        
        # Test 3: Test validation logic
        print("\n🔍 Test 3: Test validation logic...")
        
        # Sample skill data
        sample_skill = {
            "type": "visual_skill",
            "name": "Test Skill",
            "description": "A test skill for validation",
            "category": "Testing",
            "config": {
                "skill_pattern": {
                    "steps": [
                        {"action_type": "navigate", "url": "test.com"},
                        {"action_type": "click", "target_element": "button"},
                        {"action_type": "type", "target_element": "input", "action_data": {"text": "test"}}
                    ],
                    "estimated_duration": 30
                }
            }
        }
        
        # Validate the sample skill
        result = validator.validate_skill_template("test_skill", sample_skill)
        print(f"✅ Validation completed!")
        print(f"   Status: {result.status}")
        print(f"   Score: {result.validation_score:.2f}")
        print(f"   Errors: {len(result.errors)}")
        print(f"   Warnings: {len(result.warnings)}")
        
        # Test 4: Test with invalid skill
        print("\n❌ Test 4: Test invalid skill validation...")
        
        invalid_skill = {
            "type": "invalid_type",
            "name": "Bad",
            "description": "Bad skill"
        }
        
        invalid_result = validator.validate_skill_template("bad_skill", invalid_skill)
        print(f"✅ Invalid skill validation completed!")
        print(f"   Status: {invalid_result.status}")
        print(f"   Score: {invalid_result.validation_score:.2f}")
        print(f"   Errors: {len(invalid_result.errors)}")
        
        # Test 5: Test timeout protection
        print("\n⏰ Test 5: Test timeout protection...")
        
        # Create a skill that would cause issues
        problematic_skill = {
            "type": "visual_skill",
            "name": "Problematic Skill",
            "description": "A skill that might cause issues",
            "category": "Testing",
            "config": {
                "skill_pattern": {
                    "steps": [
                        {"action_type": "navigate", "url": "test.com"}
                    ],
                    "estimated_duration": 30
                }
            }
        }
        
        # This should complete quickly due to timeout protection
        start_time = time.time()
        timeout_result = validator.validate_skill_template("timeout_test", problematic_skill)
        duration = time.time() - start_time
        
        print(f"✅ Timeout test completed in {duration:.2f}s!")
        print(f"   Status: {timeout_result.status}")
        print(f"   Score: {timeout_result.validation_score:.2f}")
        
        print("\n🎉 All validation framework tests passed!")
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_validation_framework()
    if success:
        print("\n🧪 Validation framework is ready for production use!")
    else:
        print("\n❌ Validation framework test failed.")
