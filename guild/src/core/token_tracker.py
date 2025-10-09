"""
Token Usage Tracker
Monitors LLM API costs and usage for economic efficiency and budget management.
"""

import asyncio
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from collections import defaultdict
import json

logger = logging.getLogger(__name__)


# Token pricing by model (per 1K tokens)
MODEL_PRICING = {
    # OpenAI Models
    "gpt-4": {"input": 0.03, "output": 0.06},
    "gpt-4-turbo": {"input": 0.01, "output": 0.03},
    "gpt-4o": {"input": 0.005, "output": 0.015},
    "gpt-4o-mini": {"input": 0.00015, "output": 0.0006},
    "gpt-3.5-turbo": {"input": 0.0005, "output": 0.0015},
    
    # Anthropic Models
    "claude-3-opus": {"input": 0.015, "output": 0.075},
    "claude-3-sonnet": {"input": 0.003, "output": 0.015},
    "claude-3-haiku": {"input": 0.00025, "output": 0.00125},
    "claude-3-5-sonnet": {"input": 0.003, "output": 0.015},
    
    # Google Models
    "gemini-1.5-pro": {"input": 0.00125, "output": 0.005},
    "gemini-1.5-flash": {"input": 0.000075, "output": 0.0003},
    
    # Default for unknown models
    "default": {"input": 0.002, "output": 0.006}
}


@dataclass
class TokenUsageRecord:
    """Record of a single LLM API call"""
    timestamp: datetime
    agent_name: str
    model: str
    input_tokens: int
    output_tokens: int
    total_tokens: int
    input_cost: float
    output_cost: float
    total_cost: float
    user_id: str
    task_id: Optional[str] = None
    workflow_id: Optional[str] = None
    response_time_ms: Optional[float] = None


@dataclass
class UsageReport:
    """Aggregated usage report"""
    period_start: datetime
    period_end: datetime
    total_tokens: int
    total_cost: float
    total_calls: int
    by_agent: Dict[str, Dict[str, Any]]
    by_model: Dict[str, Dict[str, Any]]
    by_user: Dict[str, Dict[str, Any]]
    top_expensive_calls: List[Dict[str, Any]]
    cost_trend: List[Dict[str, Any]]
    budget_status: Optional[Dict[str, Any]] = None


