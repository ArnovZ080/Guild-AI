"""
Analytics API endpoints for dashboard data
Provides analytics data that the frontend expects
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import json

from ..database import get_db
from .. import models

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"],
)

@router.get("/marketing")
async def get_marketing_analytics(db: Session = Depends(get_db)):
    """
    Get marketing analytics data
    """
    try:
        # Get marketing-related agent executions
        marketing_executions = db.query(models.AgentExecution).filter(
            models.AgentExecution.agent_name.in_([
                'marketing_agent', 'social_media_agent', 'content_strategist_agent',
                'ad_copy_agent', 'campaign_agent'
            ])
        ).all()
        
        # Calculate marketing metrics
        total_campaigns = 0
        active_campaigns = 0
        total_spend = 0
        total_revenue = 0
        conversion_rate = 0
        engagement_rate = 0
        
        for execution in marketing_executions:
            if execution.output_data:
                output = execution.output_data
                if 'campaigns_created' in output:
                    total_campaigns += int(output.get('campaigns_created', 0))
                if 'active_campaigns' in output:
                    active_campaigns += int(output.get('active_campaigns', 0))
                if 'spend' in output:
                    total_spend += float(output.get('spend', 0))
                if 'revenue_generated' in output:
                    total_revenue += float(output.get('revenue_generated', 0))
                if 'conversion_rate' in output:
                    conversion_rate = float(output.get('conversion_rate', 0))
                if 'engagement_rate' in output:
                    engagement_rate = float(output.get('engagement_rate', 0))
        
        # Calculate ROI
        roi = ((total_revenue - total_spend) / total_spend * 100) if total_spend > 0 else 0
        
        return {
            "total_campaigns": total_campaigns,
            "active_campaigns": active_campaigns,
            "total_spend": total_spend,
            "total_revenue": total_revenue,
            "roi": roi,
            "conversion_rate": conversion_rate,
            "engagement_rate": engagement_rate,
            "last_updated": datetime.utcnow().isoformat(),
            "status": "success"
        }
        
    except Exception as e:
        return {
            "error": f"Failed to get marketing analytics: {str(e)}",
            "status": "error",
            "total_campaigns": 0,
            "active_campaigns": 0,
            "total_spend": 0,
            "total_revenue": 0,
            "roi": 0,
            "conversion_rate": 0,
            "engagement_rate": 0,
            "last_updated": datetime.utcnow().isoformat()
        }

@router.get("/social")
async def get_social_analytics(db: Session = Depends(get_db)):
    """
    Get social media analytics data
    """
    try:
        # Get social media-related agent executions
        social_executions = db.query(models.AgentExecution).filter(
            models.AgentExecution.agent_name.in_([
                'social_media_agent', 'content_strategist_agent', 'community_manager_agent'
            ])
        ).all()
        
        # Calculate social metrics
        total_posts = 0
        total_followers = 0
        total_engagement = 0
        average_engagement_rate = 0
        top_performing_posts = 0
        social_platforms = {}
        
        for execution in social_executions:
            if execution.output_data:
                output = execution.output_data
                if 'posts_created' in output:
                    total_posts += int(output.get('posts_created', 0))
                if 'followers' in output:
                    total_followers += int(output.get('followers', 0))
                if 'total_engagement' in output:
                    total_engagement += int(output.get('total_engagement', 0))
                if 'engagement_rate' in output:
                    rate = float(output.get('engagement_rate', 0))
                    average_engagement_rate = (average_engagement_rate + rate) / 2
                if 'top_posts' in output:
                    top_performing_posts += int(output.get('top_posts', 0))
                if 'platform_data' in output:
                    platforms = output.get('platform_data', {})
                    for platform, data in platforms.items():
                        if platform not in social_platforms:
                            social_platforms[platform] = {
                                'followers': 0,
                                'posts': 0,
                                'engagement': 0
                            }
                        social_platforms[platform]['followers'] += data.get('followers', 0)
                        social_platforms[platform]['posts'] += data.get('posts', 0)
                        social_platforms[platform]['engagement'] += data.get('engagement', 0)
        
        return {
            "total_posts": total_posts,
            "total_followers": total_followers,
            "total_engagement": total_engagement,
            "average_engagement_rate": average_engagement_rate,
            "top_performing_posts": top_performing_posts,
            "platforms": social_platforms,
            "last_updated": datetime.utcnow().isoformat(),
            "status": "success"
        }
        
    except Exception as e:
        return {
            "error": f"Failed to get social analytics: {str(e)}",
            "status": "error",
            "total_posts": 0,
            "total_followers": 0,
            "total_engagement": 0,
            "average_engagement_rate": 0,
            "top_performing_posts": 0,
            "platforms": {},
            "last_updated": datetime.utcnow().isoformat()
        }

@router.get("/financial")
async def get_financial_analytics(db: Session = Depends(get_db)):
    """
    Get financial analytics data
    """
    try:
        # Get financial-related agent executions
        financial_executions = db.query(models.AgentExecution).filter(
            models.AgentExecution.agent_name.in_([
                'bookkeeping_agent', 'accounting_agent', 'financial_agent',
                'pricing_agent', 'revenue_optimization_agent'
            ])
        ).all()
        
        # Calculate financial metrics
        total_revenue = 0
        total_expenses = 0
        net_profit = 0
        profit_margin = 0
        cash_flow = 0
        growth_rate = 0
        monthly_recurring_revenue = 0
        
        for execution in financial_executions:
            if execution.output_data:
                output = execution.output_data
                if 'revenue' in output:
                    total_revenue += float(output.get('revenue', 0))
                if 'expenses' in output:
                    total_expenses += float(output.get('expenses', 0))
                if 'profit' in output:
                    net_profit += float(output.get('profit', 0))
                if 'profit_margin' in output:
                    profit_margin = float(output.get('profit_margin', 0))
                if 'cash_flow' in output:
                    cash_flow += float(output.get('cash_flow', 0))
                if 'growth_rate' in output:
                    growth_rate = float(output.get('growth_rate', 0))
                if 'mrr' in output:
                    monthly_recurring_revenue += float(output.get('mrr', 0))
        
        # Calculate derived metrics
        net_profit = total_revenue - total_expenses
        profit_margin_percent = (net_profit / total_revenue * 100) if total_revenue > 0 else 0
        
        return {
            "total_revenue": total_revenue,
            "total_expenses": total_expenses,
            "net_profit": net_profit,
            "profit_margin": profit_margin_percent,
            "cash_flow": cash_flow,
            "growth_rate": growth_rate,
            "monthly_recurring_revenue": monthly_recurring_revenue,
            "last_updated": datetime.utcnow().isoformat(),
            "status": "success"
        }
        
    except Exception as e:
        return {
            "error": f"Failed to get financial analytics: {str(e)}",
            "status": "error",
            "total_revenue": 0,
            "total_expenses": 0,
            "net_profit": 0,
            "profit_margin": 0,
            "cash_flow": 0,
            "growth_rate": 0,
            "monthly_recurring_revenue": 0,
            "last_updated": datetime.utcnow().isoformat()
        }

@router.get("/overview")
async def get_analytics_overview(db: Session = Depends(get_db)):
    """
    Get comprehensive analytics overview
    """
    try:
        # Get all analytics in parallel
        marketing = await get_marketing_analytics(db)
        social = await get_social_analytics(db)
        financial = await get_financial_analytics(db)
        
        return {
            "marketing": marketing,
            "social": social,
            "financial": financial,
            "last_updated": datetime.utcnow().isoformat(),
            "status": "success"
        }
        
    except Exception as e:
        return {
            "error": f"Failed to get analytics overview: {str(e)}",
            "status": "error",
            "last_updated": datetime.utcnow().isoformat()
        }
