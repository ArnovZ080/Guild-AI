"""
Basic agents endpoints when Firebase is not available
"""
from fastapi import APIRouter
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/agents", tags=["agents"])

@router.get("/")
async def get_agents():
    """Get available agents (basic fallback)"""
    return {
        "success": True,
        "agents": [
            {
                "id": "research_agent",
                "name": "Research Agent",
                "description": "Conducts web research and information gathering",
                "status": "available",
                "capabilities": ["web_research", "data_analysis", "report_generation"]
            },
            {
                "id": "content_agent",
                "name": "Content Agent", 
                "description": "Creates and optimizes content",
                "status": "available",
                "capabilities": ["content_creation", "seo_optimization", "social_media"]
            },
            {
                "id": "marketing_agent",
                "name": "Marketing Agent",
                "description": "Develops marketing strategies and campaigns",
                "status": "available", 
                "capabilities": ["campaign_planning", "lead_generation", "analytics"]
            }
        ]
    }

@router.get("/health")
async def agents_health():
    """Agents health check"""
    return {
        "status": "healthy",
        "service": "agents",
        "available_agents": 3
    }
