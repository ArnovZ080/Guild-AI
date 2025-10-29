"""
Skill Generator for Tango-Style Learning

This module generates new visual skill templates from learned patterns,
enhances existing skills, and validates generated skills.
"""

import logging
import json
import time
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from pathlib import Path

from guild.src.core.learning.pattern_extractor import UIPattern, ActionPattern, WorkflowPattern
from guild.src.core.learning.session_recorder import DemonstrationSession


logger = logging.getLogger(__name__)

@dataclass
class GeneratedSkill:
    """Represents a generated visual skill template."""
    skill_id: str
    name: str
    description: str
    skill_type: str  # 'visual_skill', 'workflow', 'enhancement'
    confidence: float
    source_patterns: List[str]  # IDs of patterns used to generate this skill
    skill_template: Dict[str, Any]
    validation_score: float
    estimated_duration: int
    complexity_score: float
    tags: List[str]
    created_at: str
    examples: List[str]  # Session IDs that demonstrate this skill

class SkillGenerator:
    """Generates new visual skill templates from learned patterns."""
    
    def __init__(self, workflow_builder=None):
        self.workflow_builder = workflow_builder
        
        # Generation settings
        self.min_confidence_threshold = 0.7
        self.min_validation_score = 0.6
        self.max_skill_complexity = 0.8
        
        # Skill templates database
        self.generated_skills: List[GeneratedSkill] = []
        self.skill_templates: Dict[str, Dict[str, Any]] = {}
        
        logger.info("SkillGenerator initialized successfully")
    
    def set_workflow_builder(self, workflow_builder):
        """Set the workflow builder after initialization to break circular imports."""
        self.workflow_builder = workflow_builder
        logger.info("Workflow builder set for SkillGenerator")
    
    def generate_skills_from_patterns(self, patterns: Dict[str, Any]) -> List[GeneratedSkill]:
        """Generate new skills from extracted patterns."""
        try:
            generated_skills = []
            
            # Generate skills from UI patterns
            ui_skills = self._generate_ui_skills(patterns.get("ui_patterns", []))
            generated_skills.extend(ui_skills)
            
            # Generate skills from action patterns
            action_skills = self._generate_action_skills(patterns.get("action_patterns", []))
            generated_skills.extend(action_skills)
            
            # Generate skills from workflow patterns
            workflow_skills = self._generate_workflow_skills(patterns.get("workflow_patterns", []))
            generated_skills.extend(workflow_skills)
            
            # Generate composite skills from multiple patterns
            composite_skills = self._generate_composite_skills(patterns)
            generated_skills.extend(composite_skills)
            
            # Validate and filter skills
            validated_skills = self._validate_generated_skills(generated_skills)
            
            # Store generated skills
            self.generated_skills.extend(validated_skills)
            
            logger.info(f"Generated {len(validated_skills)} new skills from patterns")
            return validated_skills
            
        except Exception as e:
            logger.error(f"Error generating skills from patterns: {e}")
            return []
    
    def enhance_existing_skills(self, patterns: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Enhance existing skills with learned patterns."""
        try:
            enhancements = []
            
            # Get existing skill templates
            existing_templates = self.workflow_builder.get_available_templates()
            visual_skills = existing_templates.get("Visual Skills", [])
            
            for skill in visual_skills:
                enhancement = self._enhance_skill_with_patterns(skill, patterns)
                if enhancement:
                    enhancements.append(enhancement)
            
            logger.info(f"Enhanced {len(enhancements)} existing skills with patterns")
            return enhancements
            
        except Exception as e:
            logger.error(f"Error enhancing existing skills: {e}")
            return []
    
    def _generate_ui_skills(self, ui_patterns: List[UIPattern]) -> List[GeneratedSkill]:
        """Generate skills from UI patterns."""
        try:
            skills = []
            
            for pattern in ui_patterns:
                if pattern.confidence < self.min_confidence_threshold:
                    continue
                
                # Generate skill based on pattern type
                if pattern.pattern_type == "button":
                    skill = self._generate_button_skill(pattern)
                elif pattern.pattern_type == "form":
                    skill = self._generate_form_skill(pattern)
                elif pattern.pattern_type == "navigation":
                    skill = self._generate_navigation_skill(pattern)
                else:
                    skill = self._generate_generic_ui_skill(pattern)
                
                if skill:
                    skills.append(skill)
            
            return skills
            
        except Exception as e:
            logger.error(f"Error generating UI skills: {e}")
            return []
    
    def _generate_action_skills(self, action_patterns: List[ActionPattern]) -> List[GeneratedSkill]:
        """Generate skills from action patterns."""
        try:
            skills = []
            
            for pattern in action_patterns:
                if pattern.confidence < self.min_confidence_threshold:
                    continue
                
                # Generate skill based on action type
                if pattern.action_sequence:
                    skill = self._generate_action_sequence_skill(pattern)
                    if skill:
                        skills.append(skill)
            
            return skills
            
        except Exception as e:
            logger.error(f"Error generating action skills: {e}")
            return []
    
    def _generate_workflow_skills(self, workflow_patterns: List[WorkflowPattern]) -> List[GeneratedSkill]:
        """Generate skills from workflow patterns."""
        try:
            skills = []
            
            for pattern in workflow_patterns:
                if pattern.confidence < self.min_confidence_threshold:
                    continue
                
                skill = self._generate_workflow_skill(pattern)
                if skill:
                    skills.append(skill)
            
            return skills
            
        except Exception as e:
            logger.error(f"Error generating workflow skills: {e}")
            return []
    
    def _generate_composite_skills(self, patterns: Dict[str, Any]) -> List[GeneratedSkill]:
        """Generate composite skills from multiple pattern types."""
        try:
            skills = []
            
            # Combine UI and action patterns for complex skills
            ui_patterns = patterns.get("ui_patterns", [])
            action_patterns = patterns.get("action_patterns", [])
            
            if ui_patterns and action_patterns:
                # Look for patterns that work together
                for ui_pattern in ui_patterns:
                    for action_pattern in action_patterns:
                        if self._patterns_are_compatible(ui_pattern, action_pattern):
                            skill = self._generate_composite_skill(ui_pattern, action_pattern)
                            if skill:
                                skills.append(skill)
            
            return skills
            
        except Exception as e:
            logger.error(f"Error generating composite skills: {e}")
            return []
    
    def _generate_button_skill(self, pattern: UIPattern) -> Optional[GeneratedSkill]:
        """Generate a button interaction skill."""
        try:
            skill_id = f"learned_button_{int(time.time())}"
            
            # Extract button characteristics
            button_elements = pattern.ui_elements
            if not button_elements:
                return None
            
            # Create skill template
            skill_template = {
                "type": "visual_skill",
                "name": f"Learned Button: {pattern.pattern_type}",
                "description": f"Automated button interaction learned from user demonstrations",
                "config": {
                    "skill_pattern": {
                        "steps": [
                            {"action_type": "click", "target_element": "detected_button"},
                            {"action_type": "wait", "duration": 1}
                        ],
                        "estimated_duration": 5
                    }
                },
                "category": "Learned Skills"
            }
            
            skill = GeneratedSkill(
                skill_id=skill_id,
                name=skill_template["name"],
                description=skill_template["description"],
                skill_type="visual_skill",
                confidence=pattern.confidence,
                source_patterns=[pattern.pattern_id],
                skill_template=skill_template,
                validation_score=0.8,  # Default validation score
                estimated_duration=5,
                complexity_score=0.2,
                tags=["button", "click", "learned"],
                created_at=time.strftime("%Y-%m-%d %H:%M:%S"),
                examples=pattern.examples
            )
            
            return skill
            
        except Exception as e:
            logger.error(f"Error generating button skill: {e}")
            return None
    
    def _generate_form_skill(self, pattern: UIPattern) -> Optional[GeneratedSkill]:
        """Generate a form filling skill."""
        try:
            skill_id = f"learned_form_{int(time.time())}"
            
            skill_template = {
                "type": "visual_skill",
                "name": f"Learned Form: {pattern.pattern_type}",
                "description": f"Automated form filling learned from user demonstrations",
                "config": {
                    "skill_pattern": {
                        "steps": [
                            {"action_type": "click", "target_element": "form_field"},
                            {"action_type": "type", "target_element": "input_field", "action_data": {"text": "{form_data}"}},
                            {"action_type": "click", "target_element": "submit_button"}
                        ],
                        "estimated_duration": 15
                    }
                },
                "category": "Learned Skills"
            }
            
            skill = GeneratedSkill(
                skill_id=skill_id,
                name=skill_template["name"],
                description=skill_template["description"],
                skill_type="visual_skill",
                confidence=pattern.confidence,
                source_patterns=[pattern.pattern_id],
                skill_template=skill_template,
                validation_score=0.8,
                estimated_duration=15,
                complexity_score=0.4,
                tags=["form", "filling", "learned"],
                created_at=time.strftime("%Y-%m-%d %H:%M:%S"),
                examples=pattern.examples
            )
            
            return skill
            
        except Exception as e:
            logger.error(f"Error generating form skill: {e}")
            return None
    
    def _generate_navigation_skill(self, pattern: UIPattern) -> Optional[GeneratedSkill]:
        """Generate a navigation skill."""
        try:
            skill_id = f"learned_navigation_{int(time.time())}"
            
            skill_template = {
                "type": "visual_skill",
                "name": f"Learned Navigation: {pattern.pattern_type}",
                "description": f"Automated navigation learned from user demonstrations",
                "config": {
                    "skill_pattern": {
                        "steps": [
                            {"action_type": "click", "target_element": "navigation_element"},
                            {"action_type": "wait", "duration": 2}
                        ],
                        "estimated_duration": 10
                    }
                },
                "category": "Learned Skills"
            }
            
            skill = GeneratedSkill(
                skill_id=skill_id,
                name=skill_template["name"],
                description=skill_template["description"],
                skill_type="visual_skill",
                confidence=pattern.confidence,
                source_patterns=[pattern.pattern_id],
                skill_template=skill_template,
                validation_score=0.8,
                estimated_duration=10,
                complexity_score=0.3,
                tags=["navigation", "learned"],
                created_at=time.strftime("%Y-%m-%d %H:%M:%S"),
                examples=pattern.examples
            )
            
            return skill
            
        except Exception as e:
            logger.error(f"Error generating navigation skill: {e}")
            return None
    
    def _generate_generic_ui_skill(self, pattern: UIPattern) -> Optional[GeneratedSkill]:
        """Generate a generic UI interaction skill."""
        try:
            skill_id = f"learned_ui_{int(time.time())}"
            
            skill_template = {
                "type": "visual_skill",
                "name": f"Learned UI: {pattern.pattern_type}",
                "description": f"Automated UI interaction learned from user demonstrations",
                "config": {
                    "skill_pattern": {
                        "steps": [
                            {"action_type": "click", "target_element": "ui_element"},
                            {"action_type": "wait", "duration": 1}
                        ],
                        "estimated_duration": 8
                    }
                },
                "category": "Learned Skills"
            }
            
            skill = GeneratedSkill(
                skill_id=skill_id,
                name=skill_template["name"],
                description=skill_template["description"],
                skill_type="visual_skill",
                confidence=pattern.confidence,
                source_patterns=[pattern.pattern_id],
                skill_template=skill_template,
                validation_score=0.7,
                estimated_duration=8,
                complexity_score=0.3,
                tags=["ui", "interaction", "learned"],
                created_at=time.strftime("%Y-%m-%d %H:%M:%S"),
                examples=pattern.examples
            )
            
            return skill
            
        except Exception as e:
            logger.error(f"Error generating generic UI skill: {e}")
            return None
    
    def _generate_action_sequence_skill(self, pattern: ActionPattern) -> Optional[GeneratedSkill]:
        """Generate a skill from an action sequence pattern."""
        try:
            skill_id = f"learned_action_{int(time.time())}"
            
            # Convert action sequence to skill steps
            steps = []
            for action in pattern.action_sequence:
                step = {
                    "action_type": action["action_type"],
                    "target_element": action.get("target_element", "unknown"),
                    "action_data": action.get("action_data", {})
                }
                
                if action.get("coordinates"):
                    step["coordinates"] = action["coordinates"]
                
                steps.append(step)
            
            skill_template = {
                "type": "visual_skill",
                "name": f"Learned Action: {pattern.pattern_id}",
                "description": f"Automated action sequence learned from user demonstrations",
                "config": {
                    "skill_pattern": {
                        "steps": steps,
                        "estimated_duration": len(steps) * 3  # Estimate 3 seconds per action
                    }
                },
                "category": "Learned Skills"
            }
            
            skill = GeneratedSkill(
                skill_id=skill_id,
                name=skill_template["name"],
                description=skill_template["description"],
                skill_type="visual_skill",
                confidence=pattern.confidence,
                source_patterns=[pattern.pattern_id],
                skill_template=skill_template,
                validation_score=0.8,
                estimated_duration=len(steps) * 3,
                complexity_score=min(len(steps) / 10.0, 1.0),
                tags=["action", "sequence", "learned"],
                created_at=time.strftime("%Y-%m-%d %H:%M:%S"),
                examples=pattern.examples
            )
            
            return skill
            
        except Exception as e:
            logger.error(f"Error generating action sequence skill: {e}")
            return None
    
    def _generate_workflow_skill(self, pattern: WorkflowPattern) -> Optional[GeneratedSkill]:
        """Generate a workflow skill from a workflow pattern."""
        try:
            skill_id = f"learned_workflow_{int(time.time())}"
            
            skill_template = {
                "type": "workflow",
                "name": f"Learned Workflow: {pattern.name}",
                "description": f"Automated workflow learned from user demonstrations: {pattern.description}",
                "config": {
                    "workflow_pattern": {
                        "estimated_duration": pattern.estimated_duration,
                        "complexity_score": pattern.complexity_score,
                        "confidence": pattern.confidence
                    }
                },
                "category": "Learned Workflows"
            }
            
            skill = GeneratedSkill(
                skill_id=skill_id,
                name=skill_template["name"],
                description=skill_template["description"],
                skill_type="workflow",
                confidence=pattern.confidence,
                source_patterns=[pattern.pattern_id],
                skill_template=skill_template,
                validation_score=0.8,
                estimated_duration=pattern.estimated_duration,
                complexity_score=pattern.complexity_score,
                tags=["workflow", "learned"],
                created_at=time.strftime("%Y-%m-%d %H:%M:%S"),
                examples=pattern.examples
            )
            
            return skill
            
        except Exception as e:
            logger.error(f"Error generating workflow skill: {e}")
            return None
    
    def _generate_composite_skill(self, ui_pattern: UIPattern, action_pattern: ActionPattern) -> Optional[GeneratedSkill]:
        """Generate a composite skill from UI and action patterns."""
        try:
            skill_id = f"learned_composite_{int(time.time())}"
            
            # Combine patterns to create a more complex skill
            steps = []
            
            # Add UI interaction steps
            if ui_pattern.ui_elements:
                steps.append({
                    "action_type": "click",
                    "target_element": "detected_ui_element",
                    "action_data": {"ui_type": ui_pattern.pattern_type}
                })
            
            # Add action sequence steps
            if action_pattern.action_sequence:
                for action in action_pattern.action_sequence:
                    step = {
                        "action_type": action["action_type"],
                        "target_element": action.get("target_element", "unknown"),
                        "action_data": action.get("action_data", {})
                    }
                    steps.append(step)
            
            skill_template = {
                "type": "visual_skill",
                "name": f"Learned Composite: {ui_pattern.pattern_type} + {action_pattern.pattern_id}",
                "description": f"Composite skill combining UI interaction and action sequences",
                "config": {
                    "skill_pattern": {
                        "steps": steps,
                        "estimated_duration": len(steps) * 2
                    }
                },
                "category": "Learned Skills"
            }
            
            # Calculate composite confidence
            composite_confidence = (ui_pattern.confidence + action_pattern.confidence) / 2
            
            skill = GeneratedSkill(
                skill_id=skill_id,
                name=skill_template["name"],
                description=skill_template["description"],
                skill_type="visual_skill",
                confidence=composite_confidence,
                source_patterns=[ui_pattern.pattern_id, action_pattern.pattern_id],
                skill_template=skill_template,
                validation_score=0.7,
                estimated_duration=len(steps) * 2,
                complexity_score=min(len(steps) / 8.0, 1.0),
                tags=["composite", "ui", "action", "learned"],
                created_at=time.strftime("%Y-%m-%d %H:%M:%S"),
                examples=ui_pattern.examples + action_pattern.examples
            )
            
            return skill
            
        except Exception as e:
            logger.error(f"Error generating composite skill: {e}")
            return None
    
    def _patterns_are_compatible(self, ui_pattern: UIPattern, action_pattern: ActionPattern) -> bool:
        """Check if UI and action patterns are compatible for combination."""
        try:
            # Basic compatibility check
            if ui_pattern.confidence < 0.6 or action_pattern.confidence < 0.6:
                return False
            
            # Check if patterns have overlapping examples
            common_examples = set(ui_pattern.examples) & set(action_pattern.examples)
            if len(common_examples) > 0:
                return True
            
            # Check if patterns are from similar time periods
            # This would require more sophisticated analysis
            return True
            
        except Exception as e:
            logger.error(f"Error checking pattern compatibility: {e}")
            return False
    
    def _enhance_skill_with_patterns(self, skill: Dict[str, Any], patterns: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Enhance an existing skill with learned patterns."""
        try:
            # Find relevant patterns for this skill
            relevant_patterns = self._find_relevant_patterns(skill, patterns)
            
            if not relevant_patterns:
                return None
            
            # Create enhanced skill
            enhanced_skill = skill.copy()
            
            # Enhance skill pattern with learned information
            if "config" in enhanced_skill and "skill_pattern" in enhanced_skill["config"]:
                skill_pattern = enhanced_skill["config"]["skill_pattern"]
                
                # Add learned optimizations
                if "steps" in skill_pattern:
                    enhanced_steps = self._enhance_steps_with_patterns(skill_pattern["steps"], relevant_patterns)
                    skill_pattern["steps"] = enhanced_steps
                
                # Update estimated duration based on learned patterns
                if relevant_patterns.get("timing_patterns"):
                    timing = relevant_patterns["timing_patterns"]
                    if "avg_interval" in timing:
                        enhanced_skill["config"]["skill_pattern"]["estimated_duration"] = int(timing["avg_interval"] * len(skill_pattern.get("steps", [])))
            
            return enhanced_skill
            
        except Exception as e:
            logger.error(f"Error enhancing skill with patterns: {e}")
            return None
    
    def _find_relevant_patterns(self, skill: Dict[str, Any], patterns: Dict[str, Any]) -> Dict[str, Any]:
        """Find patterns relevant to a specific skill."""
        try:
            relevant_patterns = {}
            
            # Extract skill characteristics
            skill_name = skill.get("name", "").lower()
            skill_description = skill.get("description", "").lower()
            
            # Look for patterns that match skill characteristics
            for pattern_type, pattern_list in patterns.items():
                for pattern in pattern_list:
                    if hasattr(pattern, 'pattern_type'):
                        pattern_type_name = pattern.pattern_type.lower()
                        
                        # Check for name/description matches
                        if (pattern_type_name in skill_name or 
                            pattern_type_name in skill_description):
                            relevant_patterns[pattern_type] = pattern
            
            return relevant_patterns
            
        except Exception as e:
            logger.error(f"Error finding relevant patterns: {e}")
            return {}
    
    def _enhance_steps_with_patterns(self, steps: List[Dict[str, Any]], patterns: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Enhance skill steps with learned patterns."""
        try:
            enhanced_steps = steps.copy()
            
            # Apply pattern-based enhancements
            for i, step in enumerate(enhanced_steps):
                if "wait" in step.get("action_type", ""):
                    # Optimize wait times based on learned patterns
                    if patterns.get("timing_patterns", {}).get("avg_interval"):
                        optimal_wait = patterns["timing_patterns"]["avg_interval"]
                        step["action_data"] = step.get("action_data", {})
                        step["action_data"]["duration"] = optimal_wait
                
                # Add confidence scores based on pattern confidence
                if "confidence" not in step:
                    step["confidence"] = patterns.get("confidence", 0.8)
            
            return enhanced_steps
            
        except Exception as e:
            logger.error(f"Error enhancing steps with patterns: {e}")
            return steps
    
    def _validate_generated_skills(self, skills: List[GeneratedSkill]) -> List[GeneratedSkill]:
        """Validate generated skills and filter out low-quality ones."""
        try:
            validated_skills = []
            
            for skill in skills:
                # Check confidence threshold
                if skill.confidence < self.min_confidence_threshold:
                    continue
                
                # Check complexity threshold
                if skill.complexity_score > self.max_skill_complexity:
                    continue
                
                # Check validation score
                if skill.validation_score < self.min_validation_score:
                    continue
                
                # Additional validation checks
                if self._validate_skill_structure(skill):
                    validated_skills.append(skill)
            
            logger.info(f"Validated {len(validated_skills)} out of {len(skills)} generated skills")
            return validated_skills
            
        except Exception as e:
            logger.error(f"Error validating generated skills: {e}")
            return []
    
    def _validate_skill_structure(self, skill: GeneratedSkill) -> bool:
        """Validate the structure of a generated skill."""
        try:
            # Check required fields
            if not skill.name or not skill.description:
                return False
            
            # Check skill template structure
            if not skill.skill_template:
                return False
            
            # Check config structure
            if "config" not in skill.skill_template:
                return False
            
            # Check skill pattern
            if "skill_pattern" not in skill.skill_template["config"]:
                return False
            
            # Check steps
            skill_pattern = skill.skill_template["config"]["skill_pattern"]
            if "steps" not in skill_pattern:
                return False
            
            if not skill_pattern["steps"]:
                return False
            
            return True
            
        except Exception as e:
            logger.error(f"Error validating skill structure: {e}")
            return False
    
    def get_generated_skills(self) -> List[GeneratedSkill]:
        """Get all generated skills."""
        return self.generated_skills
    
    def get_skill_by_id(self, skill_id: str) -> Optional[GeneratedSkill]:
        """Get a specific generated skill by ID."""
        for skill in self.generated_skills:
            if skill.skill_id == skill_id:
                return skill
        return None
    
    def export_skills_to_templates(self) -> Dict[str, Any]:
        """Export generated skills as workflow builder templates."""
        try:
            templates = {}
            
            for skill in self.generated_skills:
                if skill.skill_type == "visual_skill":
                    template_id = f"learned_{skill.skill_id}"
                    templates[template_id] = skill.skill_template
            
            return templates
            
        except Exception as e:
            logger.error(f"Error exporting skills to templates: {e}")
            return {}
    
    def save_skills_to_file(self, filepath: str):
        """Save generated skills to a JSON file."""
        try:
            skills_data = []
            for skill in self.generated_skills:
                skills_data.append({
                    "skill_id": skill.skill_id,
                    "name": skill.name,
                    "description": skill.description,
                    "skill_type": skill.skill_type,
                    "confidence": skill.confidence,
                    "source_patterns": skill.source_patterns,
                    "skill_template": skill.skill_template,
                    "validation_score": skill.validation_score,
                    "estimated_duration": skill.estimated_duration,
                    "complexity_score": skill.complexity_score,
                    "tags": skill.tags,
                    "created_at": skill.created_at,
                    "examples": skill.examples
                })
            
            with open(filepath, 'w') as f:
                json.dump(skills_data, f, indent=2)
            
            logger.info(f"Saved {len(skills_data)} skills to {filepath}")
            
        except Exception as e:
            logger.error(f"Error saving skills to file: {e}")
    
    def load_skills_from_file(self, filepath: str):
        """Load generated skills from a JSON file."""
        try:
            with open(filepath, 'r') as f:
                skills_data = json.load(f)
            
            loaded_skills = []
            for skill_data in skills_data:
                skill = GeneratedSkill(**skill_data)
                loaded_skills.append(skill)
            
            self.generated_skills.extend(loaded_skills)
            logger.info(f"Loaded {len(loaded_skills)} skills from {filepath}")
            
        except Exception as e:
            logger.error(f"Error loading skills from file: {e}")
