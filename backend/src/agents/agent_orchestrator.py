"""
Agent Orchestrator
Manages all agents and coordinates task execution
"""

import asyncio
import json
import uuid
from typing import Dict, List, Optional, Any, Type
from datetime import datetime
import logging

from .base_agent import BaseAgent, AgentStatus, TaskComplexity
from ..websocket.agent_communication import agent_comm_manager

logger = logging.getLogger(__name__)

class AgentOrchestrator:
    """Orchestrates agent execution and communication"""
    
    def __init__(self):
        self.agents: Dict[str, BaseAgent] = {}
        self.active_sessions: Dict[str, Dict[str, Any]] = {}
        self.task_queue: asyncio.Queue = asyncio.Queue()
        self.worker_tasks: List[asyncio.Task] = []
        self.logger = logging.getLogger("agent_orchestrator")
        self._initialize_all_agents()

    def _initialize_all_agents(self):
        """Initialize all 104+ agents using the factory"""
        try:
            from .agent_factory import agent_factory
            print("🚀 Initializing all agents with orchestrator...")
            
            # Load all agents from registry
            for agent_metadata in agent_factory.agent_registry:
                agent_id = agent_metadata['agent_id']
                agent = agent_factory.create_agent(agent_id)
                if agent:
                    self.agents[agent_id] = agent
                    print(f"✅ Initialized {agent.name} ({agent_id})")
            
            print(f"🎉 Successfully initialized {len(self.agents)} agents")
        except Exception as e:
            print(f"Error initializing agents: {e}")
            # Fallback to basic agents
            self._initialize_basic_agents()

    def _initialize_basic_agents(self):
        """Initialize basic agents as fallback"""
        from .content_creation_agent import ContentCreationAgent
        basic_agent = ContentCreationAgent(agent_comm_manager)
        self.agents[basic_agent.agent_id] = basic_agent
        print("✅ Initialized basic agent as fallback")
        
    def register_agent(self, agent: BaseAgent):
        """Register an agent with the orchestrator"""
        self.agents[agent.agent_id] = agent
        self.logger.info(f"Registered agent: {agent.name} ({agent.agent_id})")
        
    def unregister_agent(self, agent_id: str):
        """Unregister an agent"""
        if agent_id in self.agents:
            del self.agents[agent_id]
            self.logger.info(f"Unregistered agent: {agent_id}")
            
    async def execute_task(self, task: Dict[str, Any], user_id: str, preferred_agent_id: str = None) -> str:
        """Execute a task using the most appropriate agent"""
        try:
            # Select the best agent for the task
            selected_agent = await self._select_agent(task, preferred_agent_id)
            
            if not selected_agent:
                raise ValueError("No suitable agent found for this task")
                
            # Create agent session
            session_id = await agent_comm_manager.create_agent_session(
                user_id, selected_agent.agent_id, task.get('context', {})
            )
            
            # Store session info
            self.active_sessions[session_id] = {
                'user_id': user_id,
                'agent_id': selected_agent.agent_id,
                'task': task,
                'started_at': datetime.now(),
                'status': 'active'
            }
            
            # Execute task
            result = await selected_agent.execute_task(task, session_id, user_id)
            
            # Update session status
            self.active_sessions[session_id]['status'] = 'completed'
            self.active_sessions[session_id]['result'] = result
            self.active_sessions[session_id]['completed_at'] = datetime.now()
            
            return session_id
            
        except Exception as e:
            self.logger.error(f"Task execution failed: {e}")
            raise
            
    async def _select_agent(self, task: Dict[str, Any], preferred_agent_id: str = None) -> Optional[BaseAgent]:
        """Select the best agent for a task"""
        # If preferred agent is specified and available, use it
        if preferred_agent_id and preferred_agent_id in self.agents:
            agent = self.agents[preferred_agent_id]
            if agent.can_handle_task(task) and agent.status == AgentStatus.IDLE:
                return agent
                
        # Find the best available agent
        suitable_agents = []
        for agent in self.agents.values():
            if agent.can_handle_task(task) and agent.status == AgentStatus.IDLE:
                complexity_score = self._calculate_complexity_score(agent, task)
                suitable_agents.append((agent, complexity_score))
                
        if not suitable_agents:
            return None
            
        # Sort by complexity score (lower is better for simple tasks)
        suitable_agents.sort(key=lambda x: x[1])
        return suitable_agents[0][0]
        
    def _calculate_complexity_score(self, agent: BaseAgent, task: Dict[str, Any]) -> float:
        """Calculate complexity score for agent selection"""
        estimated_complexity = agent.estimate_task_complexity(task)
        estimated_duration = agent.get_estimated_duration(task)
        
        # Combine complexity and duration into a score
        complexity_weights = {
            TaskComplexity.SIMPLE: 1.0,
            TaskComplexity.MODERATE: 2.0,
            TaskComplexity.COMPLEX: 3.0
        }
        
        complexity_score = complexity_weights.get(estimated_complexity, 2.0)
        duration_score = estimated_duration / 30.0  # Normalize to 30 minutes
        
        return complexity_score + duration_score
        
    async def delegate_to_agent(self, agent_id: str, task: Dict[str, Any], user_id: str) -> str:
        """Directly delegate a task to a specific agent"""
        if agent_id not in self.agents:
            raise ValueError(f"Agent {agent_id} not found")
            
        agent = self.agents[agent_id]
        if agent.status != AgentStatus.IDLE:
            raise ValueError(f"Agent {agent_id} is busy")
            
        return await self.execute_task(task, user_id, agent_id)
        
    async def get_agent_status(self, agent_id: str) -> Dict[str, Any]:
        """Get status of a specific agent"""
        if agent_id not in self.agents:
            return {"error": "Agent not found"}
            
        agent = self.agents[agent_id]
        return {
            'agent_id': agent_id,
            'status': agent.status.value,
            'current_session': agent.current_session_id,
            'capabilities': agent.capabilities,
            'context': agent.context
        }
        
    async def get_all_agents_status(self) -> Dict[str, Any]:
        """Get status of all agents"""
        agents_status = {}
        for agent_id, agent in self.agents.items():
            agents_status[agent_id] = {
                'name': agent.name,
                'status': agent.status.value,
                'current_session': agent.current_session_id,
                'capabilities': agent.capabilities
            }
        return agents_status
        
    async def cancel_task(self, session_id: str) -> bool:
        """Cancel an active task"""
        if session_id not in self.active_sessions:
            return False
            
        session = self.active_sessions[session_id]
        agent_id = session['agent_id']
        
        if agent_id in self.agents:
            agent = self.agents[agent_id]
            if agent.current_session_id == session_id:
                # Send cancellation message
                await agent_comm_manager.send_agent_status(
                    session_id, agent_id, "cancelled", 0, "Task cancelled by user"
                )
                
                # Update session status
                self.active_sessions[session_id]['status'] = 'cancelled'
                self.active_sessions[session_id]['cancelled_at'] = datetime.now()
                
                return True
                
        return False
        
    async def get_session_info(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get information about a session"""
        return self.active_sessions.get(session_id)
        
    async def get_user_sessions(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all sessions for a user"""
        user_sessions = []
        for session_id, session in self.active_sessions.items():
            if session['user_id'] == user_id:
                user_sessions.append({
                    'session_id': session_id,
                    'agent_id': session['agent_id'],
                    'task': session['task'],
                    'status': session['status'],
                    'started_at': session['started_at'],
                    'completed_at': session.get('completed_at'),
                    'cancelled_at': session.get('cancelled_at')
                })
        return user_sessions
        
    async def start_worker(self):
        """Start the orchestrator worker"""
        self.logger.info("Starting agent orchestrator worker")
        # Add any background tasks here
        
    async def stop_worker(self):
        """Stop the orchestrator worker"""
        self.logger.info("Stopping agent orchestrator worker")
        # Cancel all worker tasks
        for task in self.worker_tasks:
            task.cancel()
        self.worker_tasks.clear()
        
    def get_available_agents(self) -> List[Dict[str, Any]]:
        """Get list of available agents"""
        available_agents = []
        for agent in self.agents.values():
            if agent.status == AgentStatus.IDLE:
                available_agents.append({
                    'agent_id': agent.agent_id,
                    'name': agent.name,
                    'description': agent.description,
                    'capabilities': agent.capabilities
                })
        return available_agents
        
    def get_agent_capabilities(self) -> Dict[str, List[str]]:
        """Get capabilities of all agents"""
        capabilities = {}
        for agent in self.agents.values():
            capabilities[agent.agent_id] = {
                'name': agent.name,
                'capabilities': agent.capabilities
            }
        return capabilities

# Global orchestrator instance
agent_orchestrator = AgentOrchestrator()
