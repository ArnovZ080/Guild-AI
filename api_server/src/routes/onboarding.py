from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from datetime import datetime
import os

from .auth_firebase import get_current_user
from .. import models
from ..database import get_db

# from guild.src.agents.onboarding_agent import OnboardingAgent
# from guild.src.models.user_input import UserInput

router = APIRouter(
    prefix="/api/onboarding",
    tags=["Onboarding"],
)

class OnboardingConverseRequest(BaseModel):
    session_id: str # To maintain state across calls, a session ID is needed
    current_state: str
    user_response: Optional[str] = None

class OnboardingConverseResponse(BaseModel):
    agent_response: str
    is_complete: bool
    output_document: Optional[dict] = None
    next_state: str


@router.post("/converse", response_model=OnboardingConverseResponse)
async def converse_with_onboarding_agent(
    request: OnboardingConverseRequest
):
    """
    Handles a single turn in the conversational onboarding process.
    """
    try:
        if os.getenv("NO_LLM") == "1":
            return OnboardingConverseResponse(
                agent_response="Got it. I've saved your response. Let's continue.",
                is_complete=False,
                output_document=None,
                next_state="NEXT"
            )
        # In a real application, we would use the session_id to retrieve
        # the agent's state from a cache like Redis. For this example,
        # we re-instantiate the agent and set its state on each call.
        agent = OnboardingAgent(UserInput(objective="User Onboarding"))
        agent.state = request.current_state

        # The business_description would also need to be persisted in the session state
        # This is a simplification for now.
        if request.current_state == "AWAITING_BRAND_VOICE_PREFERENCES":
            agent.business_description = "A business description would be retrieved from session state here."

        response_data = await agent.run_conversational_step(user_response=request.user_response)

        return OnboardingConverseResponse(**response_data)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/start", response_model=OnboardingConverseResponse)
async def start_onboarding_session():
    """
    Initiates a new onboarding conversation.
    """
    try:
        if os.getenv("NO_LLM") == "1":
            return OnboardingConverseResponse(
                agent_response="Welcome to Guild onboarding. I'll ask a few quick questions to learn about your business.",
                is_complete=False,
                output_document=None,
                next_state="START"
            )

        agent = OnboardingAgent(UserInput(objective="Start onboarding process"))
        response_data = await agent.run_conversational_step()

        return OnboardingConverseResponse(**response_data)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Source of Truth Management Endpoints

class SaveOnboardingDataRequest(BaseModel):
    responses: Dict[str, Any]
    incomplete_fields: Optional[List[str]] = []

@router.post("/save")
async def save_onboarding_data(
    request: SaveOnboardingDataRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Save onboarding responses as source of truth for all agent operations"""
    try:
        # Ensure user exists
        if not current_user:
            raise HTTPException(status_code=401, detail="User not authenticated")
        
        if not current_user.id:
            raise HTTPException(status_code=400, detail="User ID not found")
        
        # Check if user exists in database
        user = db.query(models.User).filter(models.User.id == current_user.id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found in database")
        
        onboarding = db.query(models.OnboardingData).filter(
            models.OnboardingData.user_id == current_user.id
        ).first()
        
        if not onboarding:
            onboarding = models.OnboardingData(user_id=current_user.id, raw_responses=request.responses)
            db.add(onboarding)
        else:
            onboarding.raw_responses = request.responses
        
        # Map to structured fields
        r = request.responses
        onboarding.business_type = r.get('business_type')
        onboarding.business_description = r.get('business_description')
        onboarding.industry = r.get('industry')
        onboarding.target_audience = r.get('benefit_audience')
        onboarding.customer_avatar = r.get('customer_avatar')
        onboarding.audience_problems = r.get('audience_problems')
        onboarding.audience_size = r.get('audience_size')
        onboarding.brand_voice_tone = r.get('brand_voice_tone')
        onboarding.brand_personality = r.get('brand_personality')
        onboarding.brand_colors = r.get('brand_colors')
        onboarding.logo_status = r.get('logo_status')
        onboarding.brand_values = r.get('brand_values')
        onboarding.brand_story = r.get('brand_story')
        onboarding.brand_differentiation = r.get('brand_differentiation')
        onboarding.brand_consistency = r.get('brand_consistency')
        onboarding.pricing_status = r.get('pricing_status')
        onboarding.pricing_model = r.get('pricing_model')
        onboarding.marketing_budget = r.get('marketing_budget')
        onboarding.revenue_goals = r.get('revenue_goals')
        onboarding.priority_3months = r.get('priority_3months')
        onboarding.key_metrics = r.get('key_metrics')
        onboarding.success_definition = r.get('success_definition')
        onboarding.communication_style = r.get('communication_style')
        onboarding.data_storage_preference = r.get('data_storage_preference')
        onboarding.security_preference = r.get('security_preference')
        
        onboarding.incomplete_fields = request.incomplete_fields or []
        onboarding.needs_follow_up = len(onboarding.incomplete_fields) > 0
        
        total_fields = 20
        onboarding.completion_percentage = int(((total_fields - len(onboarding.incomplete_fields)) / total_fields) * 100)
        
        if onboarding.completion_percentage == 100:
            onboarding.completed_at = datetime.utcnow()
        
        db.commit()
        return {"message": "Source of truth saved", "completion_percentage": onboarding.completion_percentage}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/data")
async def get_source_of_truth(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's source of truth - used by ALL agents for business context"""
    onboarding = db.query(models.OnboardingData).filter(
        models.OnboardingData.user_id == current_user.id
    ).first()
    
    if not onboarding:
        return {"exists": False}
    
    return {
        "exists": True,
        "completion_percentage": onboarding.completion_percentage,
        "needs_follow_up": onboarding.needs_follow_up,
        "incomplete_fields": onboarding.incomplete_fields or [],
        "data": {
            "business": {"type": onboarding.business_type, "description": onboarding.business_description, "industry": onboarding.industry},
            "audience": {"target": onboarding.target_audience, "avatar": onboarding.customer_avatar, "problems": onboarding.audience_problems, "size": onboarding.audience_size},
            "brand": {"voice_tone": onboarding.brand_voice_tone, "personality": onboarding.brand_personality, "colors": onboarding.brand_colors, "logo_status": onboarding.logo_status, "values": onboarding.brand_values, "story": onboarding.brand_story, "differentiation": onboarding.brand_differentiation, "consistency": onboarding.brand_consistency},
            "financial": {"pricing_status": onboarding.pricing_status, "pricing_model": onboarding.pricing_model, "marketing_budget": onboarding.marketing_budget, "revenue_goals": onboarding.revenue_goals},
            "goals": {"priority_3months": onboarding.priority_3months, "key_metrics": onboarding.key_metrics, "success_definition": onboarding.success_definition},
            "preferences": {"communication_style": onboarding.communication_style, "data_storage": onboarding.data_storage_preference, "security": onboarding.security_preference}
        }
    }

@router.get("/incomplete")
async def get_incomplete_fields(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get incomplete onboarding fields for dashboard widget"""
    onboarding = db.query(models.OnboardingData).filter(
        models.OnboardingData.user_id == current_user.id
    ).first()
    
    if not onboarding:
        return {
            "incomplete_fields": [],
            "needs_follow_up": False,
            "completion_percentage": 0
        }
    
    return {
        "incomplete_fields": onboarding.incomplete_fields or [],
        "needs_follow_up": onboarding.needs_follow_up,
        "completion_percentage": onboarding.completion_percentage
    }
