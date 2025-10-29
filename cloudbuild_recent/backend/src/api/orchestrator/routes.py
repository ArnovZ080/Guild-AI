"""
Orchestrator API Routes
FastAPI endpoints for orchestrator action initiation and management
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from fastapi.responses import JSONResponse
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field
import logging
from datetime import datetime
import uuid
import asyncio

from ...services.database_service import db_service
from ...agents.enhanced_orchestrator import EnhancedOrchestratorAgent
from ...agents.judge_agent import JudgeAgent

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/orchestrator", tags=["orchestrator"])

# Initialize orchestrator and judge agents
orchestrator_agent = EnhancedOrchestratorAgent()
judge_agent = JudgeAgent()

# Pydantic models for request/response
class OrchestratorActionRequest(BaseModel):
    user_id: str = Field(..., description="User ID")
    follow_up_question_id: Optional[str] = Field(None, description="Associated follow-up question ID")
    action_type: str = Field(..., description="Type of action to initiate")
    task_description: str = Field(..., description="Description of the task")
    assigned_agents: List[str] = Field(..., description="List of agent IDs to assign")
    context: Optional[Dict[str, Any]] = Field(default={}, description="Additional context")
    priority: str = Field(default="medium", description="Task priority")
    metadata: Optional[Dict[str, Any]] = Field(default={}, description="Additional metadata")

class OrchestratorActionResponse(BaseModel):
    action_id: str
    session_id: str
    status: str
    message: str
    estimated_duration: Optional[int] = None

class OrchestratorStatusUpdate(BaseModel):
    action_id: str
    status: str
    progress_percentage: Optional[int] = None
    result_data: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None

class WorkflowContractRequest(BaseModel):
    user_id: str = Field(..., description="User ID")
    user_instruction: str = Field(..., description="User's instruction for the workflow")
    objectives: List[str] = Field(..., description="List of objectives")
    brand_guidelines: Optional[Dict[str, Any]] = Field(default={}, description="Brand guidelines")
    audience_profile: Optional[Dict[str, Any]] = Field(default={}, description="Audience profile")
    context: Optional[Dict[str, Any]] = Field(default={}, description="Additional context")

class WorkflowExecutionResponse(BaseModel):
    contract_id: str
    workflow_result: Dict[str, Any]
    quality_summary: Dict[str, Any]
    completion_time: str

@router.post("/initiate", response_model=OrchestratorActionResponse)
async def initiate_orchestrator_action(
    action_request: OrchestratorActionRequest,
    background_tasks: BackgroundTasks
):
    """Initiate an orchestrator action from a follow-up question"""
    try:
        # Create orchestrator action in database
        action_data = {
            'task': action_request.action_type,
            'description': action_request.task_description,
            'agents': action_request.assigned_agents
        }
        
        orchestrator_action = await db_service.create_orchestrator_action(
            user_id=action_request.user_id,
            follow_up_question_id=action_request.follow_up_question_id,
            action_data=action_data
        )
        
        # Prepare task for orchestrator
        task = {
            'description': action_request.task_description,
            'task_data': {
                'action_type': action_request.action_type,
                'assigned_agents': action_request.assigned_agents,
                'context': action_request.context,
                'priority': action_request.priority,
                'metadata': action_request.metadata
            },
            'user_id': action_request.user_id,
            'action_id': str(orchestrator_action.id)
        }
        
        # Execute task in background
        background_tasks.add_task(
            execute_orchestrator_task,
            task,
            str(orchestrator_action.id),
            action_request.user_id
        )
        
        # Generate session ID for tracking
        session_id = f"orchestrator_{orchestrator_action.id}"
        
        return OrchestratorActionResponse(
            action_id=str(orchestrator_action.id),
            session_id=session_id,
            status="initiated",
            message=f"Orchestrator action initiated for {action_request.action_type}",
            estimated_duration=30  # Default estimate
        )
        
    except Exception as e:
        logger.error(f"Error initiating orchestrator action: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/workflow/create", response_model=WorkflowExecutionResponse)
async def create_and_execute_workflow(
    workflow_request: WorkflowContractRequest,
    background_tasks: BackgroundTasks
):
    """Create and execute a complete workflow with Judge Layer integration"""
    try:
        # Prepare workflow task
        task = {
            'user_instruction': workflow_request.user_instruction,
            'objectives': workflow_request.objectives,
            'brand_guidelines': workflow_request.brand_guidelines,
            'audience_profile': workflow_request.audience_profile,
            'context': workflow_request.context
        }
        
        # Execute workflow with Judge Layer
        result = await orchestrator_agent._execute_main_task(
            task=task,
            session_id=f"workflow_{uuid.uuid4()}"
        )
        
        if result.get('success'):
            return WorkflowExecutionResponse(
                contract_id=result.get('contract_id', 'unknown'),
                workflow_result=result.get('workflow_result', {}),
                quality_summary=result.get('quality_summary', {}),
                completion_time=result.get('completion_time', datetime.now().isoformat())
            )
        else:
            raise HTTPException(status_code=500, detail=result.get('error', 'Workflow execution failed'))
        
    except Exception as e:
        logger.error(f"Error creating and executing workflow: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/status/update")
async def update_orchestrator_status(status_update: OrchestratorStatusUpdate):
    """Update the status of an orchestrator action"""
    try:
        action = await db_service.update_orchestrator_action_status(
            action_id=status_update.action_id,
            status=status_update.status,
            progress_percentage=status_update.progress_percentage,
            result_data=status_update.result_data,
            error_message=status_update.error_message
        )
        
        return {
            "success": True,
            "action_id": status_update.action_id,
            "status": action.status,
            "updated_at": action.updated_at.isoformat() if hasattr(action, 'updated_at') else datetime.now().isoformat(),
            "message": "Orchestrator status updated successfully"
        }
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating orchestrator status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/actions/{user_id}")
async def get_user_orchestrator_actions(user_id: str, status: Optional[str] = None):
    """Get orchestrator actions for a user"""
    try:
        actions = await db_service.get_user_orchestrator_actions(user_id, status)
        
        return {
            "user_id": user_id,
            "actions": [
                {
                    "id": str(action.id),
                    "action_type": action.action_type,
                    "task_description": action.task_description,
                    "assigned_agents": action.assigned_agents,
                    "status": action.status,
                    "progress_percentage": action.progress_percentage,
                    "result_data": action.result_data,
                    "error_message": action.error_message,
                    "initiated_at": action.initiated_at.isoformat(),
                    "started_at": action.started_at.isoformat() if action.started_at else None,
                    "completed_at": action.completed_at.isoformat() if action.completed_at else None
                }
                for action in actions
            ],
            "total_count": len(actions)
        }
        
    except Exception as e:
        logger.error(f"Error getting orchestrator actions: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/action/{action_id}")
async def get_orchestrator_action_details(action_id: str):
    """Get details of a specific orchestrator action"""
    try:
        # This would require a method to get action by ID
        # For now, we'll return a placeholder
        return {
            "action_id": action_id,
            "message": "Action details endpoint - to be implemented",
            "note": "This endpoint requires additional database method implementation"
        }
        
    except Exception as e:
        logger.error(f"Error getting orchestrator action details: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/judge/evaluate")
async def evaluate_with_judge_layer(
    deliverable_data: Dict[str, Any],
    task_type: str,
    quality_requirements: Dict[str, Any],
    brand_guidelines: Dict[str, Any] = {},
    audience_profile: Dict[str, Any] = {}
):
    """Evaluate a deliverable using the Judge Layer"""
    try:
        # Prepare evaluation task
        task = {
            'task_id': f"evaluation_{uuid.uuid4()}",
            'task_type': task_type,
            'deliverable_data': deliverable_data,
            'quality_requirements': quality_requirements,
            'brand_guidelines': brand_guidelines,
            'audience_profile': audience_profile,
            'judge_operation': 'evaluate'
        }
        
        # Run evaluation
        result = await judge_agent._evaluate_deliverable(task, "judge_session")
        
        return {
            "success": result.get('success', False),
            "evaluation_result": result,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error evaluating with Judge Layer: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/judge/rubric")
async def generate_quality_rubric(
    task_type: str,
    objectives: List[str],
    brand_guidelines: Dict[str, Any] = {},
    audience_profile: Dict[str, Any] = {}
):
    """Generate a quality rubric using the Judge Layer"""
    try:
        # Prepare rubric generation task
        task = {
            'task_type': task_type,
            'objectives': objectives,
            'brand_guidelines': brand_guidelines,
            'audience_profile': audience_profile,
            'judge_operation': 'generate_rubric'
        }
        
        # Generate rubric
        result = await judge_agent._generate_quality_rubric(task, "rubric_session")
        
        return {
            "success": result.get('success', False),
            "rubric": result.get('rubric', {}),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error generating quality rubric: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/capabilities")
async def get_orchestrator_capabilities():
    """Get orchestrator capabilities and available actions"""
    try:
        return {
            "orchestrator_capabilities": [
                "workflow_planning",
                "rubric_generation", 
                "agent_coordination",
                "quality_assurance",
                "revision_management",
                "task_delegation",
                "dependency_management",
                "performance_tracking"
            ],
            "judge_layer_capabilities": [
                "rubric_generation",
                "evaluation_league",
                "quality_scoring",
                "auto_revision",
                "escalation_management"
            ],
            "available_actions": [
                "determine_optimal_audience",
                "create_ideal_customer_avatar",
                "identify_audience_painpoints",
                "analyze_audience_size",
                "determine_business_fit",
                "develop_pricing_strategy",
                "optimize_marketing_budget",
                "set_and_achieve_goals",
                "discover_user_needs",
                "setup_data_storage",
                "setup_secure_storage",
                "define_brand_voice",
                "develop_color_palette",
                "create_improve_logo",
                "craft_brand_story",
                "identify_unique_value"
            ],
            "supported_agents": [
                "research_agent",
                "audience_analysis_agent",
                "persona_builder_agent",
                "market_analysis_agent",
                "analytics_agent",
                "strategy_agent",
                "business_consultant_agent",
                "pricing_agent",
                "market_research_agent",
                "marketing_agent",
                "budget_planner_agent",
                "goal_setting_agent",
                "consultation_agent",
                "data_management_agent",
                "storage_setup_agent",
                "security_agent",
                "data_protection_agent",
                "brand_strategist_agent",
                "voice_analysis_agent",
                "color_psychology_agent",
                "design_agent",
                "logo_creator_agent",
                "storytelling_agent",
                "brand_narrative_agent",
                "competitive_analysis_agent"
            ]
        }
        
    except Exception as e:
        logger.error(f"Error getting orchestrator capabilities: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def orchestrator_health_check():
    """Health check for orchestrator system"""
    try:
        return {
            "status": "healthy",
            "orchestrator_agent": "active",
            "judge_agent": "active",
            "database_service": "connected",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Orchestrator health check failed: {e}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

# Background task for executing orchestrator tasks
async def execute_orchestrator_task(task: Dict[str, Any], action_id: str, user_id: str):
    """Background task to execute orchestrator action"""
    try:
        # Update status to in_progress
        await db_service.update_orchestrator_action_status(
            action_id=action_id,
            status="in_progress",
            progress_percentage=10
        )
        
        # Simulate task execution (replace with actual orchestrator logic)
        await asyncio.sleep(2)  # Simulate work
        
        # Update progress
        await db_service.update_orchestrator_action_status(
            action_id=action_id,
            status="in_progress",
            progress_percentage=50
        )
        
        # Simulate more work
        await asyncio.sleep(2)
        
        # Complete the task
        result_data = {
            "task_completed": True,
            "agents_used": task['task_data'].get('assigned_agents', []),
            "execution_time": "4 seconds",
            "result_summary": f"Successfully executed {task['task_data'].get('action_type', 'unknown')} action"
        }
        
        await db_service.update_orchestrator_action_status(
            action_id=action_id,
            status="completed",
            progress_percentage=100,
            result_data=result_data
        )
        
        logger.info(f"Completed orchestrator action: {action_id}")
        
    except Exception as e:
        logger.error(f"Error executing orchestrator task: {e}")
        await db_service.update_orchestrator_action_status(
            action_id=action_id,
            status="failed",
            error_message=str(e)
        )
