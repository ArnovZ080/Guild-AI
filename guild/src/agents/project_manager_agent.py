"""
Project Manager Agent - Tracks tasks, deadlines, and deliverables
"""

from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime, timedelta

@dataclass
class ProjectTask:
    task_id: str
    task_name: str
    assigned_agent: str
    estimated_time: int
    status: str

@dataclass
class ProjectPlan:
    project_id: str
    project_name: str
    goal: str
    tasks: List[ProjectTask]
    timeline: Dict[str, Any]

class ProjectManagerAgent:
    """Project Manager Agent - Tracks tasks, deadlines, and deliverables"""
    
    def __init__(self, name: str = "Project Manager Agent"):
        self.name = name
        self.role = "Project Management Specialist"
        self.expertise = [
            "Project Management",
            "Task Breakdown",
            "Timeline Creation",
            "Resource Allocation"
        ]
    
    def create_project_plan(self, 
                          project_goal: str,
                          high_level_tasks: List[str]) -> ProjectPlan:
        """Create comprehensive project plan with task breakdown and timeline"""
        
        # Break down high-level tasks
        detailed_tasks = self._break_down_tasks(high_level_tasks, project_goal)
        
        # Create timeline
        project_timeline = self._create_project_timeline(detailed_tasks)
        
        # Generate project ID
        project_id = f"project_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        return ProjectPlan(
            project_id=project_id,
            project_name=f"Project_{project_goal.replace(' ', '_')}",
            goal=project_goal,
            tasks=detailed_tasks,
            timeline=project_timeline
        )
    
    def _break_down_tasks(self, high_level_tasks: List[str], project_goal: str) -> List[ProjectTask]:
        """Break down high-level tasks into detailed, actionable sub-tasks"""
        
        detailed_tasks = []
        task_counter = 1
        
        for high_level_task in high_level_tasks:
            # Generate sub-tasks based on task type
            sub_tasks = self._generate_sub_tasks(high_level_task)
            
            for sub_task in sub_tasks:
                task = ProjectTask(
                    task_id=f"task_{task_counter:03d}",
                    task_name=sub_task["name"],
                    assigned_agent=sub_task["assigned_agent"],
                    estimated_time=sub_task["estimated_time"],
                    status="not_started"
                )
                detailed_tasks.append(task)
                task_counter += 1
        
        return detailed_tasks
    
    def _generate_sub_tasks(self, high_level_task: str) -> List[Dict[str, Any]]:
        """Generate specific sub-tasks for a high-level task"""
        
        task_lower = high_level_task.lower()
        
        if "create" in task_lower or "develop" in task_lower:
            return [
                {
                    "name": f"Research and planning for {high_level_task}",
                    "assigned_agent": "Research & Scraper Agent",
                    "estimated_time": 4
                },
                {
                    "name": f"Design and prototype {high_level_task}",
                    "assigned_agent": "Content Strategist Agent",
                    "estimated_time": 6
                },
                {
                    "name": f"Implement and test {high_level_task}",
                    "assigned_agent": "Project Manager Agent",
                    "estimated_time": 8
                }
            ]
        elif "analyze" in task_lower or "research" in task_lower:
            return [
                {
                    "name": f"Data collection for {high_level_task}",
                    "assigned_agent": "Research & Scraper Agent",
                    "estimated_time": 3
                },
                {
                    "name": f"Data analysis and insights for {high_level_task}",
                    "assigned_agent": "Analytics Agent",
                    "estimated_time": 5
                },
                {
                    "name": f"Report generation for {high_level_task}",
                    "assigned_agent": "Writer Agent",
                    "estimated_time": 3
                }
            ]
        else:
            return [
                {
                    "name": f"Planning for {high_level_task}",
                    "assigned_agent": "Strategy Agent",
                    "estimated_time": 3
                },
                {
                    "name": f"Execution of {high_level_task}",
                    "assigned_agent": "Project Manager Agent",
                    "estimated_time": 5
                }
            ]
    
    def _create_project_timeline(self, tasks: List[ProjectTask]) -> Dict[str, Any]:
        """Create project timeline with milestones"""
        
        current_date = datetime.now()
        total_hours = sum(task.estimated_time for task in tasks)
        
        timeline = {
            "start_date": current_date,
            "end_date": current_date + timedelta(hours=total_hours),
            "total_duration_hours": total_hours,
            "milestones": [
                {
                    "name": "Project Start",
                    "date": current_date
                },
                {
                    "name": "Project Complete",
                    "date": current_date + timedelta(hours=total_hours)
                }
            ]
        }
        
        return timeline
    
    def track_project_progress(self, 
                             project_plan: ProjectPlan,
                             task_updates: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Track project progress and identify issues"""
        
        progress_report = {
            "project_id": project_plan.project_id,
            "overall_progress": 0.0,
            "completed_tasks": 0,
            "in_progress_tasks": 0,
            "delayed_tasks": 0
        }
        
        total_tasks = len(project_plan.tasks)
        
        for task in project_plan.tasks:
            # Find task update
            task_update = next((update for update in task_updates if update.get("task_id") == task.task_id), None)
            
            if task_update:
                task.status = task_update.get("status", task.status)
            
            # Count tasks by status
            if task.status == "completed":
                progress_report["completed_tasks"] += 1
            elif task.status == "in_progress":
                progress_report["in_progress_tasks"] += 1
            elif task.status == "delayed":
                progress_report["delayed_tasks"] += 1
        
        # Calculate overall progress
        progress_report["overall_progress"] = progress_report["completed_tasks"] / total_tasks if total_tasks > 0 else 0
        
        return progress_report
    
    def get_agent_info(self) -> Dict[str, Any]:
        """Get agent information and capabilities"""
        
        return {
            "name": self.name,
            "role": self.role,
            "expertise": self.expertise,
            "capabilities": [
                "Project planning and task breakdown",
                "Timeline creation and management",
                "Resource allocation",
                "Progress tracking and reporting"
            ]
        }