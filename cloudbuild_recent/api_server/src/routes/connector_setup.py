"""
Connector Setup API Routes

Provides REST API endpoints for guided connector setup and management.
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import Dict, List, Any, Optional
from datetime import datetime, date
import asyncio

from guild.src.core.onboarding.connector_setup import guided_setup, ConnectorType, SetupStatus
from guild.src.utils.logging_utils import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/api/connectors", tags=["connector-setup"])

# Pydantic models for request/response
class StartSetupRequest(BaseModel):
    user_id: str = Field(..., description="User ID for the setup session")
    connector_id: str = Field(..., description="Connector ID to set up")

class SubmitStepDataRequest(BaseModel):
    session_id: str = Field(..., description="Setup session ID")
    step_data: Dict[str, Any] = Field(..., description="Data for the current step")

class ConnectorCredentialsRequest(BaseModel):
    connector_id: str = Field(..., description="Connector ID")
    credentials: Dict[str, Any] = Field(..., description="Connector credentials")

class ConnectorTestRequest(BaseModel):
    connector_id: str = Field(..., description="Connector ID to test")
    credentials: Dict[str, Any] = Field(..., description="Credentials to test")

@router.get("/available")
async def get_available_connectors(
    category: Optional[str] = None
) -> JSONResponse:
    """Get list of available connectors for setup"""
    try:
        connector_type = ConnectorType(category) if category else None
        connectors = await guided_setup.get_available_connectors(connector_type)
        
        return JSONResponse(content={
            "success": True,
            "connectors": connectors,
            "total": len(connectors)
        })
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid category: {str(e)}")
    except Exception as e:
        logger.error(f"Error getting available connectors: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/setup/start")
async def start_connector_setup(
    request: StartSetupRequest,
    background_tasks: BackgroundTasks
) -> JSONResponse:
    """Start guided setup for a connector"""
    try:
        result = await guided_setup.start_guided_setup(
            user_id=request.user_id,
            connector_id=request.connector_id
        )
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        # Log setup start
        background_tasks.add_task(
            log_setup_event,
            request.user_id,
            request.connector_id,
            "setup_started"
        )
        
        return JSONResponse(content={
            "success": True,
            "session": result,
            "message": "Setup session started successfully"
        })
    
    except Exception as e:
        logger.error(f"Error starting connector setup: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/setup/{session_id}/next-step")
async def get_next_setup_step(session_id: str) -> JSONResponse:
    """Get the next step in the setup process"""
    try:
        result = await guided_setup.get_next_step(session_id)
        
        if "error" in result:
            raise HTTPException(status_code=404, detail=result["error"])
        
        return JSONResponse(content={
            "success": True,
            "step": result
        })
    
    except Exception as e:
        logger.error(f"Error getting next setup step: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/setup/submit-step")
async def submit_setup_step_data(
    request: SubmitStepDataRequest,
    background_tasks: BackgroundTasks
) -> JSONResponse:
    """Submit data for the current setup step"""
    try:
        result = await guided_setup.submit_step_data(
            session_id=request.session_id,
            step_data=request.step_data
        )
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        # Log step completion
        background_tasks.add_task(
            log_setup_event,
            request.session_id,
            result.get("connector_name", "unknown"),
            "step_completed"
        )
        
        return JSONResponse(content={
            "success": True,
            "result": result
        })
    
    except Exception as e:
        logger.error(f"Error submitting step data: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/test-connection")
async def test_connector_connection(
    request: ConnectorTestRequest,
    background_tasks: BackgroundTasks
) -> JSONResponse:
    """Test connector connection with provided credentials"""
    try:
        # This would test the connector without storing credentials
        # Implementation depends on the specific connector
        
        # For now, return a mock response
        test_result = {
            "success": True,
            "connector_id": request.connector_id,
            "test_results": {
                "connection": True,
                "permissions": True,
                "endpoints": ["/test1", "/test2"],
                "message": "Connection test successful"
            },
            "timestamp": datetime.now().isoformat()
        }
        
        # Log test attempt
        background_tasks.add_task(
            log_setup_event,
            "test_user",
            request.connector_id,
            "connection_tested"
        )
        
        return JSONResponse(content={
            "success": True,
            "test_result": test_result
        })
    
    except Exception as e:
        logger.error(f"Error testing connector connection: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/user/{user_id}/connectors")
async def get_user_connectors(user_id: str) -> JSONResponse:
    """Get connectors set up by a user"""
    try:
        connectors = await guided_setup.get_user_connectors(user_id)
        
        return JSONResponse(content={
            "success": True,
            "connectors": connectors,
            "total": len(connectors)
        })
    
    except Exception as e:
        logger.error(f"Error getting user connectors: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/categories")
async def get_connector_categories() -> JSONResponse:
    """Get available connector categories"""
    try:
        categories = [
            {
                "id": category.value,
                "name": category.value.replace("_", " ").title(),
                "description": get_category_description(category),
                "icon": get_category_icon(category)
            }
            for category in ConnectorType
        ]
        
        return JSONResponse(content={
            "success": True,
            "categories": categories
        })
    
    except Exception as e:
        logger.error(f"Error getting connector categories: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/setup/{session_id}/status")
async def get_setup_session_status(session_id: str) -> JSONResponse:
    """Get the status of a setup session"""
    try:
        if session_id not in guided_setup.setup_sessions:
            raise HTTPException(status_code=404, detail="Setup session not found")
        
        session = guided_setup.setup_sessions[session_id]
        
        return JSONResponse(content={
            "success": True,
            "session": {
                "session_id": session_id,
                "user_id": session["user_id"],
                "connector_id": session["connector_id"],
                "status": session["status"].value,
                "current_step": session["current_step"],
                "total_steps": len(session["connector"].setup_steps),
                "started_at": session["started_at"].isoformat(),
                "completed_at": session["completed_at"].isoformat() if session["completed_at"] else None
            }
        })
    
    except Exception as e:
        logger.error(f"Error getting setup session status: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete("/setup/{session_id}")
async def cancel_setup_session(session_id: str) -> JSONResponse:
    """Cancel a setup session"""
    try:
        if session_id not in guided_setup.setup_sessions:
            raise HTTPException(status_code=404, detail="Setup session not found")
        
        # Remove the session
        del guided_setup.setup_sessions[session_id]
        
        return JSONResponse(content={
            "success": True,
            "message": "Setup session cancelled successfully"
        })
    
    except Exception as e:
        logger.error(f"Error cancelling setup session: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/health")
async def health_check() -> JSONResponse:
    """Health check for connector setup service"""
    try:
        # Check if the guided setup system is working
        available_connectors = await guided_setup.get_available_connectors()
        
        return JSONResponse(content={
            "success": True,
            "status": "healthy",
            "available_connectors": len(available_connectors),
            "active_sessions": len(guided_setup.setup_sessions),
            "timestamp": datetime.now().isoformat()
        })
    
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=503, detail="Service unhealthy")

# Helper functions
def get_category_description(category: ConnectorType) -> str:
    """Get description for a connector category"""
    descriptions = {
        ConnectorType.ACCOUNTING: "Financial management and bookkeeping tools",
        ConnectorType.PAYMENTS: "Payment processing and revenue tracking",
        ConnectorType.CRM: "Customer relationship management platforms",
        ConnectorType.EMAIL_MARKETING: "Email marketing and automation tools",
        ConnectorType.SOCIAL_MEDIA: "Social media platforms and management tools",
        ConnectorType.AD_PLATFORMS: "Advertising platforms and campaign management",
        ConnectorType.ANALYTICS: "Analytics and data tracking tools",
        ConnectorType.PRODUCTIVITY: "Productivity and collaboration tools",
        ConnectorType.COMMUNICATIONS: "Communication and messaging platforms",
        ConnectorType.MEETINGS: "Meeting and scheduling tools",
        ConnectorType.ECOMMERCE: "E-commerce platforms and marketplaces",
        ConnectorType.RECRUITMENT: "Recruitment and hiring platforms",
        ConnectorType.INTELLIGENCE: "Data feeds and intelligence sources"
    }
    return descriptions.get(category, "Business integration tools")

def get_category_icon(category: ConnectorType) -> str:
    """Get icon for a connector category"""
    icons = {
        ConnectorType.ACCOUNTING: "📊",
        ConnectorType.PAYMENTS: "💳",
        ConnectorType.CRM: "👥",
        ConnectorType.EMAIL_MARKETING: "📧",
        ConnectorType.SOCIAL_MEDIA: "📱",
        ConnectorType.AD_PLATFORMS: "🎯",
        ConnectorType.ANALYTICS: "📈",
        ConnectorType.PRODUCTIVITY: "📝",
        ConnectorType.COMMUNICATIONS: "💬",
        ConnectorType.MEETINGS: "🎥",
        ConnectorType.ECOMMERCE: "🛍️",
        ConnectorType.RECRUITMENT: "💼",
        ConnectorType.INTELLIGENCE: "🧠"
    }
    return icons.get(category, "🔗")

async def log_setup_event(user_id: str, connector_id: str, event_type: str):
    """Log setup events for analytics and debugging"""
    try:
        logger.info(f"Setup event: {event_type} for user {user_id} with connector {connector_id}")
        # Here you would typically log to a database or analytics service
    except Exception as e:
        logger.error(f"Error logging setup event: {e}")

# WebSocket endpoint for real-time setup progress
from fastapi import WebSocket, WebSocketDisconnect

@router.websocket("/setup/{session_id}/ws")
async def websocket_setup_progress(websocket: WebSocket, session_id: str):
    """WebSocket endpoint for real-time setup progress updates"""
    await websocket.accept()
    
    try:
        while True:
            # Send periodic updates about setup progress
            if session_id in guided_setup.setup_sessions:
                session = guided_setup.setup_sessions[session_id]
                progress_data = {
                    "session_id": session_id,
                    "current_step": session["current_step"],
                    "total_steps": len(session["connector"].setup_steps),
                    "status": session["status"].value,
                    "progress_percentage": (session["current_step"] / len(session["connector"].setup_steps)) * 100
                }
                
                await websocket.send_json({
                    "type": "progress_update",
                    "data": progress_data
                })
            
            # Wait before sending next update
            await asyncio.sleep(5)
            
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for session {session_id}")
    except Exception as e:
        logger.error(f"WebSocket error for session {session_id}: {e}")
        await websocket.close()

# Include this router in the main FastAPI app
def include_router(app):
    """Include the connector setup router in the main FastAPI app"""
    app.include_router(router)
