"""
Pricing Intelligence Agent for Guild-AI
Comprehensive pricing research, elasticity analysis, and packaging recommendations.
"""

from guild.src.core.llm_client import LlmClient
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime
from guild.src.core.agent_helpers import inject_knowledge
import asyncio
import json


@dataclass
class PricePoint:
    """Represents a price point scenario and expected outcomes."""
    plan: str
    price: float
    expected_conversion: float
    expected_churn: float
    revenue_projection: float
    confidence: float


@dataclass
class PackagingDimension:
    """Represents a packaging dimension and included limits/features."""
    name: str
    included: Any
    overage: Optional[Any]
    notes: str


@dataclass
class PricingRecommendation:
    """Represents an actionable pricing recommendation."""
    title: str
    rationale: str
    action_steps: List[str]
    expected_impact: str
    risk: str
    confidence: float


@inject_knowledge
async def generate_comprehensive_pricing_strategy(
    current_pricing: Dict[str, Any],
    competitor_pricing: Dict[str, Any],
    customer_willingness: Dict[str, Any],
    usage_buckets: Dict[str, Any],
    business_objectives: Dict[str, Any],
    constraints: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Generates a comprehensive pricing intelligence strategy using advanced prompting.
    """
    print("Pricing Intelligence Agent: Generating comprehensive pricing strategy with injected knowledge...")

    prompt = f"""
# Pricing Intelligence Agent - Comprehensive Pricing & Packaging Analysis

## Role Definition
You are the **Pricing Intelligence Agent**, an expert in pricing research, elasticity modeling, and packaging strategy. Your role is to triangulate competitor pricing, customer willingness-to-pay, usage data, and business objectives to recommend pricing/packaging that maximizes sustainable revenue and adoption.

## Core Expertise
- Pricing research and competitor benchmarks
- Van Westendorp/WTP synthesis and elasticity hints
- Tiering and packaging design
- Usage-based and hybrid models
- Experiment design and rollout plans
- Impact and risk assessment

## Context
- Current Pricing: {json.dumps(current_pricing, indent=2)}
- Competitor Pricing: {json.dumps(competitor_pricing, indent=2)}
- Customer Willingness: {json.dumps(customer_willingness, indent=2)}
- Usage Buckets: {json.dumps(usage_buckets, indent=2)}
- Business Objectives: {json.dumps(business_objectives, indent=2)}
- Constraints: {json.dumps(constraints, indent=2)}

## Tasks
1) Benchmark against competitors; identify position and gaps.
2) Propose tier structure and key packaging dimensions.
3) Model price points with simple elasticity assumptions.
4) Recommend experiments and rollout timeline.
5) Provide risks, mitigations, and success metrics.

