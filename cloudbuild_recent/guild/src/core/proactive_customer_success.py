"""
Proactive Customer Success System for Guild-AI
Provides autonomous customer success management with predictive intervention and self-executing retention campaigns.
"""

import asyncio
import json
import logging
from typing import Dict, List, Any, Optional, Union
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from enum import Enum
import uuid

class InterventionType(Enum):
    """Types of proactive customer interventions"""
    HEALTH_CHECK = "health_check"
    ENGAGEMENT_BOOST = "engagement_boost"
    SUCCESS_COACHING = "success_coaching"
    FEATURE_ADOPTION = "feature_adoption"
    RETENTION_CAMPAIGN = "retention_campaign"
    WIN_BACK = "win_back"
    UPSEL_OPPORTUNITY = "upsell_opportunity"
    SUPPORT_PROACTIVE = "support_proactive"
    ONBOARDING_ACCELERATION = "onboarding_acceleration"
    SUCCESS_MILESTONE = "success_milestone"

class InterventionPriority(Enum):
    """Priority levels for interventions"""
    CRITICAL = "critical"  # Immediate action required
    HIGH = "high"         # Within 24 hours
    MEDIUM = "medium"     # Within 3 days
    LOW = "low"          # Within 1 week

class InterventionStatus(Enum):
    """Status of interventions"""
    PLANNED = "planned"
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

@dataclass
class CustomerIntervention:
    """Proactive customer intervention"""
    intervention_id: str
    customer_id: str
    intervention_type: InterventionType
    priority: InterventionPriority
    status: InterventionStatus
    trigger_reason: str
    predicted_impact: float  # 0-100
    success_probability: float  # 0-1
    created_at: datetime
    scheduled_for: Optional[datetime]
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    action_plan: Dict[str, Any]
    execution_steps: List[Dict[str, Any]]
    success_metrics: Dict[str, Any]
    outcome: Optional[str]
    effectiveness_score: Optional[float]

@dataclass
class RetentionCampaign:
    """Automated retention campaign"""
    campaign_id: str
    customer_id: str
    campaign_type: str
    trigger_condition: str
    status: str
    created_at: datetime
    scheduled_execution: datetime
    execution_steps: List[Dict[str, Any]]
    success_criteria: Dict[str, Any]
    results: Optional[Dict[str, Any]]

