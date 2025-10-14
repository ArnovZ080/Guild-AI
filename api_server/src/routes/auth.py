from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
import httpx
import os
from .. import models
from ..database import get_db

router = APIRouter(prefix="/auth", tags=["authentication"])
security = HTTPBearer()

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

# Pydantic models
class CreateProfileRequest(BaseModel):
    firebase_uid: Optional[str] = None  # Firebase UID
    supabase_id: Optional[str] = None  # Legacy Supabase ID (for backwards compatibility)
    email: EmailStr
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None

class UpdateLoginRequest(BaseModel):
    firebase_uid: Optional[str] = None
    supabase_id: Optional[str] = None

class UserProfileResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    subscription_status: str
    subscription_tier: str
    credits_used_this_month: int
    credits_limit: int
    bonus_credits: int
    api_calls_this_month: int
    created_at: datetime
    last_login: Optional[datetime] = None

# Authentication dependency
async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify Supabase JWT token and return user info"""
    try:
        token = credentials.credentials
        
        # Verify token with Supabase
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{SUPABASE_URL}/auth/v1/user",
                headers={
                    "Authorization": f"Bearer {token}",
                    "apikey": SUPABASE_SERVICE_KEY
                }
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid token")
            
            user_data = response.json()
            return user_data
            
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

# Get current user dependency
async def get_current_user(
    db: Session = Depends(get_db),
    supabase_user = Depends(verify_token)
):
    """Get current user from database"""
    db_user = db.query(models.User).filter(
        models.User.supabase_id == supabase_user["id"]
    ).first()
    
    if not db_user:
        raise HTTPException(status_code=404, detail="User profile not found")
    
    return db_user

@router.post("/create-profile", response_model=dict)
async def create_user_profile(
    request: CreateProfileRequest,
    db: Session = Depends(get_db)
):
    """Create a new user profile after Firebase signup"""
    try:
        # Test database connection first
        db.execute("SELECT 1")
        # Use firebase_uid if provided, otherwise fall back to supabase_id for backwards compatibility
        user_id = request.firebase_uid or request.supabase_id
        
        if not user_id:
            raise HTTPException(status_code=400, detail="Either firebase_uid or supabase_id must be provided")
        
        # Check if user already exists
        existing_user = db.query(models.User).filter(
            (models.User.firebase_uid == user_id) | (models.User.supabase_id == user_id)
        ).first()
        
        if existing_user:
            return {"message": "User profile already exists", "user_id": existing_user.id}
        
        # Create new user
        new_user = models.User(
            firebase_uid=request.firebase_uid,
            supabase_id=request.supabase_id,  # Keep for backwards compatibility
            email=request.email,
            full_name=request.full_name,
            avatar_url=request.avatar_url,
            subscription_status="free",
            subscription_tier="free",
            credits_limit=100,  # Free tier limit
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        return {
            "message": "User profile created successfully",
            "user_id": new_user.id
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create user profile: {str(e)}")

@router.post("/update-login")
async def update_last_login(
    request: UpdateLoginRequest,
    db: Session = Depends(get_db)
):
    """Update user's last login timestamp"""
    try:
        user = db.query(models.User).filter(
            models.User.supabase_id == request.supabase_id
        ).first()
        
        if user:
            user.last_login = datetime.utcnow()
            db.commit()
        
        return {"message": "Last login updated"}
        
    except Exception as e:
        db.rollback()
        return {"message": "Failed to update last login"}  # Non-critical, don't raise

@router.get("/profile", response_model=UserProfileResponse)
async def get_user_profile(
    current_user: models.User = Depends(get_current_user)
):
    """Get current user's profile"""
    return UserProfileResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        avatar_url=current_user.avatar_url,
        subscription_status=current_user.subscription_status,
        subscription_tier=current_user.subscription_tier,
        credits_used_this_month=current_user.credits_used_this_month,
        credits_limit=current_user.credits_limit,
        bonus_credits=getattr(current_user, 'bonus_credits', 0),
        api_calls_this_month=current_user.api_calls_this_month,
        created_at=current_user.created_at,
        last_login=current_user.last_login
    )

@router.get("/usage")
async def get_user_usage(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's usage statistics"""
    # Get recent usage logs
    recent_usage = db.query(models.UsageLog).filter(
        models.UsageLog.user_id == current_user.id
    ).order_by(models.UsageLog.created_at.desc()).limit(10).all()
    
    # Calculate usage percentages
    credits_percentage = (current_user.credits_used_this_month / current_user.credits_limit) * 100
    
    return {
        "credits": {
            "used": current_user.credits_used_this_month,
            "limit": current_user.credits_limit,
            "bonus": getattr(current_user, 'bonus_credits', 0),
            "percentage": min(credits_percentage, 100)
        },
        "api_calls": {
            "used": current_user.api_calls_this_month,
            "limit": 10000  # This should come from subscription plan
        },
        "subscription": {
            "tier": current_user.subscription_tier,
            "status": current_user.subscription_status
        },
        "recent_activity": [
            {
                "action": log.action_type,
                "credits": log.credits_consumed,
                "timestamp": log.created_at.isoformat()
            } for log in recent_usage
        ]
    }

# Usage tracking function
async def track_usage(
    user: models.User,
    action_type: str,
    credits_consumed: int = 1,
    api_endpoint: str = None,
    extra_data: dict = None,
    db: Session = None
):
    """Track user usage and update credits"""
    try:
        # Create usage log
        usage_log = models.UsageLog(
            user_id=user.id,
            action_type=action_type,
            credits_consumed=credits_consumed,
            api_endpoint=api_endpoint,
            extra_data=extra_data
        )
        db.add(usage_log)
        
        # Update user credits
        user.credits_used_this_month += credits_consumed
        user.api_calls_this_month += 1
        
        db.commit()
        
        # Check if user has exceeded limits
        if user.credits_used_this_month >= user.credits_limit:
            return {"warning": "Credit limit reached"}
        
        return {"success": True}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to track usage: {str(e)}")

# Credits check dependency
async def check_credits(
    current_user: models.User = Depends(get_current_user),
    credits_required: int = 1
):
    """Check if user has sufficient credits"""
    total_available = current_user.credits_limit - current_user.credits_used_this_month + getattr(current_user, 'bonus_credits', 0)
    
    if total_available < credits_required:
        raise HTTPException(
            status_code=402,  # Payment Required
            detail={
                "error": "Insufficient credits",
                "credits_available": total_available,
                "credits_needed": credits_required,
                "upgrade_url": "/subscription/upgrade"
            }
        )
    return current_user

@router.get("/check-limits")
async def check_user_limits(
    current_user: models.User = Depends(get_current_user)
):
    """Check current user's limits and usage"""
    bonus_credits = getattr(current_user, 'bonus_credits', 0)
    monthly_remaining = max(0, current_user.credits_limit - current_user.credits_used_this_month)
    total_available = monthly_remaining + bonus_credits
    
    return {
        "credits": {
            "remaining": total_available,
            "monthly_remaining": monthly_remaining,
            "bonus_credits": bonus_credits,
            "limit": current_user.credits_limit,
            "used": current_user.credits_used_this_month
        },
        "subscription": {
            "tier": current_user.subscription_tier,
            "status": current_user.subscription_status
        },
        "limits_reached": total_available <= 0
    }

@router.post("/track-usage")
async def track_usage_endpoint(
    action_type: str,
    credits_consumed: int = 1,
    extra_data: dict = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Track user usage"""
    return await track_usage(current_user, action_type, credits_consumed, extra_data=extra_data, db=db)
