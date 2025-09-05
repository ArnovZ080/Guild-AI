"""
Project Manager Agent - Tracks tasks, deadlines, and deliverables. Ensures everything runs on time.
"""

from typing import Dict, List, Any
from ..core.base_agent import BaseAgent


class ProjectManagerAgent(BaseAgent):
    """Project Manager Agent - Project management and task tracking"""
    
    def __init__(self, **kwargs):
        super().__init__(
            name="Project Manager Agent",
            role="Project management and task tracking",
            **kwargs
        )
        self.projects: Dict[str, Any] = {}
        self.tasks: Dict[str, Any] = {}
    
    async def create_project(self, project_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new project"""
        try:
            project = {
                "project_id": f"project_{len(self.projects) + 1}",
                "name": project_data.get("name", ""),
                "description": project_data.get("description", ""),
                "deadline": project_data.get("deadline", ""),
                "team_members": project_data.get("team_members", []),
                "status": "active",
                "created_at": self._get_current_time()
            }
            
            self.projects[project["project_id"]] = project
            
            return {
                "status": "success",
                "project": project
            }
            
        except Exception as e:
            return {
                "status": "error",
                "message": f"Failed to create project: {str(e)}"
            }
    
    async def create_task(self, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new task"""
        try:
            task = {
                "task_id": f"task_{len(self.tasks) + 1}",
                "project_id": task_data.get("project_id", ""),
                "name": task_data.get("name", ""),
                "description": task_data.get("description", ""),
                "assigned_to": task_data.get("assigned_to", ""),
                "deadline": task_data.get("deadline", ""),
                "priority": task_data.get("priority", "medium"),
                "status": "pending",
                "created_at": self._get_current_time()
            }
            
            self.tasks[task["task_id"]] = task
            
            return {
                "status": "success",
                "task": task
            }
            
        except Exception as e:
            return {
                "status": "error",
                "message": f"Failed to create task: {str(e)}"
            }
    
    async def track_progress(self, project_id: str) -> Dict[str, Any]:
        """Track project progress"""
        try:
            if project_id not in self.projects:
                return {
                    "status": "error",
                    "message": "Project not found"
                }
            
            project_tasks = [task for task in self.tasks.values() if task["project_id"] == project_id]
            
            progress_report = {
                "project_id": project_id,
                "total_tasks": len(project_tasks),
                "completed_tasks": len([task for task in project_tasks if task["status"] == "completed"]),
                "in_progress_tasks": len([task for task in project_tasks if task["status"] == "in_progress"]),
                "overdue_tasks": len([task for task in project_tasks if self._is_task_overdue(task)]),
                "completion_percentage": self._calculate_completion_percentage(project_tasks),
                "created_at": self._get_current_time()
            }
            
            return {
                "status": "success",
                "progress_report": progress_report
            }
            
        except Exception as e:
            return {
                "status": "error",
                "message": f"Failed to track progress: {str(e)}"
            }
    
    async def generate_status_report(self, project_id: str) -> Dict[str, Any]:
        """Generate comprehensive status report"""
        try:
            if project_id not in self.projects:
                return {
                    "status": "error",
                    "message": "Project not found"
                }
            
            project = self.projects[project_id]
            project_tasks = [task for task in self.tasks.values() if task["project_id"] == project_id]
            
            status_report = {
                "project_id": project_id,
                "project_name": project["name"],
                "overall_status": self._determine_overall_status(project_tasks),
                "key_metrics": {
                    "total_tasks": len(project_tasks),
                    "completed_tasks": len([task for task in project_tasks if task["status"] == "completed"]),
                    "completion_rate": self._calculate_completion_percentage(project_tasks),
                    "days_remaining": self._calculate_days_remaining(project["deadline"])
                },
                "risks": self._identify_risks(project_tasks),
                "recommendations": self._generate_recommendations(project_tasks),
                "created_at": self._get_current_time()
            }
            
            return {
                "status": "success",
                "status_report": status_report
            }
            
        except Exception as e:
            return {
                "status": "error",
                "message": f"Failed to generate status report: {str(e)}"
            }
    
    def _is_task_overdue(self, task: Dict[str, Any]) -> bool:
        """Check if task is overdue"""
        # Simplified overdue check
        return task["status"] != "completed" and task["deadline"] < self._get_current_time()
    
    def _calculate_completion_percentage(self, tasks: List[Dict[str, Any]]) -> float:
        """Calculate completion percentage"""
        if not tasks:
            return 0.0
        
        completed = len([task for task in tasks if task["status"] == "completed"])
        return (completed / len(tasks)) * 100
    
    def _determine_overall_status(self, tasks: List[Dict[str, Any]]) -> str:
        """Determine overall project status"""
        completion_rate = self._calculate_completion_percentage(tasks)
        
        if completion_rate >= 90:
            return "On track"
        elif completion_rate >= 70:
            return "At risk"
        else:
            return "Behind schedule"
    
    def _calculate_days_remaining(self, deadline: str) -> int:
        """Calculate days remaining until deadline"""
        # Simplified calculation
        return 30
    
    def _identify_risks(self, tasks: List[Dict[str, Any]]) -> List[str]:
        """Identify project risks"""
        risks = []
        
        overdue_tasks = [task for task in tasks if self._is_task_overdue(task)]
        if overdue_tasks:
            risks.append(f"{len(overdue_tasks)} overdue tasks")
        
        high_priority_tasks = [task for task in tasks if task["priority"] == "high" and task["status"] != "completed"]
        if len(high_priority_tasks) > 5:
            risks.append("Too many high-priority tasks pending")
        
        return risks
    
    def _generate_recommendations(self, tasks: List[Dict[str, Any]]) -> List[str]:
        """Generate project recommendations"""
        recommendations = []
        
        overdue_tasks = [task for task in tasks if self._is_task_overdue(task)]
        if overdue_tasks:
            recommendations.append("Address overdue tasks immediately")
        
        recommendations.extend([
            "Regular progress check-ins with team",
            "Prioritize high-impact tasks",
            "Monitor resource allocation"
        ])
        
        return recommendations
    
    def _get_current_time(self) -> str:
        """Get current timestamp"""
        return "2024-01-01T00:00:00Z"