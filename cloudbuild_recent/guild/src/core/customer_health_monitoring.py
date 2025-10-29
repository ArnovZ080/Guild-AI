"""
Customer Health Monitoring System for Guild-AI
Provides real-time customer health scoring, alerts, and proactive management.
"""

import asyncio
import json
import logging
from typing import Dict, List, Any, Optional, Union
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from enum import Enum
import uuid

class HealthStatus(Enum):
    """Customer health status levels"""
    CRITICAL = "critical"
    AT_RISK = "at_risk"
    WARNING = "warning"
    HEALTHY = "healthy"
    EXCELLENT = "excellent"

class AlertType(Enum):
    """Types of customer health alerts"""
    CHURN_RISK = "churn_risk"
    ENGAGEMENT_DROP = "engagement_drop"
    SUPPORT_ESCALATION = "support_escalation"
    PAYMENT_ISSUE = "payment_issue"
    SATISFACTION_DROP = "satisfaction_drop"
    USAGE_DECLINE = "usage_decline"
    COMMUNICATION_GAP = "communication_gap"

@dataclass
class HealthMetric:
    """Individual health metric"""
    metric_name: str
    value: float
    weight: float
    status: HealthStatus
    trend: str  # "up", "down", "stable"
    last_updated: datetime
    threshold_warning: float
    threshold_critical: float

@dataclass
class CustomerHealthScore:
    """Comprehensive customer health score"""
    customer_id: str
    overall_score: float  # 0-100
    health_status: HealthStatus
    individual_metrics: List[HealthMetric]
    risk_factors: List[str]
    positive_indicators: List[str]
    recommendations: List[str]
    last_calculated: datetime
    confidence_level: float  # 0-1

@dataclass
class HealthAlert:
    """Customer health alert"""
    alert_id: str
    customer_id: str
    alert_type: AlertType
    severity: str  # "low", "medium", "high", "critical"
    title: str
    description: str
    triggered_at: datetime
    resolved_at: Optional[datetime]
    resolved_by: Optional[str]
    action_required: str
    auto_resolved: bool

