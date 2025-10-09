"""
Subscription Enforcement Middleware
Enforces agent limits and feature access based on user subscription tier.
"""

from fastapi import HTTPException, Request
from typing import Dict, List, Any, Optional
from enum import Enum
from dataclasses import dataclass


class SubscriptionTier(Enum):
    """Subscription tiers"""
    FREE = "free"
    STARTER = "starter"
    GROWTH = "growth"
    ENTERPRISE = "enterprise"


@dataclass
class TierLimits:
    """Limits for each subscription tier"""
    tier: SubscriptionTier
    max_agents: int  # Max simultaneous hired agents
    max_workflows_per_month: int
    max_integrations: int
    core_agents_included: List[str]  # Always available
    premium_features: List[str]


# Subscription tier configuration
TIER_LIMITS = {
    SubscriptionTier.FREE: TierLimits(
        tier=SubscriptionTier.FREE,
        max_agents=3,
        max_workflows_per_month=100,
        max_integrations=5,
        core_agents_included=[
            # Always available agents (free tier)
            "JudgeAgent",
            "OrchestratorAgent",
            "BusinessIntelligenceAgent",
            "OnboardingAgent",
            "CalendarHarmonyAgent"
        ],
        premium_features=[]
    ),
    SubscriptionTier.STARTER: TierLimits(
        tier=SubscriptionTier.STARTER,
        max_agents=5,
        max_workflows_per_month=500,
        max_integrations=15,
        core_agents_included=[
            # Core agents (always available)
            "JudgeAgent",
            "OrchestratorAgent",
            "AutomationAgent",
            "ConnectorAgent",
            "BusinessIntelligenceAgent",
            "FinancialIntelligenceAgent",
            "CustomerIntelligenceAgent",
            "ContentIntelligenceAgent",
            "OnboardingAgent",
            "CalendarHarmonyAgent"
        ],
        premium_features=["basic_automation", "basic_analytics"]
    ),
    SubscriptionTier.GROWTH: TierLimits(
        tier=SubscriptionTier.GROWTH,
        max_agents=10,
        max_workflows_per_month=1000,
        max_integrations=40,
        core_agents_included=[
            # Core agents + intelligence layer
            "JudgeAgent",
            "OrchestratorAgent",
            "OrchestrationTuner",
            "AutomationAgent",
            "ConnectorAgent",
            "BusinessIntelligenceAgent",
            "FinancialIntelligenceAgent",
            "CustomerIntelligenceAgent",
            "ContentIntelligenceAgent",
            "CompetitiveIntelligenceAgent",
            "OnboardingAgent",
            "CalendarHarmonyAgent"
        ],
        premium_features=["advanced_automation", "advanced_analytics", "ai_content_generation"]
    ),
    SubscriptionTier.ENTERPRISE: TierLimits(
        tier=SubscriptionTier.ENTERPRISE,
        max_agents=-1,  # Unlimited
        max_workflows_per_month=-1,  # Unlimited
        max_integrations=-1,  # Unlimited
        core_agents_included=[
            # All core agents always available
            "JudgeAgent",
            "OrchestratorAgent",
            "OrchestrationTuner",
            "AutomationAgent",
            "ConnectorAgent",
            "BusinessIntelligenceAgent",
            "FinancialIntelligenceAgent",
            "CustomerIntelligenceAgent",
            "ContentIntelligenceAgent",
            "CompetitiveIntelligenceAgent",
            "OnboardingAgent",
            "CalendarHarmonyAgent",
            # Plus all evaluator league
            "AgentEvaluator",
            "KnowledgeUpdater",
            "SecurityAgent",
            "ScalabilityAgent"
        ],
        premium_features=["all"]
    )
}


