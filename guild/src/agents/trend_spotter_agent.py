"""
Trend Spotter Agent for Guild-AI
Comprehensive trend detection and insight generation using advanced prompting strategies.
"""

from guild.src.core.llm_client import LlmClient
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime, timedelta
from guild.src.core.agent_helpers import inject_knowledge
import asyncio
import json


@dataclass
class TrendSignal:
    """Represents a detected trend signal from a source."""
    source: str
    category: str
    signal: str
    strength: float
    recency_days: int
    region: Optional[str]
    link: Optional[str]


@dataclass
class TrendInsight:
    """Represents an actionable insight derived from trend signals."""
    theme: str
    summary: str
    implications: List[str]
    opportunities: List[str]
    risks: List[str]
    confidence: float


@inject_knowledge
async def generate_comprehensive_trend_strategy(
    focus_domains: List[str],
    data_sources: Dict[str, Any],
    time_windows: Dict[str, Any],
    geographic_focus: List[str],
    business_objectives: Dict[str, Any],
    risk_tolerance: str
) -> Dict[str, Any]:
    """
    Generates a comprehensive trend detection and analysis strategy.
    """
    print("Trend Spotter Agent: Generating comprehensive trend strategy with injected knowledge...")

    prompt = f"""
# Trend Spotter Agent - Comprehensive Market & Cultural Trend Detection

## Role Definition
You are the **Trend Spotter Agent**, an expert in detecting emerging market, cultural, and technology trends. Your role is to synthesize weak signals from multiple data sources, group them into coherent themes, and produce actionable insights with confidence scoring and clear business implications.

## Core Expertise
- Weak-signal detection and noise filtering
- Cross-source corroboration and triangulation
- Theme clustering and sense-making
- Leading vs. lagging indicator identification
- Early opportunity mapping and risk scanning
- Forecasting trajectories and scenario hints

## Context
- Focus Domains: {json.dumps(focus_domains)}
- Data Sources: {json.dumps(data_sources, indent=2)}
- Time Windows: {json.dumps(time_windows, indent=2)}
- Geographic Focus: {json.dumps(geographic_focus)}
- Business Objectives: {json.dumps(business_objectives, indent=2)}
- Risk Tolerance: {risk_tolerance}

## Tasks
1) Collect and normalize signals from sources (social, news, industry reports, GitHub, app stores).
2) Score signals by strength, recency, relevance, and corroboration.
3) Cluster signals into themes and label with concise names.
4) Derive implications, opportunities, and risks per theme.
5) Propose experiments and leading indicators to watch.
6) Produce an actionable briefing and roadmap.

## Constraints
- Prefer corroborated signals over isolated anecdotes.
- Distinguish fads from durable shifts; justify with indicators.
- Provide confidence scores with rationale.
- Keep recommendations practical for a lean team.

## Output JSON Shape
{{
  "signals": [{{"source":"", "category":"", "signal":"", "strength":0.0, "recency_days":0, "region":"", "link":""}}],
  "themes": [{{
     "name":"",
     "summary":"",
     "supporting_signals":[int],
     "confidence":0.0,
     "leading_indicators":[""],
     "lagging_indicators":[""],
     "time_horizon":"near|mid|long"
  }}],
  "insights": [{{
     "theme":"",
     "implications":[""],
     "opportunities":[""],
     "risks":[""],
     "recommended_experiments":[""],
     "confidence":0.0
  }}],
  "roadmap": {{
     "immediate":[""],
     "next_30_days":[""],
     "next_quarter":[""],
     "owners":{{"research":"", "marketing":"", "product":""}}
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
            print("Trend Spotter Agent: Successfully generated trend strategy.")
            return strategy
        except json.JSONDecodeError as e:
            print(f"Trend Spotter Agent: JSON parse error: {e}")
            # Fallback minimal structured result
            return {
                "signals": [],
                "themes": [],
                "insights": [],
                "roadmap": {
                    "immediate": ["Establish data source connectors", "Define scoring rubric"],
                    "next_30_days": ["Run weekly synthesis", "Pilot two experiments"],
                    "next_quarter": ["Publish trend brief", "Integrate into planning"],
                    "owners": {"research": "trend_spotter", "marketing": "content_strategist", "product": "product_manager"}
                }
            }
    except Exception as e:
        print(f"Trend Spotter Agent: Execution error: {e}")
        return {
            "error": str(e),
            "signals": [],
            "themes": [],
            "insights": [],
            "roadmap": {
                "immediate": ["Bootstrap data collection"],
                "owners": {"research": "trend_spotter"}
            }
        }


class TrendSpotterAgent:
    """
    Trend Spotter Agent - Detects and synthesizes emerging trends into actionable insights.
    """

    def __init__(self, user_input: Optional[str] = None):
        self.user_input = user_input
        self.agent_name = "Trend Spotter Agent"
        self.agent_type = "Creative & Media"
        self.capabilities = [
            "Weak-signal detection",
            "Cross-source triangulation",
            "Theme clustering",
            "Opportunity mapping",
            "Risk scanning",
            "Indicator framework design"
        ]
        self.signal_library: List[TrendSignal] = []
        self.insight_library: List[TrendInsight] = []
        from guild.src.models.llm import Llm
        self.llm_client = LlmClient(Llm(provider="ollama", model="tinyllama"))

    async def run(self, user_input: Optional[str] = None) -> Dict[str, Any]:
        try:
            print("Trend Spotter Agent: Starting comprehensive trend spotting...")

            focus_domains = ["AI workforce", "automation", "SMB productivity"]
            data_sources = {
                "social": ["X/Twitter", "LinkedIn"],
                "news": ["TechCrunch", "Bloomberg", "The Verge"],
                "dev": ["GitHub trending", "Hugging Face models"],
                "app": ["Product Hunt", "G2"],
                "reports": ["Gartner", "McKinsey", "CBInsights"]
            }
            time_windows = {"lookback_days": 45, "aggregation": "weekly"}
            geographic_focus = ["US", "EU", "APAC"]
            business_objectives = {"goals": ["content_strategy", "product_roadmap", "positioning"]}
            risk_tolerance = "moderate"

            strategy = await generate_comprehensive_trend_strategy(
                focus_domains=focus_domains,
                data_sources=data_sources,
                time_windows=time_windows,
                geographic_focus=geographic_focus,
                business_objectives=business_objectives,
                risk_tolerance=risk_tolerance
            )

            execution = await self._execute_trend_workflow(strategy)

            result = {
                "agent": self.agent_name,
                "strategy_type": "comprehensive_trend_detection",
                "trend_strategy": strategy,
                "execution_result": execution,
                "timestamp": datetime.now().isoformat(),
                "status": "completed"
            }
            print("Trend Spotter Agent: Completed.")
            return result
        except Exception as e:
            print(f"Trend Spotter Agent: Error: {e}")
            return {
                "agent": self.agent_name,
                "status": "error",
                "message": str(e),
                "timestamp": datetime.now().isoformat()
            }

    async def _execute_trend_workflow(self, strategy: Dict[str, Any]) -> Dict[str, Any]:
        try:
            signals = await self._normalize_and_score_signals(strategy.get("signals", []))
            themes = await self._cluster_themes(strategy.get("themes", []), signals)
            insights = await self._derive_insights(themes, signals)
            roadmap = await self._build_roadmap(strategy.get("roadmap", {}), insights)
            return {
                "signals": [s.__dict__ for s in signals],
                "themes": themes,
                "insights": [i.__dict__ for i in insights],
                "roadmap": roadmap
            }
        except Exception as e:
            print(f"Trend Spotter Agent: Workflow error: {e}")
            return {
                "signals": [],
                "themes": [],
                "insights": [],
                "roadmap": {"immediate": ["Collect baseline signals"]},
                "error": str(e)
            }

    async def _normalize_and_score_signals(self, raw_signals: List[Dict[str, Any]]) -> List[TrendSignal]:
        normalized: List[TrendSignal] = []
        try:
            for sig in raw_signals:
                strength = float(sig.get("strength", 0))
                recency = int(sig.get("recency_days", 30))
                source = str(sig.get("source", "unknown"))
                category = str(sig.get("category", "general"))
                region = sig.get("region")
                link = sig.get("link")
                # Simple normalization and minimal filtering
                if strength < 0:
                    strength = 0.0
                if recency < 0:
                    recency = 0
                normalized.append(TrendSignal(
                    source=source,
                    category=category,
                    signal=str(sig.get("signal", "")),
                    strength=strength,
                    recency_days=recency,
                    region=region,
                    link=link
                ))
            # Sort by composite: strength high, recency low
            normalized.sort(key=lambda s: (-s.strength, s.recency_days))
            return normalized
        except Exception as e:
            print(f"Trend Spotter Agent: Normalize error: {e}")
            return []

    async def _cluster_themes(self, theme_specs: List[Dict[str, Any]], signals: List[TrendSignal]) -> List[Dict[str, Any]]:
        try:
            # If themes provided, respect; else derive naive clusters by category
            if theme_specs:
                return theme_specs
            clusters: Dict[str, Dict[str, Any]] = {}
            for idx, sig in enumerate(signals):
                key = sig.category
                if key not in clusters:
                    clusters[key] = {
                        "name": key,
                        "summary": f"Emerging activity in {key}",
                        "supporting_signals": [],
                        "confidence": 0.5,
                        "leading_indicators": [],
                        "lagging_indicators": [],
                        "time_horizon": "near"
                    }
                clusters[key]["supporting_signals"].append(idx)
                # Heuristic confidence boost with corroboration
                clusters[key]["confidence"] = min(0.95, 0.35 + 0.1 * len(clusters[key]["supporting_signals"]))
            return list(clusters.values())
        except Exception as e:
            print(f"Trend Spotter Agent: Cluster error: {e}")
            return []

    async def _derive_insights(self, themes: List[Dict[str, Any]], signals: List[TrendSignal]) -> List[TrendInsight]:
        insights: List[TrendInsight] = []
        try:
            for theme in themes:
                name = theme.get("name", "unnamed_theme")
                implications = [
                    f"Allocate research to {name}",
                    f"Monitor competitive moves in {name}",
                    f"Consider MVP experiments related to {name}"
                ]
                opportunities = [
                    f"Position Guild-AI as early mover in {name}",
                    f"Create content series about {name} use-cases"
                ]
                risks = [
                    f"Hype risk in {name}; validate with data",
                    f"Resource diversion if {name} fades"
                ]
                confidence = float(theme.get("confidence", 0.5))
                insights.append(TrendInsight(
                    theme=name,
                    summary=theme.get("summary", f"Activity detected around {name}"),
                    implications=implications,
                    opportunities=opportunities,
                    risks=risks,
                    confidence=confidence
                ))
            return insights
        except Exception as e:
            print(f"Trend Spotter Agent: Insight error: {e}")
            return []

    async def _build_roadmap(self, roadmap_seed: Dict[str, Any], insights: List[TrendInsight]) -> Dict[str, Any]:
        try:
            immediate = roadmap_seed.get("immediate", ["Set up dashboards", "Define KPIs"])
            next_30 = roadmap_seed.get("next_30_days", ["Publish trend brief", "Run 2 experiments"])
            next_q = roadmap_seed.get("next_quarter", ["Incorporate trends into roadmap", "Evaluate ROI"])
            owners = roadmap_seed.get("owners", {"research": "trend_spotter", "marketing": "content_strategist", "product": "product_manager"})
            # Add top insight themes to immediate tasks
            top_themes = [i.theme for i in insights[:3]]
            if top_themes:
                immediate.append(f"Deep-dive analysis: {', '.join(top_themes)}")
            return {
                "immediate": immediate,
                "next_30_days": next_30,
                "next_quarter": next_q,
                "owners": owners
            }
        except Exception as e:
            print(f"Trend Spotter Agent: Roadmap error: {e}")
            return {
                "immediate": ["Set up basic monitoring"],
                "owners": {"research": "trend_spotter"},
                "error": str(e)
            }
