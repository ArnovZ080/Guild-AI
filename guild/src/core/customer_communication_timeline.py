"""
Customer Communication Timeline System for Guild-AI
Provides comprehensive customer communication history, timeline visualization, and interaction tracking.
"""

import asyncio
import json
import logging
from typing import Dict, List, Any, Optional, Union
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from enum import Enum
import uuid

class CommunicationType(Enum):
    """Types of customer communications"""
    EMAIL = "email"
    PHONE_CALL = "phone_call"
    VIDEO_CALL = "video_call"
    MEETING = "meeting"
    CHAT = "chat"
    SUPPORT_TICKET = "support_ticket"
    SOCIAL_MESSAGE = "social_message"
    SMS = "sms"
    WHATSAPP = "whatsapp"
    SLACK = "slack"
    TEAMS = "teams"
    ZOOM = "zoom"
    DEMO = "demo"
    WEBINAR = "webinar"
    SURVEY = "survey"
    FEEDBACK = "feedback"

class CommunicationDirection(Enum):
    """Direction of communication"""
    INBOUND = "inbound"  # Customer initiated
    OUTBOUND = "outbound"  # Company initiated

class CommunicationStatus(Enum):
    """Communication status"""
    SENT = "sent"
    DELIVERED = "delivered"
    READ = "read"
    RESPONDED = "responded"
    FAILED = "failed"
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"

class SentimentType(Enum):
    """Communication sentiment"""
    POSITIVE = "positive"
    NEUTRAL = "neutral"
    NEGATIVE = "negative"
    FRUSTRATED = "frustrated"
    SATISFIED = "satisfied"
    EXCITED = "excited"
    CONFUSED = "confused"

@dataclass
class CommunicationEvent:
    """Individual communication event"""
    communication_id: str
    customer_id: str
    communication_type: CommunicationType
    direction: CommunicationDirection
    status: CommunicationStatus
    timestamp: datetime
    subject: Optional[str] = None
    content: Optional[str] = None
    sender: Optional[str] = None
    recipient: Optional[str] = None
    channel: Optional[str] = None
    platform: Optional[str] = None
    duration: Optional[int] = None  # seconds
    sentiment: Optional[SentimentType] = None
    sentiment_score: Optional[float] = None  # -1 to 1
    tags: List[str] = None
    metadata: Dict[str, Any] = None
    attachments: List[str] = None
    follow_up_required: bool = False
    follow_up_date: Optional[datetime] = None
    priority: str = "normal"  # low, normal, high, urgent
    outcome: Optional[str] = None
    satisfaction_rating: Optional[int] = None  # 1-5

@dataclass
class CommunicationSummary:
    """Communication summary for a customer"""
    customer_id: str
    total_communications: int
    inbound_count: int
    outbound_count: int
    last_communication: Optional[datetime]
    response_rate: float  # 0-1
    average_response_time: int  # minutes
    sentiment_distribution: Dict[str, int]
    communication_types: Dict[str, int]
    satisfaction_score: float  # 1-5
    active_conversations: int
    pending_follow_ups: int
    urgent_items: int

