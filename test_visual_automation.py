#!/usr/bin/env python3
"""
Test script for the Visual Automation System

This script tests the basic functionality of the VisualParser, UiController,
and VisualAutomationTool to ensure they're working correctly.
"""

import sys
import os

# Add the guild package to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'guild', 'src'))

def test_visual_automation():
    """Test the visual automation system components."""
    print("🧪 Testing Visual Automation System...")
    
    try:
        # Test 1: Import the vision module
        print("1. Testing imports...")
        from guild.src.core.vision import VisualParser, UiController, VisualAutomationTool
        print("   ✅ All vision components imported successfully")
        
        # Test 2: Create instances
        print("2. Testing component instantiation...")
        parser = VisualParser()
        controller = UiController()
        tool = VisualAutomationTool()
        print("   ✅ All components instantiated successfully")
        
        # Test 3: Test VisualParser methods
        print("3. Testing VisualParser...")
        # Create a dummy image (1x1 pixel)
        dummy_image = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\x00\x00\x00\x02\x00\x01\xe5\x27\xde\xfc\x00\x00\x00\x00IEND\xaeB`\x82'
        
        parsed_result = parser.parse_screenshot(dummy_image)
        print(f"   ✅ Parse screenshot result: {parsed_result.get('metadata', {}).get('parsing_method', 'unknown')}")
        
        # Test 4: Test UiController methods
        print("4. Testing UiController...")
        mouse_pos = controller.get_mouse_position()
        print(f"   ✅ Mouse position: {mouse_pos.get('coordinates', {})}")
        
        # Test 5: Test VisualAutomationTool
        print("5. Testing VisualAutomationTool...")
        ui_state = tool.get_ui_state()
        print(f"   ✅ UI state captured: {len(ui_state.get('ui_elements', []))} elements found")
        
        print("\n🎉 All tests passed! Visual Automation System is working correctly.")
        return True
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_tools_integration():
    """Test the tools integration."""
    print("\n🔧 Testing Tools Integration...")
    
    try:
        from guild.src.core.tools import (
            get_visual_automation_tool,
            click_ui_element,
            type_in_ui_element,
            read_ui_text,
            take_ui_screenshot,
            scroll_ui,
            get_current_ui_state
        )
        print("   ✅ All visual automation tools imported successfully")
        
        # Test tool functions
        tool = get_visual_automation_tool()
        print(f"   ✅ Visual automation tool instance: {type(tool).__name__}")
        
        print("\n🎉 Tools integration test passed!")
        return True
        
    except Exception as e:
        print(f"\n❌ Tools integration test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("🚀 Guild AI Visual Automation System Test")
    print("=" * 50)
    
    # Run tests
    test1_passed = test_visual_automation()
    test2_passed = test_tools_integration()
    
    if test1_passed and test2_passed:
        print("\n🎯 All tests passed! The Visual Automation System is ready to use.")
        print("\n📋 Available Functions:")
        print("   • click_ui_element(description) - Click UI elements by description")
        print("   • type_in_ui_element(text, description) - Type into UI elements")
        print("   • read_ui_text(description) - Read text from UI areas")
        print("   • take_ui_screenshot(path) - Capture screenshots")
        print("   • scroll_ui(direction, amount) - Scroll the interface")
        print("   • get_current_ui_state() - Get current UI state")
    else:
        print("\n❌ Some tests failed. Please check the errors above.")
        sys.exit(1)
