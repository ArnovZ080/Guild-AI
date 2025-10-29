"""
Learning Module for Tango-Style Automation

This module provides the complete learning system that allows the AI workforce
to learn new visual skills by watching user demonstrations.
"""

from .session_recorder import SessionRecorder, DemonstrationSession, ActionEvent, ScreenState
from .pattern_extractor import PatternExtractor, UIPattern, ActionPattern, WorkflowPattern
from .skill_generator import SkillGenerator, GeneratedSkill
from .learning_system import TangoLearningSystem

__all__ = [
    # Session recording
    "SessionRecorder",
    "DemonstrationSession", 
    "ActionEvent",
    "ScreenState",
    
    # Pattern extraction
    "PatternExtractor",
    "UIPattern",
    "ActionPattern", 
    "WorkflowPattern",
    
    # Skill generation
    "SkillGenerator",
    "GeneratedSkill",
    
    # Main learning system
    "TangoLearningSystem"
]