class ProactiveCustomerSuccess:
    """
    Autonomous customer success management system with predictive intervention.
    """
    
    def __init__(self):
        self.active_interventions: Dict[str, CustomerIntervention] = {}
        self.intervention_history: List[CustomerIntervention] = []
        self.retention_campaigns: Dict[str, RetentionCampaign] = {}
        self.success_patterns: Dict[str, Any] = {}
        self.intervention_rules: List[Dict[str, Any]] = []
        
        # Initialize intervention rules
        self._initialize_intervention_rules()
        
        # Initialize success patterns
        self._initialize_success_patterns()
    
    def _initialize_intervention_rules(self):
        """Initialize rules for proactive interventions"""
        self.intervention_rules = [
            {
                "trigger_condition": "health_score < 60",
                "intervention_type": InterventionType.HEALTH_CHECK,
                "priority": InterventionPriority.HIGH,
                "action_plan": {
                    "immediate_actions": [
                        "Schedule customer success call within 24 hours",
                        "Review customer usage patterns and identify issues",
                        "Prepare personalized success recommendations"
                    ],
                    "follow_up_actions": [
                        "Send success coaching resources",
                        "Assign dedicated success manager",
                        "Create custom success plan"
                    ]
                },
                "success_metrics": {
                    "health_score_improvement": 15,
                    "engagement_increase": 0.3,
                    "satisfaction_improvement": 0.2
                }
            },
            {
                "trigger_condition": "engagement_score < 40",
                "intervention_type": InterventionType.ENGAGEMENT_BOOST,
                "priority": InterventionPriority.MEDIUM,
                "action_plan": {
                    "immediate_actions": [
                        "Send personalized engagement email with value proposition",
                        "Share relevant success stories and case studies",
                        "Offer personalized demo of unused features"
                    ],
                    "follow_up_actions": [
                        "Create engagement challenge with rewards",
                        "Invite to customer community and events",
                        "Provide exclusive content and resources"
                    ]
                },
                "success_metrics": {
                    "engagement_score_improvement": 25,
                    "feature_adoption_increase": 0.4,
                    "session_frequency_increase": 0.5
                }
            },
            {
                "trigger_condition": "churn_risk > 0.7",
                "intervention_type": InterventionType.RETENTION_CAMPAIGN,
                "priority": InterventionPriority.CRITICAL,
                "action_plan": {
                    "immediate_actions": [
                        "Schedule urgent executive call within 4 hours",
                        "Prepare retention offer and incentive package",
                        "Assign senior success manager"
                    ],
                    "follow_up_actions": [
                        "Implement win-back campaign",
                        "Provide personalized success roadmap",
                        "Offer extended trial or discount"
                    ]
                },
                "success_metrics": {
                    "churn_risk_reduction": 0.5,
                    "retention_probability_increase": 0.4,
                    "customer_satisfaction_improvement": 0.3
                }
            },
            {
                "trigger_condition": "days_since_last_interaction > 14",
                "intervention_type": InterventionType.ENGAGEMENT_BOOST,
                "priority": InterventionPriority.MEDIUM,
                "action_plan": {
                    "immediate_actions": [
                        "Send re-engagement email with personalized content",
                        "Share product updates and new features",
                        "Invite to upcoming webinar or training"
                    ],
                    "follow_up_actions": [
                        "Schedule check-in call",
                        "Provide usage optimization tips",
                        "Offer personalized onboarding refresh"
                    ]
                },
                "success_metrics": {
                    "interaction_resumption": True,
                    "engagement_score_improvement": 20,
                    "feature_usage_increase": 0.3
                }
            },
            {
                "trigger_condition": "feature_adoption_rate < 0.3",
                "intervention_type": InterventionType.FEATURE_ADOPTION,
                "priority": InterventionPriority.MEDIUM,
                "action_plan": {
                    "immediate_actions": [
                        "Send feature discovery email with tutorials",
                        "Schedule personalized feature demo",
                        "Provide step-by-step adoption guide"
                    ],
                    "follow_up_actions": [
                        "Create feature adoption challenge",
                        "Offer feature-specific training session",
                        "Provide success metrics and ROI examples"
                    ]
                },
                "success_metrics": {
                    "feature_adoption_increase": 0.6,
                    "user_productivity_improvement": 0.4,
                    "satisfaction_score_increase": 0.25
                }
            },
            {
                "trigger_condition": "upsell_opportunity_score > 0.8",
                "intervention_type": InterventionType.UPSEL_OPPORTUNITY,
                "priority": InterventionPriority.LOW,
                "action_plan": {
                    "immediate_actions": [
                        "Schedule success review call",
                        "Prepare upgrade proposal with ROI analysis",
                        "Identify specific value-add opportunities"
                    ],
                    "follow_up_actions": [
                        "Present personalized upgrade path",
                        "Offer trial of premium features",
                        "Provide case studies of similar upgrades"
                    ]
                },
                "success_metrics": {
                    "upsell_probability": 0.7,
                    "revenue_increase": 0.5,
                    "customer_satisfaction_maintenance": 0.9
                }
            }
        ]
    
    def _initialize_success_patterns(self):
        """Initialize success patterns for intervention optimization"""
        self.success_patterns = {
            "high_value_customers": {
                "characteristics": ["high_ltv", "enterprise_tier", "long_tenure"],
                "preferred_interventions": [InterventionType.SUCCESS_COACHING, InterventionType.UPSEL_OPPORTUNITY],
                "success_rate": 0.85
            },
            "new_customers": {
                "characteristics": ["onboarding_phase", "low_feature_adoption", "high_churn_risk"],
                "preferred_interventions": [InterventionType.ONBOARDING_ACCELERATION, InterventionType.FEATURE_ADOPTION],
                "success_rate": 0.75
            },
            "at_risk_customers": {
                "characteristics": ["low_engagement", "support_issues", "usage_decline"],
                "preferred_interventions": [InterventionType.RETENTION_CAMPAIGN, InterventionType.HEALTH_CHECK],
                "success_rate": 0.65
            },
            "power_users": {
                "characteristics": ["high_usage", "feature_adoption", "positive_sentiment"],
                "preferred_interventions": [InterventionType.SUCCESS_MILESTONE, InterventionType.UPSEL_OPPORTUNITY],
                "success_rate": 0.90
            }
        }
    
    async def analyze_customer_for_interventions(self, customer_id: str, customer_data: Dict[str, Any]) -> List[CustomerIntervention]:
        """Analyze customer data and generate proactive interventions"""
        try:
            interventions = []
            
            # Check each intervention rule
            for rule in self.intervention_rules:
                if await self._evaluate_trigger_condition(rule["trigger_condition"], customer_data):
                    # Check if intervention already exists
                    existing_intervention = self._find_existing_intervention(customer_id, rule["intervention_type"])
                    
                    if not existing_intervention:
                        intervention = await self._create_intervention(customer_id, rule, customer_data)
                        interventions.append(intervention)
            
            # Store interventions
            for intervention in interventions:
                self.active_interventions[intervention.intervention_id] = intervention
            
            return interventions
            
        except Exception as e:
            logging.error(f"Failed to analyze customer for interventions: {e}")
            return []
    
    async def _evaluate_trigger_condition(self, condition: str, customer_data: Dict[str, Any]) -> bool:
        """Evaluate trigger condition against customer data"""
        try:
            # Simple condition evaluation (in real implementation, use proper expression evaluator)
            if "health_score < 60" in condition:
                health_score = customer_data.get("health_score", 100)
                return health_score < 60
            elif "engagement_score < 40" in condition:
                engagement_score = customer_data.get("engagement_score", 100)
                return engagement_score < 40
            elif "churn_risk > 0.7" in condition:
                churn_risk = customer_data.get("churn_risk", 0)
                return churn_risk > 0.7
            elif "days_since_last_interaction > 14" in condition:
                last_interaction = customer_data.get("last_interaction")
                if last_interaction:
                    days_since = (datetime.now() - datetime.fromisoformat(last_interaction.replace('Z', '+00:00'))).days
                    return days_since > 14
            elif "feature_adoption_rate < 0.3" in condition:
                adoption_rate = customer_data.get("feature_adoption_rate", 1.0)
                return adoption_rate < 0.3
            elif "upsell_opportunity_score > 0.8" in condition:
                upsell_score = customer_data.get("upsell_opportunity_score", 0)
                return upsell_score > 0.8
            
            return False
            
        except Exception as e:
            logging.error(f"Failed to evaluate trigger condition: {e}")
            return False
    
    def _find_existing_intervention(self, customer_id: str, intervention_type: InterventionType) -> Optional[CustomerIntervention]:
        """Find existing intervention for customer and type"""
        for intervention in self.active_interventions.values():
            if (intervention.customer_id == customer_id and 
                intervention.intervention_type == intervention_type and
                intervention.status in [InterventionStatus.PLANNED, InterventionStatus.SCHEDULED, InterventionStatus.IN_PROGRESS]):
                return intervention
        return None
    
    async def _create_intervention(self, customer_id: str, rule: Dict[str, Any], customer_data: Dict[str, Any]) -> CustomerIntervention:
        """Create new intervention based on rule and customer data"""
        try:
            # Calculate predicted impact and success probability
            predicted_impact = await self._calculate_predicted_impact(rule, customer_data)
            success_probability = await self._calculate_success_probability(rule, customer_data)
            
            # Create execution steps
            execution_steps = await self._create_execution_steps(rule["action_plan"], customer_data)
            
            # Schedule intervention
            scheduled_time = self._calculate_optimal_schedule_time(rule["priority"])
            
            intervention = CustomerIntervention(
                intervention_id=str(uuid.uuid4()),
                customer_id=customer_id,
                intervention_type=rule["intervention_type"],
                priority=rule["priority"],
                status=InterventionStatus.PLANNED,
                trigger_reason=rule["trigger_condition"],
                predicted_impact=predicted_impact,
                success_probability=success_probability,
                created_at=datetime.now(),
                scheduled_for=scheduled_time,
                started_at=None,
                completed_at=None,
                action_plan=rule["action_plan"],
                execution_steps=execution_steps,
                success_metrics=rule["success_metrics"],
                outcome=None,
                effectiveness_score=None
            )
            
            return intervention
            
        except Exception as e:
            logging.error(f"Failed to create intervention: {e}")
            raise
    
    async def _calculate_predicted_impact(self, rule: Dict[str, Any], customer_data: Dict[str, Any]) -> float:
        """Calculate predicted impact of intervention"""
        try:
            base_impact = 50.0  # Base impact score
            
            # Adjust based on customer characteristics
            if customer_data.get("customer_tier") == "enterprise":
                base_impact += 20
            elif customer_data.get("customer_tier") == "premium":
                base_impact += 10
            
            # Adjust based on intervention type
            intervention_type = rule["intervention_type"]
            if intervention_type == InterventionType.RETENTION_CAMPAIGN:
                base_impact += 30
            elif intervention_type == InterventionType.HEALTH_CHECK:
                base_impact += 25
            elif intervention_type == InterventionType.ENGAGEMENT_BOOST:
                base_impact += 15
            
            return min(100.0, base_impact)
            
        except Exception as e:
            logging.error(f"Failed to calculate predicted impact: {e}")
            return 50.0
    
    async def _calculate_success_probability(self, rule: Dict[str, Any], customer_data: Dict[str, Any]) -> float:
        """Calculate success probability of intervention"""
        try:
            base_probability = 0.7  # Base success rate
            
            # Adjust based on customer segment
            customer_segment = self._identify_customer_segment(customer_data)
            if customer_segment in self.success_patterns:
                segment_data = self.success_patterns[customer_segment]
                base_probability = segment_data["success_rate"]
            
            # Adjust based on intervention timing
            if rule["priority"] == InterventionPriority.CRITICAL:
                base_probability -= 0.1  # Higher risk for critical interventions
            elif rule["priority"] == InterventionPriority.LOW:
                base_probability += 0.1  # Lower risk for low priority
            
            return max(0.0, min(1.0, base_probability))
            
        except Exception as e:
            logging.error(f"Failed to calculate success probability: {e}")
            return 0.7
    
    def _identify_customer_segment(self, customer_data: Dict[str, Any]) -> str:
        """Identify customer segment for success pattern matching"""
        try:
            ltv = customer_data.get("ltv", 0)
            tenure_days = customer_data.get("tenure_days", 0)
            engagement_score = customer_data.get("engagement_score", 0)
            churn_risk = customer_data.get("churn_risk", 0)
            
            if ltv > 50000 and tenure_days > 365:
                return "high_value_customers"
            elif tenure_days < 90:
                return "new_customers"
            elif churn_risk > 0.6 or engagement_score < 50:
                return "at_risk_customers"
            elif engagement_score > 80 and customer_data.get("feature_adoption_rate", 0) > 0.7:
                return "power_users"
            else:
                return "standard_customers"
                
        except Exception as e:
            logging.error(f"Failed to identify customer segment: {e}")
            return "standard_customers"
    
    async def _create_execution_steps(self, action_plan: Dict[str, Any], customer_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Create detailed execution steps for intervention"""
        try:
            steps = []
            
            # Immediate actions
            for i, action in enumerate(action_plan.get("immediate_actions", [])):
                steps.append({
                    "step_id": f"immediate_{i}",
                    "step_type": "immediate",
                    "action": action,
                    "scheduled_for": datetime.now() + timedelta(hours=i),
                    "status": "pending",
                    "assigned_agent": self._assign_agent_for_action(action),
                    "estimated_duration": 60  # minutes
                })
            
            # Follow-up actions
            for i, action in enumerate(action_plan.get("follow_up_actions", [])):
                steps.append({
                    "step_id": f"followup_{i}",
                    "step_type": "follow_up",
                    "action": action,
                    "scheduled_for": datetime.now() + timedelta(days=i+1),
                    "status": "pending",
                    "assigned_agent": self._assign_agent_for_action(action),
                    "estimated_duration": 30  # minutes
                })
            
            return steps
            
        except Exception as e:
            logging.error(f"Failed to create execution steps: {e}")
            return []
    
    def _assign_agent_for_action(self, action: str) -> str:
        """Assign appropriate agent for action execution"""
        if "call" in action.lower() or "meeting" in action.lower():
            return "customer_success_agent"
        elif "email" in action.lower() or "send" in action.lower():
            return "marketing_agent"
        elif "demo" in action.lower() or "training" in action.lower():
            return "training_agent"
        elif "offer" in action.lower() or "discount" in action.lower():
            return "pricing_agent"
        else:
            return "customer_success_agent"
    
    def _calculate_optimal_schedule_time(self, priority: InterventionPriority) -> datetime:
        """Calculate optimal schedule time based on priority"""
        now = datetime.now()
        
        if priority == InterventionPriority.CRITICAL:
            return now + timedelta(hours=2)
        elif priority == InterventionPriority.HIGH:
            return now + timedelta(hours=12)
        elif priority == InterventionPriority.MEDIUM:
            return now + timedelta(days=1)
        else:  # LOW
            return now + timedelta(days=3)
    
    async def execute_intervention(self, intervention_id: str) -> Dict[str, Any]:
        """Execute a customer intervention"""
        try:
            intervention = self.active_interventions.get(intervention_id)
            if not intervention:
                return {"error": "Intervention not found"}
            
            intervention.status = InterventionStatus.IN_PROGRESS
            intervention.started_at = datetime.now()
            
            results = {
                "intervention_id": intervention_id,
                "status": "in_progress",
                "executed_steps": [],
                "success_metrics": {},
                "outcome": None
            }
            
            # Execute each step
            for step in intervention.execution_steps:
                step_result = await self._execute_step(step, intervention)
                results["executed_steps"].append(step_result)
                
                # Update step status
                step["status"] = "completed" if step_result["success"] else "failed"
            
            # Calculate overall effectiveness
            effectiveness_score = await self._calculate_effectiveness(intervention, results)
            intervention.effectiveness_score = effectiveness_score
            intervention.completed_at = datetime.now()
            intervention.status = InterventionStatus.COMPLETED
            
            # Move to history
            self.intervention_history.append(intervention)
            del self.active_interventions[intervention_id]
            
            results["effectiveness_score"] = effectiveness_score
            results["outcome"] = "success" if effectiveness_score > 0.7 else "partial" if effectiveness_score > 0.4 else "failed"
            
            return results
            
        except Exception as e:
            logging.error(f"Failed to execute intervention {intervention_id}: {e}")
            return {"error": str(e)}
    
    async def _execute_step(self, step: Dict[str, Any], intervention: CustomerIntervention) -> Dict[str, Any]:
        """Execute a single intervention step"""
        try:
            # Simulate step execution (in real implementation, this would call appropriate agents)
            await asyncio.sleep(0.1)  # Simulate execution time
            
            # Simulate success/failure based on success probability
            success = intervention.success_probability > 0.5
            
            return {
                "step_id": step["step_id"],
                "action": step["action"],
                "success": success,
                "execution_time": datetime.now().isoformat(),
                "result": f"Successfully executed: {step['action']}" if success else f"Failed to execute: {step['action']}"
            }
            
        except Exception as e:
            logging.error(f"Failed to execute step: {e}")
            return {
                "step_id": step["step_id"],
                "action": step["action"],
                "success": False,
                "execution_time": datetime.now().isoformat(),
                "result": f"Error executing step: {str(e)}"
            }
    
    async def _calculate_effectiveness(self, intervention: CustomerIntervention, results: Dict[str, Any]) -> float:
        """Calculate intervention effectiveness score"""
        try:
            # Base effectiveness on executed steps
            total_steps = len(results["executed_steps"])
            successful_steps = sum(1 for step in results["executed_steps"] if step["success"])
            
            step_effectiveness = successful_steps / total_steps if total_steps > 0 else 0
            
            # Adjust based on intervention type and customer characteristics
            type_multiplier = {
                InterventionType.RETENTION_CAMPAIGN: 1.2,
                InterventionType.HEALTH_CHECK: 1.1,
                InterventionType.ENGAGEMENT_BOOST: 1.0,
                InterventionType.FEATURE_ADOPTION: 0.9,
                InterventionType.UPSEL_OPPORTUNITY: 0.8
            }.get(intervention.intervention_type, 1.0)
            
            effectiveness = step_effectiveness * type_multiplier
            
            return min(1.0, max(0.0, effectiveness))
            
        except Exception as e:
            logging.error(f"Failed to calculate effectiveness: {e}")
            return 0.5
    
    async def get_active_interventions(self, customer_id: Optional[str] = None) -> List[CustomerIntervention]:
        """Get active interventions"""
        if customer_id:
            return [intervention for intervention in self.active_interventions.values() 
                   if intervention.customer_id == customer_id]
        else:
            return list(self.active_interventions.values())
    
    async def get_intervention_analytics(self) -> Dict[str, Any]:
        """Get intervention analytics and performance metrics"""
        try:
            total_interventions = len(self.intervention_history)
            completed_interventions = len([i for i in self.intervention_history if i.status == InterventionStatus.COMPLETED])
            
            # Calculate success rates by type
            success_rates = {}
            for intervention_type in InterventionType:
                type_interventions = [i for i in self.intervention_history if i.intervention_type == intervention_type]
                if type_interventions:
                    successful = len([i for i in type_interventions if i.effectiveness_score and i.effectiveness_score > 0.7])
                    success_rates[intervention_type.value] = successful / len(type_interventions)
            
            # Calculate average effectiveness
            effectiveness_scores = [i.effectiveness_score for i in self.intervention_history if i.effectiveness_score]
            avg_effectiveness = sum(effectiveness_scores) / len(effectiveness_scores) if effectiveness_scores else 0
            
            return {
                "total_interventions": total_interventions,
                "completed_interventions": completed_interventions,
                "active_interventions": len(self.active_interventions),
                "success_rates_by_type": success_rates,
                "average_effectiveness": avg_effectiveness,
                "intervention_distribution": {
                    intervention_type.value: len([i for i in self.intervention_history if i.intervention_type == intervention_type])
                    for intervention_type in InterventionType
                },
                "last_updated": datetime.now().isoformat()
            }
            
        except Exception as e:
            logging.error(f"Failed to get intervention analytics: {e}")
            return {}

# Global proactive customer success instance
proactive_customer_success = ProactiveCustomerSuccess()

# Convenience functions
async def analyze_customer_for_interventions(customer_id: str, customer_data: Dict[str, Any]) -> List[CustomerIntervention]:
    """Analyze customer for proactive interventions"""
    return await proactive_customer_success.analyze_customer_for_interventions(customer_id, customer_data)

async def execute_customer_intervention(intervention_id: str) -> Dict[str, Any]:
    """Execute customer intervention"""
    return await proactive_customer_success.execute_intervention(intervention_id)

async def get_active_customer_interventions(customer_id: Optional[str] = None) -> List[CustomerIntervention]:
    """Get active customer interventions"""
    return await proactive_customer_success.get_active_interventions(customer_id)

def get_intervention_analytics() -> Dict[str, Any]:
    """Get intervention analytics"""
    return proactive_customer_success.get_intervention_analytics()
