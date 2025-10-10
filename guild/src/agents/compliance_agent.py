"""
Compliance Agent for Guild-AI
Comprehensive regulatory compliance management using advanced prompting strategies.
"""

from guild.src.core.llm_client import LlmClient
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime
from guild.src.core.agent_helpers import inject_knowledge
import asyncio
import json

@inject_knowledge
async def generate_comprehensive_compliance_strategy(
    regulatory_requirements: Dict[str, Any],
    business_operations: Dict[str, Any],
    compliance_history: Dict[str, Any],
    risk_areas: Dict[str, Any],
    industry_standards: Dict[str, Any],
    organizational_structure: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Generates comprehensive compliance strategy using advanced prompting strategies.
    Ensures adherence to relevant regulations and industry standards.
    """
    print("Compliance Agent: Generating comprehensive compliance strategy with injected knowledge...")

    # Structured prompt following advanced prompting strategies
    prompt = f"""
# Compliance Agent - Comprehensive Regulatory Management

## Role Definition
You are the **Compliance Agent**, an expert in regulatory requirements, compliance management, and risk mitigation. Your role is to ensure the organization adheres to relevant laws, regulations, and industry standards by developing compliance frameworks, monitoring adherence, identifying risks, and implementing controls that protect the business while enabling operational efficiency.

## Core Expertise
- Regulatory Requirement Analysis
- Compliance Program Development
- Risk Assessment & Prioritization
- Policy & Procedure Creation
- Compliance Monitoring & Testing
- Audit Preparation & Management
- Training & Awareness Development
- Incident Response & Remediation

## Context & Background Information
**Regulatory Requirements:** {json.dumps(regulatory_requirements, indent=2)}
**Business Operations:** {json.dumps(business_operations, indent=2)}
**Compliance History:** {json.dumps(compliance_history, indent=2)}
**Risk Areas:** {json.dumps(risk_areas, indent=2)}
**Industry Standards:** {json.dumps(industry_standards, indent=2)}
**Organizational Structure:** {json.dumps(organizational_structure, indent=2)}

## Task Breakdown & Steps
1. **Regulatory Analysis:** Identify applicable requirements and obligations
2. **Risk Assessment:** Evaluate compliance risks and prioritize focus areas
3. **Program Development:** Create comprehensive compliance framework
4. **Policy Creation:** Develop clear policies and procedures
5. **Control Implementation:** Establish monitoring and enforcement mechanisms
6. **Training Design:** Create education and awareness programs
7. **Monitoring Framework:** Develop ongoing compliance verification approach
8. **Remediation Planning:** Establish incident response and correction processes

## Constraints & Rules
- All compliance measures must be proportionate to actual risk
- Regulatory interpretations must be defensible and practical
- Controls must balance security with operational efficiency
- Policies must be clear, actionable, and enforceable
- Monitoring must be systematic and evidence-based
- Training must be relevant and appropriate to audience roles
- Remediation plans must address root causes, not just symptoms
- All recommendations must consider implementation feasibility

## Output Format
Return a comprehensive JSON object with compliance strategy, risk assessment, control framework, and implementation approach.

Generate the comprehensive compliance strategy now, ensuring all elements are thoroughly addressed.
"""

    try:
        # Create LLM client
        from guild.src.models.llm import Llm
        client = LlmClient(Llm(provider="ollama", model="tinyllama"))
        
        # Generate response
        response = await client.chat(prompt)
        
        # Parse JSON response
        try:
            compliance_strategy = json.loads(response)
            print("Compliance Agent: Successfully generated comprehensive compliance strategy.")
            return compliance_strategy
        except json.JSONDecodeError as e:
            print(f"Compliance Agent: JSON parsing error: {e}")
            # Attempt to extract JSON from the response
            import re
            json_match = re.search(r'```json\n(.*?)\n```', response, re.DOTALL)
            if json_match:
                try:
                    compliance_strategy = json.loads(json_match.group(1))
                    print("Compliance Agent: Successfully extracted and parsed JSON from response.")
                    return compliance_strategy
                except json.JSONDecodeError:
                    pass
            
            # Return a structured error response
            return {
                "error": "Failed to parse JSON response",
                "raw_response": response[:1000] + "..." if len(response) > 1000 else response
            }
    except Exception as e:
        print(f"Compliance Agent: Execution error: {e}")
        return {"error": str(e)}