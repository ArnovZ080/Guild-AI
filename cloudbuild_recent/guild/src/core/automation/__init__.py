"""
Automation Module for Guild-AI

This module provides comprehensive automation capabilities including
visual automation (PyAutoGUI, OpenCV) and web automation (Selenium).
"""

from .selenium_automation import SeleniumAutomation, get_selenium_automation

# Import existing visual automation
try:
    from ..vision.visual_automation_tool import VisualAutomationTool
    VISUAL_AUTOMATION_AVAILABLE = True
except ImportError:
    VisualAutomationTool = None
    VISUAL_AUTOMATION_AVAILABLE = False

__all__ = [
    'SeleniumAutomation',
    'get_selenium_automation',
    'VisualAutomationTool',
    'VISUAL_AUTOMATION_AVAILABLE'
]
