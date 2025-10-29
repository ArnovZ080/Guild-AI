"""
Business Metrics API endpoints for dashboard data
Provides real-time business intelligence from agent-collected data
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import json

from ..database import get_db
from .. import models

router = APIRouter(
    prefix="/business-metrics",
    tags=["Business Metrics"],
)

@router.get("/financial-health")
async def get_financial_health(db: Session = Depends(get_db)):
    """
    Get comprehensive financial health metrics from agent-collected data
    """
    try:
        # Get financial data from agent executions
        financial_executions = db.query(models.AgentExecution).filter(
            models.AgentExecution.agent_name.in_([
                'bookkeeping_agent', 'accounting_agent', 'financial_agent'
            ])
        ).all()
        
        # Calculate financial metrics from agent outputs
        total_revenue = 0
        total_expenses = 0
        profit_margin = 0
        cash_flow = 0
        growth_rate = 0
        
        for execution in financial_executions:
            if execution.output_data:
                output = execution.output_data
                if 'revenue' in output:
                    total_revenue += float(output.get('revenue', 0))
                if 'expenses' in output:
                    total_expenses += float(output.get('expenses', 0))
                if 'profit_margin' in output:
                    profit_margin = float(output.get('profit_margin', 0))
                if 'cash_flow' in output:
                    cash_flow += float(output.get('cash_flow', 0))
                if 'growth_rate' in output:
                    growth_rate = float(output.get('growth_rate', 0))
        
        # Calculate derived metrics
        net_profit = total_revenue - total_expenses
        profit_margin_percent = (net_profit / total_revenue * 100) if total_revenue > 0 else 0
        
        # Determine financial health
        if profit_margin_percent > 20 and growth_rate > 10:
            health_status = 'excellent'
        elif profit_margin_percent > 10 and growth_rate > 5:
            health_status = 'good'
        elif profit_margin_percent > 0:
            health_status = 'warning'
        else:
            health_status = 'critical'
        
        return {
            "revenue": total_revenue,
            "expenses": total_expenses,
            "profit": net_profit,
            "profit_margin": profit_margin_percent,
            "cash_flow": cash_flow,
            "growth_rate": growth_rate,
            "health_status": health_status,
            "last_updated": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get financial health: {str(e)}")

@router.get("/agent-activity")
async def get_agent_activity(db: Session = Depends(get_db)):
    """
    Get real-time agent activity and performance metrics
    """
    try:
        # Get active workflows and their executions
        active_workflows = db.query(models.Workflow).filter(
            models.Workflow.status.in_(['running', 'pending'])
        ).all()
        
        # Get recent agent executions
        recent_executions = db.query(models.AgentExecution).filter(
            models.AgentExecution.status.in_(['running', 'completed', 'failed'])
        ).all()
        
        # Calculate agent metrics
        active_agents = len(set([ex.agent_name for ex in recent_executions if ex.status == 'running']))
        total_tasks = len(recent_executions)
        completed_tasks = len([ex for ex in recent_executions if ex.status == 'completed'])
        failed_tasks = len([ex for ex in recent_executions if ex.status == 'failed'])
        
        efficiency = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
        
        # Calculate uptime (simplified)
        successful_executions = len([ex for ex in recent_executions if ex.status == 'completed'])
        uptime = (successful_executions / total_tasks * 100) if total_tasks > 0 else 100
        
        # Get agent performance by type
        agent_performance = {}
        for execution in recent_executions:
            agent_name = execution.agent_name
            if agent_name not in agent_performance:
                agent_performance[agent_name] = {
                    'total_tasks': 0,
                    'completed_tasks': 0,
                    'failed_tasks': 0,
                    'efficiency': 0
                }
            
            agent_performance[agent_name]['total_tasks'] += 1
            if execution.status == 'completed':
                agent_performance[agent_name]['completed_tasks'] += 1
            elif execution.status == 'failed':
                agent_performance[agent_name]['failed_tasks'] += 1
        
        # Calculate efficiency for each agent
        for agent_name, perf in agent_performance.items():
            perf['efficiency'] = (perf['completed_tasks'] / perf['total_tasks'] * 100) if perf['total_tasks'] > 0 else 0
        
        return {
            "active_agents": active_agents,
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "failed_tasks": failed_tasks,
            "efficiency": efficiency,
            "uptime": uptime,
            "agent_performance": agent_performance,
            "active_workflows": len(active_workflows),
            "last_updated": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get agent activity: {str(e)}")

@router.get("/customer-insights")
async def get_customer_insights(db: Session = Depends(get_db)):
    """
    Get customer analytics and insights from CRM and marketing agents
    """
    try:
        # Get customer-related agent executions
        customer_executions = db.query(models.AgentExecution).filter(
            models.AgentExecution.agent_name.in_([
                'crm_agent', 'marketing_agent', 'customer_support_agent', 
                'churn_predictor_agent', 'outbound_sales_agent'
            ])
        ).all()
        
        # Extract customer metrics from agent outputs
        total_customers = 0
        new_customers_this_month = 0
        customers_needing_attention = 0
        satisfaction_score = 0
        churn_risk = 0
        
        for execution in customer_executions:
            if execution.output_data:
                output = execution.output_data
                if 'total_customers' in output:
                    total_customers = max(total_customers, int(output.get('total_customers', 0)))
                if 'new_customers' in output:
                    new_customers_this_month += int(output.get('new_customers', 0))
                if 'attention_needed' in output:
                    customers_needing_attention += int(output.get('attention_needed', 0))
                if 'satisfaction_score' in output:
                    satisfaction_score = float(output.get('satisfaction_score', 0))
                if 'churn_risk' in output:
                    churn_risk = float(output.get('churn_risk', 0))
        
        # Get recent customer interactions
        recent_interactions = []
        for execution in customer_executions:
            if execution.output_data and 'customer_interactions' in execution.output_data:
                interactions = execution.output_data['customer_interactions']
                if isinstance(interactions, list):
                    recent_interactions.extend(interactions)
        
        return {
            "total_customers": total_customers,
            "new_customers_this_month": new_customers_this_month,
            "customers_needing_attention": customers_needing_attention,
            "satisfaction_score": satisfaction_score,
            "churn_risk": churn_risk,
            "recent_interactions": recent_interactions[-10:],  # Last 10 interactions
            "last_updated": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get customer insights: {str(e)}")

@router.get("/content-performance")
async def get_content_performance(db: Session = Depends(get_db)):
    """
    Get content performance metrics from content and marketing agents
    """
    try:
        # Get content-related agent executions
        content_executions = db.query(models.AgentExecution).filter(
            models.AgentExecution.agent_name.in_([
                'content_strategist_agent', 'social_media_agent', 'writer_agent',
                'marketing_agent', 'content_agent'
            ])
        ).all()
        
        # Extract content metrics
        total_content_pieces = 0
        top_performing_content = 0
        average_engagement = 0
        conversion_rate = 0
        content_by_type = {}
        
        for execution in content_executions:
            if execution.output_data:
                output = execution.output_data
                if 'content_pieces' in output:
                    total_content_pieces += int(output.get('content_pieces', 0))
                if 'top_performing' in output:
                    top_performing_content += int(output.get('top_performing', 0))
                if 'engagement_rate' in output:
                    engagement = float(output.get('engagement_rate', 0))
                    average_engagement = (average_engagement + engagement) / 2
                if 'conversion_rate' in output:
                    conversion_rate = float(output.get('conversion_rate', 0))
                if 'content_by_type' in output:
                    content_types = output.get('content_by_type', {})
                    for content_type, count in content_types.items():
                        content_by_type[content_type] = content_by_type.get(content_type, 0) + count
        
        return {
            "total_content_pieces": total_content_pieces,
            "top_performing_content": top_performing_content,
            "average_engagement": average_engagement,
            "conversion_rate": conversion_rate,
            "content_by_type": content_by_type,
            "last_updated": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get content performance: {str(e)}")

@router.get("/urgent-actions")
async def get_urgent_actions(db: Session = Depends(get_db)):
    """
    Get urgent actions and alerts that need immediate attention
    """
    try:
        urgent_actions = []
        
        # Check for failed agent executions
        failed_executions = db.query(models.AgentExecution).filter(
            models.AgentExecution.status == 'failed'
        ).all()
        
        for execution in failed_executions:
            urgent_actions.append({
                "id": f"failed_execution_{execution.id}",
                "title": f"Agent {execution.agent_name} failed",
                "priority": "high",
                "type": "agent",
                "description": f"Task failed: {execution.error_message or 'Unknown error'}",
                "due_date": datetime.utcnow().isoformat(),
                "created_at": execution.created_at.isoformat() if execution.created_at else None
            })
        
        # Check for overdue workflows
        overdue_workflows = db.query(models.Workflow).filter(
            models.Workflow.status == 'running',
            models.Workflow.started_at < datetime.utcnow() - timedelta(hours=24)
        ).all()
        
        for workflow in overdue_workflows:
            urgent_actions.append({
                "id": f"overdue_workflow_{workflow.id}",
                "title": f"Workflow {workflow.id} is overdue",
                "priority": "medium",
                "type": "workflow",
                "description": f"Workflow has been running for over 24 hours",
                "due_date": datetime.utcnow().isoformat(),
                "created_at": workflow.started_at.isoformat() if workflow.started_at else None
            })
        
        # Check for high-priority customer issues
        customer_executions = db.query(models.AgentExecution).filter(
            models.AgentExecution.agent_name == 'customer_support_agent',
            models.AgentExecution.status == 'completed'
        ).all()
        
        for execution in customer_executions:
            if execution.output_data and execution.output_data.get('urgent_issues'):
                issues = execution.output_data['urgent_issues']
                for issue in issues:
                    urgent_actions.append({
                        "id": f"customer_issue_{execution.id}_{issue.get('id', '')}",
                        "title": f"Customer Issue: {issue.get('title', 'Unknown')}",
                        "priority": issue.get('priority', 'medium'),
                        "type": "customer",
                        "description": issue.get('description', 'No description'),
                        "due_date": issue.get('due_date', datetime.utcnow().isoformat()),
                        "created_at": execution.created_at.isoformat() if execution.created_at else None
                    })
        
        return {
            "urgent_actions": urgent_actions,
            "total_count": len(urgent_actions),
            "high_priority_count": len([a for a in urgent_actions if a['priority'] == 'high']),
            "last_updated": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get urgent actions: {str(e)}")

@router.get("/dashboard-overview")
async def get_dashboard_overview(db: Session = Depends(get_db)):
    """
    Get comprehensive dashboard overview combining all metrics
    """
    try:
        # Get all metrics in parallel
        financial_health = await get_financial_health(db)
        agent_activity = await get_agent_activity(db)
        customer_insights = await get_customer_insights(db)
        content_performance = await get_content_performance(db)
        urgent_actions = await get_urgent_actions(db)
        
        return {
            "financial_health": financial_health,
            "agent_activity": agent_activity,
            "customer_insights": customer_insights,
            "content_performance": content_performance,
            "urgent_actions": urgent_actions,
            "last_updated": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get dashboard overview: {str(e)}")
