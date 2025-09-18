"""
Competitive Intelligence Agent for Guild-AI
Comprehensive competitor landscape analysis using advanced prompting strategies.
"""

from guild.src.core.llm_client import LlmClient
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime
from guild.src.core.agent_helpers import inject_knowledge
import asyncio
import json


@dataclass
class CompetitorProfile:
    """Structured competitor profile."""
    name: str
    category: str
    website: Optional[str]
    pricing_model: Optional[str]
    target_segments: List[str]
    key_features: List[str]
    differentiators: List[str]
    weaknesses: List[str]
    traction_signals: Dict[str, Any]


@dataclass
class FeatureComparison:
    """Normalized feature comparison entry."""
    feature: str
    guild_ai: str
    competitor: str
    parity: str  # ahead | behind | at_par


@dataclass
class CIInsight:
    """Actionable competitive insight."""
    theme: str
    implication: str
    recommended_actions: List[str]
    confidence: float


@inject_knowledge
async def generate_comprehensive_competitive_intelligence_strategy(
    target_market: Dict[str, Any],
    known_competitors: List[str],
    value_proposition: Dict[str, Any],
    product_capabilities: Dict[str, Any],
    pricing_context: Dict[str, Any],
    go_to_market: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Generates a comprehensive competitive intelligence strategy using advanced prompting.
    """
    print("Competitive Intelligence Agent: Generating comprehensive CI strategy with injected knowledge...")

    prompt = f"""
# Competitive Intelligence Agent - Comprehensive Competitor Landscape Analysis

## Role Definition
You are the **Competitive Intelligence Agent**, an expert in competitor research, differentiation mapping, and strategic counter-move planning. Your role is to synthesize public signals, product claims, pricing models, positioning, and traction indicators into a clear landscape view with actionable insights for product, marketing, and sales.

## Core Expertise
- Competitor discovery and profiling
- Differentiation mapping and value curves
- Pricing and packaging analysis
- Feature parity and roadmap implications
- Sales battlecards and objection handling
- Risk/opportunity assessment and counter-strategy

## Context
- Target Market: {json.dumps(target_market, indent=2)}
- Known Competitors: {json.dumps(known_competitors, indent=2)}
- Value Proposition: {json.dumps(value_proposition, indent=2)}
- Product Capabilities: {json.dumps(product_capabilities, indent=2)}
- Pricing Context: {json.dumps(pricing_context, indent=2)}
- Go-To-Market: {json.dumps(go_to_market, indent=2)}

## Tasks
1) Build/update competitor list, categorize by segment and motion.
2) Create profiles: positioning, ICP, pricing, features, differentiators, traction.
3) Construct feature parity matrix and value curve analysis.
4) Produce pricing/packaging comparison and discount patterns.
5) Draft sales battlecards with strengths/weaknesses and proof points.
6) Identify risks, opportunities, and propose counter-moves.

## Constraints
- Use only public, ethical sources; clearly label assumptions.
- Score confidence for each key claim.
- Prioritize insights that are actionable within 1-2 quarters.

