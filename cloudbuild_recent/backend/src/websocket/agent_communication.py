"""
Agent Communication WebSocket Service
Handles real-time communication between agents and frontend users
"""

import asyncio
import json
import uuid
from typing import Dict, List, Optional, Any
from datetime import datetime
from fastapi import WebSocket, WebSocketDisconnect
from pydantic import BaseModel
import logging

logger = logging.getLogger(__name__)

class AgentMessage(BaseModel):
    """Standard message format for agent communication"""
    id: str
    agent_id: str
    user_id: str
    session_id: str
    message_type: str  # 'question', 'response', 'status', 'error', 'clarification_request'
    content: str
    metadata: Optional[Dict[str, Any]] = None
    timestamp: datetime
    requires_user_response: bool = False
    context: Optional[Dict[str, Any]] = None

class UserResponse(BaseModel):
    """User response to agent queries"""
    message_id: str
    user_id: str
    session_id: str
    response: str
    timestamp: datetime
    metadata: Optional[Dict[str, Any]] = None

class AgentSession(BaseModel):
    """Active agent session with user"""
    session_id: str
    user_id: str
    agent_id: str
    status: str  # 'active', 'waiting_for_response', 'completed', 'error'
    context: Dict[str, Any]
    created_at: datetime
    last_activity: datetime

class AgentCommunicationManager:
    """Manages real-time communication between agents and users"""
    
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.agent_sessions: Dict[str, AgentSession] = {}
        self.pending_responses: Dict[str, str] = {}  # message_id -> session_id
        self.agent_queues: Dict[str, asyncio.Queue] = {}
        
    async def connect(self, websocket: WebSocket, user_id: str, session_id: str):
        """Accept WebSocket connection from frontend"""
        await websocket.accept()
        self.active_connections[session_id] = websocket
        logger.info(f"User {user_id} connected with session {session_id}")
        
    async def disconnect(self, session_id: str):
        """Handle WebSocket disconnection"""
        if session_id in self.active_connections:
            del self.active_connections[session_id]
        if session_id in self.agent_sessions:
            del self.agent_sessions[session_id]
        logger.info(f"Session {session_id} disconnected")
        
    async def send_to_user(self, session_id: str, message: AgentMessage):
        """Send message from agent to user"""
        if session_id in self.active_connections:
            try:
                await self.active_connections[session_id].send_text(message.json())
                logger.info(f"Message sent to user {session_id}: {message.message_type}")
            except Exception as e:
                logger.error(f"Failed to send message to {session_id}: {e}")
                await self.disconnect(session_id)
                
    async def receive_from_user(self, session_id: str, data: str) -> Optional[UserResponse]:
        """Receive response from user"""
        try:
            user_data = json.loads(data)
            response = UserResponse(**user_data)
            logger.info(f"Received response from user {session_id}")
            return response
        except Exception as e:
            logger.error(f"Failed to parse user response: {e}")
            return None
            
    async def create_agent_session(self, user_id: str, agent_id: str, context: Dict[str, Any] = None) -> str:
        """Create new agent session"""
        session_id = str(uuid.uuid4())
        session = AgentSession(
            session_id=session_id,
            user_id=user_id,
            agent_id=agent_id,
            status='active',
            context=context or {},
            created_at=datetime.now(),
            last_activity=datetime.now()
        )
        self.agent_sessions[session_id] = session
        self.agent_queues[session_id] = asyncio.Queue()
        logger.info(f"Created agent session {session_id} for agent {agent_id}")
        return session_id
        
    async def send_clarification_request(self, session_id: str, agent_id: str, question: str, context: Dict[str, Any] = None):
        """Send clarification request from agent to user"""
        message = AgentMessage(
            id=str(uuid.uuid4()),
            agent_id=agent_id,
            user_id=self.agent_sessions[session_id].user_id,
            session_id=session_id,
            message_type='clarification_request',
            content=question,
            metadata={'context': context},
            timestamp=datetime.now(),
            requires_user_response=True,
            context=context
        )
        
        # Mark session as waiting for response
        if session_id in self.agent_sessions:
            self.agent_sessions[session_id].status = 'waiting_for_response'
            self.agent_sessions[session_id].last_activity = datetime.now()
            self.pending_responses[message.id] = session_id
            
        await self.send_to_user(session_id, message)
        logger.info(f"Clarification request sent from agent {agent_id} to user {session_id}")
        
    async def handle_user_response(self, response: UserResponse):
        """Handle user response to agent clarification"""
        if response.message_id in self.pending_responses:
            session_id = self.pending_responses[response.message_id]
            
            # Update session status
            if session_id in self.agent_sessions:
                self.agent_sessions[session_id].status = 'active'
                self.agent_sessions[session_id].last_activity = datetime.now()
                
            # Send response to agent queue
            if session_id in self.agent_queues:
                await self.agent_queues[session_id].put(response)
                
            # Remove from pending responses
            del self.pending_responses[response.message_id]
            logger.info(f"User response processed for session {session_id}")
            
    async def send_agent_status(self, session_id: str, agent_id: str, status: str, progress: int = 0, details: str = ""):
        """Send agent status update to user"""
        message = AgentMessage(
            id=str(uuid.uuid4()),
            agent_id=agent_id,
            user_id=self.agent_sessions[session_id].user_id,
            session_id=session_id,
            message_type='status',
            content=details,
            metadata={'status': status, 'progress': progress},
            timestamp=datetime.now(),
            requires_user_response=False
        )
        await self.send_to_user(session_id, message)
        
    async def send_agent_response(self, session_id: str, agent_id: str, response: str, metadata: Dict[str, Any] = None):
        """Send agent response to user"""
        message = AgentMessage(
            id=str(uuid.uuid4()),
            agent_id=agent_id,
            user_id=self.agent_sessions[session_id].user_id,
            session_id=session_id,
            message_type='response',
            content=response,
            metadata=metadata,
            timestamp=datetime.now(),
            requires_user_response=False
        )
        await self.send_to_user(session_id, message)
        
    async def send_agent_error(self, session_id: str, agent_id: str, error: str, details: str = ""):
        """Send agent error to user"""
        message = AgentMessage(
            id=str(uuid.uuid4()),
            agent_id=agent_id,
            user_id=self.agent_sessions[session_id].user_id,
            session_id=session_id,
            message_type='error',
            content=error,
            metadata={'details': details},
            timestamp=datetime.now(),
            requires_user_response=False
        )
        await self.send_to_user(session_id, message)
        
    def get_session_context(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get current session context"""
        if session_id in self.agent_sessions:
            return self.agent_sessions[session_id].context
        return None
        
    def update_session_context(self, session_id: str, context_updates: Dict[str, Any]):
        """Update session context"""
        if session_id in self.agent_sessions:
            self.agent_sessions[session_id].context.update(context_updates)
            self.agent_sessions[session_id].last_activity = datetime.now()

# Global instance
agent_comm_manager = AgentCommunicationManager()