class TokenTracker:
    """
    Tracks LLM token usage and costs across all agents and users.
    Provides usage analytics, cost monitoring, and budget alerts.
    """
    
    def __init__(self, storage_backend=None):
        self.usage_records: List[TokenUsageRecord] = []
        self.user_budgets: Dict[str, float] = {}  # user_id -> monthly budget
        self.budget_alerts_sent: Dict[str, datetime] = {}
        self.storage_backend = storage_backend
        
    async def track_llm_call(
        self,
        agent_name: str,
        model: str,
        input_tokens: int,
        output_tokens: int,
        user_id: str,
        task_id: Optional[str] = None,
        workflow_id: Optional[str] = None,
        response_time_ms: Optional[float] = None
    ) -> TokenUsageRecord:
        """
        Track a single LLM API call.
        
        Args:
            agent_name: Name of the agent making the call
            model: Model used (e.g., "gpt-4", "claude-3-sonnet")
            input_tokens: Number of input tokens
            output_tokens: Number of output tokens
            user_id: User identifier
            task_id: Optional task identifier
            workflow_id: Optional workflow identifier
            response_time_ms: Optional response time in milliseconds
            
        Returns:
            TokenUsageRecord with calculated costs
        """
        # Calculate costs
        pricing = MODEL_PRICING.get(model, MODEL_PRICING["default"])
        
        input_cost = (input_tokens / 1000.0) * pricing["input"]
        output_cost = (output_tokens / 1000.0) * pricing["output"]
        total_cost = input_cost + output_cost
        total_tokens = input_tokens + output_tokens
        
        # Create usage record
        record = TokenUsageRecord(
            timestamp=datetime.now(),
            agent_name=agent_name,
            model=model,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            total_tokens=total_tokens,
            input_cost=input_cost,
            output_cost=output_cost,
            total_cost=total_cost,
            user_id=user_id,
            task_id=task_id,
            workflow_id=workflow_id,
            response_time_ms=response_time_ms
        )
        
        # Store record
        self.usage_records.append(record)
        
        # Persist to storage if available
        if self.storage_backend:
            await self._persist_record(record)
        
        # Check budget alerts
        await self._check_budget_alert(user_id, total_cost)
        
        logger.info(
            f"Tracked LLM call: agent={agent_name}, model={model}, "
            f"tokens={total_tokens}, cost=${total_cost:.4f}"
        )
        
        return record
    
    async def get_usage_report(
        self,
        user_id: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        time_period: str = "30d"
    ) -> UsageReport:
        """
        Generate comprehensive usage report.
        
        Args:
            user_id: Filter by user (None for all users)
            start_date: Start of reporting period
            end_date: End of reporting period
            time_period: Period string ("7d", "30d", "90d") if dates not provided
            
        Returns:
            UsageReport with aggregated statistics
        """
        # Determine time range
        if not end_date:
            end_date = datetime.now()
        
        if not start_date:
            if time_period == "7d":
                start_date = end_date - timedelta(days=7)
            elif time_period == "30d":
                start_date = end_date - timedelta(days=30)
            elif time_period == "90d":
                start_date = end_date - timedelta(days=90)
            else:
                start_date = end_date - timedelta(days=30)
        
        # Filter records
        filtered_records = [
            r for r in self.usage_records
            if start_date <= r.timestamp <= end_date
            and (user_id is None or r.user_id == user_id)
        ]
        
        if not filtered_records:
            return self._empty_report(start_date, end_date)
        
        # Calculate aggregates
        total_tokens = sum(r.total_tokens for r in filtered_records)
        total_cost = sum(r.total_cost for r in filtered_records)
        total_calls = len(filtered_records)
        
        # Aggregate by agent
        by_agent = defaultdict(lambda: {
            "tokens": 0,
            "cost": 0.0,
            "calls": 0,
            "avg_tokens_per_call": 0
        })
        
        for record in filtered_records:
            by_agent[record.agent_name]["tokens"] += record.total_tokens
            by_agent[record.agent_name]["cost"] += record.total_cost
            by_agent[record.agent_name]["calls"] += 1
        
        # Calculate averages
        for agent_name, stats in by_agent.items():
            stats["avg_tokens_per_call"] = stats["tokens"] / stats["calls"]
        
        # Aggregate by model
        by_model = defaultdict(lambda: {
            "tokens": 0,
            "cost": 0.0,
            "calls": 0
        })
        
        for record in filtered_records:
            by_model[record.model]["tokens"] += record.total_tokens
            by_model[record.model]["cost"] += record.total_cost
            by_model[record.model]["calls"] += 1
        
        # Aggregate by user
        by_user = defaultdict(lambda: {
            "tokens": 0,
            "cost": 0.0,
            "calls": 0
        })
        
        for record in filtered_records:
            by_user[record.user_id]["tokens"] += record.total_tokens
            by_user[record.user_id]["cost"] += record.total_cost
            by_user[record.user_id]["calls"] += 1
        
        # Top expensive calls
        top_expensive = sorted(
            filtered_records,
            key=lambda r: r.total_cost,
            reverse=True
        )[:10]
        
        top_expensive_calls = [
            {
                "agent_name": r.agent_name,
                "model": r.model,
                "tokens": r.total_tokens,
                "cost": r.total_cost,
                "timestamp": r.timestamp.isoformat()
            }
            for r in top_expensive
        ]
        
        # Cost trend (daily aggregates)
        cost_trend = self._calculate_cost_trend(filtered_records, start_date, end_date)
        
        # Budget status
        budget_status = None
        if user_id and user_id in self.user_budgets:
            budget = self.user_budgets[user_id]
            budget_status = {
                "monthly_budget": budget,
                "current_spend": total_cost,
                "remaining": budget - total_cost,
                "percentage_used": (total_cost / budget * 100) if budget > 0 else 0,
                "on_track": total_cost <= (budget * (datetime.now().day / 30))
            }
        
        return UsageReport(
            period_start=start_date,
            period_end=end_date,
            total_tokens=total_tokens,
            total_cost=total_cost,
            total_calls=total_calls,
            by_agent=dict(by_agent),
            by_model=dict(by_model),
            by_user=dict(by_user),
            top_expensive_calls=top_expensive_calls,
            cost_trend=cost_trend,
            budget_status=budget_status
        )
    
    def set_user_budget(self, user_id: str, monthly_budget: float):
        """Set monthly budget for a user"""
        self.user_budgets[user_id] = monthly_budget
        logger.info(f"Set monthly budget for user {user_id}: ${monthly_budget}")
    
    async def get_user_budget_status(self, user_id: str) -> Dict[str, Any]:
        """Get current budget status for a user"""
        if user_id not in self.user_budgets:
            return {
                "has_budget": False,
                "message": "No budget set for this user"
            }
        
        # Get current month's usage
        start_of_month = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        report = await self.get_usage_report(
            user_id=user_id,
            start_date=start_of_month
        )
        
        budget = self.user_budgets[user_id]
        current_spend = report.total_cost
        
        return {
            "has_budget": True,
            "monthly_budget": budget,
            "current_spend": current_spend,
            "remaining": budget - current_spend,
            "percentage_used": (current_spend / budget * 100) if budget > 0 else 0,
            "days_into_month": datetime.now().day,
            "projected_monthly_spend": (current_spend / datetime.now().day) * 30,
            "on_track": current_spend <= (budget * (datetime.now().day / 30)),
            "alert_threshold_90": current_spend >= (budget * 0.9),
            "alert_threshold_75": current_spend >= (budget * 0.75),
            "alert_threshold_50": current_spend >= (budget * 0.5)
        }
    
    def _calculate_cost_trend(
        self,
        records: List[TokenUsageRecord],
        start_date: datetime,
        end_date: datetime
    ) -> List[Dict[str, Any]]:
        """Calculate daily cost trend"""
        # Group by date
        daily_costs = defaultdict(lambda: {"cost": 0.0, "tokens": 0, "calls": 0})
        
        for record in records:
            date_key = record.timestamp.date().isoformat()
            daily_costs[date_key]["cost"] += record.total_cost
            daily_costs[date_key]["tokens"] += record.total_tokens
            daily_costs[date_key]["calls"] += 1
        
        # Create trend list
        current_date = start_date.date()
        end = end_date.date()
        trend = []
        
        while current_date <= end:
            date_key = current_date.isoformat()
            trend.append({
                "date": date_key,
                "cost": daily_costs[date_key]["cost"],
                "tokens": daily_costs[date_key]["tokens"],
                "calls": daily_costs[date_key]["calls"]
            })
            current_date += timedelta(days=1)
        
        return trend
    
    def _empty_report(self, start_date: datetime, end_date: datetime) -> UsageReport:
        """Generate empty report when no records found"""
        return UsageReport(
            period_start=start_date,
            period_end=end_date,
            total_tokens=0,
            total_cost=0.0,
            total_calls=0,
            by_agent={},
            by_model={},
            by_user={},
            top_expensive_calls=[],
            cost_trend=[]
        )
    
    async def _check_budget_alert(self, user_id: str, new_cost: float):
        """Check if budget alert should be sent"""
        if user_id not in self.user_budgets:
            return
        
        budget_status = await self.get_user_budget_status(user_id)
        
        # Check alert thresholds (50%, 75%, 90%)
        thresholds = [
            (0.5, "50% of budget used"),
            (0.75, "75% of budget used - warning"),
            (0.9, "90% of budget used - critical")
        ]
        
        for threshold_pct, message in thresholds:
            threshold_key = f"{user_id}_{threshold_pct}"
            
            if budget_status["percentage_used"] >= threshold_pct * 100:
                # Check if we've already sent this alert this month
                last_alert = self.budget_alerts_sent.get(threshold_key)
                start_of_month = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
                
                if not last_alert or last_alert < start_of_month:
                    # Send alert
                    await self._send_budget_alert(user_id, budget_status, message)
                    self.budget_alerts_sent[threshold_key] = datetime.now()
    
    async def _send_budget_alert(
        self,
        user_id: str,
        budget_status: Dict[str, Any],
        message: str
    ):
        """Send budget alert to user"""
        logger.warning(
            f"BUDGET ALERT for user {user_id}: {message}. "
            f"Current spend: ${budget_status['current_spend']:.2f} / "
            f"${budget_status['monthly_budget']:.2f}"
        )
        
        # TODO: Integrate with notification system
        # await notification_service.send_alert(user_id, "budget_warning", {
        #     "message": message,
        #     "budget_status": budget_status
        # })
    
    async def _persist_record(self, record: TokenUsageRecord):
        """Persist usage record to storage backend"""
        if self.storage_backend:
            try:
                await self.storage_backend.save_token_usage(asdict(record))
            except Exception as e:
                logger.error(f"Failed to persist token usage record: {e}")
    
    async def export_usage_data(
        self,
        user_id: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        format: str = "json"
    ) -> str:
        """Export usage data in specified format"""
        report = await self.get_usage_report(user_id, start_date, end_date)
        
        if format == "json":
            return json.dumps(asdict(report), default=str, indent=2)
        elif format == "csv":
            # TODO: Implement CSV export
            return "CSV export not yet implemented"
        else:
            raise ValueError(f"Unsupported export format: {format}")


# Global token tracker instance
token_tracker = TokenTracker()


# Convenience functions

async def track_llm_call(
    agent_name: str,
    model: str,
    input_tokens: int,
    output_tokens: int,
    user_id: str,
    **kwargs
) -> TokenUsageRecord:
    """Track an LLM API call"""
    return await token_tracker.track_llm_call(
        agent_name, model, input_tokens, output_tokens, user_id, **kwargs
    )


async def get_usage_report(
    user_id: Optional[str] = None,
    time_period: str = "30d"
) -> UsageReport:
    """Get usage report for user or all users"""
    return await token_tracker.get_usage_report(user_id=user_id, time_period=time_period)


def set_user_budget(user_id: str, monthly_budget: float):
    """Set monthly budget for a user"""
    token_tracker.set_user_budget(user_id, monthly_budget)


async def get_budget_status(user_id: str) -> Dict[str, Any]:
    """Get budget status for a user"""
    return await token_tracker.get_user_budget_status(user_id)

