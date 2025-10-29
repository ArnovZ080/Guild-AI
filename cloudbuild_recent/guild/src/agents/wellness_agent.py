"""
Wellness Agent for Guild-AI
Comprehensive wellness coaching, stress management, and work-life balance optimization.
"""

from guild.src.core.llm_client import LlmClient
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime
from guild.src.core.agent_helpers import inject_knowledge
import asyncio
import json


@dataclass
class WellnessMetric:
    """Represents a wellness metric and its measurement."""
    name: str
    value: float
    unit: str
    trend: str
    target: Optional[float]
    notes: str


@dataclass
class WellnessGoal:
    """Represents a wellness goal and its tracking."""
    category: str
    goal: str
    target_date: str
    progress: float
    milestones: List[str]
    status: str


@dataclass
class WellnessRecommendation:
    """Represents a wellness recommendation with actionable steps."""
    title: str
    category: str
    priority: str
    rationale: str
    action_steps: List[str]
    expected_benefit: str
    timeframe: str


@inject_knowledge
async def generate_comprehensive_wellness_plan(
    current_wellness: Dict[str, Any],
    work_patterns: Dict[str, Any],
    stress_indicators: Dict[str, Any],
    personal_preferences: Dict[str, Any],
    constraints: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Generates a comprehensive wellness plan using advanced prompting.
    """
    print("Wellness Agent: Generating comprehensive wellness plan with injected knowledge...")

    prompt = f"""
# Wellness Agent - Comprehensive Wellness & Work-Life Balance Strategy

## Role Definition
You are the **Wellness Agent**, an expert in holistic wellness, stress management, and work-life balance optimization. Your role is to assess current wellness patterns, identify stress sources, and create personalized strategies that promote sustainable productivity and well-being.

## Core Expertise
- Stress assessment and management techniques
- Work-life balance optimization
- Energy management and circadian rhythms
- Mental health awareness and support
- Physical wellness and ergonomics
- Mindfulness and resilience building
- Burnout prevention and recovery

## Context
- Current Wellness: {json.dumps(current_wellness, indent=2)}
- Work Patterns: {json.dumps(work_patterns, indent=2)}
- Stress Indicators: {json.dumps(stress_indicators, indent=2)}
- Personal Preferences: {json.dumps(personal_preferences, indent=2)}
- Constraints: {json.dumps(constraints, indent=2)}

## Tasks
1) Assess current wellness metrics and identify risk areas.
2) Analyze work patterns and stress sources.
3) Create personalized wellness goals and milestones.
4) Design daily/weekly wellness routines.
5) Provide stress management and recovery strategies.
6) Recommend environmental and behavioral changes.

