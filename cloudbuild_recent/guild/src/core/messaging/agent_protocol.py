"""
Agent Messaging Protocol and Integration Layer

This module defines the standardized messaging protocol for agent-to-agent communication
and provides integration utilities for existing agents to use the enhanced orchestration system.
"""

import json
import asyncio
from typing import Dict, Any, List, Optional, Callable, Union
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from enum import Enum
import uuid
from guild.src.core.messaging.event_bus import EventBus, Event, EventType, publish_event, subscribe_agent
from guild.src.core.knowledge.knowledge_graph import (
    KnowledgeGraph, NodeType, RelationshipType, add_entity, link_entities, get_agent_context
)
from guild.src.core.orchestration.enhanced_orchestrator import (
    EnhancedOrchestrator, register_agent_capability, enhanced_orchestrator
)
from guild.src.utils.logging_utils import get_logger

logger = get_logger(__name__)

class MessageType(Enum):
    """Types of messages in the agent protocol"""
    REQUEST = "request"
    RESPONSE = "response"
    NOTIFICATION = "notification"
    QUERY = "query"
    COMMAND = "command"
    STATUS_UPDATE = "status_update"
    ERROR = "error"

class MessagePriority(Enum):
    """Message priority levels"""
    LOW = 0
    NORMAL = 1
    HIGH = 2
    URGENT = 3

