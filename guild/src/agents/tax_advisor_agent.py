"""
Tax Advisor Agent for Guild-AI
Comprehensive tax compliance and advisory using advanced prompting strategies.
"""

from guild.src.core.llm_client import LlmClient
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime
from guild.src.core.agent_helpers import inject_knowledge
import asyncio
import json

@inject_knowledge
async def generate_comprehensive_tax_advisory_strategy(
    business_structure: str,
    financial_data: Dict[str, Any],
    tax_jurisdictions: Dict[str, Any],
    compliance_requirements: Dict[str, Any],
    filing_deadlines: Dict[str, Any],
    tax_planning_goals: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Generates comprehensive tax advisory strategy using advanced prompting strategies.
    Ensures compliance with VAT/GST/sales tax, files simple returns, alerts on due dates.
    """
    print("Tax Advisor Agent: Generating comprehensive tax advisory strategy with injected knowledge...")

    # Structured prompt following advanced prompting strategies
    prompt = f"""
# Tax Advisor Agent - Comprehensive Tax Compliance & Planning

## Role Definition
You are the **Tax Advisor Agent**, an expert in tax compliance, planning, and optimization for small businesses and solopreneurs. Your role is to ensure adherence to tax regulations, manage filing deadlines, optimize tax positions, and provide strategic guidance on tax-related business decisions.

## Core Expertise
- Sales Tax/VAT/GST Compliance
- Tax Filing & Deadline Management
- Tax Deduction Optimization
- Business Structure Tax Implications
- Multi-jurisdiction Tax Requirements
- Tax Calendar & Reminder Systems
- Basic Tax Return Preparation
- Tax-Efficient Business Planning

## Context & Background Information
**Business Structure:** {business_structure}
**Financial Data:** {json.dumps(financial_data, indent=2)}
**Tax Jurisdictions:** {json.dumps(tax_jurisdictions, indent=2)}
**Compliance Requirements:** {json.dumps(compliance_requirements, indent=2)}
**Filing Deadlines:** {json.dumps(filing_deadlines, indent=2)}
**Tax Planning Goals:** {json.dumps(tax_planning_goals, indent=2)}

## Task Breakdown & Steps
1. **Compliance Assessment:** Evaluate current tax obligations across all applicable jurisdictions
2. **Deadline Management:** Create comprehensive tax calendar with reminders and preparation timelines
3. **Documentation Review:** Ensure proper record-keeping for tax compliance and audit protection
4. **Return Preparation:** Generate simple tax returns or provide guidance for complex situations
5. **Deduction Analysis:** Identify applicable tax deductions and credits
6. **Structure Optimization:** Recommend tax-efficient business structures and practices
7. **Strategic Planning:** Develop tax strategies aligned with business goals
8. **Education & Updates:** Keep business owners informed of relevant tax changes and requirements

## Constraints & Rules
- All advice must comply with current tax laws and regulations
- Recommendations must be conservative and defensible in case of audit
- Complex situations must include a recommendation to consult a licensed tax professional
- Deadlines must include adequate preparation time before actual filing dates
- Documentation requirements must be clearly specified and manageable
- Tax strategies must balance compliance with legitimate optimization
- Jurisdiction-specific rules must be accurately applied
- All guidance must be clear, actionable, and understandable to non-tax experts

## Output Format
Return a comprehensive JSON object with tax compliance strategy, deadline management, optimization recommendations, and filing guidance.

Generate the comprehensive tax advisory strategy now, ensuring all elements are thoroughly addressed.
"""

    try:
        # Create LLM client
        from guild.src.models.llm import Llm
        client = LlmClient(Llm(provider="ollama", model="tinyllama"))
        
        # Generate response
        response = await client.chat(prompt)
        
        # Parse JSON response
        try:
            tax_strategy = json.loads(response)
            print("Tax Advisor Agent: Successfully generated comprehensive tax advisory strategy.")
            return tax_strategy
        except json.JSONDecodeError as e:
            print(f"Tax Advisor Agent: JSON parsing error: {e}")
            # Attempt to extract JSON from the response
            import re
            json_match = re.search(r'```json\n(.*?)\n```', response, re.DOTALL)
            if json_match:
                try:
                    tax_strategy = json.loads(json_match.group(1))
                    print("Tax Advisor Agent: Successfully extracted and parsed JSON from response.")
                    return tax_strategy
                except json.JSONDecodeError:
                    pass
            
            # Return a structured error response
            return {
                "error": "Failed to parse JSON response",
                "raw_response": response[:1000] + "..." if len(response) > 1000 else response
            }
    except Exception as e:
        print(f"Tax Advisor Agent: Execution error: {e}")
        return {"error": str(e)}
