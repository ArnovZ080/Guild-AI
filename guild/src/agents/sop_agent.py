"""
SOP (Standard Operating Procedure) Agent for Guild-AI
Comprehensive process documentation using advanced prompting strategies.
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

class SopAgent:
    """
    SOP (Standard Operating Procedure) Agent for Guild-AI
    Expert in process documentation, workflow optimization, and knowledge standardization.
    """
    
    def __init__(self, name: str = "SOP Agent", user_input=None):
        self.name = name
        self.user_input = user_input
        self.agent_name = "SOP Agent"
        self.agent_type = "Operations"
        self.role = "Comprehensive Process Documentation"
        self.expertise = [
            "Process Analysis & Mapping",
            "Procedural Documentation",
            "Workflow Optimization",
            "Compliance Integration",
            "Knowledge Standardization",
            "Visual Process Representation",
            "Training Material Development",
            "Documentation Usability & Accessibility"
        ]
        self.capabilities = [
            "Create clear, structured process documentation",
            "Ensure consistency and compliance across operations",
            "Map and optimize business workflows",
            "Develop standard operating procedures",
            "Facilitate training and knowledge transfer",
            "Create visual process representations",
            "Integrate compliance requirements into documentation",
            "Maintain and update operational documentation"
        ]
        self.sop_library = {}
        self.process_maps = {}
    
    async def generate_sop(
        self,
        process_information: Dict[str, Any],
        organizational_context: Dict[str, Any],
        compliance_requirements: Dict[str, Any],
        user_roles: Dict[str, Any],
        existing_documentation: Dict[str, Any],
        documentation_goals: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate a comprehensive standard operating procedure.
        
        This method wraps the standalone function for class-based access.
        """
        return await generate_comprehensive_sop_strategy(
            process_information, organizational_context, compliance_requirements,
            user_roles, existing_documentation, documentation_goals
        )
    
    def create_process_map(self, process_name: str, steps: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Create a visual process map."""
        process_id = f"process_{len(self.process_maps)}"
        self.process_maps[process_id] = {
            "name": process_name,
            "steps": steps,
            "created_at": datetime.utcnow(),
            "version": "1.0"
        }
        return self.process_maps[process_id]
    
    def store_sop(self, sop_id: str, sop_data: Dict[str, Any]) -> None:
        """Store SOP in library for reference and versioning."""
        self.sop_library[sop_id] = {
            "data": sop_data,
            "created_at": datetime.utcnow(),
            "version": sop_data.get("version", "1.0"),
            "status": "active"
        }

@inject_knowledge
async def generate_comprehensive_sop_strategy(
    process_information: Dict[str, Any],
    organizational_context: Dict[str, Any],
    compliance_requirements: Dict[str, Any],
    user_roles: Dict[str, Any],
    existing_documentation: Dict[str, Any],
    documentation_goals: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Generates comprehensive SOP strategy using advanced prompting strategies.
    Creates clear, structured process documentation for consistent operations.
    """
    print("SOP Agent: Generating comprehensive SOP strategy with injected knowledge...")

    # Structured prompt following advanced prompting strategies
    prompt = f"""
# SOP Agent - Comprehensive Process Documentation

## Role Definition
You are the **SOP (Standard Operating Procedure) Agent**, an expert in process documentation, workflow optimization, and knowledge standardization. Your role is to create clear, structured, and effective standard operating procedures that ensure consistency, compliance, and efficiency across business operations while facilitating training and knowledge transfer.

## Core Expertise
- Process Analysis & Mapping
- Procedural Documentation
- Workflow Optimization
- Compliance Integration
- Knowledge Standardization
- Visual Process Representation
- Training Material Development
- Documentation Usability & Accessibility

## Context & Background Information
**Process Information:** {json.dumps(process_information, indent=2)}
**Organizational Context:** {json.dumps(organizational_context, indent=2)}
**Compliance Requirements:** {json.dumps(compliance_requirements, indent=2)}
**User Roles:** {json.dumps(user_roles, indent=2)}
**Existing Documentation:** {json.dumps(existing_documentation, indent=2)}
**Documentation Goals:** {json.dumps(documentation_goals, indent=2)}

## Task Breakdown & Steps
1. **Process Analysis:** Understand and map the complete process flow
2. **Role Identification:** Clarify responsibilities and accountabilities
3. **Step Sequencing:** Establish logical procedure sequence and dependencies
4. **Detail Development:** Document specific actions, decisions, and criteria
5. **Exception Handling:** Address common variations and error scenarios
6. **Compliance Integration:** Incorporate relevant regulatory requirements
7. **Visual Creation:** Develop diagrams, flowcharts, and visual aids
8. **Usability Enhancement:** Ensure documentation is accessible and practical

## Constraints & Rules
- All procedures must be clear, concise, and actionable
- Documentation must be appropriate for the intended audience's expertise level
- Steps must be logically sequenced with clear dependencies
- Roles and responsibilities must be explicitly defined
- Exception scenarios must be addressed with resolution paths
- Compliance requirements must be seamlessly integrated
- Visual aids must enhance, not complicate, understanding
- Documentation must be maintainable and updatable

## Output Format
Return a comprehensive JSON object with SOP structure, content recommendations, visual elements, and implementation guidance.

Generate the comprehensive SOP strategy now, ensuring all elements are thoroughly addressed.
"""

    try:
        # Create LLM client
        from guild.src.models.llm import Llm
        client = LlmClient(Llm(provider="ollama", model="tinyllama"))
        
        # Generate response
        response = await client.chat(prompt)
        
        # Parse JSON response
        try:
            sop_strategy = json.loads(response)
            print("SOP Agent: Successfully generated comprehensive SOP strategy.")
            return sop_strategy
        except json.JSONDecodeError as e:
            print(f"SOP Agent: JSON parsing error: {e}")
            # Attempt to extract JSON from the response
            import re
            json_match = re.search(r'```json\n(.*?)\n```', response, re.DOTALL)
            if json_match:
                try:
                    sop_strategy = json.loads(json_match.group(1))
                    print("SOP Agent: Successfully extracted and parsed JSON from response.")
                    return sop_strategy
                except json.JSONDecodeError:
                    pass
            
            # Return a structured error response
            return {
                "error": "Failed to parse JSON response",
                "raw_response": response[:1000] + "..." if len(response) > 1000 else response
            }
    except Exception as e:
        print(f"SOP Agent: Execution error: {e}")
        return {"error": str(e)}