## Output JSON
{{
  "benchmarks": {{"competitors": [{{"name":"","plans":{{"starter":"","pro":"","business":""}}}}]}},
  "packaging": [{{
     "plan":"starter|pro|business|enterprise","dimensions":[{{"name":"","included":"","overage":"","notes":""}}]
  }}],
  "price_points": [{{"plan":"","price":0.0,"expected_conversion":0.0,"expected_churn":0.0,"revenue_projection":0.0,"confidence":0.0}}],
  "experiments": [{{"hypothesis":"","design":"","metric":"","duration":"","success_threshold":""}}],
  "risks": [""],
  "mitigations": [""],
  "success_metrics": [""],
  "recommendations": [{{
     "title":"","rationale":"","action_steps":[""],"expected_impact":"","risk":"","confidence":0.0
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
            print("Pricing Intelligence Agent: Successfully generated strategy.")
            return strategy
        except json.JSONDecodeError as e:
            print(f"Pricing Intelligence Agent: JSON parse error: {e}")
            # Robust fallback
            return {
                "benchmarks": {"competitors": []},
                "packaging": [],
                "price_points": [],
                "experiments": [
                    {"hypothesis": "Higher Pro price does not hurt conversion materially",
                     "design": "A/B price +10% for 50% of traffic",
                     "metric": "Pro plan conversion, churn 30/60d",
                     "duration": "4 weeks",
                     "success_threshold": ">= same conversion, churn stable"}
                ],
                "risks": ["Price shock causing churn"],
                "mitigations": ["Grandfather existing customers", "Add value in Pro"]
            }
    except Exception as e:
        print(f"Pricing Intelligence Agent: Execution error: {e}")
        return {
            "benchmarks": {"competitors": []},
            "packaging": [],
            "price_points": [],
            "experiments": [],
            "error": str(e)
        }


class PricingIntelligenceAgent:
    """
    Pricing Intelligence Agent - Recommends data-backed pricing and packaging strategy.
    """

    def __init__(self, user_input: Optional[str] = None):
        self.user_input = user_input
        self.agent_name = "Pricing Intelligence Agent"
        self.agent_type = "Research & Intelligence"
        self.capabilities = [
            "Competitor benchmarking",
            "WTP synthesis",
            "Elasticity modeling",
            "Packaging design",
            "Experiment rollout"
        ]
        from guild.src.models.llm import Llm
        self.llm_client = LlmClient(Llm(provider="ollama", model="tinyllama"))

    async def run(self, user_input: Optional[str] = None) -> Dict[str, Any]:
        try:
            print("Pricing Intelligence Agent: Starting comprehensive pricing analysis...")

            current_pricing = {"starter": 29.0, "pro": 79.0, "business": 199.0}
            competitor_pricing = {
                "Zapier": {"starter": 19, "pro": 49, "business": 99},
                "Make.com": {"starter": 10, "pro": 36, "business": 60}
            }
            customer_willingness = {
                "solopreneurs": {"wtp": 35},
                "smb": {"wtp": 85},
                "agencies": {"wtp": 220}
            }
            usage_buckets = {"low": "starter", "medium": "pro", "high": "business"}
            business_objectives = {"revenue_growth": "30%", "reduce_churn": True}
            constraints = {"brand": "value", "risk_tolerance": "moderate"}

            strategy = await generate_comprehensive_pricing_strategy(
                current_pricing=current_pricing,
                competitor_pricing=competitor_pricing,
                customer_willingness=customer_willingness,
                usage_buckets=usage_buckets,
                business_objectives=business_objectives,
                constraints=constraints
            )

            execution = await self._execute_pricing_workflow(strategy)

            result = {
                "agent": self.agent_name,
                "strategy_type": "comprehensive_pricing_intelligence",
                "pricing_strategy": strategy,
                "execution_result": execution,
                "timestamp": datetime.now().isoformat(),
                "status": "completed"
            }
            print("Pricing Intelligence Agent: Completed.")
            return result
        except Exception as e:
            print(f"Pricing Intelligence Agent: Error: {e}")
            return {
                "agent": self.agent_name,
                "status": "error",
                "message": str(e),
                "timestamp": datetime.now().isoformat()
            }

    async def _execute_pricing_workflow(self, strategy: Dict[str, Any]) -> Dict[str, Any]:
        try:
            packaging = await self._normalize_packaging(strategy.get("packaging", []))
            price_points = await self._normalize_price_points(strategy.get("price_points", []))
            experiments = strategy.get("experiments", [])
            recommendations = await self._normalize_recommendations(strategy.get("recommendations", []))
            kpis = await self._derive_kpis(price_points)
            return {
                "packaging": packaging,
                "price_points": price_points,
                "experiments": experiments,
                "recommendations": recommendations,
                "kpis": kpis
            }
        except Exception as e:
            print(f"Pricing Intelligence Agent: Workflow error: {e}")
            return {
                "packaging": [],
                "price_points": [],
                "experiments": [],
                "recommendations": [],
                "kpis": {},
                "error": str(e)
            }

    async def _normalize_packaging(self, raw: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        try:
            if not raw:
                return [
                    {"plan": "starter", "dimensions": [
                        PackagingDimension("workflows", 5, None, "core usage cap").__dict__,
                        PackagingDimension("users", 1, None, "single user").__dict__
                    ]},
                    {"plan": "pro", "dimensions": [
                        PackagingDimension("workflows", 50, None, "scaling" ).__dict__,
                        PackagingDimension("users", 5, None, "team" ).__dict__
                    ]},
                    {"plan": "business", "dimensions": [
                        PackagingDimension("workflows", 200, "overage available", "higher caps" ).__dict__,
                        PackagingDimension("users", 25, "add-on seats", "growing teams" ).__dict__
                    ]}
                ]
            # Ensure structure
            normalized = []
            for p in raw:
                dims = []
                for d in p.get("dimensions", []):
                    dims.append(PackagingDimension(
                        name=str(d.get("name", "dim")),
                        included=d.get("included"),
                        overage=d.get("overage"),
                        notes=str(d.get("notes", ""))
                    ).__dict__)
                normalized.append({"plan": p.get("plan", "plan"), "dimensions": dims})
            return normalized
        except Exception as e:
            print(f"Pricing Intelligence Agent: Normalize packaging error: {e}")
            return []

    async def _normalize_price_points(self, raw: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        try:
            out = []
            for pp in raw:
                try:
                    out.append(PricePoint(
                        plan=str(pp.get("plan", "plan")),
                        price=float(pp.get("price", 0.0)),
                        expected_conversion=float(pp.get("expected_conversion", 0.05)),
                        expected_churn=float(pp.get("expected_churn", 0.04)),
                        revenue_projection=float(pp.get("revenue_projection", 0.0)),
                        confidence=float(pp.get("confidence", 0.6))
                    ).__dict__)
                except Exception:
                    continue
            return out
        except Exception as e:
            print(f"Pricing Intelligence Agent: Normalize price points error: {e}")
            return []

    async def _normalize_recommendations(self, raw: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        try:
            out = []
            for r in raw:
                out.append(PricingRecommendation(
                    title=str(r.get("title", "Pricing experiment")),
                    rationale=str(r.get("rationale", "")),
                    action_steps=[str(x) for x in r.get("action_steps", [])],
                    expected_impact=str(r.get("expected_impact", "")),
                    risk=str(r.get("risk", "")),
                    confidence=float(r.get("confidence", 0.65))
                ).__dict__)
            return out
        except Exception as e:
            print(f"Pricing Intelligence Agent: Normalize recommendations error: {e}")
            return []

    async def _derive_kpis(self, price_points: List[Dict[str, Any]]) -> Dict[str, Any]:
        try:
            # Simple derived KPIs across proposed price points
            if not price_points:
                return {"notes": "No price points to aggregate"}
            avg_price = sum(p.get("price", 0) for p in price_points) / max(len(price_points), 1)
            avg_conv = sum(p.get("expected_conversion", 0) for p in price_points) / max(len(price_points), 1)
            avg_churn = sum(p.get("expected_churn", 0) for p in price_points) / max(len(price_points), 1)
            return {
                "average_price": round(avg_price, 2),
                "average_expected_conversion": round(avg_conv, 4),
                "average_expected_churn": round(avg_churn, 4)
            }
        except Exception as e:
            print(f"Pricing Intelligence Agent: KPI derivation error: {e}")
            return {}
