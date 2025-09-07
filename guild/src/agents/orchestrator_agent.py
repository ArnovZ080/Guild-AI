"""
Orchestrator Agent for Guild-AI
Coordinates and manages multi-agent workflows and task execution.
"""

from typing import Dict, List, Any
from datetime import datetime


class OrchestratorAgent:
    """Orchestrator Agent for workflow coordination and management."""
    
    def __init__(self):
        self.agent_name = "Orchestrator Agent"
        self.agent_type = "Foundational"
        self.capabilities = [
            "Workflow orchestration",
            "Task coordination",
            "Agent management",
            "Resource allocation"
        ]
        self.active_workflows = {}
        self.agent_registry = {}
        
    def get_agent_info(self) -> Dict[str, Any]:
        """Return agent information."""
        return {
            "name": self.agent_name,
            "type": self.agent_type,
            "capabilities": self.capabilities,
            "status": "active"
        }
    
    def create_workflow(self, workflow_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new workflow."""
        try:
            workflow_id = f"workflow_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            
            workflow = {
                "id": workflow_id,
                "name": workflow_data.get("name", "New Workflow"),
                "description": workflow_data.get("description", ""),
                "tasks": workflow_data.get("tasks", []),
                "dependencies": workflow_data.get("dependencies", {}),
                "status": "created",
                "created_date": datetime.now().isoformat(),
                "execution_log": []
            }
            
            self.active_workflows[workflow_id] = workflow
            return workflow
            
        except Exception as e:
            return {"error": str(e)}
    
    def execute_workflow(self, workflow_id: str) -> Dict[str, Any]:
        """Execute a workflow."""
        try:
            if workflow_id not in self.active_workflows:
                return {"error": "Workflow not found"}
            
            workflow = self.active_workflows[workflow_id]
            workflow["status"] = "running"
            workflow["start_time"] = datetime.now().isoformat()
            
            execution_results = {
                "workflow_id": workflow_id,
                "status": "running",
                "completed_tasks": 0,
                "total_tasks": len(workflow["tasks"]),
                "task_results": [],
                "errors": []
            }
            
            # Execute tasks in order
            for task in workflow["tasks"]:
                try:
                    task_result = self._execute_task(task)
                    execution_results["task_results"].append(task_result)
                    execution_results["completed_tasks"] += 1
                    workflow["execution_log"].append({
                        "task": task.get("name", ""),
                        "status": "completed",
                        "timestamp": datetime.now().isoformat()
                    })
                except Exception as e:
                    execution_results["errors"].append(f"Task {task.get('name', 'unknown')} failed: {str(e)}")
                    workflow["execution_log"].append({
                        "task": task.get("name", ""),
                        "status": "failed",
                        "error": str(e),
                        "timestamp": datetime.now().isoformat()
                    })
            
            # Update workflow status
            if execution_results["completed_tasks"] == execution_results["total_tasks"]:
                workflow["status"] = "completed"
                execution_results["status"] = "completed"
            else:
                workflow["status"] = "partial"
                execution_results["status"] = "partial"
            
            workflow["end_time"] = datetime.now().isoformat()
            return execution_results
            
        except Exception as e:
            return {"error": str(e)}
    
    def _execute_task(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a single task."""
        try:
            task_result = {
                "task_id": task.get("id", ""),
                "task_name": task.get("name", ""),
                "agent_type": task.get("agent_type", ""),
                "status": "completed",
                "result": task.get("expected_result", "Task completed successfully"),
                "execution_time": datetime.now().isoformat()
            }
            
            # Simulate task execution based on agent type
            agent_type = task.get("agent_type", "")
            if agent_type == "content_creation":
                task_result["result"] = "Content created successfully"
            elif agent_type == "data_analysis":
                task_result["result"] = "Analysis completed"
            elif agent_type == "research":
                task_result["result"] = "Research findings generated"
            else:
                task_result["result"] = "Task executed"
            
            return task_result
            
        except Exception as e:
            return {
                "task_id": task.get("id", ""),
                "status": "failed",
                "error": str(e)
            }
    
    def register_agent(self, agent_info: Dict[str, Any]) -> str:
        """Register an agent in the system."""
        try:
            agent_id = agent_info.get("id", f"agent_{len(self.agent_registry) + 1}")
            self.agent_registry[agent_id] = {
                "id": agent_id,
                "name": agent_info.get("name", ""),
                "type": agent_info.get("type", ""),
                "capabilities": agent_info.get("capabilities", []),
                "status": "available",
                "registered_date": datetime.now().isoformat()
            }
            return f"Agent {agent_id} registered successfully"
        except Exception as e:
            return f"Registration failed: {str(e)}"
    
    def allocate_resources(self, resource_request: Dict[str, Any]) -> Dict[str, Any]:
        """Allocate resources for task execution."""
        try:
            allocation = {
                "request_id": resource_request.get("id", ""),
                "allocated_agents": [],
                "estimated_duration": resource_request.get("estimated_duration", "1 hour"),
                "priority": resource_request.get("priority", "medium"),
                "status": "allocated"
            }
            
            # Find suitable agents
            required_capabilities = resource_request.get("required_capabilities", [])
            for agent_id, agent in self.agent_registry.items():
                if agent["status"] == "available":
                    agent_capabilities = agent.get("capabilities", [])
                    if any(cap in agent_capabilities for cap in required_capabilities):
                        allocation["allocated_agents"].append(agent_id)
                        agent["status"] = "busy"
            
            if not allocation["allocated_agents"]:
                allocation["status"] = "failed"
                allocation["error"] = "No suitable agents available"
            
            return allocation
            
        except Exception as e:
            return {"error": str(e)}
    
    def get_agent_capabilities(self) -> List[str]:
        """Return agent capabilities."""
        return [
            "Workflow creation and management",
            "Task execution coordination",
            "Agent registration and management",
            "Resource allocation and optimization",
            "Execution monitoring and logging"
        ]
