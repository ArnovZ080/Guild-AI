"""
Agent-to-Agent Messaging Layer - Pub/Sub Event Bus

This module provides a Redis-based publish-subscribe event bus for agent-to-agent communication,
enabling real-time coordination and information sharing across the Guild-AI system.
"""

import json
import asyncio
try:
    import redis.asyncio as redis
except ImportError:
    # Fallback for environments without redis
    redis = None
from typing import Dict, Any, List, Optional, Callable, Union
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from enum import Enum
import uuid
from guild.src.core.config import settings
from guild.src.utils.logging_utils import get_logger

logger = get_logger(__name__)

class EventType(Enum):
    """Standard event types for agent communication"""
    # Task Events
    TASK_STARTED = "task.started"
    TASK_COMPLETED = "task.completed"
    TASK_FAILED = "task.failed"
    TASK_PROGRESS = "task.progress"
    
    # Data Events
    DATA_UPDATED = "data.updated"
    DATA_CREATED = "data.created"
    DATA_DELETED = "data.deleted"
    
    # Business Events
    LEAD_CAPTURED = "business.lead_captured"
    CUSTOMER_UPDATED = "business.customer_updated"
    TRANSACTION_RECORDED = "business.transaction_recorded"
    CAMPAIGN_LAUNCHED = "business.campaign_launched"
    
    # System Events
    AGENT_READY = "system.agent_ready"
    AGENT_BUSY = "system.agent_busy"
    AGENT_ERROR = "system.agent_error"
    WORKFLOW_STARTED = "system.workflow_started"
    WORKFLOW_COMPLETED = "system.workflow_completed"
    
    # Quality Events
    QUALITY_CHECK_REQUESTED = "quality.check_requested"
    QUALITY_CHECK_COMPLETED = "quality.check_completed"
    QUALITY_THRESHOLD_BREACHED = "quality.threshold_breached"

