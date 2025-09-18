"""
ICP (Ideal Customer Profile) Evolution Agent for Guild-AI
Continuously refines ICP using product usage, sales feedback, and market signals.
"""

from guild.src.core.llm_client import LlmClient
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime
from guild.src.core.agent_helpers import inject_knowledge
import asyncio
import json


@dataclass
class ICPDimension:
    """Represents a single ICP dimension scoring."""
    name: str
    definition: str
    weight: float
    current_score: float
    trend: str  # rising | stable | falling
    confidence: float


@dataclass
class ICPHypothesis:
    """Represents a testable ICP hypothesis."""
    statement: str
    rationale: str
    evidence: List[str]
    confidence: float
    status: str  # proposed | testing | validated | rejected


@dataclass
class ICPPlaybookRecommendation:
    """Represents a go-to-market/playbook recommendation based on ICP shift."""
    title: str
    action_steps: List[str]
    expected_impact: str
    owner: str
    timeframe: str
    confidence: float


@inject_knowledge
async def generate_comprehensive_icp_strategy(
    current_icp: Dict[str, Any],
    product_usage: Dict[str, Any],
    sales_feedback: Dict[str, Any],
    marketing_performance: Dict[str, Any],
    market_signals: Dict[str, Any],
    constraints: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Generates a comprehensive ICP evolution strategy using advanced prompting.
    """
    print("ICP Evolution Agent: Generating comprehensive ICP strategy with injected knowledge...")

    prompt = f"""
# ICP Evolution Agent - Continuous ICP Refinement and Validation

## Role Definition
You are the **ICP Evolution Agent**, an expert in defining and refining the Ideal Customer Profile by triangulating product usage, sales feedback, marketing performance, and external market signals. Your role is to propose data-backed ICP adjustments, generate testable hypotheses, and recommend playbooks to validate and capitalize on ICP shifts.

## Core Expertise
- ICP dimension modeling and scoring
- Hypothesis generation and validation loops
- Signal weighting and confidence estimation
- Playbook development for GTM, product, and success
- Feedback integration and versioning of ICP

## Context
- Current ICP: {json.dumps(current_icp, indent=2)}
- Product Usage: {json.dumps(product_usage, indent=2)}
- Sales Feedback: {json.dumps(sales_feedback, indent=2)}
- Marketing Performance: {json.dumps(marketing_performance, indent=2)}
- Market Signals: {json.dumps(market_signals, indent=2)}
- Constraints: {json.dumps(constraints, indent=2)}

## Tasks
1) Score ICP dimensions with trends and confidence.
2) Identify candidate ICP segments rising/falling in fit.
3) Generate testable hypotheses with evidence and confidence.
4) Recommend validation playbooks and measurement.
5) Propose versioned ICP update with change log.

