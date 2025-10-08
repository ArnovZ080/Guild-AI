"""
Enhanced Orchestrator API Endpoints
Connects frontend transparency UI to enhanced orchestrator backend
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
from datetime import datetime
import asyncio
import uuid

# Import enhanced orchestrator
from guild.src.core.enhanced_orchestrator import EnhancedOrchestrator, create_enhanced_workflow
from guild.src.core.autonomous_workflow_executor import (
    workflow_executor,
    create_workflow,
    execute_workflow,
    approve_workflow_step,
    get_workflow_status,
    get_transparency_log,
    ApprovalLevel,
    MessagePriority
)
from guild.src.core.integration_capability_registry import (
    get_available_integrations_for_user,
    get_connected_integrations_summary,
    integration_registry
)
from guild.src.core.agent_capability_registry import (
    get_all_agent_capabilities,
    get_agents_by_category,
    get_agents_by_capability
)
from guild.src.models.user_input import UserInput
from guild.src.agents.judge_agent import JudgeAgent

router = APIRouter(prefix="/api/orchestrator", tags=["enhanced_orchestrator"])


# ========================
# Request/Response Models
# ========================

class CreateWorkflowRequest(BaseModel):
    """Request to create autonomous workflow"""
    objective: str
    audience: Optional[Dict[str, Any]] = None
    additional_notes: Optional[str] = None
    user_id: str
    priority: str = "medium"


class CreateWorkflowFromTemplateRequest(BaseModel):
    """Request to create workflow from template"""
    template_name: str
    parameters: Dict[str, Any]
    user_id: str
    priority: str = "medium"
    

class ApproveStepRequest(BaseModel):
    """Request to approve/reject workflow step"""
    workflow_id: str
    step_id: str
    approved: bool
    user_id: str


class RegisterIntegrationRequest(BaseModel):
    """Request to register user integration"""
    user_id: str
    integration_id: str
    credentials: Dict[str, str]


# ========================
# Endpoints
# ========================

@router.post("/workflow/create")
async def create_autonomous_workflow(
    request: CreateWorkflowRequest,
    background_tasks: BackgroundTasks
) -> Dict[str, Any]:
    """
    Create and optionally execute autonomous workflow using enhanced orchestrator.
    
    This endpoint:
    1. Uses enhanced orchestrator with full agent awareness (115+ agents)
    2. Incorporates user's connected integrations
    3. Creates data-grounded workflows
    4. Returns workflow with transparency logging
    """
    try:
        # Create user input
        user_input = UserInput(
            objective=request.objective,
            audience=request.audience,
            additional_notes=request.additional_notes
        )
        
        # Create enhanced workflow
        orchestrator = EnhancedOrchestrator(user_input, request.user_id)
        workflow = await orchestrator.generate_workflow()
        
        # Get connected integrations summary
        integrations_summary = get_connected_integrations_summary(request.user_id)
        
        return {
            "status": "success",
            "workflow_id": f"workflow_{uuid.uuid4()}",
            "workflow_name": "Enhanced Autonomous Workflow",
            "tasks": [task.dict() for task in workflow.tasks],
            "total_tasks": len(workflow.tasks),
            "connected_integrations": integrations_summary,
            "autonomous_level": "full",
            "message": f"Enhanced workflow created with {len(workflow.tasks)} tasks using {len(orchestrator.available_agents)} available agents"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create workflow: {str(e)}")


@router.post("/workflow/template/create")
async def create_workflow_from_template(
    request: CreateWorkflowFromTemplateRequest
) -> Dict[str, Any]:
    """
    Create workflow from predefined template.
    
    Templates include:
    - customer_retention
    - customer_onboarding
    - content_optimization
    """
    try:
        priority_map = {
            "low": MessagePriority.LOW,
            "medium": MessagePriority.MEDIUM,
            "high": MessagePriority.HIGH,
            "critical": MessagePriority.CRITICAL
        }
        
        workflow_id = await create_workflow(
            template_name=request.template_name,
            parameters=request.parameters,
            initiated_by=request.user_id,
            priority=priority_map.get(request.priority, MessagePriority.MEDIUM)
        )
        
        return {
            "status": "success",
            "workflow_id": workflow_id,
            "template_name": request.template_name,
            "message": "Workflow created from template successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create workflow from template: {str(e)}")


@router.post("/workflow/{workflow_id}/execute")
async def execute_autonomous_workflow(
    workflow_id: str,
    background_tasks: BackgroundTasks
) -> Dict[str, Any]:
    """
    Execute autonomous workflow with Judge Layer integration and transparency logging.
    """
    try:
        # Execute workflow in background
        background_tasks.add_task(execute_workflow, workflow_id)
        
        return {
            "status": "execution_started",
            "workflow_id": workflow_id,
            "message": "Workflow execution started in background"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to execute workflow: {str(e)}")


@router.get("/workflow/{workflow_id}/status")
async def get_workflow_status_endpoint(workflow_id: str) -> Dict[str, Any]:
    """
    Get real-time status of workflow execution including:
    - Current progress
    - Step statuses
    - Judge scores
    - Transparency log
    - Performance metrics
    """
    try:
        status = get_workflow_status(workflow_id)
        
        if not status:
            raise HTTPException(status_code=404, detail=f"Workflow {workflow_id} not found")
        
        return {
            "status": "success",
            **status
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get workflow status: {str(e)}")


@router.post("/workflow/{workflow_id}/step/approve")
async def approve_workflow_step_endpoint(request: ApproveStepRequest) -> Dict[str, Any]:
    """
    Approve or reject a workflow step that requires manual approval.
    """
    try:
        result = await approve_workflow_step(
            workflow_id=request.workflow_id,
            step_id=request.step_id,
            approved=request.approved,
            user_id=request.user_id
        )
        
        return {
            "status": "success",
            **result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to approve step: {str(e)}")


@router.get("/workflow/{workflow_id}/transparency")
async def get_workflow_transparency_log(workflow_id: str) -> Dict[str, Any]:
    """
    Get complete transparency log for a workflow.
    Shows all agent actions, decisions, and data usage.
    """
    try:
        transparency_log = get_transparency_log(workflow_id)
        
        return {
            "status": "success",
            "workflow_id": workflow_id,
            "transparency_log": transparency_log,
            "total_events": len(transparency_log)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get transparency log: {str(e)}")


@router.get("/agents/capabilities")
async def get_all_agents_capabilities() -> Dict[str, Any]:
    """
    Get comprehensive list of all 115+ agents with their capabilities.
    Used by frontend to display available workforce and for agent selection.
    """
    try:
        capabilities = get_all_agent_capabilities()
        
        # Convert to JSON-serializable format
        agents_list = [
            {
                "agent_name": cap.agent_name,
                "agent_class_name": cap.agent_class_name,
                "category": cap.category,
                "capabilities": cap.capabilities,
                "specializations": cap.specializations,
                "primary_use_cases": cap.primary_use_cases,
                "input_requirements": cap.input_requirements,
                "integration_dependencies": cap.integration_dependencies
            }
            for cap in capabilities.values()
        ]
        
        # Group by category
        by_category = {}
        for agent in agents_list:
            category = agent["category"]
            if category not in by_category:
                by_category[category] = []
            by_category[category].append(agent)
        
        return {
            "status": "success",
            "total_agents": len(agents_list),
            "agents": agents_list,
            "by_category": by_category,
            "categories": list(by_category.keys())
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get agent capabilities: {str(e)}")


@router.get("/agents/category/{category}")
async def get_agents_by_category_endpoint(category: str) -> Dict[str, Any]:
    """Get all agents in a specific category"""
    try:
        agents = get_agents_by_category(category)
        
        return {
            "status": "success",
            "category": category,
            "agents": [
                {
                    "agent_name": cap.agent_name,
                    "agent_class_name": cap.agent_class_name,
                    "capabilities": cap.capabilities,
                    "specializations": cap.specializations
                }
                for cap in agents
            ],
            "total": len(agents)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get agents by category: {str(e)}")


@router.get("/integrations/user/{user_id}")
async def get_user_integrations(user_id: str) -> Dict[str, Any]:
    """
    Get all available integrations and connection status for a user.
    Shows which platforms are connected and what capabilities they provide.
    """
    try:
        integrations = get_available_integrations_for_user(user_id)
        summary = get_connected_integrations_summary(user_id)
        
        return {
            "status": "success",
            "user_id": user_id,
            "integrations": integrations,
            "summary": summary
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user integrations: {str(e)}")


@router.post("/integrations/register")
async def register_user_integration(request: RegisterIntegrationRequest) -> Dict[str, Any]:
    """
    Register a new integration for a user.
    After registration, agents can autonomously use this integration.
    """
    try:
        integration_registry.register_user_integration(
            user_id=request.user_id,
            integration_id=request.integration_id,
            credentials=request.credentials,
            status="connected"
        )
        
        return {
            "status": "success",
            "integration_id": request.integration_id,
            "user_id": request.user_id,
            "message": f"Integration {request.integration_id} registered successfully - agents can now use it autonomously"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to register integration: {str(e)}")


@router.get("/activity/recent/{user_id}")
async def get_recent_agent_activity(
    user_id: str,
    limit: int = 50
) -> Dict[str, Any]:
    """
    Get recent agent activity for transparency feed.
    Shows all autonomous actions taken by agents for this user.
    """
    try:
        # Get all workflows for user
        user_workflows = [
            wf for wf in workflow_executor.active_workflows.values()
            if wf.initiated_by == user_id or wf.initiated_by == "system"
        ]
        
        # Collect all transparency events
        all_events = []
        for workflow in user_workflows:
            if workflow.transparency_log:
                for event in workflow.transparency_log:
                    all_events.append({
                        **event,
                        "workflow_id": workflow.workflow_id,
                        "workflow_name": workflow.workflow_name
                    })
        
        # Sort by timestamp (most recent first)
        all_events.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
        
        # Limit results
        recent_events = all_events[:limit]
        
        return {
            "status": "success",
            "user_id": user_id,
            "total_events": len(all_events),
            "events": recent_events,
            "recent_count": len(recent_events)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get agent activity: {str(e)}")


@router.get("/health")
async def orchestrator_health_check() -> Dict[str, Any]:
    """
    Health check for enhanced orchestrator system.
    Returns system status, available agents, connected integrations.
    """
    try:
        capabilities = get_all_agent_capabilities()
        performance_metrics = workflow_executor.get_performance_metrics()
        
        return {
            "status": "healthy",
            "system": "Enhanced Orchestrator",
            "version": "2.0",
            "capabilities": {
                "total_agents": len(capabilities),
                "total_integrations": 40,
                "intelligence_agents": len(get_agents_by_category("Intelligence")),
                "automation_agents": len(get_agents_by_category("Automation")),
                "creative_agents": len(get_agents_by_category("Creative"))
            },
            "performance": performance_metrics,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")


@router.post("/chat/process")
async def process_chat_orchestration(
    request: CreateWorkflowRequest,
    background_tasks: BackgroundTasks
) -> Dict[str, Any]:
    """
    Process chat message and create autonomous workflow.
    This is the primary interface for chat-driven autonomous operation.
    
    Example: User says "Increase my revenue by 50%" 
    → Enhanced orchestrator creates multi-agent workflow
    → Executes autonomously with full transparency
    """
    try:
        # Create user input
        user_input = UserInput(
            objective=request.objective,
            audience=request.audience,
            additional_notes=request.additional_notes
        )
        
        # Create enhanced workflow
        orchestrator = EnhancedOrchestrator(user_input, request.user_id)
        workflow = await orchestrator.generate_workflow()
        
        # Get integration context
        integrations_summary = get_connected_integrations_summary(request.user_id)
        
        # Create workflow response for chat interface
        response = {
            "status": "success",
            "response_type": "autonomous_workflow_created",
            "workflow_id": f"workflow_{uuid.uuid4()}",
            "message": f"✅ I've created an autonomous workflow with {len(workflow.tasks)} specialized agents to accomplish your goal.",
            "workflow_details": {
                "name": "Autonomous Business Operation",
                "total_agents": len(workflow.tasks),
                "estimated_duration": "Calculating...",
                "autonomous_level": "full",
                "tasks": [
                    {
                        "task_id": task.task_id,
                        "agent_name": task.agent,
                        "description": task.description,
                        "estimated_duration": task.estimated_duration
                    }
                    for task in workflow.tasks
                ],
                "integrations_used": integrations_summary.get("total_connected", 0),
                "data_sources": integrations_summary.get("data_sources", [])[:5]
            },
            "transparency": {
                "full_transparency_available": True,
                "view_link": f"/workflows/{uuid.uuid4()}/transparency",
                "real_time_updates": True
            },
            "next_actions": [
                {
                    "action": "monitor_progress",
                    "description": "Monitor workflow progress in real-time",
                    "link": "/workflows/active"
                },
                {
                    "action": "view_transparency",
                    "description": "View detailed transparency log",
                    "link": "/transparency"
                }
            ]
        }
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat orchestration failed: {str(e)}")


@router.get("/dashboard/{dashboard_type}/orchestrate")
async def dashboard_orchestration_trigger(
    dashboard_type: str,
    user_id: str,
    action: str,
    parameters: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Trigger autonomous orchestration from dashboard actions.
    
    Examples:
    - /dashboard/customer/orchestrate?action=analyze_sentiment
    - /dashboard/financial/orchestrate?action=generate_forecast
    - /dashboard/content/orchestrate?action=optimize_performance
    """
    try:
        # Map dashboard actions to workflows
        workflow_mapping = {
            "customer": {
                "analyze_sentiment": "customer_retention",
                "enrich_data": "customer_onboarding",
                "predict_churn": "customer_retention"
            },
            "financial": {
                "generate_forecast": "financial_analysis",
                "optimize_expenses": "expense_optimization"
            },
            "content": {
                "optimize_performance": "content_optimization",
                "schedule_content": "content_publishing"
            },
            "business": {
                "generate_insights": "business_intelligence",
                "identify_opportunities": "growth_opportunities"
            }
        }
        
        template_name = workflow_mapping.get(dashboard_type, {}).get(action)
        
        if not template_name:
            return {
                "status": "error",
                "message": f"No workflow template for dashboard action: {dashboard_type}.{action}"
            }
        
        # Create workflow from template
        workflow_id = await create_workflow(
            template_name=template_name,
            parameters=parameters or {},
            initiated_by=user_id,
            priority=MessagePriority.MEDIUM
        )
        
        # Execute workflow
        asyncio.create_task(execute_workflow(workflow_id))
        
        return {
            "status": "success",
            "workflow_id": workflow_id,
            "dashboard_type": dashboard_type,
            "action": action,
            "message": f"Autonomous workflow initiated from {dashboard_type} dashboard"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dashboard orchestration failed: {str(e)}")


@router.get("/system/capabilities")
async def get_system_capabilities() -> Dict[str, Any]:
    """
    Get complete system capabilities including all agents and integrations.
    Used for UI to show available autonomous capabilities.
    """
    try:
        agent_capabilities = get_all_agent_capabilities()
        
        # Organize by category with counts
        categories = {}
        for cap in agent_capabilities.values():
            if cap.category not in categories:
                categories[cap.category] = {
                    "count": 0,
                    "agents": [],
                    "total_capabilities": set()
                }
            categories[cap.category]["count"] += 1
            categories[cap.category]["agents"].append(cap.agent_name)
            categories[cap.category]["total_capabilities"].update(cap.capabilities)
        
        # Convert sets to lists for JSON
        for category in categories.values():
            category["total_capabilities"] = list(category["total_capabilities"])
        
        return {
            "status": "success",
            "system": "Guild-AI Autonomous Workforce",
            "total_agents": len(agent_capabilities),
            "categories": categories,
            "autonomous_operations": [
                "Content creation and distribution",
                "Customer intelligence and engagement",
                "Financial analysis and reporting",
                "Marketing campaign execution",
                "Sales automation and CRM",
                "Business intelligence and insights",
                "Platform automation across 40+ integrations",
                "Multi-channel communication",
                "Visual and video content creation",
                "Web and desktop automation"
            ],
            "integration_ecosystem": {
                "total_platforms": 40,
                "categories": [
                    "Accounting & Finance",
                    "Social Media",
                    "Advertising",
                    "Email Marketing",
                    "Analytics",
                    "CRM",
                    "E-commerce",
                    "Productivity",
                    "Communication",
                    "Recruitment"
                ]
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get system capabilities: {str(e)}")


@router.get("/performance/metrics")
async def get_performance_metrics() -> Dict[str, Any]:
    """
    Get workflow execution performance metrics.
    Used for monitoring and optimization.
    """
    try:
        metrics = workflow_executor.get_performance_metrics()
        
        return {
            "status": "success",
            "metrics": metrics,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get performance metrics: {str(e)}")


# Export router
__all__ = ['router']