class SubscriptionChecker:
    """Check and enforce subscription limits"""
    
    def __init__(self):
        self.user_subscriptions = {}  # user_id -> tier
        self.user_hired_agents = {}  # user_id -> List[agent_id]
        self.user_workflow_counts = {}  # user_id -> count this month
    
    async def get_user_tier(self, user_id: str) -> SubscriptionTier:
        """
        Get user's subscription tier.
        TODO: Query from database when user/subscription system is implemented.
        """
        # For now, default to GROWTH tier for testing
        return self.user_subscriptions.get(user_id, SubscriptionTier.GROWTH)
    
    async def get_tier_limits(self, user_id: str) -> TierLimits:
        """Get limits for user's subscription tier"""
        tier = await self.get_user_tier(user_id)
        return TIER_LIMITS[tier]
    
    async def can_hire_agent(self, user_id: str, agent_id: str) -> tuple[bool, Optional[str]]:
        """
        Check if user can hire a specific agent.
        
        Returns:
            Tuple of (can_hire: bool, reason: Optional[str])
        """
        tier = await self.get_user_tier(user_id)
        limits = TIER_LIMITS[tier]
        
        # Core agents are always available
        if agent_id in limits.core_agents_included:
            return (True, None)
        
        # Check if user has reached agent limit
        hired_agents = self.user_hired_agents.get(user_id, [])
        
        if limits.max_agents == -1:  # Unlimited
            return (True, None)
        
        if len(hired_agents) >= limits.max_agents:
            return (
                False,
                f"Agent limit reached ({len(hired_agents)}/{limits.max_agents}). "
                f"Upgrade to hire more agents."
            )
        
        return (True, None)
    
    async def hire_agent(self, user_id: str, agent_id: str) -> Dict[str, Any]:
        """
        Hire an agent for a user.
        Adds to user's hired agents list if within limits.
        """
        can_hire, reason = await self.can_hire_agent(user_id, agent_id)
        
        if not can_hire:
            return {
                'success': False,
                'error': reason,
                'requires_upgrade': True
            }
        
        # Add to hired agents
        if user_id not in self.user_hired_agents:
            self.user_hired_agents[user_id] = []
        
        if agent_id not in self.user_hired_agents[user_id]:
            self.user_hired_agents[user_id].append(agent_id)
        
        # TODO: Save to database
        # await db_service.add_hired_agent(user_id, agent_id)
        
        return {
            'success': True,
            'message': f'Agent {agent_id} hired successfully',
            'hired_agents': self.user_hired_agents[user_id]
        }
    
    async def release_agent(self, user_id: str, agent_id: str) -> Dict[str, Any]:
        """Release (un-hire) an agent"""
        if user_id not in self.user_hired_agents:
            return {'success': False, 'error': 'No agents hired'}
        
        if agent_id in self.user_hired_agents[user_id]:
            self.user_hired_agents[user_id].remove(agent_id)
            
            # TODO: Save to database
            # await db_service.remove_hired_agent(user_id, agent_id)
            
            return {
                'success': True,
                'message': f'Agent {agent_id} released'
            }
        
        return {'success': False, 'error': 'Agent not hired'}
    
    async def get_available_agents(self, user_id: str) -> Dict[str, Any]:
        """
        Get list of agents available to user based on subscription.
        
        Returns:
            Dict with 'core_agents', 'hired_agents', 'available_to_hire', 'limit'
        """
        tier = await self.get_user_tier(user_id)
        limits = TIER_LIMITS[tier]
        hired_agents = self.user_hired_agents.get(user_id, [])
        
        # All agents user has access to
        accessible_agents = limits.core_agents_included + hired_agents
        
        # Agents available to hire (not yet hired)
        from guild.src.core.complete_agent_registry import AGENT_REGISTRY
        all_agent_ids = list(AGENT_REGISTRY.keys())
        available_to_hire = [
            agent_id for agent_id in all_agent_ids
            if agent_id not in accessible_agents
        ]
        
        return {
            'subscription_tier': tier.value,
            'core_agents': limits.core_agents_included,
            'hired_agents': hired_agents,
            'available_to_hire': available_to_hire[:50],  # Limit list size
            'total_accessible': len(accessible_agents),
            'max_agents': limits.max_agents,
            'can_hire_more': len(hired_agents) < limits.max_agents or limits.max_agents == -1,
            'remaining_slots': limits.max_agents - len(hired_agents) if limits.max_agents != -1 else -1
        }
    
    async def can_create_workflow(self, user_id: str) -> tuple[bool, Optional[str]]:
        """Check if user can create a new workflow"""
        tier = await self.get_user_tier(user_id)
        limits = TIER_LIMITS[tier]
        
        if limits.max_workflows_per_month == -1:  # Unlimited
            return (True, None)
        
        # Check workflow count this month
        workflow_count = self.user_workflow_counts.get(user_id, 0)
        
        if workflow_count >= limits.max_workflows_per_month:
            return (
                False,
                f"Monthly workflow limit reached ({workflow_count}/{limits.max_workflows_per_month}). "
                f"Upgrade for more workflows."
            )
        
        return (True, None)
    
    async def increment_workflow_count(self, user_id: str):
        """Increment user's workflow count"""
        self.user_workflow_counts[user_id] = self.user_workflow_counts.get(user_id, 0) + 1
    
    async def can_use_integration(self, user_id: str, integration_id: str) -> tuple[bool, Optional[str]]:
        """Check if user can use a specific integration"""
        tier = await self.get_user_tier(user_id)
        limits = TIER_LIMITS[tier]
        
        if limits.max_integrations == -1:  # Unlimited
            return (True, None)
        
        # Count connected integrations
        # TODO: Query database for user's connected integrations
        connected_count = 0  # Placeholder
        
        if connected_count >= limits.max_integrations:
            return (
                False,
                f"Integration limit reached ({connected_count}/{limits.max_integrations}). "
                f"Upgrade to connect more integrations."
            )
        
        return (True, None)
    
    async def check_feature_access(self, user_id: str, feature: str) -> bool:
        """Check if user has access to a premium feature"""
        tier = await self.get_user_tier(user_id)
        limits = TIER_LIMITS[tier]
        
        if "all" in limits.premium_features:
            return True
        
        return feature in limits.premium_features


# Global subscription checker instance
subscription_checker = SubscriptionChecker()


# Convenience functions

async def get_user_subscription_tier(user_id: str) -> SubscriptionTier:
    """Get user's subscription tier"""
    return await subscription_checker.get_user_tier(user_id)


async def get_user_tier_limits(user_id: str) -> TierLimits:
    """Get limits for user's tier"""
    return await subscription_checker.get_tier_limits(user_id)


async def check_agent_access(user_id: str, agent_id: str) -> tuple[bool, Optional[str]]:
    """Check if user can access/hire an agent"""
    return await subscription_checker.can_hire_agent(user_id, agent_id)


async def hire_agent_for_user(user_id: str, agent_id: str) -> Dict[str, Any]:
    """Hire an agent for user"""
    return await subscription_checker.hire_agent(user_id, agent_id)


async def release_agent_for_user(user_id: str, agent_id: str) -> Dict[str, Any]:
    """Release an agent"""
    return await subscription_checker.release_agent(user_id, agent_id)


async def get_user_available_agents(user_id: str) -> Dict[str, Any]:
    """Get agents available to user"""
    return await subscription_checker.get_available_agents(user_id)


async def check_workflow_limit(user_id: str) -> tuple[bool, Optional[str]]:
    """Check if user can create workflow"""
    return await subscription_checker.can_create_workflow(user_id)


async def check_feature_access(user_id: str, feature: str) -> bool:
    """Check if user has feature access"""
    return await subscription_checker.check_feature_access(user_id, feature)

