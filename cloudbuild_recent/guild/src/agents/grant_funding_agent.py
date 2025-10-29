"""
Grant/Funding Agent for Guild-AI
Comprehensive grant and funding opportunity identification using advanced prompting strategies.
"""

from guild.src.core.llm_client import LlmClient
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime
from guild.src.core.agent_helpers import inject_knowledge
import asyncio
import json


@dataclass
class FundingOpportunity:
    """Data class for funding opportunity information."""
    opportunity_id: str
    name: str
    type: str  # grant, accelerator, competition, etc.
    provider: str
    amount: str
    deadline: str
    eligibility: List[str]
    focus_areas: List[str]
    application_requirements: List[str]
    success_probability: float
    geographic_restrictions: List[str]
    industry_focus: List[str]


@dataclass
class ApplicationStrategy:
    """Data class for application strategy information."""
    opportunity_id: str
    key_narratives: List[str]
    unique_selling_points: List[str]
    required_documents: List[str]
    preparation_timeline: Dict[str, str]
    submission_process: List[str]
    follow_up_strategy: List[str]


@inject_knowledge
async def generate_comprehensive_grant_funding_strategy(
    business_profile: Dict[str, Any],
    funding_needs: Dict[str, Any],
    eligibility_criteria: Dict[str, Any],
    industry_sector: str,
    geographic_location: Dict[str, Any],
    business_stage: str
) -> Dict[str, Any]:
    """
    Generates comprehensive grant and funding strategy using advanced prompting strategies.
    Searches for applicable grants, accelerators, or funding opportunities.
    """
    print("Grant/Funding Agent: Generating comprehensive grant funding strategy with injected knowledge...")

    # Structured prompt following advanced prompting strategies
    prompt = f"""
# Grant/Funding Agent - Comprehensive Funding Opportunity Identification

## Role Definition
You are the **Grant/Funding Agent**, an expert in identifying, evaluating, and securing non-dilutive funding opportunities for businesses. Your role is to search for and match businesses with relevant grants, accelerator programs, competitions, and alternative funding sources aligned with their profile, needs, and eligibility.

## Core Expertise
- Grant Research & Identification
- Accelerator Program Matching
- Eligibility Assessment & Optimization
- Application Strategy Development
- Funding Calendar Management
- Proposal Development Guidance
- Alternative Funding Source Identification
- Grant Compliance & Reporting

## Context & Background Information
**Business Profile:** {json.dumps(business_profile, indent=2)}
**Funding Needs:** {json.dumps(funding_needs, indent=2)}
**Eligibility Criteria:** {json.dumps(eligibility_criteria, indent=2)}
**Industry Sector:** {industry_sector}
**Geographic Location:** {json.dumps(geographic_location, indent=2)}
**Business Stage:** {business_stage}

## Task Breakdown & Steps
1. **Opportunity Research:** Identify relevant grants, accelerators, and funding sources
2. **Eligibility Analysis:** Assess business fit against funding requirements
3. **Priority Ranking:** Evaluate opportunities based on alignment, amount, and likelihood
4. **Application Planning:** Create timelines and requirements for priority opportunities
5. **Proposal Strategy:** Develop compelling narratives and positioning for applications
6. **Documentation Preparation:** Identify required materials and supporting documents
7. **Deadline Management:** Create calendar of submission dates and preparation milestones
8. **Follow-up Planning:** Establish tracking system for applications and reporting requirements

## Constraints & Rules
- All identified opportunities must align with business profile and eligibility
- Recommendations must include realistic assessment of success probability
- Application strategies must emphasize the business's unique value proposition
- Time requirements must be balanced against potential funding amounts
- Geographic restrictions must be strictly observed
- Industry and sector alignment must be genuine, not forced
- Proposal guidance must be specific and actionable
- All deadlines must include adequate preparation time

## Output Format
Return a comprehensive JSON object with funding opportunities, eligibility analysis, application strategies, and timeline recommendations.

Generate the comprehensive grant funding strategy now, ensuring all elements are thoroughly addressed.
"""

    try:
        # Create LLM client
        from guild.src.models.llm import Llm
        client = LlmClient(Llm(provider="ollama", model="tinyllama"))
        
        # Generate response
        response = await client.chat(prompt)
        
        # Parse JSON response
        try:
            funding_strategy = json.loads(response)
            print("Grant/Funding Agent: Successfully generated comprehensive grant funding strategy.")
            return funding_strategy
        except json.JSONDecodeError as e:
            print(f"Grant/Funding Agent: JSON parsing error: {e}")
            # Attempt to extract JSON from the response
            import re
            json_match = re.search(r'```json\n(.*?)\n```', response, re.DOTALL)
            if json_match:
                try:
                    funding_strategy = json.loads(json_match.group(1))
                    print("Grant/Funding Agent: Successfully extracted and parsed JSON from response.")
                    return funding_strategy
                except json.JSONDecodeError:
                    pass
            
            # Return a structured error response
            return {
                "error": "Failed to parse JSON response",
                "raw_response": response[:1000] + "..." if len(response) > 1000 else response
            }
    except Exception as e:
        print(f"Grant/Funding Agent: Execution error: {e}")
        return {"error": str(e)}


