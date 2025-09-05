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

import pyautogui
import cv2
import numpy as np
from PIL import Image, ImageGrab

from guild.src.core.vision.visual_parser import VisualParser
from guild.src.core.vision.ui_controller import UiController

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
        
        # Initialize vision components
        self.visual_parser = VisualParser()
        self.ui_controller = UiController()
        
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
    
    def start_recording(self, session_name: str, description: str = "") -> str:
        """Start recording a new demonstration session."""
        if self.is_recording:
            raise RuntimeError("Already recording a session")
        
        # Create new session
        session_id = f"session_{int(time.time())}"
        self.current_session = DemonstrationSession(
            session_id=session_id,
            name=session_name,
            description=description,
            start_time=datetime.now(),
            actions=[],
            screen_states=[],
            metadata={
                "screen_resolution": pyautogui.size(),
                "platform": pyautogui.platform,
                "recording_settings": {
                    "screenshot_interval": self.screenshot_interval,
                    "action_threshold": self.action_threshold
                }
            }
        )
        
        # Start recording thread
        self.is_recording = True
        self.recording_thread = threading.Thread(target=self._recording_loop)
        self.recording_thread.daemon = True
        self.recording_thread.start()
        
        logger.info(f"Started recording session: {session_name} (ID: {session_id})")
        return session_id
    
    def stop_recording(self) -> Optional[DemonstrationSession]:
        """Stop recording and return the completed session."""
        if not self.is_recording:
            return None
        
        self.is_recording = False
        
        if self.recording_thread:
            self.recording_thread.join(timeout=5)
        
        if self.current_session:
            self.current_session.end_time = datetime.now()
            
            # Save session
            self._save_session(self.current_session)
            
            # Generate skill pattern
            self.current_session.skill_pattern = self._generate_skill_pattern()
            
            logger.info(f"Stopped recording session: {self.current_session.name}")
            return self.current_session
        
        return None
    
    def _recording_loop(self):
        """Main recording loop that captures actions and screen states."""
        while self.is_recording:
            try:
                current_time = time.time()
                
                # Capture screen state periodically
                if current_time - self.last_screenshot_time >= self.screenshot_interval:
                    self._capture_screen_state()
                    self.last_screenshot_time = current_time
                
                # Small delay to prevent excessive CPU usage
                time.sleep(0.1)
                
            except Exception as e:
                logger.error(f"Error in recording loop: {e}")
                break
    
    def _capture_screen_state(self):
        """Capture current screen state with UI element detection."""
        try:
            timestamp = time.time()
            
            # Take screenshot
            screenshot = ImageGrab.grab()
            screenshot_path = self.output_dir / f"screen_{timestamp:.3f}.png"
            screenshot.save(screenshot_path)
            
            # Detect UI elements
            ui_elements = self._detect_ui_elements(screenshot)
            
            # Get mouse position
            mouse_pos = pyautogui.position()
            
            # Get active window info
            active_window = self._get_active_window_info()
            
            # Create screen state
            screen_state = ScreenState(
                timestamp=timestamp,
                screenshot_path=str(screenshot_path),
                ui_elements=ui_elements,
                active_window=active_window,
                mouse_position=mouse_pos
            )
            
            if self.current_session:
                self.current_session.screen_states.append(screen_state)
                
        except Exception as e:
            logger.error(f"Error capturing screen state: {e}")
    
    def _detect_ui_elements(self, screenshot: Image.Image) -> List[Dict[str, Any]]:
        """Detect UI elements in the screenshot using computer vision."""
        try:
            # Convert PIL image to OpenCV format
            cv_image = cv2.cvtColor(np.array(screenshot), cv2.COLOR_RGB2BGR)
            
            # Use visual parser to detect elements
            elements = self.visual_parser.detect_ui_elements(cv_image)
            
            return elements
            
        except Exception as e:
            logger.error(f"Error detecting UI elements: {e}")
            return []
    
    def _get_active_window_info(self) -> Optional[str]:
        """Get information about the currently active window."""
        try:
            # This would integrate with your UI controller
            # For now, return basic info
            return "Active Window"
        except Exception as e:
            logger.error(f"Error getting active window info: {e}")
            return None
    
    def record_action(self, action_type: str, target_element: Optional[str] = None, 
                     coordinates: Optional[Tuple[int, int]] = None, 
                     action_data: Optional[Dict[str, Any]] = None):
        """Record a user action during the session."""
        if not self.is_recording or not self.current_session:
            return
        
        current_time = time.time()
        
        # Check if enough time has passed since last action
        if current_time - self.last_action_time < self.action_threshold:
            return
        
        # Create action event
        action = ActionEvent(
            timestamp=current_time,
            action_type=action_type,
            target_element=target_element,
            coordinates=coordinates,
            action_data=action_data,
            confidence=1.0
        )
        
        # Add to session
        self.current_session.actions.append(action)
        self.last_action_time = current_time
        
        logger.debug(f"Recorded action: {action_type} at {coordinates}")
    
    def _generate_skill_pattern(self) -> Dict[str, Any]:
        """Generate a skill pattern from the recorded session."""
        if not self.current_session or not self.current_session.actions:
            return {}
        
        try:
            # Analyze actions to create a skill pattern
            steps = []
            
            for action in self.current_session.actions:
                step = {
                    "action_type": action.action_type,
                    "target_element": action.target_element or "unknown",
                    "action_data": action.action_data or {}
                }
                
                if action.coordinates:
                    step["coordinates"] = action.coordinates
                
                steps.append(step)
            
            # Calculate estimated duration
            if len(self.current_session.actions) > 1:
                duration = (self.current_session.actions[-1].timestamp - 
                          self.current_session.actions[0].timestamp)
            else:
                duration = 30  # Default duration
            
            skill_pattern = {
                "steps": steps,
                "estimated_duration": int(duration),
                "session_metadata": {
                    "session_id": self.current_session.session_id,
                    "recorded_at": self.current_session.start_time.isoformat(),
                    "total_actions": len(self.current_session.actions),
                    "total_screenshots": len(self.current_session.screen_states)
                }
            }
            
            return skill_pattern
            
        except Exception as e:
            logger.error(f"Error generating skill pattern: {e}")
            return {}
    
    def _save_session(self, session: DemonstrationSession):
        """Save the session to disk."""
        try:
            # Create session directory
            session_dir = self.output_dir / session.session_id
            session_dir.mkdir(exist_ok=True)
            
            # Save session metadata
            session_file = session_dir / "session.json"
            with open(session_file, 'w') as f:
                json.dump(asdict(session), f, indent=2, default=str)
            
            # Save screenshots (move them to session directory)
            screenshots_dir = session_dir / "screenshots"
            screenshots_dir.mkdir(exist_ok=True)
            
            for screen_state in session.screen_states:
                if screen_state.screenshot_path:
                    old_path = Path(screen_state.screenshot_path)
                    if old_path.exists():
                        new_path = screenshots_dir / old_path.name
                        old_path.rename(new_path)
                        screen_state.screenshot_path = str(new_path)
            
            logger.info(f"Session saved to: {session_dir}")
            
        except Exception as e:
            logger.error(f"Error saving session: {e}")
    
    def get_session_summary(self) -> Dict[str, Any]:
        """Get a summary of the current recording session."""
        if not self.current_session:
            return {}
        
        return {
            "session_id": self.current_session.session_id,
            "name": self.current_session.name,
            "description": self.current_session.description,
            "start_time": self.current_session.start_time.isoformat(),
            "duration": (datetime.now() - self.current_session.start_time).total_seconds(),
            "actions_recorded": len(self.current_session.actions),
            "screenshots_captured": len(self.current_session.screen_states),
            "is_recording": self.is_recording
        }
    
    def list_recorded_sessions(self) -> List[Dict[str, Any]]:
        """List all recorded sessions."""
        sessions = []
        
        for session_dir in self.output_dir.iterdir():
            if session_dir.is_dir() and session_dir.name.startswith("session_"):
                session_file = session_dir / "session.json"
                if session_file.exists():
                    try:
                        with open(session_file, 'r') as f:
                            session_data = json.load(f)
                            sessions.append({
                                "session_id": session_data["session_id"],
                                "name": session_data["name"],
                                "description": session_data["description"],
                                "start_time": session_data["start_time"],
                                "end_time": session_data.get("end_time"),
                                "total_actions": len(session_data.get("actions", [])),
                                "total_screenshots": len(session_data.get("screen_states", []))
                            })
                    except Exception as e:
                        logger.error(f"Error reading session {session_dir.name}: {e}")
        
        return sorted(sessions, key=lambda x: x["start_time"], reverse=True)
    
    def load_session(self, session_id: str) -> Optional[DemonstrationSession]:
        """Load a recorded session from disk."""
        try:
            session_file = self.output_dir / session_id / "session.json"
            if not session_file.exists():
                return None
            
            with open(session_file, 'r') as f:
                session_data = json.load(f)
                
            # Reconstruct session object
            session = DemonstrationSession(
                session_id=session_data["session_id"],
                name=session_data["name"],
                description=session_data["description"],
                start_time=datetime.fromisoformat(session_data["start_time"]),
                end_time=datetime.fromisoformat(session_data["end_time"]) if session_data.get("end_time") else None,
                actions=[ActionEvent(**action) for action in session_data.get("actions", [])],
                screen_states=[ScreenState(**state) for state in session_data.get("screen_states", [])],
                metadata=session_data.get("metadata", {}),
                skill_pattern=session_data.get("skill_pattern", {})
            )
            
            return session
            
        except Exception as e:
            logger.error(f"Error loading session {session_id}: {e}")
            return None