## Output JSON
{{
  "dimension_scores": [{{
     "name":"","definition":"","weight":0.0,"current_score":0.0,"trend":"rising|stable|falling","confidence":0.0
  }}],
  "segment_changes": [{{
     "segment":"","fit_change":"rising|falling|stable","drivers":[""],"confidence":0.0
  }}],
  "hypotheses": [{{
     "statement":"","rationale":"","evidence":[""],"confidence":0.0,"status":"proposed"
  }}],
  "playbooks": [{{
     "title":"","action_steps":[""],"expected_impact":"","owner":"marketing|sales|product|success","timeframe":"now|30d|quarter","confidence":0.0
  }}],
  "icp_update": {{
     "version":"vX.Y","changes":[""],"risk":"","next_review":"YYYY-MM-DD"
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
            print("ICP Evolution Agent: Successfully generated strategy.")
            return strategy
        except json.JSONDecodeError as e:
            print(f"ICP Evolution Agent: JSON parse error: {e}")
            # Robust fallback structure
            return {
                "dimension_scores": [],
                "segment_changes": [],
                "hypotheses": [],
                "playbooks": [
                    {
                        "title": "Establish ICP validation loop",
                        "action_steps": [
                            "Define dimension weights",
                            "Weekly scoring from product/sales/marketing",
                            "Quarterly ICP versioning"
                        ],
                        "expected_impact": "Higher win rates and retention",
                        "owner": "product",
                        "timeframe": "30d",
                        "confidence": 0.75
                    }
                ],
                "icp_update": {
                    "version": "v1.1-draft",
                    "changes": ["Setup validation pipeline"],
                    "risk": "Overfitting to early signals",
                    "next_review": datetime.now().date().isoformat()
                }
            }
    except Exception as e:
        print(f"ICP Evolution Agent: Execution error: {e}")
        return {
            "dimension_scores": [],
            "segment_changes": [],
            "hypotheses": [],
            "playbooks": [],
            "icp_update": {"version": "v1.0"},
            "error": str(e)
        }


class ICPEvolutionAgent:
    """
    ICP Evolution Agent - Refines the ICP with data-backed hypotheses and playbooks.
    """

    def __init__(self, user_input: Optional[str] = None):
        self.user_input = user_input
        self.agent_name = "ICP Evolution Agent"
        self.agent_type = "Research & Intelligence"
        self.capabilities = [
            "ICP modeling",
            "Hypothesis loops",
            "Signal weighting",
            "Playbook design",
            "Versioning & governance"
        ]
        self.icp_versions: List[Dict[str, Any]] = []
        from guild.src.models.llm import Llm
        self.llm_client = LlmClient(Llm(provider="ollama", model="tinyllama"))

    async def run(self, user_input: Optional[str] = None) -> Dict[str, Any]:
        try:
            print("ICP Evolution Agent: Starting comprehensive ICP evolution...")

            current_icp = {
                "segments": [
                    {"name": "solopreneurs", "fit": 0.7},
                    {"name": "SMBs", "fit": 0.8},
                    {"name": "agencies", "fit": 0.65}
                ],
                "dimensions": [
                    {"name": "automation_need", "weight": 0.35},
                    {"name": "budget_fit", "weight": 0.25},
                    {"name": "technical_openness", "weight": 0.2},
                    {"name": "data_security_requirements", "weight": 0.2}
                ]
            }
            product_usage = {
                "active_users": 250,
                "feature_adoption": {"multi_agent_workflows": 0.85, "visual_automation": 0.45, "doc_processing": 0.65},
                "cohort_retention": {"solopreneurs": 0.72, "SMBs": 0.78, "agencies": 0.69}
            }
            sales_feedback = {
                "wins": ["time_saved", "breadth_of_capabilities"],
                "losses": ["missing_integrations", "security_buyin"],
                "objections": ["price", "SSO"],
                "patterns": {"SMBs": "strong_interest", "agencies": "integration_depth"}
            }
            marketing_performance = {
                "channels": {"content": 0.6, "social": 0.2, "referrals": 0.2},
                "conversion_rates": {"solopreneurs": 0.04, "SMBs": 0.06, "agencies": 0.03}
            }
            market_signals = {
                "search_interest": {"ai_workforce": "+35% YoY"},
                "funding": {"automation_tools": "rising"},
                "hiring": {"ai_ops": "growth"}
            }
            constraints = {"team": "lean", "budget": "limited", "risk_tolerance": "moderate"}

            strategy = await generate_comprehensive_icp_strategy(
                current_icp=current_icp,
                product_usage=product_usage,
                sales_feedback=sales_feedback,
                marketing_performance=marketing_performance,
                market_signals=market_signals,
                constraints=constraints
            )

            execution = await self._execute_icp_workflow(strategy)

            result = {
                "agent": self.agent_name,
                "strategy_type": "comprehensive_icp_evolution",
                "icp_strategy": strategy,
                "execution_result": execution,
                "timestamp": datetime.now().isoformat(),
                "status": "completed"
            }
            print("ICP Evolution Agent: Completed.")
            return result
        except Exception as e:
            print(f"ICP Evolution Agent: Error: {e}")
            return {
                "agent": self.agent_name,
                "status": "error",
                "message": str(e),
                "timestamp": datetime.now().isoformat()
            }

    async def _execute_icp_workflow(self, strategy: Dict[str, Any]) -> Dict[str, Any]:
        try:
            dimensions = await self._normalize_dimensions(strategy.get("dimension_scores", []))
            segments = await self._normalize_segments(strategy.get("segment_changes", []))
            hypotheses = await self._normalize_hypotheses(strategy.get("hypotheses", []))
            playbooks = await self._normalize_playbooks(strategy.get("playbooks", []))
            icp_update = await self._version_icp(strategy.get("icp_update", {}), dimensions, segments)

            return {
                "dimensions": dimensions,
                "segment_changes": segments,
                "hypotheses": hypotheses,
                "playbooks": playbooks,
                "icp_update": icp_update
            }
        except Exception as e:
            print(f"ICP Evolution Agent: Workflow error: {e}")
            return {
                "dimensions": [],
                "segment_changes": [],
                "hypotheses": [],
                "playbooks": [],
                "icp_update": {"version": "v1.0"},
                "error": str(e)
            }

    async def _normalize_dimensions(self, raw: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        try:
            out = []
            for d in raw:
                out.append(ICPDimension(
                    name=str(d.get("name", "dimension")),
                    definition=str(d.get("definition", "")),
                    weight=float(d.get("weight", 0.2)),
                    current_score=float(d.get("current_score", 0.5)),
                    trend=str(d.get("trend", "stable")),
                    confidence=float(d.get("confidence", 0.6))
                ).__dict__)
            # Normalize weights to sum ~1.0
            total = sum([d["weight"] for d in out]) or 1.0
            for d in out:
                d["weight"] = round(d["weight"] / total, 3)
            return out
        except Exception as e:
            print(f"ICP Evolution Agent: Normalize dimensions error: {e}")
            return []

    async def _normalize_segments(self, raw: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        try:
            out = []
            for s in raw:
                out.append({
                    "segment": str(s.get("segment", "segment")),
                    "fit_change": str(s.get("fit_change", "stable")),
                    "drivers": [str(x) for x in s.get("drivers", [])],
                    "confidence": float(s.get("confidence", 0.6))
                })
            return out
        except Exception as e:
            print(f"ICP Evolution Agent: Normalize segments error: {e}")
            return []

    async def _normalize_hypotheses(self, raw: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        try:
            out = []
            for h in raw:
                out.append(ICPHypothesis(
                    statement=str(h.get("statement", "")),
                    rationale=str(h.get("rationale", "")),
                    evidence=[str(x) for x in h.get("evidence", [])],
                    confidence=float(h.get("confidence", 0.6)),
                    status=str(h.get("status", "proposed"))
                ).__dict__)
            # Ensure at least one default hypothesis exists
            if not out:
                out.append(ICPHypothesis(
                    statement="SMBs with clear automation backlogs have highest retention",
                    rationale="Usage analytics + sales wins",
                    evidence=["feature_adoption", "retention_by_segment"],
                    confidence=0.7,
                    status="proposed"
                ).__dict__)
            return out
        except Exception as e:
            print(f"ICP Evolution Agent: Normalize hypotheses error: {e}")
            return []

    async def _normalize_playbooks(self, raw: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        try:
            out = []
            for p in raw:
                out.append(ICPPlaybookRecommendation(
                    title=str(p.get("title", "ICP validation play")),
                    action_steps=[str(x) for x in p.get("action_steps", [])],
                    expected_impact=str(p.get("expected_impact", "")),
                    owner=str(p.get("owner", "marketing")),
                    timeframe=str(p.get("timeframe", "30d")),
                    confidence=float(p.get("confidence", 0.65))
                ).__dict__)
            return out
        except Exception as e:
            print(f"ICP Evolution Agent: Normalize playbooks error: {e}")
            return []

    async def _version_icp(
        self,
        icp_update: Dict[str, Any],
        dimensions: List[Dict[str, Any]],
        segments: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        try:
            version = icp_update.get("version") or f"v{len(self.icp_versions) + 1}.0"
            changes = icp_update.get("changes", ["dimension and segment adjustments recorded"])
            risk = icp_update.get("risk", "misclassification risk; continue validation")
            next_review = icp_update.get("next_review", datetime.now().date().isoformat())
            record = {
                "version": version,
                "changes": changes,
                "risk": risk,
                "next_review": next_review,
                "snapshot": {"dimensions": dimensions, "segments": segments}
            }
            self.icp_versions.append(record)
            return record
        except Exception as e:
            print(f"ICP Evolution Agent: Versioning error: {e}")
            return {"version": f"v{len(self.icp_versions) + 1}.0", "error": str(e)}