class GrantFundingAgent:
    """
    Grant/Funding Agent - Expert in identifying, evaluating, and securing non-dilutive funding opportunities
    
    Searches for applicable grants, accelerators, or funding opportunities that match
    the business profile, needs, and eligibility criteria.
    """
    
    def __init__(self, user_input: str = None):
        self.user_input = user_input
        self.agent_name = "Grant/Funding Agent"
        self.agent_type = "Finance"
        self.capabilities = [
            "Grant research and identification",
            "Accelerator program matching",
            "Eligibility assessment and optimization",
            "Application strategy development",
            "Funding calendar management",
            "Proposal development guidance",
            "Alternative funding source identification",
            "Grant compliance and reporting"
        ]
        self.opportunity_library = {}
        self.application_strategies = {}
        from guild.src.models.llm import Llm
        self.llm_client = LlmClient(Llm(provider="ollama", model="tinyllama"))
    
    async def run(self, user_input: str = None) -> Dict[str, Any]:
        """
        Main execution method for the Grant/Funding Agent.
        Implements comprehensive funding opportunity identification using advanced prompting strategies.
        """
        try:
            print(f"Grant/Funding Agent: Starting comprehensive funding opportunity identification...")
            
            # Extract inputs from user_input or use defaults
            if user_input:
                funding_request = user_input
            else:
                funding_request = "Identify relevant funding opportunities for our business"
            
            # Define comprehensive funding parameters
            business_profile = {
                "company_name": "Guild-AI",
                "description": "AI Workforce platform for solopreneurs and lean teams",
                "mission": "Empower small businesses with enterprise-grade AI capabilities",
                "vision": "Democratize access to AI workforce tools for businesses of all sizes",
                "founding_date": "2023-06-01",
                "team_size": 15,
                "key_achievements": [
                    "Developed multi-agent orchestration system",
                    "Built visual automation capabilities",
                    "Created document processing pipeline",
                    "Launched beta with 250 active users"
                ],
                "unique_value_proposition": "Enterprise-grade AI workforce accessible to small businesses",
                "intellectual_property": {
                    "patents": 0,
                    "trademarks": 2,
                    "trade_secrets": "Multiple proprietary algorithms and workflows"
                },
                "social_impact": "Enabling small businesses to compete with larger enterprises through AI"
            }
            
            funding_needs = {
                "amount_seeking": "$500,000 - $1,500,000",
                "use_of_funds": [
                    "Product development and enhancement",
                    "Market expansion",
                    "Team growth",
                    "Infrastructure scaling"
                ],
                "funding_timeline": "Next 6-12 months",
                "previous_funding": {
                    "bootstrap": "$250,000",
                    "friends_and_family": "$150,000",
                    "angel_investment": "$300,000"
                },
                "preferred_funding_types": [
                    "Non-dilutive grants",
                    "Accelerator programs",
                    "Innovation competitions",
                    "R&D tax credits"
                ],
                "minimum_viable_funding": "$350,000"
            }
            
            eligibility_criteria = {
                "business_structure": "Delaware C-Corporation",
                "revenue_stage": "Early revenue ($10,000-$25,000 MRR)",
                "profitability": "Pre-profit",
                "employee_count": 15,
                "diversity_status": {
                    "woman_owned": False,
                    "minority_owned": True,
                    "veteran_owned": False,
                    "lgbtq_owned": False
                },
                "innovation_focus": [
                    "Artificial Intelligence",
                    "Automation",
                    "Small Business Technology",
                    "Productivity Solutions"
                ],
                "regulatory_compliance": {
                    "tax_compliance": "Current",
                    "business_licenses": "Active",
                    "insurance_coverage": "Comprehensive"
                }
            }
            
            industry_sector = "Technology - Artificial Intelligence and Automation"
            
            geographic_location = {
                "headquarters": "San Francisco, CA, USA",
                "operations": ["United States", "Remote Global Team"],
                "target_markets": ["North America", "Western Europe", "Australia"],
                "incorporation": "Delaware, USA"
            }
            
            business_stage = "Early Growth"
            
            # Generate comprehensive funding strategy
            funding_strategy = await generate_comprehensive_grant_funding_strategy(
                business_profile=business_profile,
                funding_needs=funding_needs,
                eligibility_criteria=eligibility_criteria,
                industry_sector=industry_sector,
                geographic_location=geographic_location,
                business_stage=business_stage
            )
            
            # Execute the funding opportunity identification based on the strategy
            result = await self._execute_funding_identification(
                funding_request, 
                funding_strategy
            )
            
            # Combine strategy and execution results
            final_result = {
                "agent": "Grant/Funding Agent",
                "strategy_type": "comprehensive_funding_identification",
                "funding_strategy": funding_strategy,
                "execution_result": result,
                "timestamp": datetime.now().isoformat(),
                "status": "completed"
            }
            
            print(f"Grant/Funding Agent: Comprehensive funding opportunity identification completed successfully.")
            return final_result
            
        except Exception as e:
            print(f"Grant/Funding Agent: Error in comprehensive funding identification: {e}")
            return {
                "agent": "Grant/Funding Agent",
                "status": "error",
                "message": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    async def _execute_funding_identification(self, funding_request: str, funding_strategy: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the funding opportunity identification based on the strategy.
        """
        try:
            print(f"Grant/Funding Agent: Executing funding identification for '{funding_request}'...")
            
            # Extract funding opportunities from strategy
            opportunities = []
            if "funding_opportunities" in funding_strategy:
                opportunities = funding_strategy["funding_opportunities"]
            elif "opportunities" in funding_strategy:
                opportunities = funding_strategy["opportunities"]
            else:
                # If opportunities not found in expected structure, create default ones
                opportunities = [
                    {
                        "name": "Small Business Innovation Research (SBIR)",
                        "type": "government_grant",
                        "amount": "$50,000 - $250,000",
                        "deadline": "Quarterly submissions",
                        "match_score": 0.85
                    },
                    {
                        "name": "Y Combinator",
                        "type": "accelerator",
                        "amount": "$500,000",
                        "deadline": "Bi-annual applications",
                        "match_score": 0.75
                    },
                    {
                        "name": "AWS AI & ML Startup Challenge",
                        "type": "competition",
                        "amount": "Up to $100,000 in credits and cash",
                        "deadline": "Annual submission",
                        "match_score": 0.9
                    }
                ]
            
            # Generate prioritized opportunity list
            prioritized_opportunities = await self._generate_prioritized_opportunities(opportunities)
            
            # Generate application strategies
            application_strategies = await self._generate_application_strategies(prioritized_opportunities)
            
            # Generate funding calendar
            funding_calendar = await self._generate_funding_calendar(prioritized_opportunities)
            
            # Generate document requirements
            document_requirements = await self._generate_document_requirements(prioritized_opportunities)
            
            return {
                "prioritized_opportunities": prioritized_opportunities,
                "application_strategies": application_strategies,
                "funding_calendar": funding_calendar,
                "document_requirements": document_requirements
            }
            
        except Exception as e:
            print(f"Grant/Funding Agent: Error executing funding identification: {e}")
            return {
                "error": str(e),
                "status": "failed"
            }
    
    async def _generate_prioritized_opportunities(self, opportunities: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Generate prioritized list of funding opportunities.
        """
        try:
            print(f"Grant/Funding Agent: Generating prioritized opportunities list...")
            
            # Sort opportunities by match score if available
            prioritized = sorted(
                opportunities,
                key=lambda x: x.get("match_score", 0) if isinstance(x.get("match_score"), (int, float)) else 0,
                reverse=True
            )
            
            # Add priority ranking
            for i, opportunity in enumerate(prioritized):
                opportunity["priority_rank"] = i + 1
                
                # Add detailed analysis if not present
                if "detailed_analysis" not in opportunity:
                    opportunity["detailed_analysis"] = {
                        "alignment_strengths": [
                            "Strong match with business profile",
                            "Funding amount meets needs",
                            "Timeline aligns with business goals"
                        ],
                        "potential_challenges": [
                            "Competitive application process",
                            "Detailed technical documentation required",
                            "Multiple review stages"
                        ],
                        "success_factors": [
                            "Clear articulation of innovation",
                            "Demonstrated market potential",
                            "Strong team credentials"
                        ]
                    }
            
            return prioritized
            
        except Exception as e:
            print(f"Grant/Funding Agent: Error generating prioritized opportunities: {e}")
            return [
                {
                    "name": "Error generating prioritized opportunities",
                    "error": str(e)
                }
            ]
    
    async def _generate_application_strategies(self, opportunities: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Generate application strategies for prioritized opportunities.
        """
        try:
            print(f"Grant/Funding Agent: Generating application strategies...")
            
            strategies = []
            
            for opportunity in opportunities[:5]:  # Focus on top 5 opportunities
                strategy = {
                    "opportunity_name": opportunity.get("name", "Unknown Opportunity"),
                    "key_narratives": [
                        "Innovative AI workforce solution democratizing access",
                        "Significant market potential addressing SMB pain points",
                        "Strong technical foundation with proprietary algorithms"
                    ],
                    "unique_selling_points": [
                        "Multi-agent orchestration system",
                        "Visual automation capabilities",
                        "Enterprise features at SMB price points"
                    ],
                    "application_approach": [
                        "Focus on technical innovation and differentiation",
                        "Emphasize market validation and early traction",
                        "Highlight social impact through SMB empowerment"
                    ],
                    "preparation_timeline": {
                        "4_weeks_before": "Begin gathering supporting documentation",
                        "3_weeks_before": "Draft initial application responses",
                        "2_weeks_before": "Conduct internal review and refinement",
                        "1_week_before": "Finalize application and supporting materials",
                        "3_days_before": "Technical review and submission preparation"
                    }
                }
                
                strategies.append(strategy)
            
            return strategies
            
        except Exception as e:
            print(f"Grant/Funding Agent: Error generating application strategies: {e}")
            return [
                {
                    "opportunity_name": "Error generating application strategies",
                    "error": str(e)
                }
            ]
    
    async def _generate_funding_calendar(self, opportunities: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Generate funding calendar with deadlines and preparation milestones.
        """
        try:
            print(f"Grant/Funding Agent: Generating funding calendar...")
            
            current_date = datetime.now()
            
            # Create calendar entries
            calendar_entries = []
            
            for opportunity in opportunities:
                # Create entry for application deadline
                deadline_entry = {
                    "event_type": "application_deadline",
                    "opportunity_name": opportunity.get("name", "Unknown Opportunity"),
                    "date": opportunity.get("deadline", "TBD"),
                    "priority": "high",
                    "actions_required": [
                        "Final review of all materials",
                        "Submission of complete application package",
                        "Confirmation of receipt"
                    ]
                }
                calendar_entries.append(deadline_entry)
                
                # Create entry for preparation start
                prep_entry = {
                    "event_type": "preparation_start",
                    "opportunity_name": opportunity.get("name", "Unknown Opportunity"),
                    "date": "4 weeks before deadline",
                    "priority": "medium",
                    "actions_required": [
                        "Kick-off meeting",
                        "Resource allocation",
                        "Document gathering initiation"
                    ]
                }
                calendar_entries.append(prep_entry)
                
                # Create entry for internal review
                review_entry = {
                    "event_type": "internal_review",
                    "opportunity_name": opportunity.get("name", "Unknown Opportunity"),
                    "date": "2 weeks before deadline",
                    "priority": "medium",
                    "actions_required": [
                        "Complete draft review",
                        "Stakeholder feedback collection",
                        "Refinement planning"
                    ]
                }
                calendar_entries.append(review_entry)
            
            # Create structured calendar
            funding_calendar = {
                "calendar_entries": calendar_entries,
                "upcoming_deadlines": [entry for entry in calendar_entries if entry["event_type"] == "application_deadline"],
                "preparation_milestones": [entry for entry in calendar_entries if entry["event_type"] != "application_deadline"],
                "calendar_management_recommendations": [
                    "Set up automated reminders for all deadlines",
                    "Schedule weekly funding opportunity review meetings",
                    "Create shared calendar for team visibility",
                    "Implement progress tracking system"
                ]
            }
            
            return funding_calendar
            
        except Exception as e:
            print(f"Grant/Funding Agent: Error generating funding calendar: {e}")
            return {
                "error": str(e),
                "status": "failed"
            }
    
    async def _generate_document_requirements(self, opportunities: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Generate document requirements for funding applications.
        """
        try:
            print(f"Grant/Funding Agent: Generating document requirements...")
            
            # Common documents needed across most applications
            common_documents = [
                {
                    "document_type": "Business Plan",
                    "description": "Comprehensive business plan including market analysis, product details, and growth strategy",
                    "format": "PDF",
                    "typical_length": "15-30 pages",
                    "preparation_time": "2-3 weeks"
                },
                {
                    "document_type": "Financial Projections",
                    "description": "3-5 year financial forecasts including revenue, expenses, and cash flow",
                    "format": "Excel/Spreadsheet",
                    "typical_length": "Multiple sheets",
                    "preparation_time": "1-2 weeks"
                },
                {
                    "document_type": "Team Bios",
                    "description": "Professional biographies of key team members highlighting relevant experience",
                    "format": "PDF",
                    "typical_length": "1-2 pages per person",
                    "preparation_time": "3-5 days"
                },
                {
                    "document_type": "Product Demo/Pitch Deck",
                    "description": "Visual presentation of product, market opportunity, and business model",
                    "format": "PowerPoint/PDF",
                    "typical_length": "10-15 slides",
                    "preparation_time": "1-2 weeks"
                }
            ]
            
            # Opportunity-specific documents
            opportunity_specific_documents = {}
            
            for opportunity in opportunities[:5]:  # Focus on top 5 opportunities
                opportunity_name = opportunity.get("name", "Unknown Opportunity")
                opportunity_type = opportunity.get("type", "unknown")
                
                if "government_grant" in opportunity_type.lower():
                    specific_docs = [
                        "Detailed project plan with milestones",
                        "Budget allocation breakdown",
                        "Technical feasibility assessment",
                        "Compliance documentation"
                    ]
                elif "accelerator" in opportunity_type.lower():
                    specific_docs = [
                        "Growth metrics and KPIs",
                        "Market traction evidence",
                        "Customer testimonials",
                        "Competitive analysis"
                    ]
                elif "competition" in opportunity_type.lower():
                    specific_docs = [
                        "Innovation statement",
                        "Technical differentiation proof",
                        "Market impact assessment",
                        "Visual demonstrations"
                    ]
                else:
                    specific_docs = [
                        "Organization overview",
                        "Project proposal",
                        "Expected outcomes",
                        "Sustainability plan"
                    ]
                
                opportunity_specific_documents[opportunity_name] = specific_docs
            
            # Document preparation recommendations
            preparation_recommendations = [
                "Create a centralized document repository",
                "Establish version control system",
                "Assign specific owners to each document type",
                "Schedule regular document review sessions",
                "Create templates for frequently needed documents"
            ]
            
            document_requirements = {
                "common_documents": common_documents,
                "opportunity_specific_documents": opportunity_specific_documents,
                "preparation_recommendations": preparation_recommendations
            }
            
            return document_requirements
            
        except Exception as e:
            print(f"Grant/Funding Agent: Error generating document requirements: {e}")
            return {
                "error": str(e),
                "status": "failed"
            }