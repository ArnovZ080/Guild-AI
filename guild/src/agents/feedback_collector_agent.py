"""
Feedback Collector Agent for Guild-AI
Comprehensive feedback collection and analysis using advanced prompting strategies.
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

class FeedbackCollectorAgent:
    """
    Feedback Collector Agent
    """
    
    def __init__(self, name: str = "Feedback Collector Agent", user_input=None):
        self.name = name
        self.user_input = user_input
        self.agent_name = "Feedback Collector Agent"
        self.agent_type = "Agent"
        self.role = "Feedback Collector Agent"
        self.expertise = []
        self.capabilities = []


@inject_knowledge
async def generate_comprehensive_feedback_collection_strategy(
    customer_segments: Dict[str, Any],
    product_features: Dict[str, Any],
    feedback_objectives: Dict[str, Any],
    historical_feedback: Dict[str, Any],
    collection_channels: Dict[str, Any],
    business_priorities: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Generates comprehensive feedback collection strategy using advanced prompting strategies.
    Gathers, analyzes, and synthesizes customer feedback for product improvement.
    """
    print("Feedback Collector Agent: Generating comprehensive feedback collection strategy with injected knowledge...")

    # Structured prompt following advanced prompting strategies
    prompt = f"""
# Feedback Collector Agent - Comprehensive Customer Insight Gathering

## Role Definition
You are the **Feedback Collector Agent**, an expert in customer feedback solicitation, analysis, and implementation. Your role is to design effective feedback collection methods, gather meaningful insights from customers, analyze patterns and trends, and translate feedback into actionable recommendations that drive product improvement and customer satisfaction.

## Core Expertise
- Feedback Collection Method Design
- Question & Survey Development
- Customer Segmentation & Targeting
- Sentiment Analysis & Pattern Recognition
- Insight Extraction & Prioritization
- Feedback-to-Action Translation
- Closed-Loop Communication
- Voice of Customer Program Management

## Context & Background Information
**Customer Segments:** {json.dumps(customer_segments, indent=2)}
**Product Features:** {json.dumps(product_features, indent=2)}
**Feedback Objectives:** {json.dumps(feedback_objectives, indent=2)}
**Historical Feedback:** {json.dumps(historical_feedback, indent=2)}
**Collection Channels:** {json.dumps(collection_channels, indent=2)}
**Business Priorities:** {json.dumps(business_priorities, indent=2)}

## Task Breakdown & Steps
1. **Objective Definition:** Clarify specific feedback goals and desired outcomes
2. **Methodology Selection:** Choose appropriate feedback collection methods
3. **Question Development:** Create effective questions that elicit useful insights
4. **Targeting Strategy:** Identify ideal customer segments for specific feedback
5. **Collection Execution:** Implement feedback gathering across channels
6. **Analysis Framework:** Develop approach for synthesizing and interpreting data
7. **Insight Extraction:** Identify key patterns, trends, and actionable findings
8. **Recommendation Development:** Translate insights into specific action items

## Constraints & Rules
- Collection methods must respect customer time and preferences
- Questions must be clear, unbiased, and designed for actionable responses
- Targeting must ensure representative feedback across customer segments
- Analysis must distinguish between signal and noise in feedback data
- Recommendations must be specific, feasible, and aligned with business goals
- Feedback loops must be closed with appropriate customer communication
- Collection timing must be appropriate to customer journey stage
- All feedback must be treated with appropriate privacy and confidentiality

## Output Format
Return a comprehensive JSON object with feedback collection strategy, question designs, analysis framework, and recommendation approach.

Generate the comprehensive feedback collection strategy now, ensuring all elements are thoroughly addressed.
"""

    try:
        # Create LLM client
        from guild.src.models.llm import Llm
        client = LlmClient(Llm(provider="ollama", model="tinyllama"))
        
        # Generate response
        response = await client.chat(prompt)
        
        # Parse JSON response
        try:
            feedback_strategy = json.loads(response)
            print("Feedback Collector Agent: Successfully generated comprehensive feedback collection strategy.")
            return feedback_strategy
        except json.JSONDecodeError as e:
            print(f"Feedback Collector Agent: JSON parsing error: {e}")
            # Attempt to extract JSON from the response
            import re
            json_match = re.search(r'```json\n(.*?)\n```', response, re.DOTALL)
            if json_match:
                try:
                    feedback_strategy = json.loads(json_match.group(1))
                    print("Feedback Collector Agent: Successfully extracted and parsed JSON from response.")
                    return feedback_strategy
                except json.JSONDecodeError:
                    pass
            
            # Return a structured error response
            return {
                "error": "Failed to parse JSON response",
                "raw_response": response[:1000] + "..." if len(response) > 1000 else response
            }
    except Exception as e:
        print(f"Feedback Collector Agent: Execution error: {e}")
        return {"error": str(e)}
