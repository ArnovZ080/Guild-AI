"""
Calendar Harmony Agent for Guild-AI
Comprehensive schedule harmonization, time-blocking, and conflict resolution.
"""

from guild.src.core.llm_client import LlmClient
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime, timedelta
from guild.src.core.agent_helpers import inject_knowledge
import asyncio
import json


@dataclass
class CalendarEvent:
    """Represents a calendar event."""
    id: str
    title: str
    start: str  # ISO
    end: str    # ISO
    location: Optional[str]
    attendees: List[str]
    calendar: str
    is_all_day: bool
    is_focus_block: bool
    priority: str  # high|medium|low


@dataclass
class CalendarRule:
    """Represents a scheduling rule or preference."""
    name: str
    description: str
    active: bool
    parameters: Dict[str, Any]


@dataclass
class Suggestion:
    """Represents an actionable scheduling suggestion."""
    type: str
    description: str
    proposed_time: Optional[str]
    impact: str
    confidence: float


@inject_knowledge
async def generate_comprehensive_calendar_strategy(
    current_calendar: Dict[str, Any],
    preferences: Dict[str, Any],
    team_availability: Dict[str, Any],
    timezone: str,
    objectives: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Generates a comprehensive calendar harmonization strategy using advanced prompting.
    """
    print("Calendar Harmony Agent: Generating comprehensive calendar strategy with injected knowledge...")

    prompt = f"""
# Calendar Harmony Agent - Schedule Optimization & Conflict Resolution

## Role Definition
You are the **Calendar Harmony Agent**, an expert in time-blocking, schedule optimization, and meeting load management. Your role is to create an optimal calendar plan that maximizes focus time, minimizes context switching, and respects preferences and team constraints.

## Core Expertise
- Time-blocking and focus-time optimization
- Conflict detection and resolution suggestions
- Meeting load balancing and batching
- Priority-aware scheduling rules
- Cross-timezone coordination and fairness
- Buffer times, travel time, and energy management

## Context
- Current Calendar: {json.dumps(current_calendar, indent=2)}
- Preferences: {json.dumps(preferences, indent=2)}
- Team Availability: {json.dumps(team_availability, indent=2)}
- Timezone: {timezone}
- Objectives: {json.dumps(objectives, indent=2)}

## Tasks
1) Identify conflicts, fragmentation, and overbooked days.
2) Propose time-blocks for deep work aligned to energy peaks.
3) Suggest meeting moves/batching to reduce context switching.
4) Respect DND windows, lunch, and recovery buffers.
5) Output concrete rescheduling suggestions and a weekly plan.

