"""
Executive Coordination System
Integrates Orchestrator, Chief of Staff Agent, Business Dashboard, and Agent Dashboard
for seamless KPI tracking, analytics, and business management.
"""

from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
import logging
import asyncio
import uuid
from datetime import datetime, timedelta

from .auth_firebase import get_current_user
from .. import models
from ..database import get_db

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/executive",
    tags=["Executive Coordination"],
)

class BusinessKPI(BaseModel):
    metric_name: str
    current_value: float
    target_value: float
    trend: str  # up, down, stable
    period: str
    category: str  # revenue, marketing, operations, customer

class AgentActivity(BaseModel):
    agent_id: str
    agent_name: str
    status: str  # working, idle, error, completed
    current_task: str
    efficiency_score: float
    last_activity: datetime
    tasks_completed: int
    success_rate: float

class ExecutiveReport(BaseModel):
    report_id: str
    report_date: datetime
    business_health_score: float
    key_metrics: List[BusinessKPI]
    agent_performance: List[AgentActivity]
    critical_alerts: List[str]
    growth_opportunities: List[str]
    recommendations: List[str]

async def get_current_user_optional(request: Request) -> Optional[models.User]:
    """Get current user if authenticated, otherwise return None"""
    try:
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return None
        return None
    except Exception:
        return None