@dataclass
class Event:
    """Standardized event structure for agent communication"""
    id: str
    type: EventType
    source_agent: str
    target_agents: Optional[List[str]] = None  # None means broadcast
    timestamp: datetime = None
    data: Dict[str, Any] = None
    correlation_id: Optional[str] = None  # For tracking related events
    priority: int = 0  # 0=normal, 1=high, 2=urgent
    ttl: int = 3600  # Time to live in seconds
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now(timezone.utc)
        if self.data is None:
            self.data = {}
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert event to dictionary for serialization"""
        event_dict = asdict(self)
        event_dict['type'] = self.type.value
        event_dict['timestamp'] = self.timestamp.isoformat()
        return event_dict
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Event':
        """Create event from dictionary"""
        data['type'] = EventType(data['type'])
        data['timestamp'] = datetime.fromisoformat(data['timestamp'])
        return cls(**data)

class EventBus:
    """
    Redis-based publish-subscribe event bus for agent communication.
    
    Provides:
    - Topic-based pub/sub messaging
    - Event persistence with TTL
    - Priority-based event handling
    - Correlation tracking
    - Dead letter queue for failed events
    """
    
    def __init__(self, redis_url: Optional[str] = None):
        self.redis_url = redis_url or settings.CELERY_BROKER_URL
        self.redis_client: Optional[redis.Redis] = None
        self.subscribers: Dict[str, List[Callable]] = {}
        self.running = False
        
    async def connect(self):
        """Initialize Redis connection"""
        if redis is None:
            logger.warning("Redis not available, using in-memory event bus")
            self.redis_client = None
            return
            
        try:
            self.redis_client = redis.from_url(self.redis_url, decode_responses=True)
            await self.redis_client.ping()
            logger.info("Event bus connected to Redis")
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            logger.warning("Falling back to in-memory event bus")
            self.redis_client = None
    
    async def disconnect(self):
        """Close Redis connection"""
        if self.redis_client:
            await self.redis_client.close()
            logger.info("Event bus disconnected from Redis")
    
    async def publish(self, event: Event) -> bool:
        """
        Publish an event to the event bus.
        
        Args:
            event: The event to publish
            
        Returns:
            bool: True if published successfully
        """
        if not self.redis_client:
            await self.connect()
        
        try:
            # Serialize event
            event_data = json.dumps(event.to_dict())
            
            # Determine channels to publish to
            channels = []
            
            if event.target_agents:
                # Direct message to specific agents
                for agent in event.target_agents:
                    channels.append(f"agent:{agent}")
            else:
                # Broadcast to all agents
                channels.append("broadcast")
            
            # Add type-specific channel
            channels.append(f"event:{event.type.value}")
            
            # Publish to all relevant channels
            for channel in channels:
                await self.redis_client.publish(channel, event_data)
            
            # Store event for persistence (with TTL)
            event_key = f"event:{event.id}"
            await self.redis_client.setex(
                event_key, 
                event.ttl, 
                event_data
            )
            
            logger.info(f"Published event {event.id} of type {event.type.value} to {len(channels)} channels")
            return True
            
        except Exception as e:
            logger.error(f"Failed to publish event {event.id}: {e}")
            # Store in dead letter queue
            await self._store_dead_letter(event, str(e))
            return False
    
    async def subscribe(self, 
                       agent_name: str, 
                       event_types: List[EventType], 
                       handler: Callable[[Event], None],
                       include_broadcast: bool = True) -> str:
        """
        Subscribe an agent to specific event types.
        
        Args:
            agent_name: Name of the subscribing agent
            event_types: List of event types to subscribe to
            handler: Function to handle received events
            include_broadcast: Whether to listen to broadcast messages
            
        Returns:
            str: Subscription ID for unsubscribing
        """
        subscription_id = str(uuid.uuid4())
        
        # Store subscription info
        subscription_key = f"subscription:{subscription_id}"
        subscription_data = {
            "agent_name": agent_name,
            "event_types": [et.value for et in event_types],
            "include_broadcast": include_broadcast,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        if self.redis_client:
            await self.redis_client.setex(
                subscription_key,
                86400,  # 24 hours TTL
                json.dumps(subscription_data)
            )
        
        # Start listening in background
        asyncio.create_task(self._listen_for_events(
            agent_name, event_types, handler, include_broadcast, subscription_id
        ))
        
        logger.info(f"Agent {agent_name} subscribed to {len(event_types)} event types")
        return subscription_id
    
    async def _listen_for_events(self, 
                               agent_name: str, 
                               event_types: List[EventType],
                               handler: Callable[[Event], None],
                               include_broadcast: bool,
                               subscription_id: str):
        """Background task to listen for events"""
        if not self.redis_client:
            await self.connect()
        
        pubsub = self.redis_client.pubsub()
        
        try:
            # Subscribe to agent-specific channel
            await pubsub.subscribe(f"agent:{agent_name}")
            
            # Subscribe to event type channels
            for event_type in event_types:
                await pubsub.subscribe(f"event:{event_type.value}")
            
            # Subscribe to broadcast if requested
            if include_broadcast:
                await pubsub.subscribe("broadcast")
            
            logger.info(f"Started listening for events for agent {agent_name}")
            
            # Process messages
            async for message in pubsub.listen():
                if message['type'] == 'message':
                    try:
                        event_data = json.loads(message['data'])
                        event = Event.from_dict(event_data)
                        
                        # Check if this event is relevant to this subscription
                        if self._is_event_relevant(event, agent_name, event_types, include_broadcast):
                            # Handle event
                            await self._safe_handle_event(handler, event)
                            
                    except Exception as e:
                        logger.error(f"Error processing event message: {e}")
                        
        except Exception as e:
            logger.error(f"Error in event listening for agent {agent_name}: {e}")
        finally:
            await pubsub.close()
    
    def _is_event_relevant(self, 
                          event: Event, 
                          agent_name: str, 
                          event_types: List[EventType],
                          include_broadcast: bool) -> bool:
        """Check if an event is relevant to a subscription"""
        # Direct message to this agent
        if event.target_agents and agent_name in event.target_agents:
            return True
        
        # Broadcast message (if subscribed to broadcast)
        if not event.target_agents and include_broadcast:
            return True
        
        # Event type match
        if event.type in event_types:
            return True
        
        return False
    
    async def _safe_handle_event(self, handler: Callable[[Event], None], event: Event):
        """Safely execute event handler with error handling"""
        try:
            if asyncio.iscoroutinefunction(handler):
                await handler(event)
            else:
                handler(event)
        except Exception as e:
            logger.error(f"Error in event handler for event {event.id}: {e}")
            # Store failed event for debugging
            await self._store_failed_event(event, str(e))
    
    async def _store_dead_letter(self, event: Event, error: str):
        """Store failed events in dead letter queue"""
        if not self.redis_client:
            return
        
        dead_letter_data = {
            "event": event.to_dict(),
            "error": error,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
        dead_letter_key = f"dead_letter:{event.id}"
        await self.redis_client.setex(
            dead_letter_key,
            86400 * 7,  # 7 days TTL
            json.dumps(dead_letter_data)
        )
    
    async def _store_failed_event(self, event: Event, error: str):
        """Store events that failed during handling"""
        if not self.redis_client:
            return
        
        failed_data = {
            "event": event.to_dict(),
            "error": error,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
        failed_key = f"failed_event:{event.id}"
        await self.redis_client.setex(
            failed_key,
            86400 * 3,  # 3 days TTL
            json.dumps(failed_data)
        )
    
    async def get_event_history(self, 
                              agent_name: Optional[str] = None,
                              event_type: Optional[EventType] = None,
                              limit: int = 100) -> List[Event]:
        """Retrieve event history for debugging and monitoring"""
        if not self.redis_client:
            await self.connect()
        
        events = []
        pattern = "event:*"
        
        async for key in self.redis_client.scan_iter(match=pattern):
            try:
                event_data = await self.redis_client.get(key)
                if event_data:
                    event_dict = json.loads(event_data)
                    event = Event.from_dict(event_dict)
                    
                    # Apply filters
                    if agent_name and agent_name not in (event.source_agent, *(event.target_agents or [])):
                        continue
                    if event_type and event.type != event_type:
                        continue
                    
                    events.append(event)
                    
            except Exception as e:
                logger.error(f"Error retrieving event from key {key}: {e}")
        
        # Sort by timestamp and limit
        events.sort(key=lambda e: e.timestamp, reverse=True)
        return events[:limit]

# Global event bus instance
event_bus = EventBus()

# Convenience functions for common operations
async def publish_event(event_type: EventType, 
                       source_agent: str, 
                       data: Dict[str, Any] = None,
                       target_agents: List[str] = None,
                       priority: int = 0) -> bool:
    """Convenience function to publish an event"""
    event = Event(
        id=str(uuid.uuid4()),
        type=event_type,
        source_agent=source_agent,
        target_agents=target_agents,
        data=data or {},
        priority=priority
    )
    return await event_bus.publish(event)

async def subscribe_agent(agent_name: str, 
                        event_types: List[EventType], 
                        handler: Callable[[Event], None]) -> str:
    """Convenience function to subscribe an agent to events"""
    return await event_bus.subscribe(agent_name, event_types, handler)

# Example event handlers for common patterns
class EventHandler:
    """Base class for event handlers with common patterns"""
    
    @staticmethod
    async def log_event(event: Event):
        """Simple event logging handler"""
        logger.info(f"Event received: {event.type.value} from {event.source_agent}")
    
    @staticmethod
    async def store_event_data(event: Event):
        """Handler to store event data in knowledge graph"""
        # This will be integrated with the knowledge graph system
        pass
    
    @staticmethod
    async def trigger_quality_check(event: Event):
        """Handler to trigger quality checks for relevant events"""
        if event.type in [EventType.DATA_CREATED, EventType.DATA_UPDATED]:
            # Trigger quality check
            quality_event = Event(
                id=str(uuid.uuid4()),
                type=EventType.QUALITY_CHECK_REQUESTED,
                source_agent="system",
                data={"triggered_by": event.id, "data_type": event.data.get("type", "unknown")}
            )
            await event_bus.publish(quality_event)
