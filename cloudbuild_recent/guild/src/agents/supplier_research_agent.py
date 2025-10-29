"""
Supplier Research Agent for Guild-AI
Comprehensive supplier discovery, vetting, and selection recommendations.
"""

from guild.src.core.llm_client import LlmClient
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime
from guild.src.core.agent_helpers import inject_knowledge
import asyncio
import json


@dataclass
class SupplierProfile:
    """Represents a structured supplier profile."""
    name: str
    category: str
    location: Optional[str]
    capabilities: List[str]
    certifications: List[str]
    moq: Optional[int]
    lead_time_days: Optional[int]
    pricing_notes: Optional[str]
    reliability_score: float


@dataclass
class VettingCriterion:
    """Represents a vetting criterion and scores."""
    name: str
    weight: float
    supplier_scores: Dict[str, float]


@dataclass
class SourcingRecommendation:
    """Represents an actionable sourcing recommendation."""
    title: str
    suppliers: List[str]
    rationale: str
    risks: List[str]
    mitigations: List[str]
    confidence: float


@inject_knowledge
async def generate_comprehensive_supplier_strategy(
    categories: List[str],
    regions: List[str],
    constraints: Dict[str, Any],
    requirements: Dict[str, Any],
    preferred_criteria: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Generates a comprehensive supplier research and vetting strategy using advanced prompting.
    """
    print("Supplier Research Agent: Generating comprehensive supplier strategy with injected knowledge...")

    prompt = f"""
# Supplier Research Agent - Comprehensive Vendor Discovery & Vetting

## Role Definition
You are the **Supplier Research Agent**, an expert in discovering, vetting, and recommending suppliers/vendors based on capability, reliability, compliance, and cost-effectiveness. Your role is to produce a vetted shortlist with scoring against weighted criteria, along with risks and mitigations.

## Core Expertise
- Supplier discovery and profiling
- Certification and compliance checks
- Lead time, MOQ, and pricing analysis
- Weighted scoring and shortlisting
- Risk assessment and mitigations

## Context
- Categories: {json.dumps(categories)}
- Regions: {json.dumps(regions)}
- Constraints: {json.dumps(constraints, indent=2)}
- Requirements: {json.dumps(requirements, indent=2)}
- Preferred Criteria: {json.dumps(preferred_criteria, indent=2)}

## Tasks
1) Discover suppliers by category/region and profile them.
2) Define weighted criteria and score suppliers.
3) Produce a ranked shortlist with rationale.
4) Identify risks, mitigations, and trial plan.
5) Provide a negotiation and onboarding checklist.

