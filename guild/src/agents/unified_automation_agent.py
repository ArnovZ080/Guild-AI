"""
Unified Automation Agent for Guild-AI

This agent combines visual automation (PyAutoGUI, OpenCV) and web automation (Selenium)
to provide comprehensive automation capabilities for any application or website.
"""

import logging
from typing import Dict, Any, List, Optional, Union
from pathlib import Path
import tempfile
import json

# Import automation modules
try:
    from guild.src.core.automation import SeleniumAutomation, VisualAutomationTool, VISUAL_AUTOMATION_AVAILABLE
    from guild.src.core.automation.selenium_automation import SELENIUM_AVAILABLE
    AUTOMATION_AVAILABLE = True
except ImportError:
    AUTOMATION_AVAILABLE = False
    print("Warning: Automation modules not available")

logger = logging.getLogger(__name__)

class UnifiedAutomationAgent:
    """
    Unified automation agent that combines visual and web automation.
    """
    
    def __init__(self):
        """
        Initialize the unified automation agent.
        """
        if not AUTOMATION_AVAILABLE:
            raise ImportError("Automation modules are required. Install required dependencies.")
        
        self.selenium_automation = None
        self.visual_automation = None
        
        # Initialize available automation tools
        if SELENIUM_AVAILABLE:
            try:
                self.selenium_automation = SeleniumAutomation()
                logger.info("Selenium automation initialized")
            except Exception as e:
                logger.warning(f"Failed to initialize Selenium: {e}")
        
        if VISUAL_AUTOMATION_AVAILABLE:
            try:
                self.visual_automation = VisualAutomationTool()
                logger.info("Visual automation initialized")
            except Exception as e:
                logger.warning(f"Failed to initialize visual automation: {e}")
        
        if not self.selenium_automation and not self.visual_automation:
            raise RuntimeError("No automation tools available")
        
        logger.info("Unified Automation Agent initialized")
    
    def automate_web_task(self, 
                         task_description: str,
                         url: Optional[str] = None,
                         actions: List[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Automate a web-based task using Selenium.
        
        Args:
            task_description: Description of the task to perform
            url: URL to navigate to (optional)
            actions: List of actions to perform
            
        Returns:
            Task execution result
        """
        if not self.selenium_automation:
            return {
                'status': 'error',
                'error': 'Selenium automation not available'
            }
        
        try:
            logger.info(f"Automating web task: {task_description}")
            
            results = []
            
            # Navigate to URL if provided
            if url:
                nav_result = self.selenium_automation.navigate_to(url)
                results.append(nav_result)
                
                if nav_result['status'] != 'success':
                    return {
                        'status': 'error',
                        'error': f"Failed to navigate to {url}",
                        'results': results
                    }
            
            # Execute actions
            if actions:
                for i, action in enumerate(actions):
                    action_result = self._execute_web_action(action)
                    action_result['action_index'] = i
                    results.append(action_result)
            
            # Take final screenshot
            screenshot_result = self.selenium_automation.take_screenshot()
            results.append(screenshot_result)
            
            return {
                'status': 'success',
                'task_description': task_description,
                'actions_executed': len(actions) if actions else 0,
                'results': results,
                'screenshot': screenshot_result.get('screenshot_path')
            }
            
        except Exception as e:
            logger.error(f"Error automating web task: {e}")
            return {
                'status': 'error',
                'error': str(e),
                'task_description': task_description
            }
    
    def automate_visual_task(self, 
                           task_description: str,
                           actions: List[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Automate a visual task using PyAutoGUI and computer vision.
        
        Args:
            task_description: Description of the task to perform
            actions: List of visual actions to perform
            
        Returns:
            Task execution result
        """
        if not self.visual_automation:
            return {
                'status': 'error',
                'error': 'Visual automation not available'
            }
        
        try:
            logger.info(f"Automating visual task: {task_description}")
            
            results = []
            
            # Execute visual actions
            if actions:
                for i, action in enumerate(actions):
                    action_result = self._execute_visual_action(action)
                    action_result['action_index'] = i
                    results.append(action_result)
            
            return {
                'status': 'success',
                'task_description': task_description,
                'actions_executed': len(actions) if actions else 0,
                'results': results
            }
            
        except Exception as e:
            logger.error(f"Error automating visual task: {e}")
            return {
                'status': 'error',
                'error': str(e),
                'task_description': task_description
            }
    
    def _execute_web_action(self, action: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a single web action."""
        action_type = action.get('type', '').lower()
        
        try:
            if action_type == 'click':
                return self.selenium_automation.click_element(
                    action['locator'],
                    action.get('by', 'css_selector'),
                    action.get('timeout', 10)
                )
            
            elif action_type == 'type':
                return self.selenium_automation.type_text(
                    action['locator'],
                    action['text'],
                    action.get('by', 'css_selector'),
                    action.get('clear_first', True),
                    action.get('timeout', 10)
                )
            
            elif action_type == 'wait':
                return self.selenium_automation.wait_for_element(
                    action['locator'],
                    action.get('by', 'css_selector'),
                    action.get('timeout', 10),
                    action.get('condition', 'presence')
                )
            
            elif action_type == 'extract':
                return self.selenium_automation.extract_data(
                    action['selectors'],
                    action.get('wait_for_element')
                )
            
            elif action_type == 'fill_form':
                return self.selenium_automation.fill_form(
                    action['form_data'],
                    action.get('submit_button')
                )
            
            elif action_type == 'javascript':
                return self.selenium_automation.execute_javascript(
                    action['script']
                )
            
            else:
                return {
                    'status': 'error',
                    'error': f"Unknown web action type: {action_type}"
                }
                
        except Exception as e:
            return {
                'status': 'error',
                'error': str(e),
                'action_type': action_type
            }
    
    def _execute_visual_action(self, action: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a single visual action."""
        action_type = action.get('type', '').lower()
        
        try:
            if action_type == 'click':
                return {
                    'status': 'success' if self.visual_automation.click_element(
                        action['description'],
                        action.get('confidence_threshold', 0.6)
                    ) else 'error',
                    'action_type': 'click',
                    'description': action['description']
                }
            
            elif action_type == 'type':
                return {
                    'status': 'success' if self.visual_automation.type_text(
                        action['description'],
                        action['text'],
                        action.get('confidence_threshold', 0.6)
                    ) else 'error',
                    'action_type': 'type',
                    'description': action['description'],
                    'text': action['text']
                }
            
            else:
                return {
                    'status': 'error',
                    'error': f"Unknown visual action type: {action_type}"
                }
                
        except Exception as e:
            return {
                'status': 'error',
                'error': str(e),
                'action_type': action_type
            }
    
    def create_automation_script(self, 
                               task_description: str,
                               platform: str = "web",
                               record_actions: bool = False) -> Dict[str, Any]:
        """
        Create an automation script for a task.
        
        Args:
            task_description: Description of the task
            platform: Platform (web, desktop, mobile)
            record_actions: Whether to record user actions
            
        Returns:
            Automation script
        """
        try:
            logger.info(f"Creating automation script for: {task_description}")
            
            # This would typically involve LLM analysis of the task
            # For now, we'll create a template script
            
            if platform == "web":
                script = self._create_web_script_template(task_description)
            else:
                script = self._create_visual_script_template(task_description)
            
            return {
                'status': 'success',
                'script': script,
                'platform': platform,
                'task_description': task_description
            }
            
        except Exception as e:
            logger.error(f"Error creating automation script: {e}")
            return {
                'status': 'error',
                'error': str(e),
                'task_description': task_description
            }
    
    def _create_web_script_template(self, task_description: str) -> Dict[str, Any]:
        """Create a web automation script template."""
        return {
            'platform': 'web',
            'description': task_description,
            'actions': [
                {
                    'type': 'navigate',
                    'url': 'https://example.com',
                    'description': 'Navigate to target website'
                },
                {
                    'type': 'wait',
                    'locator': 'body',
                    'condition': 'presence',
                    'description': 'Wait for page to load'
                },
                {
                    'type': 'click',
                    'locator': '.example-button',
                    'description': 'Click example button'
                },
                {
                    'type': 'type',
                    'locator': 'input[name="example"]',
                    'text': 'Example text',
                    'description': 'Type example text'
                }
            ]
        }
    
    def _create_visual_script_template(self, task_description: str) -> Dict[str, Any]:
        """Create a visual automation script template."""
        return {
            'platform': 'desktop',
            'description': task_description,
            'actions': [
                {
                    'type': 'click',
                    'description': 'Click on example button',
                    'confidence_threshold': 0.7
                },
                {
                    'type': 'type',
                    'description': 'Type in example field',
                    'text': 'Example text',
                    'confidence_threshold': 0.7
                }
            ]
        }
    
    def test_automation_script(self, script: Dict[str, Any]) -> Dict[str, Any]:
        """
        Test an automation script.
        
        Args:
            script: Automation script to test
            
        Returns:
            Test results
        """
        try:
            logger.info("Testing automation script")
            
            platform = script.get('platform', 'web')
            actions = script.get('actions', [])
            
            if platform == 'web':
                return self.automate_web_task(
                    script.get('description', 'Test task'),
                    actions=actions
                )
            else:
                return self.automate_visual_task(
                    script.get('description', 'Test task'),
                    actions=actions
                )
                
        except Exception as e:
            logger.error(f"Error testing automation script: {e}")
            return {
                'status': 'error',
                'error': str(e)
            }
    
    def get_automation_capabilities(self) -> Dict[str, Any]:
        """Get information about available automation capabilities."""
        return {
            'selenium_available': self.selenium_automation is not None,
            'visual_automation_available': self.visual_automation is not None,
            'supported_platforms': ['web', 'desktop'],
            'supported_actions': {
                'web': ['click', 'type', 'wait', 'extract', 'fill_form', 'javascript'],
                'desktop': ['click', 'type', 'screenshot', 'ocr']
            }
        }
    
    def cleanup(self):
        """Cleanup automation resources."""
        if self.selenium_automation:
            self.selenium_automation.close()
        
        logger.info("Unified automation agent cleaned up")

# Convenience function
def get_unified_automation_agent() -> UnifiedAutomationAgent:
    """Get an instance of the Unified Automation Agent."""
    return UnifiedAutomationAgent()
