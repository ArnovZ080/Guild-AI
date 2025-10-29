"""
Autonomous Workflow Execution API
Provides REST endpoints for autonomous workflow creation, execution, and management.
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
from datetime import datetime
import asyncio
import logging

from guild.src.core.autonomous_workflow_executor import (
    workflow_executor, create_workflow, execute_workflow, 
    approve_workflow_step, get_workflow_status, get_transparency_log
)
from guild.src.core.inter_agent_communication import MessagePriority

# API Router
router = APIRouter(prefix="/api/autonomous-workflows", tags=["Autonomous Workflows"])

# Request/Response Models
class WorkflowCreationRequest(BaseModel):
    template_name: str
    parameters: Dict[str, Any]
    initiated_by: str = "system"
    priority: str = "medium"

class WorkflowExecutionRequest(BaseModel):
    workflow_id: str

class WorkflowApprovalRequest(BaseModel):
    workflow_id: str
    step_id: str
    approved: bool
    user_id: str

class WorkflowStatusResponse(BaseModel):
    workflow_id: str
    workflow_name: str
    status: str
    progress: Dict[str, Any]
    transparency_log: List[Dict[str, Any]]
    error_log: List[str]
    judge_score: Optional[float]

class WorkflowTemplateResponse(BaseModel):
    template_name: str
    workflow_type: str
    description: str
    steps: List[Dict[str, Any]]

# API Endpoints

@router.get("/templates")
async def get_workflow_templates():
    """Get available workflow templates."""
    try:
        templates = []
        for name, template in workflow_executor.workflow_templates.items():
            templates.append({
                "template_name": name,
                "workflow_type": template.workflow_type,
                "description": template.description,
                "steps": [
                    {
                        "name": step["name"],
                        "agent": step["agent"],
                        "action": step["action"],
                        "approval_level": step["approval_level"],
                        "estimated_duration": step["estimated_duration"],
                        "dependencies": step["dependencies"]
                    }
                    for step in template.steps
                ]
            })
        
        return {
            "status": "success",
            "templates": templates,
            "total_templates": len(templates)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/create")
async def create_workflow_endpoint(request: WorkflowCreationRequest):
    """Create a new autonomous workflow."""
    try:
        # Convert priority string to enum
        try:
            priority = MessagePriority(request.priority)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid priority level: {request.priority}")
        
        workflow_id = await create_workflow(
            template_name=request.template_name,
            parameters=request.parameters,
            initiated_by=request.initiated_by,
            priority=priority
        )
        
        return {
            "status": "success",
            "workflow_id": workflow_id,
            "message": f"Workflow created successfully from template '{request.template_name}'"
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/execute")
async def execute_workflow_endpoint(request: WorkflowExecutionRequest, background_tasks: BackgroundTasks):
    """Execute an autonomous workflow."""
    try:
        # Execute workflow in background
        background_tasks.add_task(execute_workflow, request.workflow_id)
        
        return {
            "status": "success",
            "workflow_id": request.workflow_id,
            "message": "Workflow execution started"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status/{workflow_id}")
async def get_workflow_status_endpoint(workflow_id: str):
    """Get the status of a workflow."""
    try:
        status = get_workflow_status(workflow_id)
        if not status:
            raise HTTPException(status_code=404, detail=f"Workflow {workflow_id} not found")
        
        return {
            "status": "success",
            "workflow": status
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/approve-step")
async def approve_workflow_step_endpoint(request: WorkflowApprovalRequest):
    """Approve or reject a workflow step."""
    try:
        result = await approve_workflow_step(
            workflow_id=request.workflow_id,
            step_id=request.step_id,
            approved=request.approved,
            user_id=request.user_id
        )
        
        return {
            "status": "success",
            "result": result,
            "message": f"Step {request.step_id} {'approved' if request.approved else 'rejected'}"
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/transparency/{workflow_id}")
async def get_workflow_transparency_endpoint(workflow_id: str):
    """Get transparency log for a workflow."""
    try:
        transparency_log = get_transparency_log(workflow_id)
        
        return {
            "status": "success",
            "workflow_id": workflow_id,
            "transparency_log": transparency_log,
            "total_events": len(transparency_log)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/performance-metrics")
async def get_performance_metrics_endpoint():
    """Get workflow execution performance metrics."""
    try:
        metrics = workflow_executor.get_performance_metrics()
        
        return {
            "status": "success",
            "metrics": metrics
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/active")
async def get_active_workflows():
    """Get all active workflows."""
    try:
        active_workflows = []
        for workflow_id, workflow in workflow_executor.active_workflows.items():
            active_workflows.append({
                "workflow_id": workflow_id,
                "workflow_name": workflow.workflow_name,
                "workflow_type": workflow.workflow_type,
                "status": workflow.status.value,
                "customer_id": workflow.customer_id,
                "content_id": workflow.content_id,
                "initiated_by": workflow.initiated_by,
                "created_at": workflow.created_at.isoformat(),
                "progress": {
                    "total_steps": len(workflow.steps),
                    "completed_steps": len([s for s in workflow.steps if s.status.value == "completed"]),
                    "failed_steps": len([s for s in workflow.steps if s.status.value == "failed"]),
                    "pending_approvals": len([s for s in workflow.steps if s.status.value == "requires_approval"])
                }
            })
        
        return {
            "status": "success",
            "active_workflows": active_workflows,
            "total_active": len(active_workflows)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/test/customer-retention")
async def test_customer_retention_workflow():
    """Test the customer retention workflow."""
    try:
        # Create test customer retention workflow
        test_parameters = {
            "customer_id": "test_customer_001",
            "interaction_data": {
                "type": "support_ticket",
                "content": "Customer expressed frustration with recent product changes",
                "source": "support_system",
                "timestamp": datetime.now().isoformat()
            }
        }
        
        workflow_id = await create_workflow(
            template_name="customer_retention",
            parameters=test_parameters,
            initiated_by="test_user",
            priority=MessagePriority.HIGH
        )
        
        # Execute workflow
        result = await execute_workflow(workflow_id)
        
        return {
            "status": "success",
            "workflow_id": workflow_id,
            "execution_result": result,
            "message": "Customer retention workflow test completed"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/test/customer-onboarding")
async def test_customer_onboarding_workflow():
    """Test the customer onboarding workflow."""
    try:
        # Create test customer onboarding workflow
        test_parameters = {
            "customer_id": "test_customer_002",
            "customer_data": {
                "name": "Test Customer",
                "email": "test@example.com",
                "company": "Test Company",
                "signup_source": "website",
                "signup_date": datetime.now().isoformat()
            }
        }
        
        workflow_id = await create_workflow(
            template_name="customer_onboarding",
            parameters=test_parameters,
            initiated_by="test_user",
            priority=MessagePriority.MEDIUM
        )
        
        # Execute workflow
        result = await execute_workflow(workflow_id)
        
        return {
            "status": "success",
            "workflow_id": workflow_id,
            "execution_result": result,
            "message": "Customer onboarding workflow test completed"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/test/content-optimization")
async def test_content_optimization_workflow():
    """Test the content optimization workflow."""
    try:
        # Create test content optimization workflow
        test_parameters = {
            "content_id": "test_content_001",
            "performance_data": {
                "views": 1000,
                "engagement_rate": 0.15,
                "conversion_rate": 0.05,
                "timeframe": "30d"
            }
        }
        
        workflow_id = await create_workflow(
            template_name="content_optimization",
            parameters=test_parameters,
            initiated_by="test_user",
            priority=MessagePriority.MEDIUM
        )
        
        # Execute workflow
        result = await execute_workflow(workflow_id)
        
        return {
            "status": "success",
            "workflow_id": workflow_id,
            "execution_result": result,
            "message": "Content optimization workflow test completed"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/cancel/{workflow_id}")
async def cancel_workflow_endpoint(workflow_id: str):
    """Cancel an active workflow."""
    try:
        if workflow_id not in workflow_executor.active_workflows:
            raise HTTPException(status_code=404, detail=f"Workflow {workflow_id} not found")
        
        workflow = workflow_executor.active_workflows[workflow_id]
        workflow.status.value = "cancelled"
        
        # Log cancellation
        workflow_executor._log_transparency_event(workflow_id, "workflow_cancelled", {
            "cancelled_by": "user",
            "cancelled_at": datetime.now().isoformat(),
            "workflow_status": workflow.status.value
        })
        
        return {
            "status": "success",
            "workflow_id": workflow_id,
            "message": "Workflow cancelled successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/workflow/{workflow_id}/steps")
async def get_workflow_steps_endpoint(workflow_id: str):
    """Get detailed information about workflow steps."""
    try:
        if workflow_id not in workflow_executor.active_workflows:
            raise HTTPException(status_code=404, detail=f"Workflow {workflow_id} not found")
        
        workflow = workflow_executor.active_workflows[workflow_id]
        steps = []
        
        for step in workflow.steps:
            steps.append({
                "step_id": step.step_id,
                "name": step.name,
                "description": step.description,
                "agent_name": step.agent_name,
                "action": step.action,
                "parameters": step.parameters,
                "dependencies": step.dependencies,
                "approval_level": step.approval_level.value,
                "estimated_duration": step.estimated_duration,
                "timeout": step.timeout,
                "retry_count": step.retry_count,
                "status": step.status.value,
                "result": step.result,
                "error": step.error,
                "started_at": step.started_at.isoformat() if step.started_at else None,
                "completed_at": step.completed_at.isoformat() if step.completed_at else None,
                "judge_score": step.judge_score,
                "judge_feedback": step.judge_feedback
            })
        
        return {
            "status": "success",
            "workflow_id": workflow_id,
            "steps": steps,
            "total_steps": len(steps)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/dashboard/summary")
async def get_dashboard_summary():
    """Get summary data for the dashboard."""
    try:
        # Get performance metrics
        metrics = workflow_executor.get_performance_metrics()
        
        # Get active workflows summary
        active_workflows = []
        for workflow_id, workflow in workflow_executor.active_workflows.items():
            active_workflows.append({
                "workflow_id": workflow_id,
                "workflow_name": workflow.workflow_name,
                "status": workflow.status.value,
                "progress_percentage": len([s for s in workflow.steps if s.status.value == "completed"]) / len(workflow.steps) * 100 if workflow.steps else 0,
                "created_at": workflow.created_at.isoformat(),
                "customer_id": workflow.customer_id,
                "content_id": workflow.content_id
            })
        
        # Get recent transparency events
        recent_events = []
        for workflow_id in list(workflow_executor.active_workflows.keys())[:5]:  # Last 5 workflows
            transparency_log = get_transparency_log(workflow_id)
            if transparency_log:
                recent_events.extend(transparency_log[-3:])  # Last 3 events per workflow
        
        # Sort by timestamp
        recent_events.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
        
        return {
            "status": "success",
            "dashboard_data": {
                "performance_metrics": metrics,
                "active_workflows": active_workflows,
                "recent_events": recent_events[:10],  # Last 10 events
                "available_templates": list(workflow_executor.workflow_templates.keys())
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