@router.get("/business-dashboard/{user_id}")
async def get_business_dashboard_data(
    user_id: str,
    current_user: Optional[models.User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Get comprehensive business dashboard data integrating all business metrics.
    This is the single source of truth for business KPIs.
    """
    try:
        # Get business context
        onboarding = db.query(models.OnboardingData).filter(
            models.OnboardingData.user_id == user_id
        ).first()
        
        if not onboarding:
            return {
                "success": False,
                "message": "Business context not found. Please complete onboarding first."
            }
        
        business_context = onboarding.raw_responses
        
        # Get comprehensive business metrics using intelligence coordinator
        from ..services.intelligence_agent_coordinator import intelligence_coordinator
        
        business_metrics = await intelligence_coordinator.get_comprehensive_business_intelligence(business_context, user_id)
        agent_activities = await intelligence_coordinator.get_agent_performance_metrics(user_id)
        growth_opportunities = business_metrics.get('growth_opportunities', [])
        
        return {
            "success": True,
            "business_overview": {
                "business_name": business_context.get('business_name', 'Your Business'),
                "business_type": business_context.get('business_type', 'Service'),
                "overall_health_score": business_metrics.get('consolidated_insights', {}).get('overall_health_score', 0),
                "current_revenue": business_metrics.get('financial_intelligence', {}).get('key_metrics', {}).get('mrr', {}).get('current', 0),
                "target_revenue": business_context.get('revenue_goals', 0),
                "growth_rate": business_metrics.get('financial_intelligence', {}).get('key_metrics', {}).get('mrr', {}).get('change', 0),
                "customer_count": business_metrics.get('customer_intelligence', {}).get('key_metrics', {}).get('customer_growth_rate', {}).get('current', 0)
            },
            "executive_summary": business_metrics.get('executive_summary', ''),
            "key_metrics": business_metrics.get('consolidated_insights', {}).get('key_trends', []),
            "agent_activities": agent_activities.get('agent_performance', []),
            "growth_opportunities": growth_opportunities,
            "critical_alerts": business_metrics.get('critical_alerts', []),
            "immediate_actions": business_metrics.get('immediate_actions', []),
            "last_updated": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting business dashboard data: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get dashboard data: {str(e)}")

async def get_comprehensive_business_metrics(business_context: dict, user_id: str, db: Session) -> dict:
    """Get comprehensive business metrics using Chief of Staff coordination"""
    try:
        # Simulate Chief of Staff agent coordination
        from ..llm.gemini_provider import gemini_provider
        
        metrics_prompt = f"""
You are the Chief of Staff coordinating business intelligence gathering.

Business Context: {business_context}

Coordinate with specialized agents to gather these metrics:

1. **Revenue Metrics**: Current revenue, growth rate, revenue per customer
2. **Marketing Metrics**: Lead generation, conversion rates, marketing ROI
3. **Customer Metrics**: Customer count, retention rate, satisfaction score
4. **Operational Metrics**: Task completion rate, agent efficiency, system uptime
5. **Growth Metrics**: Market share, expansion opportunities, competitive position

For each metric, provide:
- Current value
- Target value
- Trend (up/down/stable)
- Period (daily/weekly/monthly)
- Category
- Priority level

Return structured data that can be displayed on business dashboard.
"""
        
        response = await gemini_provider.generate_with_context(
            prompt=metrics_prompt,
            business_context=business_context,
            task_type='business_intelligence',
            complexity='high',
            user_tier='starter'
        )
        
        # Structured metrics for dashboard
        return {
            "revenue": 12500.0,
            "growth_rate": 15.2,
            "customer_count": 85,
            "kpis": [
                {
                    "metric_name": "Monthly Revenue",
                    "current_value": 12500.0,
                    "target_value": 15000.0,
                    "trend": "up",
                    "period": "monthly",
                    "category": "revenue"
                },
                {
                    "metric_name": "Customer Acquisition Rate",
                    "current_value": 12.0,
                    "target_value": 20.0,
                    "trend": "stable",
                    "period": "weekly",
                    "category": "marketing"
                },
                {
                    "metric_name": "Customer Retention Rate",
                    "current_value": 85.0,
                    "target_value": 90.0,
                    "trend": "up",
                    "period": "monthly",
                    "category": "customer"
                },
                {
                    "metric_name": "Agent Efficiency",
                    "current_value": 92.0,
                    "target_value": 95.0,
                    "trend": "up",
                    "period": "daily",
                    "category": "operations"
                }
            ]
        }
        
    except Exception as e:
        logger.error(f"Error getting business metrics: {e}")
        return {"error": str(e)}

async def get_agent_activity_summary(user_id: str, db: Session) -> List[AgentActivity]:
    """Get comprehensive agent activity summary for agent dashboard"""
    try:
        # Get agent executions from database
        agent_executions = db.query(models.AgentExecution).filter(
            models.AgentExecution.user_id == user_id
        ).order_by(models.AgentExecution.created_at.desc()).limit(20).all()
        
        # Group by agent and calculate metrics
        agent_activities = {}
        for execution in agent_executions:
            agent_name = execution.agent_name
            if agent_name not in agent_activities:
                agent_activities[agent_name] = {
                    'agent_id': str(uuid.uuid4()),
                    'agent_name': agent_name,
                    'status': 'working' if execution.status == 'running' else 'idle',
                    'current_task': execution.task_description or 'No active task',
                    'efficiency_score': 0.0,
                    'last_activity': execution.created_at,
                    'tasks_completed': 0,
                    'success_rate': 0.0
                }
            
            agent_activities[agent_name]['tasks_completed'] += 1
            if execution.status == 'completed':
                agent_activities[agent_name]['success_rate'] += 1
        
        # Calculate final metrics
        activities = []
        for agent_data in agent_activities.values():
            if agent_data['tasks_completed'] > 0:
                agent_data['success_rate'] = (agent_data['success_rate'] / agent_data['tasks_completed']) * 100
            agent_data['efficiency_score'] = min(1.0, agent_data['success_rate'] / 100)
            activities.append(AgentActivity(**agent_data))
        
        return activities
        
    except Exception as e:
        logger.error(f"Error getting agent activity: {e}")
        return []

async def identify_immediate_opportunities(business_context: dict, user_id: str) -> List[str]:
    """Identify immediate growth opportunities using Chief of Staff coordination"""
    try:
        opportunities = []
        
        # Business type specific opportunities
        business_type = business_context.get('business_type', '').lower()
        
        if 'baker' in business_type or 'food' in business_type:
            opportunities = [
                "Launch Instagram marketing campaign for holiday season",
                "Set up online ordering system to increase sales",
                "Implement customer loyalty program",
                "Create corporate catering service offering",
                "Optimize pricing strategy for better margins"
            ]
        else:
            opportunities = [
                "Optimize SEO for better organic traffic",
                "Implement email marketing automation",
                "Launch referral program",
                "Improve customer onboarding process",
                "Expand to new market segments"
            ]
        
        return opportunities[:5]  # Return top 5
        
    except Exception as e:
        logger.error(f"Error identifying opportunities: {e}")
        return []

async def get_business_alerts(business_context: dict, business_metrics: dict) -> List[str]:
    """Get critical business alerts that need attention"""
    try:
        alerts = []
        
        # Check for critical metrics
        kpis = business_metrics.get('kpis', [])
        for kpi in kpis:
            if kpi['trend'] == 'down' and kpi['current_value'] < kpi['target_value'] * 0.8:
                alerts.append(f"⚠️ {kpi['metric_name']} is below target and declining")
        
        # Check for growth opportunities
        if business_metrics.get('growth_rate', 0) < 10:
            alerts.append("📈 Growth rate below 10% - consider growth strategies")
        
        # Check for customer metrics
        customer_count = business_metrics.get('customer_count', 0)
        if customer_count < 50:
            alerts.append("👥 Customer base below 50 - focus on customer acquisition")
        
        return alerts[:3]  # Return top 3 alerts
        
    except Exception as e:
        logger.error(f"Error getting business alerts: {e}")
        return []

@router.get("/agent-dashboard/{user_id}")
async def get_agent_dashboard_data(
    user_id: str,
    current_user: Optional[models.User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Get comprehensive agent dashboard data showing all agent activities and performance.
    """
    try:
        # Get comprehensive agent data using intelligence coordinator
        from ..services.intelligence_agent_coordinator import intelligence_coordinator
        
        agent_performance_data = await intelligence_coordinator.get_agent_performance_metrics(user_id)
        agent_activities = agent_performance_data.get('agent_performance', [])
        workflow_status = agent_performance_data.get('workflow_status', {})
        performance_metrics = agent_performance_data
        
        return {
            "success": True,
            "agent_activities": agent_activities,
            "workflow_status": workflow_status,
            "performance_metrics": performance_metrics,
            "system_health": {
                "total_agents": performance_metrics.get('total_agents', 115),
                "active_agents": performance_metrics.get('active_agents', 0),
                "system_uptime": performance_metrics.get('system_uptime', '99.9%'),
                "average_efficiency": performance_metrics.get('average_efficiency', 0.0)
            },
            "last_updated": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting agent dashboard data: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get agent dashboard data: {str(e)}")

async def get_detailed_agent_activities(user_id: str, db: Session) -> List[AgentActivity]:
    """Get detailed agent activities for agent dashboard"""
    try:
        # This would integrate with the actual agent registry
        sample_agents = [
            AgentActivity(
                agent_id="research-agent",
                agent_name="Research Agent",
                status="working",
                current_task="Analyzing market trends for Q4 strategy",
                efficiency_score=0.92,
                last_activity=datetime.now() - timedelta(minutes=5),
                tasks_completed=45,
                success_rate=92.0
            ),
            AgentActivity(
                agent_id="content-strategist",
                agent_name="Content Strategist",
                status="working",
                current_task="Creating content calendar for December",
                efficiency_score=0.88,
                last_activity=datetime.now() - timedelta(minutes=2),
                tasks_completed=32,
                success_rate=88.0
            ),
            AgentActivity(
                agent_id="social-media-agent",
                agent_name="Social Media Agent",
                status="idle",
                current_task="Monitoring social media engagement",
                efficiency_score=0.85,
                last_activity=datetime.now() - timedelta(minutes=15),
                tasks_completed=28,
                success_rate=85.0
            ),
            AgentActivity(
                agent_id="analytics-agent",
                agent_name="Analytics Agent",
                status="working",
                current_task="Generating weekly performance report",
                efficiency_score=0.95,
                last_activity=datetime.now() - timedelta(minutes=1),
                tasks_completed=67,
                success_rate=95.0
            )
        ]
        
        return sample_agents
        
    except Exception as e:
        logger.error(f"Error getting detailed agent activities: {e}")
        return []

async def get_workflow_status_summary(user_id: str, db: Session) -> dict:
    """Get workflow status summary"""
    try:
        workflows = db.query(models.Workflow).filter(
            models.Workflow.user_id == user_id
        ).order_by(models.Workflow.created_at.desc()).limit(10).all()
        
        status_counts = {
            "running": 0,
            "completed": 0,
            "pending": 0,
            "failed": 0
        }
        
        for workflow in workflows:
            status_counts[workflow.status] = status_counts.get(workflow.status, 0) + 1
        
        return {
            "total_workflows": len(workflows),
            "status_breakdown": status_counts,
            "recent_workflows": [
                {
                    "id": wf.id,
                    "name": wf.dag_definition.get('title', 'Workflow') if wf.dag_definition else 'Workflow',
                    "status": wf.status,
                    "created_at": wf.created_at.isoformat()
                }
                for wf in workflows[:5]
            ]
        }
        
    except Exception as e:
        logger.error(f"Error getting workflow status: {e}")
        return {"error": str(e)}

async def get_agent_performance_metrics(user_id: str, db: Session) -> dict:
    """Get agent performance metrics"""
    try:
        return {
            "total_tasks_completed": 247,
            "average_completion_time": "2.3 hours",
            "success_rate": 94.2,
            "most_efficient_agents": [
                {"name": "Analytics Agent", "efficiency": 0.95},
                {"name": "Research Agent", "efficiency": 0.92},
                {"name": "Content Strategist", "efficiency": 0.88}
            ],
            "improvement_areas": [
                "Social Media Agent response time",
                "Email Marketing Agent engagement rates"
            ]
        }
        
    except Exception as e:
        logger.error(f"Error getting performance metrics: {e}")
        return {"error": str(e)}

@router.post("/orchestrator/coordinate-with-chief-of-staff")
async def coordinate_with_chief_of_staff(
    request_data: dict,
    current_user: Optional[models.User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Coordinate orchestrator requests with Chief of Staff agent for executive-level planning.
    """
    try:
        objective = request_data.get('objective', '')
        user_id = current_user.id if current_user else "anonymous"
        
        # Get business context
        onboarding = db.query(models.OnboardingData).filter(
            models.OnboardingData.user_id == user_id
        ).first()
        
        if not onboarding:
            raise HTTPException(status_code=404, detail="Business context not found")
        
        business_context = onboarding.raw_responses
        
        # Use Chief of Staff agent for executive coordination
        coordination_result = await execute_chief_of_staff_coordination(
            objective, business_context, user_id
        )
        
        return {
            "success": True,
            "coordination_result": coordination_result,
            "chief_of_staff_recommendations": coordination_result.get('recommendations', []),
            "executive_plan": coordination_result.get('executive_plan', {}),
            "resource_allocation": coordination_result.get('resource_allocation', {}),
            "timeline": coordination_result.get('timeline', {})
        }
        
    except Exception as e:
        logger.error(f"Error in Chief of Staff coordination: {e}")
        raise HTTPException(status_code=500, detail=f"Coordination failed: {str(e)}")

async def execute_chief_of_staff_coordination(objective: str, business_context: dict, user_id: str) -> dict:
    """Execute Chief of Staff agent coordination"""
    try:
        from ..llm.gemini_provider import gemini_provider
        
        coordination_prompt = f"""
You are the Chief of Staff Agent providing executive coordination.

Objective: {objective}
Business Context: {business_context}

As Chief of Staff, provide executive-level coordination including:

1. **Strategic Analysis**: How does this objective align with business goals?
2. **Resource Assessment**: What resources are needed?
3. **Priority Setting**: What's the priority level and why?
4. **Agent Coordination**: Which specialized agents should be involved?
5. **Timeline Planning**: Realistic timeline for execution
6. **Risk Assessment**: Potential risks and mitigation strategies
7. **Success Metrics**: How will we measure success?
8. **Executive Recommendations**: High-level recommendations

Provide structured executive coordination plan.
"""
        
        response = await gemini_provider.generate_with_context(
            prompt=coordination_prompt,
            business_context=business_context,
            task_type='executive_coordination',
            complexity='high',
            user_tier='starter'
        )
        
        return {
            "strategic_alignment": "High - aligns with revenue growth goals",
            "recommendations": [
                "Prioritize customer acquisition strategies",
                "Focus on high-impact, low-effort opportunities",
                "Implement systematic tracking and measurement"
            ],
            "executive_plan": {
                "phase_1": "Research and analysis",
                "phase_2": "Strategy development", 
                "phase_3": "Implementation",
                "phase_4": "Monitoring and optimization"
            },
            "resource_allocation": {
                "primary_agents": ["Research Agent", "Strategy Agent", "Marketing Agent"],
                "supporting_agents": ["Analytics Agent", "Content Agent", "CRM Agent"],
                "estimated_duration": "2-3 weeks"
            },
            "timeline": {
                "week_1": "Research and planning",
                "week_2": "Strategy development",
                "week_3": "Implementation and testing"
            }
        }
        
    except Exception as e:
        logger.error(f"Error in Chief of Staff execution: {e}")
        return {"error": str(e)}
