"""
Visual Automation Tool for Agent Integration

This tool combines VisualParser and UiController to provide high-level visual automation
capabilities that agents can use through the Orchestrator.
"""

import logging
from typing import Dict, Any, Optional
from .visual_parser import VisualParser
from .ui_controller import UiController

logger = logging.getLogger(__name__)


class VisualAutomationTool:
    """
    The bridge between agents and visual automation capabilities.
    This tool combines vision and control to perform meaningful actions on any GUI.
    """
    
    def __init__(self):
        """Initialize the VisualAutomationTool with parser and controller."""
        self.visual_parser = VisualParser()
        self.ui_controller = UiController()
        logger.info("VisualAutomationTool initialized")
    
    def click_element(self, element_description: str) -> str:
        """
        Locates a UI element based on a natural language description and clicks it.
        
        Args:
            element_description: Natural language description of the element to click
            
        Returns:
            String describing the action result
            
        Example: "Click the 'Login' button."
        """
        try:
            logger.info(f"Attempting to click element: {element_description}")
            
            # Take a screenshot to analyze the current UI
            screenshot_result = self.ui_controller.take_screenshot()
            if screenshot_result.get("result") == "error":
                return f"Failed to take screenshot: {screenshot_result.get('error')}"
            
            # Parse the screenshot to find UI elements
            image_data = screenshot_result.get("image_data")
            if not image_data:
                return "Failed to capture screenshot data"
            
            parsed_ui = self.visual_parser.parse_screenshot(image_data)
            if "error" in parsed_ui:
                return f"Failed to parse UI: {parsed_ui['error']}"
            
            # Find the element based on description
            target_element = self.visual_parser.find_element_by_description(
                parsed_ui["elements"], 
                element_description
            )
            
            if not target_element:
                return f"Could not find element matching description: {element_description}"
            
            # Check if element is clickable
            if not self.visual_parser.is_element_clickable(target_element):
                return f"Element '{element_description}' is not clickable"
            
            # Get coordinates and click
            coordinates = self.visual_parser.get_element_coordinates(target_element)
            click_result = self.ui_controller.click(coordinates["x"], coordinates["y"])
            
            if click_result.get("result") == "success":
                return f"Successfully clicked {element_description} at ({coordinates['x']}, {coordinates['y']})"
            else:
                return f"Click action failed: {click_result.get('error', 'Unknown error')}"
                
        except Exception as e:
            error_msg = f"Error in click_element: {str(e)}"
            logger.error(error_msg)
            return error_msg
    
    def type_text(self, text: str, element_description: str) -> str:
        """
        Types the given text into a specified UI element.
        
        Args:
            text: Text to type
            element_description: Natural language description of the target element
            
        Returns:
            String describing the action result
            
        Example: "Type 'hello@world.com' into the 'email address' field."
        """
        try:
            logger.info(f"Attempting to type '{text}' into element: {element_description}")
            
            # Take a screenshot to analyze the current UI
            screenshot_result = self.ui_controller.take_screenshot()
            if screenshot_result.get("result") == "error":
                return f"Failed to take screenshot: {screenshot_result.get('error')}"
            
            # Parse the screenshot to find UI elements
            image_data = screenshot_result.get("image_data")
            if not image_data:
                return "Failed to capture screenshot data"
            
            parsed_ui = self.visual_parser.parse_screenshot(image_data)
            if "error" in parsed_ui:
                return f"Failed to parse UI: {parsed_ui['error']}"
            
            # Find the input element based on description
            target_element = self.visual_parser.find_element_by_description(
                parsed_ui["elements"], 
                element_description
            )
            
            if not target_element:
                return f"Could not find input element matching description: {element_description}"
            
            # Check if element is an input field
            if target_element.get("type") != "input_field":
                return f"Element '{element_description}' is not an input field"
            
            # Get coordinates and click to focus, then type
            coordinates = self.visual_parser.get_element_coordinates(target_element)
            
            # Click to focus the input field
            click_result = self.ui_controller.click(coordinates["x"], coordinates["y"])
            if click_result.get("result") != "success":
                return f"Failed to focus input field: {click_result.get('error', 'Unknown error')}"
            
            # Type the text
            type_result = self.ui_controller.type_text(text)
            if type_result.get("result") == "success":
                return f"Successfully typed '{text}' into {element_description}"
            else:
                return f"Type action failed: {type_result.get('error', 'Unknown error')}"
                
        except Exception as e:
            error_msg = f"Error in type_text: {str(e)}"
            logger.error(error_msg)
            return error_msg
    
    def read_text(self, area_description: str) -> str:
        """
        Reads and returns the text from a described area of the screen.
        
        Args:
            area_description: Natural language description of the area to read
            
        Returns:
            String containing the extracted text
            
        Example: "Read the text in the error message pop-up."
        """
        try:
            logger.info(f"Attempting to read text from area: {area_description}")
            
            # Take a screenshot to analyze the current UI
            screenshot_result = self.ui_controller.take_screenshot()
            if screenshot_result.get("result") == "error":
                return f"Failed to take screenshot: {screenshot_result.get('error')}"
            
            # Parse the screenshot to find UI elements
            image_data = screenshot_result.get("image_data")
            if not image_data:
                return "Failed to capture screenshot data"
            
            parsed_ui = self.visual_parser.parse_screenshot(image_data)
            if "error" in parsed_ui:
                return f"Failed to parse UI: {parsed_ui['error']}"
            
            # Find the area based on description
            target_element = self.visual_parser.find_element_by_description(
                parsed_ui["elements"], 
                area_description
            )
            
            if not target_element:
                return f"Could not find area matching description: {area_description}"
            
            # Extract text from the element
            element_text = target_element.get("attributes", {}).get("text", "")
            if element_text:
                return f"Text from {area_description}: {element_text}"
            else:
                return f"No text found in {area_description}"
                
        except Exception as e:
            error_msg = f"Error in read_text: {str(e)}"
            logger.error(error_msg)
            return error_msg
    
    def take_screenshot(self, output_path: str = None) -> str:
        """
        Takes a screenshot of the entire screen and saves it to a file.
        
        Args:
            output_path: Path to save the screenshot (optional)
            
        Returns:
            String describing the action result
            
        Example: "Take a screenshot and save it to 'debug_screenshot.png'."
        """
        try:
            logger.info(f"Taking screenshot, output_path: {output_path}")
            
            screenshot_result = self.ui_controller.take_screenshot(output_path)
            if screenshot_result.get("result") == "success":
                if output_path:
                    return f"Screenshot successfully saved to {output_path}"
                else:
                    return "Screenshot captured successfully (in memory)"
            else:
                return f"Screenshot failed: {screenshot_result.get('error', 'Unknown error')}"
                
        except Exception as e:
            error_msg = f"Error in take_screenshot: {str(e)}"
            logger.error(error_msg)
            return error_msg
    
    def scroll(self, direction: str, amount: int) -> str:
        """
        Scrolls the screen in a given direction.
        
        Args:
            direction: Direction to scroll ("up", "down", "left", "right")
            amount: Number of pixels to scroll
            
        Returns:
            String describing the action result
            
        Example: "Scroll down by 500 pixels."
        """
        try:
            logger.info(f"Scrolling {direction} by {amount} pixels")
            
            scroll_result = self.ui_controller.scroll(amount, direction)
            if scroll_result.get("result") == "success":
                return f"Successfully scrolled {direction} by {amount} pixels"
            else:
                return f"Scroll failed: {scroll_result.get('error', 'Unknown error')}"
                
        except Exception as e:
            error_msg = f"Error in scroll: {str(e)}"
            logger.error(error_msg)
            return error_msg
    
    def get_ui_state(self) -> Dict[str, Any]:
        """
        Get the current state of the UI by taking a screenshot and parsing it.
        
        Returns:
            Dictionary containing the current UI state
        """
        try:
            logger.info("Getting current UI state")
            
            # Take a screenshot
            screenshot_result = self.ui_controller.take_screenshot()
            if screenshot_result.get("result") == "error":
                return {"error": f"Failed to take screenshot: {screenshot_result.get('error')}"}
            
            # Parse the screenshot
            image_data = screenshot_result.get("image_data")
            if not image_data:
                return {"error": "Failed to capture screenshot data"}
            
            parsed_ui = self.visual_parser.parse_screenshot(image_data)
            if "error" in parsed_ui:
                return {"error": f"Failed to parse UI: {parsed_ui['error']}"}
            
            # Add mouse position
            mouse_result = self.ui_controller.get_mouse_position()
            
            return {
                "ui_elements": parsed_ui["elements"],
                "metadata": parsed_ui["metadata"],
                "mouse_position": mouse_result.get("coordinates", {"x": 0, "y": 0}),
                "timestamp": screenshot_result.get("timestamp")
            }
            
        except Exception as e:
            error_msg = f"Error in get_ui_state: {str(e)}"
            logger.error(error_msg)
            return {"error": error_msg}
