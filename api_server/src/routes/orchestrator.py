from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
import logging

from .auth import get_current_user
from .. import models
from ..database import get_db

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/orchestrator",
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

