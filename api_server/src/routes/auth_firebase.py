from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
import os
import firebase_admin
from firebase_admin import auth as firebase_auth, credentials

from .. import models
from ..database import get_db

router = APIRouter(tags=["authentication"])

@router.get("/health/ping")
async def auth_health_ping():
    return {"status": "ok"}
security = HTTPBearer()

# Initialize Firebase Admin SDK with robust env-based selection
try:
    if not firebase_admin._apps:
        cred = None
        # Preferred: service account JSON path or inline JSON via FIREBASE_CONFIG_JSON
        sa_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH")
        sa_inline = os.getenv("FIREBASE_CONFIG_JSON")
        if sa_path and os.path.exists(sa_path):
            cred = credentials.Certificate(sa_path)
        elif sa_inline:
            import json, tempfile
            fd, temp_path = tempfile.mkstemp(prefix="firebase-sa-", suffix=".json")
            with os.fdopen(fd, 'w') as f:
                f.write(sa_inline)
            cred = credentials.Certificate(temp_path)
        elif os.getenv("GOOGLE_CLOUD_PROJECT"):
            cred = credentials.ApplicationDefault()
        else:
            # last-resort local file name if present
            default_path = "firebase-service-account.json"
            if os.path.exists(default_path):
                cred = credentials.Certificate(default_path)
        if not cred:
            raise RuntimeError("No Firebase credentials available. Set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_CONFIG_JSON, or use Application Default.")
        firebase_admin.initialize_app(cred)
    print("Firebase Admin SDK initialized successfully")
except Exception as e:
    print(f"Warning: Firebase Admin SDK initialization failed: {e}")
    print("Authentication will not work until Firebase is properly configured")

# Pydantic models
class CreateProfileRequest(BaseModel):
    firebase_uid: str
    email: EmailStr
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None

class UpdateLoginRequest(BaseModel):
    firebase_uid: str

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
async def verify_firebase_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify Firebase JWT token and return user info"""
    try:
        token = credentials.credentials
        
        # Verify token with Firebase
        decoded_token = firebase_auth.verify_id_token(token)
        
        return decoded_token
            
    except firebase_admin.auth.InvalidIdTokenError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    except firebase_admin.auth.ExpiredIdTokenError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid authentication credentials: {str(e)}")

# Get current user dependency
async def get_current_user(
    db: Session = Depends(get_db),
    firebase_user = Depends(verify_firebase_token)
):
    """Get current user from database"""
    db_user = db.query(models.User).filter(
        models.User.supabase_id == firebase_user["uid"]  # Keep column name for now, will migrate later
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
        # Check if user already exists
        existing_user = db.query(models.User).filter(
            models.User.supabase_id == request.firebase_uid  # Keep column name for now
        ).first()
        
        if existing_user:
            return {"message": "User profile already exists", "user_id": existing_user.id}
        
        # Create new user
        new_user = models.User(
            supabase_id=request.firebase_uid,  # Store Firebase UID in this column
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
            models.User.supabase_id == request.firebase_uid
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
    credits_percentage = (current_user.credits_used_this_month / current_user.credits_limit) * 100 if current_user.credits_limit > 0 else 0
    
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

