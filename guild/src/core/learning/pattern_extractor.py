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

import cv2
import numpy as np
from sklearn.cluster import DBSCAN
from sklearn.metrics.pairwise import euclidean_distances

from guild.src.core.learning.session_recorder import DemonstrationSession, ActionEvent, ScreenState
from guild.src.core.vision.visual_parser import VisualParser

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
        self.visual_parser = VisualParser()
        
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
            
            logger.info(f"Extracted {len(ui_patterns)} UI patterns, {len(action_patterns)} action patterns, and {len(workflow_patterns)} workflow patterns from session {session.session_id}")
            
            return patterns
            
        except Exception as e:
            logger.error(f"Error extracting patterns from session: {e}")
            return {"ui_patterns": [], "action_patterns": [], "workflow_patterns": []}
    
    def extract_patterns_from_multiple_sessions(self, sessions: List[DemonstrationSession]) -> Dict[str, Any]:
        """Extract patterns across multiple sessions to find commonalities."""
        try:
            all_patterns = {
                "ui_patterns": [],
                "action_patterns": [],
                "workflow_patterns": []
            }
            
            # Collect patterns from all sessions
            session_patterns = []
            for session in sessions:
                patterns = self.extract_patterns_from_session(session)
                session_patterns.append(patterns)
            
            # Merge and cluster patterns across sessions
            all_patterns["ui_patterns"] = self._merge_ui_patterns(session_patterns)
            all_patterns["action_patterns"] = self._merge_action_patterns(session_patterns)
            all_patterns["workflow_patterns"] = self._merge_workflow_patterns(session_patterns)
            
            logger.info(f"Extracted patterns across {len(sessions)} sessions: {len(all_patterns['ui_patterns'])} UI patterns, {len(all_patterns['action_patterns'])} action patterns, {len(all_patterns['workflow_patterns'])} workflow patterns")
            
            return all_patterns
            
        except Exception as e:
            logger.error(f"Error extracting patterns from multiple sessions: {e}")
            return {"ui_patterns": [], "action_patterns": [], "workflow_patterns": []}
    
    def _extract_ui_patterns(self, session: DemonstrationSession) -> List[UIPattern]:
        """Extract UI patterns from screen states."""
        try:
            ui_patterns = []
            
            if not session.screen_states:
                return ui_patterns
            
            # Group UI elements by type and spatial location
            element_groups = self._group_ui_elements(session.screen_states)
            
            # Detect patterns in each group
            for element_type, elements in element_groups.items():
                if len(elements) >= self.min_pattern_frequency:
                    pattern = self._create_ui_pattern(element_type, elements, session.session_id)
                    if pattern and pattern.confidence >= self.min_confidence:
                        ui_patterns.append(pattern)
            
            return ui_patterns
            
        except Exception as e:
            logger.error(f"Error extracting UI patterns: {e}")
            return []
    
    def _extract_action_patterns(self, session: DemonstrationSession) -> List[ActionPattern]:
        """Extract action patterns from recorded actions."""
        try:
            action_patterns = []
            
            if not session.actions:
                return action_patterns
            
            # Group actions by type and context
            action_groups = self._group_actions(session.actions)
            
            # Detect patterns in each group
            for action_type, actions in action_groups.items():
                if len(actions) >= self.min_pattern_frequency:
                    pattern = self._create_action_pattern(action_type, actions, session.session_id)
                    if pattern and pattern.confidence >= self.min_confidence:
                        action_patterns.append(pattern)
            
            return action_patterns
            
        except Exception as e:
            logger.error(f"Error extracting action patterns: {e}")
            return []
    
    def _extract_workflow_patterns(self, session: DemonstrationSession, 
                                 ui_patterns: List[UIPattern], 
                                 action_patterns: List[ActionPattern]) -> List[WorkflowPattern]:
        """Extract complete workflow patterns."""
        try:
            workflow_patterns = []
            
            # Create workflow pattern from session
            workflow = WorkflowPattern(
                pattern_id=f"workflow_{session.session_id}",
                name=session.name,
                description=session.description,
                ui_patterns=ui_patterns,
                action_patterns=action_patterns,
                estimated_duration=session.skill_pattern.get("estimated_duration", 30) if session.skill_pattern else 30,
                confidence=self._calculate_workflow_confidence(ui_patterns, action_patterns),
                complexity_score=self._calculate_complexity_score(session),
                examples=[session.session_id]
            )
            
            workflow_patterns.append(workflow)
            
            return workflow_patterns
            
        except Exception as e:
            logger.error(f"Error extracting workflow patterns: {e}")
            return []
    
    def _group_ui_elements(self, screen_states: List[ScreenState]) -> Dict[str, List[Dict[str, Any]]]:
        """Group UI elements by type and spatial location."""
        try:
            element_groups = {}
            
            for screen_state in screen_states:
                if not screen_state.ui_elements:
                    continue
                
                for element in screen_state.ui_elements:
                    element_type = element.get("type", "unknown")
                    
                    if element_type not in element_groups:
                        element_groups[element_type] = []
                    
                    # Add spatial information
                    element_with_context = {
                        **element,
                        "timestamp": screen_state.timestamp,
                        "screenshot_path": screen_state.screenshot_path,
                        "mouse_position": screen_state.mouse_position
                    }
                    
                    element_groups[element_type].append(element_with_context)
            
            return element_groups
            
        except Exception as e:
            logger.error(f"Error grouping UI elements: {e}")
            return {}
    
    def _group_actions(self, actions: List[ActionEvent]) -> Dict[str, List[ActionEvent]]:
        """Group actions by type and context."""
        try:
            action_groups = {}
            
            for action in actions:
                action_type = action.action_type
                
                if action_type not in action_groups:
                    action_groups[action_type] = []
                
                action_groups[action_type].append(action)
            
            return action_groups
            
        except Exception as e:
            logger.error(f"Error grouping actions: {e}")
            return {}
    
    def _create_ui_pattern(self, element_type: str, elements: List[Dict[str, Any]], session_id: str) -> Optional[UIPattern]:
        """Create a UI pattern from grouped elements."""
        try:
            if len(elements) < 2:
                return None
            
            # Analyze spatial relationships
            spatial_relationships = self._analyze_spatial_relationships(elements)
            
            # Analyze temporal relationships
            temporal_relationships = self._analyze_temporal_relationships(elements)
            
            # Calculate confidence based on consistency
            confidence = self._calculate_ui_pattern_confidence(elements, spatial_relationships, temporal_relationships)
            
            pattern = UIPattern(
                pattern_id=f"ui_{element_type}_{int(time.time())}",
                pattern_type=element_type,
                confidence=confidence,
                ui_elements=elements,
                spatial_relationships=spatial_relationships,
                temporal_relationships=temporal_relationships,
                frequency=len(elements),
                examples=[session_id]
            )
            
            return pattern
            
        except Exception as e:
            logger.error(f"Error creating UI pattern: {e}")
            return None
    
    def _create_action_pattern(self, action_type: str, actions: List[ActionEvent], session_id: str) -> Optional[ActionPattern]:
        """Create an action pattern from grouped actions."""
        try:
            if len(actions) < 2:
                return None
            
            # Analyze action sequence
            action_sequence = self._analyze_action_sequence(actions)
            
            # Analyze context
            context = self._analyze_action_context(actions)
            
            # Calculate confidence
            confidence = self._calculate_action_pattern_confidence(actions, action_sequence)
            
            pattern = ActionPattern(
                pattern_id=f"action_{action_type}_{int(time.time())}",
                action_sequence=action_sequence,
                frequency=len(actions),
                confidence=confidence,
                context=context,
                examples=[session_id]
            )
            
            return pattern
            
        except Exception as e:
            logger.error(f"Error creating action pattern: {e}")
            return None
    
    def _analyze_spatial_relationships(self, elements: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze spatial relationships between UI elements."""
        try:
            relationships = {
                "relative_positions": [],
                "clustering": {},
                "alignment": {}
            }
            
            # Extract coordinates
            coordinates = []
            for element in elements:
                if "bbox" in element:
                    bbox = element["bbox"]
                    center_x = (bbox[0] + bbox[2]) / 2
                    center_y = (bbox[1] + bbox[3]) / 2
                    coordinates.append([center_x, center_y])
            
            if len(coordinates) < 2:
                return relationships
            
            # Cluster coordinates to find spatial patterns
            coordinates_array = np.array(coordinates)
            clustering = DBSCAN(eps=self.spatial_clustering_eps, min_samples=2).fit(coordinates_array)
            
            # Analyze relative positions
            for i, coord1 in enumerate(coordinates):
                for j, coord2 in enumerate(coordinates[i+1:], i+1):
                    distance = np.linalg.norm(np.array(coord1) - np.array(coord2))
                    angle = np.arctan2(coord2[1] - coord1[1], coord2[0] - coord1[0])
                    
                    relationships["relative_positions"].append({
                        "element1": i,
                        "element2": j,
                        "distance": distance,
                        "angle": angle
                    })
            
            # Store clustering results
            relationships["clustering"] = {
                "labels": clustering.labels_.tolist(),
                "n_clusters": len(set(clustering.labels_)) - (1 if -1 in clustering.labels_ else 0)
            }
            
            return relationships
            
        except Exception as e:
            logger.error(f"Error analyzing spatial relationships: {e}")
            return {}
    
    def _analyze_temporal_relationships(self, elements: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze temporal relationships between UI elements."""
        try:
            relationships = {
                "timing_patterns": [],
                "frequency": {},
                "sequence": []
            }
            
            # Extract timestamps
            timestamps = [element.get("timestamp", 0) for element in elements]
            timestamps.sort()
            
            if len(timestamps) < 2:
                return relationships
            
            # Analyze timing patterns
            intervals = []
            for i in range(1, len(timestamps)):
                interval = timestamps[i] - timestamps[i-1]
                intervals.append(interval)
            
            relationships["timing_patterns"] = {
                "min_interval": min(intervals) if intervals else 0,
                "max_interval": max(intervals) if intervals else 0,
                "avg_interval": sum(intervals) / len(intervals) if intervals else 0,
                "intervals": intervals
            }
            
            # Analyze frequency
            time_bins = {}
            for timestamp in timestamps:
                bin_key = int(timestamp / 10) * 10  # 10-second bins
                time_bins[bin_key] = time_bins.get(bin_key, 0) + 1
            
            relationships["frequency"] = time_bins
            
            # Analyze sequence
            relationships["sequence"] = timestamps
            
            return relationships
            
        except Exception as e:
            logger.error(f"Error analyzing temporal relationships: {e}")
            return {}
    
    def _analyze_action_sequence(self, actions: List[ActionEvent]) -> List[Dict[str, Any]]:
        """Analyze the sequence of actions."""
        try:
            sequence = []
            
            for action in actions:
                step = {
                    "action_type": action.action_type,
                    "target_element": action.target_element,
                    "coordinates": action.coordinates,
                    "action_data": action.action_data,
                    "timestamp": action.timestamp
                }
                sequence.append(step)
            
            return sequence
            
        except Exception as e:
            logger.error(f"Error analyzing action sequence: {e}")
            return []
    
    def _analyze_action_context(self, actions: List[ActionEvent]) -> Dict[str, Any]:
        """Analyze the context of actions."""
        try:
            context = {
                "target_elements": {},
                "coordinate_ranges": {},
                "action_types": {}
            }
            
            # Analyze target elements
            for action in actions:
                if action.target_element:
                    context["target_elements"][action.target_element] = context["target_elements"].get(action.target_element, 0) + 1
            
            # Analyze coordinate ranges
            coordinates = [action.coordinates for action in actions if action.coordinates]
            if coordinates:
                x_coords = [coord[0] for coord in coordinates]
                y_coords = [coord[1] for coord in coordinates]
                
                context["coordinate_ranges"] = {
                    "x_min": min(x_coords),
                    "x_max": max(x_coords),
                    "y_min": min(y_coords),
                    "y_max": max(y_coords)
                }
            
            # Analyze action types
            for action in actions:
                action_type = action.action_type
                context["action_types"][action_type] = context["action_types"].get(action_type, 0) + 1
            
            return context
            
        except Exception as e:
            logger.error(f"Error analyzing action context: {e}")
            return {}
    
    def _calculate_ui_pattern_confidence(self, elements: List[Dict[str, Any]], 
                                       spatial_relationships: Dict[str, Any], 
                                       temporal_relationships: Dict[str, Any]) -> float:
        """Calculate confidence score for a UI pattern."""
        try:
            confidence = 0.0
            
            # Base confidence from frequency
            frequency_score = min(len(elements) / 5.0, 1.0)  # Normalize to 0-1
            confidence += frequency_score * 0.4
            
            # Spatial consistency
            if spatial_relationships.get("clustering", {}).get("n_clusters", 0) > 0:
                spatial_score = 1.0 - (spatial_relationships["clustering"]["n_clusters"] / len(elements))
                confidence += spatial_score * 0.3
            
            # Temporal consistency
            if temporal_relationships.get("timing_patterns", {}).get("intervals"):
                intervals = temporal_relationships["timing_patterns"]["intervals"]
                if len(intervals) > 1:
                    # Calculate coefficient of variation (lower is more consistent)
                    mean_interval = sum(intervals) / len(intervals)
                    variance = sum((x - mean_interval) ** 2 for x in intervals) / len(intervals)
                    cv = (variance ** 0.5) / mean_interval if mean_interval > 0 else 0
                    temporal_score = max(0, 1 - cv)
                    confidence += temporal_score * 0.3
            
            return min(confidence, 1.0)
            
        except Exception as e:
            logger.error(f"Error calculating UI pattern confidence: {e}")
            return 0.5
    
    def _calculate_action_pattern_confidence(self, actions: List[ActionEvent], 
                                          action_sequence: List[Dict[str, Any]]) -> float:
        """Calculate confidence score for an action pattern."""
        try:
            confidence = 0.0
            
            # Base confidence from frequency
            frequency_score = min(len(actions) / 3.0, 1.0)  # Normalize to 0-1
            confidence += frequency_score * 0.5
            
            # Sequence consistency
            if len(action_sequence) > 1:
                # Check if actions follow similar patterns
                action_types = [step["action_type"] for step in action_sequence]
                unique_types = set(action_types)
                sequence_score = len(unique_types) / len(action_types)  # More variety = higher score
                confidence += sequence_score * 0.5
            
            return min(confidence, 1.0)
            
        except Exception as e:
            logger.error(f"Error calculating action pattern confidence: {e}")
            return 0.5
    
    def _calculate_workflow_confidence(self, ui_patterns: List[UIPattern], 
                                     action_patterns: List[ActionPattern]) -> float:
        """Calculate confidence score for a workflow pattern."""
        try:
            if not ui_patterns and not action_patterns:
                return 0.0
            
            # Weighted average of pattern confidences
            total_confidence = 0.0
            total_weight = 0.0
            
            for pattern in ui_patterns:
                total_confidence += pattern.confidence * 0.6  # UI patterns weighted higher
                total_weight += 0.6
            
            for pattern in action_patterns:
                total_confidence += pattern.confidence * 0.4
                total_weight += 0.4
            
            return total_confidence / total_weight if total_weight > 0 else 0.0
            
        except Exception as e:
            logger.error(f"Error calculating workflow confidence: {e}")
            return 0.5
    
    def _calculate_complexity_score(self, session: DemonstrationSession) -> float:
        """Calculate complexity score for a session."""
        try:
            complexity = 0.0
            
            # Number of actions
            action_complexity = min(len(session.actions) / 20.0, 1.0)
            complexity += action_complexity * 0.4
            
            # Number of screen states
            screen_complexity = min(len(session.screen_states) / 50.0, 1.0)
            complexity += screen_complexity * 0.3
            
            # Duration complexity
            if session.skill_pattern and session.skill_pattern.get("estimated_duration"):
                duration = session.skill_pattern["estimated_duration"]
                duration_complexity = min(duration / 300.0, 1.0)  # Normalize to 5 minutes
                complexity += duration_complexity * 0.3
            
            return min(complexity, 1.0)
            
        except Exception as e:
            logger.error(f"Error calculating complexity score: {e}")
            return 0.5
    
    def _merge_ui_patterns(self, session_patterns: List[Dict[str, Any]]) -> List[UIPattern]:
        """Merge UI patterns across multiple sessions."""
        # This would implement pattern merging logic
        # For now, return empty list
        return []
    
    def _merge_action_patterns(self, session_patterns: List[Dict[str, Any]]) -> List[ActionPattern]:
        """Merge action patterns across multiple sessions."""
        # This would implement pattern merging logic
        # For now, return empty list
        return []
    
    def _merge_workflow_patterns(self, session_patterns: List[Dict[str, Any]]) -> List[WorkflowPattern]:
        """Merge workflow patterns across multiple sessions."""
        # This would implement pattern merging logic
        # For now, return empty list
        return []
