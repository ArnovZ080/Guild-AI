from fastapi import APIRouter, HTTPException, Request
from typing import List, Dict, Any
from datetime import datetime, timedelta

router = APIRouter(tags=["agents"])


def _now_iso() -> str:
    return datetime.utcnow().isoformat() + "Z"


@router.get("/agents/available")
async def list_available_agents(request: Request) -> List[Dict[str, Any]]:
    # TODO: Replace stub with real subscription + rental lookup and catalog
    # For now, expose a minimal list with rates and entitlement flags
    included_ids = set([
        # derive from subscription in real impl
        "research_agent",
        "marketing_agent",
    ])

    # Example rental state; in real impl join with DB
    hired_until_map: Dict[str, datetime] = {}

    catalog: List[Dict[str, Any]] = [
        {
            "agent_id": "research_agent",
            "name": "Research Agent",
            "description": "Web research and information gathering",
            "category": "research",
            "icon": "🔍",
            "color": "indigo",
            "status": "active",
            "daily_rate_usd": 29,
            "monthly_rate_usd": 199,
            "can_hire_daily": True,
            "can_hire_monthly": True,
        },
        {
            "agent_id": "marketing_agent",
            "name": "Marketing Agent",
            "description": "Campaign creation and optimization",
            "category": "marketing",
            "icon": "📢",
            "color": "blue",
            "status": "active",
            "daily_rate_usd": 39,
            "monthly_rate_usd": 249,
            "can_hire_daily": True,
            "can_hire_monthly": True,
        },
        {
            "agent_id": "sales_agent",
            "name": "Sales Agent",
            "description": "Lead qualification and follow-ups",
            "category": "sales",
            "icon": "💰",
            "color": "green",
            "status": "active",
            "daily_rate_usd": 35,
            "monthly_rate_usd": 229,
            "can_hire_daily": True,
            "can_hire_monthly": True,
        },
        {
            "agent_id": "operations_agent",
            "name": "Operations Agent",
            "description": "Business process automation",
            "category": "operations",
            "icon": "⚙️",
            "color": "orange",
            "status": "active",
            "daily_rate_usd": 25,
            "monthly_rate_usd": 179,
            "can_hire_daily": True,
            "can_hire_monthly": True,
        },
    ]

    results: List[Dict[str, Any]] = []
    now_dt = datetime.utcnow()
    for a in catalog:
        agent_id = a["agent_id"]
        hired_until_dt = hired_until_map.get(agent_id)
        results.append({
            **a,
            "included_in_subscription": agent_id in included_ids,
            "hired_until": hired_until_dt.isoformat() + "Z" if hired_until_dt else None,
        })
    return results


@router.post("/agents/hire")
async def hire_agent(body: Dict[str, Any]) -> Dict[str, str]:
    agent_id = body.get("agent_id")
    term = body.get("term")  # 'day' | 'month'
    if agent_id is None or term not in ("day", "month"):
        raise HTTPException(status_code=400, detail="Invalid hiring request")
    # In a real implementation, create a checkout session with your PSP and return URL
    # For now, return a placeholder URL that frontend can follow
    # Optionally include a token to identify pending rental
    return {"checkout_url": f"/payment/checkout?agent_id={agent_id}&term={term}"}


