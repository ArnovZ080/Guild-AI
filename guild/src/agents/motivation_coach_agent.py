"""
Motivation Coach Agent for Guild-AI
Personalized motivation, habit systems, and accountability nudges.
"""

from guild.src.core.llm_client import LlmClient
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime, timedelta
from guild.src.core.agent_helpers import inject_knowledge
import asyncio
import json


@dataclass
class Habit:
    """Represents a habit with cadence and tracking."""
    name: str
    cadence: str  # daily|weekly|custom
    target_count: int
    streak: int
    last_done: Optional[str]


@dataclass
class Nudge:
    """Represents a motivational nudge/actionable prompt."""
    type: str  # reminder|celebration|reframe|micro-step
    message: str
    timing: str  # now|morning|afternoon|evening
    confidence: float


@dataclass
class Barrier:
    """Represents a barrier and suggested reframes/actions."""
    description: str
    category: str  # time|energy|clarity|fear|overwhelm
    reframes: List[str]
    actions: List[str]


@inject_knowledge
async def generate_comprehensive_motivation_strategy(
    goals: Dict[str, Any],
    habits: List[Dict[str, Any]],
    schedule: Dict[str, Any],
    barriers: List[Dict[str, Any]],
    preferences: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Generates a comprehensive motivation and habit strategy using advanced prompting.
    """
    print("Motivation Coach Agent: Generating comprehensive motivation strategy with injected knowledge...")

    prompt = f"""
# Motivation Coach Agent - Personalized Motivation & Habit Systems

## Role Definition
You are the **Motivation Coach Agent**, an expert in behavior design, habit formation, and motivational interviewing. Your role is to create small-wins systems, timely nudges, and positive reinforcement that align with the user's goals and preferences.

## Core Expertise
- Tiny-habits and atomic steps
- Streaks, cues, and implementation intentions
- Motivation reframes and self-compassion
- Accountability systems and check-ins
- Celebration and reward mechanisms

## Context
- Goals: {json.dumps(goals, indent=2)}
- Habits: {json.dumps(habits, indent=2)}
- Schedule: {json.dumps(schedule, indent=2)}
- Barriers: {json.dumps(barriers, indent=2)}
- Preferences: {json.dumps(preferences, indent=2)}

## Tasks
1) Translate goals into 1-2 tiny habits each with clear cues.
2) Propose daily/weekly check-ins and simple tracking.
3) Identify likely barriers and provide reframes + micro-actions.
4) Generate time-aware nudges and celebrations.

