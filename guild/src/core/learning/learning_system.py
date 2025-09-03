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
from guild.src.core.workflow_builder.workflow_builder import VisualWorkflowBuilder

logger = logging.getLogger(__name__)

class TangoLearningSystem:
    """Main learning system for Tango-style automation."""
    
    def __init__(self, workflow_builder: VisualWorkflowBuilder, output_dir: str = "learning_output"):
        self.workflow_builder = workflow_builder
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        
        # Initialize components
        self.session_recorder = SessionRecorder(output_dir=str(self.output_dir / "sessions"))
        self.pattern_extractor = PatternExtractor()
        self.skill_generator = SkillGenerator(workflow_builder)
        
        # Learning state
        self.is_learning = False
        self.current_learning_session: Optional[str] = None
        self.learned_skills: List[Dict[str, Any]] = []
        
        logger.info("TangoLearningSystem initialized successfully")
    
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
            
            # Generate new skills from patterns
            generated_skills = self.skill_generator.generate_skills_from_patterns(patterns)
            
            # Enhance existing skills with learned patterns
            enhanced_skills = self.skill_generator.enhance_existing_skills(patterns)
            
            # Create learning results
            learning_results = {
                "session_id": session.session_id,
                "session_name": session.name,
                "session_description": session.description,
                "patterns_extracted": {
                    "ui_patterns": len(patterns.get("ui_patterns", [])),
                    "action_patterns": len(patterns.get("action_patterns", [])),
                    "workflow_patterns": len(patterns.get("workflow_patterns", []))
                },
                "skills_generated": len(generated_skills),
                "skills_enhanced": len(enhanced_skills),
                "generated_skills": [self._skill_to_dict(skill) for skill in generated_skills],
                "enhanced_skills": enhanced_skills,
                "session_metadata": {
                    "duration": (session.end_time - session.start_time).total_seconds() if session.end_time else 0,
                    "total_actions": len(session.actions),
                    "total_screenshots": len(session.screen_states),
                    "skill_pattern": session.skill_pattern
                }
            }
            
            # Store learned skills
            self.learned_skills.extend(learning_results["generated_skills"])
            
            # Save learning results
            self._save_learning_results(session.session_id, learning_results)
            
            logger.info(f"Processed learning session: {len(generated_skills)} skills generated, {len(enhanced_skills)} skills enhanced")
            
            return learning_results
            
        except Exception as e:
            logger.error(f"Error processing learning session: {e}")
            return {
                "session_id": session.session_id,
                "error": str(e),
                "patterns_extracted": {},
                "skills_generated": 0,
                "skills_enhanced": 0
            }
    
    def _skill_to_dict(self, skill) -> Dict[str, Any]:
        """Convert a GeneratedSkill to a dictionary."""
        try:
            return {
                "skill_id": skill.skill_id,
                "name": skill.name,
                "description": skill.description,
                "skill_type": skill.skill_type,
                "confidence": skill.confidence,
                "validation_score": skill.validation_score,
                "estimated_duration": skill.estimated_duration,
                "complexity_score": skill.complexity_score,
                "tags": skill.tags,
                "created_at": skill.created_at,
                "examples": skill.examples
            }
        except Exception as e:
            logger.error(f"Error converting skill to dict: {e}")
            return {}
    
    def get_learning_status(self) -> Dict[str, Any]:
        """Get the current status of the learning system."""
        return {
            "is_learning": self.is_learning,
            "current_session": self.current_learning_session,
            "total_skills_learned": len(self.learned_skills),
            "session_summary": self.session_recorder.get_session_summary() if self.is_learning else {}
        }
    
    def list_learning_sessions(self) -> List[Dict[str, Any]]:
        """List all recorded learning sessions."""
        return self.session_recorder.list_recorded_sessions()
    
    def get_learning_session(self, session_id: str) -> Optional[DemonstrationSession]:
        """Get a specific learning session by ID."""
        return self.session_recorder.load_session(session_id)
    
    def get_learned_skills(self) -> List[Dict[str, Any]]:
        """Get all skills learned by the system."""
        return self.learned_skills
    
    def get_skill_by_id(self, skill_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific learned skill by ID."""
        for skill in self.learned_skills:
            if skill.get("skill_id") == skill_id:
                return skill
        return None
    
    def apply_learned_skills_to_workflow(self, workflow_id: str, skill_ids: List[str]) -> bool:
        """Apply learned skills to an existing workflow."""
        try:
            workflow = self.workflow_builder.get_workflow(workflow_id)
            if not workflow:
                logger.error(f"Workflow {workflow_id} not found")
                return False
            
            # Get the skills to apply
            skills_to_apply = []
            for skill_id in skill_ids:
                skill = self.get_skill_by_id(skill_id)
                if skill:
                    skills_to_apply.append(skill)
            
            if not skills_to_apply:
                logger.warning("No valid skills to apply")
                return False
            
            # Apply each skill to the workflow
            for skill in skills_to_apply:
                success = self._apply_skill_to_workflow(workflow_id, skill)
                if not success:
                    logger.warning(f"Failed to apply skill {skill['skill_id']} to workflow")
            
            logger.info(f"Applied {len(skills_to_apply)} skills to workflow {workflow_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error applying learned skills to workflow: {e}")
            return False
    
    def _apply_skill_to_workflow(self, workflow_id: str, skill: Dict[str, Any]) -> bool:
        """Apply a single learned skill to a workflow."""
        try:
            # This would implement the logic to apply a skill to a workflow
            # For now, return True as placeholder
            logger.debug(f"Applying skill {skill['skill_id']} to workflow {workflow_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error applying skill to workflow: {e}")
            return False
    
    def create_workflow_from_learned_skills(self, skill_ids: List[str], workflow_name: str, description: str = "") -> Optional[str]:
        """Create a new workflow using learned skills."""
        try:
            # Get the skills to use
            skills_to_use = []
            for skill_id in skill_ids:
                skill = self.get_skill_by_id(skill_id)
                if skill:
                    skills_to_use.append(skill)
            
            if not skills_to_use:
                logger.warning("No valid skills to create workflow from")
                return None
            
            # Create new workflow
            workflow_id = self.workflow_builder.create_workflow(workflow_name, description)
            if not workflow_id:
                logger.error("Failed to create workflow")
                return None
            
            # Add skills as nodes to the workflow
            for skill in skills_to_use:
                # Convert skill to workflow node
                node_id = self._add_skill_as_workflow_node(workflow_id, skill)
                if not node_id:
                    logger.warning(f"Failed to add skill {skill['skill_id']} as workflow node")
            
            logger.info(f"Created workflow {workflow_id} from {len(skills_to_use)} learned skills")
            return workflow_id
            
        except Exception as e:
            logger.error(f"Error creating workflow from learned skills: {e}")
            return None
    
    def _add_skill_as_workflow_node(self, workflow_id: str, skill: Dict[str, Any]) -> Optional[str]:
        """Add a learned skill as a node to a workflow."""
        try:
            # This would implement the logic to add a skill as a workflow node
            # For now, return a placeholder node ID
            logger.debug(f"Adding skill {skill['skill_id']} as node to workflow {workflow_id}")
            return f"node_{skill['skill_id']}"
            
        except Exception as e:
            logger.error(f"Error adding skill as workflow node: {e}")
            return None
    
    def export_learned_skills(self, filepath: str = None):
        """Export all learned skills to a file."""
        try:
            if not filepath:
                filepath = self.output_dir / f"learned_skills_{int(time.time())}.json"
            
            self.skill_generator.save_skills_to_file(str(filepath))
            logger.info(f"Exported {len(self.learned_skills)} learned skills to {filepath}")
            
        except Exception as e:
            logger.error(f"Error exporting learned skills: {e}")
    
    def import_learned_skills(self, filepath: str):
        """Import learned skills from a file."""
        try:
            self.skill_generator.load_skills_from_file(filepath)
            
            # Update learned skills list
            imported_skills = self.skill_generator.get_generated_skills()
            self.learned_skills = [self._skill_to_dict(skill) for skill in imported_skills]
            
            logger.info(f"Imported {len(imported_skills)} learned skills from {filepath}")
            
        except Exception as e:
            logger.error(f"Error importing learned skills: {e}")
    
    def get_learning_statistics(self) -> Dict[str, Any]:
        """Get comprehensive statistics about the learning system."""
        try:
            # Get session statistics
            sessions = self.list_learning_sessions()
            total_sessions = len(sessions)
            total_duration = sum(session.get("duration", 0) for session in sessions)
            total_actions = sum(session.get("total_actions", 0) for session in sessions)
            
            # Get skill statistics
            total_skills = len(self.learned_skills)
            skill_types = {}
            for skill in self.learned_skills:
                skill_type = skill.get("skill_type", "unknown")
                skill_types[skill_type] = skill_types.get(skill_type, 0) + 1
            
            # Calculate average confidence
            if total_skills > 0:
                avg_confidence = sum(skill.get("confidence", 0) for skill in self.learned_skills) / total_skills
                avg_complexity = sum(skill.get("complexity_score", 0) for skill in self.learned_skills) / total_skills
            else:
                avg_confidence = 0
                avg_complexity = 0
            
            statistics = {
                "total_learning_sessions": total_sessions,
                "total_session_duration": total_duration,
                "total_actions_recorded": total_actions,
                "total_skills_learned": total_skills,
                "skill_type_distribution": skill_types,
                "average_skill_confidence": avg_confidence,
                "average_skill_complexity": avg_complexity,
                "learning_system_status": "active" if not self.is_learning else "learning",
                "current_session": self.current_learning_session
            }
            
            return statistics
            
        except Exception as e:
            logger.error(f"Error getting learning statistics: {e}")
            return {}
    
    def _save_learning_results(self, session_id: str, results: Dict[str, Any]):
        """Save learning results to disk."""
        try:
            results_file = self.output_dir / "sessions" / session_id / "learning_results.json"
            results_file.parent.mkdir(exist_ok=True)
            
            with open(results_file, 'w') as f:
                import json
                json.dump(results, f, indent=2, default=str)
            
            logger.debug(f"Saved learning results to {results_file}")
            
        except Exception as e:
            logger.error(f"Error saving learning results: {e}")
    
    def cleanup_old_sessions(self, max_age_days: int = 30):
        """Clean up old learning sessions to free up disk space."""
        try:
            import datetime
            
            cutoff_date = datetime.datetime.now() - datetime.timedelta(days=max_age_days)
            sessions_to_remove = []
            
            for session in self.list_learning_sessions():
                session_date = datetime.datetime.fromisoformat(session["start_time"])
                if session_date < cutoff_date:
                    sessions_to_remove.append(session["session_id"])
            
            # Remove old sessions
            for session_id in sessions_to_remove:
                session_dir = self.output_dir / "sessions" / session_id
                if session_dir.exists():
                    import shutil
                    shutil.rmtree(session_dir)
                    logger.info(f"Removed old session: {session_id}")
            
            logger.info(f"Cleaned up {len(sessions_to_remove)} old learning sessions")
            
        except Exception as e:
            logger.error(f"Error cleaning up old sessions: {e}")
    
    def get_recommended_skills(self, context: str = "", max_skills: int = 5) -> List[Dict[str, Any]]:
        """Get skill recommendations based on context and usage patterns."""
        try:
            # Simple recommendation algorithm based on confidence and complexity
            recommended_skills = sorted(
                self.learned_skills,
                key=lambda x: (x.get("confidence", 0), -x.get("complexity_score", 0)),
                reverse=True
            )
            
            # Filter by context if provided
            if context:
                context_lower = context.lower()
                filtered_skills = []
                for skill in recommended_skills:
                    skill_name = skill.get("name", "").lower()
                    skill_description = skill.get("description", "").lower()
                    skill_tags = [tag.lower() for tag in skill.get("tags", [])]
                    
                    if (context_lower in skill_name or 
                        context_lower in skill_description or 
                        any(context_lower in tag for tag in skill_tags)):
                        filtered_skills.append(skill)
                
                recommended_skills = filtered_skills
            
            return recommended_skills[:max_skills]
            
        except Exception as e:
            logger.error(f"Error getting skill recommendations: {e}")
            return []
    
    def validate_learned_skills(self) -> Dict[str, Any]:
        """Validate all learned skills for quality and consistency."""
        try:
            validation_results = {
                "total_skills": len(self.learned_skills),
                "valid_skills": 0,
                "invalid_skills": 0,
                "validation_errors": [],
                "quality_metrics": {
                    "high_confidence": 0,  # confidence > 0.8
                    "medium_confidence": 0,  # confidence 0.6-0.8
                    "low_confidence": 0,    # confidence < 0.6
                    "simple_complexity": 0,  # complexity < 0.3
                    "medium_complexity": 0,  # complexity 0.3-0.7
                    "high_complexity": 0    # complexity > 0.7
                }
            }
            
            for skill in self.learned_skills:
                try:
                    # Basic validation
                    if self._validate_skill_quality(skill):
                        validation_results["valid_skills"] += 1
                        
                        # Categorize by confidence
                        confidence = skill.get("confidence", 0)
                        if confidence > 0.8:
                            validation_results["quality_metrics"]["high_confidence"] += 1
                        elif confidence > 0.6:
                            validation_results["quality_metrics"]["medium_confidence"] += 1
                        else:
                            validation_results["quality_metrics"]["low_confidence"] += 1
                        
                        # Categorize by complexity
                        complexity = skill.get("complexity_score", 0)
                        if complexity < 0.3:
                            validation_results["quality_metrics"]["simple_complexity"] += 1
                        elif complexity < 0.7:
                            validation_results["quality_metrics"]["medium_complexity"] += 1
                        else:
                            validation_results["quality_metrics"]["high_complexity"] += 1
                        
                    else:
                        validation_results["invalid_skills"] += 1
                        validation_results["validation_errors"].append({
                            "skill_id": skill.get("skill_id"),
                            "error": "Failed quality validation"
                        })
                        
                except Exception as e:
                    validation_results["invalid_skills"] += 1
                    validation_results["validation_errors"].append({
                        "skill_id": skill.get("skill_id", "unknown"),
                        "error": str(e)
                    })
            
            logger.info(f"Validated {validation_results['total_skills']} skills: {validation_results['valid_skills']} valid, {validation_results['invalid_skills']} invalid")
            return validation_results
            
        except Exception as e:
            logger.error(f"Error validating learned skills: {e}")
            return {"error": str(e)}
    
    def _validate_skill_quality(self, skill: Dict[str, Any]) -> bool:
        """Validate the quality of a single skill."""
        try:
            # Check required fields
            required_fields = ["skill_id", "name", "description", "confidence", "complexity_score"]
            for field in required_fields:
                if field not in skill:
                    return False
            
            # Check confidence threshold
            if skill.get("confidence", 0) < 0.5:
                return False
            
            # Check complexity threshold
            if skill.get("complexity_score", 0) > 0.9:
                return False
            
            # Check name and description quality
            if len(skill.get("name", "")) < 3:
                return False
            
            if len(skill.get("description", "")) < 10:
                return False
            
            return True
            
        except Exception as e:
            logger.error(f"Error validating skill quality: {e}")
            return False
