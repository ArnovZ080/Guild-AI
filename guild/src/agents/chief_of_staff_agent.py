"""
Chief of Staff Agent - Strategic coordination and task prioritization
"""

from typing import Dict, List, Any
from dataclasses import dataclass
from datetime import datetime

@dataclass
class ExecutionPlan:
    plan_id: str
    user_request: str
    delegated_tasks: List[Dict[str, Any]]
    recommendations: List[str]

class ChiefOfStaffAgent:
    """Chief of Staff Agent - Strategic coordinator and task prioritization specialist"""
    
    def __init__(self, name: str = "Chief of Staff Agent"):
        self.name = name
        self.role = "Strategic Coordinator"
        self.expertise = [
            "Strategic Planning",
            "Task Prioritization",
            "Delegation",
            "Workflow Optimization",
            "Cross-functional Coordination"
        ]
    
    def analyze_user_request(self, 
                           user_request: str,
                           current_business_status: Dict[str, Any],
                           strategic_directives: List[str]) -> ExecutionPlan:
        """Analyze user request and create comprehensive execution plan"""
        
        # Parse user request
        core_intent = self._parse_user_request(user_request)
        
        # Identify required agents
        required_agents = self._identify_required_agents(core_intent)
        
        # Delegate tasks
        delegated_tasks = self._delegate_tasks(required_agents, core_intent)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(core_intent)
        
        plan_id = f"exec_plan_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        return ExecutionPlan(
            plan_id=plan_id,
            user_request=user_request,
            delegated_tasks=delegated_tasks,
            recommendations=recommendations
        )
    
    def _parse_user_request(self, user_request: str) -> Dict[str, Any]:
        """Parse user request to identify core intent and requirements"""
        
        request_lower = user_request.lower()
        
        if any(word in request_lower for word in ["create", "build", "develop"]):
            intent = "creation"
        elif any(word in request_lower for word in ["analyze", "research"]):
            intent = "analysis"
        elif any(word in request_lower for word in ["optimize", "improve"]):
            intent = "optimization"
        else:
            intent = "general_assistance"
        
        return {
            "primary_intent": intent,
            "urgency": "normal",
            "complexity": "medium"
        }
    
    def _identify_required_agents(self, core_intent: Dict[str, Any]) -> List[str]:
        """Determine which specialized agents are needed"""
        
        intent_type = core_intent["primary_intent"]
        
        if intent_type == "creation":
            return ["Content Strategist Agent", "Writer Agent"]
        elif intent_type == "analysis":
            return ["Research & Scraper Agent", "Analytics Agent"]
        elif intent_type == "optimization":
            return ["SEO Agent", "Paid Ads Agent"]
        else:
            return ["Strategy Agent", "Project Manager Agent"]
    
    def _delegate_tasks(self, required_agents: List[str], core_intent: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Delegate specific tasks to agents"""
        
        tasks = []
        
        for i, agent in enumerate(required_agents):
            task = {
                "task_id": f"task_{i+1}",
                "assigned_agent": agent,
                "task_description": f"Complete {core_intent['primary_intent']} task",
                "priority": "high" if i == 0 else "medium",
                "deadline": "2 hours"
            }
            tasks.append(task)
        
        return tasks
    
    def _generate_recommendations(self, core_intent: Dict[str, Any]) -> List[str]:
        """Generate strategic recommendations"""
        
        recommendations = []
        
        if core_intent["primary_intent"] == "optimization":
            recommendations.append("Implement A/B testing to measure effectiveness")
            recommendations.append("Establish baseline metrics before changes")
        
        recommendations.append("Monitor progress and adjust as needed")
        
        return recommendations
    
    def get_agent_info(self) -> Dict[str, Any]:
        """Get agent information"""
        
        return {
            "name": self.name,
            "role": self.role,
            "expertise": self.expertise,
            "capabilities": [
                "User request analysis",
                "Agent coordination",
                "Task delegation",
                "Strategic recommendations"
            ]
        }