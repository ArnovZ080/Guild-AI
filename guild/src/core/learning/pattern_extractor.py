"""
Pattern Extraction Engine for Tango-Style Learning

This module analyzes recorded demonstration sessions to extract patterns,
identify UI elements, and generate new visual skill templates.
"""

import logging
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
import json
import time
from pathlib import Path

# Conditional imports for computer vision
try:
    import cv2
    import numpy as np
    CV_AVAILABLE = True
except ImportError:
    CV_AVAILABLE = False
    print("Warning: OpenCV not available - pattern extraction limited")

try:
    from sklearn.cluster import DBSCAN
    from sklearn.metrics.pairwise import euclidean_distances
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False
    print("Warning: Scikit-learn not available - clustering disabled")

from guild.src.core.learning.session_recorder import DemonstrationSession, ActionEvent, ScreenState

# Conditional import for vision components
try:
    from guild.src.core.vision.visual_parser import VisualParser
    VISION_AVAILABLE = True
except ImportError:
    VisualParser = None
    VISION_AVAILABLE = False
    print("Warning: VisualParser not available - pattern extraction disabled")

logger = logging.getLogger(__name__)

@dataclass
class UIPattern:
    """Represents a detected UI pattern."""
    pattern_id: str
    pattern_type: str  # 'button', 'form', 'navigation', 'workflow'
    confidence: float
    ui_elements: List[Dict[str, Any]]
    spatial_relationships: Dict[str, Any]
    temporal_relationships: Dict[str, Any]
    frequency: int
    examples: List[str]  # Session IDs where this pattern was found

@dataclass
class ActionPattern:
    """Represents a detected action pattern."""
    pattern_id: str
    action_sequence: List[Dict[str, Any]]
    frequency: int
    confidence: float
    context: Dict[str, Any]
    examples: List[str]  # Session IDs where this pattern was found

@dataclass
class WorkflowPattern:
    """Represents a complete workflow pattern."""
    pattern_id: str
    name: str
    description: str
    ui_patterns: List[UIPattern]
    action_patterns: List[ActionPattern]
    estimated_duration: int
    confidence: float
    complexity_score: float
    examples: List[str]

