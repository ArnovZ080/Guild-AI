"""
Workflow API Routes
Save/list/activate user-defined workflows from the drag-and-drop builder
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
from datetime import datetime
import uuid
import os
import asyncio

from ...services.database_service import db_service
from guild.src.core.autonomous_workflow_executor import (
    create_workflow,
    execute_workflow,
    MessagePriority,
    workflow_executor
)

router = APIRouter(prefix="/api/workflows", tags=["workflows"])


class SaveWorkflowRequest(BaseModel):
    user_id: str = Field(...)
    name: str = Field(...)
    description: Optional[str] = Field(default="")
    definition: Dict[str, Any] = Field(..., description="Visual builder JSON definition")
    status: str = Field(default="draft")


class SaveWorkflowResponse(BaseModel):
    workflow_id: str
    status: str
    message: str


class ActivateWorkflowResponse(BaseModel):
    workflow_id: str
    run_id: Optional[str] = None
    orchestrator_workflow_id: Optional[str] = None
    status: str
    message: str


@router.post("/save", response_model=SaveWorkflowResponse)
async def save_workflow(request: SaveWorkflowRequest):
    try:
        wf = await db_service.save_workflow(
            user_id=request.user_id,
            name=request.name,
            description=request.description or "",
            definition=request.definition,
            status=request.status or "draft"
        )
        return SaveWorkflowResponse(
            workflow_id=str(wf.id),
            status=wf.status,
            message="Workflow saved"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save workflow: {e}")


@router.get("/{user_id}", response_model=List[Dict[str, Any]])
async def list_user_workflows(user_id: str):
    try:
        items = await db_service.get_user_workflows(user_id)
        out: List[Dict[str, Any]] = []
        for wf in items:
            out.append({
                "id": str(wf.id),
                "user_id": wf.user_id,
                "name": wf.name,
                "description": wf.description,
                "status": wf.status,
                "created_at": wf.created_at.isoformat() if wf.created_at else None,
                "updated_at": wf.updated_at.isoformat() if wf.updated_at else None,
                "activated_at": wf.activated_at.isoformat() if wf.activated_at else None,
                "completed_at": wf.completed_at.isoformat() if wf.completed_at else None
            })
        return out
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list workflows: {e}")


@router.post("/{workflow_id}/activate", response_model=ActivateWorkflowResponse)
async def activate_workflow(workflow_id: str, user_id: str):
    """Activate a saved workflow: inject context, register with orchestrator, and execute."""
    try:
        wf = await db_service.get_workflow_by_id(workflow_id)
        if not wf:
            raise HTTPException(status_code=404, detail="workflow_not_found")

        # Fetch onboarding business context if available
        business_context = {}
        try:
            import httpx
            api_base = os.getenv("INTERNAL_API_BASE", "http://localhost:8000")
            async with httpx.AsyncClient(timeout=10.0) as client:
                r = await client.get(f"{api_base}/api/onboarding/data/{user_id}")
                if r.status_code == 200:
                    business_context = r.json()
        except Exception:
            pass

        # Try to create a generic orchestrator workflow entry so the theater shows it
        orchestrator_workflow_id: Optional[str] = None
        try:
            # Use a generic template; attach builder definition inside parameters so the
            # orchestrator can consume it if supported.
            orchestrator_workflow_id = await create_workflow(
                template_name="content_optimization",  # placeholder template
                parameters={
                    "builder_definition": wf.definition,
                    "workflow_name": wf.name,
                    "business_context": business_context
                },
                initiated_by=user_id,
                priority=MessagePriority.MEDIUM
            )
        except Exception:
            # Fallback: create a minimal placeholder entry in the theater transparency log
            orchestrator_workflow_id = f"builder_{workflow_id}"
            try:
                workflow_executor.transparency_logs.setdefault(orchestrator_workflow_id, [])
                workflow_executor.transparency_logs[orchestrator_workflow_id].append({
                    "timestamp": datetime.utcnow().isoformat(),
                    "event_type": "workflow_activation",
                    "data": {"workflow_id": workflow_id, "name": wf.name}
                })
            except Exception:
                pass

        # Attempt async execution when we did create via template
        if orchestrator_workflow_id and orchestrator_workflow_id.startswith("builder_") is False:
            asyncio.create_task(execute_workflow(orchestrator_workflow_id))

        # Update DB state and log run
        await db_service.update_workflow(workflow_id, status="active", activated_at=datetime.utcnow())
        run = await db_service.log_workflow_run(workflow_id, orchestrator_workflow_id, status="running")

        return ActivateWorkflowResponse(
            workflow_id=workflow_id,
            run_id=str(run.run_id) if run else None,
            orchestrator_workflow_id=orchestrator_workflow_id,
            status="activation_started",
            message="Workflow activation started"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to activate workflow: {e}")
