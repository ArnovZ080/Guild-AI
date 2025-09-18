"""
Customer Success Agent for Guild-AI
Comprehensive customer relationship management using advanced prompting strategies.
"""

from guild.src.core.llm_client import LlmClient
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime
from guild.src.core.agent_helpers import inject_knowledge
import asyncio
import json

@inject_knowledge
async def generate_comprehensive_customer_success_strategy(
    customer_data: Dict[str, Any],
    product_usage: Dict[str, Any],
    support_history: Dict[str, Any],
    success_metrics: Dict[str, Any],
    engagement_preferences: Dict[str, Any],
    business_goals: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Generates comprehensive customer success strategy using advanced prompting strategies.
    Proactively identifies customer needs and ensures successful product adoption.
    """
    print("Customer Success Agent: Generating comprehensive customer success strategy with injected knowledge...")

    # Structured prompt following advanced prompting strategies
    prompt = f"""
# Customer Success Agent - Comprehensive Relationship Management

## Role Definition
You are the **Customer Success Agent**, an expert in customer relationship management, product adoption, and retention strategies. Your role is to proactively identify customer needs, ensure successful product implementation, address concerns before they escalate, and maximize customer satisfaction and lifetime value through strategic engagement and support.

## Core Expertise
- Customer Onboarding & Adoption
- Usage Pattern Analysis
- Proactive Issue Resolution
- Value Realization & ROI Tracking
- Relationship Management
- Renewal & Expansion Strategy
- Feedback Collection & Implementation
- Customer Health Monitoring

## Context & Background Information
**Customer Data:** {json.dumps(customer_data, indent=2)}
**Product Usage:** {json.dumps(product_usage, indent=2)}
**Support History:** {json.dumps(support_history, indent=2)}
**Success Metrics:** {json.dumps(success_metrics, indent=2)}
**Engagement Preferences:** {json.dumps(engagement_preferences, indent=2)}
**Business Goals:** {json.dumps(business_goals, indent=2)}

## Task Breakdown & Steps
1. **Customer Analysis:** Evaluate customer profile, usage patterns, and history
2. **Health Assessment:** Determine current customer health and risk factors
3. **Engagement Planning:** Develop personalized engagement strategy and cadence
4. **Value Demonstration:** Identify and communicate product value realization
5. **Issue Anticipation:** Predict potential challenges and develop preventative measures
6. **Growth Opportunity Identification:** Discover expansion and cross-sell possibilities
7. **Feedback Integration:** Collect and incorporate customer input for improvement
8. **Success Roadmap:** Create long-term plan for customer relationship development

## Constraints & Rules
- All recommendations must be personalized to the specific customer
- Engagement strategies must respect customer preferences and communication styles
- Value demonstrations must be tied to customer's specific business goals
- Risk assessments must be evidence-based and actionable
- Growth opportunities must be genuine fits for customer needs
- All plans must balance immediate needs with long-term relationship building
- Communication must be clear, concise, and appropriate to customer's technical level
- Success metrics must be measurable and meaningful to the customer

## Output Format
Return a comprehensive JSON object with customer success strategy, engagement plan, risk mitigation approach, and growth opportunities.

Generate the comprehensive customer success strategy now, ensuring all elements are thoroughly addressed.
"""

    try:
        # Create LLM client
        from guild.src.models.llm import Llm
        client = LlmClient(Llm(provider="ollama", model="tinyllama"))
        
        # Generate response
        response = await client.chat(prompt)
        
        # Parse JSON response
        try:
            success_strategy = json.loads(response)
            print("Customer Success Agent: Successfully generated comprehensive customer success strategy.")
            return success_strategy
        except json.JSONDecodeError as e:
            print(f"Customer Success Agent: JSON parsing error: {e}")
            # Attempt to extract JSON from the response
            import re
            json_match = re.search(r'```json\n(.*?)\n```', response, re.DOTALL)
            if json_match:
                try:
                    success_strategy = json.loads(json_match.group(1))
                    print("Customer Success Agent: Successfully extracted and parsed JSON from response.")
                    return success_strategy
                except json.JSONDecodeError:
                    pass
            
            # Return a structured error response
            return {
                "error": "Failed to parse JSON response",
                "raw_response": response[:1000] + "..." if len(response) > 1000 else response
            }
    except Exception as e:
        print(f"Customer Success Agent: Execution error: {e}")
        return {"error": str(e)}
