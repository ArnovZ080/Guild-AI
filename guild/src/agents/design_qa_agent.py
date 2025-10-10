"""
Design QA Agent for Guild-AI
Comprehensive design quality assurance using advanced prompting strategies.
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

class DesignQaAgent:
    """
    Design QA Agent
    """
    
    def __init__(self, name: str = "Design QA Agent", user_input=None):
        self.name = name
        self.user_input = user_input
        self.agent_name = "Design QA Agent"
        self.agent_type = "Agent"
        self.role = "Design QA Agent"
        self.expertise = []
        self.capabilities = []


@inject_knowledge
async def generate_comprehensive_design_qa_strategy(
    design_assets: Dict[str, Any],
    brand_guidelines: Dict[str, Any],
    design_requirements: Dict[str, Any],
    platform_specifications: Dict[str, Any],
    accessibility_standards: Dict[str, Any],
    target_audience: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Generates comprehensive design QA strategy using advanced prompting strategies.
    Ensures visual assets meet brand standards, accessibility, and design best practices.
    """
    print("Design QA Agent: Generating comprehensive design QA strategy with injected knowledge...")

    # Structured prompt following advanced prompting strategies
    prompt = f"""
# Design QA Agent - Comprehensive Visual Quality Assurance

## Role Definition
You are the **Design QA Agent**, an expert in design quality assessment, brand consistency, and visual standards. Your role is to evaluate design assets against brand guidelines, accessibility requirements, and best practices to ensure high-quality, consistent, and effective visual communications across all platforms and touchpoints.

## Core Expertise
- Brand Consistency Verification
- Design Best Practice Application
- Accessibility Compliance
- Cross-Platform Compatibility
- Visual Hierarchy Assessment
- Typography & Color Evaluation
- Asset Optimization & Performance
- User Experience Considerations

## Context & Background Information
**Design Assets:** {json.dumps(design_assets, indent=2)}
**Brand Guidelines:** {json.dumps(brand_guidelines, indent=2)}
**Design Requirements:** {json.dumps(design_requirements, indent=2)}
**Platform Specifications:** {json.dumps(platform_specifications, indent=2)}
**Accessibility Standards:** {json.dumps(accessibility_standards, indent=2)}
**Target Audience:** {json.dumps(target_audience, indent=2)}

## Task Breakdown & Steps
1. **Brand Alignment:** Verify consistency with brand identity and guidelines
2. **Visual Hierarchy:** Assess information prioritization and flow
3. **Accessibility Review:** Evaluate compliance with accessibility standards
4. **Technical Verification:** Check specifications for various platforms
5. **Design Principle Application:** Assess adherence to design best practices
6. **Asset Optimization:** Review file formats, sizes, and performance
7. **Consistency Evaluation:** Ensure cohesion across related materials
8. **Improvement Recommendations:** Provide specific enhancement suggestions

## Constraints & Rules
- All evaluations must be objective and evidence-based
- Brand guidelines must be strictly enforced
- Accessibility requirements must not be compromised
- Technical specifications must be appropriate for intended platforms
- Design principles must be applied contextually
- Feedback must be constructive and actionable
- Recommendations must be prioritized by impact
- Assessment must consider target audience needs and preferences

## Output Format
Return a comprehensive JSON object with design evaluation, compliance assessment, issue identification, and improvement recommendations.

Generate the comprehensive design QA strategy now, ensuring all elements are thoroughly addressed.
"""

    try:
        # Create LLM client
        from guild.src.models.llm import Llm
        client = LlmClient(Llm(provider="ollama", model="tinyllama"))
        
        # Generate response
        response = await client.chat(prompt)
        
        # Parse JSON response
        try:
            design_qa_strategy = json.loads(response)
            print("Design QA Agent: Successfully generated comprehensive design QA strategy.")
            return design_qa_strategy
        except json.JSONDecodeError as e:
            print(f"Design QA Agent: JSON parsing error: {e}")
            # Attempt to extract JSON from the response
            import re
            json_match = re.search(r'```json\n(.*?)\n```', response, re.DOTALL)
            if json_match:
                try:
                    design_qa_strategy = json.loads(json_match.group(1))
                    print("Design QA Agent: Successfully extracted and parsed JSON from response.")
                    return design_qa_strategy
                except json.JSONDecodeError:
                    pass
            
            # Return a structured error response
            return {
                "error": "Failed to parse JSON response",
                "raw_response": response[:1000] + "..." if len(response) > 1000 else response
            }
    except Exception as e:
        print(f"Design QA Agent: Execution error: {e}")
        return {"error": str(e)}
