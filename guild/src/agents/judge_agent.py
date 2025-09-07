"""
Judge Agent for Guild-AI
Evaluates deliverables against quality rubrics.
"""

from typing import Dict, List, Any
from datetime import datetime


class JudgeAgent:
    """Judge Agent for quality evaluation."""
    
    def __init__(self):
        self.agent_name = "Judge Agent"
        self.agent_type = "Foundational"
        self.capabilities = [
            "Quality rubric generation",
            "Deliverable evaluation",
            "Revision cycle management"
        ]
        self.quality_rubrics = {}
        
    def get_agent_info(self) -> Dict[str, Any]:
        """Return agent information."""
        return {
            "name": self.agent_name,
            "type": self.agent_type,
            "capabilities": self.capabilities,
            "status": "active"
        }
    
    def generate_quality_rubric(self, task_type: str, requirements: Dict[str, Any]) -> Dict[str, Any]:
        """Generate quality rubric."""
        try:
            rubric_id = f"rubric_{task_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            
            rubric = {
                "id": rubric_id,
                "task_type": task_type,
                "dimensions": {
                    "clarity_coherence": {"weight": 0.2, "description": "Clear and logical content"},
                    "accuracy_factuality": {"weight": 0.25, "description": "Factually accurate content"},
                    "brand_voice_tone": {"weight": 0.15, "description": "Brand-aligned content"},
                    "audience_fit": {"weight": 0.2, "description": "Audience-appropriate content"},
                    "completeness": {"weight": 0.15, "description": "Complete coverage"},
                    "originality": {"weight": 0.05, "description": "Original and creative"}
                },
                "quality_threshold": requirements.get("quality_threshold", 0.8),
                "created_date": datetime.now().isoformat()
            }
            
            self.quality_rubrics[rubric_id] = rubric
            return rubric
            
        except Exception as e:
            return {"error": str(e)}
    
    def evaluate_deliverable(self, deliverable_data: Dict[str, Any], rubric_id: str) -> Dict[str, Any]:
        """Evaluate deliverable against rubric."""
        try:
            if rubric_id not in self.quality_rubrics:
                return {"error": "Rubric not found"}
            
            rubric = self.quality_rubrics[rubric_id]
            evaluation_id = f"eval_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            
            # Calculate scores
            dimension_scores = {}
            total_score = 0
            
            for dimension, config in rubric["dimensions"].items():
                score = 0.7  # Base score (simplified)
                dimension_scores[dimension] = {
                    "score": score,
                    "weighted_score": score * config["weight"]
                }
                total_score += dimension_scores[dimension]["weighted_score"]
            
            needs_revision = total_score < rubric["quality_threshold"]
            
            evaluation = {
                "id": evaluation_id,
                "total_score": round(total_score, 3),
                "needs_revision": needs_revision,
                "dimension_scores": dimension_scores,
                "feedback": "Good quality" if not needs_revision else "Revision needed",
                "evaluation_date": datetime.now().isoformat()
            }
            
            return evaluation
            
        except Exception as e:
            return {"error": str(e)}
    
    def get_agent_capabilities(self) -> List[str]:
        """Return agent capabilities."""
        return [
            "Quality rubric generation",
            "Deliverable evaluation",
            "Revision cycle management",
            "Quality threshold enforcement"
        ]