## Output JSON
{{
  "issues": [""],
  "focus_blocks": [{{"title":"","start":"","end":"","reason":""}}],
  "reschedule": [{{"event_id":"","from":"","to":"","reason":"","impact":"","confidence":0.0}}],
  "rules": [{{"name":"","description":"","active":true,"parameters":{{}}}}],
  "weekly_plan": [{{"day":"Mon|Tue|...","blocks":[{{"start":"","end":"","type":"focus|meetings|admin"}}]}}]
}}
Return only JSON.
"""

    try:
        from guild.src.models.llm import Llm
        client = LlmClient(Llm(provider="ollama", model="tinyllama"))
        response = await client.chat(prompt)
        try:
            strategy = json.loads(response)
            print("Calendar Harmony Agent: Successfully generated strategy.")
            return strategy
        except json.JSONDecodeError as e:
            print(f"Calendar Harmony Agent: JSON parse error: {e}")
            # Robust fallback
            return {
                "issues": ["Calendar fragmentation", "Insufficient focus time"],
                "focus_blocks": [
                    {"title": "Deep Work AM", "start": "09:00", "end": "11:00", "reason": "Energy peak"},
                    {"title": "Deep Work PM", "start": "14:00", "end": "16:00", "reason": "Project milestone"}
                ],
                "reschedule": [],
                "rules": [
                    {"name": "No Meetings AM", "description": "Protect 9-11am", "active": True, "parameters": {"days": ["Mon","Tue","Wed","Thu"], "window": ["09:00","11:00"]}}
                ],
                "weekly_plan": []
            }
    except Exception as e:
        print(f"Calendar Harmony Agent: Execution error: {e}")
        return {
            "issues": [],
            "focus_blocks": [],
            "reschedule": [],
            "rules": [],
            "weekly_plan": [],
            "error": str(e)
        }


class CalendarHarmonyAgent:
    """
    Calendar Harmony Agent - Optimizes schedules for focus and meeting efficiency.
    """

    def __init__(self, user_input: Optional[str] = None):
        self.user_input = user_input
        self.agent_name = "Calendar Harmony Agent"
        self.agent_type = "Automation & Productivity Enhancement"
        self.capabilities = [
            "Time-blocking",
            "Conflict resolution",
            "Meeting batching",
            "Priority-aware scheduling",
            "Timezone coordination"
        ]
        from guild.src.models.llm import Llm
        self.llm_client = LlmClient(Llm(provider="ollama", model="tinyllama"))

    async def run(self, user_input: Optional[str] = None) -> Dict[str, Any]:
        try:
            print("Calendar Harmony Agent: Starting comprehensive schedule harmonization...")

            # Example inputs
            current_calendar = {
                "events": [
                    {"id": "evt-1", "title": "Standup", "start": "2025-09-19T10:00:00", "end": "2025-09-19T10:15:00", "calendar": "Team", "is_all_day": False, "is_focus_block": False, "priority": "medium"},
                    {"id": "evt-2", "title": "Client Call", "start": "2025-09-19T11:00:00", "end": "2025-09-19T12:00:00", "calendar": "External", "is_all_day": False, "is_focus_block": False, "priority": "high"}
                ]
            }
            preferences = {
                "dnd_windows": [{"days": ["Mon","Tue","Wed","Thu"], "window": ["09:00","11:00"]}],
                "lunch": {"start": "12:30", "end": "13:00"},
                "buffers": {"before_meeting": 10, "after_meeting": 10},
                "meeting_batching": {"afternoons_only": True}
            }
            team_availability = {"overlaps": {"core_hours": ["10:00","16:00"]}}
            timezone = "America/Los_Angeles"
            objectives = {"focus_hours_target": 3, "max_meeting_hours": 4}

            strategy = await generate_comprehensive_calendar_strategy(
                current_calendar=current_calendar,
                preferences=preferences,
                team_availability=team_availability,
                timezone=timezone,
                objectives=objectives
            )

            execution = await self._execute_calendar_workflow(strategy, timezone)

            result = {
                "agent": self.agent_name,
                "strategy_type": "comprehensive_calendar_harmony",
                "calendar_strategy": strategy,
                "execution_result": execution,
                "timestamp": datetime.now().isoformat(),
                "status": "completed"
            }
            print("Calendar Harmony Agent: Completed.")
            return result
        except Exception as e:
            print(f"Calendar Harmony Agent: Error: {e}")
            return {
                "agent": self.agent_name,
                "status": "error",
                "message": str(e),
                "timestamp": datetime.now().isoformat()
            }

    async def _execute_calendar_workflow(self, strategy: Dict[str, Any], tz: str) -> Dict[str, Any]:
        try:
            issues = strategy.get("issues", [])
            focus_blocks = await self._normalize_focus_blocks(strategy.get("focus_blocks", []), tz)
            reschedule = await self._normalize_reschedules(strategy.get("reschedule", []), tz)
            rules = await self._normalize_rules(strategy.get("rules", []))
            weekly_plan = await self._normalize_weekly_plan(strategy.get("weekly_plan", []), tz)
            metrics = await self._derive_metrics(focus_blocks, reschedule)
            return {
                "issues": issues,
                "focus_blocks": focus_blocks,
                "reschedule": reschedule,
                "rules": rules,
                "weekly_plan": weekly_plan,
                "metrics": metrics
            }
        except Exception as e:
            print(f"Calendar Harmony Agent: Workflow error: {e}")
            return {
                "issues": [],
                "focus_blocks": [],
                "reschedule": [],
                "rules": [],
                "weekly_plan": [],
                "metrics": {},
                "error": str(e)
            }

    async def _normalize_focus_blocks(self, raw: List[Dict[str, Any]], tz: str) -> List[Dict[str, Any]]:
        out = []
        try:
            for i, b in enumerate(raw):
                out.append({
                    "id": f"fb-{i+1:03d}",
                    "title": str(b.get("title", "Focus")),
                    "start": str(b.get("start", "09:00")),
                    "end": str(b.get("end", "11:00")),
                    "reason": str(b.get("reason", "")),
                    "timezone": tz
                })
            return out
        except Exception as e:
            print(f"Calendar Harmony Agent: Focus blocks error: {e}")
            return []

    async def _normalize_reschedules(self, raw: List[Dict[str, Any]], tz: str) -> List[Dict[str, Any]]:
        out = []
        try:
            for r in raw:
                out.append({
                    "event_id": str(r.get("event_id", "")),
                    "from": str(r.get("from", "")),
                    "to": str(r.get("to", "")),
                    "reason": str(r.get("reason", "")),
                    "impact": str(r.get("impact", "")),
                    "confidence": float(r.get("confidence", 0.6)),
                    "timezone": tz
                })
            return out
        except Exception as e:
            print(f"Calendar Harmony Agent: Reschedule error: {e}")
            return []

    async def _normalize_rules(self, raw: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        out = []
        try:
            for r in raw:
                out.append(CalendarRule(
                    name=str(r.get("name", "rule")),
                    description=str(r.get("description", "")),
                    active=bool(r.get("active", True)),
                    parameters=r.get("parameters", {})
                ).__dict__)
            return out
        except Exception as e:
            print(f"Calendar Harmony Agent: Rules error: {e}")
            return []

    async def _normalize_weekly_plan(self, raw: List[Dict[str, Any]], tz: str) -> List[Dict[str, Any]]:
        try:
            plan = []
            for d in raw:
                blocks = []
                for b in d.get("blocks", []):
                    blocks.append({
                        "start": str(b.get("start", "")),
                        "end": str(b.get("end", "")),
                        "type": str(b.get("type", "focus")),
                        "timezone": tz
                    })
                plan.append({"day": d.get("day", "Mon"), "blocks": blocks})
            return plan
        except Exception as e:
            print(f"Calendar Harmony Agent: Weekly plan error: {e}")
            return []

    async def _derive_metrics(self, focus_blocks: List[Dict[str, Any]], reschedule: List[Dict[str, Any]]) -> Dict[str, Any]:
        try:
            focus_hours = 0.0
            for b in focus_blocks:
                try:
                    start = datetime.strptime(b["start"], "%H:%M")
                    end = datetime.strptime(b["end"], "%H:%M")
                    focus_hours += (end - start).seconds / 3600.0
                except Exception:
                    continue
            return {
                "total_focus_hours": round(focus_hours, 2),
                "reschedule_count": len(reschedule)
            }
        except Exception as e:
            print(f"Calendar Harmony Agent: Metrics error: {e}")
            return {}