## Output JSON
{{
  "suppliers": [{{
    "name":"","category":"","location":"","capabilities":[""],"certifications":[""],
    "moq":0,"lead_time_days":0,"pricing_notes":"","reliability_score":0.0
  }}],
  "criteria": [{{"name":"","weight":0.0,"supplier_scores":{{"<supplier>":0.0}}}}],
  "shortlist": [""],
  "risks": [""],
  "mitigations": [""],
  "checklists": {{
    "negotiation":[""],
    "onboarding":[""],
    "evaluation":[""]
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
            print("Supplier Research Agent: Successfully generated strategy.")
            return strategy
        except json.JSONDecodeError as e:
            print(f"Supplier Research Agent: JSON parse error: {e}")
            # Robust fallback
            return {
                "suppliers": [],
                "criteria": [],
                "shortlist": [],
                "risks": ["Incomplete data", "Vendor lock-in"],
                "mitigations": ["Trial orders", "Multi-sourcing"],
                "checklists": {
                    "negotiation": ["Volume tiers", "SLA terms", "Payment terms"],
                    "onboarding": ["Security review", "Compliance docs", "Contact points"],
                    "evaluation": ["Pilot success metrics", "Issue response time"]
                }
            }
    except Exception as e:
        print(f"Supplier Research Agent: Execution error: {e}")
        return {
            "suppliers": [],
            "criteria": [],
            "shortlist": [],
            "risks": [],
            "mitigations": [],
            "checklists": {},
            "error": str(e)
        }


class SupplierResearchAgent:
    """
    Supplier Research Agent - Produces vetted supplier shortlists and recommendations.
    """

    def __init__(self, user_input: Optional[str] = None):
        self.user_input = user_input
        self.agent_name = "Supplier Research Agent"
        self.agent_type = "Research & Intelligence"
        self.capabilities = [
            "Discovery & profiling",
            "Certification checks",
            "Lead-time/MOQ analysis",
            "Weighted scoring",
            "Risk mitigation"
        ]
        from guild.src.models.llm import Llm
        self.llm_client = LlmClient(Llm(provider="ollama", model="tinyllama"))

    async def run(self, user_input: Optional[str] = None) -> Dict[str, Any]:
        try:
            print("Supplier Research Agent: Starting comprehensive supplier research...")

            categories = ["cloud services", "data labeling", "manufacturing"]
            regions = ["US", "EU", "APAC"]
            constraints = {"budget": "moderate", "security": "essential"}
            requirements = {"uptime_sla": "99.9%", "data_protection": "SOC2 or ISO"}
            preferred_criteria = {"cost": 0.3, "reliability": 0.3, "capability": 0.25, "lead_time": 0.15}

            strategy = await generate_comprehensive_supplier_strategy(
                categories=categories,
                regions=regions,
                constraints=constraints,
                requirements=requirements,
                preferred_criteria=preferred_criteria
            )

            execution = await self._execute_supplier_workflow(strategy)

            result = {
                "agent": self.agent_name,
                "strategy_type": "comprehensive_supplier_research",
                "supplier_strategy": strategy,
                "execution_result": execution,
                "timestamp": datetime.now().isoformat(),
                "status": "completed"
            }
            print("Supplier Research Agent: Completed.")
            return result
        except Exception as e:
            print(f"Supplier Research Agent: Error: {e}")
            return {
                "agent": self.agent_name,
                "status": "error",
                "message": str(e),
                "timestamp": datetime.now().isoformat()
            }

    async def _execute_supplier_workflow(self, strategy: Dict[str, Any]) -> Dict[str, Any]:
        try:
            suppliers = await self._normalize_suppliers(strategy.get("suppliers", []))
            criteria = await self._normalize_criteria(strategy.get("criteria", []), suppliers)
            shortlist = await self._build_shortlist(criteria)
            checklists = strategy.get("checklists", {})
            recommendations = await self._generate_recommendations(shortlist, suppliers)
            return {
                "suppliers": suppliers,
                "criteria": criteria,
                "shortlist": shortlist,
                "checklists": checklists,
                "recommendations": recommendations
            }
        except Exception as e:
            print(f"Supplier Research Agent: Workflow error: {e}")
            return {
                "suppliers": [],
                "criteria": [],
                "shortlist": [],
                "checklists": {},
                "recommendations": [],
                "error": str(e)
            }

    async def _normalize_suppliers(self, raw: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        try:
            out = []
            for s in raw:
                out.append(SupplierProfile(
                    name=str(s.get("name", "supplier")),
                    category=str(s.get("category", "general")),
                    location=s.get("location"),
                    capabilities=[str(x) for x in s.get("capabilities", [])],
                    certifications=[str(x) for x in s.get("certifications", [])],
                    moq=s.get("moq"),
                    lead_time_days=s.get("lead_time_days"),
                    pricing_notes=s.get("pricing_notes"),
                    reliability_score=float(s.get("reliability_score", 0.6))
                ).__dict__)
            return out
        except Exception as e:
            print(f"Supplier Research Agent: Normalize suppliers error: {e}")
            return []

    async def _normalize_criteria(self, raw: List[Dict[str, Any]], suppliers: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        try:
            if not raw:
                # Create default criteria structure
                names = [s.get("name") for s in suppliers]
                return [
                    VettingCriterion(name="cost", weight=0.3, supplier_scores={n: 0.6 for n in names}).__dict__,
                    VettingCriterion(name="reliability", weight=0.3, supplier_scores={n: 0.6 for n in names}).__dict__,
                    VettingCriterion(name="capability", weight=0.25, supplier_scores={n: 0.6 for n in names}).__dict__,
                    VettingCriterion(name="lead_time", weight=0.15, supplier_scores={n: 0.6 for n in names}).__dict__
                ]
            # Ensure structure
            normalized = []
            for c in raw:
                scores = {str(k): float(v) for k, v in c.get("supplier_scores", {}).items()}
                normalized.append(VettingCriterion(
                    name=str(c.get("name", "criterion")),
                    weight=float(c.get("weight", 0.25)),
                    supplier_scores=scores
                ).__dict__)
            # Normalize weights ~1.0
            total = sum(c["weight"] for c in normalized) or 1.0
            for c in normalized:
                c["weight"] = round(c["weight"] / total, 3)
            return normalized
        except Exception as e:
            print(f"Supplier Research Agent: Normalize criteria error: {e}")
            return []

    async def _build_shortlist(self, criteria: List[Dict[str, Any]]) -> List[str]:
        try:
            # Weighted sum across criteria to rank suppliers
            scores: Dict[str, float] = {}
            for c in criteria:
                weight = c.get("weight", 0.25)
                for supplier, s in c.get("supplier_scores", {}).items():
                    scores[supplier] = scores.get(supplier, 0.0) + (weight * s)
            ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)
            return [name for name, _ in ranked[:5]]
        except Exception as e:
            print(f"Supplier Research Agent: Shortlist error: {e}")
            return []

    async def _generate_recommendations(self, shortlist: List[str], suppliers: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        try:
            if not shortlist:
                return []
            recs: List[Dict[str, Any]] = []
            top = shortlist[:3]
            recs.append(SourcingRecommendation(
                title="Phase pilot with top suppliers",
                suppliers=top,
                rationale="Balanced cost, reliability, and capability scores",
                risks=["Overreliance on single vendor"],
                mitigations=["Parallel pilots", "Exit clauses"],
                confidence=0.7
            ).__dict__)
            return recs
        except Exception as e:
            print(f"Supplier Research Agent: Recommendations error: {e}")
            return []
