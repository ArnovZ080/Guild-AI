"""
Customer Journey Tracking System for Guild-AI
Provides comprehensive customer journey mapping, touchpoint tracking, and journey analytics.
"""

import asyncio
import json
import logging
from typing import Dict, List, Any, Optional, Union
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from enum import Enum
import uuid

class JourneyStage(Enum):
    """Customer journey stages"""
    AWARENESS = "awareness"
    CONSIDERATION = "consideration"
    PURCHASE = "purchase"
    ONBOARDING = "onboarding"
    ADOPTION = "adoption"
    RETENTION = "retention"
    ADVOCACY = "advocacy"
    CHURN = "churn"

class TouchpointType(Enum):
    """Types of customer touchpoints"""
    WEBSITE_VISIT = "website_visit"
    EMAIL_OPEN = "email_open"
    EMAIL_CLICK = "email_click"
    SOCIAL_ENGAGEMENT = "social_engagement"
    SUPPORT_TICKET = "support_ticket"
    PHONE_CALL = "phone_call"
    MEETING = "meeting"
    DEMO = "demo"
    TRIAL_START = "trial_start"
    PURCHASE = "purchase"
    UPGRADE = "upgrade"
    FEEDBACK = "feedback"
    REFERRAL = "referral"

class JourneyEvent(Enum):
    """Journey milestone events"""
    FIRST_CONTACT = "first_contact"
    FIRST_ENGAGEMENT = "first_engagement"
    TRIAL_START = "trial_start"
    FIRST_PURCHASE = "first_purchase"
    FIRST_SUCCESS = "first_success"
    FIRST_RENEWAL = "first_renewal"
    FIRST_REFERRAL = "first_referral"
    CHURN = "churn"

@dataclass
class Touchpoint:
    """Individual customer touchpoint"""
    touchpoint_id: str
    customer_id: str
    touchpoint_type: TouchpointType
    stage: JourneyStage
    timestamp: datetime
    channel: str  # email, website, social, phone, etc.
    platform: str  # specific platform (gmail, facebook, etc.)
    content: Optional[str] = None
    metadata: Dict[str, Any] = None
    sentiment: Optional[str] = None
    outcome: Optional[str] = None
    duration: Optional[int] = None  # seconds
    value: Optional[float] = None

@dataclass
class JourneyMilestone:
    """Customer journey milestone"""
    milestone_id: str
    customer_id: str
    event_type: JourneyEvent
    stage: JourneyStage
    timestamp: datetime
    touchpoint_id: Optional[str] = None
    description: str = ""
    impact_score: float = 0.0
    metadata: Dict[str, Any] = None

@dataclass
class CustomerJourney:
    """Complete customer journey"""
    customer_id: str
    current_stage: JourneyStage
    journey_start: datetime
    last_activity: datetime
    touchpoints: List[Touchpoint]
    milestones: List[JourneyMilestone]
    journey_score: float  # 0-100
    next_likely_stage: Optional[JourneyStage]
    time_in_current_stage: int  # days
    total_journey_duration: int  # days
    conversion_probability: float  # 0-1
    churn_risk: float  # 0-1
    journey_health: str  # excellent, good, warning, critical

