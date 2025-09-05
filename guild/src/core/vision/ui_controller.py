"""
UI Controller for Low-Level GUI Automation

This module provides low-level control over GUI elements using lightweight
approaches, with simulation mode for Docker environments.
"""

import time
import logging
from typing import Dict, Tuple, Optional, Any
from PIL import Image, ImageGrab
import io
import os

logger = logging.getLogger(__name__)

# Check if we're in a Docker environment
DOCKER_ENV = os.getenv('DOCKER_ENV', 'false').lower() == 'true'
HEADLESS_ENV = not os.getenv('DISPLAY') or os.getenv('DISPLAY') == ':99'

# Don't import PyAutoGUI at module level - import only when needed
PYAUTOGUI_AVAILABLE = False
pyautogui = None

class UiController:
    """
    Low-level controller for UI automation operations.
    Provides fallback simulation mode for headless environments.
    """
    
    def __init__(self):
        """Initialize the UI Controller."""
        self._init_pyautogui()
        logger.info(f"UiController initialized. PyAutoGUI available: {PYAUTOGUI_AVAILABLE}")
    
    def _init_pyautogui(self):
        """Initialize PyAutoGUI only when needed."""
        global PYAUTOGUI_AVAILABLE, pyautogui
        
        if HEADLESS_ENV or DOCKER_ENV:
            logger.info("Running in headless environment - PyAutoGUI disabled")
            return
            
        try:
            import pyautogui as pg
            pyautogui = pg
            PYAUTOGUI_AVAILABLE = True
            
            # Configure PyAutoGUI safety settings
            pyautogui.FAILSAFE = True
            pyautogui.PAUSE = 0.1
            
            logger.info("PyAutoGUI initialized successfully")
        except ImportError as e:
            logger.warning(f"PyAutoGUI not available: {e}")
        except Exception as e:
            logger.warning(f"PyAutoGUI initialization failed: {e}")
    
    def click(self, x: int, y: int, button: str = 'left') -> str:
        """Click at specified coordinates."""
        if PYAUTOGUI_AVAILABLE and pyautogui:
            try:
                pyautogui.click(x, y, button=button)
                return f"Clicked at ({x}, {y}) with {button} button"
            except Exception as e:
                logger.error(f"PyAutoGUI click failed: {e}")
                return self._simulate_click(x, y, button)
        else:
            return self._simulate_click(x, y, button)
    
    def _simulate_click(self, x: int, y: int, button: str = 'left') -> str:
        """Simulate a click operation (for headless environments)."""
        logger.info(f"Simulating {button} click at ({x}, {y})")
        return f"Simulated {button} click at ({x}, {y}) - running in simulation mode"
    
    def type_text(self, text: str, interval: float = 0.01) -> str:
        """Type text with optional interval between characters."""
        if PYAUTOGUI_AVAILABLE and pyautogui:
            try:
                pyautogui.typewrite(text, interval=interval)
                return f"Typed text: '{text}'"
            except Exception as e:
                logger.error(f"PyAutoGUI type failed: {e}")
                return self._simulate_type(text)
        else:
            return self._simulate_type(text)
    
    def _simulate_type(self, text: str) -> str:
        """Simulate typing text (for headless environments)."""
        logger.info(f"Simulating typing: '{text}'")
        return f"Simulated typing: '{text}' - running in simulation mode"
    
    def move_to(self, x: int, y: int, duration: float = 0.5) -> str:
        """Move mouse to specified coordinates."""
        if PYAUTOGUI_AVAILABLE and pyautogui:
            try:
                pyautogui.moveTo(x, y, duration=duration)
                return f"Moved to ({x}, {y})"
            except Exception as e:
                logger.error(f"PyAutoGUI move failed: {e}")
                return self._simulate_move(x, y)
        else:
            return self._simulate_move(x, y)
    
    def _simulate_move(self, x: int, y: int) -> str:
        """Simulate mouse movement (for headless environments)."""
        logger.info(f"Simulating mouse move to ({x}, {y})")
        return f"Simulated mouse move to ({x}, {y}) - running in simulation mode"
    
    def scroll(self, amount: int, x: Optional[int] = None, y: Optional[int] = None) -> str:
        """Scroll at specified coordinates or current position."""
        if PYAUTOGUI_AVAILABLE and pyautogui:
            try:
                if x is not None and y is not None:
                    pyautogui.scroll(amount, x=x, y=y)
                else:
                    pyautogui.scroll(amount)
                return f"Scrolled {amount} units"
            except Exception as e:
                logger.error(f"PyAutoGUI scroll failed: {e}")
                return self._simulate_scroll(amount)
        else:
            return self._simulate_scroll(amount)
    
    def _simulate_scroll(self, amount: int) -> str:
        """Simulate scrolling (for headless environments)."""
        logger.info(f"Simulating scroll by {amount} units")
        return f"Simulated scroll by {amount} units - running in simulation mode"
    
    def take_screenshot(self, region: Optional[Tuple[int, int, int, int]] = None) -> bytes:
        """Take a screenshot of the screen or specified region."""
        if PYAUTOGUI_AVAILABLE and pyautogui:
            try:
                screenshot = pyautogui.screenshot(region=region)
                img_byte_arr = io.BytesIO()
                screenshot.save(img_byte_arr, format='PNG')
                return img_byte_arr.getvalue()
            except Exception as e:
                logger.error(f"PyAutoGUI screenshot failed: {e}")
                return self._simulate_screenshot(region)
        else:
            return self._simulate_screenshot(region)
    
    def _simulate_screenshot(self, region: Optional[Tuple[int, int, int, int]] = None) -> bytes:
        """Simulate taking a screenshot (for headless environments)."""
        logger.info(f"Simulating screenshot{' of region ' + str(region) if region else ''}")
        
        # Create a simple test image
        from PIL import Image, ImageDraw
        
        if region:
            width, height = region[2] - region[0], region[3] - region[1]
        else:
            width, height = 800, 600
        
        # Create a test image with text
        img = Image.new('RGB', (width, height), color='white')
        draw = ImageDraw.Draw(img)
        
        # Add some test content
        try:
            draw.text((10, 10), f"Simulated Screenshot", fill='black')
            draw.text((10, 30), f"Size: {width}x{height}", fill='black')
            draw.text((10, 50), f"Running in simulation mode", fill='black')
        except:
            pass  # Font might not be available
        
        # Convert to bytes
        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr, format='PNG')
        return img_byte_arr.getvalue()
    
    def get_mouse_position(self) -> Tuple[int, int]:
        """Get current mouse position."""
        if PYAUTOGUI_AVAILABLE and pyautogui:
            try:
                return pyautogui.position()
            except Exception as e:
                logger.error(f"PyAutoGUI position failed: {e}")
                return (0, 0)
        else:
            return (0, 0)  # Default position in simulation mode
    
    def is_available(self) -> bool:
        """Check if PyAutoGUI is available and working."""
        return PYAUTOGUI_AVAILABLE and pyautogui is not None
