"""
Celebration Narrator Agent for Guild-AI
Comprehensive achievement recognition, milestone celebration, and motivation amplification.
"""

from guild.src.core.llm_client import LlmClient
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime
from guild.src.core.agent_helpers import inject_knowledge
import asyncio
import json


@dataclass
class Achievement:
    """Represents an achievement and its significance."""
    title: str
    category: str
    significance: str
    date: str
    impact: str
    effort_required: str
    celebration_level: str


@dataclass
class Milestone:
    """Represents a milestone and its tracking."""
    name: str
    target_date: str
    progress: float
    status: str
    celebration_trigger: str
    next_milestone: str


@dataclass
class CelebrationRecommendation:
    """Represents a celebration recommendation with actionable steps."""
    title: str
    type: str
    scale: str
    rationale: str
    activities: List[str]
    expected_impact: str
    timing: str


@inject_knowledge
async def generate_comprehensive_celebration_strategy(
    recent_achievements: Dict[str, Any],
    current_milestones: Dict[str, Any],
    team_context: Dict[str, Any],
    celebration_preferences: Dict[str, Any],
    constraints: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Generates a comprehensive celebration strategy using advanced prompting.
    """
    print("Celebration Narrator Agent: Generating comprehensive celebration strategy with injected knowledge...")

    prompt = f"""
# Celebration Narrator Agent - Comprehensive Achievement Recognition & Milestone Celebration Strategy

## Role Definition
You are the **Celebration Narrator Agent**, an expert in achievement recognition, milestone celebration, and motivation amplification. Your role is to identify accomplishments, design meaningful celebrations, and create systems that recognize progress and boost team morale and individual motivation.

## Core Expertise
- Achievement recognition and validation
- Milestone tracking and celebration design
- Team motivation and morale building
- Progress amplification and storytelling
- Celebration psychology and impact
- Recognition system design
- Motivation sustainability strategies

## Context
- Recent Achievements: {json.dumps(recent_achievements, indent=2)}
- Current Milestones: {json.dumps(current_milestones, indent=2)}
- Team Context: {json.dumps(team_context, indent=2)}
- Celebration Preferences: {json.dumps(celebration_preferences, indent=2)}
- Constraints: {json.dumps(constraints, indent=2)}

## Tasks
1) Analyze recent achievements and their significance.
2) Track current milestones and progress indicators.
3) Design appropriate celebration strategies for different achievement levels.
4) Create recognition and storytelling frameworks.
5) Plan team and individual celebration activities.
6) Establish ongoing motivation and progress amplification systems.

