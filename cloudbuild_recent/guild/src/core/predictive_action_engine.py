"""
Predictive Action Engine for Guild-AI
Provides next best action AI recommendations and dynamic customer journey optimization.
"""

import asyncio
import json
import logging
from typing import Dict, List, Any, Optional, Union, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from enum import Enum
import uuid
import math

class ActionType(Enum):
    """Types of customer actions"""
    ENGAGEMENT = "engagement"
    RETENTION = "retention"
    UPSELL = "upsell"
    SUPPORT = "support"
    ONBOARDING = "onboarding"
    TRAINING = "training"
    FEATURE_ADOPTION = "feature_adoption"
    COMMUNITY = "community"
    FEEDBACK = "feedback"
    CUSTOMIZATION = "customization"

class ActionPriority(Enum):
    """Action priority levels"""
    CRITICAL = "critical"    # Immediate action required
    HIGH = "high"           # Within 24 hours
    MEDIUM = "medium"       # Within 3 days
    LOW = "low"            # Within 1 week

class ActionContext(Enum):
    """Action context and timing"""
    IMMEDIATE = "immediate"
    SCHEDULED = "scheduled"
    TRIGGERED = "triggered"
    OPPORTUNISTIC = "opportunistic"

class ActionStatus(Enum):
    """Action status"""
    RECOMMENDED = "recommended"
    APPROVED = "approved"
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    FAILED = "failed"

@dataclass
class NextBestAction:
    """Next best action recommendation"""
    action_id: str
    customer_id: str
    action_type: ActionType
    priority: ActionPriority
    context: ActionContext
    title: str
    description: str
    confidence_score: float  # 0-1
    expected_impact: float  # 0-100
    success_probability: float  # 0-1
    urgency_score: float  # 0-100
    created_at: datetime
    recommended_for: Optional[datetime]
    status: ActionStatus
    execution_plan: Dict[str, Any]
    success_metrics: Dict[str, Any]
    risk_factors: List[str]
    dependencies: List[str]
    estimated_duration: int  # minutes
    assigned_agent: str
    outcome: Optional[str]
    effectiveness_score: Optional[float]

@dataclass
class JourneyOptimization:
    """Customer journey optimization recommendation"""
    optimization_id: str
    customer_id: str
    journey_stage: str
    optimization_type: str
    current_metrics: Dict[str, Any]
    target_metrics: Dict[str, Any]
    recommended_actions: List[str]
    expected_improvement: float  # percentage
    implementation_plan: Dict[str, Any]
    success_criteria: Dict[str, Any]

