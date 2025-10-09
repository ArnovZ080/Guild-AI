"""
Token Usage API
Provides endpoints for monitoring LLM token usage and costs.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from datetime import datetime
from pydantic import BaseModel

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent.parent.parent.parent))

from guild.src.core.token_tracker import (
    token_tracker,
    get_usage_report,
    get_budget_status,
    set_user_budget
)

router = APIRouter()


class BudgetSetRequest(BaseModel):
    """Request model for setting user budget"""
    monthly_budget: float


class UsageReportResponse(BaseModel):
    """Response model for usage report"""
    period_start: str
    period_end: str
    total_tokens: int
    total_cost: float
    total_calls: int
    by_agent: dict
    by_model: dict
    by_user: dict
    top_expensive_calls: list
    cost_trend: list
    budget_status: Optional[dict] = None


@router.get("/usage/{user_id}", response_model=UsageReportResponse)
async def get_token_usage(
    user_id: str,
    time_period: str = Query(default="30d", regex="^(7d|30d|90d|all)$")
):
    """
    Get token usage report for a user.
    
    Returns comprehensive usage statistics including costs by agent, model,
    cost trends, and budget status if applicable.
    """
    try:
        report = await get_usage_report(user_id=user_id, time_period=time_period)
        
        return UsageReportResponse(
            period_start=report.period_start.isoformat(),
            period_end=report.period_end.isoformat(),
            total_tokens=report.total_tokens,
            total_cost=report.total_cost,
            total_calls=report.total_calls,
            by_agent=report.by_agent,
            by_model=report.by_model,
            by_user=report.by_user,
            top_expensive_calls=report.top_expensive_calls,
            cost_trend=report.cost_trend,
            budget_status=report.budget_status
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get usage report: {str(e)}")


@router.get("/usage/all")
async def get_all_usage(
    time_period: str = Query(default="30d", regex="^(7d|30d|90d|all)$")
):
    """
    Get token usage report across all users.
    
    Provides system-wide usage statistics.
    """
    try:
        report = await get_usage_report(user_id=None, time_period=time_period)
        
        return UsageReportResponse(
            period_start=report.period_start.isoformat(),
            period_end=report.period_end.isoformat(),
            total_tokens=report.total_tokens,
            total_cost=report.total_cost,
            total_calls=report.total_calls,
            by_agent=report.by_agent,
            by_model=report.by_model,
            by_user=report.by_user,
            top_expensive_calls=report.top_expensive_calls,
            cost_trend=report.cost_trend
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get usage report: {str(e)}")


@router.get("/budget/{user_id}")
async def get_user_budget(user_id: str):
    """
    Get budget status for a user.
    
    Returns current spend, remaining budget, and alert status.
    """
    try:
        budget_status = await get_budget_status(user_id)
        return budget_status
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get budget status: {str(e)}")


@router.post("/budget/{user_id}")
async def set_budget(user_id: str, request: BudgetSetRequest):
    """
    Set monthly budget for a user.
    
    Budget alerts will be triggered at 50%, 75%, and 90% thresholds.
    """
    try:
        if request.monthly_budget < 0:
            raise HTTPException(status_code=400, detail="Budget must be positive")
        
        set_user_budget(user_id, request.monthly_budget)
        
        return {
            "success": True,
            "user_id": user_id,
            "monthly_budget": request.monthly_budget,
            "message": f"Budget set to ${request.monthly_budget}/month"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to set budget: {str(e)}")


@router.get("/cost-breakdown/{user_id}")
async def get_cost_breakdown(
    user_id: str,
    time_period: str = Query(default="30d", regex="^(7d|30d|90d|all)$")
):
    """
    Get detailed cost breakdown by agent and model.
    
    Provides insights into which agents and models are most expensive.
    """
    try:
        report = await get_usage_report(user_id=user_id, time_period=time_period)
        
        # Sort agents by cost
        agents_by_cost = sorted(
            report.by_agent.items(),
            key=lambda x: x[1]["cost"],
            reverse=True
        )
        
        # Sort models by cost
        models_by_cost = sorted(
            report.by_model.items(),
            key=lambda x: x[1]["cost"],
            reverse=True
        )
        
        return {
            "user_id": user_id,
            "period": time_period,
            "total_cost": report.total_cost,
            "agents_by_cost": [
                {
                    "agent_name": name,
                    "cost": data["cost"],
                    "tokens": data["tokens"],
                    "calls": data["calls"],
                    "percentage_of_total": (data["cost"] / report.total_cost * 100) if report.total_cost > 0 else 0
                }
                for name, data in agents_by_cost
            ],
            "models_by_cost": [
                {
                    "model": name,
                    "cost": data["cost"],
                    "tokens": data["tokens"],
                    "calls": data["calls"],
                    "percentage_of_total": (data["cost"] / report.total_cost * 100) if report.total_cost > 0 else 0
                }
                for name, data in models_by_cost
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get cost breakdown: {str(e)}")


@router.get("/cost-trends/{user_id}")
async def get_cost_trends(
    user_id: str,
    time_period: str = Query(default="30d", regex="^(7d|30d|90d)$")
):
    """
    Get daily cost trends for visualization.
    
    Returns daily aggregates for charting and trend analysis.
    """
    try:
        report = await get_usage_report(user_id=user_id, time_period=time_period)
        
        return {
            "user_id": user_id,
            "period": time_period,
            "total_cost": report.total_cost,
            "daily_costs": report.cost_trend,
            "average_daily_cost": report.total_cost / len(report.cost_trend) if report.cost_trend else 0,
            "projected_monthly_cost": (report.total_cost / len(report.cost_trend) * 30) if report.cost_trend else 0
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get cost trends: {str(e)}")


@router.get("/export/{user_id}")
async def export_usage_data(
    user_id: str,
    time_period: str = Query(default="30d", regex="^(7d|30d|90d|all)$"),
    format: str = Query(default="json", regex="^(json|csv)$")
):
    """
    Export usage data in specified format.
    
    Supports JSON and CSV formats for external analysis.
    """
    try:
        data = await token_tracker.export_usage_data(
            user_id=user_id,
            format=format
        )
        
        return {
            "success": True,
            "format": format,
            "data": data
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to export usage data: {str(e)}")


# Include router in main API
def setup_token_usage_routes(app):
    """Setup token usage routes in FastAPI app"""
    app.include_router(router, prefix="/api/analytics/token-usage", tags=["analytics", "token-usage"])

