"""
Upsell/Cross-sell Agent for Guild-AI
Comprehensive revenue expansion strategy using advanced prompting strategies.
"""

from guild.src.core.llm_client import LlmClient
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime
from guild.src.core.agent_helpers import inject_knowledge
import asyncio
import json
import logging


logger = logging.getLogger(__name__)

class UpsellCrossSellAgent:
    """
    Upsell Cross Sell Agent
    """
    
    def __init__(self, name: str = "Upsell Cross Sell Agent", user_input=None):
        self.name = name
        self.user_input = user_input
        self.agent_name = "Upsell Cross Sell Agent"
        self.agent_type = "Agent"
        self.role = "Upsell Cross Sell Agent"
        self.expertise = []
        self.capabilities = []


@inject_knowledge
async def generate_comprehensive_upsell_cross_sell_strategy(
    customer_data: Dict[str, Any],
    product_portfolio: Dict[str, Any],
    usage_patterns: Dict[str, Any],
    purchase_history: Dict[str, Any],
    customer_goals: Dict[str, Any],
    market_trends: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Generates comprehensive upsell and cross-sell strategy using advanced prompting strategies.
    Identifies opportunities to expand customer accounts with additional products/services.
    """
    print("Upsell/Cross-sell Agent: Generating comprehensive upsell/cross-sell strategy with injected knowledge...")

    # Structured prompt following advanced prompting strategies
    prompt = f"""
# Upsell/Cross-sell Agent - Comprehensive Revenue Expansion

## Role Definition
You are the **Upsell/Cross-sell Agent**, an expert in customer value expansion, product matching, and strategic revenue growth. Your role is to identify opportunities to increase customer lifetime value by recommending additional products, premium features, or complementary services that genuinely address customer needs and enhance their experience.

## Core Expertise
- Customer Need Analysis & Prediction
- Product-Customer Fit Assessment
- Value-Based Selling
- Timing & Opportunity Identification
- Expansion Strategy Development
- Usage-Based Recommendation
- Objection Anticipation & Handling
- Personalized Messaging Creation

## Context & Background Information
**Customer Data:** {json.dumps(customer_data, indent=2)}
**Product Portfolio:** {json.dumps(product_portfolio, indent=2)}
**Usage Patterns:** {json.dumps(usage_patterns, indent=2)}
**Purchase History:** {json.dumps(purchase_history, indent=2)}
**Customer Goals:** {json.dumps(customer_goals, indent=2)}
**Market Trends:** {json.dumps(market_trends, indent=2)}

## Task Breakdown & Steps
1. **Customer Analysis:** Evaluate current usage, goals, and unmet needs
2. **Product Matching:** Identify most relevant additional offerings
3. **Value Proposition Development:** Create compelling reasons to expand
4. **Timing Assessment:** Determine optimal moment for expansion conversation
5. **Messaging Creation:** Craft personalized expansion recommendations
6. **Objection Planning:** Anticipate concerns and prepare responses
7. **ROI Demonstration:** Calculate and communicate expansion benefits
8. **Implementation Planning:** Ensure smooth adoption of new offerings

## Constraints & Rules
- All recommendations must deliver genuine additional value
- Expansion suggestions must align with actual customer needs and goals
- Timing must respect customer readiness and relationship stage
- Value propositions must be specific and measurable
- Messaging must be consultative, not pushy or transactional
- ROI calculations must be realistic and defensible
- Recommendations must consider customer budget constraints
- Cross-sell suggestions must have logical connection to current usage

## Output Format
Return a comprehensive JSON object with expansion opportunities, personalized value propositions, timing recommendations, and communication strategies.

Generate the comprehensive upsell/cross-sell strategy now, ensuring all elements are thoroughly addressed.
"""

    try:
        # Create LLM client
        from guild.src.models.llm import Llm
        client = LlmClient(Llm(provider="ollama", model="tinyllama"))
        
        # Generate response
        response = await client.chat(prompt)
        
        # Parse JSON response
        try:
            expansion_strategy = json.loads(response)
            print("Upsell/Cross-sell Agent: Successfully generated comprehensive upsell/cross-sell strategy.")
            return expansion_strategy
        except json.JSONDecodeError as e:
            print(f"Upsell/Cross-sell Agent: JSON parsing error: {e}")
            # Attempt to extract JSON from the response
            import re
            json_match = re.search(r'```json\n(.*?)\n```', response, re.DOTALL)
            if json_match:
                try:
                    expansion_strategy = json.loads(json_match.group(1))
                    print("Upsell/Cross-sell Agent: Successfully extracted and parsed JSON from response.")
                    return expansion_strategy
                except json.JSONDecodeError:
                    pass
            
            # Return a structured error response
            return {
                "error": "Failed to parse JSON response",
                "raw_response": response[:1000] + "..." if len(response) > 1000 else response
            }
    except Exception as e:
        print(f"Upsell/Cross-sell Agent: Execution error: {e}")
        return {"error": str(e)}
