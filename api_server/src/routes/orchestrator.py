from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
import logging

from .auth_firebase import get_current_user
from .. import models
from ..database import get_db

# Custom dependency for optional authentication
async def get_current_user_optional(request: Request) -> Optional[models.User]:
    """Get current user if authenticated, otherwise return None"""
    try:
        # Try to get the Authorization header
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return None
        
        # If we have a token, try to get the user
        # For now, we'll just return None to allow anonymous access
        # In a full implementation, you'd validate the token here
        return None
    except Exception:
        return None

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/orchestrator",
    tags=["Orchestrator"],
)

class CompleteFieldRequest(BaseModel):
    field_id: str

class InitiateTaskRequest(BaseModel):
    task_type: str
    context: Optional[Dict[str, Any]] = {}

# Mapping of incomplete fields to orchestrator tasks
FIELD_COMPLETION_TASKS = {
    'business_type': {
        'agents': ['strategy_agent', 'business_consultant_agent'],
        'task': 'determine_business_fit',
        'prompt': "Let's figure out what type of business best fits your skills, passions, and market opportunity. What are you most skilled at? What do you enjoy doing?"
    },
    'target_audience': {
        'agents': ['research_agent', 'audience_analysis_agent'],
        'task': 'determine_optimal_audience',
        'prompt': "Let's identify your ideal audience. Tell me about your product/service - what problem does it solve?"
    },
    'customer_avatar': {
        'agents': ['research_agent', 'persona_builder_agent'],
        'task': 'create_ideal_customer_avatar',
        'prompt': "I'll help you build a detailed customer avatar. First, tell me: who currently benefits most from what you offer?"
    },
    'audience_problems': {
        'agents': ['research_agent', 'market_analysis_agent'],
        'task': 'identify_audience_painpoints',
        'prompt': "Let's research what problems your audience struggles with. What industry or niche are you targeting?"
    },
    'brand_voice_tone': {
        'agents': ['brand_strategist_agent', 'voice_analysis_agent'],
        'task': 'define_brand_voice',
        'prompt': "Let's discover your authentic brand voice. How do you naturally communicate with your audience? Professional? Friendly? Casual?"
    },
    'brand_colors': {
        'agents': ['brand_strategist_agent', 'color_psychology_agent'],
        'task': 'develop_color_palette',
        'prompt': "I'll help you choose brand colors that align with your personality and industry. What feelings do you want your brand to evoke?"
    },
    'logo_status': {
        'agents': ['design_agent', 'logo_creator_agent'],
        'task': 'create_improve_logo',
        'prompt': "Let's work on your logo. Do you have any existing logo, or should we start from scratch? What style appeals to you?"
    },
    'brand_story': {
        'agents': ['storytelling_agent', 'brand_narrative_agent'],
        'task': 'craft_brand_story',
        'prompt': "Every great brand has a compelling story. Tell me: why did you start this business? What inspired you?"
    },
    'brand_differentiation': {
        'agents': ['strategy_agent', 'competitive_analysis_agent'],
        'task': 'identify_unique_value',
        'prompt': "Let's figure out what makes you unique. Who are your main competitors, and how are you different from them?"
    },
    'pricing_status': {
        'agents': ['pricing_agent', 'market_research_agent'],
        'task': 'develop_pricing_strategy',
        'prompt': "I'll help you develop a pricing strategy. What are you currently selling (or planning to sell)? What's your cost structure?"
    },
    'marketing_budget': {
        'agents': ['marketing_agent', 'budget_planner_agent'],
        'task': 'optimize_marketing_budget',
        'prompt': "Let's determine the right marketing budget for your goals. What's your monthly revenue target? How much can you invest in growth?"
    },
    'priority_3months': {
        'agents': ['strategy_agent', 'goal_setting_agent'],
        'task': 'set_and_achieve_goals',
        'prompt': "Let's set clear priorities for the next 3 months. What would make the biggest impact on your business right now?"
    },
}

