"""
Onboarding API Routes
FastAPI endpoints for onboarding data storage and follow-up management
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from fastapi.responses import JSONResponse
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field, EmailStr
import logging
from datetime import datetime
import uuid

from ...services.database_service import db_service
from ...models.database import User, OnboardingData, FollowUpSession

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/onboarding", tags=["onboarding"])

# Pydantic models for request/response
class OnboardingDataRequest(BaseModel):
    email: EmailStr = Field(..., description="User email address")
    name: Optional[str] = Field(None, description="User name")
    business_answers: Optional[Dict[str, Any]] = Field(default={}, description="Business-related answers")
    audience_answers: Optional[Dict[str, Any]] = Field(default={}, description="Audience-related answers")
    brand_answers: Optional[Dict[str, Any]] = Field(default={}, description="Brand-related answers")
    financial_answers: Optional[Dict[str, Any]] = Field(default={}, description="Financial-related answers")
    goals_answers: Optional[Dict[str, Any]] = Field(default={}, description="Goals-related answers")
    preferences_answers: Optional[Dict[str, Any]] = Field(default={}, description="Preferences answers")
    integrations_answers: Optional[Dict[str, Any]] = Field(default={}, description="Integrations answers")
    psychological_profile: Optional[Dict[str, Any]] = Field(default={}, description="Psychological profile data")
    onboarding_version: Optional[str] = Field(default="2.0_psychologically_optimized", description="Onboarding version")

class OnboardingDataResponse(BaseModel):
    user_id: str
    onboarding_id: str
    completed_at: Optional[str]
    has_pending_followups: bool
    followup_count: int
    message: str

class FollowUpQuestionResponse(BaseModel):
    id: str
    original_question_id: str
    original_question_text: str
    original_answer: str
    follow_up_question: str
    action_type: str
    action_data: Dict[str, Any]
    priority: str
    status: str
    created_at: str

class FollowUpAnswerRequest(BaseModel):
    question_id: str = Field(..., description="Follow-up question ID")
    answer: str = Field(..., description="User's answer to the follow-up question")

class UserAnalyticsResponse(BaseModel):
    user: Dict[str, Any]
    onboarding: Dict[str, Any]
    follow_ups: Dict[str, Any]
    orchestrator_actions: Dict[str, Any]

@router.post("/save", response_model=OnboardingDataResponse)
async def save_onboarding_data(
    onboarding_data: OnboardingDataRequest,
    background_tasks: BackgroundTasks
):
    """Save onboarding questionnaire responses"""
    try:
        # Check if user exists, create if not
        user = await db_service.get_user_by_email(onboarding_data.email)
        if not user:
            user = await db_service.create_user(
                email=onboarding_data.email,
                name=onboarding_data.name
            )
        
        # Prepare onboarding data
        data_to_save = {
            'business_answers': onboarding_data.business_answers,
            'audience_answers': onboarding_data.audience_answers,
            'brand_answers': onboarding_data.brand_answers,
            'financial_answers': onboarding_data.financial_answers,
            'goals_answers': onboarding_data.goals_answers,
            'preferences_answers': onboarding_data.preferences_answers,
            'integrations_answers': onboarding_data.integrations_answers,
            'psychological_profile': onboarding_data.psychological_profile
        }
        
        # Analyze for follow-up opportunities
        follow_up_analysis = analyze_onboarding_for_followups(data_to_save)
        data_to_save.update({
            'has_pending_followups': follow_up_analysis['has_pending_followups'],
            'followup_count': follow_up_analysis['followup_count']
        })
        
        # Save onboarding data
        saved_data = await db_service.save_onboarding_data(str(user.id), data_to_save)
        
        # Create follow-up session if needed
        if follow_up_analysis['has_pending_followups']:
            background_tasks.add_task(
                create_follow_up_session_task,
                str(user.id),
                follow_up_analysis['follow_up_questions']
            )
        
        return OnboardingDataResponse(
            user_id=str(user.id),
            onboarding_id=str(saved_data.id),
            completed_at=saved_data.completed_at.isoformat() if saved_data.completed_at else None,
            has_pending_followups=follow_up_analysis['has_pending_followups'],
            followup_count=follow_up_analysis['followup_count'],
            message="Onboarding data saved successfully"
        )
        
    except Exception as e:
        logger.error(f"Error saving onboarding data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/data/{user_id}", response_model=Dict[str, Any])
async def get_onboarding_data(user_id: str):
    """Get onboarding data for a user"""
    try:
        onboarding_data = await db_service.get_onboarding_data(user_id)
        if not onboarding_data:
            raise HTTPException(status_code=404, detail="Onboarding data not found")
        
        return {
            "user_id": str(onboarding_data.user_id),
            "business_answers": onboarding_data.business_answers,
            "audience_answers": onboarding_data.audience_answers,
            "brand_answers": onboarding_data.brand_answers,
            "financial_answers": onboarding_data.financial_answers,
            "goals_answers": onboarding_data.goals_answers,
            "preferences_answers": onboarding_data.preferences_answers,
            "integrations_answers": onboarding_data.integrations_answers,
            "psychological_profile": onboarding_data.psychological_profile,
            "completed_at": onboarding_data.completed_at.isoformat() if onboarding_data.completed_at else None,
            "has_pending_followups": onboarding_data.has_pending_followups,
            "followup_count": onboarding_data.followup_count,
            "onboarding_version": onboarding_data.onboarding_version
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting onboarding data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/followups/{user_id}", response_model=List[FollowUpQuestionResponse])
async def get_pending_follow_up_questions(user_id: str):
    """Get pending follow-up questions for a user"""
    try:
        questions = await db_service.get_pending_follow_up_questions(user_id)
        
        return [
            FollowUpQuestionResponse(
                id=str(question.id),
                original_question_id=question.original_question_id,
                original_question_text=question.original_question_text,
                original_answer=question.original_answer,
                follow_up_question=question.follow_up_question,
                action_type=question.action_type,
                action_data=question.action_data or {},
                priority=question.priority,
                status=question.status,
                created_at=question.created_at.isoformat()
            )
            for question in questions
        ]
        
    except Exception as e:
        logger.error(f"Error getting follow-up questions: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/followups/answer")
async def answer_follow_up_question(answer_request: FollowUpAnswerRequest):
    """Answer a follow-up question"""
    try:
        question = await db_service.complete_follow_up_question(
            answer_request.question_id,
            answer_request.answer
        )
        
        return {
            "success": True,
            "question_id": str(question.id),
            "status": question.status,
            "answered_at": question.answered_at.isoformat() if question.answered_at else None,
            "message": "Follow-up question answered successfully"
        }
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error answering follow-up question: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics/{user_id}", response_model=UserAnalyticsResponse)
async def get_user_analytics(user_id: str):
    """Get analytics data for a user"""
    try:
        analytics = await db_service.get_user_analytics(user_id)
        return UserAnalyticsResponse(**analytics)
        
    except Exception as e:
        logger.error(f"Error getting user analytics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/user/{email}")
async def get_user_by_email(email: str):
    """Get user information by email"""
    try:
        user = await db_service.get_user_by_email(email)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {
            "id": str(user.id),
            "email": user.email,
            "name": user.name,
            "created_at": user.created_at.isoformat(),
            "is_active": user.is_active
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user by email: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/user")
async def create_user(email: str, name: str = None):
    """Create a new user"""
    try:
        # Check if user already exists
        existing_user = await db_service.get_user_by_email(email)
        if existing_user:
            raise HTTPException(status_code=400, detail="User already exists")
        
        user = await db_service.create_user(email=email, name=name)
        
        return {
            "id": str(user.id),
            "email": user.email,
            "name": user.name,
            "created_at": user.created_at.isoformat(),
            "message": "User created successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating user: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Background task for creating follow-up session
async def create_follow_up_session_task(user_id: str, follow_up_questions: List[Dict[str, Any]]):
    """Background task to create follow-up session"""
    try:
        await db_service.create_follow_up_session(
            user_id=user_id,
            session_type="onboarding_followup",
            pending_questions=follow_up_questions
        )
        logger.info(f"Created follow-up session for user: {user_id}")
    except Exception as e:
        logger.error(f"Error creating follow-up session: {e}")

def analyze_onboarding_for_followups(onboarding_data: Dict[str, Any]) -> Dict[str, Any]:
    """Analyze onboarding data to identify follow-up opportunities"""
    
    # Follow-up question mapping (from the frontend service)
    follow_up_mapping = {
        'benefit_audience': {
            'question': "Who do you imagine benefits the most from what you offer?",
            'follow_up': "Would you like to work on who the best audience for your product or service will be?",
            'action': {
                'type': 'orchestrator_initiate',
                'agents': ['research_agent', 'audience_analysis_agent'],
                'task': 'determine_optimal_audience',
                'description': 'Find the right audience for the user\'s product or service'
            }
        },
        'customer_avatar': {
            'question': "Do you already have a customer avatar (ideal client profile)?",
            'follow_up': "Would you like us to build your Ideal Customer Avatar?",
            'action': {
                'type': 'orchestrator_initiate',
                'agents': ['research_agent', 'persona_builder_agent'],
                'task': 'create_ideal_customer_avatar',
                'description': 'Determine the user\'s ideal client avatar for their product or service'
            }
        },
        'audience_problems': {
            'question': "What's the biggest problem your audience struggles with?",
            'follow_up': "Should we do some research to see what the biggest problem is that your audience struggles with?",
            'action': {
                'type': 'orchestrator_initiate',
                'agents': ['research_agent', 'market_analysis_agent'],
                'task': 'identify_audience_painpoints',
                'description': 'Determine the biggest hurdles/problems/painpoints of the user\'s ideal client'
            }
        },
        'audience_size': {
            'question': "How big is your current audience or customer base?",
            'follow_up': "Let's determine the size of your current audience",
            'action': {
                'type': 'orchestrator_initiate',
                'agents': ['research_agent', 'analytics_agent'],
                'task': 'analyze_audience_size',
                'description': 'Ask the user questions about their followings on their social platforms and email list size'
            }
        },
        'business_type': {
            'question': "What type of business are you running (or planning to run)?",
            'follow_up': "Let's find out what business will be right up your alley",
            'action': {
                'type': 'orchestrator_initiate',
                'agents': ['strategy_agent', 'business_consultant_agent'],
                'task': 'determine_business_fit',
                'description': 'Determine the best business fit for the user based on passions, interests and existing skills'
            }
        },
        'pricing_strategy': {
            'question': "How are you handling pricing right now?",
            'follow_up': "Would you like us to work on your pricing strategy?",
            'action': {
                'type': 'orchestrator_initiate',
                'agents': ['pricing_agent', 'market_research_agent'],
                'task': 'develop_pricing_strategy',
                'description': 'Determine the best pricing strategy for the user\'s existing products and services based on market research'
            }
        },
        'marketing_budget': {
            'question': "Do you have a monthly marketing/advertising budget?",
            'follow_up': "Would you like some help figuring out what budget for your marketing/advertising will yield the best results?",
            'action': {
                'type': 'orchestrator_initiate',
                'agents': ['marketing_agent', 'budget_planner_agent'],
                'task': 'optimize_marketing_budget',
                'description': 'Determine what results certain budgets will have when combined with social media marketing strategies'
            }
        },
        'priority_3months': {
            'question': "What's your #1 priority for the next 3 months?",
            'follow_up': "Would you like us to help you determine your biggest priority for the next 3 months?",
            'action': {
                'type': 'orchestrator_initiate',
                'agents': ['strategy_agent', 'goal_setting_agent'],
                'task': 'set_and_achieve_goals',
                'description': 'Help the user set goals and then initiate actions to achieve them'
            }
        },
        'guild_working_style': {
            'question': "How do you prefer Guild to work with you?",
            'follow_up': "Would you like to work out and delve deeper into how we can benefit you?",
            'action': {
                'type': 'orchestrator_initiate',
                'agents': ['strategy_agent', 'consultation_agent'],
                'task': 'discover_user_needs',
                'description': 'Find out what the user\'s biggest pain points are and then explain guild\'s capabilities and how guild can help solve these problems'
            }
        },
        'data_storage': {
            'question': "Where would you prefer to store your business data?",
            'follow_up': "Should we help you set up a local storage space for your business data?",
            'action': {
                'type': 'orchestrator_initiate',
                'agents': ['data_management_agent', 'storage_setup_agent'],
                'task': 'setup_data_storage',
                'description': 'Create local storage areas or databases for the users\' data'
            }
        },
        'sensitive_data': {
            'question': "How do you want Guild to handle sensitive information?",
            'follow_up': "Let's work on a solution for your sensitive storage information",
            'action': {
                'type': 'orchestrator_initiate',
                'agents': ['security_agent', 'data_protection_agent'],
                'task': 'setup_secure_storage',
                'description': 'Work on secure storage options for the data, whether it is local storage or secure cloud storage on whatever connected platform they have like google drive or onedrive'
            }
        },
        'brand_voice_tone': {
            'question': "How would you describe your brand's voice and tone?",
            'follow_up': "Would you like us to help you discover and define your brand voice?",
            'action': {
                'type': 'orchestrator_initiate',
                'agents': ['brand_strategist_agent', 'voice_analysis_agent'],
                'task': 'define_brand_voice',
                'description': 'Analyze existing content and audience feedback to discover the user\'s authentic brand voice'
            }
        },
        'brand_colors': {
            'question': "Do you have established brand colors?",
            'follow_up': "Should we help you choose brand colors that align with your personality and industry?",
            'action': {
                'type': 'orchestrator_initiate',
                'agents': ['brand_strategist_agent', 'color_psychology_agent'],
                'task': 'develop_color_palette',
                'description': 'Choose brand colors that align with brand personality, industry, and target audience preferences'
            }
        },
        'logo_status': {
            'question': "What's the status of your logo?",
            'follow_up': "Would you like us to help create or improve your logo?",
            'action': {
                'type': 'orchestrator_initiate',
                'agents': ['design_agent', 'logo_creator_agent'],
                'task': 'create_improve_logo',
                'description': 'Create professional logo concepts and iterations based on brand identity'
            }
        },
        'brand_story': {
            'question': "Do you have a clear brand story or origin story?",
            'follow_up': "Should we help you craft a compelling brand story?",
            'action': {
                'type': 'orchestrator_initiate',
                'agents': ['storytelling_agent', 'brand_narrative_agent'],
                'task': 'craft_brand_story',
                'description': 'Craft a compelling narrative that connects with the audience and differentiates the brand'
            }
        },
        'brand_differentiation': {
            'question': "What makes your brand unique or different?",
            'follow_up': "Would you like us to help identify and articulate what makes you unique?",
            'action': {
                'type': 'orchestrator_initiate',
                'agents': ['strategy_agent', 'competitive_analysis_agent'],
                'task': 'identify_unique_value',
                'description': 'Identify and articulate what makes the user\'s brand special and different from competitors'
            }
        }
    }
    
    # Check for "not sure" responses
    not_sure_phrases = [
        "not sure", "i don't know", "unsure", "not sure yet", 
        "i'm not sure", "don't know", "uncertain", "maybe later",
        "i haven't really thought about it", "i'm not sure what",
        "i don't think", "i haven't", "i don't have"
    ]
    
    follow_up_questions = []
    
    # Check all answer categories
    for category, answers in onboarding_data.items():
        if not isinstance(answers, dict):
            continue
            
        for question_id, answer in answers.items():
            if isinstance(answer, str):
                answer_lower = answer.lower()
                is_not_sure = any(phrase in answer_lower for phrase in not_sure_phrases)
                
                if is_not_sure and question_id in follow_up_mapping:
                    mapping = follow_up_mapping[question_id]
                    priority = 'high' if question_id in ['benefit_audience', 'business_type', 'priority_3months'] else 'medium'
                    
                    follow_up_questions.append({
                        'original_question_id': question_id,
                        'original_question_text': mapping['question'],
                        'original_answer': answer,
                        'follow_up_question': mapping['follow_up'],
                        'action': mapping['action'],
                        'priority': priority
                    })
    
    return {
        'has_pending_followups': len(follow_up_questions) > 0,
        'followup_count': len(follow_up_questions),
        'follow_up_questions': follow_up_questions
    }
