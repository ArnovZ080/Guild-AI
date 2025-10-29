"""
Session Recorder for Tango-Style Learning

This module captures user demonstrations to teach the AI workforce new visual skills.
The system records mouse movements, clicks, keyboard input, and screen states to learn
how users perform tasks and generate new visual skill templates.
"""

import time
import json
import logging
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime
import threading
from pathlib import Path

# Conditional imports for vision components
try:
    from guild.src.core.vision.visual_parser import VisualParser
    from guild.src.core.vision.ui_controller import UiController
    VISION_AVAILABLE = True
except ImportError:
    VisualParser = None
    UiController = None
    VISION_AVAILABLE = False
    print("Warning: Vision components not available - session recording disabled")

# Conditional imports for display-dependent libraries
try:
    import cv2
    import numpy as np
    from PIL import Image, ImageGrab
    CV_AVAILABLE = True
except ImportError:
    CV_AVAILABLE = False
    print("Warning: Computer vision libraries not available")

# Don't import PyAutoGUI at module level - import only when needed
PYAUTOGUI_AVAILABLE = False
pyautogui = None

logger = logging.getLogger(__name__)

@dataclass
class ActionEvent:
    """Represents a single action during a demonstration session."""
    timestamp: float
    action_type: str  # 'click', 'type', 'drag', 'scroll', 'wait'
    target_element: Optional[str] = None
    coordinates: Optional[Tuple[int, int]] = None
    action_data: Optional[Dict[str, Any]] = None
    screen_state: Optional[str] = None  # Path to screenshot
    confidence: float = 1.0

@dataclass
class ScreenState:
    """Represents the state of the screen at a given moment."""
    timestamp: float
    screenshot_path: str
    ui_elements: List[Dict[str, Any]] = None
    active_window: Optional[str] = None
    mouse_position: Optional[Tuple[int, int]] = None

@dataclass
class DemonstrationSession:
    """Represents a complete demonstration session."""
    session_id: str
    name: str
    description: str
    start_time: datetime
    end_time: Optional[datetime] = None
    actions: List[ActionEvent] = None
    screen_states: List[ScreenState] = None
    metadata: Dict[str, Any] = None
    skill_pattern: Optional[Dict[str, Any]] = None

