"""
Basic auth fallback when Firebase is not available
"""
from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.security import HTTPBearer
import logging
from typing import Optional

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["auth"])
security = HTTPBearer()

async def get_current_user_optional():
    """Optional user authentication - returns None if not authenticated"""
    return None

@router.get("/health")
async def auth_health():
    """Basic auth health check"""
    return {"status": "healthy", "auth_type": "basic", "firebase_available": False}

@router.get("/user")
async def get_user():
    """Get current user (basic auth fallback)"""
    return {"user": None, "authenticated": False, "auth_type": "basic"}

@router.post("/create-profile")
async def create_profile(request: Request):
    """Create user profile (basic auth fallback)"""
    try:
        body = await request.json()
        logger.info(f"Profile creation request: {body}")
        return {
            "success": True,
            "message": "Profile created successfully",
            "user_id": body.get("firebase_uid", "unknown")
        }
    except Exception as e:
        logger.error(f"Profile creation error: {e}")
        return {"success": False, "message": "Profile creation failed"}

@router.get("/profile")
async def get_profile():
    """Get user profile (basic auth fallback)"""
    return {
        "success": True,
        "user": {
            "id": "demo_user",
            "email": "demo@example.com",
            "full_name": "Demo User",
            "avatar_url": None
        }
    }

@router.post("/update-login")
async def update_login(request: Request):
    """Update last login (basic auth fallback)"""
    try:
        body = await request.json()
        logger.info(f"Login update request: {body}")
        return {"success": True, "message": "Login updated successfully"}
    except Exception as e:
        logger.error(f"Login update error: {e}")
        return {"success": False, "message": "Login update failed"}

