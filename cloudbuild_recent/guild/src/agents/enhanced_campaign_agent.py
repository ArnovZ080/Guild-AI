"""
Enhanced Campaign Agent with Meta Business Suite Integration

This agent can create, manage, and analyze advertising campaigns across Meta platforms
(Facebook, Instagram, WhatsApp) with full access to Meta Business Suite capabilities.
"""

import asyncio
import json
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime, date, timedelta
from guild.src.core.llm_client import LlmClient
from guild.src.models.llm import Llm
from guild.src.core.agent_helpers import inject_knowledge
from guild.src.integrations.meta_business_suite import (
    MetaBusinessSuiteConnector, MetaCredentials, CampaignObjective,
    create_meta_campaign, get_meta_analytics, meta_business_manager
)
from guild.src.utils.logging_utils import get_logger

logger = get_logger(__name__)

@dataclass
class CampaignRequest:
    """Campaign creation request"""
    business_name: str
    campaign_name: str
    objective: str
    target_audience: Dict[str, Any]
    budget: float
    creative_brief: str
    campaign_duration_days: int = 30

@dataclass
class CampaignAnalytics:
    """Campaign analytics data"""
    campaign_id: str
    spend: float
    impressions: int
    clicks: int
    conversions: int
    ctr: float
    cpc: float
    cpm: float
    roas: float
    recommendations: List[str]

