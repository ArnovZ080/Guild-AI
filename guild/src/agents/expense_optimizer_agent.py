"""
Expense Optimizer Agent for Guild-AI
Comprehensive expense optimization using advanced prompting strategies.
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

class ExpenseOptimizerAgent:
    """
    Expense Optimizer Agent
    """
    
    def __init__(self, name: str = "Expense Optimizer Agent", user_input=None):
        self.name = name
        self.user_input = user_input
        self.agent_name = "Expense Optimizer Agent"
        self.agent_type = "Agent"
        self.role = "Expense Optimizer Agent"
        self.expertise = []
        self.capabilities = []


@inject_knowledge
async def generate_comprehensive_expense_optimization_strategy(
    expense_data: Dict[str, Any],
    subscription_inventory: Dict[str, Any],
    business_requirements: Dict[str, Any],
    usage_patterns: Dict[str, Any],
    budget_constraints: Dict[str, Any],
    optimization_goals: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Generates comprehensive expense optimization strategy using advanced prompting strategies.
    Reviews SaaS/tool subscriptions, suggests cancellations or consolidations.
    """
    print("Expense Optimizer Agent: Generating comprehensive expense optimization strategy with injected knowledge...")

    # Structured prompt following advanced prompting strategies
    prompt = f"""
# Expense Optimizer Agent - Comprehensive Cost Reduction & Efficiency

## Role Definition
You are the **Expense Optimizer Agent**, an expert in cost management, subscription optimization, and financial efficiency. Your role is to analyze business expenses, particularly SaaS and tool subscriptions, identify redundancies and inefficiencies, and recommend strategic cancellations, consolidations, or alternatives to reduce costs while maintaining operational effectiveness.

## Core Expertise
- SaaS Subscription Analysis & Management
- Tool Consolidation & Redundancy Elimination
- Usage Pattern Assessment
- Cost-Benefit Analysis
- Alternative Solution Research
- Negotiation Strategy Development
- Budget Optimization & Planning
- ROI Evaluation for Business Tools

## Context & Background Information
**Expense Data:** {json.dumps(expense_data, indent=2)}
**Subscription Inventory:** {json.dumps(subscription_inventory, indent=2)}
**Business Requirements:** {json.dumps(business_requirements, indent=2)}
**Usage Patterns:** {json.dumps(usage_patterns, indent=2)}
**Budget Constraints:** {json.dumps(budget_constraints, indent=2)}
**Optimization Goals:** {json.dumps(optimization_goals, indent=2)}

## Task Breakdown & Steps
1. **Expense Analysis:** Review all current expenses with focus on subscriptions and recurring costs
2. **Usage Evaluation:** Assess actual utilization of tools and services against their cost
3. **Redundancy Identification:** Identify overlapping functionalities across multiple tools
4. **Consolidation Planning:** Recommend tool consolidation to reduce redundant expenses
5. **Alternative Research:** Identify more cost-effective solutions with similar functionality
6. **Negotiation Guidance:** Provide strategies for better terms with current providers
7. **Cancellation Recommendations:** Suggest subscriptions to cancel with minimal operational impact
8. **Implementation Planning:** Create phased approach to expense optimization

## Constraints & Rules
- All recommendations must maintain essential business functionality
- Cost savings must be balanced against transition costs and disruption
- Usage data must inform recommendations when available
- Consolidation suggestions must consider integration capabilities
- Alternative solutions must be thoroughly vetted for reliability and security
- Recommendations must be prioritized by savings potential and implementation ease
- Cancellation suggestions must include data export/transition considerations
- All strategies must align with overall business goals and requirements

## Output Format
Return a comprehensive JSON object with expense analysis, optimization recommendations, and implementation strategy.

Generate the comprehensive expense optimization strategy now, ensuring all elements are thoroughly addressed.
"""

    try:
        # Create LLM client
        from guild.src.models.llm import Llm
        client = LlmClient(Llm(provider="ollama", model="tinyllama"))
        
        # Generate response
        response = await client.chat(prompt)
        
        # Parse JSON response
        try:
            optimization_strategy = json.loads(response)
            print("Expense Optimizer Agent: Successfully generated comprehensive expense optimization strategy.")
            return optimization_strategy
        except json.JSONDecodeError as e:
            print(f"Expense Optimizer Agent: JSON parsing error: {e}")
            # Attempt to extract JSON from the response
            import re
            json_match = re.search(r'```json\n(.*?)\n```', response, re.DOTALL)
            if json_match:
                try:
                    optimization_strategy = json.loads(json_match.group(1))
                    print("Expense Optimizer Agent: Successfully extracted and parsed JSON from response.")
                    return optimization_strategy
                except json.JSONDecodeError:
                    pass
            
            # Return a structured error response
            return {
                "error": "Failed to parse JSON response",
                "raw_response": response[:1000] + "..." if len(response) > 1000 else response
            }
    except Exception as e:
        print(f"Expense Optimizer Agent: Execution error: {e}")
        return {"error": str(e)}
