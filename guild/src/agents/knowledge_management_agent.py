"""
Knowledge Management Agent for Guild-AI
Comprehensive knowledge organization using advanced prompting strategies.
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

class KnowledgeManagementAgent:
    """
    Knowledge Management Agent for Guild-AI
    Expert in information architecture, content organization, and knowledge accessibility.
    """
    
    def __init__(self, name: str = "Knowledge Management Agent", user_input=None):
        self.name = name
        self.user_input = user_input
        self.agent_name = "Knowledge Management Agent"
        self.agent_type = "Intelligence"
        self.role = "Comprehensive Information Organization"
        self.expertise = [
            "Information Architecture Design",
            "Content Organization & Taxonomy",
            "Knowledge Capture & Preservation",
            "Search Optimization & Discoverability",
            "Access Control & Permissions",
            "Knowledge Base Maintenance",
            "Content Lifecycle Management",
            "User Experience & Accessibility"
        ]
        self.capabilities = [
            "Organize and maintain company knowledge base",
            "Create structured, searchable information repositories",
            "Design intuitive taxonomy and categorization systems",
            "Optimize search and discoverability",
            "Establish access controls and permissions",
            "Implement knowledge capture workflows",
            "Manage content lifecycle and archival",
            "Ensure knowledge accessibility across organization"
        ]
        self.knowledge_base = {}
        self.taxonomy = {}
        self.access_controls = {}
        self.content_index = {}
    
    async def generate_knowledge_strategy(
        self,
        organizational_information: Dict[str, Any],
        knowledge_assets: Dict[str, Any],
        access_requirements: Dict[str, Any],
        user_personas: Dict[str, Any],
        current_challenges: Dict[str, Any],
        strategic_goals: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate a comprehensive knowledge management strategy.
        
        This method wraps the standalone function for class-based access.
        """
        return await generate_comprehensive_knowledge_management_strategy(
            organizational_information, knowledge_assets, access_requirements,
            user_personas, current_challenges, strategic_goals
        )
    
    def create_taxonomy(self, domain: str, depth: int = 3) -> Dict[str, Any]:
        """Create a hierarchical taxonomy for a knowledge domain."""
        return {
            "domain": domain,
            "depth": depth,
            "categories": [],
            "tags": [],
            "relationships": []
        }
    
    def index_content(self, content: Dict[str, Any]) -> str:
        """Index content for search and retrieval."""
        content_id = f"content_{len(self.content_index)}"
        self.content_index[content_id] = {
            "content": content,
            "indexed_at": datetime.utcnow(),
            "metadata": content.get("metadata", {})
        }
        return content_id
    
    def search_knowledge(self, query: str, filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Search the knowledge base with optional filters."""
        results = []
        # Simple implementation - would use vector search in production
        for content_id, indexed_content in self.content_index.items():
            if query.lower() in str(indexed_content["content"]).lower():
                results.append({
                    "id": content_id,
                    "content": indexed_content["content"],
                    "relevance": 1.0
                })
        return results

@inject_knowledge
async def generate_comprehensive_knowledge_management_strategy(
    organizational_information: Dict[str, Any],
    knowledge_assets: Dict[str, Any],
    access_requirements: Dict[str, Any],
    user_personas: Dict[str, Any],
    current_challenges: Dict[str, Any],
    strategic_goals: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Generates comprehensive knowledge management strategy using advanced prompting strategies.
    Organizes and maintains company knowledge base for easy retrieval.
    """
    print("Knowledge Management Agent: Generating comprehensive knowledge management strategy with injected knowledge...")

    # Structured prompt following advanced prompting strategies
    prompt = f"""
# Knowledge Management Agent - Comprehensive Information Organization

## Role Definition
You are the **Knowledge Management Agent**, an expert in information architecture, content organization, and knowledge accessibility. Your role is to create and maintain a structured, searchable knowledge base that captures organizational wisdom, facilitates information sharing, and ensures critical knowledge is preserved, accessible, and actionable across the organization.

## Core Expertise
- Information Architecture Design
- Content Organization & Taxonomy
- Knowledge Capture & Preservation
- Search Optimization & Discoverability
- Access Control & Permissions
- Knowledge Base Maintenance
- Content Lifecycle Management
- User Experience & Accessibility

## Context & Background Information
**Organizational Information:** {json.dumps(organizational_information, indent=2)}
**Knowledge Assets:** {json.dumps(knowledge_assets, indent=2)}
**Access Requirements:** {json.dumps(access_requirements, indent=2)}
**User Personas:** {json.dumps(user_personas, indent=2)}
**Current Challenges:** {json.dumps(current_challenges, indent=2)}
**Strategic Goals:** {json.dumps(strategic_goals, indent=2)}

## Task Breakdown & Steps
1. **Knowledge Audit:** Assess current information assets and gaps
2. **Architecture Design:** Create logical structure and taxonomy
3. **Content Organization:** Develop categorization and tagging system
4. **Access Framework:** Establish permissions and security model
5. **Search Enhancement:** Optimize for findability and relevance
6. **Capture Process:** Design knowledge acquisition workflows
7. **Maintenance Plan:** Create update and archival procedures
8. **User Experience:** Ensure intuitive navigation and accessibility

## Constraints & Rules
- Knowledge structure must balance breadth and depth appropriately
- Taxonomy must be intuitive and aligned with user mental models
- Search must accommodate various query approaches and user needs
- Access controls must protect sensitive information while enabling collaboration
- Content organization must scale with organizational growth
- Maintenance processes must be sustainable with available resources
- User experience must prioritize findability and ease of use
- Knowledge capture must minimize friction for contributors

## Output Format
Return a comprehensive JSON object with knowledge management strategy, information architecture, taxonomy design, and implementation approach.

Generate the comprehensive knowledge management strategy now, ensuring all elements are thoroughly addressed.
"""

    try:
        # Create LLM client
        from guild.src.models.llm import Llm
        client = LlmClient(Llm(provider="ollama", model="tinyllama"))
        
        # Generate response
        response = await client.chat(prompt)
        
        # Parse JSON response
        try:
            knowledge_strategy = json.loads(response)
            print("Knowledge Management Agent: Successfully generated comprehensive knowledge management strategy.")
            return knowledge_strategy
        except json.JSONDecodeError as e:
            print(f"Knowledge Management Agent: JSON parsing error: {e}")
            # Attempt to extract JSON from the response
            import re
            json_match = re.search(r'```json\n(.*?)\n```', response, re.DOTALL)
            if json_match:
                try:
                    knowledge_strategy = json.loads(json_match.group(1))
                    print("Knowledge Management Agent: Successfully extracted and parsed JSON from response.")
                    return knowledge_strategy
                except json.JSONDecodeError:
                    pass
            
            # Return a structured error response
            return {
                "error": "Failed to parse JSON response",
                "raw_response": response[:1000] + "..." if len(response) > 1000 else response
            }
    except Exception as e:
        print(f"Knowledge Management Agent: Execution error: {e}")
        return {"error": str(e)}
