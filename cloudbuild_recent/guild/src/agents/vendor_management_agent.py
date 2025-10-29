"""
Vendor Management Agent for Guild-AI
Comprehensive supplier relationship management using advanced prompting strategies.
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

class VendorManagementAgent:
    """
    Vendor Management Agent for Guild-AI
    Vendor Relationship Management
    """
    
    def __init__(self, name: str = "Vendor Management Agent", user_input=None):
        self.name = name
        self.user_input = user_input
        self.agent_name = "Vendor Management Agent"
        self.agent_type = "Operations"
        self.role = "Vendor Relationship Management"
        self.expertise = [
            "Vendor Selection",
            "Contract Negotiation",
            "Performance Monitoring",
            "Relationship Management"
        ]
        self.capabilities = [
            "Manage vendor relationships",
            "Negotiate contracts",
            "Monitor vendor performance"
        ]


@inject_knowledge
async def generate_comprehensive_vendor_management_strategy(
    vendor_information: Dict[str, Any],
    contract_details: Dict[str, Any],
    performance_metrics: Dict[str, Any],
    business_requirements: Dict[str, Any],
    risk_assessment: Dict[str, Any],
    relationship_history: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Generates comprehensive vendor management strategy using advanced prompting strategies.
    Manages supplier relationships, evaluates performance, and optimizes partnerships.
    """
    print("Vendor Management Agent: Generating comprehensive vendor management strategy with injected knowledge...")

    # Structured prompt following advanced prompting strategies
    prompt = f"""
# Vendor Management Agent - Comprehensive Supplier Relationship Optimization

## Role Definition
You are the **Vendor Management Agent**, an expert in supplier relationship management, performance evaluation, and partnership optimization. Your role is to oversee vendor relationships, ensure contract compliance, evaluate performance against requirements, manage risk, and strategically develop supplier partnerships to maximize value while minimizing costs and disruptions.

## Core Expertise
- Vendor Performance Evaluation
- Contract Compliance Monitoring
- Relationship Management
- Risk Assessment & Mitigation
- Cost Optimization
- Service Level Agreement Tracking
- Strategic Partnership Development
- Supplier Consolidation Analysis

## Context & Background Information
**Vendor Information:** {json.dumps(vendor_information, indent=2)}
**Contract Details:** {json.dumps(contract_details, indent=2)}
**Performance Metrics:** {json.dumps(performance_metrics, indent=2)}
**Business Requirements:** {json.dumps(business_requirements, indent=2)}
**Risk Assessment:** {json.dumps(risk_assessment, indent=2)}
**Relationship History:** {json.dumps(relationship_history, indent=2)}

## Task Breakdown & Steps
1. **Vendor Analysis:** Evaluate supplier capabilities, performance, and alignment
2. **Contract Review:** Assess terms, obligations, and compliance status
3. **Performance Measurement:** Track and evaluate against key metrics and SLAs
4. **Risk Identification:** Identify and mitigate potential vendor-related risks
5. **Relationship Development:** Cultivate strategic partnerships with key suppliers
6. **Cost Management:** Identify optimization opportunities and negotiate improvements
7. **Issue Resolution:** Address performance gaps and relationship challenges
8. **Strategic Planning:** Develop long-term vendor strategy and contingency plans

## Constraints & Rules
- All evaluations must be objective and evidence-based
- Performance metrics must align with business requirements
- Risk assessments must consider both short and long-term factors
- Relationship management must balance leverage with partnership
- Cost optimization must not compromise quality or reliability
- Strategic decisions must consider total cost of ownership
- Vendor communications must be professional and constructive
- All recommendations must consider implementation feasibility

## Output Format
Return a comprehensive JSON object with vendor analysis, performance evaluation, risk assessment, and strategic recommendations.

Generate the comprehensive vendor management strategy now, ensuring all elements are thoroughly addressed.
"""

    try:
        # Create LLM client
        from guild.src.models.llm import Llm
        client = LlmClient(Llm(provider="ollama", model="tinyllama"))
        
        # Generate response
        response = await client.chat(prompt)
        
        # Parse JSON response
        try:
            vendor_strategy = json.loads(response)
            print("Vendor Management Agent: Successfully generated comprehensive vendor management strategy.")
            return vendor_strategy
        except json.JSONDecodeError as e:
            print(f"Vendor Management Agent: JSON parsing error: {e}")
            # Attempt to extract JSON from the response
            import re
            json_match = re.search(r'```json\n(.*?)\n```', response, re.DOTALL)
            if json_match:
                try:
                    vendor_strategy = json.loads(json_match.group(1))
                    print("Vendor Management Agent: Successfully extracted and parsed JSON from response.")
                    return vendor_strategy
                except json.JSONDecodeError:
                    pass
            
            # Return a structured error response
            return {
                "error": "Failed to parse JSON response",
                "raw_response": response[:1000] + "..." if len(response) > 1000 else response
            }
    except Exception as e:
        print(f"Vendor Management Agent: Execution error: {e}")
        return {"error": str(e)}
