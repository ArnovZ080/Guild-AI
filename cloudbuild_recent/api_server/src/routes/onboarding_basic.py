"""
Basic onboarding endpoints when Firebase is not available
"""
from fastapi import APIRouter, Request
import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/onboarding", tags=["onboarding"])

@router.post("/save")
async def save_onboarding_data(request: Request):
    """Save onboarding data (basic auth fallback)"""
    try:
        body = await request.json()
        responses = body.get("responses", {})
        incomplete_fields = body.get("incomplete_fields", [])
        
        logger.info(f"Onboarding save request: {list(responses.keys())}")
        logger.info(f"Incomplete fields: {incomplete_fields}")
        
        # Calculate completion percentage
        total_fields = len(responses) + len(incomplete_fields)
        completion_percentage = int((len(responses) / total_fields) * 100) if total_fields > 0 else 0
        
        return {
            "success": True,
            "message": "Onboarding data saved successfully",
            "completion_percentage": completion_percentage,
            "needs_follow_up": len(incomplete_fields) > 0,
            "incomplete_fields": incomplete_fields,
            "saved_fields": list(responses.keys())
        }
    except Exception as e:
        logger.error(f"Onboarding save error: {e}")
        return {
            "success": False,
            "message": "Onboarding save failed",
            "error": str(e)
        }

@router.get("/health")
async def onboarding_health():
    """Onboarding health check"""
    return {
        "status": "healthy",
        "service": "onboarding",
        "auth_type": "basic"
    }
