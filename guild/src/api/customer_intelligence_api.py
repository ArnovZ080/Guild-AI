"""
Customer Intelligence Agent API
Provides REST endpoints for customer intelligence, health monitoring, journey tracking, and communication timeline.
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends, Query
from pydantic import BaseModel
from typing import Dict, List, Any, Optional, Union
from datetime import datetime, timedelta
import asyncio
import logging

from guild.src.agents.customer_intelligence_agent import CustomerIntelligenceAgent
from guild.src.core.customer_health_monitoring import (
    calculate_customer_health, get_customer_health, get_active_health_alerts,
    resolve_health_alert, get_health_monitoring_summary, HealthStatus, AlertType
)
from guild.src.core.customer_journey_tracking import (
    track_customer_touchpoint, get_customer_journey, get_journey_analytics,
    get_stage_performance, TouchpointType, JourneyStage
)
from guild.src.core.customer_communication_timeline import (
    log_customer_communication, get_customer_communication_timeline,
    get_customer_communication_summary, get_follow_up_queue,
    get_communication_analytics, CommunicationType, CommunicationDirection
)
from guild.src.core.connector_data_integration import (
    get_customer_data_from_connectors, get_customer_performance_summary_from_connectors,
    get_crm_analytics_from_connectors, get_customer_connector_sync_status
)

# API Router
router = APIRouter(prefix="/api/customer", tags=["Customer Intelligence"])

# Initialize Customer Intelligence Agent
customer_intelligence_agent = CustomerIntelligenceAgent()

# Request/Response Models
class CustomerAnalysisRequest(BaseModel):
    timeframe: Optional[str] = "30d"
    segments: Optional[List[str]] = None
    include_predictions: bool = True

class CustomerProfileRequest(BaseModel):
    customer_id: str
    include_history: bool = True
    include_health: bool = True
    include_journey: bool = True
    include_communications: bool = True

class CustomerSegmentRequest(BaseModel):
    segment_name: Optional[str] = None
    criteria: Optional[Dict[str, Any]] = None

class HealthCalculationRequest(BaseModel):
    customer_id: str
    customer_data: Dict[str, Any]

class TouchpointRequest(BaseModel):
    customer_id: str
    touchpoint_type: str
    channel: str
    platform: str
    metadata: Optional[Dict[str, Any]] = None

class CommunicationRequest(BaseModel):
    customer_id: str
    communication_type: str
    direction: str
    content: Optional[str] = None
    subject: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

# API Endpoints

@router.get("/analysis")
async def get_customer_analysis_endpoint(
    timeframe: str = Query("30d", description="Analysis timeframe"),
    segments: Optional[List[str]] = Query(None, description="Customer segments to analyze"),
    include_predictions: bool = Query(True, description="Include AI predictions")
):
    """Get comprehensive customer analysis and insights."""
    try:
        # Get real data from connectors
        connector_data = await get_customer_performance_summary_from_connectors()
        
        # Generate analysis using Customer Intelligence Agent
        analysis_result = await customer_intelligence_agent.generate_comprehensive_customer_analysis()
        
        # Get health monitoring summary
        health_summary = get_health_monitoring_summary()
        
        # Get journey analytics
        journey_analytics = await get_journey_analytics()
        
        # Get communication analytics
        communication_analytics = await get_communication_analytics()
        
        # Combine all data
        combined_analysis = {
            "customer_analysis": analysis_result,
            "connector_data": connector_data,
            "health_monitoring": health_summary,
            "journey_analytics": journey_analytics,
            "communication_analytics": communication_analytics,
            "timeframe": timeframe,
            "segments": segments,
            "include_predictions": include_predictions,
            "last_updated": datetime.now().isoformat()
        }
        
        return {
            "status": "success",
            "data": combined_analysis
        }
        
    except Exception as e:
        logging.error(f"Failed to get customer analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/profiles")
async def get_customer_profiles_endpoint(
    segment: str = Query("all", description="Customer segment filter"),
    limit: int = Query(50, description="Maximum number of profiles"),
    include_health: bool = Query(True, description="Include health scores"),
    include_journey: bool = Query(True, description="Include journey data"),
    include_communications: bool = Query(True, description="Include communication data")
):
    """Get customer profiles with comprehensive data."""
    try:
        # Get customer data from connectors
        connector_customers = await get_customer_data_from_connectors()
        
        profiles = []
        
        # Process each customer
        for customer_data in connector_customers.get("customers", []):
            customer_id = customer_data.get("customer_id")
            if not customer_id:
                continue
            
            profile = {
                "customer_id": customer_id,
                "name": customer_data.get("name", "Unknown"),
                "email": customer_data.get("email"),
                "company": customer_data.get("company"),
                "segment": customer_data.get("segment", "Standard"),
                "created_at": customer_data.get("created_at"),
                "last_activity": customer_data.get("last_activity"),
                "total_value": customer_data.get("total_value", 0),
                "status": customer_data.get("status", "active")
            }
            
            # Add health data if requested
            if include_health:
                health_score = await get_customer_health(customer_id)
                if health_score:
                    profile["health_score"] = health_score.overall_score
                    profile["health_status"] = health_score.health_status.value
                    profile["risk_factors"] = health_score.risk_factors
            
            # Add journey data if requested
            if include_journey:
                journey = await get_customer_journey(customer_id)
                if journey:
                    profile["current_stage"] = journey.current_stage.value
                    profile["journey_score"] = journey.journey_score
                    profile["conversion_probability"] = journey.conversion_probability
                    profile["churn_risk"] = journey.churn_risk
            
            # Add communication data if requested
            if include_communications:
                comm_summary = await get_customer_communication_summary(customer_id)
                if comm_summary:
                    profile["total_communications"] = comm_summary.total_communications
                    profile["response_rate"] = comm_summary.response_rate
                    profile["last_communication"] = comm_summary.last_communication
            
            profiles.append(profile)
        
        # Filter by segment if specified
        if segment != "all":
            profiles = [p for p in profiles if p.get("segment", "").lower() == segment.lower()]
        
        # Limit results
        profiles = profiles[:limit]
        
        return {
            "status": "success",
            "data": {
                "profiles": profiles,
                "total_count": len(profiles),
                "segment": segment,
                "last_updated": datetime.now().isoformat()
            }
        }
        
    except Exception as e:
        logging.error(f"Failed to get customer profiles: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/segments")
async def get_customer_segments_endpoint():
    """Get customer segments and their analytics."""
    try:
        # Get segment data from connectors
        connector_data = await get_customer_performance_summary_from_connectors()
        
        segments = []
        
        # Define standard segments
        standard_segments = [
            {
                "name": "VIP",
                "description": "High-value customers with excellent health scores",
                "criteria": {"min_value": 10000, "min_health_score": 80},
                "count": 0,
                "total_value": 0,
                "avg_health_score": 0
            },
            {
                "name": "Enterprise",
                "description": "Large enterprise customers",
                "criteria": {"company_size": "enterprise", "min_value": 5000},
                "count": 0,
                "total_value": 0,
                "avg_health_score": 0
            },
            {
                "name": "Premium",
                "description": "Premium tier customers",
                "criteria": {"tier": "premium", "min_value": 2000},
                "count": 0,
                "total_value": 0,
                "avg_health_score": 0
            },
            {
                "name": "Standard",
                "description": "Standard tier customers",
                "criteria": {"tier": "standard"},
                "count": 0,
                "total_value": 0,
                "avg_health_score": 0
            },
            {
                "name": "At Risk",
                "description": "Customers with health warnings or churn risk",
                "criteria": {"max_health_score": 60, "churn_risk": "high"},
                "count": 0,
                "total_value": 0,
                "avg_health_score": 0
            }
        ]
        
        # Calculate segment metrics from connector data
        customers = connector_data.get("customers", [])
        
        for segment in standard_segments:
            segment_customers = []
            
            for customer in customers:
                if await _customer_matches_segment(customer, segment["criteria"]):
                    segment_customers.append(customer)
            
            segment["count"] = len(segment_customers)
            segment["total_value"] = sum(c.get("total_value", 0) for c in segment_customers)
            
            # Calculate average health score
            health_scores = []
            for customer in segment_customers:
                customer_id = customer.get("customer_id")
                if customer_id:
                    health_score = await get_customer_health(customer_id)
                    if health_score:
                        health_scores.append(health_score.overall_score)
            
            segment["avg_health_score"] = sum(health_scores) / len(health_scores) if health_scores else 0
        
        return {
            "status": "success",
            "data": {
                "segments": segments,
                "total_segments": len(segments),
                "last_updated": datetime.now().isoformat()
            }
        }
        
    except Exception as e:
        logging.error(f"Failed to get customer segments: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/funnel")
async def get_customer_funnel_endpoint(
    period: str = Query("30d", description="Analysis period")
):
    """Get customer funnel analytics."""
    try:
        # Get journey analytics
        journey_analytics = await get_journey_analytics()
        
        # Get stage performance data
        stage_performance = {}
        for stage in JourneyStage:
            stage_data = await get_stage_performance(stage)
            stage_performance[stage.value] = stage_data
        
        funnel_data = {
            "period": period,
            "stage_distribution": journey_analytics.get("stage_distribution", {}),
            "stage_performance": stage_performance,
            "conversion_rates": await _calculate_conversion_rates(),
            "bottlenecks": await _identify_funnel_bottlenecks(stage_performance),
            "recommendations": await _generate_funnel_recommendations(stage_performance),
            "last_updated": datetime.now().isoformat()
        }
        
        return {
            "status": "success",
            "data": funnel_data
        }
        
    except Exception as e:
        logging.error(f"Failed to get customer funnel: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/profile/{customer_id}")
async def get_customer_profile_endpoint(
    customer_id: str,
    include_history: bool = Query(True, description="Include historical data"),
    include_health: bool = Query(True, description="Include health analysis"),
    include_journey: bool = Query(True, description="Include journey data"),
    include_communications: bool = Query(True, description="Include communication timeline")
):
    """Get detailed customer profile with comprehensive data."""
    try:
        # Get customer data from connectors
        connector_data = await get_customer_data_from_connectors()
        customer_data = None
        
        for customer in connector_data.get("customers", []):
            if customer.get("customer_id") == customer_id:
                customer_data = customer
                break
        
        if not customer_data:
            raise HTTPException(status_code=404, detail="Customer not found")
        
        profile = {
            "customer_id": customer_id,
            "basic_info": {
                "name": customer_data.get("name", "Unknown"),
                "email": customer_data.get("email"),
                "company": customer_data.get("company"),
                "phone": customer_data.get("phone"),
                "created_at": customer_data.get("created_at"),
                "last_activity": customer_data.get("last_activity"),
                "status": customer_data.get("status", "active")
            },
            "value_metrics": {
                "total_value": customer_data.get("total_value", 0),
                "monthly_recurring_revenue": customer_data.get("mrr", 0),
                "lifetime_value": customer_data.get("ltv", 0),
                "average_order_value": customer_data.get("aov", 0),
                "total_orders": customer_data.get("total_orders", 0)
            }
        }
        
        # Add health analysis if requested
        if include_health:
            health_score = await get_customer_health(customer_id)
            if health_score:
                profile["health_analysis"] = {
                    "overall_score": health_score.overall_score,
                    "health_status": health_score.health_status.value,
                    "individual_metrics": [
                        {
                            "metric_name": metric.metric_name,
                            "value": metric.value,
                            "status": metric.status.value,
                            "trend": metric.trend
                        }
                        for metric in health_score.individual_metrics
                    ],
                    "risk_factors": health_score.risk_factors,
                    "positive_indicators": health_score.positive_indicators,
                    "recommendations": health_score.recommendations,
                    "last_calculated": health_score.last_calculated.isoformat()
                }
        
        # Add journey data if requested
        if include_journey:
            journey = await get_customer_journey(customer_id)
            if journey:
                profile["journey_data"] = {
                    "current_stage": journey.current_stage.value,
                    "journey_start": journey.journey_start.isoformat(),
                    "last_activity": journey.last_activity.isoformat(),
                    "journey_score": journey.journey_score,
                    "next_likely_stage": journey.next_likely_stage.value if journey.next_likely_stage else None,
                    "time_in_current_stage": journey.time_in_current_stage,
                    "total_journey_duration": journey.total_journey_duration,
                    "conversion_probability": journey.conversion_probability,
                    "churn_risk": journey.churn_risk,
                    "journey_health": journey.journey_health,
                    "touchpoints": [
                        {
                            "touchpoint_id": tp.touchpoint_id,
                            "touchpoint_type": tp.touchpoint_type.value,
                            "stage": tp.stage.value,
                            "timestamp": tp.timestamp.isoformat(),
                            "channel": tp.channel,
                            "platform": tp.platform,
                            "content": tp.content,
                            "outcome": tp.outcome
                        }
                        for tp in journey.touchpoints
                    ],
                    "milestones": [
                        {
                            "milestone_id": m.milestone_id,
                            "event_type": m.event_type.value,
                            "stage": m.stage.value,
                            "timestamp": m.timestamp.isoformat(),
                            "description": m.description,
                            "impact_score": m.impact_score
                        }
                        for m in journey.milestones
                    ]
                }
        
        # Add communication timeline if requested
        if include_communications:
            comm_timeline = await get_customer_communication_timeline(customer_id)
            comm_summary = await get_customer_communication_summary(customer_id)
            
            if comm_summary:
                profile["communication_data"] = {
                    "summary": {
                        "total_communications": comm_summary.total_communications,
                        "inbound_count": comm_summary.inbound_count,
                        "outbound_count": comm_summary.outbound_count,
                        "response_rate": comm_summary.response_rate,
                        "average_response_time": comm_summary.average_response_time,
                        "satisfaction_score": comm_summary.satisfaction_score,
                        "active_conversations": comm_summary.active_conversations,
                        "pending_follow_ups": comm_summary.pending_follow_ups,
                        "urgent_items": comm_summary.urgent_items
                    },
                    "timeline": [
                        {
                            "communication_id": comm.communication_id,
                            "communication_type": comm.communication_type.value,
                            "direction": comm.direction.value,
                            "status": comm.status.value,
                            "timestamp": comm.timestamp.isoformat(),
                            "subject": comm.subject,
                            "content": comm.content,
                            "sender": comm.sender,
                            "recipient": comm.recipient,
                            "channel": comm.channel,
                            "platform": comm.platform,
                            "sentiment": comm.sentiment.value if comm.sentiment else None,
                            "sentiment_score": comm.sentiment_score,
                            "priority": comm.priority,
                            "outcome": comm.outcome,
                            "satisfaction_rating": comm.satisfaction_rating
                        }
                        for comm in comm_timeline[:50]  # Limit to last 50 communications
                    ]
                }
        
        return {
            "status": "success",
            "data": profile
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Failed to get customer profile for {customer_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/health/calculate")
async def calculate_customer_health_endpoint(request: HealthCalculationRequest):
    """Calculate customer health score."""
    try:
        health_score = await calculate_customer_health(request.customer_id, request.customer_data)
        
        return {
            "status": "success",
            "data": {
                "customer_id": request.customer_id,
                "overall_score": health_score.overall_score,
                "health_status": health_score.health_status.value,
                "individual_metrics": [
                    {
                        "metric_name": metric.metric_name,
                        "value": metric.value,
                        "status": metric.status.value,
                        "trend": metric.trend
                    }
                    for metric in health_score.individual_metrics
                ],
                "risk_factors": health_score.risk_factors,
                "positive_indicators": health_score.positive_indicators,
                "recommendations": health_score.recommendations,
                "last_calculated": health_score.last_calculated.isoformat()
            }
        }
        
    except Exception as e:
        logging.error(f"Failed to calculate customer health: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health/alerts")
async def get_health_alerts_endpoint(customer_id: Optional[str] = Query(None, description="Filter by customer ID")):
    """Get active health alerts."""
    try:
        alerts = await get_active_health_alerts(customer_id)
        
        return {
            "status": "success",
            "data": {
                "alerts": [
                    {
                        "alert_id": alert.alert_id,
                        "customer_id": alert.customer_id,
                        "alert_type": alert.alert_type.value,
                        "severity": alert.severity,
                        "title": alert.title,
                        "description": alert.description,
                        "triggered_at": alert.triggered_at.isoformat(),
                        "action_required": alert.action_required
                    }
                    for alert in alerts
                ],
                "total_alerts": len(alerts),
                "last_updated": datetime.now().isoformat()
            }
        }
        
    except Exception as e:
        logging.error(f"Failed to get health alerts: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/touchpoint/track")
async def track_touchpoint_endpoint(request: TouchpointRequest):
    """Track a customer touchpoint."""
    try:
        touchpoint_type = TouchpointType(request.touchpoint_type)
        
        touchpoint = await track_customer_touchpoint(
            request.customer_id,
            touchpoint_type,
            request.channel,
            request.platform,
            metadata=request.metadata
        )
        
        return {
            "status": "success",
            "data": {
                "touchpoint_id": touchpoint.touchpoint_id,
                "customer_id": touchpoint.customer_id,
                "touchpoint_type": touchpoint.touchpoint_type.value,
                "stage": touchpoint.stage.value,
                "timestamp": touchpoint.timestamp.isoformat(),
                "channel": touchpoint.channel,
                "platform": touchpoint.platform,
                "metadata": touchpoint.metadata
            }
        }
        
    except Exception as e:
        logging.error(f"Failed to track touchpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/communication/log")
async def log_communication_endpoint(request: CommunicationRequest):
    """Log a customer communication."""
    try:
        communication_type = CommunicationType(request.communication_type)
        direction = CommunicationDirection(request.direction)
        
        communication = await log_customer_communication(
            request.customer_id,
            communication_type,
            direction,
            content=request.content,
            subject=request.subject,
            metadata=request.metadata
        )
        
        return {
            "status": "success",
            "data": {
                "communication_id": communication.communication_id,
                "customer_id": communication.customer_id,
                "communication_type": communication.communication_type.value,
                "direction": communication.direction.value,
                "status": communication.status.value,
                "timestamp": communication.timestamp.isoformat(),
                "subject": communication.subject,
                "content": communication.content,
                "sentiment": communication.sentiment.value if communication.sentiment else None,
                "sentiment_score": communication.sentiment_score
            }
        }
        
    except Exception as e:
        logging.error(f"Failed to log communication: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics/summary")
async def get_customer_analytics_summary_endpoint():
    """Get comprehensive customer analytics summary."""
    try:
        # Get all analytics data
        connector_data = await get_customer_performance_summary_from_connectors()
        health_summary = get_health_monitoring_summary()
        journey_analytics = await get_journey_analytics()
        communication_analytics = await get_communication_analytics()
        
        summary = {
            "customer_overview": connector_data,
            "health_monitoring": health_summary,
            "journey_analytics": journey_analytics,
            "communication_analytics": communication_analytics,
            "last_updated": datetime.now().isoformat()
        }
        
        return {
            "status": "success",
            "data": summary
        }
        
    except Exception as e:
        logging.error(f"Failed to get customer analytics summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Helper functions
async def _customer_matches_segment(customer: Dict[str, Any], criteria: Dict[str, Any]) -> bool:
    """Check if customer matches segment criteria."""
    try:
        for key, value in criteria.items():
            customer_value = customer.get(key)
            
            if key == "min_value" and customer.get("total_value", 0) < value:
                return False
            elif key == "max_value" and customer.get("total_value", 0) > value:
                return False
            elif key == "min_health_score":
                # Would need to get health score from health monitoring
                pass
            elif key == "max_health_score":
                # Would need to get health score from health monitoring
                pass
            elif customer_value != value:
                return False
        
        return True
    except Exception as e:
        logging.error(f"Failed to check customer segment match: {e}")
        return False

async def _calculate_conversion_rates() -> Dict[str, float]:
    """Calculate conversion rates between journey stages."""
    try:
        # Simplified conversion rate calculation
        # In real implementation, this would analyze actual customer progression
        return {
            "awareness_to_consideration": 0.25,
            "consideration_to_purchase": 0.15,
            "purchase_to_onboarding": 0.95,
            "onboarding_to_adoption": 0.80,
            "adoption_to_retention": 0.70,
            "retention_to_advocacy": 0.30
        }
    except Exception as e:
        logging.error(f"Failed to calculate conversion rates: {e}")
        return {}

async def _identify_funnel_bottlenecks(stage_performance: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Identify bottlenecks in the customer funnel."""
    try:
        bottlenecks = []
        
        # Analyze stage performance for bottlenecks
        for stage, data in stage_performance.items():
            if isinstance(data, dict) and "customers" in data:
                customers = data["customers"]
                avg_time = data.get("average_time_in_stage", 0)
                
                # Identify stages with low conversion or high time
                if customers > 0 and avg_time > 30:  # More than 30 days
                    bottlenecks.append({
                        "stage": stage,
                        "issue": "High time in stage",
                        "customers_affected": customers,
                        "average_time": avg_time,
                        "recommendation": f"Optimize {stage} stage process to reduce time"
                    })
        
        return bottlenecks
    except Exception as e:
        logging.error(f"Failed to identify funnel bottlenecks: {e}")
        return []

async def _generate_funnel_recommendations(stage_performance: Dict[str, Any]) -> List[str]:
    """Generate recommendations for funnel optimization."""
    try:
        recommendations = []
        
        # Generate recommendations based on stage performance
        recommendations.append("Focus on improving awareness to consideration conversion rate")
        recommendations.append("Optimize onboarding process to increase adoption rate")
        recommendations.append("Implement retention strategies for adoption to retention stage")
        recommendations.append("Create advocacy programs to increase retention to advocacy conversion")
        
        return recommendations
    except Exception as e:
        logging.error(f"Failed to generate funnel recommendations: {e}")
        return []
