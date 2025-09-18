"""
Market Trends Agent for Guild-AI
Comprehensive market trend analysis using advanced prompting strategies.
"""

from guild.src.core.llm_client import LlmClient
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime, timedelta
from guild.src.core.agent_helpers import inject_knowledge
import asyncio
import json


@dataclass
class TrendMetric:
    """Represents a quantified market trend metric."""
    name: str
    current_value: float
    prior_value: float
    period: str
    growth_rate: float
    confidence: float


@dataclass
class MarketSignal:
    """Represents a supporting market signal."""
    source: str
    category: str
    description: str
    recency_days: int
    strength: float
    link: Optional[str]


@dataclass
class MarketRecommendation:
    """Represents an actionable market recommendation."""
    theme: str
    action: str
    expected_impact: str
    effort: str
    timeframe: str
    confidence: float


@inject_knowledge
async def generate_comprehensive_market_trends_strategy(
    categories: List[str],
    segments: List[str],
    geographies: List[str],
    lookback_days: int,
    objectives: Dict[str, Any],
    constraints: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Generates a comprehensive market trends strategy using advanced prompting.
    """
    print("Market Trends Agent: Generating comprehensive market trends strategy with injected knowledge...")

    prompt = f"""
# Market Trends Agent - Comprehensive Market Movement Analysis

## Role Definition
You are the **Market Trends Agent**, an expert in identifying, quantifying, and interpreting market movements across categories, segments, and regions. Your role is to turn disparate indicators into clear trends, quantify trajectories, and recommend actions aligned to business objectives.

## Core Expertise
- Indicator selection and signal synthesis
- Quantification and growth-rate estimation
- Segmentation and geographic cuts
- Leading vs. lagging indicator mapping
- Forecasting and scenario framing
- Action-oriented recommendations

## Context
- Categories: {json.dumps(categories)}
- Segments: {json.dumps(segments)}
- Geographies: {json.dumps(geographies)}
- Lookback Days: {lookback_days}
- Objectives: {json.dumps(objectives, indent=2)}
- Constraints: {json.dumps(constraints, indent=2)}

## Tasks
1) Gather indicators (search interest, mentions, funding, hiring, product launches).
2) Normalize and compute growth rates over lookback vs. prior period.
3) Identify top themes and quantify confidence.
4) Produce segment and geo cuts where signal exists.
5) Recommend prioritized actions for product, marketing, and sales.

