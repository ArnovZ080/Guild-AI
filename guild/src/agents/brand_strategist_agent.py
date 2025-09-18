"""
Brand Strategist Agent for Guild-AI
Comprehensive brand strategy development using advanced prompting strategies.
"""

from guild.src.core.llm_client import LlmClient
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime
from guild.src.core.agent_helpers import inject_knowledge
import asyncio
import json

@inject_knowledge
async def generate_comprehensive_brand_strategy(
    brand_identity: Dict[str, Any],
    target_audience: Dict[str, Any],
    market_positioning: Dict[str, Any],
    visual_guidelines: Dict[str, Any],
    tone_voice_requirements: Dict[str, Any],
    campaign_context: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Generates comprehensive brand strategy using advanced prompting strategies.
    Ensures consistency of tone, visuals, and positioning across all campaigns.
    """
    print("Brand Strategist Agent: Generating comprehensive brand strategy with injected knowledge...")

    # Structured prompt following advanced prompting strategies
    prompt = f"""
# Brand Strategist Agent - Comprehensive Brand Consistency & Development

## Role Definition
You are the **Brand Strategist Agent**, an expert in brand development, identity management, and consistent brand expression. Your role is to ensure complete consistency of tone, visual elements, messaging, and positioning across all marketing campaigns and customer touchpoints while evolving the brand strategically.

## Core Expertise
- Brand Identity & Personality Development
- Visual Brand Consistency Management
- Tone & Voice Standardization
- Brand Positioning & Differentiation
- Brand Architecture & Hierarchy
- Brand Equity Building & Protection
- Cross-Channel Brand Consistency
- Brand Evolution & Growth Strategy

## Context & Background Information
**Brand Identity:** {json.dumps(brand_identity, indent=2)}
**Target Audience:** {json.dumps(target_audience, indent=2)}
**Market Positioning:** {json.dumps(market_positioning, indent=2)}
**Visual Guidelines:** {json.dumps(visual_guidelines, indent=2)}
**Tone & Voice Requirements:** {json.dumps(tone_voice_requirements, indent=2)}
**Campaign Context:** {json.dumps(campaign_context, indent=2)}

## Task Breakdown & Steps
1. **Brand Audit:** Assess current brand consistency and alignment across touchpoints
2. **Identity Reinforcement:** Define core brand elements and expression guidelines
3. **Visual Consistency:** Ensure all visual elements adhere to brand guidelines
4. **Tone & Voice Alignment:** Standardize communication style across all channels
5. **Positioning Clarity:** Maintain consistent market positioning and differentiation
6. **Campaign Evaluation:** Review campaign elements for brand alignment
7. **Evolution Management:** Guide strategic brand development while maintaining recognition
8. **Brand Protection:** Identify and address potential brand dilution or inconsistencies

## Constraints & Rules
- All brand expressions must align with established brand identity and values
- Visual elements must strictly adhere to brand guidelines (colors, typography, imagery)
- Tone and voice must be consistent while adapting appropriately to different channels
- Positioning must be clear, consistent, and differentiated from competitors
- Brand evolution must be strategic, intentional, and maintain core brand equity
- All recommendations must consider target audience perceptions and expectations
- Cross-channel consistency must be maintained while respecting channel-specific needs
- Brand protection must be prioritized in all strategic decisions

## Output Format
Return a comprehensive JSON object with brand strategy, consistency assessment, and implementation guidelines.

Generate the comprehensive brand strategy now, ensuring all elements are thoroughly addressed.
"""

    try:
        # Create LLM client
        from guild.src.models.llm import Llm
        client = LlmClient(Llm(provider="ollama", model="tinyllama"))
        
        # Generate response
        response = await client.chat(prompt)
        
        # Parse JSON response
        try:
            brand_strategy = json.loads(response)
            print("Brand Strategist Agent: Successfully generated comprehensive brand strategy.")
            return brand_strategy
        except json.JSONDecodeError as e:
            print(f"Brand Strategist Agent: JSON parsing error: {e}")
            # Attempt to extract JSON from the response
            import re
            json_match = re.search(r'```json\n(.*?)\n```', response, re.DOTALL)
            if json_match:
                try:
                    brand_strategy = json.loads(json_match.group(1))
                    print("Brand Strategist Agent: Successfully extracted and parsed JSON from response.")
                    return brand_strategy
                except json.JSONDecodeError:
                    pass
            
            # Return a structured error response
            return {
                "error": "Failed to parse JSON response",
                "raw_response": response[:1000] + "..." if len(response) > 1000 else response
            }
    except Exception as e:
        print(f"Brand Strategist Agent: Execution error: {e}")
        return {"error": str(e)}

@dataclass
class BrandElement:
    element_id: str
    category: str  # visual, tone, messaging, positioning
    name: str
    description: str
    guidelines: List[str]
    examples: List[str]
    do_and_donts: Dict[str, List[str]]
    priority: str  # core, secondary, flexible
    channels: List[str]
    created_date: datetime

@dataclass
class BrandInconsistency:
    inconsistency_id: str
    element_id: str
    description: str
    severity: str  # critical, moderate, minor
    impact: str
    recommendation: str
    examples: List[str]
    status: str  # identified, addressed, resolved
    channels_affected: List[str]

class BrandStrategistAgent:
    """
    Brand Strategist Agent - Expert in brand development, identity management, and consistent brand expression
    
    Ensures consistency of tone, visuals, and positioning across all marketing campaigns and customer
    touchpoints while evolving the brand strategically.
    """
    
    def __init__(self, user_input: str = None):
        self.user_input = user_input
        self.agent_name = "Brand Strategist Agent"
        self.agent_type = "Marketing & Growth"
        self.capabilities = [
            "Brand identity and personality development",
            "Visual brand consistency management",
            "Tone and voice standardization",
            "Brand positioning and differentiation",
            "Brand architecture and hierarchy",
            "Brand equity building and protection",
            "Cross-channel brand consistency",
            "Brand evolution and growth strategy"
        ]
        self.brand_elements = {}
        self.inconsistencies = {}
        from guild.src.models.llm import Llm
        self.llm_client = LlmClient(Llm(provider="ollama", model="tinyllama"))
    
    async def run(self, user_input: str = None) -> Dict[str, Any]:
        """
        Main execution method for the Brand Strategist Agent.
        Implements comprehensive brand strategy using advanced prompting strategies.
        """
        try:
            print(f"Brand Strategist Agent: Starting comprehensive brand strategy development...")
            
            # Define comprehensive brand strategy parameters
            brand_identity = {
                "brand_name": "Guild-AI",
                "tagline": "Your AI Workforce",
                "mission": "Empower solopreneurs and lean teams with enterprise-grade AI capabilities",
                "vision": "A world where every business has access to a full AI workforce",
                "values": [
                    "empowerment",
                    "accessibility",
                    "intelligence",
                    "reliability",
                    "innovation"
                ],
                "personality": {
                    "primary_traits": ["knowledgeable", "efficient", "supportive"],
                    "secondary_traits": ["innovative", "approachable", "professional"]
                },
                "brand_story": "Guild-AI was created to democratize access to advanced AI capabilities, giving small businesses and solopreneurs the same advantages previously only available to large enterprises.",
                "brand_promise": "Multiply your productivity with an AI workforce that works alongside you."
            }
            
            target_audience = {
                "primary_segments": [
                    {
                        "name": "Tech-Savvy Solopreneurs",
                        "description": "Independent professionals comfortable with technology who need to scale operations without hiring",
                        "pain_points": ["time_constraints", "resource_limitations", "scaling_challenges"],
                        "motivations": ["efficiency", "growth", "competitive_edge"],
                        "channels": ["linkedin", "twitter", "tech_blogs", "productivity_communities"]
                    },
                    {
                        "name": "Lean Startups",
                        "description": "Early-stage companies with small teams looking to maximize output",
                        "pain_points": ["limited_budget", "talent_gaps", "operational_bottlenecks"],
                        "motivations": ["cost_efficiency", "rapid_scaling", "process_optimization"],
                        "channels": ["startup_communities", "tech_events", "founder_networks"]
                    }
                ],
                "secondary_segments": [
                    {
                        "name": "Small Agencies",
                        "description": "Marketing, design, and development agencies with 5-15 employees",
                        "pain_points": ["client_demands", "workflow_management", "creative_production_scale"],
                        "motivations": ["client_satisfaction", "margin_improvement", "competitive_services"],
                        "channels": ["industry_publications", "agency_networks", "professional_associations"]
                    }
                ],
                "psychographics": {
                    "tech_adoption": "early_adopter_to_early_majority",
                    "ai_attitude": "positive_but_practical",
                    "productivity_focus": "high",
                    "value_perception": "roi_driven"
                }
            }
            
            market_positioning = {
                "category": "AI Workforce Platform",
                "unique_value_proposition": "A complete AI workforce that handles your marketing, research, operations, and creative tasks",
                "key_differentiators": [
                    "multi_agent_orchestration",
                    "visual_automation_capabilities",
                    "comprehensive_workflow_system",
                    "solopreneur_focus"
                ],
                "competitive_landscape": {
                    "direct_competitors": [
                        {
                            "name": "Generic Competitor 1",
                            "positioning": "Enterprise AI platform",
                            "strengths": ["enterprise_features", "established_market_presence"],
                            "weaknesses": ["complex_interface", "high_pricing", "not_solopreneur_focused"]
                        },
                        {
                            "name": "Generic Competitor 2",
                            "positioning": "AI marketing assistant",
                            "strengths": ["marketing_specialization", "user_friendly"],
                            "weaknesses": ["limited_capabilities", "single_agent", "no_visual_automation"]
                        }
                    ],
                    "indirect_competitors": ["freelancers", "virtual_assistants", "specialized_ai_tools"]
                },
                "price_positioning": "premium_but_accessible",
                "quality_positioning": "enterprise_grade_for_small_business"
            }
            
            visual_guidelines = {
                "logo": {
                    "primary_logo": "full_color_horizontal",
                    "secondary_logos": ["monochrome", "icon_only", "vertical_lockup"],
                    "clear_space": "equal_to_logo_height_divided_by_4",
                    "minimum_size": "24px_height"
                },
                "color_palette": {
                    "primary_colors": [
                        {"name": "Guild Blue", "hex": "#2563EB", "rgb": "37, 99, 235", "usage": "primary_brand_color"},
                        {"name": "Guild Purple", "hex": "#7C3AED", "rgb": "124, 58, 237", "usage": "accent_color"}
                    ],
                    "secondary_colors": [
                        {"name": "Deep Navy", "hex": "#1E40AF", "rgb": "30, 64, 175", "usage": "dark_backgrounds_headers"},
                        {"name": "Soft Lavender", "hex": "#C4B5FD", "rgb": "196, 181, 253", "usage": "highlights_accents"}
                    ],
                    "neutral_colors": [
                        {"name": "Charcoal", "hex": "#1F2937", "rgb": "31, 41, 55", "usage": "body_text"},
                        {"name": "Silver", "hex": "#9CA3AF", "rgb": "156, 163, 175", "usage": "secondary_text"},
                        {"name": "Light Gray", "hex": "#F3F4F6", "rgb": "243, 244, 246", "usage": "backgrounds"}
                    ]
                },
                "typography": {
                    "primary_font": "Inter",
                    "secondary_font": "Roboto Mono",
                    "heading_styles": {
                        "h1": {"font": "Inter", "weight": "700", "size": "32px", "line_height": "40px"},
                        "h2": {"font": "Inter", "weight": "600", "size": "24px", "line_height": "32px"},
                        "h3": {"font": "Inter", "weight": "600", "size": "20px", "line_height": "28px"}
                    },
                    "body_styles": {
                        "body_large": {"font": "Inter", "weight": "400", "size": "18px", "line_height": "28px"},
                        "body": {"font": "Inter", "weight": "400", "size": "16px", "line_height": "24px"},
                        "body_small": {"font": "Inter", "weight": "400", "size": "14px", "line_height": "20px"}
                    },
                    "code_styles": {"font": "Roboto Mono", "weight": "400", "size": "14px", "line_height": "20px"}
                },
                "imagery": {
                    "style": "modern_tech_with_human_element",
                    "photography_guidelines": [
                        "natural_lighting",
                        "diverse_representation",
                        "authentic_work_environments",
                        "technology_integrated_naturally"
                    ],
                    "illustration_style": "geometric_with_gradient_accents",
                    "icon_style": "outlined_with_rounded_corners"
                },
                "layout_principles": [
                    "clean_and_minimal",
                    "ample_whitespace",
                    "clear_visual_hierarchy",
                    "consistent_grid_system"
                ]
            }
            
            tone_voice_requirements = {
                "brand_voice": {
                    "overall_tone": "knowledgeable_yet_approachable",
                    "primary_characteristics": [
                        {"trait": "expert", "description": "Demonstrates deep knowledge without being condescending"},
                        {"trait": "helpful", "description": "Proactively offers solutions and guidance"},
                        {"trait": "efficient", "description": "Clear, concise, and focused on value"}
                    ],
                    "secondary_characteristics": [
                        {"trait": "conversational", "description": "Natural language that avoids jargon when possible"},
                        {"trait": "confident", "description": "Assured but not arrogant"},
                        {"trait": "forward-thinking", "description": "Emphasizes possibilities and innovation"}
                    ]
                },
                "writing_guidelines": {
                    "sentence_structure": "Mix of short, direct sentences with longer explanatory ones",
                    "paragraph_length": "3-4 sentences maximum for digital content",
                    "technical_language": "Use when necessary, but always explain complex concepts",
                    "acronyms": "Define on first use in content",
                    "active_voice": "Preferred in most communications"
                },
                "channel_adaptations": {
                    "website": "Professional but accessible, educational focus",
                    "social_media": "More conversational and concise, with personality",
                    "email": "Helpful and direct, with clear calls to action",
                    "documentation": "Clear, structured, and comprehensive",
                    "customer_support": "Empathetic, solution-oriented, and patient"
                },
                "terminology": {
                    "preferred_terms": [
                        {"use": "AI workforce", "instead_of": "AI assistants"},
                        {"use": "orchestration", "instead_of": "management"},
                        {"use": "visual automation", "instead_of": "screen automation"}
                    ],
                    "avoid": ["cheap", "simple", "easy", "basic", "just"]
                }
            }
            
            campaign_context = {
                "current_campaign": {
                    "name": "Multiply Your Productivity",
                    "objective": "Position Guild-AI as the essential productivity multiplier for solopreneurs",
                    "key_message": "Do more with your AI workforce",
                    "target_audience": "tech_savvy_solopreneurs",
                    "channels": ["linkedin", "twitter", "tech_blogs", "youtube", "podcast_sponsorships"],
                    "timeline": "Q3 2025",
                    "assets_needed": [
                        "landing_page",
                        "social_media_content",
                        "case_studies",
                        "demo_videos",
                        "email_sequence"
                    ]
                },
                "previous_campaigns": [
                    {
                        "name": "Launch Campaign",
                        "theme": "The AI Workforce Revolution",
                        "performance": "moderate_success",
                        "learnings": "More concrete examples needed, value proposition resonated"
                    }
                ],
                "upcoming_initiatives": [
                    {
                        "name": "Vertical Focus Series",
                        "description": "Targeted campaigns for specific industries (e-commerce, consulting, content creation)",
                        "timeline": "Q4 2025"
                    },
                    {
                        "name": "Automation Showcase",
                        "description": "Highlighting visual automation capabilities",
                        "timeline": "Q1 2026"
                    }
                ]
            }
            
            # Generate comprehensive brand strategy
            brand_strategy = await generate_comprehensive_brand_strategy(
                brand_identity=brand_identity,
                target_audience=target_audience,
                market_positioning=market_positioning,
                visual_guidelines=visual_guidelines,
                tone_voice_requirements=tone_voice_requirements,
                campaign_context=campaign_context
            )
            
            # Execute the brand strategy
            result = await self._execute_brand_strategy(brand_strategy)
            
            # Combine strategy and execution results
            final_result = {
                "agent": "Brand Strategist Agent",
                "strategy_type": "comprehensive_brand_strategy",
                "brand_strategy": brand_strategy,
                "execution_result": result,
                "timestamp": datetime.now().isoformat(),
                "status": "completed"
            }
            
            print(f"Brand Strategist Agent: Comprehensive brand strategy development completed successfully.")
            return final_result
            
        except Exception as e:
            print(f"Brand Strategist Agent: Error in comprehensive brand strategy development: {e}")
            return {
                "agent": "Brand Strategist Agent",
                "status": "error",
                "message": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    async def _execute_brand_strategy(self, strategy: Dict[str, Any]) -> Dict[str, Any]:
        """Execute brand strategy implementation."""
        try:
            # Extract strategy components
            brand_audit = strategy.get("brand_audit", {})
            identity_guidelines = strategy.get("identity_guidelines", {})
            visual_consistency = strategy.get("visual_consistency", {})
            tone_voice_alignment = strategy.get("tone_voice_alignment", {})
            positioning_recommendations = strategy.get("positioning_recommendations", {})
            campaign_evaluation = strategy.get("campaign_evaluation", {})
            
            # Create brand elements
            brand_elements = {}
            
            # Process visual elements
            for element_id, element_data in visual_consistency.get("elements", {}).items():
                if isinstance(element_data, dict):
                    element = BrandElement(
                        element_id=element_id,
                        category="visual",
                        name=element_data.get("name", ""),
                        description=element_data.get("description", ""),
                        guidelines=element_data.get("guidelines", []),
                        examples=element_data.get("examples", []),
                        do_and_donts=element_data.get("do_and_donts", {"do": [], "dont": []}),
                        priority=element_data.get("priority", "secondary"),
                        channels=element_data.get("channels", []),
                        created_date=datetime.now()
                    )
                    
                    brand_elements[element_id] = element
                    self.brand_elements[element_id] = element
            
            # Process tone and voice elements
            for element_id, element_data in tone_voice_alignment.get("elements", {}).items():
                if isinstance(element_data, dict):
                    element = BrandElement(
                        element_id=element_id,
                        category="tone",
                        name=element_data.get("name", ""),
                        description=element_data.get("description", ""),
                        guidelines=element_data.get("guidelines", []),
                        examples=element_data.get("examples", []),
                        do_and_donts=element_data.get("do_and_donts", {"do": [], "dont": []}),
                        priority=element_data.get("priority", "secondary"),
                        channels=element_data.get("channels", []),
                        created_date=datetime.now()
                    )
                    
                    brand_elements[element_id] = element
                    self.brand_elements[element_id] = element
            
            # Process positioning elements
            for element_id, element_data in positioning_recommendations.get("elements", {}).items():
                if isinstance(element_data, dict):
                    element = BrandElement(
                        element_id=element_id,
                        category="positioning",
                        name=element_data.get("name", ""),
                        description=element_data.get("description", ""),
                        guidelines=element_data.get("guidelines", []),
                        examples=element_data.get("examples", []),
                        do_and_donts=element_data.get("do_and_donts", {"do": [], "dont": []}),
                        priority=element_data.get("priority", "secondary"),
                        channels=element_data.get("channels", []),
                        created_date=datetime.now()
                    )
                    
                    brand_elements[element_id] = element
                    self.brand_elements[element_id] = element
            
            # Identify inconsistencies
            inconsistencies = {}
            for issue_id, issue_data in brand_audit.get("inconsistencies", {}).items():
                if isinstance(issue_data, dict):
                    element_id = issue_data.get("element_id", "unknown")
                    
                    inconsistency = BrandInconsistency(
                        inconsistency_id=issue_id,
                        element_id=element_id,
                        description=issue_data.get("description", ""),
                        severity=issue_data.get("severity", "moderate"),
                        impact=issue_data.get("impact", ""),
                        recommendation=issue_data.get("recommendation", ""),
                        examples=issue_data.get("examples", []),
                        status="identified",
                        channels_affected=issue_data.get("channels_affected", [])
                    )
                    
                    inconsistencies[issue_id] = inconsistency
                    self.inconsistencies[issue_id] = inconsistency
            
            # Generate brand guidelines document
            brand_guidelines = self._generate_brand_guidelines(brand_elements)
            
            # Generate campaign alignment recommendations
            campaign_alignment = self._evaluate_campaign_alignment(
                campaign_evaluation, 
                brand_elements
            )
            
            # Generate brand consistency report
            consistency_report = self._generate_consistency_report(
                brand_elements, 
                inconsistencies
            )
            
            return {
                "status": "success",
                "message": "Brand strategy executed successfully",
                "brand_elements_count": len(brand_elements),
                "inconsistencies_identified": len(inconsistencies),
                "brand_guidelines": brand_guidelines,
                "campaign_alignment": campaign_alignment,
                "consistency_report": consistency_report,
                "execution_metrics": {
                    "brand_elements_created": len(brand_elements),
                    "inconsistencies_identified": len(inconsistencies),
                    "guidelines_comprehensiveness": "high",
                    "alignment_quality": "comprehensive"
                }
            }
            
        except Exception as e:
            return {
                "status": "error",
                "message": f"Brand strategy execution failed: {str(e)}"
            }
    
    def _generate_brand_guidelines(self, brand_elements: Dict[str, BrandElement]) -> Dict[str, Any]:
        """Generate structured brand guidelines document."""
        # Organize elements by category
        elements_by_category = {
            "visual": [],
            "tone": [],
            "messaging": [],
            "positioning": []
        }
        
        for element in brand_elements.values():
            if element.category in elements_by_category:
                elements_by_category[element.category].append({
                    "id": element.element_id,
                    "name": element.name,
                    "description": element.description,
                    "guidelines": element.guidelines,
                    "examples": element.examples,
                    "do_and_donts": element.do_and_donts,
                    "priority": element.priority
                })
        
        # Sort elements by priority within each category
        for category in elements_by_category:
            elements_by_category[category].sort(
                key=lambda e: {"core": 0, "secondary": 1, "flexible": 2}.get(e["priority"], 3)
            )
        
        # Generate channel-specific guidelines
        channel_guidelines = {}
        channels = set()
        
        for element in brand_elements.values():
            for channel in element.channels:
                channels.add(channel)
        
        for channel in channels:
            relevant_elements = []
            for element in brand_elements.values():
                if channel in element.channels:
                    relevant_elements.append({
                        "id": element.element_id,
                        "name": element.name,
                        "category": element.category,
                        "guidelines": [g for g in element.guidelines if "all channels" in g.lower() or channel.lower() in g.lower()]
                    })
            
            channel_guidelines[channel] = relevant_elements
        
        return {
            "document_title": "Guild-AI Brand Guidelines",
            "last_updated": datetime.now().strftime("%Y-%m-%d"),
            "sections": {
                "introduction": {
                    "title": "Introduction",
                    "content": "This brand guidelines document ensures consistency across all Guild-AI communications and touchpoints."
                },
                "visual_elements": {
                    "title": "Visual Brand Elements",
                    "elements": elements_by_category["visual"]
                },
                "tone_and_voice": {
                    "title": "Tone and Voice Guidelines",
                    "elements": elements_by_category["tone"]
                },
                "messaging": {
                    "title": "Messaging Framework",
                    "elements": elements_by_category["messaging"]
                },
                "positioning": {
                    "title": "Brand Positioning",
                    "elements": elements_by_category["positioning"]
                },
                "channel_specific": {
                    "title": "Channel-Specific Guidelines",
                    "channels": channel_guidelines
                }
            },
            "usage_instructions": {
                "title": "How to Use These Guidelines",
                "steps": [
                    "Review the relevant section before creating any brand content",
                    "Follow the do's and don'ts for each brand element",
                    "Reference the channel-specific guidelines for your medium",
                    "When in doubt, prioritize core brand elements over flexible ones"
                ]
            }
        }
    
    def _evaluate_campaign_alignment(
        self, 
        campaign_evaluation: Dict[str, Any],
        brand_elements: Dict[str, BrandElement]
    ) -> Dict[str, Any]:
        """Evaluate campaign alignment with brand strategy."""
        # Extract campaign details
        campaign_name = campaign_evaluation.get("campaign_name", "Current Campaign")
        alignment_scores = campaign_evaluation.get("alignment_scores", {})
        recommendations = campaign_evaluation.get("recommendations", [])
        
        # Calculate overall alignment score
        alignment_categories = ["visual", "tone", "messaging", "positioning"]
        category_scores = {}
        
        for category in alignment_categories:
            category_score = alignment_scores.get(category, {}).get("score", 0.0)
            category_scores[category] = category_score
        
        overall_score = sum(category_scores.values()) / max(1, len(category_scores))
        
        # Generate improvement recommendations
        prioritized_recommendations = []
        
        for rec in recommendations:
            if isinstance(rec, dict):
                # Find related brand elements
                related_elements = []
                element_id = rec.get("element_id")
                
                if element_id and element_id in brand_elements:
                    related_elements.append({
                        "id": element_id,
                        "name": brand_elements[element_id].name,
                        "guidelines": brand_elements[element_id].guidelines[:2]  # Include just a couple of guidelines
                    })
                
                prioritized_recommendations.append({
                    "issue": rec.get("issue", ""),
                    "recommendation": rec.get("recommendation", ""),
                    "priority": rec.get("priority", "medium"),
                    "impact": rec.get("impact", "moderate"),
                    "related_elements": related_elements
                })
        
        # Sort recommendations by priority
        prioritized_recommendations.sort(
            key=lambda r: {"high": 0, "medium": 1, "low": 2}.get(r["priority"], 3)
        )
        
        return {
            "campaign_name": campaign_name,
            "evaluation_date": datetime.now().strftime("%Y-%m-%d"),
            "overall_alignment_score": overall_score,
            "category_scores": category_scores,
            "alignment_status": "aligned" if overall_score >= 0.8 else "needs_improvement" if overall_score >= 0.6 else "misaligned",
            "prioritized_recommendations": prioritized_recommendations,
            "next_steps": [
                "Address high-priority alignment issues",
                "Review brand guidelines with campaign team",
                "Implement recommendations before campaign launch",
                "Schedule follow-up evaluation post-implementation"
            ]
        }
    
    def _generate_consistency_report(
        self, 
        brand_elements: Dict[str, BrandElement],
        inconsistencies: Dict[str, BrandInconsistency]
    ) -> Dict[str, Any]:
        """Generate brand consistency report."""
        # Calculate consistency metrics
        total_elements = len(brand_elements)
        total_inconsistencies = len(inconsistencies)
        
        consistency_score = max(0, 1.0 - (total_inconsistencies / max(1, total_elements)))
        
        # Group inconsistencies by severity
        inconsistencies_by_severity = {
            "critical": [],
            "moderate": [],
            "minor": []
        }
        
        for inconsistency in inconsistencies.values():
            severity = inconsistency.severity.lower()
            if severity in inconsistencies_by_severity:
                inconsistencies_by_severity[severity].append({
                    "id": inconsistency.inconsistency_id,
                    "description": inconsistency.description,
                    "impact": inconsistency.impact,
                    "recommendation": inconsistency.recommendation,
                    "channels_affected": inconsistency.channels_affected
                })
        
        # Group inconsistencies by channel
        inconsistencies_by_channel = {}
        
        for inconsistency in inconsistencies.values():
            for channel in inconsistency.channels_affected:
                if channel not in inconsistencies_by_channel:
                    inconsistencies_by_channel[channel] = []
                
                inconsistencies_by_channel[channel].append({
                    "id": inconsistency.inconsistency_id,
                    "description": inconsistency.description,
                    "severity": inconsistency.severity
                })
        
        # Generate action plan
        action_plan = []
        
        # First add critical inconsistencies
        for inconsistency in inconsistencies_by_severity["critical"]:
            action_plan.append({
                "issue_id": inconsistency["id"],
                "description": inconsistency["description"],
                "action": inconsistency["recommendation"],
                "priority": "high",
                "timeframe": "immediate"
            })
        
        # Then add moderate inconsistencies
        for inconsistency in inconsistencies_by_severity["moderate"]:
            action_plan.append({
                "issue_id": inconsistency["id"],
                "description": inconsistency["description"],
                "action": inconsistency["recommendation"],
                "priority": "medium",
                "timeframe": "short-term"
            })
        
        # Finally add a consolidated action for minor inconsistencies
        if inconsistencies_by_severity["minor"]:
            action_plan.append({
                "issue_id": "consolidated_minor",
                "description": f"Address {len(inconsistencies_by_severity['minor'])} minor brand inconsistencies",
                "action": "Review and update minor inconsistencies as part of regular brand maintenance",
                "priority": "low",
                "timeframe": "medium-term"
            })
        
        return {
            "report_date": datetime.now().strftime("%Y-%m-%d"),
            "consistency_score": consistency_score,
            "consistency_status": "excellent" if consistency_score >= 0.9 else "good" if consistency_score >= 0.7 else "needs_improvement",
            "total_brand_elements": total_elements,
            "total_inconsistencies": total_inconsistencies,
            "inconsistencies_by_severity": inconsistencies_by_severity,
            "inconsistencies_by_channel": inconsistencies_by_channel,
            "action_plan": action_plan,
            "recommendations": [
                "Address critical inconsistencies immediately",
                "Schedule regular brand audits (quarterly)",
                "Provide brand training to all content creators",
                "Implement brand review process for all new content"
            ]
        }
    
    def get_agent_info(self) -> Dict[str, Any]:
        """Get agent information and capabilities"""
        
        return {
            "name": self.agent_name,
            "type": self.agent_type,
            "capabilities": self.capabilities,
            "brand_element_categories": ["Visual", "Tone & Voice", "Messaging", "Positioning"],
            "deliverable_types": ["Brand Guidelines", "Campaign Alignment Report", "Consistency Audit"]
        }
