"""
Enhanced Financial Advisor Agent
Comprehensive financial analysis and planning for solopreneurs
Based on Google ADK Financial Advisor sample: bit.ly/financial-advisor-adk
"""

import os
import logging
from typing import Dict, Any, Optional, List
from dataclasses import dataclass
from datetime import datetime, timedelta
import vertexai
from vertexai.generative_models import GenerativeModel

logger = logging.getLogger(__name__)

@dataclass
class FinancialReport:
    """Financial analysis report"""
    profit_loss_summary: Dict[str, Any]
    cash_flow_projection: Dict[str, Any]
    investment_recommendations: List[str]
    risk_assessment: Dict[str, Any]
    action_plan: List[Dict[str, str]]
    key_metrics: Dict[str, float]
    health_score: float  # 0-100

class EnhancedFinancialAdvisor:
    """
    Adapt Google's Financial Advisor ADK for Guild AI
    Provides comprehensive financial intelligence for solopreneurs
    """
    
    def __init__(self):
        self.project_id = os.getenv("GOOGLE_CLOUD_PROJECT", "guild-ai-080")
        self.location = os.getenv("VERTEX_AI_LOCATION", "us-central1")
        
        # Initialize Vertex AI
        vertexai.init(project=self.project_id, location=self.location)
        
        # Use Gemini Pro for financial strategy (higher accuracy)
        self.model = GenerativeModel("gemini-1.5-pro")
        
        logger.info("Enhanced Financial Advisor initialized with Gemini Pro")
    
    async def analyze_business_finances(
        self,
        business_context: Dict[str, Any],
        financial_data: Optional[Dict[str, Any]] = None
    ) -> FinancialReport:
        """
        Comprehensive financial analysis using Gemini Pro
        
        Args:
            business_context: User's source of truth
            financial_data: Additional financial data (transactions, expenses, etc.)
        
        Returns:
            FinancialReport with detailed analysis and recommendations
        """
        try:
            # Extract financial info from context
            business = business_context.get("business", {})
            financial = business_context.get("financial", {})
            goals = business_context.get("goals", {})
            
            # Build comprehensive prompt
            prompt = f"""You are a financial advisor for a solopreneur running a {business.get('type', 'business')}.

**Current Financial State:**
- Business Type: {business.get('type', 'Not specified')}
- Industry: {business.get('industry', 'Not specified')}
- Pricing Strategy: {financial.get('pricing_status', 'Not specified')}
- Marketing Budget: {financial.get('marketing_budget', 'Not specified')}
- Revenue Goals: {financial.get('revenue_goals', 'Not specified')}
- 3-Month Priority: {goals.get('priority_3months', 'Not specified')}

**Additional Data:**
{financial_data if financial_data else 'No additional data provided'}

**Provide a comprehensive financial analysis in this JSON format:**
{{
    "profit_loss_summary": {{
        "current_monthly_revenue": <estimated amount>,
        "projected_monthly_revenue": <amount>,
        "monthly_expenses": <amount>,
        "net_profit_margin": <percentage>
    }},
    "cash_flow_projection": {{
        "next_month": <amount>,
        "next_quarter": <amount>,
        "next_year": <amount>,
        "confidence_level": <0-1>
    }},
    "investment_recommendations": [
        "Invest in X to increase revenue by Y%",
        "Recommendation 2",
        "Recommendation 3"
    ],
    "risk_assessment": {{
        "overall_risk_level": "low|medium|high",
        "key_risks": ["risk 1", "risk 2"],
        "mitigation_strategies": ["strategy 1", "strategy 2"]
    }},
    "action_plan": [
        {{"priority": "high", "action": "Action 1", "timeline": "This week"}},
        {{"priority": "medium", "action": "Action 2", "timeline": "This month"}}
    ],
    "key_metrics": {{
        "burn_rate": <monthly amount>,
        "runway_months": <number>,
        "break_even_point": <amount>,
        "growth_rate": <percentage>
    }},
    "health_score": <0-100>
}}

Be specific with numbers where possible, use estimates based on industry standards if actual data is not provided."""
            
            response = self.model.generate_content(prompt)
            
            # Parse report
            report = self._parse_financial_report(response.text)
            
            logger.info(f"Financial analysis complete. Health score: {report.health_score}/100")
            return report
            
        except Exception as e:
            logger.error(f"Financial analysis failed: {e}")
            # Return empty report
            return FinancialReport(
                profit_loss_summary={},
                cash_flow_projection={},
                investment_recommendations=["Error during analysis"],
                risk_assessment={"overall_risk_level": "unknown", "key_risks": [], "mitigation_strategies": []},
                action_plan=[],
                key_metrics={},
                health_score=0.0
            )
    
    async def generate_budget_plan(
        self,
        monthly_revenue: float,
        business_goals: str,
        business_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate optimized budget allocation"""
        try:
            business_type = business_context.get("business", {}).get("type", "business")
            
            prompt = f"""As a financial advisor for a {business_type}:

**Monthly Revenue:** ${monthly_revenue:,}
**Business Goals:** {business_goals}

**Create an optimized monthly budget allocation:**

Provide budget breakdown for:
1. Marketing & Advertising (% and $)
2. Operations & Tools (% and $)
3. Content Creation (% and $)
4. Savings & Emergency Fund (% and $)
5. Growth Investments (% and $)
6. Owner Salary (% and $)

Explain the reasoning for each allocation.

Response format: {{"categories": [{{"name": "Marketing", "percentage": 30, "amount": 1500, "reasoning": "..."}}], "total": 5000}}"""
            
            response = self.model.generate_content(prompt)
            return self._extract_json(response.text)
            
        except Exception as e:
            logger.error(f"Budget plan generation failed: {e}")
            return {}
    
    async def forecast_revenue(
        self,
        current_revenue: float,
        growth_strategy: str,
        timeframe_months: int = 12
    ) -> Dict[str, Any]:
        """Forecast revenue based on growth strategy"""
        try:
            prompt = f"""As a financial analyst:

**Current Monthly Revenue:** ${current_revenue:,}
**Growth Strategy:** {growth_strategy}
**Forecast Period:** {timeframe_months} months

**Provide monthly revenue projections:**

Consider:
- Market conditions
- Growth strategy effectiveness
- Industry benchmarks
- Realistic growth rates

Response format: {{"projections": [{{"month": 1, "revenue": 5000, "growth_rate": 0.05}}], "assumptions": ["assumption 1"], "confidence": 0.75}}"""
            
            response = self.model.generate_content(prompt)
            return self._extract_json(response.text)
            
        except Exception as e:
            logger.error(f"Revenue forecast failed: {e}")
            return {}
    
    async def pricing_strategy_analysis(
        self,
        current_pricing: Dict[str, Any],
        business_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Analyze and optimize pricing strategy"""
        try:
            business = business_context.get("business", {})
            audience = business_context.get("audience", {})
            
            prompt = f"""As a pricing strategist:

**Business:** {business.get('type')}
**Target Audience:** {audience.get('target')}
**Current Pricing:** {current_pricing}

**Analyze pricing strategy and provide:**
1. Is current pricing optimal?
2. Competitor pricing analysis
3. Value-based pricing recommendations
4. Price elasticity considerations
5. Upsell/cross-sell opportunities

Response format: {{"current_assessment": "...", "recommendations": [...], "optimal_price_range": {{"min": 49, "max": 199}}, "reasoning": "..."}}"""
            
            response = self.model.generate_content(prompt)
            return self._extract_json(response.text)
            
        except Exception as e:
            logger.error(f"Pricing analysis failed: {e}")
            return {}
    
    def _parse_financial_report(self, response_text: str) -> FinancialReport:
        """Parse financial report from Gemini response"""
        try:
            data = self._extract_json(response_text)
            
            return FinancialReport(
                profit_loss_summary=data.get("profit_loss_summary", {}),
                cash_flow_projection=data.get("cash_flow_projection", {}),
                investment_recommendations=data.get("investment_recommendations", []),
                risk_assessment=data.get("risk_assessment", {}),
                action_plan=data.get("action_plan", []),
                key_metrics=data.get("key_metrics", {}),
                health_score=float(data.get("health_score", 50))
            )
            
        except Exception as e:
            logger.error(f"Failed to parse financial report: {e}")
            return FinancialReport(
                profit_loss_summary={},
                cash_flow_projection={},
                investment_recommendations=[],
                risk_assessment={},
                action_plan=[],
                key_metrics={},
                health_score=0.0
            )
    
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
financial_advisor = EnhancedFinancialAdvisor()

