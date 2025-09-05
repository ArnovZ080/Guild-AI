"""
Vision Module for Guild AI

This module provides visual autonomy capabilities, enabling agents to see and interact
with graphical user interfaces (GUIs) through computer vision and UI automation.
"""

# Lazy load vision components to avoid import errors in headless environments
def _safe_import(module_name: str, class_name: str):
    """Safely import a class, returning None if import fails."""
    try:
        if module_name == "visual_parser":
            from .visual_parser import VisualParser
            return VisualParser
        elif module_name == "ui_controller":
            from .ui_controller import UiController
            return UiController
        elif module_name == "visual_automation_tool":
            from .visual_automation_tool import VisualAutomationTool
            return VisualAutomationTool
        else:
            return None
    except ImportError as e:
        print(f"Warning: Could not import {class_name} due to missing dependencies: {e}")
        return None
    except Exception as e:
        print(f"Warning: Could not import {class_name}: {e}")
        return None

# Lazy-loaded classes
class LazyVisionModule:
    """Lazy-loaded vision module that handles missing dependencies gracefully."""
    
    @property
    def VisualParser(self):
        if not hasattr(self, '_visual_parser'):
            self._visual_parser = _safe_import("visual_parser", "VisualParser")
        return self._visual_parser
    
    @property
    def UiController(self):
        if not hasattr(self, '_ui_controller'):
            self._ui_controller = _safe_import("ui_controller", "UiController")
        return self._ui_controller
    
    @property
    def VisualAutomationTool(self):
        if not hasattr(self, '_visual_automation_tool'):
            self._visual_automation_tool = _safe_import("visual_automation_tool", "VisualAutomationTool")
        return self._visual_automation_tool

# Create a single instance for lazy loading
_vision_module = LazyVisionModule()

# Export the lazy-loaded classes
VisualParser = _vision_module.VisualParser
UiController = _vision_module.UiController
VisualAutomationTool = _vision_module.VisualAutomationTool

__all__ = ["VisualParser", "UiController", "VisualAutomationTool"]
