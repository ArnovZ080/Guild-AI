"""
Tango-Style Learning System

This module orchestrates the complete learning system that allows the AI workforce
to learn new visual skills by watching user demonstrations.
"""

import logging
import time
from typing import Dict, List, Any, Optional
from pathlib import Path

from guild.src.core.learning.session_recorder import SessionRecorder, DemonstrationSession
from guild.src.core.learning.pattern_extractor import PatternExtractor
from guild.src.core.learning.skill_generator import SkillGenerator

logger = logging.getLogger(__name__)

class TangoLearningSystem:
    """Main learning system for Tango-style automation."""
    
    def __init__(self, workflow_builder=None, output_dir: str = "learning_output"):
        self.workflow_builder = workflow_builder
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        
        # Initialize components
        self.session_recorder = SessionRecorder(output_dir=str(self.output_dir / "sessions"))
        self.pattern_extractor = PatternExtractor()
        
        # Initialize skill generator only if workflow builder is available
        if workflow_builder:
            try:
                self.skill_generator = SkillGenerator(workflow_builder)
            except Exception as e:
                logger.warning(f"Failed to initialize SkillGenerator: {e}")
                self.skill_generator = None
        else:
            self.skill_generator = None
        
        # Learning state
        self.is_learning = False
        self.current_learning_session: Optional[str] = None
        self.learned_skills: List[Dict[str, Any]] = []
        
        logger.info("TangoLearningSystem initialized successfully")
    
    def set_workflow_builder(self, workflow_builder):
        """Set the workflow builder after initialization to break circular imports."""
        self.workflow_builder = workflow_builder
        if workflow_builder and not self.skill_generator:
            try:
                self.skill_generator = SkillGenerator(workflow_builder)
                logger.info("SkillGenerator initialized with workflow builder")
            except Exception as e:
                logger.warning(f"Failed to initialize SkillGenerator: {e}")
    
    def start_learning_session(self, session_name: str, description: str = "") -> str:
        """Start a new learning session to record user demonstrations."""
        try:
            if self.is_learning:
                raise RuntimeError("Already in a learning session")
            
            # Start recording
            session_id = self.session_recorder.start_recording(session_name, description)
            
            self.is_learning = True
            self.current_learning_session = session_id
            
            logger.info(f"Started learning session: {session_name} (ID: {session_id})")
            return session_id
            
        except Exception as e:
            logger.error(f"Error starting learning session: {e}")
            raise
    
    def stop_learning_session(self) -> Optional[Dict[str, Any]]:
        """Stop the current learning session and process the results."""
        try:
            if not self.is_learning:
                return None
            
            # Stop recording
            session = self.session_recorder.stop_recording()
            if not session:
                logger.warning("No session was recorded")
                return None
            
            # Process the session
            learning_results = self._process_learning_session(session)
            
            # Update state
            self.is_learning = False
            self.current_learning_session = None
            
            logger.info(f"Completed learning session: {session.name}")
            return learning_results
            
        except Exception as e:
            logger.error(f"Error stopping learning session: {e}")
            self.is_learning = False
            self.current_learning_session = None
            return None
    
    def _process_learning_session(self, session: DemonstrationSession) -> Dict[str, Any]:
        """Process a completed learning session to extract patterns and generate skills."""
        try:
            logger.info(f"Processing learning session: {session.session_id}")
            
            # Extract patterns from the session
            patterns = self.pattern_extractor.extract_patterns_from_session(session)
            
            # Generate new skills from patterns (only if skill generator is available)
            generated_skills = []
            if self.skill_generator:
                generated_skills = self.skill_generator.generate_skills_from_patterns(patterns)
            
            # Enhance existing skills with learned patterns (only if skill generator is available)
            enhanced_skills = []
            if self.skill_generator:
                enhanced_skills = self.skill_generator.enhance_existing_skills(patterns)
            
            # Compile results
            results = {
                "session_id": session.session_id,
                "session_name": session.name,
                "patterns_extracted": patterns,
                "generated_skills": generated_skills,
                "enhanced_skills": enhanced_skills,
                "total_actions": len(session.actions) if session.actions else 0,
                "total_screenshots": len(session.screen_states) if session.screen_states else 0
            }
            
            # Store learned skills
            if generated_skills:
                self.learned_skills.extend([skill.__dict__ for skill in generated_skills])
            
            logger.info(f"Processed learning session with {len(generated_skills)} new skills")
            return results
            
        except Exception as e:
            logger.error(f"Error processing learning session: {e}")
            return {
                "session_id": session.session_id,
                "error": str(e),
                "generated_skills": [],
                "enhanced_skills": []
            }
    
    def get_learned_skills(self) -> List[Dict[str, Any]]:
        """Get all skills learned by the system."""
        return self.learned_skills.copy()
    
    def get_learning_status(self) -> Dict[str, Any]:
        """Get current learning system status."""
        return {
            "is_learning": self.is_learning,
            "current_session": self.current_learning_session,
            "total_skills_learned": len(self.learned_skills),
            "session_recorder_status": self.session_recorder.is_recording_active(),
            "skill_generator_available": self.skill_generator is not None
        }
    
    def clear_learned_skills(self):
        """Clear all learned skills (for testing/reset purposes)."""
        self.learned_skills.clear()
        logger.info("Cleared all learned skills")
