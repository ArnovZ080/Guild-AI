"""
Localization Agent for Guild-AI
Comprehensive content localization using advanced prompting strategies.
"""

from guild.src.core.llm_client import LlmClient
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime
from guild.src.core.agent_helpers import inject_knowledge
import asyncio
import json


@dataclass
class LocalizationMarket:
    """Data class for target market information."""
    region: str
    language: str
    cultural_context: str
    regulatory_requirements: List[str]
    market_size: str
    digital_adoption: str
    preferred_platforms: List[str]
    local_competitors: List[str]


@dataclass
class LocalizationOutput:
    """Data class for localization output."""
    market: str
    language: str
    adapted_content: Dict[str, Any]
    cultural_adaptations: List[str]
    visual_modifications: List[str]
    regulatory_compliance: List[str]
    seo_adaptations: List[str]
    implementation_notes: str


@inject_knowledge
async def generate_comprehensive_localization_strategy(
    content_type: str,
    source_content: Dict[str, Any],
    target_markets: Dict[str, Any],
    cultural_considerations: Dict[str, Any],
    language_requirements: Dict[str, Any],
    brand_guidelines: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Generates comprehensive localization strategy using advanced prompting strategies.
    Adapts content/campaigns to different geographies, languages, and cultures.
    """
    print("Localization Agent: Generating comprehensive localization strategy with injected knowledge...")

    # Structured prompt following advanced prompting strategies
    prompt = f"""
# Localization Agent - Comprehensive Cultural & Linguistic Adaptation

## Role Definition
You are the **Localization Agent**, an expert in cultural adaptation, language translation, and market-specific content optimization. Your role is to adapt marketing content, campaigns, and communications for different geographies, languages, and cultural contexts while maintaining brand consistency and message effectiveness.

## Core Expertise
- Cultural Adaptation & Sensitivity
- Language Translation & Localization
- Market-Specific Content Optimization
- Regional Compliance & Regulations
- Visual & Design Localization
- Messaging Effectiveness Across Cultures
- Local SEO & Digital Presence
- Cross-Cultural User Experience

## Context & Background Information
**Content Type:** {content_type}
**Source Content:** {json.dumps(source_content, indent=2)}
**Target Markets:** {json.dumps(target_markets, indent=2)}
**Cultural Considerations:** {json.dumps(cultural_considerations, indent=2)}
**Language Requirements:** {json.dumps(language_requirements, indent=2)}
**Brand Guidelines:** {json.dumps(brand_guidelines, indent=2)}

## Task Breakdown & Steps
1. **Content Analysis:** Assess source content for localization requirements and challenges
2. **Cultural Adaptation:** Identify cultural nuances, taboos, and preferences for each market
3. **Language Localization:** Translate and adapt messaging for linguistic effectiveness
4. **Visual Adaptation:** Modify visual elements to resonate with local audiences
5. **Compliance Review:** Ensure adherence to local regulations and standards
6. **Market Testing:** Validate localized content with native speakers or local experts
7. **Implementation Planning:** Create deployment strategy for localized content
8. **Performance Monitoring:** Establish metrics for measuring localization effectiveness

## Constraints & Rules
- Cultural adaptations must be authentic and respectful, not stereotypical
- Language localization must maintain the original message intent and tone
- Visual adaptations must consider local cultural symbolism and preferences
- All localized content must maintain core brand identity and guidelines
- Regional compliance requirements must be thoroughly researched and addressed
- Local idioms and references should be used appropriately and accurately
- SEO elements must be optimized for local search behaviors and platforms
- User experience must be tailored to local technological preferences and behaviors

## Output Format
Return a comprehensive JSON object with localization strategy, cultural adaptations, language recommendations, and implementation plan.

Generate the comprehensive localization strategy now, ensuring all elements are thoroughly addressed.
"""

    try:
        # Create LLM client
        from guild.src.models.llm import Llm
        client = LlmClient(Llm(provider="ollama", model="tinyllama"))
        
        # Generate response
        response = await client.chat(prompt)
        
        # Parse JSON response
        try:
            localization_strategy = json.loads(response)
            print("Localization Agent: Successfully generated comprehensive localization strategy.")
            return localization_strategy
        except json.JSONDecodeError as e:
            print(f"Localization Agent: JSON parsing error: {e}")
            # Attempt to extract JSON from the response
            import re
            json_match = re.search(r'```json\n(.*?)\n```', response, re.DOTALL)
            if json_match:
                try:
                    localization_strategy = json.loads(json_match.group(1))
                    print("Localization Agent: Successfully extracted and parsed JSON from response.")
                    return localization_strategy
                except json.JSONDecodeError:
                    pass
            
            # Return a structured error response
            return {
                "error": "Failed to parse JSON response",
                "raw_response": response[:1000] + "..." if len(response) > 1000 else response
            }
    except Exception as e:
        print(f"Localization Agent: Execution error: {e}")
        return {"error": str(e)}


class LocalizationAgent:
    """
    Localization Agent - Expert in cultural adaptation, language translation, and market-specific content optimization
    
    Adapts content/campaigns to different geographies, languages, and cultures while maintaining
    brand consistency and message effectiveness.
    """
    
    def __init__(self, user_input: str = None):
        self.user_input = user_input
        self.agent_name = "Localization Agent"
        self.agent_type = "Marketing & Growth"
        self.capabilities = [
            "Cultural adaptation and sensitivity",
            "Language translation and localization",
            "Market-specific content optimization",
            "Regional compliance and regulations",
            "Visual and design localization",
            "Messaging effectiveness across cultures",
            "Local SEO and digital presence",
            "Cross-cultural user experience"
        ]
        self.localization_library = {}
        self.market_profiles = {}
        from guild.src.models.llm import Llm
        self.llm_client = LlmClient(Llm(provider="ollama", model="tinyllama"))
    
    async def run(self, user_input: str = None) -> Dict[str, Any]:
        """
        Main execution method for the Localization Agent.
        Implements comprehensive localization using advanced prompting strategies.
        """
        try:
            print(f"Localization Agent: Starting comprehensive localization process...")
            
            # Extract inputs from user_input or use defaults
            if user_input:
                localization_request = user_input
            else:
                localization_request = "Adapt content for international markets"
            
            # Define comprehensive localization parameters
            content_type = "marketing_campaign"
            source_content = {
                "campaign_name": "AI Workforce Revolution",
                "headline": "Transform Your Business with an AI Workforce",
                "primary_message": "Automate repetitive tasks and focus on strategic growth with Guild-AI's intelligent agent workforce.",
                "value_propositions": [
                    "Save 20+ hours per week on routine tasks",
                    "Reduce operational costs by up to 40%",
                    "Scale your business without hiring additional staff",
                    "Make data-driven decisions with AI-powered insights"
                ],
                "call_to_action": "Start Your Free Trial Today",
                "visual_elements": {
                    "primary_colors": ["#3A86FF", "#FF006E"],
                    "imagery": "professional working with AI assistant",
                    "icons": ["automation", "growth", "efficiency", "insights"]
                },
                "tone": "professional yet approachable",
                "target_audience": "solopreneurs and small business owners"
            }
            
            target_markets = {
                "regions": [
                    {
                        "name": "Western Europe",
                        "countries": ["Germany", "France", "Spain", "Italy"],
                        "languages": ["German", "French", "Spanish", "Italian"],
                        "market_maturity": "high",
                        "digital_adoption": "advanced",
                        "competitive_landscape": "saturated"
                    },
                    {
                        "name": "East Asia",
                        "countries": ["Japan", "South Korea", "Singapore"],
                        "languages": ["Japanese", "Korean", "English"],
                        "market_maturity": "high",
                        "digital_adoption": "advanced",
                        "competitive_landscape": "growing"
                    },
                    {
                        "name": "Latin America",
                        "countries": ["Brazil", "Mexico", "Colombia", "Argentina"],
                        "languages": ["Portuguese", "Spanish"],
                        "market_maturity": "emerging",
                        "digital_adoption": "growing",
                        "competitive_landscape": "developing"
                    }
                ],
                "prioritization": {
                    "primary": ["Germany", "Japan", "Brazil"],
                    "secondary": ["France", "South Korea", "Mexico"],
                    "tertiary": ["Spain", "Italy", "Singapore", "Colombia", "Argentina"]
                }
            }
            
            cultural_considerations = {
                "Germany": {
                    "communication_style": "direct_and_factual",
                    "business_values": ["efficiency", "precision", "reliability", "privacy"],
                    "decision_making": "analytical_and_methodical",
                    "color_associations": {
                        "blue": "quality_and_reliability",
                        "red": "caution_or_warning"
                    },
                    "taboos": ["aggressive_marketing", "overpromising", "privacy_violations"],
                    "preferred_content": "detailed_technical_specifications"
                },
                "Japan": {
                    "communication_style": "indirect_and_contextual",
                    "business_values": ["harmony", "quality", "long_term_relationships", "respect"],
                    "decision_making": "consensus_based_and_hierarchical",
                    "color_associations": {
                        "white": "purity_and_cleanliness",
                        "red": "happiness_and_celebration"
                    },
                    "taboos": ["direct_confrontation", "hard_selling", "individualism"],
                    "preferred_content": "relationship_and_trust_building"
                },
                "Brazil": {
                    "communication_style": "expressive_and_relationship_focused",
                    "business_values": ["flexibility", "creativity", "personal_connections", "optimism"],
                    "decision_making": "relationship_driven_and_adaptable",
                    "color_associations": {
                        "green": "nature_and_prosperity",
                        "yellow": "optimism_and_wealth"
                    },
                    "taboos": ["impersonal_communication", "rigid_scheduling", "cold_business_approach"],
                    "preferred_content": "visually_rich_and_emotionally_engaging"
                }
            }
            
            language_requirements = {
                "German": {
                    "formality_level": "formal",
                    "address_form": "Sie_formal",
                    "sentence_structure": "complex_and_precise",
                    "vocabulary_preferences": "technical_and_specific",
                    "character_limitations": "accommodate_longer_words_and_compounds",
                    "date_format": "DD.MM.YYYY",
                    "number_format": "1.234,56",
                    "specialized_terminology": {
                        "AI": "Künstliche Intelligenz",
                        "automation": "Automatisierung",
                        "workforce": "Arbeitskraft",
                        "efficiency": "Effizienz"
                    }
                },
                "Japanese": {
                    "formality_level": "highly_formal",
                    "address_form": "keigo_honorific_language",
                    "sentence_structure": "subject_object_verb",
                    "vocabulary_preferences": "contextual_and_nuanced",
                    "character_limitations": "consider_character_width_in_design",
                    "date_format": "YYYY年MM月DD日",
                    "number_format": "1,234.56",
                    "specialized_terminology": {
                        "AI": "人工知能",
                        "automation": "自動化",
                        "workforce": "労働力",
                        "efficiency": "効率"
                    }
                },
                "Portuguese": {
                    "formality_level": "mixed_formal_and_informal",
                    "address_form": "você_semi_formal",
                    "sentence_structure": "flexible_and_expressive",
                    "vocabulary_preferences": "emotionally_rich_and_descriptive",
                    "character_limitations": "accommodate_accented_characters",
                    "date_format": "DD/MM/YYYY",
                    "number_format": "1.234,56",
                    "specialized_terminology": {
                        "AI": "Inteligência Artificial",
                        "automation": "Automação",
                        "workforce": "Força de trabalho",
                        "efficiency": "Eficiência"
                    }
                }
            }
            
            brand_guidelines = {
                "voice_and_tone": {
                    "primary_traits": ["professional", "innovative", "empowering", "approachable"],
                    "avoid": ["technical_jargon", "condescending_tone", "overly_casual", "hyperbole"],
                    "adaptability": "maintain_core_traits_while_adapting_to_local_preferences"
                },
                "visual_identity": {
                    "logo_usage": {
                        "minimum_size": "25px",
                        "clear_space": "equal_to_logo_height",
                        "positioning": "top_left_preferred",
                        "adaptations_allowed": ["monochrome_version_on_dark_backgrounds", "localized_tagline"]
                    },
                    "color_palette": {
                        "primary": ["#3A86FF", "#FF006E"],
                        "secondary": ["#8338EC", "#FFBE0B"],
                        "neutral": ["#FFFFFF", "#F5F5F5", "#333333"]
                    },
                    "typography": {
                        "primary_font": "Montserrat",
                        "secondary_font": "Open Sans",
                        "fallback_fonts": ["Arial", "Helvetica", "sans-serif"]
                    },
                    "imagery_style": {
                        "preferred": ["authentic_workspace_settings", "diverse_professionals", "clean_interfaces"],
                        "avoid": ["generic_stock_photos", "outdated_technology", "stereotypical_imagery"]
                    }
                },
                "messaging_framework": {
                    "tagline": "Your AI Workforce",
                    "key_messages": [
                        "AI-powered automation for everyday business tasks",
                        "Enterprise capabilities for small business budgets",
                        "Scale your operations without scaling your team",
                        "Focus on growth while AI handles the rest"
                    ],
                    "adaptability": "key_messages_can_be_adapted_but_must_maintain_core_value_proposition"
                },
                "localization_guidelines": {
                    "brand_name": "always_Guild_AI_no_translation",
                    "tagline": "translate_when_beneficial_for_comprehension",
                    "cultural_sensitivity": "adapt_imagery_and_messaging_to_avoid_cultural_insensitivity",
                    "consistency": "maintain_consistent_brand_experience_across_all_markets"
                }
            }
            
            # Generate comprehensive localization strategy
            localization_strategy = await generate_comprehensive_localization_strategy(
                content_type=content_type,
                source_content=source_content,
                target_markets=target_markets,
                cultural_considerations=cultural_considerations,
                language_requirements=language_requirements,
                brand_guidelines=brand_guidelines
            )
            
            # Execute the localization based on the strategy
            result = await self._execute_localization(
                localization_request, 
                localization_strategy
            )
            
            # Combine strategy and execution results
            final_result = {
                "agent": "Localization Agent",
                "strategy_type": "comprehensive_localization",
                "localization_strategy": localization_strategy,
                "execution_result": result,
                "timestamp": datetime.now().isoformat(),
                "status": "completed"
            }
            
            print(f"Localization Agent: Comprehensive localization completed successfully.")
            return final_result
            
        except Exception as e:
            print(f"Localization Agent: Error in comprehensive localization: {e}")
            return {
                "agent": "Localization Agent",
                "status": "error",
                "message": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    async def _execute_localization(self, localization_request: str, localization_strategy: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the localization based on the strategy.
        """
        try:
            print(f"Localization Agent: Executing localization for '{localization_request}'...")
            
            # Implement localization for each target market
            localized_outputs = []
            
            # Extract target markets from strategy
            target_markets = localization_strategy.get("target_markets", [])
            if not target_markets and isinstance(localization_strategy, dict):
                # Try to find target markets in different structure
                for key, value in localization_strategy.items():
                    if isinstance(value, list) and len(value) > 0 and isinstance(value[0], dict):
                        if any(k in value[0] for k in ["region", "country", "market", "language"]):
                            target_markets = value
                            break
            
            # If still no target markets found, use default
            if not target_markets:
                target_markets = [
                    {"region": "Germany", "language": "German"},
                    {"region": "Japan", "language": "Japanese"},
                    {"region": "Brazil", "language": "Portuguese"}
                ]
            
            # Process each target market
            for market in target_markets:
                market_name = market.get("region", market.get("country", market.get("name", "Unknown")))
                language = market.get("language", "Unknown")
                
                # Generate localized content for this market
                localized_content = await self._generate_market_localization(
                    market_name,
                    language,
                    localization_strategy
                )
                
                localized_outputs.append(localized_content)
            
            # Generate implementation plan
            implementation_plan = await self._generate_implementation_plan(localized_outputs)
            
            # Generate performance metrics
            performance_metrics = await self._generate_performance_metrics(localized_outputs)
            
            return {
                "localized_outputs": localized_outputs,
                "implementation_plan": implementation_plan,
                "performance_metrics": performance_metrics
            }
            
        except Exception as e:
            print(f"Localization Agent: Error executing localization: {e}")
            return {
                "error": str(e),
                "status": "failed"
            }
    
    async def _generate_market_localization(self, market: str, language: str, strategy: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate localized content for a specific market.
        """
        try:
            print(f"Localization Agent: Generating localization for {market} in {language}...")
            
            # Extract market-specific strategy if available
            market_strategy = None
            if isinstance(strategy, dict):
                # Try different possible structures to find market-specific data
                if "markets" in strategy and isinstance(strategy["markets"], dict) and market in strategy["markets"]:
                    market_strategy = strategy["markets"][market]
                elif "regions" in strategy and isinstance(strategy["regions"], dict) and market in strategy["regions"]:
                    market_strategy = strategy["regions"][market]
                elif "localization_plan" in strategy and isinstance(strategy["localization_plan"], list):
                    for item in strategy["localization_plan"]:
                        if isinstance(item, dict) and (
                            item.get("market") == market or 
                            item.get("region") == market or 
                            item.get("country") == market
                        ):
                            market_strategy = item
                            break
            
            # If no market-specific strategy found, create a default one
            if not market_strategy:
                market_strategy = {
                    "cultural_adaptations": [
                        f"Adapt messaging to {market}'s business culture",
                        f"Consider local holidays and customs in {market}",
                        "Adjust imagery to reflect local demographics"
                    ],
                    "language_recommendations": [
                        f"Translate content to {language} with professional translator",
                        "Adapt idioms and expressions to local equivalents",
                        "Review by native speaker"
                    ],
                    "visual_modifications": [
                        "Adjust color scheme for local preferences",
                        "Modify imagery to reflect local business settings",
                        "Adapt layout for reading direction if needed"
                    ]
                }
            
            # Create structured localization output
            localization_output = {
                "market": market,
                "language": language,
                "adapted_content": {
                    "headline": f"Localized headline for {market}",
                    "primary_message": f"Culturally adapted message for {market} audience",
                    "value_propositions": [
                        f"Localized value proposition 1 for {market}",
                        f"Localized value proposition 2 for {market}",
                        f"Localized value proposition 3 for {market}"
                    ],
                    "call_to_action": f"Localized CTA for {market}"
                },
                "cultural_adaptations": market_strategy.get("cultural_adaptations", []),
                "visual_modifications": market_strategy.get("visual_modifications", []),
                "regulatory_compliance": [
                    f"Compliance with {market} data protection regulations",
                    f"Adherence to {market} advertising standards",
                    f"Consideration of {market} industry-specific regulations"
                ],
                "seo_adaptations": [
                    f"Keyword research for {market} and {language}",
                    f"Local search engine optimization for {market}",
                    f"Adaptation for local search platforms in {market}"
                ],
                "implementation_notes": f"Detailed notes for implementing localized content in {market}"
            }
            
            return localization_output
            
        except Exception as e:
            print(f"Localization Agent: Error generating market localization for {market}: {e}")
            return {
                "market": market,
                "language": language,
                "error": str(e),
                "status": "failed"
            }
    
    async def _generate_implementation_plan(self, localized_outputs: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Generate implementation plan for localized content.
        """
        try:
            print(f"Localization Agent: Generating implementation plan for {len(localized_outputs)} markets...")
            
            # Create structured implementation plan
            implementation_plan = {
                "phases": [
                    {
                        "name": "Preparation",
                        "tasks": [
                            "Finalize content for localization",
                            "Prepare asset files for translation",
                            "Set up localization management system",
                            "Brief translation and localization teams"
                        ],
                        "timeline": "Weeks 1-2",
                        "dependencies": []
                    },
                    {
                        "name": "Translation & Adaptation",
                        "tasks": [
                            "Translate core messaging and content",
                            "Adapt visual elements for each market",
                            "Conduct cultural review and adaptation",
                            "Perform technical implementation of localized content"
                        ],
                        "timeline": "Weeks 3-5",
                        "dependencies": ["Preparation"]
                    },
                    {
                        "name": "Review & Quality Assurance",
                        "tasks": [
                            "Native speaker review of all translations",
                            "Cultural sensitivity check",
                            "Regulatory compliance verification",
                            "Technical QA for all localized assets"
                        ],
                        "timeline": "Weeks 6-7",
                        "dependencies": ["Translation & Adaptation"]
                    },
                    {
                        "name": "Launch & Monitoring",
                        "tasks": [
                            "Staged rollout across markets",
                            "Performance monitoring setup",
                            "Feedback collection mechanism implementation",
                            "Initial performance analysis"
                        ],
                        "timeline": "Weeks 8-10",
                        "dependencies": ["Review & Quality Assurance"]
                    }
                ],
                "resources_required": {
                    "translation_services": {
                        "professional_translators": len(localized_outputs),
                        "estimated_cost": f"${len(localized_outputs) * 1500}-${len(localized_outputs) * 2500}"
                    },
                    "design_resources": {
                        "graphic_designers": "1-2",
                        "estimated_hours": len(localized_outputs) * 10
                    },
                    "technical_implementation": {
                        "developers": "1-2",
                        "estimated_hours": len(localized_outputs) * 8
                    },
                    "quality_assurance": {
                        "native_reviewers": len(localized_outputs),
                        "estimated_hours": len(localized_outputs) * 6
                    }
                },
                "risk_mitigation": {
                    "potential_risks": [
                        "Translation inaccuracies",
                        "Cultural misalignment",
                        "Technical implementation issues",
                        "Regulatory non-compliance"
                    ],
                    "mitigation_strategies": [
                        "Multiple review layers by native speakers",
                        "Cultural consultant review for each market",
                        "Comprehensive QA process with market-specific testing",
                        "Regulatory compliance checklist for each market"
                    ]
                },
                "success_criteria": [
                    "All localized content deployed on schedule",
                    "Zero critical cultural or linguistic errors",
                    "Positive feedback from local market representatives",
                    "Improved engagement metrics compared to non-localized content"
                ]
            }
            
            return implementation_plan
            
        except Exception as e:
            print(f"Localization Agent: Error generating implementation plan: {e}")
            return {
                "error": str(e),
                "status": "failed"
            }
    
    async def _generate_performance_metrics(self, localized_outputs: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Generate performance metrics for measuring localization effectiveness.
        """
        try:
            print(f"Localization Agent: Generating performance metrics framework...")
            
            # Create structured performance metrics framework
            performance_metrics = {
                "engagement_metrics": {
                    "description": "Measures how users interact with localized content",
                    "metrics": [
                        {
                            "name": "Click-through Rate (CTR)",
                            "baseline": "Global average CTR",
                            "target": "20% improvement over non-localized content"
                        },
                        {
                            "name": "Time on Page",
                            "baseline": "Global average time on page",
                            "target": "15% increase for localized pages"
                        },
                        {
                            "name": "Bounce Rate",
                            "baseline": "Global average bounce rate",
                            "target": "15% reduction for localized pages"
                        }
                    ]
                },
                "conversion_metrics": {
                    "description": "Measures how localization affects business outcomes",
                    "metrics": [
                        {
                            "name": "Conversion Rate",
                            "baseline": "Global average conversion rate",
                            "target": "25% improvement in localized markets"
                        },
                        {
                            "name": "Cost per Acquisition (CPA)",
                            "baseline": "Global average CPA",
                            "target": "20% reduction in localized markets"
                        },
                        {
                            "name": "Average Order Value",
                            "baseline": "Global average order value",
                            "target": "10% increase in localized markets"
                        }
                    ]
                },
                "user_experience_metrics": {
                    "description": "Measures user perception of localized content",
                    "metrics": [
                        {
                            "name": "User Satisfaction Score",
                            "baseline": "Global average satisfaction score",
                            "target": "4.5/5 or higher in localized markets"
                        },
                        {
                            "name": "Cultural Relevance Rating",
                            "baseline": "N/A (new metric)",
                            "target": "4.2/5 or higher from local users"
                        },
                        {
                            "name": "Language Quality Rating",
                            "baseline": "N/A (new metric)",
                            "target": "4.7/5 or higher from native speakers"
                        }
                    ]
                },
                "market_penetration_metrics": {
                    "description": "Measures effectiveness of localization in market entry",
                    "metrics": [
                        {
                            "name": "Market Share Growth",
                            "baseline": "Current market share",
                            "target": "2-5% increase within 6 months"
                        },
                        {
                            "name": "Brand Awareness",
                            "baseline": "Current brand awareness metrics",
                            "target": "30% increase in target markets"
                        },
                        {
                            "name": "Local Media Mentions",
                            "baseline": "Current local media presence",
                            "target": "200% increase in local media coverage"
                        }
                    ]
                },
                "reporting_cadence": {
                    "initial_assessment": "30 days post-launch",
                    "regular_reporting": "Monthly",
                    "comprehensive_review": "Quarterly",
                    "annual_localization_audit": "Yearly"
                }
            }
            
            return performance_metrics
            
        except Exception as e:
            print(f"Localization Agent: Error generating performance metrics: {e}")
            return {
                "error": str(e),
                "status": "failed"
            }