@dataclass
class AgentMessage:
    """Standardized agent message format"""
    id: str
    type: MessageType
    from_agent: str
    to_agents: List[str]
    subject: str
    content: Dict[str, Any]
    priority: MessagePriority = MessagePriority.NORMAL
    timestamp: datetime = None
    correlation_id: Optional[str] = None
    reply_to: Optional[str] = None
    ttl: int = 3600  # Time to live in seconds
    requires_response: bool = False
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now(timezone.utc)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert message to dictionary"""
        return {
            "id": self.id,
            "type": self.type.value,
            "from_agent": self.from_agent,
            "to_agents": self.to_agents,
            "subject": self.subject,
            "content": self.content,
            "priority": self.priority.value,
            "timestamp": self.timestamp.isoformat(),
            "correlation_id": self.correlation_id,
            "reply_to": self.reply_to,
            "ttl": self.ttl,
            "requires_response": self.requires_response
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'AgentMessage':
        """Create message from dictionary"""
        data['type'] = MessageType(data['type'])
        data['priority'] = MessagePriority(data['priority'])
        data['timestamp'] = datetime.fromisoformat(data['timestamp'])
        return cls(**data)

class AgentMessagingProtocol:
    """
    Standardized messaging protocol for agent communication.
    
    Provides:
    - Message routing and delivery
    - Response handling and correlation
    - Message persistence and replay
    - Priority-based message handling
    - Message validation and security
    """
    
    def __init__(self, agent_name: str):
        self.agent_name = agent_name
        self.event_bus = None
        self.knowledge_graph = None
        self.message_handlers: Dict[MessageType, List[Callable]] = {}
        self.pending_responses: Dict[str, asyncio.Future] = {}
        self.message_history: List[AgentMessage] = []
        
    async def initialize(self):
        """Initialize the messaging protocol"""
        from guild.src.core.messaging.event_bus import event_bus
        from guild.src.core.knowledge.knowledge_graph import knowledge_graph
        
        self.event_bus = event_bus
        self.knowledge_graph = knowledge_graph
        
        # Register for agent-specific events
        await self.event_bus.subscribe(
            self.agent_name,
            [EventType.DATA_UPDATED, EventType.TASK_COMPLETED, EventType.QUALITY_CHECK_REQUESTED],
            self._handle_system_event
        )
        
        logger.info(f"Agent messaging protocol initialized for {self.agent_name}")
    
    async def send_message(self, 
                          message: AgentMessage,
                          wait_for_response: bool = False) -> Optional[AgentMessage]:
        """
        Send a message to other agents.
        
        Args:
            message: The message to send
            wait_for_response: Whether to wait for a response
            
        Returns:
            Response message if wait_for_response is True, None otherwise
        """
        if not self.event_bus:
            await self.initialize()
        
        # Store message in history
        self.message_history.append(message)
        
        # Convert to event and publish
        event_data = {
            "message": message.to_dict(),
            "protocol_version": "1.0"
        }
        
        event = Event(
            id=message.id,
            type=EventType.DATA_CREATED,
            source_agent=self.agent_name,
            target_agents=message.to_agents,
            data=event_data,
            priority=message.priority.value,
            correlation_id=message.correlation_id
        )
        
        await self.event_bus.publish(event)
        
        # Wait for response if requested
        if wait_for_response and message.requires_response:
            return await self._wait_for_response(message.id)
        
        return None
    
    async def send_request(self, 
                          to_agents: List[str],
                          subject: str,
                          content: Dict[str, Any],
                          priority: MessagePriority = MessagePriority.NORMAL,
                          timeout: int = 30) -> Optional[AgentMessage]:
        """Send a request and wait for response"""
        message = AgentMessage(
            id=str(uuid.uuid4()),
            type=MessageType.REQUEST,
            from_agent=self.agent_name,
            to_agents=to_agents,
            subject=subject,
            content=content,
            priority=priority,
            requires_response=True
        )
        
        return await self.send_message(message, wait_for_response=True)
    
    async def send_notification(self, 
                               to_agents: List[str],
                               subject: str,
                               content: Dict[str, Any],
                               priority: MessagePriority = MessagePriority.NORMAL):
        """Send a notification without expecting a response"""
        message = AgentMessage(
            id=str(uuid.uuid4()),
            type=MessageType.NOTIFICATION,
            from_agent=self.agent_name,
            to_agents=to_agents,
            subject=subject,
            content=content,
            priority=priority,
            requires_response=False
        )
        
        await self.send_message(message)
    
    async def send_response(self, 
                           to_agents: List[str],
                           subject: str,
                           content: Dict[str, Any],
                           correlation_id: str,
                           priority: MessagePriority = MessagePriority.NORMAL):
        """Send a response to a previous message"""
        message = AgentMessage(
            id=str(uuid.uuid4()),
            type=MessageType.RESPONSE,
            from_agent=self.agent_name,
            to_agents=to_agents,
            subject=subject,
            content=content,
            priority=priority,
            correlation_id=correlation_id,
            requires_response=False
        )
        
        await self.send_message(message)
    
    async def query_agents(self, 
                          query: str,
                          target_agents: Optional[List[str]] = None,
                          timeout: int = 30) -> List[AgentMessage]:
        """Send a query to multiple agents and collect responses"""
        message = AgentMessage(
            id=str(uuid.uuid4()),
            type=MessageType.QUERY,
            from_agent=self.agent_name,
            to_agents=target_agents or ["broadcast"],
            subject="Query Request",
            content={"query": query},
            priority=MessagePriority.NORMAL,
            requires_response=True
        )
        
        # Send query
        await self.send_message(message)
        
        # Collect responses
        responses = []
        start_time = datetime.now(timezone.utc)
        
        while (datetime.now(timezone.utc) - start_time).total_seconds() < timeout:
            # Check for responses
            for msg in self.message_history:
                if (msg.correlation_id == message.id and 
                    msg.type == MessageType.RESPONSE):
                    responses.append(msg)
            
            if responses:
                break
            
            await asyncio.sleep(0.1)
        
        return responses
    
    def register_message_handler(self, message_type: MessageType, handler: Callable[[AgentMessage], None]):
        """Register a handler for specific message types"""
        if message_type not in self.message_handlers:
            self.message_handlers[message_type] = []
        self.message_handlers[message_type].append(handler)
    
    async def _handle_system_event(self, event: Event):
        """Handle system events and convert to messages"""
        if "message" in event.data:
            try:
                message_data = event.data["message"]
                message = AgentMessage.from_dict(message_data)
                
                # Check if message is for this agent
                if (self.agent_name in message.to_agents or 
                    "broadcast" in message.to_agents or
                    message.to_agents == []):
                    
                    await self._process_incoming_message(message)
                    
            except Exception as e:
                logger.error(f"Error processing system event: {e}")
    
    async def _process_incoming_message(self, message: AgentMessage):
        """Process an incoming message"""
        logger.info(f"Processing message {message.id} from {message.from_agent}: {message.subject}")
        
        # Store message in history
        self.message_history.append(message)
        
        # Handle by message type
        if message.type in self.message_handlers:
            for handler in self.message_handlers[message.type]:
                try:
                    if asyncio.iscoroutinefunction(handler):
                        await handler(message)
                    else:
                        handler(message)
                except Exception as e:
                    logger.error(f"Error in message handler: {e}")
        
        # Auto-respond to requests if no handler registered
        if message.type == MessageType.REQUEST and message.requires_response:
            await self._send_auto_response(message)
    
    async def _send_auto_response(self, message: AgentMessage):
        """Send automatic response to requests"""
        response_content = {
            "status": "received",
            "agent": self.agent_name,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "message": "Request received and being processed"
        }
        
        await self.send_response(
            to_agents=[message.from_agent],
            subject=f"Response to: {message.subject}",
            content=response_content,
            correlation_id=message.id
        )
    
    async def _wait_for_response(self, message_id: str, timeout: int = 30) -> Optional[AgentMessage]:
        """Wait for a response to a message"""
        # Create future for response
        future = asyncio.Future()
        self.pending_responses[message_id] = future
        
        try:
            # Wait for response
            response = await asyncio.wait_for(future, timeout=timeout)
            return response
        except asyncio.TimeoutError:
            logger.warning(f"Timeout waiting for response to message {message_id}")
            return None
        finally:
            # Clean up
            if message_id in self.pending_responses:
                del self.pending_responses[message_id]
    
    async def get_agent_status(self) -> Dict[str, Any]:
        """Get current agent status"""
        return {
            "agent_name": self.agent_name,
            "message_count": len(self.message_history),
            "pending_responses": len(self.pending_responses),
            "registered_handlers": {
                msg_type.value: len(handlers) 
                for msg_type, handlers in self.message_handlers.items()
            },
            "last_activity": self.message_history[-1].timestamp.isoformat() if self.message_history else None
        }

class AgentIntegrationMixin:
    """
    Mixin class to integrate existing agents with the enhanced orchestration system.
    
    This mixin provides methods that agents can inherit to easily integrate with
    the event bus, knowledge graph, and enhanced orchestration.
    """
    
    def __init__(self, agent_name: str):
        self.agent_name = agent_name
        self.messaging_protocol: Optional[AgentMessagingProtocol] = None
        self.knowledge_context: Dict[str, Any] = {}
        self.registered_capabilities: List[str] = []
        
    async def initialize_messaging(self):
        """Initialize messaging protocol for the agent"""
        self.messaging_protocol = AgentMessagingProtocol(self.agent_name)
        await self.messaging_protocol.initialize()
        
        # Register default message handlers
        self.messaging_protocol.register_message_handler(
            MessageType.REQUEST, self._handle_request
        )
        self.messaging_protocol.register_message_handler(
            MessageType.QUERY, self._handle_query
        )
        self.messaging_protocol.register_message_handler(
            MessageType.COMMAND, self._handle_command
        )
        
        logger.info(f"Messaging initialized for agent {self.agent_name}")
    
    async def register_with_orchestrator(self, 
                                       capabilities: List[str],
                                       max_concurrent_tasks: int = 1,
                                       priority: int = 0,
                                       specializations: List[str] = None,
                                       dependencies: List[str] = None):
        """Register agent capabilities with the orchestrator"""
        await register_agent_capability(
            self.agent_name,
            capabilities,
            max_concurrent_tasks,
            priority,
            specializations,
            dependencies
        )
        
        self.registered_capabilities = capabilities
        
        # Add agent to knowledge graph
        await add_entity(
            NodeType.AGENT,
            self.agent_name,
            {
                "capabilities": capabilities,
                "max_concurrent_tasks": max_concurrent_tasks,
                "priority": priority,
                "specializations": specializations or [],
                "dependencies": dependencies or [],
                "status": "active"
            },
            self.agent_name
        )
        
        logger.info(f"Agent {self.agent_name} registered with orchestrator")
    
    async def update_knowledge_context(self, context: Dict[str, Any]):
        """Update the agent's knowledge context"""
        self.knowledge_context.update(context)
        
        # Store in knowledge graph
        if self.messaging_protocol and self.messaging_protocol.knowledge_graph:
            await self.messaging_protocol.knowledge_graph.set_agent_context(
                self.agent_name, context
            )
    
    async def get_shared_knowledge(self, 
                                 entity_types: List[NodeType] = None,
                                 filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Get shared knowledge from the knowledge graph"""
        if not self.messaging_protocol or not self.messaging_protocol.knowledge_graph:
            return []
        
        entities = await self.messaging_protocol.knowledge_graph.query_nodes(
            entity_types[0] if entity_types else None,
            filters
        )
        
        return [entity.to_dict() for entity in entities]
    
    async def share_knowledge(self, 
                            entity_type: NodeType,
                            name: str,
                            properties: Dict[str, Any],
                            relationships: List[Dict[str, Any]] = None):
        """Share knowledge with other agents"""
        if not self.messaging_protocol or not self.messaging_protocol.knowledge_graph:
            return
        
        # Add entity
        entity_id = await self.messaging_protocol.knowledge_graph.add_node(
            entity_type, name, properties, self.agent_name
        )
        
        # Add relationships
        if relationships:
            for rel in relationships:
                await self.messaging_protocol.knowledge_graph.add_edge(
                    entity_id,
                    rel["target_id"],
                    RelationshipType(rel["relationship"]),
                    rel.get("properties", {}),
                    self.agent_name
                )
        
        # Notify other agents
        await self.messaging_protocol.send_notification(
            to_agents=["broadcast"],
            subject="Knowledge Shared",
            content={
                "entity_type": entity_type.value,
                "entity_name": name,
                "entity_id": entity_id,
                "shared_by": self.agent_name
            }
        )
    
    async def request_help(self, 
                          help_type: str,
                          description: str,
                          target_agents: Optional[List[str]] = None) -> List[AgentMessage]:
        """Request help from other agents"""
        if not self.messaging_protocol:
            return []
        
        return await self.messaging_protocol.query_agents(
            f"Help needed: {help_type} - {description}",
            target_agents
        )
    
    async def notify_completion(self, 
                              task_id: str,
                              result: Dict[str, Any],
                              workflow_id: Optional[str] = None):
        """Notify system of task completion"""
        if not self.messaging_protocol:
            return
        
        # Publish completion event
        await publish_event(
            EventType.TASK_COMPLETED,
            self.agent_name,
            {
                "task_id": task_id,
                "workflow_id": workflow_id,
                "result": result,
                "agent": self.agent_name
            }
        )
        
        # Update knowledge graph
        await self.share_knowledge(
            NodeType.TASK,
            f"Completed Task {task_id}",
            {
                "task_id": task_id,
                "status": "completed",
                "result": result,
                "completed_by": self.agent_name,
                "completion_time": datetime.now(timezone.utc).isoformat()
            }
        )
    
    async def notify_error(self, 
                          task_id: str,
                          error: str,
                          workflow_id: Optional[str] = None):
        """Notify system of task error"""
        if not self.messaging_protocol:
            return
        
        # Publish error event
        await publish_event(
            EventType.TASK_FAILED,
            self.agent_name,
            {
                "task_id": task_id,
                "workflow_id": workflow_id,
                "error": error,
                "agent": self.agent_name
            }
        )
        
        # Update knowledge graph
        await self.share_knowledge(
            NodeType.TASK,
            f"Failed Task {task_id}",
            {
                "task_id": task_id,
                "status": "failed",
                "error": error,
                "failed_by": self.agent_name,
                "failure_time": datetime.now(timezone.utc).isoformat()
            }
        )
    
    async def _handle_request(self, message: AgentMessage):
        """Default handler for requests"""
        logger.info(f"Agent {self.agent_name} received request: {message.subject}")
        
        # Override in subclass for specific handling
        await self.messaging_protocol.send_response(
            to_agents=[message.from_agent],
            subject=f"Response to: {message.subject}",
            content={"status": "processed", "agent": self.agent_name},
            correlation_id=message.id
        )
    
    async def _handle_query(self, message: AgentMessage):
        """Default handler for queries"""
        logger.info(f"Agent {self.agent_name} received query: {message.subject}")
        
        # Override in subclass for specific handling
        await self.messaging_protocol.send_response(
            to_agents=[message.from_agent],
            subject=f"Response to: {message.subject}",
            content={"status": "query_processed", "agent": self.agent_name},
            correlation_id=message.id
        )
    
    async def _handle_command(self, message: AgentMessage):
        """Default handler for commands"""
        logger.info(f"Agent {self.agent_name} received command: {message.subject}")
        
        # Override in subclass for specific handling
        await self.messaging_protocol.send_response(
            to_agents=[message.from_agent],
            subject=f"Response to: {message.subject}",
            content={"status": "command_executed", "agent": self.agent_name},
            correlation_id=message.id
        )

# Convenience functions for agent integration
async def create_agent_messaging(agent_name: str) -> AgentMessagingProtocol:
    """Create a messaging protocol instance for an agent"""
    protocol = AgentMessagingProtocol(agent_name)
    await protocol.initialize()
    return protocol

async def send_agent_request(from_agent: str,
                           to_agents: List[str],
                           subject: str,
                           content: Dict[str, Any]) -> Optional[AgentMessage]:
    """Send a request between agents"""
    protocol = AgentMessagingProtocol(from_agent)
    await protocol.initialize()
    
    return await protocol.send_request(to_agents, subject, content)

async def broadcast_notification(from_agent: str,
                               subject: str,
                               content: Dict[str, Any]):
    """Broadcast a notification to all agents"""
    protocol = AgentMessagingProtocol(from_agent)
    await protocol.initialize()
    
    await protocol.send_notification(["broadcast"], subject, content)