class PredictiveActionEngine:
    """
    AI-powered predictive action engine for next best action recommendations and journey optimization.
    """
    
    def __init__(self):
        self.action_recommendations: Dict[str, NextBestAction] = {}
        self.action_history: List[NextBestAction] = []
        self.journey_optimizations: Dict[str, JourneyOptimization] = {}
        self.action_patterns: Dict[str, Any] = {}
        self.customer_segments: Dict[str, Any] = {}
        self.ml_models: Dict[str, Any] = {}
        
        # Initialize action patterns and ML models
        self._initialize_action_patterns()
        self._initialize_customer_segments()
        self._initialize_ml_models()
    
    def _initialize_action_patterns(self):
        """Initialize action patterns and success rates"""
        self.action_patterns = {
            ActionType.ENGAGEMENT: {
                "success_factors": ["personalization", "timing", "value_proposition"],
                "average_success_rate": 0.75,
                "average_impact": 65,
                "optimal_timing": "business_hours",
                "channel_preferences": ["email", "in_app", "phone"]
            },
            ActionType.RETENTION: {
                "success_factors": ["early_detection", "personalized_offers", "relationship_building"],
                "average_success_rate": 0.68,
                "average_impact": 85,
                "optimal_timing": "immediate",
                "channel_preferences": ["phone", "email", "in_app"]
            },
            ActionType.UPSELL: {
                "success_factors": ["value_demonstration", "timing", "relationship_strength"],
                "average_success_rate": 0.45,
                "average_impact": 120,
                "optimal_timing": "success_milestones",
                "channel_preferences": ["phone", "meeting", "email"]
            },
            ActionType.SUPPORT: {
                "success_factors": ["response_time", "solution_quality", "empathy"],
                "average_success_rate": 0.82,
                "average_impact": 70,
                "optimal_timing": "immediate",
                "channel_preferences": ["chat", "phone", "email"]
            },
            ActionType.ONBOARDING: {
                "success_factors": ["personalization", "progression_tracking", "support_availability"],
                "average_success_rate": 0.78,
                "average_impact": 90,
                "optimal_timing": "early_stage",
                "channel_preferences": ["in_app", "email", "video_call"]
            },
            ActionType.TRAINING: {
                "success_factors": ["relevance", "interactivity", "practical_application"],
                "average_success_rate": 0.70,
                "average_impact": 55,
                "optimal_timing": "feature_introduction",
                "channel_preferences": ["video", "webinar", "documentation"]
            },
            ActionType.FEATURE_ADOPTION: {
                "success_factors": ["value_clear", "ease_of_use", "support_available"],
                "average_success_rate": 0.65,
                "average_impact": 75,
                "optimal_timing": "usage_plateau",
                "channel_preferences": ["in_app", "email", "demo"]
            },
            ActionType.COMMUNITY: {
                "success_factors": ["engagement_level", "peer_connections", "value_exchange"],
                "average_success_rate": 0.60,
                "average_impact": 40,
                "optimal_timing": "maturity_stage",
                "channel_preferences": ["community_platform", "events", "social"]
            },
            ActionType.FEEDBACK: {
                "success_factors": ["timing", "incentives", "ease_of_providing"],
                "average_success_rate": 0.55,
                "average_impact": 35,
                "optimal_timing": "post_interaction",
                "channel_preferences": ["survey", "interview", "focus_group"]
            },
            ActionType.CUSTOMIZATION: {
                "success_factors": ["understanding_needs", "technical_capability", "ongoing_support"],
                "average_success_rate": 0.58,
                "average_impact": 80,
                "optimal_timing": "advanced_usage",
                "channel_preferences": ["consultation", "implementation", "training"]
            }
        }
    
    def _initialize_customer_segments(self):
        """Initialize customer segments and their characteristics"""
        self.customer_segments = {
            "new_customers": {
                "characteristics": ["onboarding_phase", "low_feature_adoption", "high_engagement"],
                "preferred_actions": [ActionType.ONBOARDING, ActionType.TRAINING, ActionType.FEATURE_ADOPTION],
                "success_rates": {
                    ActionType.ONBOARDING: 0.85,
                    ActionType.TRAINING: 0.80,
                    ActionType.FEATURE_ADOPTION: 0.70
                },
                "optimal_timing": "early_stage",
                "channel_preferences": ["in_app", "email", "video_call"]
            },
            "active_customers": {
                "characteristics": ["high_usage", "good_engagement", "stable_health"],
                "preferred_actions": [ActionType.ENGAGEMENT, ActionType.FEATURE_ADOPTION, ActionType.COMMUNITY],
                "success_rates": {
                    ActionType.ENGAGEMENT: 0.80,
                    ActionType.FEATURE_ADOPTION: 0.75,
                    ActionType.COMMUNITY: 0.65
                },
                "optimal_timing": "regular_intervals",
                "channel_preferences": ["email", "in_app", "phone"]
            },
            "at_risk_customers": {
                "characteristics": ["declining_usage", "low_engagement", "support_issues"],
                "preferred_actions": [ActionType.RETENTION, ActionType.SUPPORT, ActionType.FEEDBACK],
                "success_rates": {
                    ActionType.RETENTION: 0.60,
                    ActionType.SUPPORT: 0.75,
                    ActionType.FEEDBACK: 0.70
                },
                "optimal_timing": "immediate",
                "channel_preferences": ["phone", "email", "chat"]
            },
            "power_users": {
                "characteristics": ["high_usage", "advanced_features", "positive_sentiment"],
                "preferred_actions": [ActionType.UPSELL, ActionType.CUSTOMIZATION, ActionType.COMMUNITY],
                "success_rates": {
                    ActionType.UPSELL: 0.55,
                    ActionType.CUSTOMIZATION: 0.70,
                    ActionType.COMMUNITY: 0.75
                },
                "optimal_timing": "success_milestones",
                "channel_preferences": ["phone", "meeting", "email"]
            },
            "enterprise_customers": {
                "characteristics": ["high_value", "complex_needs", "multiple_stakeholders"],
                "preferred_actions": [ActionType.CUSTOMIZATION, ActionType.TRAINING, ActionType.SUPPORT],
                "success_rates": {
                    ActionType.CUSTOMIZATION: 0.80,
                    ActionType.TRAINING: 0.85,
                    ActionType.SUPPORT: 0.90
                },
                "optimal_timing": "strategic_timing",
                "channel_preferences": ["meeting", "phone", "consultation"]
            }
        }
    
    def _initialize_ml_models(self):
        """Initialize ML models for predictive analytics"""
        self.ml_models = {
            "action_success_prediction": {
                "type": "classification",
                "features": ["customer_segment", "action_type", "timing", "channel", "historical_success"],
                "accuracy": 0.82
            },
            "impact_prediction": {
                "type": "regression",
                "features": ["customer_value", "action_type", "timing", "context"],
                "accuracy": 0.78
            },
            "urgency_scoring": {
                "type": "classification",
                "features": ["customer_health", "time_since_last_interaction", "risk_factors"],
                "accuracy": 0.85
            },
            "journey_optimization": {
                "type": "optimization",
                "features": ["current_stage", "customer_characteristics", "success_metrics"],
                "accuracy": 0.75
            }
        }
    
    async def generate_next_best_actions(self, customer_id: str, customer_data: Dict[str, Any]) -> List[NextBestAction]:
        """Generate next best action recommendations for a customer"""
        try:
            # Analyze customer context and needs
            customer_context = await self._analyze_customer_context(customer_id, customer_data)
            customer_segment = await self._identify_customer_segment(customer_data)
            
            # Generate action recommendations
            recommendations = []
            
            # Generate actions based on customer segment and context
            for action_type in self.customer_segments[customer_segment]["preferred_actions"]:
                action = await self._create_action_recommendation(
                    customer_id, action_type, customer_context, customer_data
                )
                if action:
                    recommendations.append(action)
            
            # Generate contextual actions based on immediate needs
            contextual_actions = await self._generate_contextual_actions(customer_id, customer_data)
            recommendations.extend(contextual_actions)
            
            # Score and rank recommendations
            scored_recommendations = await self._score_and_rank_actions(recommendations, customer_data)
            
            # Store recommendations
            for action in scored_recommendations:
                self.action_recommendations[action.action_id] = action
            
            return scored_recommendations
            
        except Exception as e:
            logging.error(f"Failed to generate next best actions for customer {customer_id}: {e}")
            return []
    
    async def _analyze_customer_context(self, customer_id: str, customer_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze customer context for action recommendations"""
        try:
            context = {
                "health_score": customer_data.get("health_score", 50),
                "engagement_level": customer_data.get("engagement_level", "medium"),
                "usage_pattern": customer_data.get("usage_pattern", "regular"),
                "support_history": customer_data.get("support_history", []),
                "interaction_history": customer_data.get("interaction_history", []),
                "preferences": customer_data.get("preferences", {}),
                "business_context": customer_data.get("business_context", {}),
                "current_goals": customer_data.get("current_goals", []),
                "pain_points": customer_data.get("pain_points", []),
                "success_metrics": customer_data.get("success_metrics", {}),
                "risk_factors": customer_data.get("risk_factors", []),
                "opportunities": customer_data.get("opportunities", [])
            }
            
            return context
            
        except Exception as e:
            logging.error(f"Failed to analyze customer context: {e}")
            return {}
    
    async def _identify_customer_segment(self, customer_data: Dict[str, Any]) -> str:
        """Identify customer segment for action targeting"""
        try:
            health_score = customer_data.get("health_score", 50)
            engagement_level = customer_data.get("engagement_level", "medium")
            usage_pattern = customer_data.get("usage_pattern", "regular")
            customer_tier = customer_data.get("customer_tier", "standard")
            tenure_days = customer_data.get("tenure_days", 0)
            
            if customer_tier == "enterprise":
                return "enterprise_customers"
            elif tenure_days < 90:
                return "new_customers"
            elif health_score < 40 or engagement_level == "low":
                return "at_risk_customers"
            elif usage_pattern == "high" and health_score > 80:
                return "power_users"
            else:
                return "active_customers"
                
        except Exception as e:
            logging.error(f"Failed to identify customer segment: {e}")
            return "active_customers"
    
    async def _create_action_recommendation(self, customer_id: str, action_type: ActionType, 
                                          customer_context: Dict[str, Any], customer_data: Dict[str, Any]) -> Optional[NextBestAction]:
        """Create action recommendation for specific action type"""
        try:
            # Get action pattern data
            action_pattern = self.action_patterns.get(action_type, {})
            customer_segment = await self._identify_customer_segment(customer_data)
            
            # Calculate confidence score
            confidence_score = await self._calculate_confidence_score(action_type, customer_context, customer_data)
            
            # Calculate expected impact
            expected_impact = await self._calculate_expected_impact(action_type, customer_context, customer_data)
            
            # Calculate success probability
            success_probability = await self._calculate_success_probability(action_type, customer_context, customer_data)
            
            # Calculate urgency score
            urgency_score = await self._calculate_urgency_score(action_type, customer_context, customer_data)
            
            # Determine priority
            priority = self._determine_priority(urgency_score, expected_impact)
            
            # Determine context
            context = self._determine_context(action_type, customer_context)
            
            # Create execution plan
            execution_plan = await self._create_execution_plan(action_type, customer_context, customer_data)
            
            # Create success metrics
            success_metrics = await self._create_success_metrics(action_type, customer_context)
            
            # Identify risk factors
            risk_factors = await self._identify_risk_factors(action_type, customer_context)
            
            # Identify dependencies
            dependencies = await self._identify_dependencies(action_type, customer_context)
            
            # Calculate estimated duration
            estimated_duration = await self._calculate_estimated_duration(action_type, customer_context)
            
            # Assign agent
            assigned_agent = await self._assign_agent_for_action(action_type, customer_context)
            
            # Determine recommended timing
            recommended_for = await self._calculate_optimal_timing(action_type, customer_context, priority)
            
            action = NextBestAction(
                action_id=str(uuid.uuid4()),
                customer_id=customer_id,
                action_type=action_type,
                priority=priority,
                context=context,
                title=f"{action_type.value.replace('_', ' ').title()} Action",
                description=f"Recommended {action_type.value} action based on customer analysis",
                confidence_score=confidence_score,
                expected_impact=expected_impact,
                success_probability=success_probability,
                urgency_score=urgency_score,
                created_at=datetime.now(),
                recommended_for=recommended_for,
                status=ActionStatus.RECOMMENDED,
                execution_plan=execution_plan,
                success_metrics=success_metrics,
                risk_factors=risk_factors,
                dependencies=dependencies,
                estimated_duration=estimated_duration,
                assigned_agent=assigned_agent,
                outcome=None,
                effectiveness_score=None
            )
            
            return action
            
        except Exception as e:
            logging.error(f"Failed to create action recommendation: {e}")
            return None
    
    async def _calculate_confidence_score(self, action_type: ActionType, customer_context: Dict[str, Any], customer_data: Dict[str, Any]) -> float:
        """Calculate confidence score for action recommendation"""
        try:
            base_confidence = 0.7
            
            # Adjust based on customer segment success rate
            customer_segment = await self._identify_customer_segment(customer_data)
            segment_data = self.customer_segments.get(customer_segment, {})
            success_rates = segment_data.get("success_rates", {})
            
            if action_type in success_rates:
                base_confidence = success_rates[action_type]
            
            # Adjust based on customer health
            health_score = customer_context.get("health_score", 50)
            health_factor = health_score / 100.0
            
            # Adjust based on engagement level
            engagement_level = customer_context.get("engagement_level", "medium")
            engagement_factors = {"high": 1.1, "medium": 1.0, "low": 0.9}
            engagement_factor = engagement_factors.get(engagement_level, 1.0)
            
            # Adjust based on historical success
            historical_success = await self._get_historical_success_rate(action_type, customer_data)
            
            final_confidence = base_confidence * health_factor * engagement_factor * historical_success
            
            return min(1.0, max(0.0, final_confidence))
            
        except Exception as e:
            logging.error(f"Failed to calculate confidence score: {e}")
            return 0.7
    
    async def _calculate_expected_impact(self, action_type: ActionType, customer_context: Dict[str, Any], customer_data: Dict[str, Any]) -> float:
        """Calculate expected impact of action"""
        try:
            # Get base impact from action patterns
            action_pattern = self.action_patterns.get(action_type, {})
            base_impact = action_pattern.get("average_impact", 50)
            
            # Adjust based on customer value
            customer_value = customer_data.get("ltv", 1000)
            value_factor = min(2.0, customer_value / 10000.0)  # Cap at 2x for high-value customers
            
            # Adjust based on current health score
            health_score = customer_context.get("health_score", 50)
            health_factor = health_score / 100.0
            
            # Adjust based on customer tier
            customer_tier = customer_data.get("customer_tier", "standard")
            tier_factors = {"enterprise": 1.5, "premium": 1.2, "standard": 1.0}
            tier_factor = tier_factors.get(customer_tier, 1.0)
            
            final_impact = base_impact * value_factor * health_factor * tier_factor
            
            return min(100.0, max(0.0, final_impact))
            
        except Exception as e:
            logging.error(f"Failed to calculate expected impact: {e}")
            return 50.0
    
    async def _calculate_success_probability(self, action_type: ActionType, customer_context: Dict[str, Any], customer_data: Dict[str, Any]) -> float:
        """Calculate success probability for action"""
        try:
            # Get base success rate from action patterns
            action_pattern = self.action_patterns.get(action_type, {})
            base_success_rate = action_pattern.get("average_success_rate", 0.7)
            
            # Adjust based on customer segment
            customer_segment = await self._identify_customer_segment(customer_data)
            segment_data = self.customer_segments.get(customer_segment, {})
            segment_success_rates = segment_data.get("success_rates", {})
            
            if action_type in segment_success_rates:
                base_success_rate = segment_success_rates[action_type]
            
            # Adjust based on timing
            timing_factor = await self._calculate_timing_factor(action_type, customer_context)
            
            # Adjust based on channel preferences
            channel_factor = await self._calculate_channel_factor(action_type, customer_context)
            
            final_probability = base_success_rate * timing_factor * channel_factor
            
            return min(1.0, max(0.0, final_probability))
            
        except Exception as e:
            logging.error(f"Failed to calculate success probability: {e}")
            return 0.7
    
    async def _calculate_urgency_score(self, action_type: ActionType, customer_context: Dict[str, Any], customer_data: Dict[str, Any]) -> float:
        """Calculate urgency score for action"""
        try:
            base_urgency = 50.0
            
            # Adjust based on customer health
            health_score = customer_context.get("health_score", 50)
            if health_score < 40:
                base_urgency += 30  # High urgency for low health
            elif health_score < 60:
                base_urgency += 15  # Medium urgency for moderate health
            
            # Adjust based on risk factors
            risk_factors = customer_context.get("risk_factors", [])
            risk_urgency = len(risk_factors) * 10
            
            # Adjust based on time since last interaction
            last_interaction = customer_data.get("last_interaction")
            if last_interaction:
                days_since = (datetime.now() - datetime.fromisoformat(last_interaction.replace('Z', '+00:00'))).days
                if days_since > 14:
                    base_urgency += 20
                elif days_since > 7:
                    base_urgency += 10
            
            # Adjust based on action type
            urgency_adjustments = {
                ActionType.RETENTION: 30,
                ActionType.SUPPORT: 25,
                ActionType.ENGAGEMENT: 15,
                ActionType.UPSELL: 5,
                ActionType.TRAINING: 0
            }
            base_urgency += urgency_adjustments.get(action_type, 0)
            
            final_urgency = base_urgency + risk_urgency
            
            return min(100.0, max(0.0, final_urgency))
            
        except Exception as e:
            logging.error(f"Failed to calculate urgency score: {e}")
            return 50.0
    
    def _determine_priority(self, urgency_score: float, expected_impact: float) -> ActionPriority:
        """Determine action priority based on urgency and impact"""
        priority_score = (urgency_score + expected_impact) / 2
        
        if priority_score >= 80:
            return ActionPriority.CRITICAL
        elif priority_score >= 65:
            return ActionPriority.HIGH
        elif priority_score >= 45:
            return ActionPriority.MEDIUM
        else:
            return ActionPriority.LOW
    
    def _determine_context(self, action_type: ActionType, customer_context: Dict[str, Any]) -> ActionContext:
        """Determine action context"""
        urgency_score = customer_context.get("urgency_score", 50)
        health_score = customer_context.get("health_score", 50)
        
        if urgency_score >= 80 or health_score < 40:
            return ActionContext.IMMEDIATE
        elif urgency_score >= 60:
            return ActionContext.TRIGGERED
        else:
            return ActionContext.SCHEDULED
    
    async def _create_execution_plan(self, action_type: ActionType, customer_context: Dict[str, Any], customer_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create execution plan for action"""
        try:
            execution_plan = {
                "steps": [],
                "resources_needed": [],
                "timeline": {},
                "success_criteria": [],
                "fallback_options": []
            }
            
            # Create steps based on action type
            if action_type == ActionType.ENGAGEMENT:
                execution_plan["steps"] = [
                    "Analyze customer preferences and interests",
                    "Create personalized engagement content",
                    "Schedule optimal delivery time",
                    "Execute engagement action",
                    "Monitor response and engagement"
                ]
            elif action_type == ActionType.RETENTION:
                execution_plan["steps"] = [
                    "Identify specific retention triggers",
                    "Prepare personalized retention offer",
                    "Schedule urgent retention call",
                    "Execute retention campaign",
                    "Monitor retention success"
                ]
            elif action_type == ActionType.UPSELL:
                execution_plan["steps"] = [
                    "Analyze upsell opportunities",
                    "Prepare value proposition",
                    "Schedule success review meeting",
                    "Present upsell proposal",
                    "Follow up on decision"
                ]
            elif action_type == ActionType.SUPPORT:
                execution_plan["steps"] = [
                    "Analyze support needs",
                    "Prepare support resources",
                    "Schedule support session",
                    "Execute support action",
                    "Monitor resolution success"
                ]
            elif action_type == ActionType.ONBOARDING:
                execution_plan["steps"] = [
                    "Assess onboarding progress",
                    "Create personalized onboarding plan",
                    "Schedule onboarding session",
                    "Execute onboarding actions",
                    "Monitor onboarding success"
                ]
            
            return execution_plan
            
        except Exception as e:
            logging.error(f"Failed to create execution plan: {e}")
            return {}
    
    async def _create_success_metrics(self, action_type: ActionType, customer_context: Dict[str, Any]) -> Dict[str, Any]:
        """Create success metrics for action"""
        try:
            success_metrics = {
                "primary_metrics": [],
                "secondary_metrics": [],
                "measurement_method": "",
                "target_values": {},
                "measurement_timeline": {}
            }
            
            if action_type == ActionType.ENGAGEMENT:
                success_metrics["primary_metrics"] = ["engagement_rate", "response_rate", "satisfaction_score"]
                success_metrics["secondary_metrics"] = ["click_through_rate", "time_spent", "feature_usage"]
            elif action_type == ActionType.RETENTION:
                success_metrics["primary_metrics"] = ["retention_rate", "churn_risk_reduction", "satisfaction_improvement"]
                success_metrics["secondary_metrics"] = ["engagement_increase", "usage_increase", "support_reduction"]
            elif action_type == ActionType.UPSELL:
                success_metrics["primary_metrics"] = ["upsell_success_rate", "revenue_increase", "customer_satisfaction"]
                success_metrics["secondary_metrics"] = ["feature_adoption", "usage_increase", "relationship_strength"]
            elif action_type == ActionType.SUPPORT:
                success_metrics["primary_metrics"] = ["resolution_rate", "response_time", "customer_satisfaction"]
                success_metrics["secondary_metrics"] = ["escalation_rate", "repeat_issues", "knowledge_transfer"]
            elif action_type == ActionType.ONBOARDING:
                success_metrics["primary_metrics"] = ["completion_rate", "time_to_value", "feature_adoption"]
                success_metrics["secondary_metrics"] = ["satisfaction_score", "retention_rate", "support_reduction"]
            
            return success_metrics
            
        except Exception as e:
            logging.error(f"Failed to create success metrics: {e}")
            return {}
    
    async def _identify_risk_factors(self, action_type: ActionType, customer_context: Dict[str, Any]) -> List[str]:
        """Identify risk factors for action"""
        try:
            risk_factors = []
            
            # Common risk factors
            if customer_context.get("health_score", 50) < 40:
                risk_factors.append("Low customer health score")
            
            if customer_context.get("engagement_level") == "low":
                risk_factors.append("Low customer engagement")
            
            # Action-specific risk factors
            if action_type == ActionType.UPSELL:
                if customer_context.get("support_history", []):
                    risk_factors.append("Recent support issues")
                if customer_context.get("usage_pattern") == "declining":
                    risk_factors.append("Declining usage pattern")
            
            elif action_type == ActionType.RETENTION:
                if customer_context.get("churn_risk", 0) > 0.8:
                    risk_factors.append("Very high churn risk")
                if customer_context.get("support_history", []):
                    risk_factors.append("Multiple support issues")
            
            return risk_factors
            
        except Exception as e:
            logging.error(f"Failed to identify risk factors: {e}")
            return []
    
    async def _identify_dependencies(self, action_type: ActionType, customer_context: Dict[str, Any]) -> List[str]:
        """Identify dependencies for action"""
        try:
            dependencies = []
            
            # Common dependencies
            dependencies.append("Customer availability")
            dependencies.append("Agent availability")
            
            # Action-specific dependencies
            if action_type == ActionType.UPSELL:
                dependencies.append("Value proposition preparation")
                dependencies.append("Pricing approval")
            
            elif action_type == ActionType.TRAINING:
                dependencies.append("Training materials")
                dependencies.append("Technical setup")
            
            elif action_type == ActionType.CUSTOMIZATION:
                dependencies.append("Technical requirements analysis")
                dependencies.append("Implementation resources")
            
            return dependencies
            
        except Exception as e:
            logging.error(f"Failed to identify dependencies: {e}")
            return []
    
    async def _calculate_estimated_duration(self, action_type: ActionType, customer_context: Dict[str, Any]) -> int:
        """Calculate estimated duration for action"""
        try:
            duration_mapping = {
                ActionType.ENGAGEMENT: 30,
                ActionType.RETENTION: 120,
                ActionType.UPSELL: 180,
                ActionType.SUPPORT: 60,
                ActionType.ONBOARDING: 240,
                ActionType.TRAINING: 90,
                ActionType.FEATURE_ADOPTION: 45,
                ActionType.COMMUNITY: 60,
                ActionType.FEEDBACK: 30,
                ActionType.CUSTOMIZATION: 480
            }
            
            base_duration = duration_mapping.get(action_type, 60)
            
            # Adjust based on customer complexity
            customer_tier = customer_context.get("customer_tier", "standard")
            if customer_tier == "enterprise":
                base_duration *= 1.5
            elif customer_tier == "premium":
                base_duration *= 1.2
            
            return int(base_duration)
            
        except Exception as e:
            logging.error(f"Failed to calculate estimated duration: {e}")
            return 60
    
    async def _assign_agent_for_action(self, action_type: ActionType, customer_context: Dict[str, Any]) -> str:
        """Assign appropriate agent for action execution"""
        try:
            agent_mapping = {
                ActionType.ENGAGEMENT: "marketing_agent",
                ActionType.RETENTION: "customer_success_agent",
                ActionType.UPSELL: "sales_agent",
                ActionType.SUPPORT: "customer_support_agent",
                ActionType.ONBOARDING: "customer_success_agent",
                ActionType.TRAINING: "training_agent",
                ActionType.FEATURE_ADOPTION: "customer_success_agent",
                ActionType.COMMUNITY: "community_agent",
                ActionType.FEEDBACK: "customer_success_agent",
                ActionType.CUSTOMIZATION: "technical_agent"
            }
            
            return agent_mapping.get(action_type, "customer_success_agent")
            
        except Exception as e:
            logging.error(f"Failed to assign agent for action: {e}")
            return "customer_success_agent"
    
    async def _calculate_optimal_timing(self, action_type: ActionType, customer_context: Dict[str, Any], priority: ActionPriority) -> datetime:
        """Calculate optimal timing for action execution"""
        try:
            now = datetime.now()
            
            # Adjust timing based on priority
            if priority == ActionPriority.CRITICAL:
                return now + timedelta(hours=1)
            elif priority == ActionPriority.HIGH:
                return now + timedelta(hours=6)
            elif priority == ActionPriority.MEDIUM:
                return now + timedelta(days=1)
            else:  # LOW
                return now + timedelta(days=3)
            
        except Exception as e:
            logging.error(f"Failed to calculate optimal timing: {e}")
            return datetime.now() + timedelta(hours=24)
    
    async def _generate_contextual_actions(self, customer_id: str, customer_data: Dict[str, Any]) -> List[NextBestAction]:
        """Generate contextual actions based on immediate customer needs"""
        try:
            contextual_actions = []
            
            # Check for immediate needs
            health_score = customer_data.get("health_score", 50)
            churn_risk = customer_data.get("churn_risk", 0)
            last_interaction = customer_data.get("last_interaction")
            
            # Generate health check action if health is low
            if health_score < 40:
                action = await self._create_action_recommendation(
                    customer_id, ActionType.SUPPORT, {}, customer_data
                )
                if action:
                    action.title = "Urgent Health Check Required"
                    action.description = "Customer health score is critically low, immediate intervention needed"
                    action.priority = ActionPriority.CRITICAL
                    contextual_actions.append(action)
            
            # Generate retention action if churn risk is high
            if churn_risk > 0.7:
                action = await self._create_action_recommendation(
                    customer_id, ActionType.RETENTION, {}, customer_data
                )
                if action:
                    action.title = "Critical Retention Action"
                    action.description = "High churn risk detected, immediate retention action required"
                    action.priority = ActionPriority.CRITICAL
                    contextual_actions.append(action)
            
            # Generate engagement action if no recent interaction
            if last_interaction:
                days_since = (datetime.now() - datetime.fromisoformat(last_interaction.replace('Z', '+00:00'))).days
                if days_since > 14:
                    action = await self._create_action_recommendation(
                        customer_id, ActionType.ENGAGEMENT, {}, customer_data
                    )
                    if action:
                        action.title = "Re-engagement Required"
                        action.description = "No interaction for 14+ days, re-engagement action needed"
                        action.priority = ActionPriority.HIGH
                        contextual_actions.append(action)
            
            return contextual_actions
            
        except Exception as e:
            logging.error(f"Failed to generate contextual actions: {e}")
            return []
    
    async def _score_and_rank_actions(self, actions: List[NextBestAction], customer_data: Dict[str, Any]) -> List[NextBestAction]:
        """Score and rank action recommendations"""
        try:
            # Calculate composite score for each action
            for action in actions:
                # Composite score = (confidence * 0.3) + (impact * 0.3) + (success_probability * 0.2) + (urgency * 0.2)
                composite_score = (
                    action.confidence_score * 0.3 +
                    action.expected_impact * 0.3 +
                    action.success_probability * 0.2 +
                    action.urgency_score * 0.2
                )
                
                # Store composite score in action data
                action.execution_plan["composite_score"] = composite_score
            
            # Sort by composite score (descending)
            ranked_actions = sorted(actions, key=lambda x: x.execution_plan.get("composite_score", 0), reverse=True)
            
            # Limit to top 5 recommendations
            return ranked_actions[:5]
            
        except Exception as e:
            logging.error(f"Failed to score and rank actions: {e}")
            return actions
    
    async def _get_historical_success_rate(self, action_type: ActionType, customer_data: Dict[str, Any]) -> float:
        """Get historical success rate for action type"""
        try:
            # In real implementation, this would query historical data
            # For now, return a default success rate
            return 0.8
            
        except Exception as e:
            logging.error(f"Failed to get historical success rate: {e}")
            return 0.8
    
    async def _calculate_timing_factor(self, action_type: ActionType, customer_context: Dict[str, Any]) -> float:
        """Calculate timing factor for action success"""
        try:
            # In real implementation, this would analyze optimal timing patterns
            # For now, return a default factor
            return 1.0
            
        except Exception as e:
            logging.error(f"Failed to calculate timing factor: {e}")
            return 1.0
    
    async def _calculate_channel_factor(self, action_type: ActionType, customer_context: Dict[str, Any]) -> float:
        """Calculate channel factor for action success"""
        try:
            # In real implementation, this would analyze channel preferences
            # For now, return a default factor
            return 1.0
            
        except Exception as e:
            logging.error(f"Failed to calculate channel factor: {e}")
            return 1.0
    
    async def optimize_customer_journey(self, customer_id: str, customer_data: Dict[str, Any]) -> JourneyOptimization:
        """Optimize customer journey for maximum success"""
        try:
            # Analyze current journey stage
            current_stage = customer_data.get("journey_stage", "onboarding")
            
            # Identify optimization opportunities
            optimization_opportunities = await self._identify_journey_optimizations(current_stage, customer_data)
            
            # Create optimization plan
            optimization = JourneyOptimization(
                optimization_id=str(uuid.uuid4()),
                customer_id=customer_id,
                journey_stage=current_stage,
                optimization_type="journey_acceleration",
                current_metrics=customer_data.get("journey_metrics", {}),
                target_metrics=optimization_opportunities["target_metrics"],
                recommended_actions=optimization_opportunities["recommended_actions"],
                expected_improvement=optimization_opportunities["expected_improvement"],
                implementation_plan=optimization_opportunities["implementation_plan"],
                success_criteria=optimization_opportunities["success_criteria"]
            )
            
            # Store optimization
            self.journey_optimizations[optimization.optimization_id] = optimization
            
            return optimization
            
        except Exception as e:
            logging.error(f"Failed to optimize customer journey: {e}")
            raise
    
    async def _identify_journey_optimizations(self, current_stage: str, customer_data: Dict[str, Any]) -> Dict[str, Any]:
        """Identify journey optimization opportunities"""
        try:
            optimization_opportunities = {
                "target_metrics": {},
                "recommended_actions": [],
                "expected_improvement": 0.0,
                "implementation_plan": {},
                "success_criteria": {}
            }
            
            # Stage-specific optimizations
            if current_stage == "onboarding":
                optimization_opportunities["target_metrics"] = {
                    "time_to_first_value": 24,  # hours
                    "feature_adoption_rate": 0.6,
                    "satisfaction_score": 8.5
                }
                optimization_opportunities["recommended_actions"] = [
                    "Accelerate onboarding process",
                    "Provide personalized training",
                    "Assign dedicated success manager"
                ]
                optimization_opportunities["expected_improvement"] = 25.0
            
            elif current_stage == "adoption":
                optimization_opportunities["target_metrics"] = {
                    "feature_usage": 0.8,
                    "engagement_score": 85,
                    "retention_rate": 0.95
                }
                optimization_opportunities["recommended_actions"] = [
                    "Increase feature adoption",
                    "Provide advanced training",
                    "Connect with power users"
                ]
                optimization_opportunities["expected_improvement"] = 20.0
            
            elif current_stage == "expansion":
                optimization_opportunities["target_metrics"] = {
                    "upsell_rate": 0.3,
                    "customer_satisfaction": 9.0,
                    "referral_rate": 0.2
                }
                optimization_opportunities["recommended_actions"] = [
                    "Identify upsell opportunities",
                    "Provide premium features",
                    "Encourage referrals"
                ]
                optimization_opportunities["expected_improvement"] = 30.0
            
            return optimization_opportunities
            
        except Exception as e:
            logging.error(f"Failed to identify journey optimizations: {e}")
            return {}
    
    async def get_action_analytics(self) -> Dict[str, Any]:
        """Get action engine analytics"""
        try:
            total_actions = len(self.action_history)
            completed_actions = len([a for a in self.action_history if a.status == ActionStatus.COMPLETED])
            
            # Calculate success rates by action type
            success_rates = {}
            for action_type in ActionType:
                type_actions = [a for a in self.action_history if a.action_type == action_type]
                if type_actions:
                    successful = len([a for a in type_actions if a.effectiveness_score and a.effectiveness_score > 0.7])
                    success_rates[action_type.value] = successful / len(type_actions)
            
            # Calculate average effectiveness
            effectiveness_scores = [a.effectiveness_score for a in self.action_history if a.effectiveness_score]
            avg_effectiveness = sum(effectiveness_scores) / len(effectiveness_scores) if effectiveness_scores else 0
            
            return {
                "total_actions": total_actions,
                "completed_actions": completed_actions,
                "active_recommendations": len(self.action_recommendations),
                "success_rates_by_type": success_rates,
                "average_effectiveness": avg_effectiveness,
                "journey_optimizations": len(self.journey_optimizations),
                "last_updated": datetime.now().isoformat()
            }
            
        except Exception as e:
            logging.error(f"Failed to get action analytics: {e}")
            return {}

# Global predictive action engine instance
predictive_action_engine = PredictiveActionEngine()

# Convenience functions
async def generate_next_best_actions(customer_id: str, customer_data: Dict[str, Any]) -> List[NextBestAction]:
    """Generate next best action recommendations"""
    return await predictive_action_engine.generate_next_best_actions(customer_id, customer_data)

async def optimize_customer_journey(customer_id: str, customer_data: Dict[str, Any]) -> JourneyOptimization:
    """Optimize customer journey"""
    return await predictive_action_engine.optimize_customer_journey(customer_id, customer_data)

def get_action_analytics() -> Dict[str, Any]:
    """Get action engine analytics"""
    return predictive_action_engine.get_action_analytics()
