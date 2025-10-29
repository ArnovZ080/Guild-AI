from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import logging
import json
from datetime import datetime

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/user-profile", tags=["user-profile"])

class OnboardingData(BaseModel):
    business_type: str
    business_stage: str
    business_description: str
    audience_type: Optional[str] = None
    customer_avatar: Optional[str] = None
    audience_size: Optional[str] = None
    brand_colors: Optional[str] = None
    logo_status: Optional[str] = None
    brand_consistency: Optional[str] = None
    guild_working_style: Optional[str] = None
    selectedSoftware: Optional[List[str]] = []
    unknowns: Optional[List[str]] = []

class ConversationMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str
    timestamp: datetime

class UserProfile(BaseModel):
    user_id: str
    email: str
    full_name: Optional[str] = None
    onboarding_data: Optional[OnboardingData] = None
    conversations: Optional[List[ConversationMessage]] = []
    preferences: Optional[Dict[str, Any]] = {}
    created_at: datetime
    updated_at: datetime

# In-memory storage for demo purposes
# In production, this would be stored in PostgreSQL
user_profiles = {}

@router.post("/save-onboarding")
async def save_onboarding_data(request: Request):
    """Save onboarding data to user profile"""
    try:
        body = await request.json()
        user_id = body.get("user_id", "demo_user")  # In production, get from Firebase token
        
        # Create or update user profile
        if user_id not in user_profiles:
            user_profiles[user_id] = UserProfile(
                user_id=user_id,
                email=body.get("email", "demo@example.com"),
                full_name=body.get("full_name", "Demo User"),
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
        
        # Update onboarding data
        onboarding_data = OnboardingData(**body.get("onboarding_data", {}))
        user_profiles[user_id].onboarding_data = onboarding_data
        user_profiles[user_id].updated_at = datetime.now()
        
        logger.info(f"💾 Saved onboarding data for user {user_id}")
        
        return {
            "success": True,
            "message": "Onboarding data saved to user profile",
            "user_id": user_id,
            "completion_percentage": 100,
            "needs_follow_up": False
        }
        
    except Exception as e:
        logger.error(f"❌ Error saving onboarding data: {e}")
        return {"success": False, "message": f"Failed to save onboarding data: {str(e)}"}

@router.get("/onboarding/{user_id}")
async def get_onboarding_data(user_id: str):
    """Get onboarding data for user"""
    try:
        if user_id not in user_profiles:
            return {"success": False, "message": "User profile not found"}
        
        profile = user_profiles[user_id]
        if not profile.onboarding_data:
            return {"success": False, "message": "No onboarding data found"}
        
        return {
            "success": True,
            "onboarding_data": profile.onboarding_data.dict(),
            "completion_percentage": 100,
            "needs_follow_up": False
        }
        
    except Exception as e:
        logger.error(f"❌ Error getting onboarding data: {e}")
        return {"success": False, "message": f"Failed to get onboarding data: {str(e)}"}

@router.post("/save-conversation")
async def save_conversation(request: Request):
    """Save conversation message to user profile"""
    try:
        body = await request.json()
        user_id = body.get("user_id", "demo_user")
        message = body.get("message", {})
        
        # Create or update user profile
        if user_id not in user_profiles:
            user_profiles[user_id] = UserProfile(
                user_id=user_id,
                email=body.get("email", "demo@example.com"),
                full_name=body.get("full_name", "Demo User"),
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
        
        # Add conversation message
        conversation_message = ConversationMessage(
            role=message.get("role", "user"),
            content=message.get("content", ""),
            timestamp=datetime.now()
        )
        
        if not user_profiles[user_id].conversations:
            user_profiles[user_id].conversations = []
        
        user_profiles[user_id].conversations.append(conversation_message)
        user_profiles[user_id].updated_at = datetime.now()
        
        logger.info(f"💬 Saved conversation message for user {user_id}")
        
        return {
            "success": True,
            "message": "Conversation saved to user profile",
            "user_id": user_id
        }
        
    except Exception as e:
        logger.error(f"❌ Error saving conversation: {e}")
        return {"success": False, "message": f"Failed to save conversation: {str(e)}"}

@router.get("/conversations/{user_id}")
async def get_conversations(user_id: str):
    """Get conversation history for user"""
    try:
        if user_id not in user_profiles:
            return {"success": False, "message": "User profile not found"}
        
        profile = user_profiles[user_id]
        conversations = profile.conversations or []
        
        return {
            "success": True,
            "conversations": [conv.dict() for conv in conversations],
            "user_id": user_id
        }
        
    except Exception as e:
        logger.error(f"❌ Error getting conversations: {e}")
        return {"success": False, "message": f"Failed to get conversations: {str(e)}"}

@router.get("/profile/{user_id}")
async def get_user_profile(user_id: str):
    """Get complete user profile"""
    try:
        if user_id not in user_profiles:
            return {"success": False, "message": "User profile not found"}
        
        profile = user_profiles[user_id]
        
        return {
            "success": True,
            "profile": {
                "user_id": profile.user_id,
                "email": profile.email,
                "full_name": profile.full_name,
                "onboarding_data": profile.onboarding_data.dict() if profile.onboarding_data else None,
                "conversations_count": len(profile.conversations) if profile.conversations else 0,
                "preferences": profile.preferences,
                "created_at": profile.created_at.isoformat(),
                "updated_at": profile.updated_at.isoformat()
            }
        }
        
    except Exception as e:
        logger.error(f"❌ Error getting user profile: {e}")
        return {"success": False, "message": f"Failed to get user profile: {str(e)}"}

@router.get("/health")
async def user_profile_health():
    """Health check for user profile service"""
    return {
        "status": "healthy",
        "service": "user_profile",
        "version": "1.0",
        "users_stored": len(user_profiles)
    }