class CustomerHealthMonitor:
    """
    Real-time customer health monitoring and alerting system.
    """
    
    def __init__(self):
        self.health_scores: Dict[str, CustomerHealthScore] = {}
        self.active_alerts: List[HealthAlert] = []
        self.health_history: Dict[str, List[CustomerHealthScore]] = {}
        self.alert_rules: List[Dict[str, Any]] = []
        
        # Initialize default health metrics
        self.default_metrics = self._initialize_default_metrics()
        
        # Initialize alert rules
        self._initialize_alert_rules()
    
    def _initialize_default_metrics(self) -> Dict[str, Dict[str, Any]]:
        """Initialize default health metrics and their configurations"""
        return {
            "engagement_score": {
                "weight": 0.25,
                "threshold_warning": 60.0,
                "threshold_critical": 30.0,
                "calculation_method": "weighted_engagement"
            },
            "satisfaction_score": {
                "weight": 0.20,
                "threshold_warning": 70.0,
                "threshold_critical": 50.0,
                "calculation_method": "survey_feedback"
            },
            "usage_frequency": {
                "weight": 0.20,
                "threshold_warning": 0.5,  # 50% of baseline
                "threshold_critical": 0.3,  # 30% of baseline
                "calculation_method": "usage_analytics"
            },
            "support_interactions": {
                "weight": 0.15,
                "threshold_warning": 3.0,  # 3 support tickets
                "threshold_critical": 5.0,  # 5 support tickets
                "calculation_method": "support_ticket_analysis"
            },
            "payment_health": {
                "weight": 0.10,
                "threshold_warning": 1.0,  # 1 payment issue
                "threshold_critical": 2.0,  # 2 payment issues
                "calculation_method": "payment_history"
            },
            "communication_response": {
                "weight": 0.10,
                "threshold_warning": 0.7,  # 70% response rate
                "threshold_critical": 0.5,  # 50% response rate
                "calculation_method": "communication_analysis"
            }
        }
    
    def _initialize_alert_rules(self):
        """Initialize alert rules for different health scenarios"""
        self.alert_rules = [
            {
                "alert_type": AlertType.CHURN_RISK,
                "condition": "overall_score < 40",
                "severity": "high",
                "title": "High Churn Risk Detected",
                "description": "Customer health score indicates high risk of churn",
                "action_required": "Immediate intervention required - contact customer success team"
            },
            {
                "alert_type": AlertType.ENGAGEMENT_DROP,
                "condition": "engagement_score < 30",
                "severity": "medium",
                "title": "Engagement Drop Detected",
                "description": "Customer engagement has significantly decreased",
                "action_required": "Review engagement strategy and reach out to customer"
            },
            {
                "alert_type": AlertType.SUPPORT_ESCALATION,
                "condition": "support_interactions > 5",
                "severity": "medium",
                "title": "Support Escalation Needed",
                "description": "Customer has multiple unresolved support issues",
                "action_required": "Escalate to senior support and customer success"
            },
            {
                "alert_type": AlertType.PAYMENT_ISSUE,
                "condition": "payment_health > 2",
                "severity": "high",
                "title": "Payment Issues Detected",
                "description": "Customer experiencing payment problems",
                "action_required": "Contact billing team and offer payment assistance"
            },
            {
                "alert_type": AlertType.SATISFACTION_DROP,
                "condition": "satisfaction_score < 50",
                "severity": "medium",
                "title": "Customer Satisfaction Drop",
                "description": "Customer satisfaction scores have declined",
                "action_required": "Schedule check-in call and gather feedback"
            },
            {
                "alert_type": AlertType.USAGE_DECLINE,
                "condition": "usage_frequency < 0.3",
                "severity": "medium",
                "title": "Usage Decline Detected",
                "description": "Customer usage has significantly decreased",
                "action_required": "Provide training and identify usage barriers"
            },
            {
                "alert_type": AlertType.COMMUNICATION_GAP,
                "condition": "communication_response < 0.5",
                "severity": "low",
                "title": "Communication Gap",
                "description": "Customer not responding to communications",
                "action_required": "Try alternative communication channels"
            }
        ]
    
    async def calculate_customer_health(self, customer_id: str, customer_data: Dict[str, Any]) -> CustomerHealthScore:
        """Calculate comprehensive health score for a customer"""
        try:
            # Calculate individual metrics
            metrics = []
            total_weighted_score = 0.0
            total_weight = 0.0
            
            for metric_name, config in self.default_metrics.items():
                metric_value = await self._calculate_metric(metric_name, customer_data, config)
                
                # Determine status based on thresholds
                if metric_value <= config["threshold_critical"]:
                    status = HealthStatus.CRITICAL
                elif metric_value <= config["threshold_warning"]:
                    status = HealthStatus.WARNING
                else:
                    status = HealthStatus.HEALTHY
                
                # Calculate trend (simplified - would use historical data in real implementation)
                trend = await self._calculate_metric_trend(customer_id, metric_name, metric_value)
                
                metric = HealthMetric(
                    metric_name=metric_name,
                    value=metric_value,
                    weight=config["weight"],
                    status=status,
                    trend=trend,
                    last_updated=datetime.now(),
                    threshold_warning=config["threshold_warning"],
                    threshold_critical=config["threshold_critical"]
                )
                
                metrics.append(metric)
                total_weighted_score += metric_value * config["weight"]
                total_weight += config["weight"]
            
            # Calculate overall health score
            overall_score = total_weighted_score / total_weight if total_weight > 0 else 0
            
            # Determine overall health status
            if overall_score >= 80:
                health_status = HealthStatus.EXCELLENT
            elif overall_score >= 65:
                health_status = HealthStatus.HEALTHY
            elif overall_score >= 50:
                health_status = HealthStatus.WARNING
            elif overall_score >= 30:
                health_status = HealthStatus.AT_RISK
            else:
                health_status = HealthStatus.CRITICAL
            
            # Identify risk factors and positive indicators
            risk_factors = await self._identify_risk_factors(metrics, customer_data)
            positive_indicators = await self._identify_positive_indicators(metrics, customer_data)
            
            # Generate recommendations
            recommendations = await self._generate_health_recommendations(metrics, risk_factors, customer_data)
            
            # Calculate confidence level (based on data completeness)
            confidence_level = await self._calculate_confidence_level(customer_data)
            
            health_score = CustomerHealthScore(
                customer_id=customer_id,
                overall_score=overall_score,
                health_status=health_status,
                individual_metrics=metrics,
                risk_factors=risk_factors,
                positive_indicators=positive_indicators,
                recommendations=recommendations,
                last_calculated=datetime.now(),
                confidence_level=confidence_level
            )
            
            # Store health score
            self.health_scores[customer_id] = health_score
            
            # Store in history
            if customer_id not in self.health_history:
                self.health_history[customer_id] = []
            self.health_history[customer_id].append(health_score)
            
            # Check for alerts
            await self._check_health_alerts(health_score)
            
            return health_score
            
        except Exception as e:
            logging.error(f"Failed to calculate customer health for {customer_id}: {e}")
            raise
    
    async def _calculate_metric(self, metric_name: str, customer_data: Dict[str, Any], config: Dict[str, Any]) -> float:
        """Calculate individual health metric value"""
        try:
            if config["calculation_method"] == "weighted_engagement":
                return await self._calculate_engagement_score(customer_data)
            elif config["calculation_method"] == "survey_feedback":
                return await self._calculate_satisfaction_score(customer_data)
            elif config["calculation_method"] == "usage_analytics":
                return await self._calculate_usage_frequency(customer_data)
            elif config["calculation_method"] == "support_ticket_analysis":
                return await self._calculate_support_health(customer_data)
            elif config["calculation_method"] == "payment_history":
                return await self._calculate_payment_health(customer_data)
            elif config["calculation_method"] == "communication_analysis":
                return await self._calculate_communication_response(customer_data)
            else:
                return 50.0  # Default neutral score
        except Exception as e:
            logging.error(f"Failed to calculate metric {metric_name}: {e}")
            return 50.0
    
    async def _calculate_engagement_score(self, customer_data: Dict[str, Any]) -> float:
        """Calculate engagement score based on customer interactions"""
        try:
            # Get engagement data from customer_data
            engagement_data = customer_data.get("engagement_data", {})
            
            # Calculate based on various engagement factors
            email_opens = engagement_data.get("email_opens", 0)
            email_clicks = engagement_data.get("email_clicks", 0)
            website_visits = engagement_data.get("website_visits", 0)
            social_engagement = engagement_data.get("social_engagement", 0)
            support_interactions = engagement_data.get("support_interactions", 0)
            
            # Weighted engagement calculation
            engagement_score = (
                email_opens * 0.2 +
                email_clicks * 0.3 +
                website_visits * 0.25 +
                social_engagement * 0.15 +
                support_interactions * 0.1
            )
            
            # Normalize to 0-100 scale
            return min(100.0, max(0.0, engagement_score * 10))
            
        except Exception as e:
            logging.error(f"Failed to calculate engagement score: {e}")
            return 50.0
    
    async def _calculate_satisfaction_score(self, customer_data: Dict[str, Any]) -> float:
        """Calculate satisfaction score from feedback and surveys"""
        try:
            feedback_data = customer_data.get("feedback_data", {})
            
            # Get recent survey scores
            recent_surveys = feedback_data.get("recent_surveys", [])
            if not recent_surveys:
                return 75.0  # Default if no survey data
            
            # Calculate average satisfaction score
            total_score = sum(survey.get("satisfaction_score", 75) for survey in recent_surveys)
            avg_score = total_score / len(recent_surveys)
            
            return avg_score
            
        except Exception as e:
            logging.error(f"Failed to calculate satisfaction score: {e}")
            return 75.0
    
    async def _calculate_usage_frequency(self, customer_data: Dict[str, Any]) -> float:
        """Calculate usage frequency relative to baseline"""
        try:
            usage_data = customer_data.get("usage_data", {})
            
            current_usage = usage_data.get("current_period_usage", 0)
            baseline_usage = usage_data.get("baseline_usage", 1)
            
            if baseline_usage == 0:
                return 100.0 if current_usage > 0 else 0.0
            
            usage_ratio = current_usage / baseline_usage
            return min(100.0, usage_ratio * 100)
            
        except Exception as e:
            logging.error(f"Failed to calculate usage frequency: {e}")
            return 50.0
    
    async def _calculate_support_health(self, customer_data: Dict[str, Any]) -> float:
        """Calculate support health based on ticket volume and resolution"""
        try:
            support_data = customer_data.get("support_data", {})
            
            total_tickets = support_data.get("total_tickets", 0)
            resolved_tickets = support_data.get("resolved_tickets", 0)
            open_tickets = support_data.get("open_tickets", 0)
            escalation_count = support_data.get("escalation_count", 0)
            
            if total_tickets == 0:
                return 100.0  # No support issues = perfect score
            
            # Calculate resolution rate
            resolution_rate = resolved_tickets / total_tickets if total_tickets > 0 else 1.0
            
            # Penalize open tickets and escalations
            open_ticket_penalty = open_tickets * 10  # 10 points per open ticket
            escalation_penalty = escalation_count * 20  # 20 points per escalation
            
            support_score = (resolution_rate * 100) - open_ticket_penalty - escalation_penalty
            
            return max(0.0, min(100.0, support_score))
            
        except Exception as e:
            logging.error(f"Failed to calculate support health: {e}")
            return 75.0
    
    async def _calculate_payment_health(self, customer_data: Dict[str, Any]) -> float:
        """Calculate payment health based on payment history"""
        try:
            payment_data = customer_data.get("payment_data", {})
            
            failed_payments = payment_data.get("failed_payments", 0)
            late_payments = payment_data.get("late_payments", 0)
            total_payments = payment_data.get("total_payments", 1)
            
            if total_payments == 0:
                return 100.0  # No payment history = perfect score
            
            # Calculate payment success rate
            successful_payments = total_payments - failed_payments
            payment_success_rate = successful_payments / total_payments
            
            # Penalize late payments
            late_payment_penalty = late_payments * 5  # 5 points per late payment
            
            payment_score = (payment_success_rate * 100) - late_payment_penalty
            
            return max(0.0, min(100.0, payment_score))
            
        except Exception as e:
            logging.error(f"Failed to calculate payment health: {e}")
            return 85.0
    
    async def _calculate_communication_response(self, customer_data: Dict[str, Any]) -> float:
        """Calculate communication response rate"""
        try:
            communication_data = customer_data.get("communication_data", {})
            
            sent_messages = communication_data.get("sent_messages", 0)
            responses_received = communication_data.get("responses_received", 0)
            
            if sent_messages == 0:
                return 100.0  # No messages sent = perfect score
            
            response_rate = responses_received / sent_messages
            return response_rate * 100
            
        except Exception as e:
            logging.error(f"Failed to calculate communication response: {e}")
            return 80.0
    
    async def _calculate_metric_trend(self, customer_id: str, metric_name: str, current_value: float) -> str:
        """Calculate trend for a metric (simplified implementation)"""
        try:
            # In real implementation, this would compare with historical data
            # For now, return a random trend
            import random
            trends = ["up", "down", "stable"]
            return random.choice(trends)
        except Exception as e:
            logging.error(f"Failed to calculate metric trend: {e}")
            return "stable"
    
    async def _identify_risk_factors(self, metrics: List[HealthMetric], customer_data: Dict[str, Any]) -> List[str]:
        """Identify risk factors based on health metrics"""
        risk_factors = []
        
        for metric in metrics:
            if metric.status == HealthStatus.CRITICAL:
                risk_factors.append(f"Critical {metric.metric_name.replace('_', ' ')}: {metric.value:.1f}")
            elif metric.status == HealthStatus.WARNING:
                risk_factors.append(f"Warning {metric.metric_name.replace('_', ' ')}: {metric.value:.1f}")
        
        # Add additional risk factors based on customer data
        if customer_data.get("churn_risk_score", 0) > 0.7:
            risk_factors.append("High churn risk detected by AI model")
        
        if customer_data.get("days_since_last_interaction", 0) > 30:
            risk_factors.append("No interaction for over 30 days")
        
        return risk_factors
    
    async def _identify_positive_indicators(self, metrics: List[HealthMetric], customer_data: Dict[str, Any]) -> List[str]:
        """Identify positive indicators based on health metrics"""
        positive_indicators = []
        
        for metric in metrics:
            if metric.status == HealthStatus.EXCELLENT or metric.status == HealthStatus.HEALTHY:
                if metric.trend == "up":
                    positive_indicators.append(f"Improving {metric.metric_name.replace('_', ' ')}: {metric.value:.1f}")
        
        # Add additional positive indicators
        if customer_data.get("recent_positive_feedback", False):
            positive_indicators.append("Recent positive feedback received")
        
        if customer_data.get("upsell_opportunity", False):
            positive_indicators.append("Upsell opportunity identified")
        
        return positive_indicators
    
    async def _generate_health_recommendations(self, metrics: List[HealthMetric], risk_factors: List[str], customer_data: Dict[str, Any]) -> List[str]:
        """Generate actionable recommendations based on health analysis"""
        recommendations = []
        
        # Generate recommendations based on critical metrics
        for metric in metrics:
            if metric.status == HealthStatus.CRITICAL:
                if metric.metric_name == "engagement_score":
                    recommendations.append("Schedule immediate customer success call to re-engage")
                elif metric.metric_name == "satisfaction_score":
                    recommendations.append("Send satisfaction survey and follow up on feedback")
                elif metric.metric_name == "support_interactions":
                    recommendations.append("Escalate to senior support and provide dedicated account manager")
                elif metric.metric_name == "payment_health":
                    recommendations.append("Contact billing team to resolve payment issues")
        
        # Add general recommendations
        if len(risk_factors) > 3:
            recommendations.append("Consider assigning dedicated customer success manager")
        
        if customer_data.get("days_since_last_interaction", 0) > 14:
            recommendations.append("Reach out with personalized communication")
        
        return recommendations
    
    async def _calculate_confidence_level(self, customer_data: Dict[str, Any]) -> float:
        """Calculate confidence level based on data completeness"""
        try:
            required_data_points = [
                "engagement_data", "feedback_data", "usage_data", 
                "support_data", "payment_data", "communication_data"
            ]
            
            available_data_points = sum(1 for data_point in required_data_points if customer_data.get(data_point))
            confidence = available_data_points / len(required_data_points)
            
            return confidence
        except Exception as e:
            logging.error(f"Failed to calculate confidence level: {e}")
            return 0.5
    
    async def _check_health_alerts(self, health_score: CustomerHealthScore):
        """Check for health alerts and create them if necessary"""
        try:
            for rule in self.alert_rules:
                if await self._evaluate_alert_condition(rule["condition"], health_score):
                    # Check if alert already exists for this customer and type
                    existing_alert = next(
                        (alert for alert in self.active_alerts 
                         if alert.customer_id == health_score.customer_id 
                         and alert.alert_type == rule["alert_type"]
                         and alert.resolved_at is None),
                        None
                    )
                    
                    if not existing_alert:
                        alert = HealthAlert(
                            alert_id=str(uuid.uuid4()),
                            customer_id=health_score.customer_id,
                            alert_type=rule["alert_type"],
                            severity=rule["severity"],
                            title=rule["title"],
                            description=rule["description"],
                            triggered_at=datetime.now(),
                            resolved_at=None,
                            resolved_by=None,
                            action_required=rule["action_required"],
                            auto_resolved=False
                        )
                        
                        self.active_alerts.append(alert)
                        logging.info(f"Health alert created: {alert.alert_type.value} for customer {health_score.customer_id}")
                        
        except Exception as e:
            logging.error(f"Failed to check health alerts: {e}")
    
    async def _evaluate_alert_condition(self, condition: str, health_score: CustomerHealthScore) -> bool:
        """Evaluate alert condition against health score"""
        try:
            # Simple condition evaluation (in real implementation, use a proper expression evaluator)
            if "overall_score" in condition:
                if "< 40" in condition:
                    return health_score.overall_score < 40
                elif "< 30" in condition:
                    return health_score.overall_score < 30
            
            # Check individual metrics
            for metric in health_score.individual_metrics:
                if metric.metric_name in condition:
                    if "engagement_score < 30" in condition:
                        return metric.metric_name == "engagement_score" and metric.value < 30
                    elif "support_interactions > 5" in condition:
                        return metric.metric_name == "support_interactions" and metric.value > 5
                    elif "payment_health > 2" in condition:
                        return metric.metric_name == "payment_health" and metric.value > 2
                    elif "satisfaction_score < 50" in condition:
                        return metric.metric_name == "satisfaction_score" and metric.value < 50
                    elif "usage_frequency < 0.3" in condition:
                        return metric.metric_name == "usage_frequency" and metric.value < 30
                    elif "communication_response < 0.5" in condition:
                        return metric.metric_name == "communication_response" and metric.value < 50
            
            return False
            
        except Exception as e:
            logging.error(f"Failed to evaluate alert condition: {e}")
            return False
    
    async def get_customer_health(self, customer_id: str) -> Optional[CustomerHealthScore]:
        """Get current health score for a customer"""
        return self.health_scores.get(customer_id)
    
    async def get_active_alerts(self, customer_id: Optional[str] = None) -> List[HealthAlert]:
        """Get active alerts, optionally filtered by customer"""
        if customer_id:
            return [alert for alert in self.active_alerts if alert.customer_id == customer_id and alert.resolved_at is None]
        else:
            return [alert for alert in self.active_alerts if alert.resolved_at is None]
    
    async def resolve_alert(self, alert_id: str, resolved_by: str) -> bool:
        """Resolve a health alert"""
        try:
            alert = next((alert for alert in self.active_alerts if alert.alert_id == alert_id), None)
            if alert:
                alert.resolved_at = datetime.now()
                alert.resolved_by = resolved_by
                return True
            return False
        except Exception as e:
            logging.error(f"Failed to resolve alert {alert_id}: {e}")
            return False
    
    async def get_health_summary(self) -> Dict[str, Any]:
        """Get overall health monitoring summary"""
        try:
            total_customers = len(self.health_scores)
            active_alerts = await self.get_active_alerts()
            
            # Count customers by health status
            status_counts = {
                "excellent": 0,
                "healthy": 0,
                "warning": 0,
                "at_risk": 0,
                "critical": 0
            }
            
            for health_score in self.health_scores.values():
                status_counts[health_score.health_status.value] += 1
            
            # Count alerts by severity
            alert_counts = {
                "low": 0,
                "medium": 0,
                "high": 0,
                "critical": 0
            }
            
            for alert in active_alerts:
                alert_counts[alert.severity] += 1
            
            return {
                "total_customers": total_customers,
                "health_distribution": status_counts,
                "active_alerts": len(active_alerts),
                "alert_distribution": alert_counts,
                "average_health_score": sum(score.overall_score for score in self.health_scores.values()) / total_customers if total_customers > 0 else 0,
                "last_updated": datetime.now().isoformat()
            }
            
        except Exception as e:
            logging.error(f"Failed to get health summary: {e}")
            return {}

# Global health monitor instance
customer_health_monitor = CustomerHealthMonitor()

# Convenience functions
async def calculate_customer_health(customer_id: str, customer_data: Dict[str, Any]) -> CustomerHealthScore:
    """Calculate customer health score"""
    return await customer_health_monitor.calculate_customer_health(customer_id, customer_data)

async def get_customer_health(customer_id: str) -> Optional[CustomerHealthScore]:
    """Get customer health score"""
    return await customer_health_monitor.get_customer_health(customer_id)

async def get_active_health_alerts(customer_id: Optional[str] = None) -> List[HealthAlert]:
    """Get active health alerts"""
    return await customer_health_monitor.get_active_alerts(customer_id)

async def resolve_health_alert(alert_id: str, resolved_by: str) -> bool:
    """Resolve health alert"""
    return await customer_health_monitor.resolve_alert(alert_id, resolved_by)

def get_health_monitoring_summary() -> Dict[str, Any]:
    """Get health monitoring summary"""
    return customer_health_monitor.get_health_summary()
