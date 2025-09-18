"""
Contract Analyzer Agent for Guild-AI
Comprehensive contract analysis using advanced prompting strategies.
"""

from guild.src.core.llm_client import LlmClient
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime
from guild.src.core.agent_helpers import inject_knowledge
import asyncio
import json

@inject_knowledge
async def generate_comprehensive_contract_analysis(
    contract_text: str,
    business_priorities: Dict[str, Any],
    risk_tolerance: Dict[str, Any],
    industry_standards: Dict[str, Any],
    negotiation_context: Dict[str, Any],
    legal_requirements: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Generates comprehensive contract analysis using advanced prompting strategies.
    Reviews agreements to identify risks, unusual terms, and negotiation points.
    """
    print("Contract Analyzer Agent: Generating comprehensive contract analysis with injected knowledge...")

    # Structured prompt following advanced prompting strategies
    prompt = f"""
# Contract Analyzer Agent - Comprehensive Agreement Review & Analysis

## Role Definition
You are the **Contract Analyzer Agent**, an expert in contract review, risk assessment, and agreement optimization. Your role is to analyze legal documents, identify potential risks and opportunities, highlight unusual terms, and provide actionable recommendations for negotiation or improvement to protect business interests while facilitating productive relationships.

## Core Expertise
- Contract Term Analysis & Interpretation
- Risk Identification & Assessment
- Standard vs. Non-standard Clause Detection
- Obligation & Commitment Mapping
- Legal Language Simplification
- Negotiation Point Identification
- Compliance Verification
- Contract Comparison & Benchmarking

## Context & Background Information
**Contract Text:** {contract_text[:1000]}... [truncated for prompt length]
**Business Priorities:** {json.dumps(business_priorities, indent=2)}
**Risk Tolerance:** {json.dumps(risk_tolerance, indent=2)}
**Industry Standards:** {json.dumps(industry_standards, indent=2)}
**Negotiation Context:** {json.dumps(negotiation_context, indent=2)}
**Legal Requirements:** {json.dumps(legal_requirements, indent=2)}

## Task Breakdown & Steps
1. **Contract Overview:** Identify document type, parties, and key parameters
2. **Term Analysis:** Review and interpret key clauses and provisions
3. **Risk Assessment:** Identify potential risks and liabilities
4. **Obligation Mapping:** Clarify responsibilities and commitments
5. **Non-standard Detection:** Flag unusual or concerning terms
6. **Compliance Check:** Verify alignment with legal and regulatory requirements
7. **Negotiation Guidance:** Recommend points for discussion or amendment
8. **Summary Creation:** Provide clear, actionable overview of findings

## Constraints & Rules
- Analysis must focus on business impact, not just legal technicalities
- Risk assessments must be practical and contextualized to the business
- Recommendations must be actionable and prioritized
- Legal language must be translated into clear business terms
- Industry standards must inform evaluation of terms
- Business priorities must guide recommendation importance
- All major contract sections must be addressed
- Disclaimers about not providing legal advice must be included

## Output Format
Return a comprehensive JSON object with contract analysis, risk assessment, negotiation recommendations, and summary overview.

Generate the comprehensive contract analysis now, ensuring all elements are thoroughly addressed.
"""

    try:
        # Create LLM client
        from guild.src.models.llm import Llm
        client = LlmClient(Llm(provider="ollama", model="tinyllama"))
        
        # Generate response
        response = await client.chat(prompt)
        
        # Parse JSON response
        try:
            contract_analysis = json.loads(response)
            print("Contract Analyzer Agent: Successfully generated comprehensive contract analysis.")
            return contract_analysis
        except json.JSONDecodeError as e:
            print(f"Contract Analyzer Agent: JSON parsing error: {e}")
            # Attempt to extract JSON from the response
            import re
            json_match = re.search(r'```json\n(.*?)\n```', response, re.DOTALL)
            if json_match:
                try:
                    contract_analysis = json.loads(json_match.group(1))
                    print("Contract Analyzer Agent: Successfully extracted and parsed JSON from response.")
                    return contract_analysis
                except json.JSONDecodeError:
                    pass
            
            # Return a structured error response
            return {
                "error": "Failed to parse JSON response",
                "raw_response": response[:1000] + "..." if len(response) > 1000 else response
            }
    except Exception as e:
        print(f"Contract Analyzer Agent: Execution error: {e}")
        return {"error": str(e)}
