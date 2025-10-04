"""
Inter-Agent Communication System for Guild-AI
Provides real-time communication channels between agents for seamless coordination.
"""

import asyncio
import json
import logging
from typing import Dict, List, Any, Optional, Callable
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from enum import Enum
import threading
from collections import defaultdict, deque
import uuid

class MessageType(Enum):
    """Types of messages between agents"""
    DATA_SYNC = "data_sync"
    COORDINATION = "coordination"
    WORKFLOW_TRIGGER = "workflow_trigger"
    STATUS_UPDATE = "status_update"
    ERROR_NOTIFICATION = "error_notification"
    APPROVAL_REQUEST = "approval_request"
    INSIGHT_SHARE = "insight_share"
    PERFORMANCE_UPDATE = "performance_update"

class MessagePriority(Enum):
    """Message priority levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

@dataclass
class InterAgentMessage:
    """Standard message format for inter-agent communication"""
    message_id: str
    sender_agent: str
    recipient_agent: str
    message_type: MessageType
    priority: MessagePriority
    payload: Dict[str, Any]
    timestamp: datetime
    correlation_id: Optional[str] = None
    requires_response: bool = False
    response_timeout: int = 300  # seconds
    metadata: Dict[str, Any] = None

    def to_dict(self) -> Dict[str, Any]:
        """Convert message to dictionary for serialization"""
        data = asdict(self)
        data['message_type'] = self.message_type.value
        data['priority'] = self.priority.value
        data['timestamp'] = self.timestamp.isoformat()
        return data

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'InterAgentMessage':
        """Create message from dictionary"""
        data['message_type'] = MessageType(data['message_type'])
        data['priority'] = MessagePriority(data['priority'])
        data['timestamp'] = datetime.fromisoformat(data['timestamp'])
        return cls(**data)

@dataclass
class AgentCapability:
    """Agent capability definition for communication routing"""
    agent_name: str
    capabilities: List[str]
    endpoints: List[str]
    status: str = "active"
    last_heartbeat: datetime = None

class InterAgentCommunicationHub:
    """
    Central communication hub for inter-agent coordination.
    Handles message routing, queuing, and delivery between agents.
    """
    
    def __init__(self):
        self.agents: Dict[str, AgentCapability] = {}
        self.message_queues: Dict[str, deque] = defaultdict(deque)
        self.message_handlers: Dict[str, Dict[MessageType, List[Callable]]] = defaultdict(lambda: defaultdict(list))
        self.pending_responses: Dict[str, asyncio.Future] = {}
        self.message_history: deque = deque(maxlen=10000)
        self.running = False
        self._lock = threading.Lock()
        
        # Performance metrics
        self.metrics = {
            "messages_sent": 0,
            "messages_delivered": 0,
            "messages_failed": 0,
            "average_delivery_time": 0.0,
            "active_agents": 0
        }
    
    async def start(self):
        """Start the communication hub"""
        self.running = True
        logging.info("Inter-Agent Communication Hub started")
        
        # Start background tasks
        asyncio.create_task(self._process_message_queues())
        asyncio.create_task(self._cleanup_expired_responses())
        asyncio.create_task(self._monitor_agent_health())
    
    async def stop(self):
        """Stop the communication hub"""
        self.running = False
        logging.info("Inter-Agent Communication Hub stopped")
    
    def register_agent(self, agent_name: str, capabilities: List[str], endpoints: List[str] = None) -> bool:
        """Register an agent with the communication hub"""
        try:
            with self._lock:
                self.agents[agent_name] = AgentCapability(
                    agent_name=agent_name,
                    capabilities=capabilities,
                    endpoints=endpoints or [],
                    status="active",
                    last_heartbeat=datetime.now()
                )
                
                if agent_name not in self.message_queues:
                    self.message_queues[agent_name] = deque(maxlen=1000)
                
                self.metrics["active_agents"] = len(self.agents)
                logging.info(f"Agent {agent_name} registered with capabilities: {capabilities}")
                return True
                
        except Exception as e:
            logging.error(f"Failed to register agent {agent_name}: {e}")
            return False
    
    def unregister_agent(self, agent_name: str) -> bool:
        """Unregister an agent from the communication hub"""
        try:
            with self._lock:
                if agent_name in self.agents:
                    del self.agents[agent_name]
                    if agent_name in self.message_queues:
                        del self.message_queues[agent_name]
                    if agent_name in self.message_handlers:
                        del self.message_handlers[agent_name]
                    
                    self.metrics["active_agents"] = len(self.agents)
                    logging.info(f"Agent {agent_name} unregistered")
                    return True
                return False
                
        except Exception as e:
            logging.error(f"Failed to unregister agent {agent_name}: {e}")
            return False
    
    def register_message_handler(self, agent_name: str, message_type: MessageType, handler: Callable):
        """Register a message handler for an agent"""
        self.message_handlers[agent_name][message_type].append(handler)
        logging.info(f"Message handler registered for {agent_name} - {message_type.value}")
    
    async def send_message(self, message: InterAgentMessage) -> bool:
        """Send a message to another agent"""
        try:
            start_time = datetime.now()
            
            # Validate message
            if not self._validate_message(message):
                return False
            
            # Add to message history
            self.message_history.append(message)
            self.metrics["messages_sent"] += 1
            
            # Check if recipient is registered
            if message.recipient_agent not in self.agents:
                logging.warning(f"Recipient agent {message.recipient_agent} not registered")
                self.metrics["messages_failed"] += 1
                return False
            
            # Add to recipient's queue
            with self._lock:
                self.message_queues[message.recipient_agent].append(message)
            
            # If requires response, set up response tracking
            if message.requires_response:
                response_future = asyncio.Future()
                self.pending_responses[message.message_id] = response_future
            
            # Calculate delivery time
            delivery_time = (datetime.now() - start_time).total_seconds()
            self.metrics["average_delivery_time"] = (
                (self.metrics["average_delivery_time"] * (self.metrics["messages_delivered"] - 1) + delivery_time) /
                self.metrics["messages_delivered"]
            )
            
            self.metrics["messages_delivered"] += 1
            logging.info(f"Message {message.message_id} sent to {message.recipient_agent}")
            return True
            
        except Exception as e:
            logging.error(f"Failed to send message: {e}")
            self.metrics["messages_failed"] += 1
            return False
    
    async def send_response(self, original_message_id: str, response_payload: Dict[str, Any]) -> bool:
        """Send a response to a message that requires one"""
        try:
            if original_message_id in self.pending_responses:
                future = self.pending_responses[original_message_id]
                if not future.done():
                    future.set_result(response_payload)
                    del self.pending_responses[original_message_id]
                    return True
            return False
            
        except Exception as e:
            logging.error(f"Failed to send response: {e}")
            return False
    
    async def _process_message_queues(self):
        """Background task to process message queues"""
        while self.running:
            try:
                for agent_name, queue in self.message_queues.items():
                    if queue and agent_name in self.agents:
                        # Process messages in priority order
                        priority_order = [MessagePriority.CRITICAL, MessagePriority.HIGH, 
                                        MessagePriority.MEDIUM, MessagePriority.LOW]
                        
                        for priority in priority_order:
                            for message in list(queue):
                                if message.priority == priority:
                                    queue.remove(message)
                                    await self._deliver_message(message)
                
                await asyncio.sleep(0.1)  # Small delay to prevent busy waiting
                
            except Exception as e:
                logging.error(f"Error processing message queues: {e}")
                await asyncio.sleep(1)
    
    async def _deliver_message(self, message: InterAgentMessage):
        """Deliver a message to its handlers"""
        try:
            agent_name = message.recipient_agent
            
            if agent_name in self.message_handlers and message.message_type in self.message_handlers[agent_name]:
                handlers = self.message_handlers[agent_name][message.message_type]
                
                for handler in handlers:
                    try:
                        await handler(message)
                    except Exception as e:
                        logging.error(f"Handler error for {agent_name}: {e}")
            
            # Update agent heartbeat
            if agent_name in self.agents:
                self.agents[agent_name].last_heartbeat = datetime.now()
                
        except Exception as e:
            logging.error(f"Failed to deliver message {message.message_id}: {e}")
    
    def _validate_message(self, message: InterAgentMessage) -> bool:
        """Validate message format and content"""
        if not message.message_id or not message.sender_agent or not message.recipient_agent:
            return False
        if message.sender_agent not in self.agents:
            return False
        return True
    
    async def _cleanup_expired_responses(self):
        """Clean up expired response futures"""
        while self.running:
            try:
                current_time = datetime.now()
                expired_messages = []
                
                for message_id, future in self.pending_responses.items():
                    if future.done() or (current_time - future.get_loop().time()).total_seconds() > 300:
                        expired_messages.append(message_id)
                
                for message_id in expired_messages:
                    del self.pending_responses[message_id]
                
                await asyncio.sleep(60)  # Check every minute
                
            except Exception as e:
                logging.error(f"Error cleaning up expired responses: {e}")
                await asyncio.sleep(60)
    
    async def _monitor_agent_health(self):
        """Monitor agent health and remove inactive agents"""
        while self.running:
            try:
                current_time = datetime.now()
                inactive_agents = []
                
                for agent_name, agent in self.agents.items():
                    if agent.last_heartbeat and (current_time - agent.last_heartbeat).total_seconds() > 300:  # 5 minutes
                        inactive_agents.append(agent_name)
                
                for agent_name in inactive_agents:
                    logging.warning(f"Agent {agent_name} appears inactive, removing from registry")
                    self.unregister_agent(agent_name)
                
                await asyncio.sleep(120)  # Check every 2 minutes
                
            except Exception as e:
                logging.error(f"Error monitoring agent health: {e}")
                await asyncio.sleep(120)
    
    def get_agent_status(self, agent_name: str) -> Optional[Dict[str, Any]]:
        """Get status of a specific agent"""
        if agent_name in self.agents:
            agent = self.agents[agent_name]
            return {
                "name": agent.agent_name,
                "status": agent.status,
                "capabilities": agent.capabilities,
                "endpoints": agent.endpoints,
                "last_heartbeat": agent.last_heartbeat.isoformat() if agent.last_heartbeat else None,
                "queue_size": len(self.message_queues.get(agent_name, deque()))
            }
        return None
    
    def get_communication_metrics(self) -> Dict[str, Any]:
        """Get communication hub metrics"""
        return {
            **self.metrics,
            "registered_agents": list(self.agents.keys()),
            "message_history_size": len(self.message_history),
            "pending_responses": len(self.pending_responses)
        }

class AgentCommunicationClient:
    """
    Client for agents to interact with the communication hub.
    Provides simplified interface for common communication patterns.
    """
    
    def __init__(self, agent_name: str, communication_hub: InterAgentCommunicationHub):
        self.agent_name = agent_name
        self.hub = communication_hub
        self.message_handlers = {}
    
    async def initialize(self, capabilities: List[str], endpoints: List[str] = None):
        """Initialize the communication client"""
        success = self.hub.register_agent(self.agent_name, capabilities, endpoints)
        if success:
            logging.info(f"Communication client initialized for {self.agent_name}")
        return success
    
    async def send_data_sync(self, recipient: str, data: Dict[str, Any], priority: MessagePriority = MessagePriority.MEDIUM) -> bool:
        """Send data synchronization message"""
        message = InterAgentMessage(
            message_id=str(uuid.uuid4()),
            sender_agent=self.agent_name,
            recipient_agent=recipient,
            message_type=MessageType.DATA_SYNC,
            priority=priority,
            payload=data,
            timestamp=datetime.now()
        )
        return await self.hub.send_message(message)
    
    async def send_coordination_request(self, recipient: str, coordination_data: Dict[str, Any], 
                                      requires_response: bool = True) -> Optional[Dict[str, Any]]:
        """Send coordination request and optionally wait for response"""
        message = InterAgentMessage(
            message_id=str(uuid.uuid4()),
            sender_agent=self.agent_name,
            recipient_agent=recipient,
            message_type=MessageType.COORDINATION,
            priority=MessagePriority.HIGH,
            payload=coordination_data,
            timestamp=datetime.now(),
            requires_response=requires_response
        )
        
        success = await self.hub.send_message(message)
        if success and requires_response:
            # Wait for response
            if message.message_id in self.hub.pending_responses:
                response = await self.hub.pending_responses[message.message_id]
                return response
        
        return None
    
    async def send_insight_share(self, recipient: str, insights: Dict[str, Any]) -> bool:
        """Share insights with another agent"""
        message = InterAgentMessage(
            message_id=str(uuid.uuid4()),
            sender_agent=self.agent_name,
            recipient_agent=recipient,
            message_type=MessageType.INSIGHT_SHARE,
            priority=MessagePriority.MEDIUM,
            payload=insights,
            timestamp=datetime.now()
        )
        return await self.hub.send_message(message)
    
    def register_handler(self, message_type: MessageType, handler: Callable):
        """Register a message handler"""
        self.hub.register_message_handler(self.agent_name, message_type, handler)
        self.message_handlers[message_type] = handler
        logging.info(f"Handler registered for {self.agent_name} - {message_type.value}")
    
    async def send_heartbeat(self):
        """Send heartbeat to maintain agent registration"""
        if self.agent_name in self.hub.agents:
            self.hub.agents[self.agent_name].last_heartbeat = datetime.now()
    
    def get_communication_status(self) -> Dict[str, Any]:
        """Get communication status for this agent"""
        return self.hub.get_agent_status(self.agent_name)

# Global communication hub instance
communication_hub = InterAgentCommunicationHub()

# Convenience functions for global access
async def initialize_communication_hub():
    """Initialize the global communication hub"""
    await communication_hub.start()

async def shutdown_communication_hub():
    """Shutdown the global communication hub"""
    await communication_hub.stop()

def get_communication_hub() -> InterAgentCommunicationHub:
    """Get the global communication hub instance"""
    return communication_hub

def create_agent_client(agent_name: str) -> AgentCommunicationClient:
    """Create a communication client for an agent"""
    return AgentCommunicationClient(agent_name, communication_hub)
