"""
Subscription API Endpoints
Provides subscription management and agent hiring capabilities.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Any, Optional

from ..middleware.subscription_checker import (
    subscription_checker,
    get_user_subscription_tier,
    get_user_tier_limits,
    hire_agent_for_user,
    release_agent_for_user,
    get_user_available_agents,
    check_workflow_limit,
    check_feature_access,
    SubscriptionTier
)

router = APIRouter(prefix="/api/subscription", tags=["subscription"])


# Request/Response Models

class HireAgentRequest(BaseModel):
    """Request to hire an agent"""
    user_id: str
    agent_id: str


class ReleaseAgentRequest(BaseModel):
    """Request to release an agent"""
    user_id: str
    agent_id: str


class CheckFeatureRequest(BaseModel):
    """Request to check feature access"""
    user_id: str
    feature: str


# API Endpoints

@router.get("/tier/{user_id}")
async def get_subscription_tier(user_id: str) -> Dict[str, Any]:
    """Get user's subscription tier and limits"""
    try:
        tier = await get_user_subscription_tier(user_id)
        limits = await get_user_tier_limits(user_id)
        
        return {
            "status": "success",
            "user_id": user_id,
            "subscription_tier": tier.value,
            "limits": {
                "max_agents": limits.max_agents,
                "max_workflows_per_month": limits.max_workflows_per_month,
                "max_integrations": limits.max_integrations,
                "core_agents_count": len(limits.core_agents_included),
                "premium_features": limits.premium_features
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/agents/{user_id}")
async def get_available_agents_endpoint(user_id: str) -> Dict[str, Any]:
    """
    Get all agents available to user based on subscription.
    Includes core agents, hired agents, and agents available to hire.
    """
    try:
        agents_data = await get_user_available_agents(user_id)
        
        return {
            "status": "success",
            "user_id": user_id,
            **agents_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/agents/hire")
async def hire_agent_endpoint(request: HireAgentRequest) -> Dict[str, Any]:
    """Hire an agent for user's workforce"""
    try:
        result = await hire_agent_for_user(request.user_id, request.agent_id)
        
        if not result['success']:
            # Check if upgrade required
            if result.get('requires_upgrade'):
                raise HTTPException(
                    status_code=402,  # Payment Required
                    detail=result['error']
                )
            raise HTTPException(status_code=400, detail=result['error'])
        
        return {
            "status": "success",
            **result
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/agents/release")
async def release_agent_endpoint(request: ReleaseAgentRequest) -> Dict[str, Any]:
    """Release an agent from user's workforce"""
    try:
        result = await release_agent_for_user(request.user_id, request.agent_id)
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['error'])
        
        return {
            "status": "success",
            **result
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/workflow/check/{user_id}")
async def check_workflow_limit_endpoint(user_id: str) -> Dict[str, Any]:
    """Check if user can create a new workflow"""
    try:
        can_create, reason = await check_workflow_limit(user_id)
        
        return {
            "status": "success",
            "can_create_workflow": can_create,
            "reason": reason,
            "requires_upgrade": not can_create
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/feature/check")
async def check_feature_access_endpoint(request: CheckFeatureRequest) -> Dict[str, Any]:
    """Check if user has access to a premium feature"""
    try:
        has_access = await check_feature_access(request.user_id, request.feature)
        
        return {
            "status": "success",
            "has_access": has_access,
            "feature": request.feature
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/usage/{user_id}")
async def get_usage_stats(user_id: str) -> Dict[str, Any]:
    """Get user's current usage statistics"""
    try:
        tier = await get_user_subscription_tier(user_id)
        limits = await get_user_tier_limits(user_id)
        agents_data = await get_user_available_agents(user_id)
        
        # Get workflow count
        workflow_count = subscription_checker.user_workflow_counts.get(user_id, 0)
        
        return {
            "status": "success",
            "user_id": user_id,
            "subscription_tier": tier.value,
            "usage": {
                "agents_hired": len(agents_data['hired_agents']),
                "agents_limit": limits.max_agents,
                "agents_remaining": limits.max_agents - len(agents_data['hired_agents']) if limits.max_agents != -1 else -1,
                "workflows_this_month": workflow_count,
                "workflow_limit": limits.max_workflows_per_month,
                "workflows_remaining": limits.max_workflows_per_month - workflow_count if limits.max_workflows_per_month != -1 else -1
            },
            "limits": {
                "max_agents": limits.max_agents,
                "max_workflows_per_month": limits.max_workflows_per_month,
                "max_integrations": limits.max_integrations
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/upgrade-info/{user_id}")
async def get_upgrade_info(user_id: str) -> Dict[str, Any]:
    """Get information about upgrading subscription"""
    try:
        current_tier = await get_user_subscription_tier(user_id)
        
        # Build upgrade path
        upgrade_options = []
        
        if current_tier == SubscriptionTier.FREE:
            upgrade_options = [
                {
                    "tier": "starter",
                    "price": "$29/month",
                    "benefits": [
                        "5 hired agents (vs 3)",
                        "500 workflows/month (vs 100)",
                        "15 integrations (vs 5)",
                        "Basic automation",
                        "Basic analytics"
                    ]
                },
                {
                    "tier": "growth",
                    "price": "$99/month",
                    "benefits": [
                        "10 hired agents",
                        "1,000 workflows/month",
                        "40 integrations",
                        "Advanced automation",
                        "AI content generation",
                        "Advanced analytics"
                    ]
                }
            ]
        elif current_tier == SubscriptionTier.STARTER:
            upgrade_options = [
                {
                    "tier": "growth",
                    "price": "$99/month",
                    "benefits": [
                        "10 hired agents (vs 5)",
                        "1,000 workflows/month (vs 500)",
                        "40 integrations (vs 15)",
                        "Advanced automation",
                        "AI content generation"
                    ]
                },
                {
                    "tier": "enterprise",
                    "price": "Custom pricing",
                    "benefits": [
                        "Unlimited agents",
                        "Unlimited workflows",
                        "Unlimited integrations",
                        "All features",
                        "Priority support",
                        "Custom integrations"
                    ]
                }
            ]
        elif current_tier == SubscriptionTier.GROWTH:
            upgrade_options = [
                {
                    "tier": "enterprise",
                    "price": "Custom pricing",
                    "benefits": [
                        "Unlimited agents",
                        "Unlimited workflows",
                        "Unlimited integrations",
                        "All features",
                        "Priority support",
                        "Custom integrations",
                        "Dedicated account manager"
                    ]
                }
            ]
        
        return {
            "status": "success",
            "current_tier": current_tier.value,
            "upgrade_options": upgrade_options
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

