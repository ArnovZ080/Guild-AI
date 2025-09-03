"""
UI Controller for Low-Level GUI Automation

This module provides low-level control over GUI elements using PyAutoGUI,
integrated with our computer vision system for intelligent automation.
"""

import pyautogui
import time
import logging
from typing import Dict, Tuple, Optional, Any
from PIL import Image, ImageGrab
import io

logger = logging.getLogger(__name__)

# Configure PyAutoGUI safety settings
pyautogui.FAILSAFE = True  # Move mouse to corner to stop
pyautogui.PAUSE = 0.1  # Small delay between actions


class UiController:
    """
    Low-level controller for GUI automation using PyAutoGUI.
    Provides precise control over mouse, keyboard, and screen interactions.
    """
    
    def __init__(self):
        """Initialize the UI Controller."""
        self.screen_width, self.screen_height = pyautogui.size()
        logger.info(f"UiController initialized for screen: {self.screen_width}x{self.screen_height}")
        
        # Store last action for debugging
        self.last_action = None
        self.action_history = []
    
    def click(self, x: int, y: int, button: str = "left", clicks: int = 1, interval: float = 0.0) -> bool:
        """
        Click at specified coordinates.
        
        Args:
            x: X coordinate
            y: Y coordinate
            button: Mouse button ("left", "right", "middle")
            clicks: Number of clicks
            interval: Time between clicks
            
        Returns:
            True if successful
        """
        try:
            # Validate coordinates
            if not self._validate_coordinates(x, y):
                logger.warning(f"Invalid coordinates: ({x}, {y})")
                return False
            
            # Perform click
            pyautogui.click(x, y, clicks=clicks, interval=interval, button=button)
            
            # Log action
            action = f"click({x}, {y}, {button}, {clicks})"
            self._log_action(action)
            
            return True
            
        except Exception as e:
            logger.error(f"Click failed at ({x}, {y}): {e}")
            return False
    
    def click_element(self, element: Dict[str, Any], button: str = "left") -> bool:
        """
        Click on a UI element using its position data.
        
        Args:
            element: UI element dictionary with position
            button: Mouse button to use
            
        Returns:
            True if successful
        """
        try:
            position = element.get("position", {})
            x = position.get("x", 0) + (position.get("width", 0) // 2)
            y = position.get("y", 0) + (position.get("height", 0) // 2)
            
            return self.click(x, y, button)
            
        except Exception as e:
            logger.error(f"Click element failed: {e}")
            return False
    
    def double_click(self, x: int, y: int, button: str = "left") -> bool:
        """Double click at specified coordinates."""
        return self.click(x, y, button, clicks=2, interval=0.1)
    
    def right_click(self, x: int, y: int) -> bool:
        """Right click at specified coordinates."""
        return self.click(x, y, button="right")
    
    def type_text(self, text: str, interval: float = 0.01) -> bool:
        """
        Type text at current cursor position.
        
        Args:
            text: Text to type
            interval: Delay between characters
            
        Returns:
            True if successful
        """
        try:
            pyautogui.typewrite(text, interval=interval)
            
            action = f"type_text('{text[:20]}...')" if len(text) > 20 else f"type_text('{text}')"
            self._log_action(action)
            
            return True
            
        except Exception as e:
            logger.error(f"Type text failed: {e}")
            return False
    
    def type_text_at(self, x: int, y: int, text: str, interval: float = 0.01) -> bool:
        """
        Click at coordinates and type text.
        
        Args:
            x: X coordinate
            y: Y coordinate
            text: Text to type
            interval: Delay between characters
            
        Returns:
            True if successful
        """
        try:
            # Click first
            if not self.click(x, y):
                return False
            
            # Small delay to ensure focus
            time.sleep(0.1)
            
            # Type text
            return self.type_text(text, interval)
            
        except Exception as e:
            logger.error(f"Type text at failed: {e}")
            return False
    
    def move_to(self, x: int, y: int, duration: float = 0.5) -> bool:
        """
        Move mouse to specified coordinates.
        
        Args:
            x: X coordinate
            y: Y coordinate
            duration: Time to move (seconds)
            
        Returns:
            True if successful
        """
        try:
            if not self._validate_coordinates(x, y):
                return False
            
            pyautogui.moveTo(x, y, duration=duration)
            
            action = f"move_to({x}, {y})"
            self._log_action(action)
            
            return True
            
        except Exception as e:
            logger.error(f"Move to failed: {e}")
            return False
    
    def scroll(self, clicks: int, x: Optional[int] = None, y: Optional[int] = None) -> bool:
        """
        Scroll at specified coordinates or current position.
        
        Args:
            clicks: Number of scroll clicks (positive = up, negative = down)
            x: X coordinate (optional)
            y: Y coordinate (optional)
            
        Returns:
            True if successful
        """
        try:
            if x is not None and y is not None:
                if not self._validate_coordinates(x, y):
                    return False
                pyautogui.scroll(clicks, x=x, y=y)
            else:
                pyautogui.scroll(clicks)
            
            action = f"scroll({clicks})"
            self._log_action(action)
            
            return True
            
        except Exception as e:
            logger.error(f"Scroll failed: {e}")
            return False
    
    def take_screenshot(self, region: Optional[Tuple[int, int, int, int]] = None) -> bytes:
        """
        Take a screenshot of the entire screen or a region.
        
        Args:
            region: Optional tuple (left, top, width, height)
            
        Returns:
            Screenshot as bytes
        """
        try:
            if region:
                screenshot = ImageGrab.grab(bbox=region)
            else:
                screenshot = ImageGrab.grab()
            
            # Convert to bytes
            img_byte_arr = io.BytesIO()
            screenshot.save(img_byte_arr, format='PNG')
            img_byte_arr = img_byte_arr.getvalue()
            
            action = f"screenshot({region if region else 'full'})"
            self._log_action(action)
            
            return img_byte_arr
            
        except Exception as e:
            logger.error(f"Screenshot failed: {e}")
            return b""
    
    def get_mouse_position(self) -> Tuple[int, int]:
        """Get current mouse position."""
        return pyautogui.position()
    
    def drag(self, start_x: int, start_y: int, end_x: int, end_y: int, duration: float = 1.0) -> bool:
        """
        Drag from start to end coordinates.
        
        Args:
            start_x: Starting X coordinate
            start_y: Starting Y coordinate
            end_x: Ending X coordinate
            end_y: Ending Y coordinate
            duration: Duration of drag
            
        Returns:
            True if successful
        """
        try:
            if not (self._validate_coordinates(start_x, start_y) and self._validate_coordinates(end_x, end_y)):
                return False
            
            pyautogui.drag(end_x - start_x, end_y - start_y, duration=duration, button='left')
            
            action = f"drag({start_x},{start_y} -> {end_x},{end_y})"
            self._log_action(action)
            
            return True
            
        except Exception as e:
            logger.error(f"Drag failed: {e}")
            return False
    
    def press_key(self, key: str) -> bool:
        """
        Press a single key.
        
        Args:
            key: Key to press (e.g., 'enter', 'tab', 'space')
            
        Returns:
            True if successful
        """
        try:
            pyautogui.press(key)
            
            action = f"press_key('{key}')"
            self._log_action(action)
            
            return True
            
        except Exception as e:
            logger.error(f"Press key failed: {e}")
            return False
    
    def hotkey(self, *keys: str) -> bool:
        """
        Press a combination of keys.
        
        Args:
            *keys: Keys to press simultaneously
            
        Returns:
            True if successful
        """
        try:
            pyautogui.hotkey(*keys)
            
            action = f"hotkey({', '.join(keys)})"
            self._log_action(action)
            
            return True
            
        except Exception as e:
            logger.error(f"Hotkey failed: {e}")
            return False
    
    def wait_for_element(self, element_description: str, timeout: float = 10.0) -> Optional[Dict[str, Any]]:
        """
        Wait for an element to appear on screen.
        
        Args:
            element_description: Description of element to wait for
            timeout: Maximum time to wait (seconds)
            
        Returns:
            Element data if found, None if timeout
        """
        start_time = time.time()
        
        while time.time() - start_time < timeout:
            # Take screenshot and analyze
            screenshot = self.take_screenshot()
            # Note: This would need to be integrated with VisualParser
            # For now, return None
            time.sleep(0.5)
        
        logger.warning(f"Timeout waiting for element: {element_description}")
        return None
    
    def _validate_coordinates(self, x: int, y: int) -> bool:
        """Validate that coordinates are within screen bounds."""
        return 0 <= x <= self.screen_width and 0 <= y <= self.screen_height
    
    def _log_action(self, action: str):
        """Log an action for debugging purposes."""
        self.last_action = action
        self.action_history.append({
            "action": action,
            "timestamp": time.time(),
            "position": pyautogui.position()
        })
        
        # Keep only last 100 actions
        if len(self.action_history) > 100:
            self.action_history = self.action_history[-100:]
        
        logger.debug(f"UI Action: {action}")
    
    def get_action_history(self) -> list:
        """Get recent action history for debugging."""
        return self.action_history.copy()
    
    def clear_action_history(self):
        """Clear action history."""
        self.action_history.clear()
    
    def get_screen_info(self) -> Dict[str, Any]:
        """Get information about the current screen setup."""
        return {
            "width": self.screen_width,
            "height": self.screen_height,
            "scale_factor": pyautogui.size().width / self.screen_width if hasattr(pyautogui, 'size') else 1.0,
            "last_action": self.last_action,
            "action_count": len(self.action_history)
        }
