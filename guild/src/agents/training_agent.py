"""
Training Agent - Builds and updates internal SOP libraries and delivers micro-trainings
"""

from typing import Dict, List, Any
from dataclasses import dataclass
from datetime import datetime

@dataclass
class TrainingModule:
    module_id: str
    title: str
    description: str
    duration_minutes: int

@dataclass
class SOPDocument:
    sop_id: str
    title: str
    process_steps: List[Dict[str, Any]]

class TrainingAgent:
    """Training Agent - Builds and updates internal SOP libraries and delivers micro-trainings"""
    
    def __init__(self, name: str = "Training Agent"):
        self.name = name
        self.role = "Training & Development Specialist"
        self.expertise = [
            "Training Program Design",
            "SOP Development",
            "Micro-Learning",
            "Knowledge Management"
        ]
    
    def create_training_module(self, 
                             topic: str,
                             target_audience: str,
                             learning_objectives: List[str]) -> TrainingModule:
        """Create comprehensive training module"""
        
        # Calculate duration based on topic complexity
        duration = self._calculate_module_duration(topic)
        
        # Generate module ID
        module_id = f"training_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        return TrainingModule(
            module_id=module_id,
            title=topic,
            description=f"This training module covers {topic}. Participants will learn key concepts and practical applications.",
            duration_minutes=duration
        )
    
    def _calculate_module_duration(self, topic: str) -> int:
        """Calculate total module duration"""
        
        topic_lower = topic.lower()
        
        if "advanced" in topic_lower or "complex" in topic_lower:
            return 60
        elif "basic" in topic_lower or "introductory" in topic_lower:
            return 20
        else:
            return 40
    
    def create_sop_document(self, 
                          process_name: str,
                          process_description: str,
                          stakeholders: List[str]) -> SOPDocument:
        """Create comprehensive Standard Operating Procedure document"""
        
        # Create process steps
        process_steps = self._create_process_steps(process_name, stakeholders)
        
        # Generate SOP ID
        sop_id = f"sop_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        return SOPDocument(
            sop_id=sop_id,
            title=f"SOP: {process_name}",
            process_steps=process_steps
        )
    
    def _create_process_steps(self, process_name: str, stakeholders: List[str]) -> List[Dict[str, Any]]:
        """Create detailed process steps"""
        
        steps = []
        num_steps = 5  # Default number of steps
        
        for i in range(num_steps):
            step = {
                "step_number": i + 1,
                "title": f"Step {i + 1}: {self._generate_step_title(i + 1)}",
                "description": f"Detailed description of step {i + 1}",
                "responsible_party": self._assign_responsible_party(i + 1, stakeholders),
                "estimated_time": f"{i + 1}0 minutes"
            }
            steps.append(step)
        
        return steps
    
    def _generate_step_title(self, step_number: int) -> str:
        """Generate step title"""
        
        titles = ["Initiate Process", "Gather Information", "Process Data", "Review Results", "Complete Task"]
        return titles[min(step_number - 1, len(titles) - 1)]
    
    def _assign_responsible_party(self, step_number: int, stakeholders: List[str]) -> str:
        """Assign responsible party for step"""
        
        if not stakeholders:
            return "Process Owner"
        
        return stakeholders[(step_number - 1) % len(stakeholders)]
    
    def get_agent_info(self) -> Dict[str, Any]:
        """Get agent information and capabilities"""
        
        return {
            "name": self.name,
            "role": self.role,
            "expertise": self.expertise,
            "capabilities": [
                "Training module design and development",
                "SOP creation and maintenance",
                "Micro-learning content creation",
                "Knowledge management system design"
            ]
        }