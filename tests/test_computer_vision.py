#!/usr/bin/env python3
"""
Test Script for Computer Vision System

This script demonstrates the new computer vision capabilities using OpenCV and EasyOCR.
Run this to see your agents' visual understanding in action!
"""

import sys
import os
import time
import logging

# Add the guild package to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'guild', 'src'))

from guild.src.core.vision.visual_parser import VisualParser
from guild.src.core.vision.ui_controller import UiController
from guild.src.core.vision.visual_automation_tool import VisualAutomationTool

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def test_visual_parser():
    """Test the VisualParser with computer vision capabilities."""
    print("🔍 Testing VisualParser...")
    
    try:
        parser = VisualParser()
        
        if not parser.initialized:
            print("❌ VisualParser failed to initialize")
            return False
        
        print("✅ VisualParser initialized successfully")
        print(f"   - EasyOCR ready: {parser.initialized}")
        
        # Test with a real screenshot
        print("\n📸 Testing screenshot parsing...")
        
        # Take a real screenshot for testing
        ui_controller = UiController()
        screenshot = ui_controller.take_screenshot()
        
        if not screenshot:
            print("❌ Failed to capture screenshot")
            return False
        
        print(f"   - Screenshot captured: {len(screenshot)} bytes")
        
        # Parse the screenshot
        result = parser.parse_screenshot(screenshot)
        
        if "error" in result:
            print(f"❌ Parsing failed: {result['error']}")
            return False
        
        print("✅ Screenshot parsing successful")
        print(f"   - Elements detected: {result['metadata']['total_elements']}")
        print(f"   - Parsing method: {result['metadata']['parsing_method']}")
        print(f"   - Confidence: {result['metadata']['parsing_confidence']:.2f}")
        
        return True
        
    except Exception as e:
        print(f"❌ VisualParser test failed: {e}")
        return False


def test_ui_controller():
    """Test the UiController for UI automation."""
    print("\n🎮 Testing UiController...")
    
    try:
        controller = UiController()
        
        # Get screen information
        screen_info = controller.get_screen_info()
        print(f"✅ UiController initialized")
        print(f"   - Screen: {screen_info['width']}x{screen_info['height']}")
        print(f"   - Scale factor: {screen_info['scale_factor']:.2f}")
        
        # Test mouse position (safe operation)
        current_pos = controller.get_mouse_position()
        print(f"   - Current mouse position: {current_pos}")
        
        # Test screenshot capability (safe operation)
        print("\n📸 Testing screenshot capability...")
        screenshot = controller.take_screenshot()
        
        if screenshot:
            print(f"✅ Screenshot captured: {len(screenshot)} bytes")
        else:
            print("❌ Screenshot failed")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ UiController test failed: {e}")
        return False


def test_visual_automation_tool():
    """Test the integrated VisualAutomationTool."""
    print("\n🤖 Testing VisualAutomationTool...")
    
    try:
        tool = VisualAutomationTool()
        
        # Get system status
        status = tool.get_system_status()
        print("✅ VisualAutomationTool initialized")
        print(f"   - Visual Parser: {status['visual_parser']['status']}")
        print(f"   - UI Controller: Ready")
        print(f"   - Version: {status['version']}")
        
        # Test UI state analysis
        print("\n🔍 Testing UI state analysis...")
        ui_state = tool.get_ui_state()
        
        print(f"   - Debug: UI state keys: {list(ui_state.keys()) if isinstance(ui_state, dict) else 'Not a dict'}")
        if isinstance(ui_state, dict) and "metadata" in ui_state:
            print(f"   - Debug: Metadata keys: {list(ui_state['metadata'].keys())}")
        
        if "error" not in ui_state:
            print(f"✅ UI state analysis successful")
            print(f"   - Total elements: {ui_state.get('total_elements', 'KEY_NOT_FOUND')}")
            print(f"   - Text elements: {ui_state.get('metadata', {}).get('text_elements', 'KEY_NOT_FOUND')}")
            print(f"   - UI elements: {ui_state.get('metadata', {}).get('ui_elements', 'KEY_NOT_FOUND')}")
        else:
            print(f"❌ UI state analysis failed: {ui_state['error']}")
            return False
        
        # Test element detection
        print("\n🎯 Testing element detection...")
        clickable_elements = tool.get_clickable_elements()
        text_elements = tool.get_text_elements()
        
        print(f"✅ Element detection successful")
        print(f"   - Clickable elements: {len(clickable_elements)}")
        print(f"   - Text elements: {len(text_elements)}")
        
        return True
        
    except Exception as e:
        print(f"❌ VisualAutomationTool test failed: {e}")
        return False


def test_agent_integration():
    """Test how agents can use the visual automation tools."""
    print("\n🧠 Testing Agent Integration...")
    
    try:
        tool = VisualAutomationTool()
        
        # Simulate what an agent would do
        print("🎭 Simulating agent workflow...")
        
        # 1. Agent takes a screenshot to understand the current state
        print("   1. Taking screenshot...")
        screenshot = tool.take_screenshot()
        
        if not screenshot:
            print("   ❌ Screenshot failed")
            return False
        
        print("   ✅ Screenshot captured")
        
        # 2. Agent analyzes the UI state
        print("   2. Analyzing UI state...")
        ui_state = tool.get_ui_state()
        
        if "error" in ui_state:
            print("   ❌ UI analysis failed")
            return False
        
        print(f"   ✅ UI analysis complete: {ui_state.get('total_elements', 'KEY_NOT_FOUND')} elements found")
        
        # 3. Agent looks for specific elements
        print("   3. Searching for elements...")
        
        # Look for common UI elements
        search_terms = ["button", "input", "text", "link"]
        
        for term in search_terms:
            elements = tool.get_ui_state(term)
            if "error" not in elements and elements.get('total_elements', 0) > 0:
                print(f"   ✅ Found {elements.get('total_elements', 0)} {term} elements")
            else:
                print(f"   ⚠️  No {term} elements found")
        
        print("✅ Agent integration test successful")
        return True
        
    except Exception as e:
        print(f"❌ Agent integration test failed: {e}")
        return False


def main():
    """Run all tests."""
    print("🚀 Guild AI - Computer Vision System Test")
    print("=" * 50)
    
    tests = [
        ("Visual Parser", test_visual_parser),
        ("UI Controller", test_ui_controller),
        ("Visual Automation Tool", test_visual_automation_tool),
        ("Agent Integration", test_agent_integration)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        try:
            if test_func():
                passed += 1
                print(f"✅ {test_name} test PASSED")
            else:
                print(f"❌ {test_name} test FAILED")
        except Exception as e:
            print(f"❌ {test_name} test ERROR: {e}")
        
        print("-" * 50)
    
    # Summary
    print(f"\n📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Your computer vision system is ready!")
        print("\n🚀 Next steps:")
        print("   1. Your agents can now see and interact with any GUI!")
        print("   2. Test with real applications (browser, desktop apps)")
        print("   3. Integrate with your workflow orchestration")
        print("   4. Deploy and let your AI workforce automate everything!")
    else:
        print("⚠️  Some tests failed. Check the errors above.")
        print("\n🔧 Troubleshooting:")
        print("   1. Ensure all dependencies are installed")
        print("   2. Check if PyAutoGUI permissions are granted")
        print("   3. Verify OpenCV and EasyOCR are working")
    
    return passed == total


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
