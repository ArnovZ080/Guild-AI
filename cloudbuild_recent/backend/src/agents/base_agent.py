"""
Base Agent Class with Communication Capabilities
All agents inherit from this class to get communication features
"""

import asyncio
import json
import uuid
from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Any, Union
from datetime import datetime
from enum import Enum
import logging

from ..websocket.agent_communication import agent_comm_manager, AgentMessage, UserResponse

logger = logging.getLogger(__name__)

class AgentStatus(Enum):
    IDLE = "idle"
    WORKING = "working"
    WAITING_FOR_INPUT = "waiting_for_input"
    ERROR = "error"
    COMPLETED = "completed"

class TaskComplexity(Enum):
    SIMPLE = "simple"
    MODERATE = "moderate"
    COMPLEX = "complex"

class BaseAgent(ABC):
    """Base class for all AI agents with communication capabilities"""
    
    def __init__(self, agent_id: str, name: str, description: str, capabilities: List[str] = None):
        self.agent_id = agent_id
        self.name = name
        self.description = description
        self.capabilities = capabilities or []
        self.status = AgentStatus.IDLE
        self.current_session_id: Optional[str] = None
        self.current_task: Optional[Dict[str, Any]] = None
        self.context: Dict[str, Any] = {}
        self.logger = logging.getLogger(f"agent.{agent_id}")
        
    async def execute_task(self, task: Dict[str, Any], session_id: str, user_id: str) -> Dict[str, Any]:
        """Execute a task with full communication capabilities"""
        try:
            self.current_session_id = session_id
            self.current_task = task
            self.status = AgentStatus.WORKING
            
            # Update context
            self.context.update(task.get('context', {}))
            agent_comm_manager.update_session_context(session_id, self.context)
            
            # Send status update
            await agent_comm_manager.send_agent_status(
                session_id, self.agent_id, "started", 0, f"{self.name} is starting to work on your request..."
            )
            
            # Validate task clarity
            if not await self._validate_task_clarity(task):
                return await self._handle_unclear_task(task, session_id)
                
            # Execute the main task
            result = await self._execute_main_task(task, session_id)
            
            # Update status to completed
            self.status = AgentStatus.COMPLETED
            await agent_comm_manager.send_agent_status(
                session_id, self.agent_id, "completed", 100, f"{self.name} has completed the task successfully!"
            )
            
            return result
            
        except Exception as e:
            self.status = AgentStatus.ERROR
            error_msg = f"{self.name} encountered an error: {str(e)}"
            await agent_comm_manager.send_agent_error(session_id, self.agent_id, error_msg, str(e))
            self.logger.error(f"Agent {self.agent_id} error: {e}")
            return {"success": False, "error": str(e)}
            
        finally:
            self.current_session_id = None
            self.current_task = None
            self.status = AgentStatus.IDLE
            
    async def _validate_task_clarity(self, task: Dict[str, Any]) -> bool:
        """Validate if task is clear enough to execute"""
        required_fields = self.get_required_task_fields()
        missing_fields = []
        
        for field in required_fields:
            if field not in task or not task[field]:
                missing_fields.append(field)
                
        if missing_fields:
            self.logger.info(f"Task missing required fields: {missing_fields}")
            return False
            
        # Check for ambiguity using agent-specific validation
        if hasattr(self, 'validate_task_specifics'):
            return await self.validate_task_specifics(task)
            
        return True
        
    async def _handle_unclear_task(self, task: Dict[str, Any], session_id: str) -> Dict[str, Any]:
        """Handle unclear task by asking for clarification"""
        self.status = AgentStatus.WAITING_FOR_INPUT
        
        # Generate clarification questions
        clarification_questions = await self._generate_clarification_questions(task)
        
        # Send clarification request
        for question in clarification_questions:
            await agent_comm_manager.send_clarification_request(
                session_id, self.agent_id, question, {"task": task}
            )
            
        # Wait for user response
        user_response = await self._wait_for_user_response(session_id)
        
        if user_response:
            # Update task with user response
            updated_task = await self._incorporate_user_response(task, user_response)
            
            # Validate again
            if await self._validate_task_clarity(updated_task):
                return await self._execute_main_task(updated_task, session_id)
            else:
                # Still unclear, ask more questions
                return await self._handle_unclear_task(updated_task, session_id)
        else:
            # No response received, return error
            return {"success": False, "error": "No clarification received from user"}
            
    async def _generate_clarification_questions(self, task: Dict[str, Any]) -> List[str]:
        """Generate clarification questions based on missing or unclear information"""
        questions = []
        
        # Check required fields
        required_fields = self.get_required_task_fields()
        missing_fields = [field for field in required_fields if field not in task or not task[field]]
        
        for field in missing_fields:
            questions.append(f"I need more information about {field}. Could you please provide details?")
            
        # Agent-specific clarification
        if hasattr(self, 'generate_specific_questions'):
            specific_questions = await self.generate_specific_questions(task)
            questions.extend(specific_questions)
            
        return questions
        
    async def _wait_for_user_response(self, session_id: str) -> Optional[UserResponse]:
        """Wait for user response with timeout"""
        try:
            # Wait for response in agent queue with timeout
            if session_id in agent_comm_manager.agent_queues:
                response = await asyncio.wait_for(
                    agent_comm_manager.agent_queues[session_id].get(), 
                    timeout=300  # 5 minute timeout
                )
                return response
        except asyncio.TimeoutError:
            self.logger.warning(f"Timeout waiting for user response in session {session_id}")
            
        return None
        
    async def _incorporate_user_response(self, task: Dict[str, Any], response: UserResponse) -> Dict[str, Any]:
        """Incorporate user response into task context"""
        # Parse response and update task
        try:
            response_data = json.loads(response.response)
            task.update(response_data)
        except json.JSONDecodeError:
            # If not JSON, treat as text response
            task['user_clarification'] = response.response
            
        return task
        
    async def ask_clarification(self, question: str, context: Dict[str, Any] = None) -> Optional[str]:
        """Ask user for clarification during task execution"""
        if not self.current_session_id:
            raise ValueError("No active session for clarification request")
            
        await agent_comm_manager.send_clarification_request(
            self.current_session_id, self.agent_id, question, context
        )
        
        # Wait for response
        response = await self._wait_for_user_response(self.current_session_id)
        return response.response if response else None
        
    async def send_status_update(self, status: str, progress: int = 0, details: str = ""):
        """Send status update to user"""
        if not self.current_session_id:
            return
            
        await agent_comm_manager.send_agent_status(
            self.current_session_id, self.agent_id, status, progress, details
        )
        
    async def send_response(self, response: str, metadata: Dict[str, Any] = None):
        """Send response to user"""
        if not self.current_session_id:
            return
            
        await agent_comm_manager.send_agent_response(
            self.current_session_id, self.agent_id, response, metadata
        )
        
    def get_required_task_fields(self) -> List[str]:
        """Get list of required fields for tasks"""
        return ['description']  # Override in subclasses
        
    @abstractmethod
    async def _execute_main_task(self, task: Dict[str, Any], session_id: str) -> Dict[str, Any]:
        """Execute the main task logic - must be implemented by subclasses"""
        pass
        
    def get_agent_info(self) -> Dict[str, Any]:
        """Get agent information"""
        return {
            'agent_id': self.agent_id,
            'name': self.name,
            'description': self.description,
            'capabilities': self.capabilities,
            'status': self.status.value,
            'context': self.context
        }
        
    def can_handle_task(self, task: Dict[str, Any]) -> bool:
        """Check if agent can handle the given task"""
        # Override in subclasses for specific task matching
        return True
        
    def estimate_task_complexity(self, task: Dict[str, Any]) -> TaskComplexity:
        """Estimate task complexity"""
        # Override in subclasses for specific complexity estimation
        return TaskComplexity.MODERATE
        
    def get_estimated_duration(self, task: Dict[str, Any]) -> int:
        """Get estimated task duration in minutes"""
        # Override in subclasses
        complexity = self.estimate_task_complexity(task)
        if complexity == TaskComplexity.SIMPLE:
            return 5
        elif complexity == TaskComplexity.MODERATE:
            return 15
        else:
            return 30