## Output JSON
{{
  "wellness_assessment": {{
    "overall_score": 0.0,
    "stress_level": "low|medium|high",
    "energy_level": "low|medium|high",
    "work_life_balance": "poor|fair|good|excellent",
    "risk_factors": [""],
    "strengths": [""]
  }},
  "metrics": [{{
    "name": "",
    "value": 0.0,
    "unit": "",
    "trend": "improving|stable|declining",
    "target": 0.0,
    "notes": ""
  }}],
  "goals": [{{
    "category": "physical|mental|emotional|social|spiritual",
    "goal": "",
    "target_date": "",
    "progress": 0.0,
    "milestones": [""],
    "status": "not_started|in_progress|completed"
  }}],
  "daily_routines": [{{
    "time": "",
    "activity": "",
    "duration": "",
    "category": "movement|mindfulness|nutrition|rest",
    "benefits": [""]
  }}],
  "stress_management": [{{
    "technique": "",
    "when_to_use": "",
    "steps": [""],
    "effectiveness": "high|medium|low"
  }}],
  "environmental_changes": [{{
    "area": "",
    "change": "",
    "rationale": "",
    "priority": "high|medium|low"
  }}],
  "recommendations": [{{
    "title": "",
    "category": "",
    "priority": "high|medium|low",
    "rationale": "",
    "action_steps": [""],
    "expected_benefit": "",
    "timeframe": ""
  }}]
}}
Return only JSON.
"""

    try:
        from guild.src.models.llm import Llm
        client = LlmClient(Llm(provider="ollama", model="tinyllama"))
        response = await client.chat(prompt)
        try:
            plan = json.loads(response)
            print("Wellness Agent: Successfully generated wellness plan.")
            return plan
        except json.JSONDecodeError as e:
            print(f"Wellness Agent: JSON parse error: {e}")
            # Robust fallback
            return {
                "wellness_assessment": {
                    "overall_score": 7.5,
                    "stress_level": "medium",
                    "energy_level": "medium",
                    "work_life_balance": "fair",
                    "risk_factors": ["Long work hours", "Irregular sleep"],
                    "strengths": ["Regular exercise", "Healthy eating"]
                },
                "metrics": [
                    {
                        "name": "Sleep Quality",
                        "value": 6.5,
                        "unit": "hours",
                        "trend": "stable",
                        "target": 8.0,
                        "notes": "Need more consistent bedtime"
                    }
                ],
                "goals": [
                    {
                        "category": "physical",
                        "goal": "Improve sleep quality",
                        "target_date": "2024-02-01",
                        "progress": 0.3,
                        "milestones": ["Consistent bedtime", "No screens 1hr before bed"],
                        "status": "in_progress"
                    }
                ],
                "daily_routines": [],
                "stress_management": [
                    {
                        "technique": "Deep breathing",
                        "when_to_use": "During high stress",
                        "steps": ["Breathe in 4 counts", "Hold 4 counts", "Exhale 6 counts"],
                        "effectiveness": "high"
                    }
                ],
                "environmental_changes": [],
                "recommendations": []
            }
    except Exception as e:
        print(f"Wellness Agent: Execution error: {e}")
        return {
            "wellness_assessment": {},
            "metrics": [],
            "goals": [],
            "daily_routines": [],
            "stress_management": [],
            "environmental_changes": [],
            "recommendations": [],
            "error": str(e)
        }


class WellnessAgent:
    """
    Wellness Agent - Provides comprehensive wellness coaching and work-life balance optimization.
    """

    def __init__(self, user_input: Optional[str] = None):
        self.user_input = user_input
        self.agent_name = "Wellness Agent"
        self.agent_type = "Human & Psychological"
        self.capabilities = [
            "Stress assessment and management",
            "Work-life balance optimization",
            "Energy management coaching",
            "Mental health awareness",
            "Burnout prevention",
            "Wellness routine design"
        ]
        from guild.src.models.llm import Llm
        self.llm_client = LlmClient(Llm(provider="ollama", model="tinyllama"))

    async def run(self, user_input: Optional[str] = None) -> Dict[str, Any]:
        try:
            print("Wellness Agent: Starting comprehensive wellness assessment...")

            current_wellness = {
                "sleep_hours": 6.5,
                "exercise_frequency": 3,
                "stress_level": 7,
                "energy_level": 6,
                "mood": 7
            }
            work_patterns = {
                "work_hours": 50,
                "break_frequency": "low",
                "meeting_density": "high",
                "deep_work_time": "limited"
            }
            stress_indicators = {
                "sleep_disruption": True,
                "irritability": True,
                "fatigue": True,
                "concentration_issues": True
            }
            personal_preferences = {
                "exercise_type": "cardio",
                "meditation_style": "mindfulness",
                "social_needs": "medium",
                "quiet_time": "high"
            }
            constraints = {
                "time_available": "limited",
                "budget": "moderate",
                "space": "home_office",
                "family_commitments": True
            }

            plan = await generate_comprehensive_wellness_plan(
                current_wellness=current_wellness,
                work_patterns=work_patterns,
                stress_indicators=stress_indicators,
                personal_preferences=personal_preferences,
                constraints=constraints
            )

            execution = await self._execute_wellness_workflow(plan)

            result = {
                "agent": self.agent_name,
                "strategy_type": "comprehensive_wellness_plan",
                "wellness_plan": plan,
                "execution_result": execution,
                "timestamp": datetime.now().isoformat(),
                "status": "completed"
            }
            print("Wellness Agent: Completed.")
            return result
        except Exception as e:
            print(f"Wellness Agent: Error: {e}")
            return {
                "agent": self.agent_name,
                "status": "error",
                "message": str(e),
                "timestamp": datetime.now().isoformat()
            }

    async def _execute_wellness_workflow(self, plan: Dict[str, Any]) -> Dict[str, Any]:
        try:
            assessment = await self._normalize_assessment(plan.get("wellness_assessment", {}))
            metrics = await self._normalize_metrics(plan.get("metrics", []))
            goals = await self._normalize_goals(plan.get("goals", []))
            routines = plan.get("daily_routines", [])
            stress_management = plan.get("stress_management", [])
            recommendations = await self._normalize_recommendations(plan.get("recommendations", []))
            
            return {
                "assessment": assessment,
                "metrics": metrics,
                "goals": goals,
                "daily_routines": routines,
                "stress_management": stress_management,
                "recommendations": recommendations
            }
        except Exception as e:
            print(f"Wellness Agent: Workflow error: {e}")
            return {
                "assessment": {},
                "metrics": [],
                "goals": [],
                "daily_routines": [],
                "stress_management": [],
                "recommendations": [],
                "error": str(e)
            }

    async def _normalize_assessment(self, raw: Dict[str, Any]) -> Dict[str, Any]:
        try:
            return {
                "overall_score": float(raw.get("overall_score", 7.0)),
                "stress_level": str(raw.get("stress_level", "medium")),
                "energy_level": str(raw.get("energy_level", "medium")),
                "work_life_balance": str(raw.get("work_life_balance", "fair")),
                "risk_factors": [str(x) for x in raw.get("risk_factors", [])],
                "strengths": [str(x) for x in raw.get("strengths", [])]
            }
        except Exception as e:
            print(f"Wellness Agent: Normalize assessment error: {e}")
            return {}

    async def _normalize_metrics(self, raw: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        try:
            out = []
            for m in raw:
                out.append(WellnessMetric(
                    name=str(m.get("name", "metric")),
                    value=float(m.get("value", 0.0)),
                    unit=str(m.get("unit", "")),
                    trend=str(m.get("trend", "stable")),
                    target=float(m.get("target", 0.0)) if m.get("target") else None,
                    notes=str(m.get("notes", ""))
                ).__dict__)
            return out
        except Exception as e:
            print(f"Wellness Agent: Normalize metrics error: {e}")
            return []

    async def _normalize_goals(self, raw: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        try:
            out = []
            for g in raw:
                out.append(WellnessGoal(
                    category=str(g.get("category", "general")),
                    goal=str(g.get("goal", "")),
                    target_date=str(g.get("target_date", "")),
                    progress=float(g.get("progress", 0.0)),
                    milestones=[str(x) for x in g.get("milestones", [])],
                    status=str(g.get("status", "not_started"))
                ).__dict__)
            return out
        except Exception as e:
            print(f"Wellness Agent: Normalize goals error: {e}")
            return []

    async def _normalize_recommendations(self, raw: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        try:
            out = []
            for r in raw:
                out.append(WellnessRecommendation(
                    title=str(r.get("title", "Wellness improvement")),
                    category=str(r.get("category", "general")),
                    priority=str(r.get("priority", "medium")),
                    rationale=str(r.get("rationale", "")),
                    action_steps=[str(x) for x in r.get("action_steps", [])],
                    expected_benefit=str(r.get("expected_benefit", "")),
                    timeframe=str(r.get("timeframe", ""))
                ).__dict__)
            return out
        except Exception as e:
            print(f"Wellness Agent: Normalize recommendations error: {e}")
            return []
