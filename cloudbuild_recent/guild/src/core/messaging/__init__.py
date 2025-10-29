"""
Messaging Module

This module provides agent-to-agent messaging capabilities including:
- Event bus for pub/sub communication
- Standardized messaging protocol
- Message routing and delivery
"""

from .event_bus import (
    EventBus, Event, EventType, event_bus, 
    publish_event, subscribe_agent
)
from .agent_protocol import (
    AgentMessagingProtocol, AgentMessage, MessageType, MessagePriority,
    AgentIntegrationMixin, create_agent_messaging, send_agent_request, broadcast_notification
)

__all__ = [
    'EventBus', 'Event', 'EventType', 'event_bus',
    'publish_event', 'subscribe_agent',
    'AgentMessagingProtocol', 'AgentMessage', 'MessageType', 'MessagePriority',
    'AgentIntegrationMixin', 'create_agent_messaging', 'send_agent_request', 'broadcast_notification'
]