class CustomerJourneyTracker:
    """
    Comprehensive customer journey tracking and analytics system.
    """
    
    def __init__(self):
        self.customer_journeys: Dict[str, CustomerJourney] = {}
        self.touchpoint_history: Dict[str, List[Touchpoint]] = {}
        self.milestone_history: Dict[str, List[JourneyMilestone]] = {}
        self.journey_analytics: Dict[str, Any] = {}
        
        # Journey stage definitions
        self.stage_definitions = self._initialize_stage_definitions()
        
        # Touchpoint mapping
        self.touchpoint_mappings = self._initialize_touchpoint_mappings()
    
    def _initialize_stage_definitions(self) -> Dict[JourneyStage, Dict[str, Any]]:
        """Initialize journey stage definitions and criteria"""
        return {
            JourneyStage.AWARENESS: {
                "description": "Customer becomes aware of your brand",
                "indicators": ["website_visit", "social_engagement", "content_consumption"],
                "duration_estimate": 7,  # days
                "conversion_rate": 0.15
            },
            JourneyStage.CONSIDERATION: {
                "description": "Customer considers your solution",
                "indicators": ["demo_request", "trial_start", "pricing_page_visit"],
                "duration_estimate": 14,  # days
                "conversion_rate": 0.25
            },
            JourneyStage.PURCHASE: {
                "description": "Customer makes a purchase decision",
                "indicators": ["purchase", "subscription_start", "payment_success"],
                "duration_estimate": 1,  # days
                "conversion_rate": 1.0
            },
            JourneyStage.ONBOARDING: {
                "description": "Customer gets started with your product",
                "indicators": ["account_setup", "first_login", "onboarding_complete"],
                "duration_estimate": 7,  # days
                "conversion_rate": 0.8
            },
            JourneyStage.ADOPTION: {
                "description": "Customer actively uses your product",
                "indicators": ["feature_usage", "regular_login", "value_achievement"],
                "duration_estimate": 30,  # days
                "conversion_rate": 0.7
            },
            JourneyStage.RETENTION: {
                "description": "Customer continues to use and value your product",
                "indicators": ["renewal", "upgrade", "continued_usage"],
                "duration_estimate": 90,  # days
                "conversion_rate": 0.6
            },
            JourneyStage.ADVOCACY: {
                "description": "Customer becomes an advocate for your brand",
                "indicators": ["referral", "testimonial", "case_study"],
                "duration_estimate": 180,  # days
                "conversion_rate": 0.3
            },
            JourneyStage.CHURN: {
                "description": "Customer stops using your product",
                "indicators": ["subscription_cancellation", "account_deactivation"],
                "duration_estimate": 0,  # days
                "conversion_rate": 0.0
            }
        }
    
    def _initialize_touchpoint_mappings(self) -> Dict[TouchpointType, Dict[str, Any]]:
        """Initialize touchpoint type mappings and scoring"""
        return {
            TouchpointType.WEBSITE_VISIT: {
                "stage": JourneyStage.AWARENESS,
                "score": 1.0,
                "channels": ["website", "landing_page"]
            },
            TouchpointType.EMAIL_OPEN: {
                "stage": JourneyStage.CONSIDERATION,
                "score": 2.0,
                "channels": ["email"]
            },
            TouchpointType.EMAIL_CLICK: {
                "stage": JourneyStage.CONSIDERATION,
                "score": 3.0,
                "channels": ["email"]
            },
            TouchpointType.SOCIAL_ENGAGEMENT: {
                "stage": JourneyStage.AWARENESS,
                "score": 2.5,
                "channels": ["social_media"]
            },
            TouchpointType.SUPPORT_TICKET: {
                "stage": JourneyStage.ADOPTION,
                "score": 4.0,
                "channels": ["support", "help_desk"]
            },
            TouchpointType.PHONE_CALL: {
                "stage": JourneyStage.CONSIDERATION,
                "score": 5.0,
                "channels": ["phone"]
            },
            TouchpointType.MEETING: {
                "stage": JourneyStage.CONSIDERATION,
                "score": 6.0,
                "channels": ["video_call", "in_person"]
            },
            TouchpointType.DEMO: {
                "stage": JourneyStage.CONSIDERATION,
                "score": 8.0,
                "channels": ["demo", "webinar"]
            },
            TouchpointType.TRIAL_START: {
                "stage": JourneyStage.CONSIDERATION,
                "score": 7.0,
                "channels": ["product"]
            },
            TouchpointType.PURCHASE: {
                "stage": JourneyStage.PURCHASE,
                "score": 10.0,
                "channels": ["checkout", "payment"]
            },
            TouchpointType.UPGRADE: {
                "stage": JourneyStage.RETENTION,
                "score": 8.0,
                "channels": ["product", "billing"]
            },
            TouchpointType.FEEDBACK: {
                "stage": JourneyStage.ADOPTION,
                "score": 3.0,
                "channels": ["survey", "feedback_form"]
            },
            TouchpointType.REFERRAL: {
                "stage": JourneyStage.ADVOCACY,
                "score": 9.0,
                "channels": ["referral_program"]
            }
        }
    
    async def track_touchpoint(self, customer_id: str, touchpoint_type: TouchpointType, 
                             channel: str, platform: str, **kwargs) -> Touchpoint:
        """Track a new customer touchpoint"""
        try:
            touchpoint = Touchpoint(
                touchpoint_id=str(uuid.uuid4()),
                customer_id=customer_id,
                touchpoint_type=touchpoint_type,
                stage=self.touchpoint_mappings[touchpoint_type]["stage"],
                timestamp=datetime.now(),
                channel=channel,
                platform=platform,
                content=kwargs.get("content"),
                metadata=kwargs.get("metadata", {}),
                sentiment=kwargs.get("sentiment"),
                outcome=kwargs.get("outcome"),
                duration=kwargs.get("duration"),
                value=kwargs.get("value")
            )
            
            # Add to touchpoint history
            if customer_id not in self.touchpoint_history:
                self.touchpoint_history[customer_id] = []
            self.touchpoint_history[customer_id].append(touchpoint)
            
            # Update or create customer journey
            await self._update_customer_journey(customer_id, touchpoint)
            
            return touchpoint
            
        except Exception as e:
            logging.error(f"Failed to track touchpoint for customer {customer_id}: {e}")
            raise
    
    async def _update_customer_journey(self, customer_id: str, touchpoint: Touchpoint):
        """Update customer journey based on new touchpoint"""
        try:
            if customer_id not in self.customer_journeys:
                # Create new journey
                journey = CustomerJourney(
                    customer_id=customer_id,
                    current_stage=JourneyStage.AWARENESS,
                    journey_start=datetime.now(),
                    last_activity=datetime.now(),
                    touchpoints=[],
                    milestones=[],
                    journey_score=0.0,
                    next_likely_stage=None,
                    time_in_current_stage=0,
                    total_journey_duration=0,
                    conversion_probability=0.0,
                    churn_risk=0.0,
                    journey_health="good"
                )
                self.customer_journeys[customer_id] = journey
            
            journey = self.customer_journeys[customer_id]
            
            # Add touchpoint to journey
            journey.touchpoints.append(touchpoint)
            journey.last_activity = touchpoint.timestamp
            
            # Update journey stage if needed
            await self._update_journey_stage(journey, touchpoint)
            
            # Recalculate journey metrics
            await self._recalculate_journey_metrics(journey)
            
            # Check for milestone events
            await self._check_milestone_events(journey, touchpoint)
            
        except Exception as e:
            logging.error(f"Failed to update customer journey for {customer_id}: {e}")
    
    async def _update_journey_stage(self, journey: CustomerJourney, touchpoint: Touchpoint):
        """Update journey stage based on touchpoint"""
        try:
            current_stage = journey.current_stage
            new_stage = touchpoint.stage
            
            # Define stage progression rules
            stage_progression = {
                JourneyStage.AWARENESS: [JourneyStage.CONSIDERATION],
                JourneyStage.CONSIDERATION: [JourneyStage.PURCHASE, JourneyStage.AWARENESS],
                JourneyStage.PURCHASE: [JourneyStage.ONBOARDING],
                JourneyStage.ONBOARDING: [JourneyStage.ADOPTION],
                JourneyStage.ADOPTION: [JourneyStage.RETENTION, JourneyStage.CHURN],
                JourneyStage.RETENTION: [JourneyStage.ADVOCACY, JourneyStage.CHURN],
                JourneyStage.ADVOCACY: [JourneyStage.RETENTION, JourneyStage.CHURN],
                JourneyStage.CHURN: []  # Terminal stage
            }
            
            # Check if stage progression is valid
            if new_stage in stage_progression.get(current_stage, []):
                journey.current_stage = new_stage
                journey.time_in_current_stage = 0
            elif new_stage == current_stage:
                # Same stage, continue
                pass
            else:
                # Invalid progression, stay in current stage
                pass
            
            # Update time in current stage
            if journey.touchpoints:
                last_touchpoint_time = journey.touchpoints[-2].timestamp if len(journey.touchpoints) > 1 else journey.journey_start
                time_diff = (touchpoint.timestamp - last_touchpoint_time).days
                journey.time_in_current_stage += time_diff
            
        except Exception as e:
            logging.error(f"Failed to update journey stage: {e}")
    
    async def _recalculate_journey_metrics(self, journey: CustomerJourney):
        """Recalculate journey metrics and scores"""
        try:
            # Calculate journey score based on touchpoints
            total_score = 0.0
            for touchpoint in journey.touchpoints:
                touchpoint_config = self.touchpoint_mappings.get(touchpoint.touchpoint_type, {})
                score = touchpoint_config.get("score", 1.0)
                total_score += score
            
            journey.journey_score = min(100.0, total_score)
            
            # Calculate journey duration
            journey.total_journey_duration = (journey.last_activity - journey.journey_start).days
            
            # Calculate conversion probability
            stage_config = self.stage_definitions.get(journey.current_stage, {})
            base_conversion = stage_config.get("conversion_rate", 0.0)
            
            # Adjust based on journey score and activity
            activity_factor = min(1.0, len(journey.touchpoints) / 10.0)  # More touchpoints = higher probability
            score_factor = journey.journey_score / 100.0
            
            journey.conversion_probability = base_conversion * activity_factor * score_factor
            
            # Calculate churn risk
            journey.churn_risk = await self._calculate_churn_risk(journey)
            
            # Determine next likely stage
            journey.next_likely_stage = await self._predict_next_stage(journey)
            
            # Determine journey health
            journey.journey_health = await self._determine_journey_health(journey)
            
        except Exception as e:
            logging.error(f"Failed to recalculate journey metrics: {e}")
    
    async def _calculate_churn_risk(self, journey: CustomerJourney) -> float:
        """Calculate churn risk based on journey patterns"""
        try:
            churn_risk = 0.0
            
            # Time-based risk
            if journey.current_stage in [JourneyStage.ADOPTION, JourneyStage.RETENTION]:
                if journey.time_in_current_stage > 90:  # 3 months without progression
                    churn_risk += 0.3
            
            # Activity-based risk
            recent_touchpoints = [
                tp for tp in journey.touchpoints 
                if (datetime.now() - tp.timestamp).days <= 30
            ]
            
            if len(recent_touchpoints) == 0:
                churn_risk += 0.4  # No activity in 30 days
            elif len(recent_touchpoints) < 2:
                churn_risk += 0.2  # Low activity
            
            # Stage-based risk
            if journey.current_stage == JourneyStage.CHURN:
                churn_risk = 1.0
            elif journey.current_stage in [JourneyStage.AWARENESS, JourneyStage.CONSIDERATION]:
                if journey.time_in_current_stage > 30:  # Stuck in early stages
                    churn_risk += 0.3
            
            # Support-related risk
            support_touchpoints = [
                tp for tp in journey.touchpoints 
                if tp.touchpoint_type == TouchpointType.SUPPORT_TICKET
            ]
            
            if len(support_touchpoints) > 3:
                churn_risk += 0.2  # Multiple support issues
            
            return min(1.0, churn_risk)
            
        except Exception as e:
            logging.error(f"Failed to calculate churn risk: {e}")
            return 0.0
    
    async def _predict_next_stage(self, journey: CustomerJourney) -> Optional[JourneyStage]:
        """Predict next likely journey stage"""
        try:
            current_stage = journey.current_stage
            
            # Simple prediction based on current stage and activity
            if current_stage == JourneyStage.AWARENESS:
                if journey.journey_score > 20:
                    return JourneyStage.CONSIDERATION
            elif current_stage == JourneyStage.CONSIDERATION:
                if journey.journey_score > 40:
                    return JourneyStage.PURCHASE
                elif journey.journey_score < 10:
                    return JourneyStage.AWARENESS
            elif current_stage == JourneyStage.PURCHASE:
                return JourneyStage.ONBOARDING
            elif current_stage == JourneyStage.ONBOARDING:
                if journey.journey_score > 60:
                    return JourneyStage.ADOPTION
            elif current_stage == JourneyStage.ADOPTION:
                if journey.journey_score > 80:
                    return JourneyStage.RETENTION
                elif journey.churn_risk > 0.7:
                    return JourneyStage.CHURN
            elif current_stage == JourneyStage.RETENTION:
                if journey.journey_score > 90:
                    return JourneyStage.ADVOCACY
                elif journey.churn_risk > 0.6:
                    return JourneyStage.CHURN
            
            return None
            
        except Exception as e:
            logging.error(f"Failed to predict next stage: {e}")
            return None
    
    async def _determine_journey_health(self, journey: CustomerJourney) -> str:
        """Determine overall journey health"""
        try:
            if journey.churn_risk > 0.7:
                return "critical"
            elif journey.churn_risk > 0.4:
                return "warning"
            elif journey.journey_score > 70 and journey.conversion_probability > 0.5:
                return "excellent"
            elif journey.journey_score > 40:
                return "good"
            else:
                return "warning"
                
        except Exception as e:
            logging.error(f"Failed to determine journey health: {e}")
            return "warning"
    
    async def _check_milestone_events(self, journey: CustomerJourney, touchpoint: Touchpoint):
        """Check for milestone events based on touchpoint"""
        try:
            # Check for first contact milestone
            if touchpoint.touchpoint_type in [TouchpointType.WEBSITE_VISIT, TouchpointType.EMAIL_OPEN]:
                existing_milestone = next(
                    (m for m in journey.milestones if m.event_type == JourneyEvent.FIRST_CONTACT),
                    None
                )
                if not existing_milestone:
                    milestone = JourneyMilestone(
                        milestone_id=str(uuid.uuid4()),
                        customer_id=journey.customer_id,
                        event_type=JourneyEvent.FIRST_CONTACT,
                        stage=JourneyStage.AWARENESS,
                        timestamp=touchpoint.timestamp,
                        touchpoint_id=touchpoint.touchpoint_id,
                        description="First contact with customer",
                        impact_score=5.0
                    )
                    journey.milestones.append(milestone)
            
            # Check for first engagement milestone
            elif touchpoint.touchpoint_type in [TouchpointType.EMAIL_CLICK, TouchpointType.SOCIAL_ENGAGEMENT]:
                existing_milestone = next(
                    (m for m in journey.milestones if m.event_type == JourneyEvent.FIRST_ENGAGEMENT),
                    None
                )
                if not existing_milestone:
                    milestone = JourneyMilestone(
                        milestone_id=str(uuid.uuid4()),
                        customer_id=journey.customer_id,
                        event_type=JourneyEvent.FIRST_ENGAGEMENT,
                        stage=JourneyStage.CONSIDERATION,
                        timestamp=touchpoint.timestamp,
                        touchpoint_id=touchpoint.touchpoint_id,
                        description="First engagement with customer",
                        impact_score=7.0
                    )
                    journey.milestones.append(milestone)
            
            # Check for trial start milestone
            elif touchpoint.touchpoint_type == TouchpointType.TRIAL_START:
                existing_milestone = next(
                    (m for m in journey.milestones if m.event_type == JourneyEvent.TRIAL_START),
                    None
                )
                if not existing_milestone:
                    milestone = JourneyMilestone(
                        milestone_id=str(uuid.uuid4()),
                        customer_id=journey.customer_id,
                        event_type=JourneyEvent.TRIAL_START,
                        stage=JourneyStage.CONSIDERATION,
                        timestamp=touchpoint.timestamp,
                        touchpoint_id=touchpoint.touchpoint_id,
                        description="Customer started trial",
                        impact_score=8.0
                    )
                    journey.milestones.append(milestone)
            
            # Check for first purchase milestone
            elif touchpoint.touchpoint_type == TouchpointType.PURCHASE:
                existing_milestone = next(
                    (m for m in journey.milestones if m.event_type == JourneyEvent.FIRST_PURCHASE),
                    None
                )
                if not existing_milestone:
                    milestone = JourneyMilestone(
                        milestone_id=str(uuid.uuid4()),
                        customer_id=journey.customer_id,
                        event_type=JourneyEvent.FIRST_PURCHASE,
                        stage=JourneyStage.PURCHASE,
                        timestamp=touchpoint.timestamp,
                        touchpoint_id=touchpoint.touchpoint_id,
                        description="Customer made first purchase",
                        impact_score=10.0
                    )
                    journey.milestones.append(milestone)
            
            # Check for churn milestone
            elif touchpoint.touchpoint_type in [TouchpointType.CHURN]:
                milestone = JourneyMilestone(
                    milestone_id=str(uuid.uuid4()),
                    customer_id=journey.customer_id,
                    event_type=JourneyEvent.CHURN,
                    stage=JourneyStage.CHURN,
                    timestamp=touchpoint.timestamp,
                    touchpoint_id=touchpoint.touchpoint_id,
                    description="Customer churned",
                    impact_score=-10.0
                )
                journey.milestones.append(milestone)
            
        except Exception as e:
            logging.error(f"Failed to check milestone events: {e}")
    
    async def get_customer_journey(self, customer_id: str) -> Optional[CustomerJourney]:
        """Get complete customer journey"""
        return self.customer_journeys.get(customer_id)
    
    async def get_journey_analytics(self) -> Dict[str, Any]:
        """Get comprehensive journey analytics"""
        try:
            total_customers = len(self.customer_journeys)
            
            # Stage distribution
            stage_distribution = {}
            for stage in JourneyStage:
                stage_distribution[stage.value] = 0
            
            for journey in self.customer_journeys.values():
                stage_distribution[journey.current_stage.value] += 1
            
            # Journey health distribution
            health_distribution = {"excellent": 0, "good": 0, "warning": 0, "critical": 0}
            for journey in self.customer_journeys.values():
                health_distribution[journey.journey_health] += 1
            
            # Average metrics
            avg_journey_score = sum(j.journey_score for j in self.customer_journeys.values()) / total_customers if total_customers > 0 else 0
            avg_conversion_probability = sum(j.conversion_probability for j in self.customer_journeys.values()) / total_customers if total_customers > 0 else 0
            avg_churn_risk = sum(j.churn_risk for j in self.customer_journeys.values()) / total_customers if total_customers > 0 else 0
            
            # Journey duration analysis
            journey_durations = [j.total_journey_duration for j in self.customer_journeys.values()]
            avg_journey_duration = sum(journey_durations) / len(journey_durations) if journey_durations else 0
            
            return {
                "total_customers": total_customers,
                "stage_distribution": stage_distribution,
                "health_distribution": health_distribution,
                "average_journey_score": avg_journey_score,
                "average_conversion_probability": avg_conversion_probability,
                "average_churn_risk": avg_churn_risk,
                "average_journey_duration": avg_journey_duration,
                "last_updated": datetime.now().isoformat()
            }
            
        except Exception as e:
            logging.error(f"Failed to get journey analytics: {e}")
            return {}
    
    async def get_stage_performance(self, stage: JourneyStage) -> Dict[str, Any]:
        """Get performance metrics for a specific journey stage"""
        try:
            customers_in_stage = [
                journey for journey in self.customer_journeys.values()
                if journey.current_stage == stage
            ]
            
            if not customers_in_stage:
                return {"stage": stage.value, "customers": 0}
            
            avg_score = sum(j.journey_score for j in customers_in_stage) / len(customers_in_stage)
            avg_time_in_stage = sum(j.time_in_current_stage for j in customers_in_stage) / len(customers_in_stage)
            avg_churn_risk = sum(j.churn_risk for j in customers_in_stage) / len(customers_in_stage)
            
            # Count touchpoints by type for this stage
            touchpoint_counts = {}
            for journey in customers_in_stage:
                for touchpoint in journey.touchpoints:
                    if touchpoint.stage == stage:
                        touchpoint_type = touchpoint.touchpoint_type.value
                        touchpoint_counts[touchpoint_type] = touchpoint_counts.get(touchpoint_type, 0) + 1
            
            return {
                "stage": stage.value,
                "customers": len(customers_in_stage),
                "average_score": avg_score,
                "average_time_in_stage": avg_time_in_stage,
                "average_churn_risk": avg_churn_risk,
                "common_touchpoints": touchpoint_counts,
                "stage_definition": self.stage_definitions.get(stage, {})
            }
            
        except Exception as e:
            logging.error(f"Failed to get stage performance for {stage}: {e}")
            return {"stage": stage.value, "error": str(e)}

# Global journey tracker instance
customer_journey_tracker = CustomerJourneyTracker()

# Convenience functions
async def track_customer_touchpoint(customer_id: str, touchpoint_type: TouchpointType, 
                                  channel: str, platform: str, **kwargs) -> Touchpoint:
    """Track customer touchpoint"""
    return await customer_journey_tracker.track_touchpoint(customer_id, touchpoint_type, channel, platform, **kwargs)

async def get_customer_journey(customer_id: str) -> Optional[CustomerJourney]:
    """Get customer journey"""
    return await customer_journey_tracker.get_customer_journey(customer_id)

async def get_journey_analytics() -> Dict[str, Any]:
    """Get journey analytics"""
    return await customer_journey_tracker.get_journey_analytics()

async def get_stage_performance(stage: JourneyStage) -> Dict[str, Any]:
    """Get stage performance"""
    return await customer_journey_tracker.get_stage_performance(stage)