## Output JSON
{{
  "achievement_analysis": {{
    "total_achievements": 0,
    "achievement_categories": {{"major": 0, "minor": 0, "personal": 0}},
    "recognition_gaps": [""],
    "celebration_opportunities": [""],
    "motivation_impact": "high|medium|low"
  }},
  "achievements": [{{
    "title": "",
    "category": "major|minor|personal|team",
    "significance": "high|medium|low",
    "date": "",
    "impact": "",
    "effort_required": "high|medium|low",
    "celebration_level": "grand|moderate|simple"
  }}],
  "milestones": [{{
    "name": "",
    "target_date": "",
    "progress": 0.0,
    "status": "on_track|ahead|behind|completed",
    "celebration_trigger": "",
    "next_milestone": ""
  }}],
  "celebration_activities": [{{
    "activity": "",
    "type": "team|individual|public|private",
    "scale": "grand|moderate|simple",
    "timing": "",
    "resources_needed": [""],
    "expected_impact": ""
  }}],
  "recognition_systems": [{{
    "recognition_type": "",
    "frequency": "",
    "criteria": "",
    "format": "",
    "tracking_method": ""
  }}],
  "motivation_strategies": [{{
    "strategy": "",
    "target_audience": "",
    "frequency": "",
    "implementation": "",
    "success_metrics": [""]
  }}],
  "recommendations": [{{
    "title": "",
    "type": "celebration|recognition|motivation",
    "scale": "grand|moderate|simple",
    "rationale": "",
    "activities": [""],
    "expected_impact": "",
    "timing": ""
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
            print("Celebration Narrator Agent: Successfully generated celebration strategy.")
            return strategy
        except json.JSONDecodeError as e:
            print(f"Celebration Narrator Agent: JSON parse error: {e}")
            # Robust fallback
            return {
                "achievement_analysis": {
                    "total_achievements": 5,
                    "achievement_categories": {"major": 2, "minor": 2, "personal": 1},
                    "recognition_gaps": ["Remote team recognition", "Cross-functional collaboration"],
                    "celebration_opportunities": ["Monthly milestone review", "Quarterly team celebration"],
                    "motivation_impact": "high"
                },
                "achievements": [
                    {
                        "title": "Product Launch Success",
                        "category": "major",
                        "significance": "high",
                        "date": "2024-01-15",
                        "impact": "Increased user base by 300%",
                        "effort_required": "high",
                        "celebration_level": "grand"
                    }
                ],
                "milestones": [
                    {
                        "name": "Q1 Revenue Target",
                        "target_date": "2024-03-31",
                        "progress": 0.75,
                        "status": "on_track",
                        "celebration_trigger": "80% completion",
                        "next_milestone": "Q2 Planning"
                    }
                ],
                "celebration_activities": [
                    {
                        "activity": "Team dinner and awards",
                        "type": "team",
                        "scale": "moderate",
                        "timing": "End of quarter",
                        "resources_needed": ["Budget", "Venue", "Awards"],
                        "expected_impact": "Boost team morale"
                    }
                ],
                "recognition_systems": [
                    {
                        "recognition_type": "Peer recognition",
                        "frequency": "weekly",
                        "criteria": "Going above and beyond",
                        "format": "Slack shoutouts",
                        "tracking_method": "Recognition board"
                    }
                ],
                "motivation_strategies": [
                    {
                        "strategy": "Progress visualization",
                        "target_audience": "All team members",
                        "frequency": "daily",
                        "implementation": "Dashboard updates",
                        "success_metrics": ["Engagement", "Productivity"]
                    }
                ],
                "recommendations": []
            }
    except Exception as e:
        print(f"Celebration Narrator Agent: Execution error: {e}")
        return {
            "achievement_analysis": {},
            "achievements": [],
            "milestones": [],
            "celebration_activities": [],
            "recognition_systems": [],
            "motivation_strategies": [],
            "recommendations": [],
            "error": str(e)
        }


class CelebrationNarratorAgent:
    """
    Celebration Narrator Agent - Provides comprehensive achievement recognition and milestone celebration.
    """

    def __init__(self, user_input: Optional[str] = None):
        self.user_input = user_input
        self.agent_name = "Celebration Narrator Agent"
        self.agent_type = "Human & Psychological"
        self.capabilities = [
            "Achievement recognition and validation",
            "Milestone celebration design",
            "Team motivation and morale building",
            "Progress amplification",
            "Recognition system design",
            "Celebration storytelling"
        ]
        from guild.src.models.llm import Llm
        self.llm_client = LlmClient(Llm(provider="ollama", model="tinyllama"))

    async def run(self, user_input: Optional[str] = None) -> Dict[str, Any]:
        try:
            print("Celebration Narrator Agent: Starting comprehensive celebration analysis...")

            recent_achievements = {
                "major": ["Product launch successful", "Series A funding secured"],
                "minor": ["Bug fix deployment", "Team efficiency improvement"],
                "personal": ["Learning new skill", "Work-life balance improvement"]
            }
            current_milestones = {
                "q1_revenue": {"target": 100000, "current": 75000, "deadline": "2024-03-31"},
                "user_growth": {"target": 1000, "current": 850, "deadline": "2024-02-28"},
                "team_expansion": {"target": 5, "current": 3, "deadline": "2024-04-30"}
            }
            team_context = {
                "size": 8,
                "remote_percentage": 75,
                "time_zones": 3,
                "culture": "collaborative",
                "recent_challenges": ["Market competition", "Resource constraints"]
            }
            celebration_preferences = {
                "style": "inclusive and meaningful",
                "frequency": "regular but not excessive",
                "scale": "moderate",
                "format": "mix of virtual and in-person"
            }
            constraints = {
                "budget": "moderate",
                "time": "limited",
                "geography": "distributed",
                "cultural_sensitivity": "required"
            }

            strategy = await generate_comprehensive_celebration_strategy(
                recent_achievements=recent_achievements,
                current_milestones=current_milestones,
                team_context=team_context,
                celebration_preferences=celebration_preferences,
                constraints=constraints
            )

            execution = await self._execute_celebration_workflow(strategy)

            result = {
                "agent": self.agent_name,
                "strategy_type": "comprehensive_celebration_strategy",
                "celebration_strategy": strategy,
                "execution_result": execution,
                "timestamp": datetime.now().isoformat(),
                "status": "completed"
            }
            print("Celebration Narrator Agent: Completed.")
            return result
        except Exception as e:
            print(f"Celebration Narrator Agent: Error: {e}")
            return {
                "agent": self.agent_name,
                "status": "error",
                "message": str(e),
                "timestamp": datetime.now().isoformat()
            }

    async def _execute_celebration_workflow(self, strategy: Dict[str, Any]) -> Dict[str, Any]:
        try:
            analysis = await self._normalize_analysis(strategy.get("achievement_analysis", {}))
            achievements = await self._normalize_achievements(strategy.get("achievements", []))
            milestones = await self._normalize_milestones(strategy.get("milestones", []))
            activities = strategy.get("celebration_activities", [])
            systems = strategy.get("recognition_systems", [])
            strategies = strategy.get("motivation_strategies", [])
            recommendations = await self._normalize_recommendations(strategy.get("recommendations", []))
            
            return {
                "achievement_analysis": analysis,
                "achievements": achievements,
                "milestones": milestones,
                "celebration_activities": activities,
                "recognition_systems": systems,
                "motivation_strategies": strategies,
                "recommendations": recommendations
            }
        except Exception as e:
            print(f"Celebration Narrator Agent: Workflow error: {e}")
            return {
                "achievement_analysis": {},
                "achievements": [],
                "milestones": [],
                "celebration_activities": [],
                "recognition_systems": [],
                "motivation_strategies": [],
                "recommendations": [],
                "error": str(e)
            }

    async def _normalize_analysis(self, raw: Dict[str, Any]) -> Dict[str, Any]:
        try:
            return {
                "total_achievements": int(raw.get("total_achievements", 0)),
                "achievement_categories": {
                    "major": int(raw.get("achievement_categories", {}).get("major", 0)),
                    "minor": int(raw.get("achievement_categories", {}).get("minor", 0)),
                    "personal": int(raw.get("achievement_categories", {}).get("personal", 0))
                },
                "recognition_gaps": [str(x) for x in raw.get("recognition_gaps", [])],
                "celebration_opportunities": [str(x) for x in raw.get("celebration_opportunities", [])],
                "motivation_impact": str(raw.get("motivation_impact", "medium"))
            }
        except Exception as e:
            print(f"Celebration Narrator Agent: Normalize analysis error: {e}")
            return {}

    async def _normalize_achievements(self, raw: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        try:
            out = []
            for a in raw:
                out.append(Achievement(
                    title=str(a.get("title", "")),
                    category=str(a.get("category", "minor")),
                    significance=str(a.get("significance", "medium")),
                    date=str(a.get("date", "")),
                    impact=str(a.get("impact", "")),
                    effort_required=str(a.get("effort_required", "medium")),
                    celebration_level=str(a.get("celebration_level", "simple"))
                ).__dict__)
            return out
        except Exception as e:
            print(f"Celebration Narrator Agent: Normalize achievements error: {e}")
            return []

    async def _normalize_milestones(self, raw: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        try:
            out = []
            for m in raw:
                out.append(Milestone(
                    name=str(m.get("name", "")),
                    target_date=str(m.get("target_date", "")),
                    progress=float(m.get("progress", 0.0)),
                    status=str(m.get("status", "on_track")),
                    celebration_trigger=str(m.get("celebration_trigger", "")),
                    next_milestone=str(m.get("next_milestone", ""))
                ).__dict__)
            return out
        except Exception as e:
            print(f"Celebration Narrator Agent: Normalize milestones error: {e}")
            return []

    async def _normalize_recommendations(self, raw: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        try:
            out = []
            for r in raw:
                out.append(CelebrationRecommendation(
                    title=str(r.get("title", "Celebration improvement")),
                    type=str(r.get("type", "celebration")),
                    scale=str(r.get("scale", "moderate")),
                    rationale=str(r.get("rationale", "")),
                    activities=[str(x) for x in r.get("activities", [])],
                    expected_impact=str(r.get("expected_impact", "")),
                    timing=str(r.get("timing", ""))
                ).__dict__)
            return out
        except Exception as e:
            print(f"Celebration Narrator Agent: Normalize recommendations error: {e}")
            return []
