"""
Investor Update Agent for Guild-AI
Comprehensive investor update generation using advanced prompting strategies.
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

class InvestorUpdateAgent:
    """
    Investor Update Agent for Guild-AI
    Expert in investor relations, business communication, and financial reporting.
    """
    
    def __init__(self, name: str = "Investor Update Agent", user_input=None):
        self.name = name
        self.user_input = user_input
        self.agent_name = "Investor Update Agent"
        self.agent_type = "Financial"
        self.role = "Investor Relations & Communication"
        self.expertise = [
            "Financial Performance Reporting",
            "Milestone Achievement Highlighting",
            "Strategic Progress Communication",
            "Challenge & Solution Framing",
            "Data Visualization & Presentation",
            "Investor Expectation Management",
            "Future Planning & Roadmap Communication",
            "Engagement & Relationship Building"
        ]
        self.capabilities = [
            "Auto-generate monthly/quarterly investor updates",
            "Create professional financial reports with visualizations",
            "Frame achievements in context of business goals",
            "Communicate challenges transparently with action plans",
            "Develop engaging visual elements for investor presentations",
            "Maintain consistent investor communication",
            "Build and strengthen investor relationships",
            "Optimize update delivery for maximum impact"
        ]
        self.update_history = []
        self.investor_profiles = {}
        self.communication_templates = {}
    
    async def generate_investor_update(
        self,
        business_metrics: Dict[str, Any],
        financial_performance: Dict[str, Any],
        milestone_achievements: Dict[str, Any],
        challenges_obstacles: Dict[str, Any],
        future_plans: Dict[str, Any],
        investor_preferences: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate a comprehensive investor update.
        
        This method wraps the standalone function for class-based access.
        """
        return await generate_comprehensive_investor_update_strategy(
            business_metrics, financial_performance, milestone_achievements,
            challenges_obstacles, future_plans, investor_preferences
        )
    
    async def create_update_template(self, update_type: str = "monthly") -> Dict[str, Any]:
        """Create a reusable template for investor updates."""
        templates = {
            "monthly": {
                "sections": [
                    "Executive Summary",
                    "Key Metrics",
                    "Financial Performance",
                    "Major Accomplishments",
                    "Challenges & Solutions",
                    "Next Month's Focus",
                    "Ask/Support Needed"
                ],
                "format": "concise",
                "recommended_length": "2-3 pages"
            },
            "quarterly": {
                "sections": [
                    "Quarter in Review",
                    "Financial Performance Deep Dive",
                    "Strategic Milestones Achieved",
                    "Market Position & Competitive Landscape",
                    "Challenges & Learnings",
                    "Next Quarter Roadmap",
                    "Long-term Vision Update",
                    "Investor Engagement Opportunities"
                ],
                "format": "comprehensive",
                "recommended_length": "5-7 pages"
            },
            "annual": {
                "sections": [
                    "Year in Review",
                    "Comprehensive Financial Analysis",
                    "Strategic Achievements & Pivots",
                    "Team & Organization Growth",
                    "Market Analysis & Position",
                    "Lessons Learned",
                    "Next Year's Strategic Plan",
                    "Long-term Vision & Trajectory"
                ],
                "format": "detailed",
                "recommended_length": "10-15 pages"
            }
        }
        
        return templates.get(update_type, templates["monthly"])
    
    def track_update_history(self, update: Dict[str, Any]) -> None:
        """Track investor update history for consistency and reference."""
        self.update_history.append({
            "timestamp": datetime.utcnow(),
            "update": update,
            "type": update.get("type", "monthly")
        })

@inject_knowledge
async def generate_comprehensive_investor_update_strategy(
    business_metrics: Dict[str, Any],
    financial_performance: Dict[str, Any],
    milestone_achievements: Dict[str, Any],
    challenges_obstacles: Dict[str, Any],
    future_plans: Dict[str, Any],
    investor_preferences: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Generates comprehensive investor update strategy using advanced prompting strategies.
    Auto-generates monthly/quarterly investor updates with visuals and highlights.
    """
    print("Investor Update Agent: Generating comprehensive investor update strategy with injected knowledge...")

    # Structured prompt following advanced prompting strategies
    prompt = f"""
# Investor Update Agent - Comprehensive Investor Communication

## Role Definition
You are the **Investor Update Agent**, an expert in investor relations, business communication, and financial reporting. Your role is to create professional, informative, and strategic updates for investors that highlight business progress, address challenges transparently, and maintain investor confidence through clear, data-driven communication.

## Core Expertise
- Financial Performance Reporting
- Milestone Achievement Highlighting
- Strategic Progress Communication
- Challenge & Solution Framing
- Data Visualization & Presentation
- Investor Expectation Management
- Future Planning & Roadmap Communication
- Engagement & Relationship Building

## Context & Background Information
**Business Metrics:** {json.dumps(business_metrics, indent=2)}
**Financial Performance:** {json.dumps(financial_performance, indent=2)}
**Milestone Achievements:** {json.dumps(milestone_achievements, indent=2)}
**Challenges & Obstacles:** {json.dumps(challenges_obstacles, indent=2)}
**Future Plans:** {json.dumps(future_plans, indent=2)}
**Investor Preferences:** {json.dumps(investor_preferences, indent=2)}

## Task Breakdown & Steps
1. **Update Structure Development:** Create a consistent, comprehensive update template
2. **Performance Analysis:** Synthesize key metrics and financial data into clear insights
3. **Achievement Highlighting:** Frame accomplishments in context of overall business goals
4. **Challenge Communication:** Present obstacles with corresponding action plans
5. **Visual Creation:** Develop charts, graphs, and visual elements to enhance understanding
6. **Future Outlook:** Articulate upcoming goals, milestones, and strategic direction
7. **Engagement Opportunities:** Include specific ways investors can provide value
8. **Delivery Optimization:** Format updates for maximum readability and impact

## Constraints & Rules
- Updates must be honest and transparent while maintaining appropriate tone
- Financial data must be presented accurately with relevant context
- Achievements must be substantiated with specific metrics or outcomes
- Challenges must be addressed directly with clear mitigation strategies
- Visual elements must enhance understanding, not merely decorate
- Future plans must be realistic and aligned with business capabilities
- Communication must be consistent with previous updates and messaging
- Updates must respect investor time with concise, high-value information

## Output Format
Return a comprehensive JSON object with investor update strategy, content structure, visual recommendations, and delivery approach.

Generate the comprehensive investor update strategy now, ensuring all elements are thoroughly addressed.
"""

    try:
        # Create LLM client
        from guild.src.models.llm import Llm
        client = LlmClient(Llm(provider="ollama", model="tinyllama"))
        
        # Generate response
        response = await client.chat(prompt)
        
        # Parse JSON response
        try:
            update_strategy = json.loads(response)
            print("Investor Update Agent: Successfully generated comprehensive investor update strategy.")
            return update_strategy
        except json.JSONDecodeError as e:
            print(f"Investor Update Agent: JSON parsing error: {e}")
            # Attempt to extract JSON from the response
            import re
            json_match = re.search(r'```json\n(.*?)\n```', response, re.DOTALL)
            if json_match:
                try:
                    update_strategy = json.loads(json_match.group(1))
                    print("Investor Update Agent: Successfully extracted and parsed JSON from response.")
                    return update_strategy
                except json.JSONDecodeError:
                    pass
            
            # Return a structured error response
            return {
                "error": "Failed to parse JSON response",
                "raw_response": response[:1000] + "..." if len(response) > 1000 else response
            }
    except Exception as e:
        print(f"Investor Update Agent: Execution error: {e}")
        return {"error": str(e)}