class CustomerCommunicationTimeline:
    """
    Comprehensive customer communication tracking and timeline system.
    """
    
    def __init__(self):
        self.communications: Dict[str, List[CommunicationEvent]] = {}
        self.communication_summaries: Dict[str, CommunicationSummary] = {}
        self.conversation_threads: Dict[str, List[str]] = {}  # thread_id -> communication_ids
        self.follow_up_queue: List[CommunicationEvent] = []
        
        # Communication templates and rules
        self.communication_rules = self._initialize_communication_rules()
        self.sentiment_analysis_rules = self._initialize_sentiment_rules()
    
    def _initialize_communication_rules(self) -> Dict[str, Any]:
        """Initialize communication rules and thresholds"""
        return {
            "response_time_thresholds": {
                "email": 24,  # hours
                "phone_call": 4,  # hours
                "support_ticket": 8,  # hours
                "chat": 1,  # hours
                "social_message": 12  # hours
            },
            "follow_up_triggers": {
                "no_response_days": 3,
                "negative_sentiment": True,
                "support_escalation": True,
                "satisfaction_rating_below": 3
            },
            "priority_escalation": {
                "urgent_keywords": ["urgent", "critical", "asap", "emergency"],
                "negative_sentiment_threshold": -0.5,
                "multiple_follow_ups": 2
            }
        }
    
    def _initialize_sentiment_rules(self) -> Dict[str, Any]:
        """Initialize sentiment analysis rules"""
        return {
            "positive_keywords": [
                "great", "excellent", "amazing", "love", "perfect", "fantastic",
                "thank you", "appreciate", "happy", "satisfied", "pleased"
            ],
            "negative_keywords": [
                "terrible", "awful", "horrible", "hate", "disappointed", "frustrated",
                "angry", "upset", "problem", "issue", "bug", "broken", "not working"
            ],
            "neutral_keywords": [
                "okay", "fine", "alright", "average", "standard", "normal"
            ],
            "sentiment_weights": {
                "positive": 1.0,
                "neutral": 0.0,
                "negative": -1.0
            }
        }
    
    async def log_communication(self, customer_id: str, communication_type: CommunicationType,
                              direction: CommunicationDirection, **kwargs) -> CommunicationEvent:
        """Log a new communication event"""
        try:
            communication = CommunicationEvent(
                communication_id=str(uuid.uuid4()),
                customer_id=customer_id,
                communication_type=communication_type,
                direction=direction,
                status=kwargs.get("status", CommunicationStatus.SENT),
                timestamp=kwargs.get("timestamp", datetime.now()),
                subject=kwargs.get("subject"),
                content=kwargs.get("content"),
                sender=kwargs.get("sender"),
                recipient=kwargs.get("recipient"),
                channel=kwargs.get("channel"),
                platform=kwargs.get("platform"),
                duration=kwargs.get("duration"),
                sentiment=kwargs.get("sentiment"),
                sentiment_score=kwargs.get("sentiment_score"),
                tags=kwargs.get("tags", []),
                metadata=kwargs.get("metadata", {}),
                attachments=kwargs.get("attachments", []),
                follow_up_required=kwargs.get("follow_up_required", False),
                follow_up_date=kwargs.get("follow_up_date"),
                priority=kwargs.get("priority", "normal"),
                outcome=kwargs.get("outcome"),
                satisfaction_rating=kwargs.get("satisfaction_rating")
            )
            
            # Analyze sentiment if not provided
            if not communication.sentiment and communication.content:
                communication.sentiment, communication.sentiment_score = await self._analyze_sentiment(communication.content)
            
            # Add to communications list
            if customer_id not in self.communications:
                self.communications[customer_id] = []
            self.communications[customer_id].append(communication)
            
            # Update communication summary
            await self._update_communication_summary(customer_id)
            
            # Check for follow-up requirements
            await self._check_follow_up_requirements(communication)
            
            # Update conversation threads
            await self._update_conversation_threads(communication)
            
            return communication
            
        except Exception as e:
            logging.error(f"Failed to log communication for customer {customer_id}: {e}")
            raise
    
    async def _analyze_sentiment(self, content: str) -> tuple[SentimentType, float]:
        """Analyze sentiment of communication content"""
        try:
            if not content:
                return SentimentType.NEUTRAL, 0.0
            
            content_lower = content.lower()
            positive_count = 0
            negative_count = 0
            neutral_count = 0
            
            # Count sentiment keywords
            for keyword in self.sentiment_analysis_rules["positive_keywords"]:
                if keyword in content_lower:
                    positive_count += 1
            
            for keyword in self.sentiment_analysis_rules["negative_keywords"]:
                if keyword in content_lower:
                    negative_count += 1
            
            for keyword in self.sentiment_analysis_rules["neutral_keywords"]:
                if keyword in content_lower:
                    neutral_count += 1
            
            # Determine sentiment
            total_sentiment_words = positive_count + negative_count + neutral_count
            
            if total_sentiment_words == 0:
                return SentimentType.NEUTRAL, 0.0
            
            sentiment_score = (positive_count - negative_count) / total_sentiment_words
            
            if sentiment_score > 0.3:
                return SentimentType.POSITIVE, sentiment_score
            elif sentiment_score < -0.3:
                return SentimentType.NEGATIVE, sentiment_score
            else:
                return SentimentType.NEUTRAL, sentiment_score
                
        except Exception as e:
            logging.error(f"Failed to analyze sentiment: {e}")
            return SentimentType.NEUTRAL, 0.0
    
    async def _update_communication_summary(self, customer_id: str):
        """Update communication summary for a customer"""
        try:
            communications = self.communications.get(customer_id, [])
            
            if not communications:
                return
            
            # Calculate summary metrics
            total_communications = len(communications)
            inbound_count = len([c for c in communications if c.direction == CommunicationDirection.INBOUND])
            outbound_count = len([c for c in communications if c.direction == CommunicationDirection.OUTBOUND])
            
            # Last communication
            last_communication = max(communications, key=lambda c: c.timestamp).timestamp
            
            # Response rate calculation
            response_rate = await self._calculate_response_rate(communications)
            
            # Average response time
            avg_response_time = await self._calculate_average_response_time(communications)
            
            # Sentiment distribution
            sentiment_dist = {}
            for sentiment in SentimentType:
                sentiment_dist[sentiment.value] = len([c for c in communications if c.sentiment == sentiment])
            
            # Communication types distribution
            comm_types = {}
            for comm_type in CommunicationType:
                comm_types[comm_type.value] = len([c for c in communications if c.communication_type == comm_type])
            
            # Satisfaction score
            satisfaction_scores = [c.satisfaction_rating for c in communications if c.satisfaction_rating]
            avg_satisfaction = sum(satisfaction_scores) / len(satisfaction_scores) if satisfaction_scores else 0
            
            # Active conversations and follow-ups
            active_conversations = len([c for c in communications if c.status == CommunicationStatus.IN_PROGRESS])
            pending_follow_ups = len([c for c in communications if c.follow_up_required and not c.follow_up_date])
            urgent_items = len([c for c in communications if c.priority == "urgent"])
            
            summary = CommunicationSummary(
                customer_id=customer_id,
                total_communications=total_communications,
                inbound_count=inbound_count,
                outbound_count=outbound_count,
                last_communication=last_communication,
                response_rate=response_rate,
                average_response_time=avg_response_time,
                sentiment_distribution=sentiment_dist,
                communication_types=comm_types,
                satisfaction_score=avg_satisfaction,
                active_conversations=active_conversations,
                pending_follow_ups=pending_follow_ups,
                urgent_items=urgent_items
            )
            
            self.communication_summaries[customer_id] = summary
            
        except Exception as e:
            logging.error(f"Failed to update communication summary for {customer_id}: {e}")
    
    async def _calculate_response_rate(self, communications: List[CommunicationEvent]) -> float:
        """Calculate response rate for communications"""
        try:
            if not communications:
                return 0.0
            
            # Count outbound communications that received responses
            outbound_communications = [c for c in communications if c.direction == CommunicationDirection.OUTBOUND]
            responded_communications = [c for c in outbound_communications if c.status == CommunicationStatus.RESPONDED]
            
            if not outbound_communications:
                return 0.0
            
            return len(responded_communications) / len(outbound_communications)
            
        except Exception as e:
            logging.error(f"Failed to calculate response rate: {e}")
            return 0.0
    
    async def _calculate_average_response_time(self, communications: List[CommunicationEvent]) -> int:
        """Calculate average response time in minutes"""
        try:
            response_times = []
            
            # Group communications by conversation thread
            for thread_id, comm_ids in self.conversation_threads.items():
                thread_communications = [
                    c for c in communications 
                    if c.communication_id in comm_ids
                ]
                
                # Sort by timestamp
                thread_communications.sort(key=lambda c: c.timestamp)
                
                # Calculate response times between communications
                for i in range(len(thread_communications) - 1):
                    current_comm = thread_communications[i]
                    next_comm = thread_communications[i + 1]
                    
                    # Check if this is a response (different direction)
                    if current_comm.direction != next_comm.direction:
                        time_diff = (next_comm.timestamp - current_comm.timestamp).total_seconds() / 60  # minutes
                        response_times.append(time_diff)
            
            if not response_times:
                return 0
            
            return int(sum(response_times) / len(response_times))
            
        except Exception as e:
            logging.error(f"Failed to calculate average response time: {e}")
            return 0
    
    async def _check_follow_up_requirements(self, communication: CommunicationEvent):
        """Check if follow-up is required for a communication"""
        try:
            follow_up_required = False
            follow_up_date = None
            
            # Check follow-up triggers
            rules = self.communication_rules["follow_up_triggers"]
            
            # Check for negative sentiment
            if rules["negative_sentiment"] and communication.sentiment == SentimentType.NEGATIVE:
                follow_up_required = True
                follow_up_date = datetime.now() + timedelta(hours=4)  # Follow up in 4 hours
            
            # Check for low satisfaction rating
            if (rules["satisfaction_rating_below"] and 
                communication.satisfaction_rating and 
                communication.satisfaction_rating < rules["satisfaction_rating_below"]):
                follow_up_required = True
                follow_up_date = datetime.now() + timedelta(hours=8)
            
            # Check for urgent priority
            if communication.priority == "urgent":
                follow_up_required = True
                follow_up_date = datetime.now() + timedelta(hours=2)
            
            # Check for support escalation
            if (rules["support_escalation"] and 
                communication.communication_type == CommunicationType.SUPPORT_TICKET and
                communication.priority in ["high", "urgent"]):
                follow_up_required = True
                follow_up_date = datetime.now() + timedelta(hours=6)
            
            if follow_up_required:
                communication.follow_up_required = True
                communication.follow_up_date = follow_up_date
                
                # Add to follow-up queue
                self.follow_up_queue.append(communication)
                
                logging.info(f"Follow-up required for communication {communication.communication_id}")
            
        except Exception as e:
            logging.error(f"Failed to check follow-up requirements: {e}")
    
    async def _update_conversation_threads(self, communication: CommunicationEvent):
        """Update conversation threads"""
        try:
            # Simple thread identification based on subject or customer
            thread_id = None
            
            # Check if this is a reply to an existing communication
            if communication.subject and "re:" in communication.subject.lower():
                # Extract original subject
                original_subject = communication.subject.lower().replace("re:", "").strip()
                
                # Find existing thread with this subject
                for existing_thread_id, comm_ids in self.conversation_threads.items():
                    for comm_id in comm_ids:
                        comm = self._find_communication_by_id(comm_id)
                        if comm and comm.subject and original_subject in comm.subject.lower():
                            thread_id = existing_thread_id
                            break
                    if thread_id:
                        break
            
            # If no existing thread found, create new one
            if not thread_id:
                thread_id = str(uuid.uuid4())
                self.conversation_threads[thread_id] = []
            
            # Add communication to thread
            if thread_id not in self.conversation_threads:
                self.conversation_threads[thread_id] = []
            
            self.conversation_threads[thread_id].append(communication.communication_id)
            
        except Exception as e:
            logging.error(f"Failed to update conversation threads: {e}")
    
    def _find_communication_by_id(self, communication_id: str) -> Optional[CommunicationEvent]:
        """Find communication by ID"""
        for communications in self.communications.values():
            for comm in communications:
                if comm.communication_id == communication_id:
                    return comm
        return None
    
    async def get_communication_timeline(self, customer_id: str, 
                                       start_date: Optional[datetime] = None,
                                       end_date: Optional[datetime] = None,
                                       communication_types: Optional[List[CommunicationType]] = None) -> List[CommunicationEvent]:
        """Get communication timeline for a customer"""
        try:
            communications = self.communications.get(customer_id, [])
            
            # Filter by date range
            if start_date:
                communications = [c for c in communications if c.timestamp >= start_date]
            if end_date:
                communications = [c for c in communications if c.timestamp <= end_date]
            
            # Filter by communication types
            if communication_types:
                communications = [c for c in communications if c.communication_type in communication_types]
            
            # Sort by timestamp (most recent first)
            communications.sort(key=lambda c: c.timestamp, reverse=True)
            
            return communications
            
        except Exception as e:
            logging.error(f"Failed to get communication timeline for {customer_id}: {e}")
            return []
    
    async def get_communication_summary(self, customer_id: str) -> Optional[CommunicationSummary]:
        """Get communication summary for a customer"""
        return self.communication_summaries.get(customer_id)
    
    async def get_conversation_thread(self, thread_id: str) -> List[CommunicationEvent]:
        """Get all communications in a conversation thread"""
        try:
            communication_ids = self.conversation_threads.get(thread_id, [])
            communications = []
            
            for comm_id in communication_ids:
                comm = self._find_communication_by_id(comm_id)
                if comm:
                    communications.append(comm)
            
            # Sort by timestamp
            communications.sort(key=lambda c: c.timestamp)
            
            return communications
            
        except Exception as e:
            logging.error(f"Failed to get conversation thread {thread_id}: {e}")
            return []
    
    async def get_follow_up_queue(self) -> List[CommunicationEvent]:
        """Get communications that require follow-up"""
        try:
            current_time = datetime.now()
            
            # Filter follow-ups that are due
            due_follow_ups = [
                comm for comm in self.follow_up_queue
                if comm.follow_up_date and comm.follow_up_date <= current_time
            ]
            
            # Sort by priority and due date
            due_follow_ups.sort(key=lambda c: (
                {"urgent": 4, "high": 3, "normal": 2, "low": 1}.get(c.priority, 2),
                c.follow_up_date
            ), reverse=True)
            
            return due_follow_ups
            
        except Exception as e:
            logging.error(f"Failed to get follow-up queue: {e}")
            return []
    
    async def mark_communication_completed(self, communication_id: str, outcome: str = None):
        """Mark a communication as completed"""
        try:
            communication = self._find_communication_by_id(communication_id)
            if communication:
                communication.status = CommunicationStatus.COMPLETED
                communication.outcome = outcome
                
                # Remove from follow-up queue if present
                self.follow_up_queue = [c for c in self.follow_up_queue if c.communication_id != communication_id]
                
                # Update summary
                await self._update_communication_summary(communication.customer_id)
                
                logging.info(f"Communication {communication_id} marked as completed")
                return True
            
            return False
            
        except Exception as e:
            logging.error(f"Failed to mark communication as completed: {e}")
            return False
    
    async def get_communication_analytics(self) -> Dict[str, Any]:
        """Get overall communication analytics"""
        try:
            all_communications = []
            for communications in self.communications.values():
                all_communications.extend(communications)
            
            if not all_communications:
                return {"total_communications": 0}
            
            # Basic metrics
            total_communications = len(all_communications)
            inbound_count = len([c for c in all_communications if c.direction == CommunicationDirection.INBOUND])
            outbound_count = len([c for c in all_communications if c.direction == CommunicationDirection.OUTBOUND])
            
            # Communication type distribution
            type_distribution = {}
            for comm_type in CommunicationType:
                type_distribution[comm_type.value] = len([c for c in all_communications if c.communication_type == comm_type])
            
            # Sentiment distribution
            sentiment_distribution = {}
            for sentiment in SentimentType:
                sentiment_distribution[sentiment.value] = len([c for c in all_communications if c.sentiment == sentiment])
            
            # Response rate
            total_response_rate = sum(summary.response_rate for summary in self.communication_summaries.values()) / len(self.communication_summaries) if self.communication_summaries else 0
            
            # Average response time
            total_avg_response_time = sum(summary.average_response_time for summary in self.communication_summaries.values()) / len(self.communication_summaries) if self.communication_summaries else 0
            
            # Follow-up metrics
            total_follow_ups = sum(summary.pending_follow_ups for summary in self.communication_summaries.values())
            total_urgent_items = sum(summary.urgent_items for summary in self.communication_summaries.values())
            
            return {
                "total_communications": total_communications,
                "inbound_count": inbound_count,
                "outbound_count": outbound_count,
                "type_distribution": type_distribution,
                "sentiment_distribution": sentiment_distribution,
                "average_response_rate": total_response_rate,
                "average_response_time": total_avg_response_time,
                "total_pending_follow_ups": total_follow_ups,
                "total_urgent_items": total_urgent_items,
                "last_updated": datetime.now().isoformat()
            }
            
        except Exception as e:
            logging.error(f"Failed to get communication analytics: {e}")
            return {}

# Global communication timeline instance
customer_communication_timeline = CustomerCommunicationTimeline()

# Convenience functions
async def log_customer_communication(customer_id: str, communication_type: CommunicationType,
                                   direction: CommunicationDirection, **kwargs) -> CommunicationEvent:
    """Log customer communication"""
    return await customer_communication_timeline.log_communication(customer_id, communication_type, direction, **kwargs)

async def get_customer_communication_timeline(customer_id: str, start_date: Optional[datetime] = None,
                                            end_date: Optional[datetime] = None,
                                            communication_types: Optional[List[CommunicationType]] = None) -> List[CommunicationEvent]:
    """Get customer communication timeline"""
    return await customer_communication_timeline.get_communication_timeline(customer_id, start_date, end_date, communication_types)

async def get_customer_communication_summary(customer_id: str) -> Optional[CommunicationSummary]:
    """Get customer communication summary"""
    return await customer_communication_timeline.get_communication_summary(customer_id)

async def get_follow_up_queue() -> List[CommunicationEvent]:
    """Get follow-up queue"""
    return await customer_communication_timeline.get_follow_up_queue()

async def get_communication_analytics() -> Dict[str, Any]:
    """Get communication analytics"""
    return await customer_communication_timeline.get_communication_analytics()