## Output JSON
{{
  "habit_plan": [{{"name":"","cadence":"","target_count":1,"cue":"","tiny_step":""}}],
  "check_ins": {{"daily":"","weekly":""}},
  "barrier_playbook": [{{"description":"","category":"","reframes":[""],"actions":[""]}}],
  "nudges": [{{"type":"","message":"","timing":"","confidence":0.0}}],
  "celebrations": [""],
  "accountability": {{"buddy":"","channel":"","cadence":""}}
}}
Return only JSON.
"""

    try:
        from guild.src.models.llm import Llm
        client = LlmClient(Llm(provider="ollama", model="tinyllama"))
        response = await client.chat(prompt)
        try:
            strategy = json.loads(response)
            print("Motivation Coach Agent: Successfully generated strategy.")
            return strategy
        except json.JSONDecodeError as e:
            print(f"Motivation Coach Agent: JSON parse error: {e}")
            # Fallback structure
            return {
                "habit_plan": [
                    {"name": "Daily Focus Sprint", "cadence": "daily", "target_count": 1, "cue": "after coffee", "tiny_step": "2-minute start"}
                ],
                "check_ins": {"daily": "End-of-day 2 mins", "weekly": "Friday review 10 mins"},
                "barrier_playbook": [],
                "nudges": [
                    {"type": "reminder", "message": "Start with a 2-minute action now.", "timing": "now", "confidence": 0.7}
                ],
                "celebrations": ["Mark the streak and say 'I showed up'"],
                "accountability": {"buddy": "self", "channel": "journal", "cadence": "daily"}
            }
    except Exception as e:
        print(f"Motivation Coach Agent: Execution error: {e}")
        return {
            "habit_plan": [],
            "check_ins": {},
            "barrier_playbook": [],
            "nudges": [],
            "celebrations": [],
            "accountability": {},
            "error": str(e)
        }


class MotivationCoachAgent:
    """
    Motivation Coach Agent - Builds tiny-habit systems with timely nudges and celebration.
    """

    def __init__(self, user_input: Optional[str] = None):
        self.user_input = user_input
        self.agent_name = "Motivation Coach Agent"
        self.agent_type = "Human & Psychological"
        self.capabilities = [
            "Tiny-habits",
            "Motivational interviewing",
            "Streaks & cues",
            "Check-ins & accountability",
            "Celebration & reward"
        ]
        from guild.src.models.llm import Llm
        self.llm_client = LlmClient(Llm(provider="ollama", model="tinyllama"))

    async def run(self, user_input: Optional[str] = None) -> Dict[str, Any]:
        try:
            print("Motivation Coach Agent: Starting comprehensive coaching...")

            goals = {"primary": ["Ship feature X", "Exercise 3x/week"]}
            habits = [{"name": "Focus Sprint", "cadence": "daily", "target_count": 1, "streak": 3, "last_done": None}]
            schedule = {"busy_hours": ["10:00-16:00"], "preferred_times": ["09:00", "16:30"]}
            barriers = [{"description": "Low energy after lunch", "category": "energy"}]
            preferences = {"tone": "encouraging", "celebration_style": "subtle"}

            strategy = await generate_comprehensive_motivation_strategy(
                goals=goals,
                habits=habits,
                schedule=schedule,
                barriers=barriers,
                preferences=preferences
            )

            execution = await self._execute_coaching_workflow(strategy)

            result = {
                "agent": self.agent_name,
                "strategy_type": "comprehensive_motivation_coaching",
                "motivation_strategy": strategy,
                "execution_result": execution,
                "timestamp": datetime.now().isoformat(),
                "status": "completed"
            }
            print("Motivation Coach Agent: Completed.")
            return result
        except Exception as e:
            print(f"Motivation Coach Agent: Error: {e}")
            return {
                "agent": self.agent_name,
                "status": "error",
                "message": str(e),
                "timestamp": datetime.now().isoformat()
            }

    async def _execute_coaching_workflow(self, strategy: Dict[str, Any]) -> Dict[str, Any]:
        try:
            habit_plan = await self._normalize_habits(strategy.get("habit_plan", []))
            nudges = await self._normalize_nudges(strategy.get("nudges", []))
            barriers = await self._normalize_barriers(strategy.get("barrier_playbook", []))
            check_ins = strategy.get("check_ins", {})
            celebrations = strategy.get("celebrations", [])
            accountability = strategy.get("accountability", {})
            next_nudge = await self._choose_next_nudge(nudges)
            return {
                "habit_plan": habit_plan,
                "nudges": nudges,
                "barrier_playbook": barriers,
                "check_ins": check_ins,
                "celebrations": celebrations,
                "accountability": accountability,
                "next_nudge": next_nudge
            }
        except Exception as e:
            print(f"Motivation Coach Agent: Workflow error: {e}")
            return {"habit_plan": [], "nudges": [], "barrier_playbook": [], "check_ins": {}, "celebrations": [], "accountability": {}, "error": str(e)}

    async def _normalize_habits(self, raw: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        out = []
        try:
            for h in raw:
                out.append(Habit(
                    name=str(h.get("name", "Habit")),
                    cadence=str(h.get("cadence", "daily")),
                    target_count=int(h.get("target_count", 1)),
                    streak=int(h.get("streak", 0)),
                    last_done=h.get("last_done")
                ).__dict__)
            return out
        except Exception as e:
            print(f"Motivation Coach Agent: Normalize habits error: {e}")
            return []

    async def _normalize_nudges(self, raw: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        out = []
        try:
            for n in raw:
                out.append(Nudge(
                    type=str(n.get("type", "reminder")),
                    message=str(n.get("message", "Take a tiny step now.")),
                    timing=str(n.get("timing", "now")),
                    confidence=float(n.get("confidence", 0.65))
                ).__dict__)
            return out
        except Exception as e:
            print(f"Motivation Coach Agent: Normalize nudges error: {e}")
            return []

    async def _normalize_barriers(self, raw: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        out = []
        try:
            for b in raw:
                out.append(Barrier(
                    description=str(b.get("description", "")),
                    category=str(b.get("category", "clarity")),
                    reframes=[str(x) for x in b.get("reframes", [])],
                    actions=[str(x) for x in b.get("actions", [])]
                ).__dict__)
            return out
        except Exception as e:
            print(f"Motivation Coach Agent: Normalize barriers error: {e}")
            return []

    async def _choose_next_nudge(self, nudges: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        try:
            if not nudges:
                return None
            # pick highest confidence immediate nudge, else first
            immediate = [n for n in nudges if n.get("timing") == "now"]
            pool = immediate or nudges
            pool.sort(key=lambda n: n.get("confidence", 0), reverse=True)
            return pool[0]
        except Exception:
            return nudges[0] if nudges else None