class PatternExtractor:
    """Extracts patterns from recorded demonstration sessions."""
    
    def __init__(self):
        # Initialize visual parser only if available
        if VISION_AVAILABLE:
            try:
                self.visual_parser = VisualParser()
                logger.info("VisualParser initialized successfully")
            except Exception as e:
                logger.warning(f"Failed to initialize VisualParser: {e}")
                self.visual_parser = None
        else:
            self.visual_parser = None
        
        # Pattern detection settings
        self.min_pattern_frequency = 2  # Minimum times a pattern must appear
        self.spatial_clustering_eps = 50  # Pixels for spatial clustering
        self.temporal_clustering_eps = 2.0  # Seconds for temporal clustering
        self.min_confidence = 0.7
        
        logger.info("PatternExtractor initialized successfully")
    
    def extract_patterns_from_session(self, session: DemonstrationSession) -> Dict[str, Any]:
        """Extract all patterns from a single demonstration session."""
        try:
            patterns = {
                "ui_patterns": [],
                "action_patterns": [],
                "workflow_patterns": []
            }
            
            # Extract UI patterns
            ui_patterns = self._extract_ui_patterns(session)
            patterns["ui_patterns"] = ui_patterns
            
            # Extract action patterns
            action_patterns = self._extract_action_patterns(session)
            patterns["action_patterns"] = action_patterns
            
            # Extract workflow patterns
            workflow_patterns = self._extract_workflow_patterns(session, ui_patterns, action_patterns)
            patterns["workflow_patterns"] = workflow_patterns
            
            return patterns
            
        except Exception as e:
            logger.error(f"Error extracting patterns from session: {e}")
            return {"ui_patterns": [], "action_patterns": [], "workflow_patterns": []}
    
    def _extract_ui_patterns(self, session: DemonstrationSession) -> List[UIPattern]:
        """Extract UI patterns from the session."""
        if not self.visual_parser:
            logger.warning("VisualParser not available - UI pattern extraction disabled")
            return []
        
        try:
            ui_patterns = []
            
            # Analyze screenshots for UI elements
            for screen_state in session.screen_states:
                if screen_state.screenshot_path and Path(screen_state.screenshot_path).exists():
                    try:
                        # Load and analyze screenshot
                        elements = self._analyze_screenshot(screen_state.screenshot_path)
                        
                        if elements:
                            # Create UI pattern
                            pattern = UIPattern(
                                pattern_id=f"ui_pattern_{len(ui_patterns) + 1}",
                                pattern_type="ui_elements",
                                confidence=0.8,  # Default confidence
                                ui_elements=elements,
                                spatial_relationships=self._analyze_spatial_relationships(elements),
                                temporal_relationships={},
                                frequency=1,
                                examples=[session.session_id]
                            )
                            
                            ui_patterns.append(pattern)
                            
                    except Exception as e:
                        logger.debug(f"Error analyzing screenshot {screen_state.screenshot_path}: {e}")
                        continue
            
            return ui_patterns
            
        except Exception as e:
            logger.error(f"Error extracting UI patterns: {e}")
            return []
    
    def _analyze_screenshot(self, screenshot_path: str) -> List[Dict[str, Any]]:
        """Analyze a screenshot for UI elements."""
        if not self.visual_parser:
            return []
        
        try:
            # Load image
            if CV_AVAILABLE:
                image = cv2.imread(screenshot_path)
                if image is not None:
                    # Use visual parser to detect elements
                    # This would call the visual parser's methods
                    # For now, return basic element detection
                    return self._basic_element_detection(image)
            
            return []
            
        except Exception as e:
            logger.debug(f"Error analyzing screenshot: {e}")
            return []
    
    def _basic_element_detection(self, image) -> List[Dict[str, Any]]:
        """Basic UI element detection using OpenCV."""
        if not CV_AVAILABLE:
            return []
        
        try:
            elements = []
            
            # Convert to grayscale
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Detect edges
            edges = cv2.Canny(gray, 50, 150)
            
            # Find contours
            contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            # Filter contours by size
            min_area = 100
            for contour in contours:
                area = cv2.contourArea(contour)
                if area > min_area:
                    x, y, w, h = cv2.boundingRect(contour)
                    elements.append({
                        "type": "ui_element",
                        "position": {"x": x, "y": y, "width": w, "height": h},
                        "area": area,
                        "confidence": 0.6
                    })
            
            return elements
            
        except Exception as e:
            logger.debug(f"Error in basic element detection: {e}")
            return []
    
    def _analyze_spatial_relationships(self, elements: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze spatial relationships between UI elements."""
        if not elements:
            return {}
        
        try:
            relationships = {
                "above_below": [],
                "left_right": [],
                "overlapping": []
            }
            
            for i, elem1 in enumerate(elements):
                for j, elem2 in enumerate(elements[i+1:], i+1):
                    pos1 = elem1.get("position", {})
                    pos2 = elem2.get("position", {})
                    
                    if not pos1 or not pos2:
                        continue
                    
                    # Check spatial relationships
                    if self._is_above(elem1, elem2):
                        relationships["above_below"].append({
                            "above": i, "below": j, "distance": pos2["y"] - pos1["y"]
                        })
                    elif self._is_left_of(elem1, elem2):
                        relationships["left_right"].append({
                            "left": i, "right": j, "distance": pos2["x"] - pos1["x"]
                        })
                    
                    # Check for overlap
                    if self._elements_overlap(elem1, elem2):
                        relationships["overlapping"].append({
                            "element1": i, "element2": j, "overlap_area": self._calculate_overlap(elem1, elem2)
                        })
            
            return relationships
            
        except Exception as e:
            logger.debug(f"Error analyzing spatial relationships: {e}")
            return {}
    
    def _is_above(self, elem1: Dict[str, Any], elem2: Dict[str, Any]) -> bool:
        """Check if element1 is above element2."""
        pos1 = elem1.get("position", {})
        pos2 = elem2.get("position", {})
        
        if not pos1 or not pos2:
            return False
        
        # Element1 is above if its bottom is above element2's top
        return (pos1["y"] + pos1["height"]) < pos2["y"]
    
    def _is_left_of(self, elem1: Dict[str, Any], elem2: Dict[str, Any]) -> bool:
        """Check if element1 is to the left of element2."""
        pos1 = elem1.get("position", {})
        pos2 = elem2.get("position", {})
        
        if not pos1 or not pos2:
            return False
        
        # Element1 is left if its right edge is to the left of element2's left edge
        return (pos1["x"] + pos1["width"]) < pos2["x"]
    
    def _elements_overlap(self, elem1: Dict[str, Any], elem2: Dict[str, Any]) -> bool:
        """Check if two elements overlap."""
        pos1 = elem1.get("position", {})
        pos2 = elem2.get("position", {})
        
        if not pos1 or not pos2:
            return False
        
        # Check for overlap using bounding box intersection
        return not (pos1["x"] + pos1["width"] < pos2["x"] or 
                   pos2["x"] + pos2["width"] < pos1["x"] or
                   pos1["y"] + pos1["height"] < pos2["y"] or
                   pos2["y"] + pos2["height"] < pos1["y"])
    
    def _calculate_overlap(self, elem1: Dict[str, Any], elem2: Dict[str, Any]) -> float:
        """Calculate overlap area between two elements."""
        pos1 = elem1.get("position", {})
        pos2 = elem2.get("position", {})
        
        if not pos1 or not pos2:
            return 0.0
        
        # Calculate intersection rectangle
        x_left = max(pos1["x"], pos2["x"])
        y_top = max(pos1["y"], pos2["y"])
        x_right = min(pos1["x"] + pos1["width"], pos2["x"] + pos2["width"])
        y_bottom = min(pos1["y"] + pos1["height"], pos2["y"] + pos2["height"])
        
        if x_right < x_left or y_bottom < y_top:
            return 0.0
        
        overlap_area = (x_right - x_left) * (y_bottom - y_top)
        return overlap_area
    
    def _extract_action_patterns(self, session: DemonstrationSession) -> List[ActionPattern]:
        """Extract action patterns from the session."""
        try:
            action_patterns = []
            
            if not session.actions:
                return action_patterns
            
            # Group actions by type
            action_groups = {}
            for action in session.actions:
                action_type = action.action_type
                if action_type not in action_groups:
                    action_groups[action_type] = []
                action_groups[action_type].append(action)
            
            # Create patterns for each action type
            for action_type, actions in action_groups.items():
                if len(actions) >= self.min_pattern_frequency:
                    pattern = ActionPattern(
                        pattern_id=f"action_pattern_{action_type}_{len(action_patterns) + 1}",
                        action_sequence=[self._action_to_dict(action) for action in actions],
                        frequency=len(actions),
                        confidence=0.8,
                        context={"action_type": action_type},
                        examples=[session.session_id]
                    )
                    
                    action_patterns.append(pattern)
            
            return action_patterns
            
        except Exception as e:
            logger.error(f"Error extracting action patterns: {e}")
            return []
    
    def _action_to_dict(self, action: ActionEvent) -> Dict[str, Any]:
        """Convert ActionEvent to dictionary."""
        return {
            "timestamp": action.timestamp,
            "action_type": action.action_type,
            "target_element": action.target_element,
            "coordinates": action.coordinates,
            "action_data": action.action_data,
            "confidence": action.confidence
        }
    
    def _extract_workflow_patterns(self, session: DemonstrationSession, 
                                 ui_patterns: List[UIPattern], 
                                 action_patterns: List[ActionPattern]) -> List[WorkflowPattern]:
        """Extract complete workflow patterns from the session."""
        try:
            workflow_patterns = []
            
            # Create a workflow pattern from the session
            if session.actions or session.screen_states:
                workflow = WorkflowPattern(
                    pattern_id=f"workflow_pattern_{session.session_id}",
                    name=session.name,
                    description=session.description,
                    ui_patterns=ui_patterns,
                    action_patterns=action_patterns,
                    estimated_duration=self._calculate_session_duration(session),
                    confidence=0.8,
                    complexity_score=self._calculate_complexity_score(session),
                    examples=[session.session_id]
                )
                
                workflow_patterns.append(workflow)
            
            return workflow_patterns
            
        except Exception as e:
            logger.error(f"Error extracting workflow patterns: {e}")
            return []
    
    def _calculate_session_duration(self, session: DemonstrationSession) -> int:
        """Calculate the duration of the session in seconds."""
        if not session.actions:
            return 0
        
        start_time = min(action.timestamp for action in session.actions)
        end_time = max(action.timestamp for action in session.actions)
        
        return int(end_time - start_time)
    
    def _calculate_complexity_score(self, session: DemonstrationSession) -> float:
        """Calculate a complexity score for the session."""
        if not session.actions:
            return 0.0
        
        # Simple complexity calculation based on number of actions and screenshots
        action_count = len(session.actions)
        screenshot_count = len(session.screen_states)
        
        # Normalize to 0-1 scale
        complexity = min(1.0, (action_count + screenshot_count) / 100.0)
        
        return complexity
