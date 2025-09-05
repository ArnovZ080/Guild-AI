"""
Visual Automation Tool

This module integrates VisualParser and UiController to provide high-level
visual automation capabilities for AI agents.
"""

import time
import logging
from typing import Dict, List, Any, Optional, Tuple

logger = logging.getLogger(__name__)


class VisualAutomationTool:
    """
    High-level tool that combines computer vision with UI automation.
    Allows agents to see, understand, and interact with any GUI application.
    """
    
    def __init__(self):
        """Initialize the Visual Automation Tool."""
        try:
            from .visual_parser import VisualParser
            from .ui_controller import UiController
            
            self.visual_parser = VisualParser()
            self.ui_controller = UiController()
            self.vision_available = True
            logger.info("VisualAutomationTool initialized successfully with full vision capabilities")
        except ImportError as e:
            logger.warning(f"Vision components not available: {e}")
            self.visual_parser = None
            self.ui_controller = None
            self.vision_available = False
        except Exception as e:
            logger.error(f"Failed to initialize vision components: {e}")
            self.visual_parser = None
            self.ui_controller = None
            self.vision_available = False
    
    def click_element(self, description: str, confidence_threshold: float = 0.6) -> bool:
        """
        Find and click on an element by description.
        
        Args:
            description: Natural language description of the element
            confidence_threshold: Minimum confidence required
            
        Returns:
            True if successful
        """
        if not self.vision_available:
            logger.error("Vision components not available - cannot perform click operation")
            return False
            
        try:
            # Take screenshot and analyze
            screenshot = self.ui_controller.take_screenshot()
            if not screenshot:
                logger.error("Failed to take screenshot")
                return False
            
            # Parse the screenshot
            parsed_data = self.visual_parser.parse_screenshot(screenshot)
            if "error" in parsed_data:
                logger.error(f"Failed to parse screenshot: {parsed_data['error']}")
                return False
            
            # Find the element
            element = self.visual_parser.find_element_by_description(
                parsed_data["elements"], description
            )
            
            if not element:
                logger.warning(f"Element not found: {description}")
                return False
            
            # Check confidence
            if element.get("confidence", 0) < confidence_threshold:
                logger.warning(f"Element confidence too low: {element.get('confidence')}")
                return False
            
            # Click the element
            success = self.ui_controller.click_element(element)
            if success:
                logger.info(f"Successfully clicked element: {description}")
            else:
                logger.error(f"Failed to click element: {description}")
            
            return success
            
        except Exception as e:
            logger.error(f"Error in click_element: {e}")
            return False
    
    def type_text(self, description: str, text: str, confidence_threshold: float = 0.6) -> bool:
        """
        Find an input field and type text into it.
        
        Args:
            description: Description of the input field
            text: Text to type
            confidence_threshold: Minimum confidence required
            
        Returns:
            True if successful
        """
        if not self.vision_available:
            logger.error("Vision components not available - cannot perform type_text operation")
            return False
            
        try:
            # Take screenshot and analyze
            screenshot = self.ui_controller.take_screenshot()
            if not screenshot:
                return False
            
            # Parse the screenshot
            parsed_data = self.visual_parser.parse_screenshot(screenshot)
            if "error" in parsed_data:
                return False
            
            # Find the input field
            element = self.visual_parser.find_element_by_description(
                parsed_data["elements"], description
            )
            
            if not element or element.get("type") != "input_field":
                logger.warning(f"Input field not found: {description}")
                return False
            
            # Check confidence
            if element.get("confidence", 0) < confidence_threshold:
                return False
            
            # Get coordinates and type text
            position = element.get("position", {})
            x = position.get("x", 0) + (position.get("width", 0) // 2)
            y = position.get("y", 0) + (position.get("height", 0) // 2)
            
            success = self.ui_controller.type_text_at(x, y, text)
            if success:
                logger.info(f"Successfully typed text in: {description}")
            else:
                logger.error(f"Failed to type text in: {description}")
            
            return success
            
        except Exception as e:
            logger.error(f"Error in type_text: {e}")
            return False
    
    def read_text(self, description: str = None, region: Optional[Tuple[int, int, int, int]] = None) -> Optional[str]:
        """
        Read text from the screen or a specific region.
        
        Args:
            description: Description of text to look for (optional)
            region: Specific region to read (left, top, width, height)
            
        Returns:
            Extracted text or None if failed
        """
        if not self.vision_available:
            logger.error("Vision components not available - cannot perform read_text operation")
            return None
            
        try:
            # Take screenshot
            screenshot = self.ui_controller.take_screenshot(region)
            if not screenshot:
                return None
            
            # Parse the screenshot
            parsed_data = self.visual_parser.parse_screenshot(screenshot)
            if "error" in parsed_data:
                return None
            
            if description:
                # Find specific text element
                element = self.visual_parser.find_element_by_description(
                    parsed_data["elements"], description
                )
                
                if element and element.get("type") == "text":
                    return element.get("attributes", {}).get("text", "")
                else:
                    return None
            else:
                # Extract all text
                text_elements = [
                    elem.get("attributes", {}).get("text", "")
                    for elem in parsed_data["elements"]
                    if elem.get("type") == "text"
                ]
                
                return " ".join(text_elements) if text_elements else None
            
        except Exception as e:
            logger.error(f"Error in read_text: {e}")
            return None
    
    def take_screenshot(self, region: Optional[Tuple[int, int, int, int]] = None) -> bytes:
        """
        Take a screenshot of the screen or a region.
        
        Args:
            region: Optional region (left, top, width, height)
            
        Returns:
            Screenshot as bytes
        """
        if not self.vision_available:
            logger.error("Vision components not available - cannot perform take_screenshot operation")
            return b""
            
        return self.ui_controller.take_screenshot(region)
    
    def scroll(self, direction: str = "down", amount: int = 3) -> bool:
        """
        Scroll the screen in the specified direction.
        
        Args:
            direction: "up", "down", "left", "right"
            amount: Number of scroll units
            
        Returns:
            True if successful
        """
        if not self.vision_available:
            logger.error("Vision components not available - cannot perform scroll operation")
            return False
            
        try:
            clicks = amount if direction in ["up", "left"] else -amount
            
            if direction in ["up", "down"]:
                success = self.ui_controller.scroll(clicks)
            else:
                # Horizontal scrolling (if supported)
                success = self.ui_controller.scroll(clicks)
            
            if success:
                logger.info(f"Successfully scrolled {direction}")
            else:
                logger.error(f"Failed to scroll {direction}")
            
            return success
            
        except Exception as e:
            logger.error(f"Error in scroll: {e}")
            return False
    
    def get_ui_state(self, description: str = None) -> Dict[str, Any]:
        """
        Get the current state of the UI.
        
        Args:
            description: Optional description to filter elements
            
        Returns:
            Dictionary describing the current UI state
        """
        if not self.vision_available:
            return {"error": "Vision components not available"}
            
        try:
            # Take screenshot and analyze
            screenshot = self.ui_controller.take_screenshot()
            if not screenshot:
                return {"error": "Failed to take screenshot"}
            
            # Parse the screenshot
            parsed_data = self.visual_parser.parse_screenshot(screenshot)
            if "error" in parsed_data:
                return parsed_data
            
            # Ensure we have the required structure
            if "metadata" not in parsed_data:
                parsed_data["metadata"] = {}
            
            if "total_elements" not in parsed_data["metadata"]:
                parsed_data["metadata"]["total_elements"] = len(parsed_data.get("elements", []))
            
            # Filter elements if description provided
            if description:
                filtered_elements = []
                for element in parsed_data["elements"]:
                    if self.visual_parser.find_element_by_description([element], description):
                        filtered_elements.append(element)
                
                parsed_data["elements"] = filtered_elements
                parsed_data["metadata"]["total_elements"] = len(filtered_elements)
            
            # Add UI controller state
            parsed_data["ui_controller"] = self.ui_controller.get_screen_info()
            
            return parsed_data
            
        except Exception as e:
            logger.error(f"Error in get_ui_state: {e}")
            return {"error": str(e)}
    
    def wait_for_element(self, description: str, timeout: float = 10.0, 
                        check_interval: float = 0.5) -> Optional[Dict[str, Any]]:
        """
        Wait for an element to appear on screen.
        
        Args:
            description: Description of the element to wait for
            timeout: Maximum time to wait (seconds)
            check_interval: Time between checks (seconds)
            
        Returns:
            Element data if found, None if timeout
        """
        if not self.vision_available:
            logger.error("Vision components not available - cannot perform wait_for_element operation")
            return None
            
        start_time = time.time()
        
        while time.time() - start_time < timeout:
            # Get UI state
            ui_state = self.get_ui_state()
            
            if "error" not in ui_state:
                # Look for the element
                element = self.visual_parser.find_element_by_description(
                    ui_state["elements"], description
                )
                
                if element:
                    logger.info(f"Element found after {time.time() - start_time:.1f}s: {description}")
                    return element
            
            # Wait before next check
            time.sleep(check_interval)
        
        logger.warning(f"Timeout waiting for element: {description}")
        return None
    
    def find_and_click(self, description: str, max_attempts: int = 3, 
                       confidence_threshold: float = 0.6) -> bool:
        """
        Find and click an element with retry logic.
        
        Args:
            description: Description of the element
            max_attempts: Maximum number of attempts
            confidence_threshold: Minimum confidence required
            
        Returns:
            True if successful
        """
        if not self.vision_available:
            logger.error("Vision components not available - cannot perform find_and_click operation")
            return False
            
        for attempt in range(max_attempts):
            logger.info(f"Attempt {attempt + 1}/{max_attempts} to find and click: {description}")
            
            if self.click_element(description, confidence_threshold):
                return True
            
            # Wait before retry
            if attempt < max_attempts - 1:
                time.sleep(1.0)
        
        logger.error(f"Failed to find and click element after {max_attempts} attempts: {description}")
        return False
    
    def get_element_info(self, description: str) -> Optional[Dict[str, Any]]:
        """
        Get detailed information about a specific element.
        
        Args:
            description: Description of the element
            
        Returns:
            Element information or None if not found
        """
        if not self.vision_available:
            logger.error("Vision components not available - cannot perform get_element_info operation")
            return None
            
        try:
            ui_state = self.get_ui_state()
            if "error" in ui_state:
                return None
            
            element = self.visual_parser.find_element_by_description(
                ui_state["elements"], description
            )
            
            if element:
                # Add additional context
                element["screen_info"] = self.ui_controller.get_screen_info()
                element["timestamp"] = time.time()
                
                return element
            
            return None
            
        except Exception as e:
            logger.error(f"Error in get_element_info: {e}")
            return None
    
    def validate_element_visibility(self, description: str) -> bool:
        """
        Check if an element is currently visible on screen.
        
        Args:
            description: Description of the element
            
        Returns:
            True if element is visible
        """
        if not self.vision_available:
            logger.error("Vision components not available - cannot perform validate_element_visibility operation")
            return False
            
        element = self.get_element_info(description)
        return element is not None and element.get("attributes", {}).get("visible", True)
    
    def get_clickable_elements(self) -> List[Dict[str, Any]]:
        """
        Get all clickable elements currently on screen.
        
        Returns:
            List of clickable elements
        """
        if not self.vision_available:
            logger.error("Vision components not available - cannot perform get_clickable_elements operation")
            return []
            
        try:
            ui_state = self.get_ui_state()
            if "error" in ui_state:
                return []
            
            clickable_elements = [
                elem for elem in ui_state["elements"]
                if self.visual_parser.is_element_clickable(elem)
            ]
            
            return clickable_elements
            
        except Exception as e:
            logger.error(f"Error in get_clickable_elements: {e}")
            return []
    
    def get_text_elements(self) -> List[Dict[str, Any]]:
        """
        Get all text elements currently on screen.
        
        Returns:
            List of text elements
        """
        if not self.vision_available:
            logger.error("Vision components not available - cannot perform get_text_elements operation")
            return []
            
        try:
            ui_state = self.get_ui_state()
            if "error" in ui_state:
                return []
            
            text_elements = [
                elem for elem in ui_state["elements"]
                if elem.get("type") == "text"
            ]
            
            return text_elements
            
        except Exception as e:
            logger.error(f"Error in get_text_elements: {e}")
            return []
    
    def get_system_status(self) -> Dict[str, Any]:
        """
        Get the overall status of the visual automation system.
        
        Returns:
            Dictionary with system status information
        """
        if not self.vision_available:
            return {"error": "Vision components not available"}
            
        return {
            "visual_parser": {
                "initialized": self.visual_parser.initialized if self.visual_parser else False,
                "status": "ready" if self.visual_parser and self.visual_parser.initialized else "not_initialized"
            },
            "ui_controller": self.ui_controller.get_screen_info() if self.ui_controller else {"error": "UiController not initialized"},
            "timestamp": time.time(),
            "version": "1.0.0"
        }
