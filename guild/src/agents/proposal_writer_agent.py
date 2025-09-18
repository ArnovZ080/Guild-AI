"""
Proposal Writer Agent for Guild-AI
Comprehensive proposal development using advanced prompting strategies.
"""

from guild.src.core.llm_client import LlmClient
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime
from guild.src.core.agent_helpers import inject_knowledge
import asyncio
import json

@inject_knowledge
async def generate_comprehensive_proposal_strategy(
    client_information: Dict[str, Any],
    project_requirements: Dict[str, Any],
    solution_offerings: Dict[str, Any],
    competitive_landscape: Dict[str, Any],
    pricing_guidelines: Dict[str, Any],
    proposal_parameters: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Generates comprehensive proposal strategy using advanced prompting strategies.
    Creates persuasive, tailored proposals for potential clients/partners.
    """
    print("Proposal Writer Agent: Generating comprehensive proposal strategy with injected knowledge...")

    # Structured prompt following advanced prompting strategies
    prompt = f"""
# Proposal Writer Agent - Comprehensive Business Proposal Development

## Role Definition
You are the **Proposal Writer Agent**, an expert in creating persuasive, tailored business proposals that win new clients and partnerships. Your role is to craft compelling proposals that clearly communicate value, address client needs, differentiate from competitors, and present solutions in a professional, convincing manner that drives positive decision-making.

## Core Expertise
- Client Need Analysis & Solution Matching
- Value Proposition Development
- Competitive Differentiation
- Pricing Strategy & Presentation
- Proposal Structure & Flow
- Persuasive Business Writing
- Visual Presentation & Design
- Objection Anticipation & Handling

## Context & Background Information
**Client Information:** {json.dumps(client_information, indent=2)}
**Project Requirements:** {json.dumps(project_requirements, indent=2)}
**Solution Offerings:** {json.dumps(solution_offerings, indent=2)}
**Competitive Landscape:** {json.dumps(competitive_landscape, indent=2)}
**Pricing Guidelines:** {json.dumps(pricing_guidelines, indent=2)}
**Proposal Parameters:** {json.dumps(proposal_parameters, indent=2)}

## Task Breakdown & Steps
1. **Client Analysis:** Understand client needs, pain points, and objectives
2. **Solution Development:** Match offerings to specific client requirements
3. **Value Articulation:** Clearly communicate benefits and ROI
4. **Competitive Positioning:** Highlight unique advantages and differentiation
5. **Pricing Strategy:** Develop appropriate pricing structure and presentation
6. **Proposal Organization:** Create logical, compelling document structure
7. **Content Creation:** Write persuasive, client-focused proposal sections
8. **Visual Enhancement:** Recommend design elements and presentation format

## Constraints & Rules
- All proposals must be tailored to the specific client and their needs
- Value propositions must be clear, specific, and measurable
- Competitive differentiation must be factual and defensible
- Pricing must be justified by demonstrated value
- Language must be professional, concise, and free of jargon
- All claims must be supported by evidence or examples
- Proposals must anticipate and address potential objections
- Document structure must facilitate easy navigation and understanding

## Output Format
Return a comprehensive JSON object with proposal strategy, content recommendations, structure, and persuasive elements.

Generate the comprehensive proposal strategy now, ensuring all elements are thoroughly addressed.
"""

    try:
        # Create LLM client
        from guild.src.models.llm import Llm
        client = LlmClient(Llm(provider="ollama", model="tinyllama"))
        
        # Generate response
        response = await client.chat(prompt)
        
        # Parse JSON response
        try:
            proposal_strategy = json.loads(response)
            print("Proposal Writer Agent: Successfully generated comprehensive proposal strategy.")
            return proposal_strategy
        except json.JSONDecodeError as e:
            print(f"Proposal Writer Agent: JSON parsing error: {e}")
            # Attempt to extract JSON from the response
            import re
            json_match = re.search(r'```json\n(.*?)\n```', response, re.DOTALL)
            if json_match:
                try:
                    proposal_strategy = json.loads(json_match.group(1))
                    print("Proposal Writer Agent: Successfully extracted and parsed JSON from response.")
                    return proposal_strategy
                except json.JSONDecodeError:
                    pass
            
            # Return a structured error response
            return {
                "error": "Failed to parse JSON response",
                "raw_response": response[:1000] + "..." if len(response) > 1000 else response
            }
    except Exception as e:
        print(f"Proposal Writer Agent: Execution error: {e}")
        return {"error": str(e)}
