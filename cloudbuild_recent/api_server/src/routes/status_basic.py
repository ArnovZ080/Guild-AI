"""
Basic status endpoints for system capabilities
"""
from fastapi import APIRouter
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/status", tags=["status"])

@router.get("/")
async def get_system_status():
    """Get system status and capabilities"""
    return {
        "success": True,
        "status": "healthy",
        "capabilities": {
            "chat_processing": True,
            "workflow_creation": True,
            "agent_coordination": True,
            "data_sync": True,
            "onboarding": True
        },
        "services": {
            "database": "available",
            "auth": "basic",
            "orchestrator": "available",
            "agents": "available"
        }
    }

@router.get("/capabilities")
async def get_capabilities():
    """Get system capabilities"""
    return {
        "success": True,
        "capabilities": {
            "chat_processing": True,
            "workflow_creation": True,
            "agent_coordination": True,
            "data_sync": True,
            "onboarding": True,
            "file_processing": True,
            "analytics": True
        }
    }
