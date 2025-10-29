"""
Board Advisor Agent for Guild-AI
Comprehensive board advisory simulation using advanced prompting strategies.
"""

from guild.src.core.llm_client import LlmClient
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime
from guild.src.core.agent_helpers import inject_knowledge
import asyncio
import json

@inject_knowledge
async def generate_comprehensive_board_advisory_strategy(
    business_situation: str,
    financial_data: Dict[str, Any],
    marketing_context: Dict[str, Any],
    product_information: Dict[str, Any],
    strategic_challenges: Dict[str, Any],
    advisory_requirements: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Generates comprehensive board advisory strategy using advanced prompting strategies.
    Simulates insights from a virtual board of directors across financial, marketing, and product perspectives.
    """
    print("Board Advisor Agent: Generating comprehensive board advisory strategy with injected knowledge...")

    # Structured prompt following advanced prompting strategies
    prompt = f"""
# Board Advisor Agent - Comprehensive Virtual Board of Directors

## Role Definition
You are the **Board Advisor Agent**, an expert in corporate governance, strategic decision-making, and business leadership. Your role is to simulate a diverse virtual board of directors, providing multi-perspective insights and guidance on critical business decisions from financial, marketing, product, operational, and strategic viewpoints.

## Core Expertise
- Corporate Governance & Board Dynamics
- Strategic Decision Analysis
- Financial Oversight & Planning
- Marketing Strategy & Brand Positioning
- Product Development & Roadmapping
- Risk Management & Compliance
- Executive Leadership Coaching
- Stakeholder Management

## Context & Background Information
**Business Situation:** {business_situation}
**Financial Data:** {json.dumps(financial_data, indent=2)}
**Marketing Context:** {json.dumps(marketing_context, indent=2)}
**Product Information:** {json.dumps(product_information, indent=2)}
**Strategic Challenges:** {json.dumps(strategic_challenges, indent=2)}
**Advisory Requirements:** {json.dumps(advisory_requirements, indent=2)}

## Task Breakdown & Steps
1. **Board Composition:** Simulate diverse board members with complementary expertise
2. **Situation Analysis:** Assess the current business context from multiple perspectives
3. **Financial Oversight:** Evaluate financial health, resource allocation, and investment needs
4. **Marketing Assessment:** Analyze brand positioning, market fit, and growth strategies
5. **Product Evaluation:** Review product strategy, roadmap, and competitive positioning
6. **Strategic Guidance:** Provide multi-perspective recommendations on key decisions
7. **Risk Identification:** Highlight potential blind spots and contingency planning needs
8. **Executive Coaching:** Offer leadership guidance and organizational development insights

## Constraints & Rules
- Advice must represent diverse perspectives (financial, marketing, product, etc.)
- Recommendations must be balanced, considering both short and long-term implications
- Financial guidance must be grounded in sound business principles
- Marketing insights must consider brand integrity and market positioning
- Product advice must balance innovation with feasibility and market needs
- All recommendations must be actionable and contextually appropriate
- Dissenting opinions should be included when relevant to provide balanced perspective
- Advice must maintain the confidentiality and best interests of the business

## Output Format
Return a comprehensive JSON object with board perspectives, situation analysis, and strategic recommendations.

Generate the comprehensive board advisory strategy now, ensuring all elements are thoroughly addressed.
"""

    try:
        # Create LLM client
        from guild.src.models.llm import Llm
        client = LlmClient(Llm(provider="ollama", model="tinyllama"))
        
        # Generate response
        response = await client.chat(prompt)
        
        # Parse JSON response
        try:
            advisory_strategy = json.loads(response)
            print("Board Advisor Agent: Successfully generated comprehensive board advisory strategy.")
            return advisory_strategy
        except json.JSONDecodeError as e:
            print(f"Board Advisor Agent: JSON parsing error: {e}")
            # Attempt to extract JSON from the response
            import re
            json_match = re.search(r'```json\n(.*?)\n```', response, re.DOTALL)
            if json_match:
                try:
                    advisory_strategy = json.loads(json_match.group(1))
                    print("Board Advisor Agent: Successfully extracted and parsed JSON from response.")
                    return advisory_strategy
                except json.JSONDecodeError:
                    pass
            
            # Return a structured error response
            return {
                "error": "Failed to parse JSON response",
                "raw_response": response[:1000] + "..." if len(response) > 1000 else response
            }
    except Exception as e:
        print(f"Board Advisor Agent: Execution error: {e}")
        return {"error": str(e)}

@dataclass
class BoardMember:
    member_id: str
    name: str
    role: str  # e.g., "Financial Expert", "Marketing Director", "Product Strategist"
    expertise: List[str]
    perspective: str
    years_experience: int
    background: str

@dataclass
class BoardRecommendation:
    recommendation_id: str
    title: str
    description: str
    supporting_rationale: List[str]
    dissenting_opinions: List[str]
    priority_level: str  # high, medium, low
    time_horizon: str  # immediate, short-term, long-term
    resource_requirements: Dict[str, Any]
    expected_outcomes: List[str]
    risks: List[Dict[str, str]]
    board_votes: Dict[str, str]  # member_id -> vote (approve, reject, abstain)

class BoardAdvisorAgent:
    """
    Board Advisor Agent - Expert in corporate governance, strategic decision-making, and business leadership
    
    Simulates a diverse virtual board of directors, providing multi-perspective insights and guidance 
    on critical business decisions from financial, marketing, product, operational, and strategic viewpoints.
    """
    
    def __init__(self, user_input: str = None):
        self.user_input = user_input
        self.agent_name = "Board Advisor Agent"
        self.agent_type = "Strategy & Executive"
        self.capabilities = [
            "Corporate governance and board dynamics",
            "Strategic decision analysis",
            "Financial oversight and planning",
            "Marketing strategy and brand positioning",
            "Product development and roadmapping",
            "Risk management and compliance",
            "Executive leadership coaching",
            "Stakeholder management"
        ]
        self.board_members = {}
        self.recommendations_library = {}
        self.llm_client = LlmClient(Llm(provider="ollama", model="tinyllama"))
    
    async def run(self, user_input: str = None) -> Dict[str, Any]:
        """
        Main execution method for the Board Advisor Agent.
        Implements comprehensive board advisory using advanced prompting strategies.
        """
        try:
            print(f"Board Advisor Agent: Starting comprehensive board advisory...")
            
            # Extract inputs from user_input or use defaults
            if user_input:
                business_situation = user_input
            else:
                business_situation = "Provide strategic guidance for business growth and development"
            
            # Define comprehensive board advisory parameters
            financial_data = {
                "revenue": {
                    "current_year": 1500000,
                    "previous_year": 1200000,
                    "growth_rate": 0.25
                },
                "expenses": {
                    "current_year": 1200000,
                    "previous_year": 1000000,
                    "growth_rate": 0.2
                },
                "cash_position": {
                    "current_balance": 500000,
                    "burn_rate": 80000,
                    "runway_months": 6.25
                },
                "key_metrics": {
                    "gross_margin": 0.65,
                    "customer_acquisition_cost": 1200,
                    "lifetime_value": 6000,
                    "ltv_cac_ratio": 5
                }
            }
            
            marketing_context = {
                "target_audience": {
                    "primary_segments": ["small_business_owners", "solopreneurs", "lean_startups"],
                    "industry_focus": ["technology", "professional_services", "e-commerce"],
                    "pain_points": ["operational_efficiency", "resource_constraints", "scaling_challenges"]
                },
                "competitive_landscape": {
                    "direct_competitors": 3,
                    "indirect_competitors": 8,
                    "market_position": "emerging_innovator",
                    "differentiation": "ai_workforce_integration"
                },
                "marketing_channels": {
                    "performing_well": ["content_marketing", "social_media", "referrals"],
                    "underperforming": ["paid_advertising", "email_marketing"],
                    "untested": ["influencer_partnerships", "industry_events"]
                },
                "brand_perception": {
                    "awareness": "low",
                    "sentiment": "positive",
                    "positioning": "innovative_but_unproven"
                }
            }
            
            product_information = {
                "core_offering": "AI Workforce Platform",
                "current_stage": "early_market_fit",
                "key_features": [
                    "multi_agent_orchestration",
                    "workflow_automation",
                    "visual_automation",
                    "document_processing",
                    "creative_content_generation"
                ],
                "development_roadmap": {
                    "current_focus": "core_functionality_enhancement",
                    "next_quarter": "integration_ecosystem_expansion",
                    "next_year": "enterprise_feature_development"
                },
                "user_metrics": {
                    "active_users": 250,
                    "engagement_rate": 0.68,
                    "retention_rate": 0.72,
                    "feature_adoption": {
                        "multi_agent_workflows": 0.85,
                        "visual_automation": 0.45,
                        "document_processing": 0.65
                    }
                },
                "customer_feedback": {
                    "strengths": ["ease_of_use", "automation_capabilities", "time_savings"],
                    "improvement_areas": ["more_integrations", "advanced_customization", "enterprise_features"]
                }
            }
            
            strategic_challenges = {
                "growth_barriers": [
                    "market_awareness",
                    "proof_of_roi",
                    "scaling_customer_support"
                ],
                "competitive_threats": [
                    "larger_competitors_entering_space",
                    "rapid_ai_technology_evolution",
                    "pricing_pressure"
                ],
                "internal_constraints": [
                    "limited_engineering_resources",
                    "marketing_budget_constraints",
                    "knowledge_management_challenges"
                ],
                "market_uncertainties": [
                    "ai_regulation_changes",
                    "economic_downturn_impact",
                    "changing_customer_expectations"
                ],
                "strategic_crossroads": [
                    {
                        "decision_point": "vertical_vs_horizontal_expansion",
                        "options": ["focus_on_specific_industries", "expand_feature_set_broadly"],
                        "implications": "Resource allocation and positioning impact"
                    },
                    {
                        "decision_point": "pricing_model_evolution",
                        "options": ["usage_based", "tiered_subscription", "hybrid_approach"],
                        "implications": "Revenue predictability and customer acquisition impact"
                    }
                ]
            }
            
            advisory_requirements = {
                "advisory_focus": [
                    "growth_strategy",
                    "resource_allocation",
                    "competitive_positioning",
                    "risk_management"
                ],
                "decision_timeframe": "quarterly_planning",
                "risk_tolerance": "moderate",
                "board_perspectives_needed": [
                    "financial",
                    "marketing",
                    "product",
                    "strategic",
                    "operational"
                ]
            }
            
            # Generate comprehensive board advisory strategy
            advisory_strategy = await generate_comprehensive_board_advisory_strategy(
                business_situation=business_situation,
                financial_data=financial_data,
                marketing_context=marketing_context,
                product_information=product_information,
                strategic_challenges=strategic_challenges,
                advisory_requirements=advisory_requirements
            )
            
            # Execute the board advisory based on the strategy
            result = await self._execute_board_advisory(
                business_situation, 
                advisory_strategy
            )
            
            # Combine strategy and execution results
            final_result = {
                "agent": "Board Advisor Agent",
                "strategy_type": "comprehensive_board_advisory",
                "advisory_strategy": advisory_strategy,
                "execution_result": result,
                "timestamp": datetime.now().isoformat(),
                "status": "completed"
            }
            
            print(f"Board Advisor Agent: Comprehensive board advisory completed successfully.")
            return final_result
            
        except Exception as e:
            print(f"Board Advisor Agent: Error in comprehensive board advisory: {e}")
            return {
                "agent": "Board Advisor Agent",
                "status": "error",
                "message": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    async def _execute_board_advisory(
        self, 
        business_situation: str, 
        strategy: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Execute board advisory based on comprehensive strategy."""
        try:
            # Extract strategy components
            board_composition = strategy.get("board_composition", {})
            situation_analysis = strategy.get("situation_analysis", {})
            recommendations = strategy.get("recommendations", {})
            risk_assessment = strategy.get("risk_assessment", {})
            
            # Create board member objects
            board_members = {}
            for member_id, member_data in board_composition.items():
                if isinstance(member_data, dict):
                    board_member = BoardMember(
                        member_id=member_id,
                        name=member_data.get("name", f"Board Member {len(board_members) + 1}"),
                        role=member_data.get("role", "Advisor"),
                        expertise=member_data.get("expertise", []),
                        perspective=member_data.get("perspective", "general"),
                        years_experience=member_data.get("years_experience", 15),
                        background=member_data.get("background", "Experienced professional")
                    )
                    
                    board_members[member_id] = board_member
                    self.board_members[member_id] = board_member
            
            # Create recommendation objects
            recommendation_objects = {}
            for rec_id, rec_data in recommendations.items():
                if isinstance(rec_data, dict):
                    recommendation = BoardRecommendation(
                        recommendation_id=rec_id,
                        title=rec_data.get("title", ""),
                        description=rec_data.get("description", ""),
                        supporting_rationale=rec_data.get("supporting_rationale", []),
                        dissenting_opinions=rec_data.get("dissenting_opinions", []),
                        priority_level=rec_data.get("priority_level", "medium"),
                        time_horizon=rec_data.get("time_horizon", "short-term"),
                        resource_requirements=rec_data.get("resource_requirements", {}),
                        expected_outcomes=rec_data.get("expected_outcomes", []),
                        risks=rec_data.get("risks", []),
                        board_votes=rec_data.get("board_votes", {})
                    )
                    
                    recommendation_objects[rec_id] = recommendation
                    self.recommendations_library[rec_id] = recommendation
            
            # Generate board meeting minutes
            board_minutes = self._generate_board_minutes(board_members, recommendation_objects, situation_analysis)
            
            # Generate executive summary
            executive_summary = self._generate_executive_summary(recommendation_objects, situation_analysis)
            
            # Generate action plan
            action_plan = self._generate_action_plan(recommendation_objects)
            
            return {
                "status": "success",
                "message": "Board advisory strategy executed successfully",
                "board_composition": {member_id: {"name": member.name, "role": member.role, "expertise": member.expertise} 
                                     for member_id, member in board_members.items()},
                "situation_analysis": situation_analysis,
                "board_minutes": board_minutes,
                "executive_summary": executive_summary,
                "action_plan": action_plan,
                "execution_metrics": {
                    "board_members": len(board_members),
                    "recommendations_provided": len(recommendation_objects),
                    "perspectives_represented": len(set(member.perspective for member in board_members.values())),
                    "advisory_quality": "comprehensive"
                }
            }
            
        except Exception as e:
            return {
                "status": "error",
                "message": f"Board advisory strategy execution failed: {str(e)}"
            }
    
    def _generate_board_minutes(
        self, 
        board_members: Dict[str, BoardMember], 
        recommendations: Dict[str, BoardRecommendation],
        situation_analysis: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate simulated board meeting minutes."""
        meeting_date = datetime.now().strftime("%Y-%m-%d")
        
        # Generate discussion points based on situation analysis
        discussion_points = []
        for area, analysis in situation_analysis.items():
            if isinstance(analysis, dict):
                for key, value in analysis.items():
                    discussion_points.append({
                        "topic": f"{area.replace('_', ' ').title()}: {key.replace('_', ' ').title()}",
                        "key_points": [value] if isinstance(value, str) else value if isinstance(value, list) else [str(value)]
                    })
        
        # Generate voting record
        voting_record = {}
        for rec_id, recommendation in recommendations.items():
            votes = {"approve": 0, "reject": 0, "abstain": 0}
            for member_id, vote in recommendation.board_votes.items():
                if vote in votes:
                    votes[vote] += 1
            
            voting_record[rec_id] = {
                "title": recommendation.title,
                "votes": votes,
                "outcome": "approved" if votes["approve"] > votes["reject"] else "rejected"
            }
        
        # Generate action items
        action_items = []
        for rec_id, recommendation in recommendations.items():
            if voting_record.get(rec_id, {}).get("outcome") == "approved":
                action_items.append({
                    "item": recommendation.title,
                    "description": recommendation.description,
                    "priority": recommendation.priority_level,
                    "timeline": recommendation.time_horizon,
                    "resources_needed": recommendation.resource_requirements
                })
        
        return {
            "meeting_date": meeting_date,
            "attendees": [{"id": member_id, "name": member.name, "role": member.role} 
                         for member_id, member in board_members.items()],
            "agenda": ["Situation Analysis", "Strategic Recommendations", "Risk Assessment", "Voting", "Action Items"],
            "discussion_points": discussion_points,
            "voting_record": voting_record,
            "action_items": action_items,
            "next_meeting": (datetime.now() + timedelta(days=90)).strftime("%Y-%m-%d")
        }
    
    def _generate_executive_summary(
        self, 
        recommendations: Dict[str, BoardRecommendation],
        situation_analysis: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate executive summary of board recommendations."""
        # Extract key insights from situation analysis
        key_insights = []
        for area, analysis in situation_analysis.items():
            if isinstance(analysis, dict) and "strengths" in analysis and "challenges" in analysis:
                key_insights.append({
                    "area": area.replace("_", " ").title(),
                    "strengths": analysis["strengths"],
                    "challenges": analysis["challenges"]
                })
        
        # Categorize recommendations by priority
        categorized_recommendations = {
            "high_priority": [],
            "medium_priority": [],
            "low_priority": []
        }
        
        for rec_id, recommendation in recommendations.items():
            priority = recommendation.priority_level.lower()
            if priority in ["high", "critical", "urgent"]:
                categorized_recommendations["high_priority"].append({
                    "id": rec_id,
                    "title": recommendation.title,
                    "description": recommendation.description
                })
            elif priority in ["medium", "moderate"]:
                categorized_recommendations["medium_priority"].append({
                    "id": rec_id,
                    "title": recommendation.title,
                    "description": recommendation.description
                })
            else:
                categorized_recommendations["low_priority"].append({
                    "id": rec_id,
                    "title": recommendation.title,
                    "description": recommendation.description
                })
        
        # Generate strategic direction
        strategic_direction = {
            "short_term_focus": [rec["title"] for rec in categorized_recommendations["high_priority"][:2]],
            "medium_term_initiatives": [rec["title"] for rec in categorized_recommendations["medium_priority"][:3]],
            "long_term_vision": "Establish market leadership in AI workforce automation for small businesses and solopreneurs"
        }
        
        return {
            "summary_date": datetime.now().strftime("%Y-%m-%d"),
            "key_insights": key_insights,
            "strategic_direction": strategic_direction,
            "priority_recommendations": {
                "high_priority": categorized_recommendations["high_priority"],
                "medium_priority": categorized_recommendations["medium_priority"][:3],  # Top 3 medium priorities
                "low_priority": []  # Omit low priorities from executive summary
            },
            "board_confidence": "high",
            "next_review_date": (datetime.now() + timedelta(days=90)).strftime("%Y-%m-%d")
        }
    
    def _generate_action_plan(self, recommendations: Dict[str, BoardRecommendation]) -> Dict[str, Any]:
        """Generate action plan based on recommendations."""
        # Sort recommendations by priority and time horizon
        prioritized_recs = sorted(
            recommendations.values(),
            key=lambda r: (
                {"high": 0, "medium": 1, "low": 2}.get(r.priority_level.lower(), 3),
                {"immediate": 0, "short-term": 1, "medium-term": 2, "long-term": 3}.get(r.time_horizon.lower(), 4)
            )
        )
        
        # Generate action items
        action_items = []
        for i, rec in enumerate(prioritized_recs):
            action_items.append({
                "id": f"action_{i+1}",
                "title": rec.title,
                "description": rec.description,
                "priority": rec.priority_level,
                "timeline": rec.time_horizon,
                "success_metrics": [f"Achieve {outcome}" for outcome in rec.expected_outcomes],
                "resources_required": rec.resource_requirements,
                "risks_to_mitigate": [risk.get("description", "") for risk in rec.risks]
            })
        
        # Group actions by time horizon
        timeline = {
            "immediate": [],
            "30_days": [],
            "90_days": [],
            "6_months": [],
            "12_months": []
        }
        
        for action in action_items:
            if action["timeline"].lower() == "immediate":
                timeline["immediate"].append(action["title"])
            elif action["timeline"].lower() == "short-term":
                timeline["30_days"].append(action["title"])
                timeline["90_days"].append(action["title"])
            elif action["timeline"].lower() == "medium-term":
                timeline["6_months"].append(action["title"])
            else:  # long-term
                timeline["12_months"].append(action["title"])
        
        return {
            "action_items": action_items,
            "timeline": timeline,
            "resource_allocation_guidance": {
                "financial": "Focus resources on high-priority initiatives with clear ROI",
                "human_capital": "Align team capabilities with strategic priorities",
                "technology": "Invest in core platform capabilities and integration ecosystem"
            },
            "success_metrics": {
                "growth": ["User acquisition rate", "Revenue growth", "Market share"],
                "operational": ["Customer satisfaction", "Platform reliability", "Team efficiency"],
                "financial": ["Cash runway", "Gross margin", "LTV:CAC ratio"]
            },
            "review_cadence": "Monthly progress check-ins with quarterly strategic reviews"
        }
    
    def get_agent_info(self) -> Dict[str, Any]:
        """Get agent information and capabilities"""
        
        return {
            "name": self.agent_name,
            "type": self.agent_type,
            "capabilities": self.capabilities,
            "board_perspectives": ["Financial", "Marketing", "Product", "Strategic", "Operational"],
            "advisory_formats": ["Board Meeting Simulation", "Executive Summary", "Strategic Recommendations", "Action Plan"]
        }
