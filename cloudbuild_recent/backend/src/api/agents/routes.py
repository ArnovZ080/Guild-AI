"""
Agent API Routes
FastAPI endpoints for agent execution and communication
"""

from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect, Depends, BackgroundTasks
from fastapi.responses import JSONResponse
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field
import json
import logging
from datetime import datetime

from ...agents.agent_orchestrator import agent_orchestrator
from ...websocket.agent_communication import agent_comm_manager

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/agents", tags=["agents"])

# Pydantic models for request/response
class TaskRequest(BaseModel):
    description: str = Field(..., description="Task description")
    context: Optional[Dict[str, Any]] = Field(default={}, description="Additional context")
    preferred_agent_id: Optional[str] = Field(None, description="Preferred agent for this task")
    priority: Optional[str] = Field("normal", description="Task priority")
    metadata: Optional[Dict[str, Any]] = Field(default={}, description="Additional metadata")

class AgentExecutionResponse(BaseModel):
    session_id: str
    agent_id: str
    status: str
    estimated_duration: Optional[int] = None
    message: str

class UserResponseModel(BaseModel):
    message_id: str
    session_id: str
    response: str
    metadata: Optional[Dict[str, Any]] = None

class AgentStatusResponse(BaseModel):
    agent_id: str
    name: str
    status: str
    capabilities: List[str]
    current_session: Optional[str] = None

@router.post("/execute", response_model=AgentExecutionResponse)
async def execute_task(task_request: TaskRequest, user_id: str = "default_user"):
    """Execute a task using an appropriate agent"""
    try:
        # Prepare task data
        task = {
            "description": task_request.description,
            "context": task_request.context,
            "priority": task_request.priority,
            "metadata": task_request.metadata,
            "user_id": user_id,
            "created_at": datetime.now().isoformat()
        }
        
        # Execute task
        session_id = await agent_orchestrator.execute_task(
            task, user_id, task_request.preferred_agent_id
        )
        
        # Get agent info
        agent_id = agent_orchestrator.active_sessions[session_id]['agent_id']
        agent = agent_orchestrator.agents[agent_id]
        
        return AgentExecutionResponse(
            session_id=session_id,
            agent_id=agent_id,
            status="started",
            estimated_duration=agent.get_estimated_duration(task),
            message=f"Task assigned to {agent.name}"
        )
        
    except Exception as e:
        logger.error(f"Task execution failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/delegate/{agent_id}")
async def delegate_to_agent(agent_id: str, task_request: TaskRequest, user_id: str = "default_user"):
    """Delegate a task directly to a specific agent"""
    try:
        task = {
            "description": task_request.description,
            "context": task_request.context,
            "priority": task_request.priority,
            "metadata": task_request.metadata,
            "user_id": user_id,
            "created_at": datetime.now().isoformat()
        }
        
        session_id = await agent_orchestrator.delegate_to_agent(agent_id, task, user_id)
        
        return AgentExecutionResponse(
            session_id=session_id,
            agent_id=agent_id,
            status="started",
            message=f"Task delegated to {agent_id}"
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Agent delegation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/respond")
async def respond_to_agent(user_response: UserResponseModel):
    """Respond to an agent's clarification request"""
    try:
        from ...websocket.agent_communication import UserResponse
        
        response = UserResponse(
            message_id=user_response.message_id,
            user_id="default_user",  # This should come from auth
            session_id=user_response.session_id,
            response=user_response.response,
            timestamp=datetime.now(),
            metadata=user_response.metadata
        )
        
        await agent_comm_manager.handle_user_response(response)
        
        return {"success": True, "message": "Response processed"}
        
    except Exception as e:
        logger.error(f"Response handling failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status/{agent_id}")
async def get_agent_status(agent_id: str):
    """Get status of a specific agent"""
    try:
        status = await agent_orchestrator.get_agent_status(agent_id)
        return status
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
async def get_all_agents_status():
    """Get status of all agents"""
    try:
        status = await agent_orchestrator.get_all_agents_status()
        return status
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/available")
async def get_available_agents():
    """Get list of available agents"""
    try:
        agents = agent_orchestrator.get_available_agents()
        return {"agents": agents}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/capabilities")
async def get_agent_capabilities():
    """Get capabilities of all agents"""
    try:
        capabilities = agent_orchestrator.get_agent_capabilities()
        return capabilities
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/cancel/{session_id}")
async def cancel_task(session_id: str):
    """Cancel an active task"""
    try:
        success = await agent_orchestrator.cancel_task(session_id)
        if success:
            return {"success": True, "message": "Task cancelled"}
        else:
            raise HTTPException(status_code=404, detail="Session not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/session/{session_id}")
async def get_session_info(session_id: str):
    """Get information about a session"""
    try:
        info = await agent_orchestrator.get_session_info(session_id)
        if info:
            return info
        else:
            raise HTTPException(status_code=404, detail="Session not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sessions/{user_id}")
async def get_user_sessions(user_id: str):
    """Get all sessions for a user"""
    try:
        sessions = await agent_orchestrator.get_user_sessions(user_id)
        return {"sessions": sessions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.websocket("/ws/{user_id}/{session_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str, session_id: str):
    """WebSocket endpoint for real-time agent communication"""
    await agent_comm_manager.connect(websocket, user_id, session_id)
    
    try:
        while True:
            # Receive data from client
            data = await websocket.receive_text()
            
            # Handle different message types
            try:
                message_data = json.loads(data)
                message_type = message_data.get('type')
                
                if message_type == 'user_response':
                    # Handle user response
                    from ...websocket.agent_communication import UserResponse
                    response = UserResponse(**message_data)
                    await agent_comm_manager.handle_user_response(response)
                    
                elif message_type == 'ping':
                    # Handle ping/pong
                    await websocket.send_text(json.dumps({'type': 'pong'}))
                    
                else:
                    logger.warning(f"Unknown message type: {message_type}")
                    
            except json.JSONDecodeError:
                logger.error(f"Invalid JSON received: {data}")
                await websocket.send_text(json.dumps({
                    'type': 'error',
                    'message': 'Invalid JSON format'
                }))
                
    except WebSocketDisconnect:
        await agent_comm_manager.disconnect(session_id)
        logger.info(f"WebSocket disconnected for session {session_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        await agent_comm_manager.disconnect(session_id)