class SessionRecorder:
    """Records user demonstrations for Tango-style learning."""
    
    def __init__(self, output_dir: str = "recorded_sessions"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        
        # Initialize vision components if available
        if VISION_AVAILABLE:
            try:
                self.visual_parser = VisualParser()
                self.ui_controller = UiController()
            except Exception as e:
                logger.warning(f"Failed to initialize vision components: {e}")
                self.visual_parser = None
                self.ui_controller = None
        else:
            self.visual_parser = None
            self.ui_controller = None
        
        # Initialize PyAutoGUI only when needed
        self._init_pyautogui()
        
        # Recording state
        self.is_recording = False
        self.current_session: Optional[DemonstrationSession] = None
        self.recording_thread: Optional[threading.Thread] = None
        
        # Recording settings
        self.screenshot_interval = 0.5  # Screenshots every 0.5 seconds
        self.action_threshold = 0.1  # Minimum time between actions
        
        # Performance tracking
        self.last_action_time = 0
        self.last_screenshot_time = 0
        
        logger.info("SessionRecorder initialized successfully")
    
    def _init_pyautogui(self):
        """Initialize PyAutoGUI only when needed."""
        global PYAUTOGUI_AVAILABLE, pyautogui
        
        # Check if we're in a headless environment
        import os
        headless_env = not os.getenv('DISPLAY') or os.getenv('DISPLAY') == ':99'
        
        if headless_env:
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
    
    def start_recording(self, session_name: str, description: str = "") -> str:
        """Start recording a new demonstration session."""
        if self.is_recording:
            raise RuntimeError("Already recording a session")
        
        # Generate session ID
        session_id = f"session_{int(time.time())}_{session_name[:20].replace(' ', '_')}"
        
        # Create session
        self.current_session = DemonstrationSession(
            session_id=session_id,
            name=session_name,
            description=description,
            start_time=datetime.now(),
            actions=[],
            screen_states=[],
            metadata={}
        )
        
        # Start recording thread
        self.is_recording = True
        self.recording_thread = threading.Thread(target=self._recording_loop)
        self.recording_thread.daemon = True
        self.recording_thread.start()
        
        logger.info(f"Started recording session: {session_id}")
        return session_id
    
    def stop_recording(self) -> Optional[DemonstrationSession]:
        """Stop recording and return the completed session."""
        if not self.is_recording:
            return None
        
        self.is_recording = False
        
        if self.recording_thread:
            self.recording_thread.join(timeout=2.0)
        
        if self.current_session:
            self.current_session.end_time = datetime.now()
            
            # Save session to file
            session_file = self.output_dir / f"{self.current_session.session_id}.json"
            try:
                with open(session_file, 'w') as f:
                    json.dump(asdict(self.current_session), f, default=str, indent=2)
                logger.info(f"Session saved to: {session_file}")
            except Exception as e:
                logger.error(f"Failed to save session: {e}")
            
            session = self.current_session
            self.current_session = None
            return session
        
        return None
    
    def _recording_loop(self):
        """Main recording loop that captures actions and screenshots."""
        logger.info("Recording loop started")
        
        while self.is_recording:
            try:
                current_time = time.time()
                
                # Capture actions if enough time has passed
                if current_time - self.last_action_time >= self.action_threshold:
                    self._capture_current_action()
                    self.last_action_time = current_time
                
                # Capture screenshots if enough time has passed
                if current_time - self.last_screenshot_time >= self.screenshot_interval:
                    self._capture_screenshot()
                    self.last_screenshot_time = current_time
                
                time.sleep(0.1)  # Small delay to prevent excessive CPU usage
                
            except Exception as e:
                logger.error(f"Error in recording loop: {e}")
                time.sleep(1.0)  # Longer delay on error
        
        logger.info("Recording loop stopped")
    
    def _capture_current_action(self):
        """Capture the current action (mouse position, keyboard state, etc.)."""
        if not self.current_session:
            return
        
        try:
            # Get mouse position if PyAutoGUI is available
            mouse_pos = None
            if PYAUTOGUI_AVAILABLE and pyautogui:
                try:
                    mouse_pos = pyautogui.position()
                except Exception as e:
                    logger.debug(f"Could not get mouse position: {e}")
            
            # Create action event
            action = ActionEvent(
                timestamp=time.time(),
                action_type="monitor",  # Generic monitoring action
                coordinates=mouse_pos,
                action_data={
                    "mouse_position": mouse_pos,
                    "timestamp": time.time()
                }
            )
            
            self.current_session.actions.append(action)
            
        except Exception as e:
            logger.error(f"Error capturing action: {e}")
    
    def _capture_screenshot(self):
        """Capture a screenshot of the current screen."""
        if not self.current_session:
            return
        
        try:
            # Try to take screenshot using available methods
            screenshot_data = None
            
            if PYAUTOGUI_AVAILABLE and pyautogui:
                try:
                    screenshot = pyautogui.screenshot()
                    # Convert to bytes
                    import io
                    img_byte_arr = io.BytesIO()
                    screenshot.save(img_byte_arr, format='PNG')
                    screenshot_data = img_byte_arr.getvalue()
                except Exception as e:
                    logger.debug(f"PyAutoGUI screenshot failed: {e}")
            
            if not screenshot_data and CV_AVAILABLE:
                try:
                    # Fallback to PIL ImageGrab
                    screenshot = ImageGrab.grab()
                    import io
                    img_byte_arr = io.BytesIO()
                    screenshot.save(img_byte_arr, format='PNG')
                    screenshot_data = img_byte_arr.getvalue()
                except Exception as e:
                    logger.debug(f"PIL screenshot failed: {e}")
            
            if screenshot_data:
                # Save screenshot to file
                timestamp = int(time.time())
                screenshot_file = self.output_dir / f"{self.current_session.session_id}_screenshot_{timestamp}.png"
                
                try:
                    with open(screenshot_file, 'wb') as f:
                        f.write(screenshot_data)
                    
                    # Create screen state
                    screen_state = ScreenState(
                        timestamp=time.time(),
                        screenshot_path=str(screenshot_file),
                        ui_elements=[],  # Would be populated by visual parser if available
                        mouse_position=None  # Would be populated if available
                    )
                    
                    self.current_session.screen_states.append(screen_state)
                    
                except Exception as e:
                    logger.error(f"Failed to save screenshot: {e}")
            else:
                logger.debug("No screenshot method available")
                
        except Exception as e:
            logger.error(f"Error capturing screenshot: {e}")
    
    def add_custom_action(self, action_type: str, **kwargs):
        """Add a custom action to the current session."""
        if not self.current_session or not self.is_recording:
            return
        
        try:
            action = ActionEvent(
                timestamp=time.time(),
                action_type=action_type,
                **kwargs
            )
            
            self.current_session.actions.append(action)
            logger.debug(f"Added custom action: {action_type}")
            
        except Exception as e:
            logger.error(f"Error adding custom action: {e}")
    
    def get_session_info(self) -> Optional[Dict[str, Any]]:
        """Get information about the current recording session."""
        if not self.current_session:
            return None
        
        return {
            "session_id": self.current_session.session_id,
            "name": self.current_session.name,
            "description": self.current_session.description,
            "start_time": self.current_session.start_time.isoformat(),
            "actions_count": len(self.current_session.actions),
            "screenshots_count": len(self.current_session.screen_states),
            "is_recording": self.is_recording
        }
    
    def is_recording_active(self) -> bool:
        """Check if recording is currently active."""
        return self.is_recording
