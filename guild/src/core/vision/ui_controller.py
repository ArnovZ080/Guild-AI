"""
UI Controller for Low-Level GUI Automation

This module provides low-level control over the mouse and keyboard, allowing for
actions like clicking, typing, and scrolling using PyAutoGUI.
"""

import time
from typing import Dict, Tuple, Optional, Any
import logging

# TODO: Add PyAutoGUI to dependencies
try:
    import pyautogui
    PYAUTOGUI_AVAILABLE = True
except ImportError:
    PYAUTOGUI_AVAILABLE = False
    logging.warning("PyAutoGUI not available. UI control will be simulated.")

logger = logging.getLogger(__name__)


class UiController:
    """
    A component that provides low-level control over the mouse and keyboard,
    allowing for actions like clicking, typing, and scrolling.
    """
    
    def __init__(self, safety_delay: float = 0.1):
        """
        Initialize the UI Controller.
        
        Args:
            safety_delay: Delay between actions for safety
        """
        self.safety_delay = safety_delay
        
        if PYAUTOGUI_AVAILABLE:
            # Configure PyAutoGUI safety settings
            pyautogui.FAILSAFE = True  # Move mouse to corner to abort
            pyautogui.PAUSE = safety_delay
            logger.info("PyAutoGUI initialized with safety settings")
        else:
            logger.warning("PyAutoGUI not available - UI control will be simulated")
    
    def click(self, x: int, y: int, button: str = "left") -> Dict[str, Any]:
        """
        Click at the specified coordinates.
        
        Args:
            x: X coordinate
            y: Y coordinate
            button: Mouse button ("left", "right", "middle")
            
        Returns:
            Dictionary with action result
        """
        try:
            if PYAUTOGUI_AVAILABLE:
                pyautogui.click(x, y, button=button)
                action_result = "success"
            else:
                # Simulate click for testing
                action_result = "simulated"
            
            logger.info(f"Clicked at ({x}, {y}) with {button} button")
            
            return {
                "action": "click",
                "coordinates": {"x": x, "y": y},
                "button": button,
                "result": action_result,
                "timestamp": time.time()
            }
            
        except Exception as e:
            logger.error(f"Click failed at ({x}, {y}): {str(e)}")
            return {
                "action": "click",
                "coordinates": {"x": x, "y": y},
                "button": button,
                "result": "error",
                "error": str(e),
                "timestamp": time.time()
            }
    
    def type_text(self, text: str, interval: float = 0.01) -> Dict[str, Any]:
        """
        Type the given text.
        
        Args:
            text: Text to type
            interval: Delay between keystrokes
            
        Returns:
            Dictionary with action result
        """
        try:
            if PYAUTOGUI_AVAILABLE:
                pyautogui.typewrite(text, interval=interval)
                action_result = "success"
            else:
                # Simulate typing for testing
                action_result = "simulated"
            
            logger.info(f"Typed text: {text[:50]}{'...' if len(text) > 50 else ''}")
            
            return {
                "action": "type_text",
                "text": text,
                "interval": interval,
                "result": action_result,
                "timestamp": time.time()
            }
            
        except Exception as e:
            logger.error(f"Type text failed: {str(e)}")
            return {
                "action": "type_text",
                "text": text,
                "interval": interval,
                "result": "error",
                "error": str(e),
                "timestamp": time.time()
            }
    
    def move_to(self, x: int, y: int, duration: float = 0.5) -> Dict[str, Any]:
        """
        Move mouse to the specified coordinates.
        
        Args:
            x: X coordinate
            y: Y coordinate
            duration: Time to take for the movement
            
        Returns:
            Dictionary with action result
        """
        try:
            if PYAUTOGUI_AVAILABLE:
                pyautogui.moveTo(x, y, duration=duration)
                action_result = "success"
            else:
                # Simulate movement for testing
                action_result = "simulated"
            
            logger.info(f"Moved mouse to ({x}, {y})")
            
            return {
                "action": "move_to",
                "coordinates": {"x": x, "y": y},
                "duration": duration,
                "result": action_result,
                "timestamp": time.time()
            }
            
        except Exception as e:
            logger.error(f"Move to failed: {str(e)}")
            return {
                "action": "move_to",
                "coordinates": {"x": x, "y": y},
                "duration": duration,
                "result": "error",
                "error": str(e),
                "timestamp": time.time()
            }
    
    def scroll(self, amount: int, direction: str = "down") -> Dict[str, Any]:
        """
        Scroll the screen in the specified direction.
        
        Args:
            amount: Number of scroll units
            direction: Scroll direction ("up", "down", "left", "right")
            
        Returns:
            Dictionary with action result
        """
        try:
            if PYAUTOGUI_AVAILABLE:
                if direction == "up":
                    pyautogui.scroll(amount)
                elif direction == "down":
                    pyautogui.scroll(-amount)
                elif direction == "left":
                    pyautogui.hscroll(-amount)
                elif direction == "right":
                    pyautogui.hscroll(amount)
                action_result = "success"
            else:
                # Simulate scrolling for testing
                action_result = "simulated"
            
            logger.info(f"Scrolled {direction} by {amount} units")
            
            return {
                "action": "scroll",
                "amount": amount,
                "direction": direction,
                "result": action_result,
                "timestamp": time.time()
            }
            
        except Exception as e:
            logger.error(f"Scroll failed: {str(e)}")
            return {
                "action": "scroll",
                "amount": amount,
                "direction": direction,
                "result": "error",
                "error": str(e),
                "timestamp": time.time()
            }
    
    def take_screenshot(self, output_path: Optional[str] = None) -> Dict[str, Any]:
        """
        Take a screenshot of the entire screen.
        
        Args:
            output_path: Optional path to save the screenshot
            
        Returns:
            Dictionary with screenshot information
        """
        try:
            if PYAUTOGUI_AVAILABLE:
                screenshot = pyautogui.screenshot()
                action_result = "success"
                
                if output_path:
                    screenshot.save(output_path)
                    logger.info(f"Screenshot saved to {output_path}")
                else:
                    # Convert to bytes for in-memory use
                    import io
                    img_byte_arr = io.BytesIO()
                    screenshot.save(img_byte_arr, format='PNG')
                    img_byte_arr = img_byte_arr.getvalue()
                    
            else:
                # Simulate screenshot for testing
                action_result = "simulated"
                img_byte_arr = b"simulated_screenshot_data"
            
            return {
                "action": "take_screenshot",
                "output_path": output_path,
                "result": action_result,
                "image_data": img_byte_arr if not output_path else None,
                "timestamp": time.time()
            }
            
        except Exception as e:
            logger.error(f"Screenshot failed: {str(e)}")
            return {
                "action": "take_screenshot",
                "output_path": output_path,
                "result": "error",
                "error": str(e),
                "timestamp": time.time()
            }
    
    def get_mouse_position(self) -> Dict[str, Any]:
        """
        Get the current mouse position.
        
        Returns:
            Dictionary with current mouse coordinates
        """
        try:
            if PYAUTOGUI_AVAILABLE:
                x, y = pyautogui.position()
                action_result = "success"
            else:
                # Simulate position for testing
                x, y = 500, 500
                action_result = "simulated"
            
            return {
                "action": "get_mouse_position",
                "coordinates": {"x": x, "y": y},
                "result": action_result,
                "timestamp": time.time()
            }
            
        except Exception as e:
            logger.error(f"Get mouse position failed: {str(e)}")
            return {
                "action": "get_mouse_position",
                "coordinates": {"x": 0, "y": 0},
                "result": "error",
                "error": str(e),
                "timestamp": time.time()
            }
