"""
Chief of Staff Agent - Coordinates priorities, meetings, and task delegation across all other agents.
"""

from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field
from ..core.base_agent import BaseAgent


class ChiefOfStaffAgent(BaseAgent):
    """
    Chief of Staff Agent - Strategic coordination and task prioritization
    
    Responsibilities:
    - Coordinate priorities across all agents
    - Schedule and manage meetings
    - Delegate tasks to appropriate agents
    - Monitor progress and ensure deadlines are met
    """
    
    def __init__(self, **kwargs):
        super().__init__(
            name="Chief of Staff Agent",
            role="Strategic coordination and task prioritization",
            **kwargs
        )
        self.task_priorities: Dict[str, Any] = {}
        self.meeting_schedules: Dict[str, Any] = {}
        self.agent_workloads: Dict[str, int] = {}
    
    async def coordinate_priorities(self, tasks: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Coordinate and prioritize tasks across all agents"""
        try:
            prioritized_tasks = []
            
            for task in tasks:
                priority = self._calculate_priority(task)
                task_info = {
                    "task_id": task.get("id", ""),
                    "priority": priority,
                    "deadline": task.get("deadline"),
                    "assigned_agent": task.get("assigned_agent"),
                    "status": "pending"
                }
                prioritized_tasks.append(task_info)
                self.task_priorities[task_info["task_id"]] = task_info
            
            # Sort by priority
            sorted_tasks = sorted(prioritized_tasks, key=lambda x: x["priority"], reverse=True)
            
            return {
                "status": "success",
                "coordinated_tasks": len(sorted_tasks),
                "priority_summary": self._generate_priority_summary(sorted_tasks)
            }
            
        except Exception as e:
            return {
                "status": "error",
                "message": f"Failed to coordinate priorities: {str(e)}"
            }
    
    async def schedule_meeting(self, meeting_details: Dict[str, Any]) -> Dict[str, Any]:
        """Schedule and coordinate meetings"""
        try:
            meeting = {
                "meeting_id": meeting_details.get("id", ""),
                "title": meeting_details.get("title", ""),
                "participants": meeting_details.get("participants", []),
                "scheduled_time": meeting_details.get("scheduled_time", ""),
                "agenda": meeting_details.get("agenda", [])
            }
            
            self.meeting_schedules[meeting["meeting_id"]] = meeting
            
            return {
                "status": "success",
                "meeting_id": meeting["meeting_id"],
                "scheduled_time": meeting["scheduled_time"],
                "participants": meeting["participants"]
            }
            
        except Exception as e:
            return {
                "status": "error",
                "message": f"Failed to schedule meeting: {str(e)}"
            }
    
    async def delegate_task(self, task: Dict[str, Any], target_agent: str) -> Dict[str, Any]:
        """Delegate a specific task to a target agent"""
        try:
            task_id = task.get("id", "")
            if task_id in self.task_priorities:
                self.task_priorities[task_id]["assigned_agent"] = target_agent
                self.task_priorities[task_id]["status"] = "assigned"
            
            self.agent_workloads[target_agent] = self.agent_workloads.get(target_agent, 0) + 1
            
            return {
                "status": "success",
                "task_id": task_id,
                "assigned_agent": target_agent
            }
            
        except Exception as e:
            return {
                "status": "error",
                "message": f"Failed to delegate task: {str(e)}"
            }
    
    async def monitor_progress(self) -> Dict[str, Any]:
        """Monitor progress across all agents and tasks"""
        try:
            progress_report = {
                "total_tasks": len(self.task_priorities),
                "completed_tasks": len([t for t in self.task_priorities.values() if t.get("status") == "completed"]),
                "in_progress_tasks": len([t for t in self.task_priorities.values() if t.get("status") == "in_progress"]),
                "agent_workloads": self.agent_workloads
            }
            
            return {
                "status": "success",
                "progress_report": progress_report
            }
            
        except Exception as e:
            return {
                "status": "error",
                "message": f"Failed to monitor progress: {str(e)}"
            }
    
    def _calculate_priority(self, task: Dict[str, Any]) -> int:
        """Calculate task priority based on various factors"""
        priority = 5  # Base priority
        
        # Adjust based on deadline urgency
        if task.get("deadline"):
            priority += 2
        
        # Adjust based on task importance
        importance = task.get("importance", "medium")
        if importance == "high":
            priority += 2
        elif importance == "low":
            priority -= 1
        
        return min(max(priority, 1), 10)
    
    def _generate_priority_summary(self, tasks: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate a summary of task priorities"""
        high_priority = len([t for t in tasks if t["priority"] >= 8])
        medium_priority = len([t for t in tasks if 5 <= t["priority"] < 8])
        low_priority = len([t for t in tasks if t["priority"] < 5])
        
        return {
            "high_priority_tasks": high_priority,
            "medium_priority_tasks": medium_priority,
            "low_priority_tasks": low_priority,
            "total_tasks": len(tasks)
        }