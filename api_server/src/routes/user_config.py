"""
User Configuration API Routes

This module provides endpoints for storing and retrieving user-specific configurations
including agent settings, workflow templates, and user preferences.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
from datetime import datetime
import logging

from ..database import get_db
from ..models import User
from .auth_firebase import get_current_user

# Initialize logger
logger = logging.getLogger(__name__)

router = APIRouter(tags=["user-config"])

@router.get("/health/ping")
async def user_config_health_ping():
  return {"status": "ok"}


# Pydantic models for API requests/responses
class AgentConfiguration(BaseModel):
    agent_id: str
    agent_name: str
    custom_instructions: str
    duration: str = "indefinite"
    priority: str = "normal"
    notifications: bool = True
    custom_config: Optional[Dict[str, Any]] = None


class WorkflowTemplate(BaseModel):
    workflow_id: str
    name: str
    description: str
    workflow_data: Dict[str, Any]
    is_public: bool = False
    tags: List[str] = []


class UserPreferences(BaseModel):
    theme: str = "light"
    notifications: Dict[str, bool] = {}
    default_settings: Dict[str, Any] = {}
    ui_preferences: Dict[str, Any] = {}


class BulkAgentConfigRequest(BaseModel):
    configurations: List[AgentConfiguration]


class BulkWorkflowRequest(BaseModel):
    workflows: List[WorkflowTemplate]


# Agent Configuration Endpoints
@router.post("/agent-configs")
async def save_agent_configuration(
    config: AgentConfiguration,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Save a single agent configuration for the user."""
    try:
        # Get or create user settings
        user_settings = await get_or_create_user_settings(current_user.id, db)
        
        # Update agent configurations
        agent_configs = user_settings.get("agent_configurations", {})
        agent_configs[config.agent_id] = {
            **config.model_dump(),
            "saved_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        user_settings["agent_configurations"] = agent_configs
        user_settings["updated_at"] = datetime.utcnow().isoformat()
        
        # Save to database (using existing settings endpoint structure)
        await save_user_settings(current_user.id, user_settings, db)
        
        return {
            "success": True,
            "message": f"Configuration saved for {config.agent_name}",
            "agent_id": config.agent_id
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save agent configuration: {str(e)}")


@router.post("/agent-configs/bulk")
async def save_bulk_agent_configurations(
    request: BulkAgentConfigRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Save multiple agent configurations at once."""
    try:
        user_settings = await get_or_create_user_settings(current_user.id, db)
        agent_configs = user_settings.get("agent_configurations", {})
        
        saved_count = 0
        for config in request.configurations:
            agent_configs[config.agent_id] = {
                **config.model_dump(),
                "saved_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            saved_count += 1
        
        user_settings["agent_configurations"] = agent_configs
        user_settings["updated_at"] = datetime.utcnow().isoformat()
        
        await save_user_settings(current_user.id, user_settings, db)
        
        return {
            "success": True,
            "message": f"Saved {saved_count} agent configurations",
            "count": saved_count
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save agent configurations: {str(e)}")


@router.get("/agent-configs")
async def get_agent_configurations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all agent configurations for the user."""
    try:
        user_settings = await get_or_create_user_settings(current_user.id, db)
        agent_configs = user_settings.get("agent_configurations", {})
        
        return {
            "success": True,
            "data": agent_configs,
            "count": len(agent_configs)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get agent configurations: {str(e)}")


@router.get("/agent-configs/{agent_id}")
async def get_agent_configuration(
    agent_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific agent configuration."""
    try:
        user_settings = await get_or_create_user_settings(current_user.id, db)
        agent_configs = user_settings.get("agent_configurations", {})
        
        if agent_id not in agent_configs:
            raise HTTPException(status_code=404, detail="Agent configuration not found")
        
        return {
            "success": True,
            "data": agent_configs[agent_id]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get agent configuration: {str(e)}")


@router.delete("/agent-configs/{agent_id}")
async def delete_agent_configuration(
    agent_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete an agent configuration."""
    try:
        user_settings = await get_or_create_user_settings(current_user.id, db)
        agent_configs = user_settings.get("agent_configurations", {})
        
        if agent_id not in agent_configs:
            raise HTTPException(status_code=404, detail="Agent configuration not found")
        
        del agent_configs[agent_id]
        user_settings["agent_configurations"] = agent_configs
        user_settings["updated_at"] = datetime.utcnow().isoformat()
        
        await save_user_settings(current_user.id, user_settings, db)
        
        return {
            "success": True,
            "message": f"Agent configuration deleted"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete agent configuration: {str(e)}")


# Workflow Template Endpoints
@router.post("/workflow-templates")
async def save_workflow_template(
    template: WorkflowTemplate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Save a workflow template."""
    try:
        user_settings = await get_or_create_user_settings(current_user.id, db)
        
        workflow_templates = user_settings.get("workflow_templates", {})
        workflow_templates[template.workflow_id] = {
            **template.model_dump(),
            "saved_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        user_settings["workflow_templates"] = workflow_templates
        user_settings["updated_at"] = datetime.utcnow().isoformat()
        
        await save_user_settings(current_user.id, user_settings, db)
        
        return {
            "success": True,
            "message": f"Workflow template '{template.name}' saved",
            "workflow_id": template.workflow_id
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save workflow template: {str(e)}")


@router.get("/workflow-templates")
async def get_workflow_templates(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all workflow templates for the user."""
    try:
        user_settings = await get_or_create_user_settings(current_user.id, db)
        workflow_templates = user_settings.get("workflow_templates", {})
        
        return {
            "success": True,
            "data": workflow_templates,
            "count": len(workflow_templates)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get workflow templates: {str(e)}")


@router.delete("/workflow-templates/{workflow_id}")
async def delete_workflow_template(
    workflow_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a workflow template."""
    try:
        user_settings = await get_or_create_user_settings(current_user.id, db)
        workflow_templates = user_settings.get("workflow_templates", {})
        
        if workflow_id not in workflow_templates:
            raise HTTPException(status_code=404, detail="Workflow template not found")
        
        del workflow_templates[workflow_id]
        user_settings["workflow_templates"] = workflow_templates
        user_settings["updated_at"] = datetime.utcnow().isoformat()
        
        await save_user_settings(current_user.id, user_settings, db)
        
        return {
            "success": True,
            "message": "Workflow template deleted"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete workflow template: {str(e)}")


# User Preferences Endpoints
@router.post("/preferences")
async def save_user_preferences(
    preferences: UserPreferences,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Save user preferences."""
    try:
        user_settings = await get_or_create_user_settings(current_user.id, db)
        
        user_settings["preferences"] = {
            **preferences.model_dump(),
            "updated_at": datetime.utcnow().isoformat()
        }
        user_settings["updated_at"] = datetime.utcnow().isoformat()
        
        await save_user_settings(current_user.id, user_settings, db)
        
        return {
            "success": True,
            "message": "User preferences saved"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save user preferences: {str(e)}")


@router.get("/preferences")
async def get_user_preferences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user preferences."""
    try:
        user_settings = await get_or_create_user_settings(current_user.id, db)
        preferences = user_settings.get("preferences", {})
        
        return {
            "success": True,
            "data": preferences
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user preferences: {str(e)}")


# Sync endpoint for hybrid storage
@router.post("/sync")
async def sync_from_local_storage(
    local_data: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Sync data from localStorage to the backend."""
    try:
        logger.info(f"🔄 Syncing data for user: {current_user.id if current_user else 'anonymous'}")
        
        if not current_user:
            logger.error("❌ No authenticated user for sync")
            return {
                "success": False,
                "message": "User not authenticated"
            }
        
        user_settings = await get_or_create_user_settings(current_user.id, db)
        
        # Merge local data with server data (server takes precedence for conflicts)
        if "agent_configurations" in local_data:
            server_configs = user_settings.get("agent_configurations", {})
            local_configs = local_data["agent_configurations"]
            
            # Only update if server doesn't have the config or local is newer
            for agent_id, local_config in local_configs.items():
                if agent_id not in server_configs:
                    server_configs[agent_id] = {
                        **local_config,
                        "synced_at": datetime.utcnow().isoformat()
                    }
                elif local_config.get("updated_at", "") > server_configs[agent_id].get("updated_at", ""):
                    server_configs[agent_id] = {
                        **local_config,
                        "synced_at": datetime.utcnow().isoformat()
                    }
            
            user_settings["agent_configurations"] = server_configs
        
        # Similar logic for workflow templates
        if "workflow_templates" in local_data:
            server_templates = user_settings.get("workflow_templates", {})
            local_templates = local_data["workflow_templates"]
            
            for workflow_id, local_template in local_templates.items():
                if workflow_id not in server_templates:
                    server_templates[workflow_id] = {
                        **local_template,
                        "synced_at": datetime.utcnow().isoformat()
                    }
                elif local_template.get("updated_at", "") > server_templates[workflow_id].get("updated_at", ""):
                    server_templates[workflow_id] = {
                        **local_template,
                        "synced_at": datetime.utcnow().isoformat()
                    }
            
            user_settings["workflow_templates"] = server_templates
        
        user_settings["updated_at"] = datetime.utcnow().isoformat()
        await save_user_settings(current_user.id, user_settings, db)
        
        logger.info(f"✅ Data synced successfully for user {current_user.id}")
        
        return {
            "success": True,
            "message": "Data synced successfully",
            "synced_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Failed to sync data: {str(e)}", exc_info=True)
        return {
            "success": False,
            "message": f"Sync failed: {str(e)}"
        }


# Helper functions
async def get_or_create_user_settings(user_id: str, db: Session) -> Dict[str, Any]:
    """Get or create user settings from the database."""
    # This uses the existing settings infrastructure
    # In a real implementation, you might want to create a dedicated UserSettings table
    from .settings import _SETTINGS_STORE
    
    if user_id not in _SETTINGS_STORE:
        _SETTINGS_STORE[user_id] = {
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
    
    return _SETTINGS_STORE[user_id]


async def save_user_settings(user_id: str, settings: Dict[str, Any], db: Session):
    """Save user settings to the database."""
    # This uses the existing settings infrastructure
    # In a real implementation, you might want to create a dedicated UserSettings table
    from .settings import _SETTINGS_STORE
    
    _SETTINGS_STORE[user_id] = settings
    # Note: In production, you'd want to persist this to the database
    # For now, this uses the in-memory store from the existing settings endpoint
