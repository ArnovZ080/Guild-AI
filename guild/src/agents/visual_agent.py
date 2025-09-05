"""
Visual Agent for Guild AI

This agent specializes in visual tasks and can use the computer vision system
to interact with GUIs, learn from demonstrations, and automate visual workflows.
"""

import logging
from typing import Dict, Any, List, Optional
from pathlib import Path

from guild.src.core.vision import VisualAutomationTool
from guild.src.core.learning.learning_system import TangoLearningSystem

logger = logging.getLogger(__name__)

class VisualAgent:
    """
    Specialized agent for visual automation and learning.
    
    This agent can:
    - Use computer vision to interact with any GUI application
    - Learn new visual skills by watching user demonstrations
    - Execute learned visual workflows
    - Provide visual feedback and analysis
    """
    
    def __init__(self):
        """Initialize the Visual Agent with vision and learning capabilities."""
        self.agent_name = "VisualAgent"
        self.agent_type = "vision_automation"
        self.capabilities = [
            "gui_interaction",
            "visual_learning", 
            "workflow_automation",
            "screenshot_analysis",
            "ui_element_detection"
        ]
        
        # Initialize vision tools
        try:
            self.vision_tool = VisualAutomationTool()
            self.vision_available = True
            logger.info("Visual tools initialized successfully")
        except Exception as e:
            self.vision_tool = None
            self.vision_available = False
            logger.warning(f"Visual tools not available: {e}")
        
        # Initialize learning system
        try:
            # Note: We'll need to pass a workflow builder here
            # For now, we'll initialize without it
            self.learning_system = None  # Will be set when workflow builder is available
            logger.info("Learning system placeholder created")
        except Exception as e:
            self.learning_system = None
            logger.warning(f"Learning system not available: {e}")
        
        # Agent state
        self.current_task = None
        self.learned_skills = []
        self.execution_history = []
        
        logger.info(f"{self.agent_name} initialized successfully")
    
    def get_capabilities(self) -> List[str]:
        """Return list of agent capabilities."""
        return self.capabilities.copy()
    
    def can_handle_task(self, task_description: str) -> bool:
        """Check if this agent can handle a given task."""
        visual_keywords = [
            "click", "type", "automate", "gui", "interface", "screen", "button",
            "form", "website", "application", "visual", "learn", "demonstrate",
            "workflow", "automation", "ui", "user interface"
        ]
        
        task_lower = task_description.lower()
        return any(keyword in task_lower for keyword in visual_keywords)
    
    def execute_visual_task(self, task_description: str, parameters: Dict[str, Any] = None) -> Dict[str, Any]:
        """Execute a visual automation task."""
        if not self.vision_available:
            return {
                "success": False,
                "error": "Visual tools not available",
                "task": task_description
            }
        
        try:
            self.current_task = task_description
            
            # Parse the task to determine action
            action_result = self._parse_and_execute_task(task_description, parameters or {})
            
            # Record execution
            self.execution_history.append({
                "task": task_description,
                "parameters": parameters,
                "result": action_result,
                "timestamp": self._get_timestamp()
            })
            
            return {
                "success": True,
                "task": task_description,
                "result": action_result,
                "agent": self.agent_name
            }
            
        except Exception as e:
            logger.error(f"Error executing visual task: {e}")
            return {
                "success": False,
                "error": str(e),
                "task": task_description
            }
    
    def _parse_and_execute_task(self, task_description: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Parse task description and execute appropriate action."""
        task_lower = task_description.lower()
        
        if "click" in task_lower:
            return self._handle_click_task(task_description, parameters)
        elif "type" in task_lower:
            return self._handle_type_task(task_description, parameters)
        elif "screenshot" in task_lower:
            return self._handle_screenshot_task(task_description, parameters)
        elif "scroll" in task_lower:
            return self._handle_scroll_task(task_description, parameters)
        elif "learn" in task_lower or "demonstrate" in task_lower:
            return self._handle_learning_task(task_description, parameters)
        else:
            return self._handle_generic_task(task_description, parameters)
    
    def _handle_click_task(self, task_description: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Handle click-related tasks."""
        # Extract coordinates or element description
        if "coordinates" in parameters:
            x, y = parameters["coordinates"]
            result = self.vision_tool.click_element(f"element at ({x}, {y})")
            return {"action": "click", "coordinates": (x, y), "result": result}
        elif "element" in parameters:
            element_desc = parameters["element"]
            result = self.vision_tool.click_element(element_desc)
            return {"action": "click", "element": element_desc, "result": result}
        else:
            # Try to extract element description from task description
            # This is a simple heuristic - could be enhanced with NLP
            element_desc = self._extract_element_from_description(task_description)
            result = self.vision_tool.click_element(element_desc)
            return {"action": "click", "element": element_desc, "result": result}
    
    def _handle_type_task(self, task_description: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Handle text input tasks."""
        text = parameters.get("text", "")
        element = parameters.get("element", "current focus")
        
        if not text:
            # Try to extract text from task description
            text = self._extract_text_from_description(task_description)
        
        result = self.vision_tool.type_text(text, element)
        return {"action": "type", "text": text, "element": element, "result": result}
    
    def _handle_screenshot_task(self, task_description: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Handle screenshot tasks."""
        region = parameters.get("region")
        result = self.vision_tool.take_screenshot(region)
        
        return {
            "action": "screenshot",
            "region": region,
            "result": "Screenshot captured successfully"
        }
    
    def _handle_scroll_task(self, task_description: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Handle scroll tasks."""
        direction = parameters.get("direction", "down")
        amount = parameters.get("amount", 100)
        
        result = self.vision_tool.scroll(direction, amount)
        return {"action": "scroll", "direction": direction, "amount": amount, "result": result}
    
    def _handle_learning_task(self, task_description: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Handle learning and demonstration tasks."""
        if not self.learning_system:
            return {"action": "learn", "result": "Learning system not available"}
        
        session_name = parameters.get("session_name", "auto_session")
        description = parameters.get("description", task_description)
        
        try:
            # Start learning session
            session_id = self.learning_system.start_learning_session(session_name, description)
            return {
                "action": "learn",
                "result": f"Learning session started: {session_id}",
                "session_id": session_id
            }
        except Exception as e:
            return {"action": "learn", "result": f"Failed to start learning: {e}"}
    
    def _handle_generic_task(self, task_description: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Handle generic visual tasks."""
        # Try to use the vision tool's general capabilities
        try:
            # Take a screenshot to analyze the current state
            screenshot = self.vision_tool.take_screenshot()
            
            # Try to read text from the screen
            text_content = self.vision_tool.read_text("visible text on screen")
            
            return {
                "action": "analyze",
                "result": "Screen analyzed",
                "screenshot": "captured",
                "text_content": text_content[:100] + "..." if len(text_content) > 100 else text_content
            }
        except Exception as e:
            return {"action": "analyze", "result": f"Analysis failed: {e}"}
    
    def _extract_element_from_description(self, description: str) -> str:
        """Extract element description from task description."""
        # Simple heuristic - look for quoted text or common UI elements
        import re
        
        # Look for quoted text
        quoted = re.findall(r'"([^"]*)"', description)
        if quoted:
            return quoted[0]
        
        # Look for common UI elements
        ui_elements = ["button", "link", "input", "field", "menu", "tab", "icon"]
        for element in ui_elements:
            if element in description.lower():
                # Extract the context around the element
                words = description.split()
                for i, word in enumerate(words):
                    if element in word.lower():
                        # Get surrounding context
                        start = max(0, i-2)
                        end = min(len(words), i+3)
                        return " ".join(words[start:end])
        
        # Fallback to the description itself
        return description
    
    def _extract_text_from_description(self, description: str) -> str:
        """Extract text to type from task description."""
        # Look for quoted text
        import re
        quoted = re.findall(r'"([^"]*)"', description)
        if quoted:
            return quoted[0]
        
        # Look for "type X" or "enter X" patterns
        type_patterns = [
            r"type\s+([^,\s]+)",
            r"enter\s+([^,\s]+)",
            r"input\s+([^,\s]+)"
        ]
        
        for pattern in type_patterns:
            match = re.search(pattern, description, re.IGNORECASE)
            if match:
                return match.group(1)
        
        return ""
    
    def _get_timestamp(self) -> str:
        """Get current timestamp string."""
        from datetime import datetime
        return datetime.now().isoformat()
    
    def get_execution_history(self) -> List[Dict[str, Any]]:
        """Get the agent's execution history."""
        return self.execution_history.copy()
    
    def get_learned_skills(self) -> List[Dict[str, Any]]:
        """Get skills learned by this agent."""
        return self.learned_skills.copy()
    
    def set_learning_system(self, learning_system: TangoLearningSystem):
        """Set the learning system for this agent."""
        self.learning_system = learning_system
        logger.info("Learning system connected to Visual Agent")
    
    def learn_from_demonstration(self, session_name: str, description: str = "") -> str:
        """Start learning from a user demonstration."""
        if not self.learning_system:
            raise RuntimeError("Learning system not available")
        
        session_id = self.learning_system.start_learning_session(session_name, description)
        logger.info(f"Started learning session: {session_id}")
        return session_id
    
    def stop_learning(self) -> Optional[Dict[str, Any]]:
        """Stop the current learning session and process results."""
        if not self.learning_system:
            return None
        
        results = self.learning_system.stop_learning_session()
        if results:
            # Store learned skills
            if "generated_skills" in results:
                self.learned_skills.extend(results["generated_skills"])
            
            logger.info(f"Learning session completed with {len(results.get('generated_skills', []))} new skills")
        
        return results
