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
import logging

logger = logging.getLogger(__name__)

class ProposalWriterAgent:
    """
    Proposal Writer Agent for Guild-AI
    Expert in creating persuasive, tailored business proposals that win clients and partnerships.
    """
    
    def __init__(self, name: str = "Proposal Writer Agent", user_input=None):
        self.name = name
        self.user_input = user_input
        self.agent_name = "Proposal Writer Agent"
        self.agent_type = "Sales"
        self.role = "Comprehensive Business Proposal Development"
        self.expertise = [
            "Client Need Analysis & Solution Matching",
            "Value Proposition Development",
            "Competitive Differentiation",
            "Pricing Strategy & Presentation",
            "Proposal Structure & Flow",
            "Persuasive Business Writing",
            "Visual Presentation & Design",
            "Objection Anticipation & Handling"
        ]
        self.capabilities = [
            "Create persuasive, tailored business proposals",
            "Analyze client needs and match solutions",
            "Develop compelling value propositions",
            "Position competitively against alternatives",
            "Design effective pricing strategies",
            "Structure logical, compelling proposal documents",
            "Write client-focused, persuasive content",
            "Anticipate and address potential objections"
        ]
        self.proposal_templates = {}
        self.client_proposals = {}
    
    async def generate_proposal(
        self,
        client_information: Dict[str, Any],
        project_requirements: Dict[str, Any],
        solution_offerings: Dict[str, Any],
        competitive_landscape: Dict[str, Any],
        pricing_guidelines: Dict[str, Any],
        proposal_parameters: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate a comprehensive business proposal.
        
        This method wraps the standalone function for class-based access.
        """
        return await generate_comprehensive_proposal_strategy(
            client_information, project_requirements, solution_offerings,
            competitive_landscape, pricing_guidelines, proposal_parameters
        )
    
    def create_proposal_template(self, proposal_type: str) -> Dict[str, Any]:
        """Create a reusable template for specific proposal types."""
        templates = {
            "service": {
                "sections": [
                    "Executive Summary",
                    "Understanding Your Needs",
                    "Proposed Solution",
                    "Our Approach",
                    "Timeline & Deliverables",
                    "Investment & Pricing",
                    "Why Choose Us",
                    "Next Steps"
                ]
            },
            "product": {
                "sections": [
                    "Executive Summary",
                    "Challenge Overview",
                    "Product Solution",
                    "Features & Benefits",
                    "Implementation Plan",
                    "Pricing Options",
                    "Case Studies",
                    "Terms & Conditions"
                ]
            }
        }
        return templates.get(proposal_type, templates["service"])
    
    def track_proposal(self, proposal_id: str, proposal_data: Dict[str, Any]) -> None:
        """Track proposal for follow-up and analysis."""
        self.client_proposals[proposal_id] = {
            "created_at": datetime.utcnow(),
            "proposal_data": proposal_data,
            "status": "submitted"
        }

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