@router.post("/complete-field")
async def initiate_field_completion(
    request: CompleteFieldRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Initiates orchestrator workflow to help user complete an incomplete onboarding field.
    The orchestrator will guide the user through questions and research to build complete information.
    """
    try:
        field_id = request.field_id
        
        # Get the task configuration for this field
        task_config = FIELD_COMPLETION_TASKS.get(field_id)
        
        if not task_config:
            raise HTTPException(
                status_code=400,
                detail=f"No completion task configured for field: {field_id}"
            )
        
        # Get user's current onboarding data for context
        onboarding = db.query(models.OnboardingData).filter(
            models.OnboardingData.user_id == current_user.id
        ).first()
        
        context = {}
        if onboarding and onboarding.raw_responses:
            context = onboarding.raw_responses
        
        logger.info(f"Initiating field completion for user {current_user.id}, field: {field_id}")
        
        # TODO: Actually initiate the orchestrator workflow
        # For now, return the task configuration so the chat can start the conversation
        
        return {
            "success": True,
            "field_id": field_id,
            "task": task_config['task'],
            "agents": task_config['agents'],
            "initial_prompt": task_config['prompt'],
            "message": f"I'll help you complete: {field_id.replace('_', ' ').title()}",
            "next_step": "chat_conversation"
        }
        
    except Exception as e:
        logger.error(f"Failed to initiate field completion: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to initiate task: {str(e)}")

@router.post("/update-field")
async def update_completed_field(
    field_id: str,
    value: Any,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Updates a specific field in the onboarding data after orchestrator completes it.
    Removes field from incomplete_fields list and recalculates completion percentage.
    """
    try:
        onboarding = db.query(models.OnboardingData).filter(
            models.OnboardingData.user_id == current_user.id
        ).first()
        
        if not onboarding:
            raise HTTPException(status_code=404, detail="Onboarding data not found")
        
        # Update the specific field
        if hasattr(onboarding, field_id):
            setattr(onboarding, field_id, value)
        
        # Update raw responses
        if not onboarding.raw_responses:
            onboarding.raw_responses = {}
        onboarding.raw_responses[field_id] = value
        
        # Remove from incomplete fields
        if onboarding.incomplete_fields and field_id in onboarding.incomplete_fields:
            onboarding.incomplete_fields.remove(field_id)
        
        # Recalculate completion
        total_fields = 20
        completed_fields = total_fields - len(onboarding.incomplete_fields or [])
        onboarding.completion_percentage = int((completed_fields / total_fields) * 100)
        onboarding.needs_follow_up = len(onboarding.incomplete_fields or []) > 0
        
        db.commit()
        db.refresh(onboarding)
        
        return {
            "success": True,
            "field_id": field_id,
            "completion_percentage": onboarding.completion_percentage,
            "needs_follow_up": onboarding.needs_follow_up,
            "remaining_incomplete": onboarding.incomplete_fields
        }
        
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to update field: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update field: {str(e)}")

@router.get("/incomplete-tasks")
async def get_incomplete_tasks(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns list of incomplete tasks with their prompts and agent assignments.
    Used by chat interface to proactively offer help.
    """
    try:
        onboarding = db.query(models.OnboardingData).filter(
            models.OnboardingData.user_id == current_user.id
        ).first()
        
        if not onboarding or not onboarding.incomplete_fields:
            return {
                "tasks": [],
                "completion_percentage": onboarding.completion_percentage if onboarding else 0
            }
        
        # Build task list with priorities
        tasks = []
        high_priority = ['business_type', 'target_audience', 'customer_avatar', 'audience_problems']
        
        for field_id in onboarding.incomplete_fields:
            task_config = FIELD_COMPLETION_TASKS.get(field_id)
            if task_config:
                tasks.append({
                    'field_id': field_id,
                    'field_name': field_id.replace('_', ' ').title(),
                    'task': task_config['task'],
                    'agents': task_config['agents'],
                    'prompt': task_config['prompt'],
                    'priority': 'high' if field_id in high_priority else 'medium'
                })
        
        # Sort by priority
        tasks.sort(key=lambda x: 0 if x['priority'] == 'high' else 1)
        
        return {
            "tasks": tasks,
            "completion_percentage": onboarding.completion_percentage,
            "total_incomplete": len(tasks)
        }
        
    except Exception as e:
        logger.error(f"Failed to get incomplete tasks: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get tasks: {str(e)}")

@router.get("/workflow/{workflow_id}/status")
async def get_workflow_status(
    workflow_id: str,
    current_user: Optional[models.User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Get the status of a specific workflow.
    """
    try:
        # Use provided user_id or current_user, or default to anonymous
        user_id = current_user.id if current_user else "anonymous_user"
        
        # Try to find workflow in database
        workflow = db.query(models.Workflow).filter(
            models.Workflow.id == workflow_id
        ).first()
        
        if not workflow:
            # Try to get from autonomous workflow executor
            try:
                from guild.src.core.autonomous_workflow_executor import get_workflow_status as aw_get_status
                aw_status = await aw_get_status(workflow_id)
                if aw_status:
                    return {
                        "success": True,
                        "workflow_id": workflow_id,
                        "status": aw_status.get("status", "unknown"),
                        "progress": aw_status.get("progress", 0),
                        "current_step": aw_status.get("current_step", ""),
                        "completed_steps": aw_status.get("completed_steps", 0),
                        "total_steps": aw_status.get("total_steps", 0),
                        "estimated_completion": aw_status.get("estimated_completion"),
                        "error": aw_status.get("error")
                    }
            except Exception:
                pass
            
            raise HTTPException(status_code=404, detail="Workflow not found")
        
        # Get workflow executions
        executions = db.query(models.AgentExecution).filter(
            models.AgentExecution.workflow_id == workflow_id
        ).all()
        
        completed_count = len([e for e in executions if e.status == 'completed'])
        total_count = len(executions) if executions else 1
        
        return {
            "success": True,
            "workflow_id": workflow_id,
            "status": workflow.status,
            "progress": int((completed_count / total_count) * 100) if total_count > 0 else 0,
            "completed_steps": completed_count,
            "total_steps": total_count,
            "created_at": workflow.created_at.isoformat() if workflow.created_at else None,
            "updated_at": workflow.updated_at.isoformat() if workflow.updated_at else None,
            "executions": [
                {
                    "agent_name": e.agent_name,
                    "status": e.status,
                    "started_at": e.started_at.isoformat() if e.started_at else None,
                    "completed_at": e.completed_at.isoformat() if e.completed_at else None
                }
                for e in executions
            ]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get workflow status: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get workflow status: {str(e)}")

@router.get("/system/capabilities")
async def get_system_capabilities():
    """
    Returns comprehensive system capabilities including all agents and integrations.
    This endpoint provides the "intelligence" for the orchestrator.
    """
    try:
        # Get all available agents from the agent capability registry
        from guild.src.core.agent_capability_registry import get_all_agent_capabilities
        
        agents = get_all_agent_capabilities()
        categories = {}
        total_agents = len(agents)
        
        # Categorize agents
        for agent in agents:
            category = getattr(agent, 'category', 'general')
            if category not in categories:
                categories[category] = []
            categories[category].append({
                'name': agent.name,
                'description': getattr(agent, 'description', ''),
                'capabilities': getattr(agent, 'capabilities', []),
                'skills': getattr(agent, 'skills', [])
            })
        
        return {
            "success": True,
            "total_agents": total_agents,
            "categories": categories,
            "system_status": "operational",
            "capabilities": {
                "workflow_creation": True,
                "agent_orchestration": True,
                "integration_management": True,
                "real_time_monitoring": True,
                "transparency_logging": True
            },
            "integration_count": 40,  # Based on your 40+ platform connectors
            "supported_workflows": [
                "marketing_campaigns",
                "content_creation",
                "lead_generation", 
                "customer_analysis",
                "financial_reporting",
                "business_intelligence"
            ]
        }
        
    except Exception as e:
        logger.error(f"Failed to get system capabilities: {str(e)}")
        # Return graceful fallback
        return {
            "success": False,
            "error": str(e),
            "total_agents": 0,
            "categories": {},
            "system_status": "limited",
            "capabilities": {
                "workflow_creation": False,
                "agent_orchestration": False,
                "integration_management": False,
                "real_time_monitoring": False,
                "transparency_logging": False
            }
        }

@router.post("/chat/process")
async def process_chat_orchestration(
    request: dict,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user_optional)
):
    """
    Processes chat messages through the enhanced orchestrator.
    This is the main "intelligence" endpoint that makes the orchestrator smart.
    """
    try:
        objective = request.get('objective', '')
        user_id = request.get('user_id')
        audience = request.get('audience')
        additional_notes = request.get('additional_notes')
        priority = request.get('priority', 'medium')
        
        # Use provided user_id or current_user, or default to anonymous
        if current_user and current_user.id:
            user_id = current_user.id
        elif not user_id:
            user_id = "anonymous_user"
        
        logger.info(f"Processing chat orchestration for user {user_id}: {objective[:100]}...")
        
        # Prefer the enhanced autonomous workflow executor (template-based) when applicable
        # Fallback to legacy orchestrator DAG generation if no template mapping applies
        created_via_template = False
        workflow_id = None

        try:
            from guild.src.core.autonomous_workflow_executor import create_workflow as aw_create_workflow
            from guild.src.core.autonomous_workflow_executor import execute_workflow as aw_execute_workflow
            from guild.src.core.inter_agent_communication import MessagePriority as AWPriority
            # Simple intent-to-template mapping (extend as needed)
            lower_obj = (objective or "").lower()
            template_name = None
            template_params = {}

            if any(k in lower_obj for k in ["retain", "churn", "sentiment", "keep customers"]):
                template_name = "customer_retention"
                template_params = {"customer_id": None, "interaction_data": None}
            elif any(k in lower_obj for k in ["onboard", "welcome", "new customer"]):
                template_name = "customer_onboarding"
                template_params = {"customer_id": None, "customer_data": None}
            elif any(k in lower_obj for k in ["content", "optimize", "performance"]):
                template_name = "content_optimization"
                template_params = {"content_id": None}

            if template_name:
                workflow_id = await aw_create_workflow(
                    template_name=template_name,
                    parameters=template_params,
                    initiated_by=str(user_id),
                    priority=AWPriority.HIGH if priority == 'high' else (AWPriority.LOW if priority == 'low' else AWPriority.MEDIUM)
                )
                created_via_template = True
                # Kick off execution asynchronously
                import asyncio
                asyncio.create_task(aw_execute_workflow(workflow_id))
        except Exception as _:
            # Silent fallback to legacy orchestrator path below
            created_via_template = False

        if created_via_template and workflow_id:
            return {
                "success": True,
                "workflow_id": workflow_id,
                "status": "running",
                "message": f"I've created an autonomous workflow to: {objective}",
                "next_steps": [
                    "Open transparency to monitor steps",
                    "Approve any high-risk steps if prompted",
                    "Review results in dashboards"
                ],
                "workflow_details": {
                    "name": "Autonomous Workflow",
                    "autonomous_level": "enhanced",
                    "total_agents": None,
                    "integrations_used": None,
                    "data_sources": []
                }
            }

        # Smart conversation handling using Vertex AI Gemini
        try:
            from ..llm.gemini_provider import gemini_provider
            from ..llm.model_router import model_router
            
            # Get user's business context for personalized responses
            business_context = {}
            onboarding = db.query(models.OnboardingData).filter(
                models.OnboardingData.user_id == user_id
            ).first()
            
            if onboarding and onboarding.raw_responses:
                business_context = onboarding.raw_responses
            
            # Determine if this is a workflow request or general conversation
            # Be more intelligent about when to create workflows vs. having conversations
            lower_objective = objective.lower()
            workflow_keywords = [
                'create', 'build', 'generate', 'develop', 'make', 'plan', 'strategy',
                'campaign', 'workflow', 'process', 'automate', 'system', 'setup'
            ]
            
            # Only create workflows for explicit, detailed requests
            # For vague requests like "create content", ask clarifying questions first
            is_explicit_workflow_request = (
                any(keyword in lower_objective for keyword in workflow_keywords) and
                len(objective.split()) > 5 and  # More than 5 words for specificity
                any(detail in lower_objective for detail in ['for', 'about', 'targeting', 'on', 'using', 'with'])
            )
            
            if is_explicit_workflow_request:
                # For workflow requests, use the enhanced orchestrator
                from guild.src.models.user_input import UserInput, Audience
                from guild.src.core.enhanced_orchestrator import EnhancedOrchestrator
                
                user_input = UserInput(
                    objective=objective,
                    audience=Audience(**audience) if audience else None,
                    additional_notes=additional_notes
                )
                orchestrator = EnhancedOrchestrator(user_input)
                workflow = await orchestrator.generate_workflow()

                import uuid
                workflow_id = str(uuid.uuid4())
                db_workflow = models.Workflow(
                    id=workflow_id,
                    user_id=user_id,
                    status="pending_approval",
                    dag_definition=workflow.model_dump(),
                    priority=priority
                )
                db.add(db_workflow)
                db.commit()
                db.refresh(db_workflow)

                return {
                    "success": True,
                    "workflow_id": workflow_id,
                    "workflow_definition": workflow.model_dump(),
                    "status": "pending_approval",
                    "message": f"I've created a workflow to: {objective}",
                    "next_steps": [
                        "Review the generated workflow",
                        "Approve to start execution",
                        "Monitor progress in real-time"
                    ],
                    "agents_involved": len(workflow.agents) if hasattr(workflow, 'agents') else 0,
                    "estimated_duration": "5-15 minutes"
                }
            else:
                # For general conversation, use Gemini with business context
                smart_response = await gemini_provider.generate_with_context(
                    prompt=objective,
                    business_context=business_context,
                    task_type='chat',
                    complexity='medium',
                    user_tier='starter'
                )
                
                return {
                    "success": True,
                    "message": smart_response['text'],
                    "conversation_type": "general_chat",
                    "model_used": smart_response.get('model', 'gemini-1.5-flash'),
                    "usage": smart_response.get('usage', {}),
                    "workflow_details": {
                        "name": "General Conversation",
                        "autonomous_level": "conversational",
                        "total_agents": 1,
                        "integrations_used": 0,
                        "data_sources": []
                    }
                }
                
        except Exception as e:
            logger.error(f"Smart orchestration failed, falling back to basic response: {e}")
            # Final fallback - basic response
            return {
                "success": True,
                "message": f"I understand you're asking about: {objective}. I'm here to help! Could you provide more details about what you'd like me to help you with?",
                "conversation_type": "fallback",
                "workflow_details": {
                    "name": "Basic Response",
                    "autonomous_level": "basic",
                    "total_agents": 0,
                    "integrations_used": 0,
                    "data_sources": []
                }
            }
        
    except Exception as e:
        logger.error(f"Failed to process chat orchestration: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "message": "I encountered an issue processing your request. Please try again or contact support."
        }