## Output JSON
{{
  "competitor_list": [""],
  "profiles": {{"<competitor>": {{
      "category":"", "positioning":"", "website":"",
      "target_segments":[], "pricing_model":"",
      "key_features":[], "differentiators":[], "weaknesses":[],
      "traction_signals":{{"web_traffic":"", "social_followers":"", "announcements":[]}},
      "confidence": 0.0
  }}}},
  "feature_matrix": [{{"feature":"", "guild_ai":"", "<competitor>":"", "parity":""}}],
  "pricing_comparison": [{{"plan":"", "guild_ai":"", "<competitor>":""}}],
  "value_curves": [{{"dimension":"", "guild_ai":0, "<competitor>":0}}],
  "battlecards": [{{
      "competitor":"",
      "when_we_win":"",
      "when_they_win":"",
      "landmines":[""],
      "objection_handling":{{"price":"","features":"","security":""}},
      "proof_points":[""],
      "confidence":0.0
  }}],
  "risks_opportunities": {{
      "risks":[""],
      "opportunities":[""],
      "counter_moves":[""],
      "priority_actions":[""],
      "success_metrics":[""],
      "confidence":0.0
  }}
}}
Return only JSON.
"""

    try:
        from guild.src.models.llm import Llm
        client = LlmClient(Llm(provider="ollama", model="tinyllama"))
        response = await client.chat(prompt)
        try:
            strategy = json.loads(response)
            print("Competitive Intelligence Agent: Successfully generated CI strategy.")
            return strategy
        except json.JSONDecodeError as e:
            print(f"Competitive Intelligence Agent: JSON parse error: {e}")
            # Robust fallback with structured defaults
            return {
                "competitor_list": known_competitors,
                "profiles": {},
                "feature_matrix": [],
                "pricing_comparison": [],
                "value_curves": [],
                "battlecards": [],
                "risks_opportunities": {
                    "risks": ["Feature parity on core automation"],
                    "opportunities": ["SMB-focused AI workforce narrative"],
                    "counter_moves": ["Emphasize multi-agent orchestration and TCO"],
                    "priority_actions": ["Publish comparison pages", "Enable sales with battlecards"],
                    "success_metrics": ["Win rate vs. X", "Inbound vs. competitor terms"],
                    "confidence": 0.6
                }
            }
    except Exception as e:
        print(f"Competitive Intelligence Agent: Execution error: {e}")
        return {
            "error": str(e),
            "competitor_list": known_competitors,
            "profiles": {},
            "feature_matrix": [],
            "pricing_comparison": [],
            "value_curves": [],
            "battlecards": []
        }


class CompetitiveIntelligenceAgent:
    """
    Competitive Intelligence Agent - Profiles competitors, compares capabilities, and produces actionable insights.
    """

    def __init__(self, user_input: Optional[str] = None):
        self.user_input = user_input
        self.agent_name = "Competitive Intelligence Agent"
        self.agent_type = "Research & Intelligence"
        self.capabilities = [
            "Competitor profiling",
            "Feature parity analysis",
            "Pricing & packaging comparison",
            "Differentiation mapping",
            "Sales battlecards",
            "Counter-move strategy"
        ]
        self.profiles: Dict[str, CompetitorProfile] = {}
        self.insights: List[CIInsight] = []
        from guild.src.models.llm import Llm
        self.llm_client = LlmClient(Llm(provider="ollama", model="tinyllama"))

    async def run(self, user_input: Optional[str] = None) -> Dict[str, Any]:
        try:
            print("Competitive Intelligence Agent: Starting comprehensive CI analysis...")

            target_market = {
                "category": "AI workforce / automation",
                "segments": ["solopreneurs", "SMBs", "agencies"],
                "buying_criteria": ["time_savings", "ease_of-use", "integration breadth", "price"]
            }
            known_competitors = ["Zapier", "Make.com", "UiPath", "ClickUp Automations"]
            value_proposition = {
                "tagline": "Your AI Workforce",
                "pillars": ["multi-agent orchestration", "visual automation", "document & media ops"],
                "proof": ["time saved/week", "case studies"]
            }
            product_capabilities = {
                "core": ["multi_agent_workflows", "visual_automation", "doc_processing", "creative_generation"],
                "integrations": ["Slack", "Gmail", "Sheets", "Zapier interoperability"],
                "security": ["SSO (roadmap)", "role-based permissions (beta)"]
            }
            pricing_context = {
                "guild_ai": {"model": "tiered", "starter": "$29", "pro": "$79", "business": "$199"},
                "signals": ["competitor discounts", "annual incentives"]
            }
            go_to_market = {"motions": ["self_serve", "PLG"], "channels": ["content", "community", "referrals"]}

            strategy = await generate_comprehensive_competitive_intelligence_strategy(
                target_market=target_market,
                known_competitors=known_competitors,
                value_proposition=value_proposition,
                product_capabilities=product_capabilities,
                pricing_context=pricing_context,
                go_to_market=go_to_market
            )

            execution = await self._execute_ci_workflow(strategy)

            result = {
                "agent": self.agent_name,
                "strategy_type": "comprehensive_competitive_intelligence",
                "ci_strategy": strategy,
                "execution_result": execution,
                "timestamp": datetime.now().isoformat(),
                "status": "completed"
            }
            print("Competitive Intelligence Agent: Completed.")
            return result
        except Exception as e:
            print(f"Competitive Intelligence Agent: Error: {e}")
            return {
                "agent": self.agent_name,
                "status": "error",
                "message": str(e),
                "timestamp": datetime.now().isoformat()
            }

    async def _execute_ci_workflow(self, strategy: Dict[str, Any]) -> Dict[str, Any]:
        try:
            profiles = await self._build_profiles(strategy.get("profiles", {}))
            feature_matrix = await self._build_feature_matrix(strategy.get("feature_matrix", []))
            pricing_comparison = await self._build_pricing_comparison(strategy.get("pricing_comparison", []))
            battlecards = await self._build_battlecards(strategy.get("battlecards", []), profiles)
            risks_ops = await self._build_risks_opportunities(strategy.get("risks_opportunities", {}))
            insights = await self._derive_ci_insights(profiles, feature_matrix, pricing_comparison, risks_ops)

            return {
                "profiles": {k: v.__dict__ for k, v in profiles.items()},
                "feature_matrix": feature_matrix,
                "pricing_comparison": pricing_comparison,
                "battlecards": battlecards,
                "risks_opportunities": risks_ops,
                "insights": [i.__dict__ for i in insights]
            }
        except Exception as e:
            print(f"Competitive Intelligence Agent: Workflow error: {e}")
            return {
                "profiles": {},
                "feature_matrix": [],
                "pricing_comparison": [],
                "battlecards": [],
                "risks_opportunities": {},
                "insights": [],
                "error": str(e)
            }

    async def _build_profiles(self, raw_profiles: Dict[str, Dict[str, Any]]) -> Dict[str, CompetitorProfile]:
        try:
            profiles: Dict[str, CompetitorProfile] = {}
            if not raw_profiles:
                # Minimal defaults when strategy lacked details
                defaults = {
                    "Zapier": {
                        "category": "automation", "website": "https://zapier.com",
                        "pricing_model": "tiered", "target_segments": ["SMB", "prosumers"],
                        "key_features": ["zaps", "wide integrations"],
                        "differentiators": ["ecosystem size"],
                        "weaknesses": ["limited AI agent orchestration"],
                        "traction_signals": {"social_followers": "large"}
                    },
                    "Make.com": {
                        "category": "automation", "website": "https://www.make.com",
                        "pricing_model": "tiered", "target_segments": ["SMB", "ops"],
                        "key_features": ["visual builder", "scenarios"],
                        "differentiators": ["visual UX"],
                        "weaknesses": ["AI-native workflows limited"],
                        "traction_signals": {"social_followers": "growing"}
                    }
                }
                raw_profiles = defaults

            for name, p in raw_profiles.items():
                profiles[name] = CompetitorProfile(
                    name=name,
                    category=str(p.get("category", "unknown")),
                    website=p.get("website"),
                    pricing_model=p.get("pricing_model"),
                    target_segments=p.get("target_segments", []),
                    key_features=p.get("key_features", []),
                    differentiators=p.get("differentiators", []),
                    weaknesses=p.get("weaknesses", []),
                    traction_signals=p.get("traction_signals", {})
                )
            return profiles
        except Exception as e:
            print(f"Competitive Intelligence Agent: Profiles error: {e}")
            return {}

    async def _build_feature_matrix(self, raw_matrix: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        try:
            if not raw_matrix:
                return [
                    {"feature": "multi_agent_orchestration", "guild_ai": "native", "Zapier": "n/a", "parity": "ahead"},
                    {"feature": "visual_automation", "guild_ai": "native", "Make.com": "native", "parity": "at_par"},
                    {"feature": "doc_processing", "guild_ai": "native", "Zapier": "add-on", "parity": "ahead"}
                ]
            # Ensure parity field exists
            for row in raw_matrix:
                if "parity" not in row:
                    row["parity"] = "at_par"
            return raw_matrix
        except Exception as e:
            print(f"Competitive Intelligence Agent: Feature matrix error: {e}")
            return []

    async def _build_pricing_comparison(self, raw: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        try:
            if not raw:
                return [
                    {"plan": "starter", "guild_ai": "$29", "Zapier": "$19"},
                    {"plan": "pro", "guild_ai": "$79", "Make.com": "$36"},
                    {"plan": "business", "guild_ai": "$199", "UiPath": "custom"}
                ]
            return raw
        except Exception as e:
            print(f"Competitive Intelligence Agent: Pricing comparison error: {e}")
            return []

    async def _build_battlecards(self, cards: List[Dict[str, Any]], profiles: Dict[str, CompetitorProfile]) -> List[Dict[str, Any]]:
        try:
            if cards:
                return cards
            # Defaults
            defaults = []
            for name, prof in profiles.items():
                defaults.append({
                    "competitor": name,
                    "when_we_win": "When AI-native workflows and orchestration matter",
                    "when_they_win": "When basic point-to-point integrations suffice",
                    "landmines": ["Ask about multi-agent coordination", "Ask about doc+media ops"],
                    "objection_handling": {
                        "price": "Total cost of ownership lower with built-in AI",
                        "features": "Show agent workflows and visual automation demos",
                        "security": "Roadmap for SSO and RBAC; current controls documented"
                    },
                    "proof_points": ["Time saved/week", "Case studies"],
                    "confidence": 0.7
                })
            return defaults
        except Exception as e:
            print(f"Competitive Intelligence Agent: Battlecards error: {e}")
            return []

    async def _build_risks_opportunities(self, ro: Dict[str, Any]) -> Dict[str, Any]:
        try:
            if not ro:
                ro = {
                    "risks": ["Feature catch-up by incumbents", "Price wars"],
                    "opportunities": ["Own the 'AI workforce' category", "Vertical playbooks"],
                    "counter_moves": ["Publish transparent roadmap", "Category narrative marketing"],
                    "priority_actions": ["SEO comparison pages", "Sales enablement"],
                    "success_metrics": ["Win rate vs. list", "Share of voice"],
                    "confidence": 0.65
                }
            return ro
        except Exception as e:
            print(f"Competitive Intelligence Agent: Risks/opportunities error: {e}")
            return {"risks": [], "opportunities": [], "counter_moves": []}

    async def _derive_ci_insights(
        self,
        profiles: Dict[str, CompetitorProfile],
        feature_matrix: List[Dict[str, Any]],
        pricing: List[Dict[str, Any]],
        ro: Dict[str, Any]
    ) -> List[CIInsight]:
        insights: List[CIInsight] = []
        try:
            # Simple derived insight examples
            insights.append(CIInsight(
                theme="Own AI-native orchestration narrative",
                implication="Differentiate vs. traditional automation tools",
                recommended_actions=[
                    "Create comparison landing pages",
                    "Produce demo videos showing multi-agent value",
                    "Enable sales with objection handling"
                ],
                confidence=0.75
            ))
            if ro.get("opportunities"):
                insights.append(CIInsight(
                    theme="Verticalized playbooks",
                    implication="Faster adoption in focused segments",
                    recommended_actions=["Build 3 vertical templates", "Launch targeted campaigns"],
                    confidence=0.7
                ))
            return insights
        except Exception as e:
            print(f"Competitive Intelligence Agent: Insights error: {e}")
            return []