## Output JSON
{{
  "themes": [{{
    "name":"","summary":"","confidence":0.0,
    "metrics":[{{"name":"","current_value":0,"prior_value":0,"period":"","growth_rate":0,"confidence":0.0}}],
    "signals":[{{"source":"","category":"","description":"","recency_days":0,"strength":0,"link":""}}]
  }}],
  "segment_breakdown": {{"<segment>": ["theme_names"]}},
  "geo_breakdown": {{"<region>": ["theme_names"]}},
  "recommendations": [{{
    "theme":"","action":"","expected_impact":"","effort":"low|medium|high","timeframe":"now|30d|quarter","confidence":0.0
  }}]
}}
Return only JSON.
"""

    try:
        from guild.src.models.llm import Llm
        client = LlmClient(Llm(provider="ollama", model="tinyllama"))
        response = await client.chat(prompt)
        try:
            strategy = json.loads(response)
            print("Market Trends Agent: Successfully generated strategy.")
            return strategy
        except json.JSONDecodeError as e:
            print(f"Market Trends Agent: JSON parse error: {e}")
            # Robust fallback
            return {
                "themes": [],
                "segment_breakdown": {},
                "geo_breakdown": {},
                "recommendations": [
                    {
                        "theme": "Establish tracking",
                        "action": "Set up dashboards for indicators and weekly synthesis",
                        "expected_impact": "Foundation for trend-driven planning",
                        "effort": "low",
                        "timeframe": "now",
                        "confidence": 0.8
                    }
                ]
            }
    except Exception as e:
        print(f"Market Trends Agent: Execution error: {e}")
        return {
            "themes": [],
            "segment_breakdown": {},
            "geo_breakdown": {},
            "recommendations": [],
            "error": str(e)
        }


class MarketTrendsAgent:
    """
    Market Trends Agent - Quantifies and interprets market movements into actionable guidance.
    """

    def __init__(self, user_input: Optional[str] = None):
        self.user_input = user_input
        self.agent_name = "Market Trends Agent"
        self.agent_type = "Research & Intelligence"
        self.capabilities = [
            "Indicator synthesis",
            "Trend quantification",
            "Segmentation & geo analysis",
            "Forecast framing",
            "Actionable recommendations"
        ]
        self.trend_cache: Dict[str, Any] = {}
        from guild.src.models.llm import Llm
        self.llm_client = LlmClient(Llm(provider="ollama", model="tinyllama"))

    async def run(self, user_input: Optional[str] = None) -> Dict[str, Any]:
        try:
            print("Market Trends Agent: Starting comprehensive market trends analysis...")

            categories = ["AI workforce", "automation platforms", "productivity tooling"]
            segments = ["solopreneurs", "SMBs", "agencies"]
            geographies = ["US", "EU", "APAC"]
            lookback_days = 60
            objectives = {"uses": ["content_planning", "product_roadmap", "sales_enablement"]}
            constraints = {"team_size": "lean", "budget": "limited"}

            strategy = await generate_comprehensive_market_trends_strategy(
                categories=categories,
                segments=segments,
                geographies=geographies,
                lookback_days=lookback_days,
                objectives=objectives,
                constraints=constraints
            )

            execution = await self._execute_trends_workflow(strategy)

            result = {
                "agent": self.agent_name,
                "strategy_type": "comprehensive_market_trends",
                "market_trends_strategy": strategy,
                "execution_result": execution,
                "timestamp": datetime.now().isoformat(),
                "status": "completed"
            }
            print("Market Trends Agent: Completed.")
            return result
        except Exception as e:
            print(f"Market Trends Agent: Error: {e}")
            return {
                "agent": self.agent_name,
                "status": "error",
                "message": str(e),
                "timestamp": datetime.now().isoformat()
            }

    async def _execute_trends_workflow(self, strategy: Dict[str, Any]) -> Dict[str, Any]:
        try:
            themes = await self._normalize_themes(strategy.get("themes", []))
            segment_breakdown = await self._build_segment_breakdown(strategy.get("segment_breakdown", {}), themes)
            geo_breakdown = await self._build_geo_breakdown(strategy.get("geo_breakdown", {}), themes)
            recommendations = await self._generate_recommendations(strategy.get("recommendations", []), themes)
            forecast = await self._generate_simple_forecast(themes)

            return {
                "themes": themes,
                "segment_breakdown": segment_breakdown,
                "geo_breakdown": geo_breakdown,
                "recommendations": recommendations,
                "forecast": forecast
            }
        except Exception as e:
            print(f"Market Trends Agent: Workflow error: {e}")
            return {
                "themes": [],
                "segment_breakdown": {},
                "geo_breakdown": {},
                "recommendations": [],
                "forecast": {},
                "error": str(e)
            }

    async def _normalize_themes(self, raw_themes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        try:
            normalized = []
            for t in raw_themes:
                metrics = []
                for m in t.get("metrics", []):
                    try:
                        current = float(m.get("current_value", 0))
                        prior = float(m.get("prior_value", 0))
                        growth = float(m.get("growth_rate", (current - prior) / max(prior, 1e-6)))
                        metrics.append(TrendMetric(
                            name=str(m.get("name", "metric")),
                            current_value=current,
                            prior_value=prior,
                            period=str(m.get("period", "lookback")),
                            growth_rate=growth,
                            confidence=float(m.get("confidence", 0.6))
                        ).__dict__)
                    except Exception:
                        continue
                signals = []
                for s in t.get("signals", []):
                    try:
                        signals.append(MarketSignal(
                            source=str(s.get("source", "unknown")),
                            category=str(s.get("category", "general")),
                            description=str(s.get("description", "")),
                            recency_days=int(s.get("recency_days", 30)),
                            strength=float(s.get("strength", 0.5)),
                            link=s.get("link")
                        ).__dict__)
                    except Exception:
                        continue
                normalized.append({
                    "name": t.get("name", "unnamed_theme"),
                    "summary": t.get("summary", ""),
                    "confidence": float(t.get("confidence", 0.6)),
                    "metrics": metrics,
                    "signals": signals
                })
            # Sort by confidence then avg growth
            def avg_growth(x: Dict[str, Any]) -> float:
                arr = [m.get("growth_rate", 0) for m in x.get("metrics", [])]
                return sum(arr) / len(arr) if arr else 0
            normalized.sort(key=lambda x: (x.get("confidence", 0), avg_growth(x)), reverse=True)
            return normalized
        except Exception as e:
            print(f"Market Trends Agent: Normalize themes error: {e}")
            return []

    async def _build_segment_breakdown(self, seed: Dict[str, Any], themes: List[Dict[str, Any]]) -> Dict[str, Any]:
        try:
            if seed:
                return seed
            # Heuristic assignment: all themes apply to all segments by default
            breakdown = {seg: [t.get("name") for t in themes] for seg in ["solopreneurs", "SMBs", "agencies"]}
            return breakdown
        except Exception as e:
            print(f"Market Trends Agent: Segment breakdown error: {e}")
            return {}

    async def _build_geo_breakdown(self, seed: Dict[str, Any], themes: List[Dict[str, Any]]) -> Dict[str, Any]:
        try:
            if seed:
                return seed
            breakdown = {geo: [t.get("name") for t in themes] for geo in ["US", "EU", "APAC"]}
            return breakdown
        except Exception as e:
            print(f"Market Trends Agent: Geo breakdown error: {e}")
            return {}

    async def _generate_recommendations(self, raw: List[Dict[str, Any]], themes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        try:
            recs = []
            if not raw:
                # Defaults based on top themes
                top = [t.get("name") for t in themes[:3]]
                for name in top:
                    recs.append(MarketRecommendation(
                        theme=name or "theme",
                        action=f"Produce thought-leadership and targeted campaigns around {name}",
                        expected_impact="Increased awareness and pipeline",
                        effort="medium",
                        timeframe="30d",
                        confidence=0.7
                    ).__dict__)
            else:
                for r in raw:
                    recs.append(MarketRecommendation(
                        theme=str(r.get("theme", "theme")),
                        action=str(r.get("action", "")),
                        expected_impact=str(r.get("expected_impact", "impact")),
                        effort=str(r.get("effort", "medium")),
                        timeframe=str(r.get("timeframe", "30d")),
                        confidence=float(r.get("confidence", 0.6))
                    ).__dict__)
            return recs
        except Exception as e:
            print(f"Market Trends Agent: Recommendations error: {e}")
            return []

    async def _generate_simple_forecast(self, themes: List[Dict[str, Any]]) -> Dict[str, Any]:
        try:
            # Simple momentum-based extrapolation
            forecast = {"themes": []}
            for t in themes[:5]:
                avg_growth = 0.0
                if t.get("metrics"):
                    arr = [m.get("growth_rate", 0) for m in t["metrics"]]
                    avg_growth = sum(arr) / len(arr) if arr else 0
                forecast["themes"].append({
                    "name": t.get("name"),
                    "projected_trend_score": round((t.get("confidence", 0.6) * 0.6) + (avg_growth * 0.4), 3),
                    "horizon": "quarter"
                })
            return forecast
        except Exception as e:
            print(f"Market Trends Agent: Forecast error: {e}")
            return {"themes": []}