@inject_knowledge
async def generate_comprehensive_campaign_strategy(
    campaign_request: CampaignRequest,
    market_context: Dict[str, Any],
    creative_assets: List[Dict[str, Any]],
    performance_goals: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Generates comprehensive campaign strategy with Meta Business Suite integration.
    """
    logger.info("Enhanced Campaign Agent: Generating campaign strategy with Meta integration...")

    prompt = f"""
# Enhanced Campaign Agent - Meta Business Suite Integration

## Role Definition
You are the **Enhanced Campaign Agent**, an expert in Meta Business Suite advertising campaigns. Your role is to create, manage, and optimize advertising campaigns across Facebook, Instagram, and WhatsApp using the full power of Meta's advertising platform.

## Core Expertise
- Meta Business Suite Campaign Management
- Facebook & Instagram Advertising
- WhatsApp Business API Campaigns
- Meta Analytics & Performance Optimization
- Creative Asset Management
- Audience Targeting & Segmentation
- Budget Optimization & Bid Strategies
- A/B Testing & Campaign Testing

## Context & Background Information
**Campaign Request:** {campaign_request.campaign_name}
**Business:** {campaign_request.business_name}
**Objective:** {campaign_request.objective}
**Target Audience:** {json.dumps(campaign_request.target_audience, indent=2)}
**Budget:** ${campaign_request.budget}
**Campaign Duration:** {campaign_request.campaign_duration_days} days
**Creative Brief:** {campaign_request.creative_brief}
**Market Context:** {json.dumps(market_context, indent=2)}
**Creative Assets:** {json.dumps(creative_assets, indent=2)}
**Performance Goals:** {json.dumps(performance_goals, indent=2)}

## Meta Business Suite Integration
This campaign will be created using Meta Business Suite with access to:
- Facebook Ads Manager API
- Instagram Ads API
- WhatsApp Business API
- Meta Analytics & Insights
- Business Manager Integration
- Creative Hub & Asset Management

## Task Breakdown & Steps
1. **Campaign Strategy:** Develop comprehensive campaign strategy and positioning
2. **Meta Platform Selection:** Choose optimal Meta platforms (Facebook, Instagram, WhatsApp)
3. **Audience Targeting:** Configure precise targeting using Meta's audience tools
4. **Budget Allocation:** Optimize budget distribution across platforms and ad sets
5. **Creative Development:** Develop platform-specific creative assets
6. **Campaign Creation:** Execute campaign setup via Meta Business Suite API
7. **Launch & Monitoring:** Launch campaign and set up real-time monitoring
8. **Performance Optimization:** Analyze performance and implement optimizations

## Meta Business Suite Capabilities
- **Campaign Management:** Create, update, pause, and optimize campaigns
- **Audience Management:** Custom audiences, lookalike audiences, saved audiences
- **Creative Management:** Dynamic ads, carousel ads, video ads, story ads
- **Analytics:** Real-time performance tracking, conversion tracking, attribution
- **Automation:** Automated bidding, budget optimization, ad rotation
- **Testing:** A/B testing, split testing, creative testing

## Constraints & Rules
- Campaigns must comply with Meta advertising policies
- Creative assets must meet Meta's technical specifications
- Budget allocation must be optimized for maximum ROI
- Targeting must be precise and compliant with privacy regulations
- Performance tracking must be comprehensive and actionable
- Optimization must be data-driven and continuous

## Output Format
Return a comprehensive JSON object with campaign strategy, Meta Business Suite configuration, and execution plan.

Generate the comprehensive Meta Business Suite campaign strategy now, ensuring all elements are thoroughly addressed.
"""

    try:
        # Create LLM client
        client = LlmClient(Llm(provider="ollama", model="tinyllama"))
        
        # Generate response
        response = await client.chat(prompt)
        
        # Parse JSON response
        try:
            campaign_strategy = json.loads(response)
            logger.info("Enhanced Campaign Agent: Successfully generated campaign strategy")
            return campaign_strategy
        except json.JSONDecodeError as e:
            logger.error(f"Enhanced Campaign Agent: JSON parsing error: {e}")
            # Return structured fallback
            return {
                "campaign_strategy": {
                    "campaign_name": campaign_request.campaign_name,
                    "objective": campaign_request.objective,
                    "meta_platforms": ["facebook", "instagram"],
                    "target_audience": campaign_request.target_audience,
                    "budget_allocation": {
                        "facebook": campaign_request.budget * 0.6,
                        "instagram": campaign_request.budget * 0.4
                    },
                    "creative_approach": "Multi-platform creative adaptation",
                    "optimization_strategy": "Continuous monitoring and optimization"
                },
                "meta_business_suite_config": {
                    "campaign_objective": campaign_request.objective.upper(),
                    "daily_budget": campaign_request.budget / campaign_request.campaign_duration_days,
                    "targeting_spec": campaign_request.target_audience,
                    "placements": ["facebook_feed", "instagram_feed", "instagram_stories"],
                    "optimization_goal": "LINK_CLICKS"
                },
                "execution_plan": [
                    "Create campaign via Meta Business Suite API",
                    "Set up ad sets with optimized targeting",
                    "Upload and configure creative assets",
                    "Launch campaign with monitoring",
                    "Analyze performance and optimize"
                ]
            }
    except Exception as e:
        logger.error(f"Enhanced Campaign Agent: Error generating strategy: {e}")
        raise

class EnhancedCampaignAgent:
    """
    Enhanced Campaign Agent with Meta Business Suite integration.
    
    This agent can:
    - Create and manage Meta advertising campaigns
    - Analyze campaign performance using Meta Analytics
    - Optimize campaigns based on real-time data
    - Integrate with the enhanced orchestration system
    """
    
    def __init__(self, user_input: Optional[str] = None):
        self.user_input = user_input
        self.agent_name = "Enhanced Campaign Agent"
        self.agent_type = "Marketing & Growth"
        self.capabilities = [
            "Meta Business Suite integration",
            "Facebook & Instagram advertising",
            "WhatsApp Business campaigns",
            "Campaign analytics & optimization",
            "Creative asset management",
            "Audience targeting & segmentation",
            "Budget optimization",
            "Performance monitoring"
        ]
        
        # Initialize LLM client
        from guild.src.models.llm import Llm
        self.llm_client = LlmClient(Llm(provider="ollama", model="tinyllama"))
    
    async def run(self, user_input: Optional[str] = None) -> Dict[str, Any]:
        """Run the enhanced campaign agent"""
        input_text = user_input or self.user_input
        if not input_text:
            return {"error": "No input provided"}
        
        try:
            # Parse campaign request from input
            campaign_request = self._parse_campaign_request(input_text)
            
            # Generate comprehensive campaign strategy
            strategy = await generate_comprehensive_campaign_strategy(
                campaign_request=campaign_request,
                market_context={},
                creative_assets=[],
                performance_goals={}
            )
            
            # Execute campaign creation via Meta Business Suite
            execution_result = await self._execute_campaign_creation(campaign_request, strategy)
            
            return {
                "agent": self.agent_name,
                "campaign_request": campaign_request.__dict__,
                "strategy": strategy,
                "execution_result": execution_result,
                "status": "completed",
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Enhanced Campaign Agent: Error in run method: {e}")
            return {
                "agent": self.agent_name,
                "error": str(e),
                "status": "failed",
                "timestamp": datetime.now().isoformat()
            }
    
    def _parse_campaign_request(self, input_text: str) -> CampaignRequest:
        """Parse campaign request from user input"""
        # Simple parsing - in a real implementation, this would be more sophisticated
        lines = input_text.strip().split('\n')
        
        # Extract basic information
        campaign_name = lines[0] if lines else "New Campaign"
        objective = "CONVERSIONS"  # Default objective
        budget = 1000.0  # Default budget
        duration = 30  # Default duration
        
        # Try to extract budget if mentioned
        for line in lines:
            if 'budget' in line.lower():
                try:
                    budget = float(''.join(filter(str.isdigit, line)))
                except:
                    pass
        
        return CampaignRequest(
            business_name="Default Business",
            campaign_name=campaign_name,
            objective=objective,
            target_audience={
                "age_min": 25,
                "age_max": 65,
                "interests": ["business", "entrepreneurship"],
                "locations": ["United States"]
            },
            budget=budget,
            creative_brief=input_text,
            campaign_duration_days=duration
        )
    
    async def _execute_campaign_creation(self, 
                                       campaign_request: CampaignRequest,
                                       strategy: Dict[str, Any]) -> Dict[str, Any]:
        """Execute campaign creation via Meta Business Suite"""
        try:
            # Check if Meta credentials are configured
            if not meta_business_manager.connectors:
                return {
                    "status": "configuration_required",
                    "message": "Meta Business Suite credentials not configured",
                    "next_steps": [
                        "Add Meta Business Suite credentials",
                        "Configure Facebook App credentials",
                        "Set up Business Manager access"
                    ]
                }
            
            # Use first available business connector
            business_name = list(meta_business_manager.connectors.keys())[0]
            
            # Create campaign via Meta Business Suite
            campaign_result = await create_meta_campaign(
                business_name=business_name,
                campaign_name=campaign_request.campaign_name,
                objective=campaign_request.objective,
                daily_budget=campaign_request.budget / campaign_request.campaign_duration_days,
                target_audience=campaign_request.target_audience,
                creative_assets=[]
            )
            
            return {
                "status": "campaign_created",
                "campaign_result": campaign_result,
                "meta_integration": "successful",
                "next_steps": [
                    "Upload creative assets",
                    "Review campaign settings",
                    "Launch campaign",
                    "Monitor performance"
                ]
            }
            
        except Exception as e:
            logger.error(f"Error executing campaign creation: {e}")
            return {
                "status": "execution_failed",
                "error": str(e),
                "fallback": "Campaign strategy created, manual setup required"
            }
    
    async def get_campaign_analytics(self, 
                                   campaign_id: str,
                                   business_name: str = None,
                                   days_back: int = 30) -> Dict[str, Any]:
        """Get campaign analytics from Meta Business Suite"""
        try:
            if not business_name:
                business_name = list(meta_business_manager.connectors.keys())[0]
            
            end_date = date.today()
            start_date = end_date - timedelta(days=days_back)
            
            analytics = await get_meta_analytics(
                business_name=business_name,
                campaign_id=campaign_id,
                start_date=start_date,
                end_date=end_date
            )
            
            return {
                "campaign_id": campaign_id,
                "analytics": analytics,
                "date_range": f"{start_date} to {end_date}",
                "status": "success"
            }
            
        except Exception as e:
            logger.error(f"Error getting campaign analytics: {e}")
            return {
                "campaign_id": campaign_id,
                "error": str(e),
                "status": "failed"
            }
    
    async def optimize_campaign(self, 
                              campaign_id: str,
                              business_name: str = None) -> Dict[str, Any]:
        """Optimize campaign based on performance data"""
        try:
            # Get current performance
            analytics = await self.get_campaign_analytics(campaign_id, business_name)
            
            if analytics["status"] != "success":
                return analytics
            
            # Analyze performance and generate recommendations
            insights = analytics["analytics"]["insights"]
            recommendations = []
            
            # Simple optimization logic
            if insights.get("ctr", 0) < 0.01:  # Low CTR
                recommendations.append("Improve ad creative or targeting - CTR below 1%")
            
            if insights.get("cpc", 0) > 2.0:  # High CPC
                recommendations.append("Optimize bidding strategy - CPC above $2.00")
            
            if insights.get("frequency", 0) > 3:  # High frequency
                recommendations.append("Expand audience or refresh creative - frequency above 3")
            
            return {
                "campaign_id": campaign_id,
                "current_performance": insights,
                "recommendations": recommendations,
                "optimization_status": "analysis_complete",
                "next_steps": [
                    "Review recommendations",
                    "Implement optimizations",
                    "Monitor performance changes",
                    "Continue optimization cycle"
                ]
            }
            
        except Exception as e:
            logger.error(f"Error optimizing campaign: {e}")
            return {
                "campaign_id": campaign_id,
                "error": str(e),
                "status": "optimization_failed"
            }

# Example usage and integration with enhanced orchestration
async def example_campaign_workflow():
    """Example of how the Enhanced Campaign Agent works with Meta Business Suite"""
    
    # 1. Configure Meta credentials (done once)
    from guild.src.integrations.meta_business_suite import add_meta_credentials
    
    add_meta_credentials(
        name="My Business",
        access_token="your_meta_access_token",
        app_id="your_app_id",
        app_secret="your_app_secret",
        business_id="your_business_id",
        ad_account_id="your_ad_account_id"
    )
    
    # 2. Create campaign agent
    agent = EnhancedCampaignAgent()
    
    # 3. Run campaign creation
    result = await agent.run("""
    Create a new Facebook and Instagram campaign for my SaaS product.
    Budget: $2000 for 30 days
    Target: Small business owners, 25-45 years old
    Objective: Lead generation
    """)
    
    print("Campaign Creation Result:", result)
    
    # 4. Get analytics (after campaign runs)
    if result.get("execution_result", {}).get("status") == "campaign_created":
        campaign_id = result["execution_result"]["campaign_result"]["campaign"]["id"]
        analytics = await agent.get_campaign_analytics(campaign_id)
        print("Campaign Analytics:", analytics)
        
        # 5. Optimize campaign
        optimization = await agent.optimize_campaign(campaign_id)
        print("Optimization Recommendations:", optimization)

if __name__ == "__main__":
    asyncio.run(example_campaign_workflow())
