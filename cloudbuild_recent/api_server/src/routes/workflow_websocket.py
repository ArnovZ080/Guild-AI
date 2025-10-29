from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from typing import List, Dict, Any
import json
import asyncio
import logging
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models

logger = logging.getLogger(__name__)

router = APIRouter()

class ConnectionManager:
    """Manages WebSocket connections for real-time workflow updates"""
    
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket connected. Total connections: {len(self.active_connections)}")
    
    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        logger.info(f"WebSocket disconnected. Total connections: {len(self.active_connections)}")
    
    async def send_personal_message(self, message: str, websocket: WebSocket):
        try:
            await websocket.send_text(message)
        except Exception as e:
            logger.error(f"Error sending personal message: {e}")
            self.disconnect(websocket)
    
    async def broadcast(self, message: str):
        """Broadcast message to all connected clients"""
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception as e:
                logger.error(f"Error broadcasting to connection: {e}")
                disconnected.append(connection)
        
        # Remove disconnected connections
        for connection in disconnected:
            self.disconnect(connection)
    
    async def send_workflow_update(self, user_id: str, workflow_data: Dict[str, Any]):
        """Send workflow update to specific user or broadcast if user_id is None"""
        message = json.dumps({
            "type": "workflow_update",
            "user_id": user_id,
            "data": workflow_data
        })
        
        if user_id:
            # Send to specific user (if we had user-specific connections)
            await self.broadcast(message)
        else:
            await self.broadcast(message)

# Global connection manager
manager = ConnectionManager()

@router.websocket("/agents/workflows/stream")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time workflow updates"""
    await manager.connect(websocket)
    
    try:
        while True:
            # Keep connection alive and handle incoming messages
            try:
                data = await websocket.receive_text()
                message = json.loads(data)
                
                # Handle different message types
                if message.get("type") == "ping":
                    await manager.send_personal_message(
                        json.dumps({"type": "pong", "timestamp": asyncio.get_event_loop().time()}),
                        websocket
                    )
                elif message.get("type") == "subscribe_workflows":
                    # Send current workflows to the client
                    user_id = message.get("user_id")
                    if user_id:
                        # Get workflows for this user from database
                        # For now, send empty list - this will be populated by actual workflow data
                        await manager.send_personal_message(
                            json.dumps({
                                "type": "workflows_list",
                                "workflows": [],
                                "timestamp": asyncio.get_event_loop().time()
                            }),
                            websocket
                        )
                
            except json.JSONDecodeError:
                logger.warning("Received invalid JSON from WebSocket client")
                continue
            except Exception as e:
                logger.error(f"Error handling WebSocket message: {e}")
                break
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        logger.info("WebSocket client disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)

@router.get("/agents/workflows/status")
async def get_websocket_status():
    """Get WebSocket connection status"""
    return {
        "active_connections": len(manager.active_connections),
        "status": "operational" if manager.active_connections else "no_connections"
    }

# Function to broadcast workflow updates (called from other parts of the application)
async def broadcast_workflow_update(workflow_data: Dict[str, Any], user_id: str = None):
    """Broadcast workflow update to all connected WebSocket clients"""
    await manager.send_workflow_update(user_id, workflow_data)
