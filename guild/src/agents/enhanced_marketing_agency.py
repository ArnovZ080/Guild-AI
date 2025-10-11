"""
Enhanced Marketing Agency Agent
Full-service marketing campaign creation and management
Based on Google ADK Marketing Agency sample: bit.ly/marketing-agency-adk
"""

import os
import logging
from typing import Dict, Any, List, Optional
from dataclasses import dataclass
from datetime import datetime, timedelta
import vertexai
from vertexai.generative_models import GenerativeModel

logger = logging.getLogger(__name__)

@dataclass
class MarketingCampaign:
    """Complete marketing campaign"""
    strategy: Dict[str, Any]
    content: Dict[str, List[str]]
    schedule: List[Dict[str, Any]]
    targeting: Dict[str, Any]
    budget_allocation: Dict[str, float]
    kpis: Dict[str, Any]
    estimated_reach: int
    estimated_conversions: int

class EnhancedMarketingAgency:
    """
    Adapt Google's Marketing Agency ADK for Guild AI
    Creates comprehensive multi-channel campaigns
    """
    
    def __init__(self):
        self.project_id = os.getenv("GOOGLE_CLOUD_PROJECT", "guild-ai-080")
        self.location = os.getenv("VERTEX_AI_LOCATION", "us-central1")
        
        # Initialize Vertex AI
        vertexai.init(project=self.project_id, location=self.location)
        
        # Use Gemini Pro for strategic campaign planning
        self.strategy_model = GenerativeModel("gemini-1.5-pro")
        
        # Use Gemini Flash for content generation (cheaper)
        self.content_model = GenerativeModel("gemini-1.5-flash")
        
        logger.info("Enhanced Marketing Agency initialized")
    
    async def create_comprehensive_campaign(
        self,
        campaign_objective: str,
        business_context: Dict[str, Any],
        campaign_type: str = "multi_channel",
        budget_usd: Optional[float] = None
    ) -> MarketingCampaign:
        """
        Create complete marketing campaign with strategy, content, and schedule
        
        Args:
            campaign_objective: Main campaign goal
            business_context: User's source of truth
            campaign_type: social, email, ads, or multi_channel
            budget_usd: Monthly budget in USD
        
        Returns:
            MarketingCampaign with all components
        """
        try:
            # Step 1: Generate strategy (use Pro for better planning)
            strategy = await self.generate_strategy(
                campaign_objective, business_context, campaign_type, budget_usd
            )
            
            # Step 2: Generate content (use Flash for efficiency)
            content = await self.generate_content(
                campaign_objective, business_context, campaign_type, strategy
            )
            
            # Step 3: Create schedule
            schedule = await self.generate_schedule(
                campaign_type, business_context, strategy
            )
            
            # Step 4: Define targeting
            targeting = await self.generate_targeting(business_context)
            
            # Step 5: Allocate budget
            budget_allocation = await self.optimize_budget(
                budget_usd or 1000, campaign_type, strategy
            )
            
            return MarketingCampaign(
                strategy=strategy,
                content=content,
                schedule=schedule,
                targeting=targeting,
                budget_allocation=budget_allocation,
                kpis=strategy.get("kpis", {}),
                estimated_reach=strategy.get("estimated_reach", 0),
                estimated_conversions=strategy.get("estimated_conversions", 0)
            )
            
        except Exception as e:
            logger.error(f"Campaign creation failed: {e}")
            raise
    
    async def generate_strategy(
        self,
        objective: str,
        context: Dict[str, Any],
        campaign_type: str,
        budget: Optional[float]
    ) -> Dict[str, Any]:
        """Generate strategic campaign plan using Gemini Pro"""
        try:
            brand = context.get("brand", {})
            audience = context.get("audience", {})
            business = context.get("business", {})
            
            prompt = f"""You are a marketing strategist for a {brand.get('voice_tone', 'professional')} brand.

**Business Context:**
- Type: {business.get('type')}
- Industry: {business.get('industry')}
- Target Audience: {audience.get('target')}
- Audience Problems: {audience.get('problems')}
- Brand Differentiation: {brand.get('differentiation')}

**Campaign Objective:** {objective}
**Campaign Type:** {campaign_type}
**Budget:** ${budget if budget else 'Not specified'}

**Create a {campaign_type} campaign strategy including:**

1. **Objectives & KPIs:**
   - Primary objective
   - Key performance indicators
   - Success metrics

2. **Messaging Framework:**
   - Core message
   - Value proposition
   - Key talking points

3. **Channel Mix:**
   - Which channels to use
   - Why each channel
   - Channel priority

4. **Timeline:**
   - Campaign duration
   - Key milestones
   - Launch date recommendation

5. **Estimated Results:**
   - Expected reach
   - Estimated conversions
   - ROI projection

Provide response in JSON format."""
            
            response = self.strategy_model.generate_content(prompt)
            strategy = self._extract_json(response.text)
            
            logger.info(f"Campaign strategy generated for: {objective}")
            return strategy
            
        except Exception as e:
            logger.error(f"Strategy generation failed: {e}")
            return {}
    
    async def generate_content(
        self,
        objective: str,
        context: Dict[str, Any],
        campaign_type: str,
        strategy: Dict[str, Any]
    ) -> Dict[str, List[str]]:
        """Generate campaign content using Gemini Flash"""
        try:
            brand = context.get("brand", {})
            audience = context.get("audience", {})
            
            prompt = f"""You are a content creator for a {brand.get('voice_tone')} brand.

**Brand Voice:** {brand.get('voice_tone')}
**Target Audience:** {audience.get('target')}
**Campaign Objective:** {objective}
**Messaging Framework:** {strategy.get('messaging_framework', {})}

**Create content for {campaign_type} campaign:**

1. **Social Media Posts** (5 variations):
   - Engaging hooks
   - Clear CTAs
   - Hashtag suggestions

2. **Email Subject Lines** (3 variations):
   - Compelling and curiosity-driven
   - Match brand voice

3. **Email Body** (1 complete email):
   - Personalized greeting
   - Value proposition
   - Clear CTA

4. **Ad Copy** (3 variations):
   - Headlines
   - Body copy
   - CTAs

Provide response in JSON format with arrays for each content type."""
            
            response = self.content_model.generate_content(prompt)
            content = self._extract_json(response.text)
            
            logger.info(f"Campaign content generated")
            return content
            
        except Exception as e:
            logger.error(f"Content generation failed: {e}")
            return {}
    
    async def generate_schedule(
        self,
        campaign_type: str,
        context: Dict[str, Any],
        strategy: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Create publishing schedule"""
        try:
            duration_days = strategy.get("timeline", {}).get("duration_days", 30)
            
            # Simple scheduling logic
            schedule = []
            start_date = datetime.now()
            
            if campaign_type == "social" or campaign_type == "multi_channel":
                # Post 3x per week
                for week in range(duration_days // 7):
                    for day in [1, 3, 5]:  # Mon, Wed, Fri
                        post_date = start_date + timedelta(days=week * 7 + day)
                        schedule.append({
                            "date": post_date.isoformat(),
                            "channel": "social_media",
                            "content_type": "post",
                            "time": "09:00"
                        })
            
            if campaign_type == "email" or campaign_type == "multi_channel":
                # Email once per week
                for week in range(duration_days // 7):
                    email_date = start_date + timedelta(days=week * 7 + 2)  # Tuesday
                    schedule.append({
                        "date": email_date.isoformat(),
                        "channel": "email",
                        "content_type": "newsletter",
                        "time": "10:00"
                    })
            
            return schedule
            
        except Exception as e:
            logger.error(f"Schedule generation failed: {e}")
            return []
    
    async def generate_targeting(
        self,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Define audience targeting parameters"""
        try:
            audience = context.get("audience", {})
            
            return {
                "demographics": {
                    "audience_description": audience.get("target", "General"),
                    "pain_points": audience.get("problems", "")
                },
                "interests": [],
                "behaviors": [],
                "platforms": ["Instagram", "LinkedIn", "Facebook", "Email"]
            }
            
        except Exception as e:
            logger.error(f"Targeting generation failed: {e}")
            return {}
    
    async def optimize_budget(
        self,
        total_budget: float,
        campaign_type: str,
        strategy: Dict[str, Any]
    ) -> Dict[str, float]:
        """Optimize budget allocation across channels"""
        try:
            if campaign_type == "social":
                return {
                    "content_creation": total_budget * 0.30,
                    "paid_ads": total_budget * 0.50,
                    "influencer_outreach": total_budget * 0.10,
                    "tools_software": total_budget * 0.10
                }
            elif campaign_type == "email":
                return {
                    "email_platform": total_budget * 0.20,
                    "content_creation": total_budget * 0.40,
                    "list_growth": total_budget * 0.30,
                    "tools": total_budget * 0.10
                }
            else:  # multi_channel
                return {
                    "social_media": total_budget * 0.35,
                    "email_marketing": total_budget * 0.25,
                    "content_creation": total_budget * 0.25,
                    "tools_software": total_budget * 0.15
                }
                
        except Exception as e:
            logger.error(f"Budget optimization failed: {e}")
            return {}
    
    def _extract_json(self, text: str) -> Dict[str, Any]:
        """Extract JSON from response"""
        try:
            import json
            
            if "```json" in text:
                json_str = text.split("```json")[1].split("```")[0].strip()
            elif "```" in text:
                json_str = text.split("```")[1].split("```")[0].strip()
            elif "{" in text:
                start = text.index("{")
                end = text.rindex("}") + 1
                json_str = text[start:end]
            else:
                return {}
            
            return json.loads(json_str)
            
        except Exception as e:
            logger.debug(f"JSON extraction failed: {e}")
            return {}

# Global instance
marketing_agency = EnhancedMarketingAgency()

