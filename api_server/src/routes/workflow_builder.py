"""
API Routes for Workflow Builder

This module provides REST API endpoints for the visual workflow builder system.
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, List, Any, Optional
from pydantic import BaseModel
import sys
import os

# Add the guild package to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../..', 'guild'))

from guild.src.core.workflow_builder import VisualWorkflowBuilder

router = APIRouter(prefix="/workflow-builder", tags=["workflow-builder"])

# Initialize workflow builder (in production, this should be a singleton)
workflow_builder = VisualWorkflowBuilder()


# Pydantic models for API requests/responses
class CreateWorkflowRequest(BaseModel):
    name: str
    description: str = ""


class AddNodeRequest(BaseModel):
    template_id: str
    position: tuple[int, int] = (0, 0)
    custom_config: Optional[Dict[str, Any]] = None


class ConnectNodesRequest(BaseModel):
    source_node_id: str
    target_node_id: str
    source_port: str = "output"
    target_port: str = "input"
    data_type: str = "any"
    condition: Optional[str] = None


class ExecuteWorkflowRequest(BaseModel):
    inputs: Optional[Dict[str, Any]] = None


class WorkflowResponse(BaseModel):
    workflow_id: str
    name: str
    description: str
    node_count: int
    connection_count: int
    status: str
    created_at: str
    modified_at: str


class NodeResponse(BaseModel):
    node_id: str
    name: str
    node_type: str
    description: str
    position: tuple[int, int]
    status: str
    estimated_duration: int


class ConnectionResponse(BaseModel):
    connection_id: str
    source_node_id: str
    target_node_id: str
    source_port: str
    target_port: str
    data_type: str
    condition: Optional[str] = None


class ExecutionStatusResponse(BaseModel):
    execution_id: str
    workflow_id: str
    workflow_name: str
    status: str
    progress: float
    current_node: Optional[str] = None
    error: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None


@router.post("/workflows", response_model=Dict[str, str])
async def create_workflow(request: CreateWorkflowRequest):
    """Create a new workflow."""
    try:
        workflow_id = workflow_builder.create_workflow(
            name=request.name,
            description=request.description
        )
        return {"workflow_id": workflow_id, "message": "Workflow created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create workflow: {str(e)}")


@router.get("/workflows", response_model=List[WorkflowResponse])
async def get_all_workflows():
    """Get all workflows."""
    try:
        workflows = workflow_builder.get_all_workflows()
        return workflows
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get workflows: {str(e)}")


@router.get("/workflows/{workflow_id}", response_model=Dict[str, Any])
async def get_workflow(workflow_id: str):
    """Get a specific workflow by ID."""
    try:
        workflow = workflow_builder.get_workflow(workflow_id)
        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")
        return workflow
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get workflow: {str(e)}")


@router.post("/workflows/{workflow_id}/nodes", response_model=Dict[str, str])
async def add_node(workflow_id: str, request: AddNodeRequest):
    """Add a node to a workflow using a template."""
    try:
        node_id = workflow_builder.add_node_from_template(
            workflow_id=workflow_id,
            template_id=request.template_id,
            position=request.position,
            custom_config=request.custom_config
        )
        
        if not node_id:
            raise HTTPException(status_code=400, detail="Failed to add node")
        
        return {"node_id": node_id, "message": "Node added successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add node: {str(e)}")


@router.get("/workflows/{workflow_id}/nodes", response_model=List[NodeResponse])
async def get_workflow_nodes(workflow_id: str):
    """Get all nodes in a workflow."""
    try:
        nodes = workflow_builder.get_workflow_nodes(workflow_id)
        return nodes
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get workflow nodes: {str(e)}")


@router.delete("/workflows/{workflow_id}/nodes/{node_id}")
async def remove_node(workflow_id: str, node_id: str):
    """Remove a node from a workflow."""
    try:
        success = workflow_builder.remove_node(workflow_id, node_id)
        if not success:
            raise HTTPException(status_code=404, detail="Node not found")
        return {"message": "Node removed successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to remove node: {str(e)}")


@router.post("/workflows/{workflow_id}/connections", response_model=Dict[str, str])
async def connect_nodes(workflow_id: str, request: ConnectNodesRequest):
    """Connect two nodes in a workflow."""
    try:
        success = workflow_builder.connect_nodes(
            workflow_id=workflow_id,
            source_node_id=request.source_node_id,
            target_node_id=request.target_node_id,
            source_port=request.source_port,
            target_port=request.target_port,
            data_type=request.data_type,
            condition=request.condition
        )
        
        if not success:
            raise HTTPException(status_code=400, detail="Failed to connect nodes")
        
        return {"message": "Nodes connected successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to connect nodes: {str(e)}")


@router.get("/workflows/{workflow_id}/connections", response_model=List[ConnectionResponse])
async def get_workflow_connections(workflow_id: str):
    """Get all connections in a workflow."""
    try:
        connections = workflow_builder.get_workflow_connections(workflow_id)
        return connections
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get workflow connections: {str(e)}")


@router.delete("/workflows/{workflow_id}/connections")
async def disconnect_nodes(workflow_id: str, source_node_id: str, target_node_id: str):
    """Disconnect two nodes in a workflow."""
    try:
        success = workflow_builder.disconnect_nodes(workflow_id, source_node_id, target_node_id)
        if not success:
            raise HTTPException(status_code=404, detail="Connection not found")
        return {"message": "Nodes disconnected successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to disconnect nodes: {str(e)}")


@router.post("/workflows/{workflow_id}/validate", response_model=Dict[str, Any])
async def validate_workflow(workflow_id: str):
    """Validate a workflow for execution."""
    try:
        validation = workflow_builder.validate_workflow(workflow_id)
        return validation
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to validate workflow: {str(e)}")


@router.post("/workflows/{workflow_id}/execute", response_model=Dict[str, str])
async def execute_workflow(workflow_id: str, request: ExecuteWorkflowRequest):
    """Execute a workflow."""
    try:
        execution_id = workflow_builder.execute_workflow(
            workflow_id=workflow_id,
            inputs=request.inputs
        )
        return {"execution_id": execution_id, "message": "Workflow execution started"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to execute workflow: {str(e)}")


@router.get("/executions/{execution_id}", response_model=ExecutionStatusResponse)
async def get_execution_status(execution_id: str):
    """Get status of a workflow execution."""
    try:
        status = workflow_builder.get_execution_status(execution_id)
        if not status:
            raise HTTPException(status_code=404, detail="Execution not found")
        return status
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get execution status: {str(e)}")


@router.post("/executions/{execution_id}/pause")
async def pause_execution(execution_id: str):
    """Pause a workflow execution."""
    try:
        success = workflow_builder.pause_execution(execution_id)
        if not success:
            raise HTTPException(status_code=400, detail="Cannot pause execution")
        return {"message": "Execution paused successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to pause execution: {str(e)}")


@router.post("/executions/{execution_id}/resume")
async def resume_execution(execution_id: str):
    """Resume a paused workflow execution."""
    try:
        success = workflow_builder.resume_execution(execution_id)
        if not success:
            raise HTTPException(status_code=400, detail="Cannot resume execution")
        return {"message": "Execution resumed successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to resume execution: {str(e)}")


@router.post("/executions/{execution_id}/cancel")
async def cancel_execution(execution_id: str):
    """Cancel a workflow execution."""
    try:
        success = workflow_builder.cancel_execution(execution_id)
        if not success:
            raise HTTPException(status_code=400, detail="Cannot cancel execution")
        return {"message": "Execution cancelled successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to cancel execution: {str(e)}")


@router.get("/executions", response_model=List[ExecutionStatusResponse])
async def get_all_executions():
    """Get all workflow executions."""
    try:
        executions = workflow_builder.execution_engine.get_all_executions()
        return executions
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get executions: {str(e)}")


@router.get("/templates", response_model=Dict[str, List[Dict[str, Any]]])
async def get_available_templates():
    """Get available node templates."""
    try:
        templates = workflow_builder.get_available_templates()
        return templates
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get templates: {str(e)}")


@router.post("/workflows/{workflow_id}/duplicate", response_model=Dict[str, str])
async def duplicate_workflow(workflow_id: str, new_name: Optional[str] = None):
    """Duplicate an existing workflow."""
    try:
        duplicated_id = workflow_builder.duplicate_workflow(workflow_id, new_name)
        return {"workflow_id": duplicated_id, "message": "Workflow duplicated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to duplicate workflow: {str(e)}")


@router.get("/workflows/{workflow_id}/statistics", response_model=Dict[str, Any])
async def get_workflow_statistics(workflow_id: str):
    """Get statistics about a workflow."""
    try:
        stats = workflow_builder.get_workflow_statistics(workflow_id)
        if not stats:
            raise HTTPException(status_code=404, detail="Workflow not found")
        return stats
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get workflow statistics: {str(e)}")


@router.post("/workflows/{workflow_id}/export", response_model=Dict[str, Any])
async def export_workflow(workflow_id: str):
    """Export a workflow to JSON format."""
    try:
        exported_data = workflow_builder.export_workflow(workflow_id)
        if not exported_data:
            raise HTTPException(status_code=404, detail="Workflow not found")
        return exported_data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to export workflow: {str(e)}")


@router.post("/workflows/import", response_model=Dict[str, str])
async def import_workflow(workflow_data: Dict[str, Any]):
    """Import a workflow from JSON format."""
    try:
        workflow_id = workflow_builder.import_workflow(workflow_data)
        return {"workflow_id": workflow_id, "message": "Workflow imported successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to import workflow: {str(e)}")


@router.delete("/workflows/{workflow_id}")
async def delete_workflow(workflow_id: str):
    """Delete a workflow."""
    try:
        # Note: This would need to be implemented in the workflow builder
        # For now, we'll return a not implemented response
        raise HTTPException(status_code=501, detail="Workflow deletion not yet implemented")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete workflow: {str(e)}")
