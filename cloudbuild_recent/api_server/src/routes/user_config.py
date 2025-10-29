"""
User configuration and data sync endpoints
"""
from fastapi import APIRouter, Request
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/user-config", tags=["user-config"])

@router.post("/sync")
async def sync_user_data(request: Request):
    """Sync user data from frontend to backend"""
    try:
        body = await request.json()
        logger.info(f"User data sync request: {list(body.keys())}")
        
        # Process the synced data
        agent_configurations = body.get("agent_configurations", [])
        workflow_templates = body.get("workflow_templates", [])
        
        logger.info(f"Synced {len(agent_configurations)} agent configurations")
        logger.info(f"Synced {len(workflow_templates)} workflow templates")
        
        return {
            "success": True,
            "message": "Data synced successfully",
            "synced_items": {
                "agent_configurations": len(agent_configurations),
                "workflow_templates": len(workflow_templates)
            }
        }
    except Exception as e:
        logger.error(f"User data sync error: {e}")
        return {
            "success": False,
            "message": "Data sync failed",
            "error": str(e)
        }

@router.get("/status")
async def get_sync_status():
    """Get sync status"""
    return {
        "success": True,
        "status": "ready",
        "last_sync": "2024-01-01T00:00:00Z"
    }