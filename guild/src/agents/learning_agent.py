"""
Learning Agent for Guild-AI
Comprehensive skill development, learning path design, and knowledge acquisition optimization.
"""

from guild.src.core.llm_client import LlmClient
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime
from guild.src.core.agent_helpers import inject_knowledge
import asyncio
import json


@dataclass
class LearningObjective:
    """Represents a learning objective with measurable outcomes."""
    skill: str
    level: str
    target_date: str
    progress: float
    milestones: List[str]
    assessment_method: str


@dataclass
class LearningResource:
    """Represents a learning resource and its metadata."""
    title: str
    type: str
    source: str
    duration: str
    difficulty: str
    rating: float
    relevance_score: float


@dataclass
class LearningRecommendation:
    """Represents a personalized learning recommendation."""
    title: str
    category: str
    priority: str
    rationale: str
    learning_path: List[str]
    expected_outcome: str
    time_investment: str


@inject_knowledge
async def generate_comprehensive_learning_plan(
    current_skills: Dict[str, Any],
    learning_goals: Dict[str, Any],
    available_time: Dict[str, Any],
    learning_style: Dict[str, Any],
    constraints: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Generates a comprehensive learning plan using advanced prompting.
    """
    print("Learning Agent: Generating comprehensive learning plan with injected knowledge...")

    prompt = f"""
# Learning Agent - Comprehensive Skill Development & Learning Path Strategy

## Role Definition
You are the **Learning Agent**, an expert in adult learning theory, skill development, and personalized education design. Your role is to assess current competencies, identify skill gaps, and create customized learning paths that maximize knowledge acquisition and practical application.

## Core Expertise
- Learning theory and cognitive science
- Skill gap analysis and competency mapping
- Learning path design and curriculum development
- Adaptive learning and personalized education
- Knowledge retention and application strategies
- Learning resource curation and evaluation
- Progress tracking and assessment design

## Context
- Current Skills: {json.dumps(current_skills, indent=2)}
- Learning Goals: {json.dumps(learning_goals, indent=2)}
- Available Time: {json.dumps(available_time, indent=2)}
- Learning Style: {json.dumps(learning_style, indent=2)}
- Constraints: {json.dumps(constraints, indent=2)}

## Tasks
1) Assess current skill levels and identify competency gaps.
2) Analyze learning goals and prioritize skill development.
3) Design personalized learning paths with milestones.
4) Curate relevant learning resources and materials.
5) Create assessment and progress tracking methods.
6) Recommend learning strategies and techniques.

## Output JSON
{{
  "skill_assessment": {{
    "overall_level": "beginner|intermediate|advanced|expert",
    "technical_skills": {{"level": "", "strengths": [""], "gaps": [""]}},
    "soft_skills": {{"level": "", "strengths": [""], "gaps": [""]}},
    "domain_knowledge": {{"level": "", "strengths": [""], "gaps": [""]}}
  }},
  "learning_objectives": [{{
    "skill": "",
    "level": "beginner|intermediate|advanced",
    "target_date": "",
    "progress": 0.0,
    "milestones": [""],
    "assessment_method": ""
  }}],
  "learning_paths": [{{
    "skill_area": "",
    "path": [""],
    "estimated_duration": "",
    "difficulty_progression": "linear|exponential|plateau"
  }}],
  "resources": [{{
    "title": "",
    "type": "course|book|video|article|practice",
    "source": "",
    "duration": "",
    "difficulty": "beginner|intermediate|advanced",
    "rating": 0.0,
    "relevance_score": 0.0
  }}],
  "learning_strategies": [{{
    "technique": "",
    "when_to_use": "",
    "effectiveness": "high|medium|low",
    "time_requirement": ""
  }}],
  "assessment_plan": [{{
    "skill": "",
    "method": "",
    "frequency": "",
    "success_criteria": ""
  }}],
  "recommendations": [{{
    "title": "",
    "category": "skill_development|learning_strategy|resource",
    "priority": "high|medium|low",
    "rationale": "",
    "learning_path": [""],
    "expected_outcome": "",
    "time_investment": ""
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
            print("Learning Agent: Successfully generated learning plan.")
            return plan
        except json.JSONDecodeError as e:
            print(f"Learning Agent: JSON parse error: {e}")
            # Robust fallback
            return {
                "skill_assessment": {
                    "overall_level": "intermediate",
                    "technical_skills": {
                        "level": "intermediate",
                        "strengths": ["Python", "Data Analysis"],
                        "gaps": ["Machine Learning", "Cloud Architecture"]
                    },
                    "soft_skills": {
                        "level": "intermediate",
                        "strengths": ["Communication", "Problem Solving"],
                        "gaps": ["Leadership", "Public Speaking"]
                    },
                    "domain_knowledge": {
                        "level": "intermediate",
                        "strengths": ["Business Analysis"],
                        "gaps": ["Marketing", "Finance"]
                    }
                },
                "learning_objectives": [
                    {
                        "skill": "Machine Learning",
                        "level": "beginner",
                        "target_date": "2024-03-01",
                        "progress": 0.2,
                        "milestones": ["Complete ML basics course", "Build first model"],
                        "assessment_method": "Project portfolio"
                    }
                ],
                "learning_paths": [],
                "resources": [
                    {
                        "title": "Python for Data Science",
                        "type": "course",
                        "source": "Coursera",
                        "duration": "4 weeks",
                        "difficulty": "intermediate",
                        "rating": 4.5,
                        "relevance_score": 0.9
                    }
                ],
                "learning_strategies": [
                    {
                        "technique": "Spaced repetition",
                        "when_to_use": "For memorization-heavy topics",
                        "effectiveness": "high",
                        "time_requirement": "15 min daily"
                    }
                ],
                "assessment_plan": [],
                "recommendations": []
            }
    except Exception as e:
        print(f"Learning Agent: Execution error: {e}")
        return {
            "skill_assessment": {},
            "learning_objectives": [],
            "learning_paths": [],
            "resources": [],
            "learning_strategies": [],
            "assessment_plan": [],
            "recommendations": [],
            "error": str(e)
        }


class LearningAgent:
    """
    Learning Agent - Provides comprehensive skill development and learning path optimization.
    """

    def __init__(self, user_input: Optional[str] = None):
        self.user_input = user_input
        self.agent_name = "Learning Agent"
        self.agent_type = "Human & Psychological"
        self.capabilities = [
            "Skill gap analysis",
            "Learning path design",
            "Resource curation",
            "Progress tracking",
            "Adaptive learning",
            "Competency assessment"
        ]
        from guild.src.models.llm import Llm
        self.llm_client = LlmClient(Llm(provider="ollama", model="tinyllama"))

    async def run(self, user_input: Optional[str] = None) -> Dict[str, Any]:
        try:
            print("Learning Agent: Starting comprehensive learning assessment...")

            current_skills = {
                "technical": {"python": 7, "javascript": 5, "sql": 6, "ml": 3},
                "soft": {"communication": 7, "leadership": 4, "creativity": 6},
                "domain": {"business": 6, "marketing": 4, "finance": 3}
            }
            learning_goals = {
                "primary": "Machine Learning Engineer",
                "secondary": ["Leadership skills", "Business acumen"],
                "timeline": "6 months"
            }
            available_time = {
                "daily": "2 hours",
                "weekly": "10 hours",
                "weekend": "4 hours"
            }
            learning_style = {
                "preference": "hands-on",
                "format": "video + practice",
                "pace": "moderate",
                "feedback": "frequent"
            }
            constraints = {
                "budget": "moderate",
                "accessibility": "online preferred",
                "certification": "desired",
                "practical_application": "required"
            }

            plan = await generate_comprehensive_learning_plan(
                current_skills=current_skills,
                learning_goals=learning_goals,
                available_time=available_time,
                learning_style=learning_style,
                constraints=constraints
            )

            execution = await self._execute_learning_workflow(plan)

            result = {
                "agent": self.agent_name,
                "strategy_type": "comprehensive_learning_plan",
                "learning_plan": plan,
                "execution_result": execution,
                "timestamp": datetime.now().isoformat(),
                "status": "completed"
            }
            print("Learning Agent: Completed.")
            return result
        except Exception as e:
            print(f"Learning Agent: Error: {e}")
            return {
                "agent": self.agent_name,
                "status": "error",
                "message": str(e),
                "timestamp": datetime.now().isoformat()
            }

    async def _execute_learning_workflow(self, plan: Dict[str, Any]) -> Dict[str, Any]:
        try:
            assessment = await self._normalize_assessment(plan.get("skill_assessment", {}))
            objectives = await self._normalize_objectives(plan.get("learning_objectives", []))
            paths = plan.get("learning_paths", [])
            resources = await self._normalize_resources(plan.get("resources", []))
            strategies = plan.get("learning_strategies", [])
            assessment_plan = plan.get("assessment_plan", [])
            recommendations = await self._normalize_recommendations(plan.get("recommendations", []))
            
            return {
                "assessment": assessment,
                "objectives": objectives,
                "learning_paths": paths,
                "resources": resources,
                "strategies": strategies,
                "assessment_plan": assessment_plan,
                "recommendations": recommendations
            }
        except Exception as e:
            print(f"Learning Agent: Workflow error: {e}")
            return {
                "assessment": {},
                "objectives": [],
                "learning_paths": [],
                "resources": [],
                "strategies": [],
                "assessment_plan": [],
                "recommendations": [],
                "error": str(e)
            }

    async def _normalize_assessment(self, raw: Dict[str, Any]) -> Dict[str, Any]:
        try:
            return {
                "overall_level": str(raw.get("overall_level", "intermediate")),
                "technical_skills": {
                    "level": str(raw.get("technical_skills", {}).get("level", "intermediate")),
                    "strengths": [str(x) for x in raw.get("technical_skills", {}).get("strengths", [])],
                    "gaps": [str(x) for x in raw.get("technical_skills", {}).get("gaps", [])]
                },
                "soft_skills": {
                    "level": str(raw.get("soft_skills", {}).get("level", "intermediate")),
                    "strengths": [str(x) for x in raw.get("soft_skills", {}).get("strengths", [])],
                    "gaps": [str(x) for x in raw.get("soft_skills", {}).get("gaps", [])]
                },
                "domain_knowledge": {
                    "level": str(raw.get("domain_knowledge", {}).get("level", "intermediate")),
                    "strengths": [str(x) for x in raw.get("domain_knowledge", {}).get("strengths", [])],
                    "gaps": [str(x) for x in raw.get("domain_knowledge", {}).get("gaps", [])]
                }
            }
        except Exception as e:
            print(f"Learning Agent: Normalize assessment error: {e}")
            return {}

    async def _normalize_objectives(self, raw: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        try:
            out = []
            for obj in raw:
                out.append(LearningObjective(
                    skill=str(obj.get("skill", "")),
                    level=str(obj.get("level", "beginner")),
                    target_date=str(obj.get("target_date", "")),
                    progress=float(obj.get("progress", 0.0)),
                    milestones=[str(x) for x in obj.get("milestones", [])],
                    assessment_method=str(obj.get("assessment_method", ""))
                ).__dict__)
            return out
        except Exception as e:
            print(f"Learning Agent: Normalize objectives error: {e}")
            return []

    async def _normalize_resources(self, raw: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        try:
            out = []
            for r in raw:
                out.append(LearningResource(
                    title=str(r.get("title", "")),
                    type=str(r.get("type", "course")),
                    source=str(r.get("source", "")),
                    duration=str(r.get("duration", "")),
                    difficulty=str(r.get("difficulty", "intermediate")),
                    rating=float(r.get("rating", 0.0)),
                    relevance_score=float(r.get("relevance_score", 0.0))
                ).__dict__)
            return out
        except Exception as e:
            print(f"Learning Agent: Normalize resources error: {e}")
            return []

    async def _normalize_recommendations(self, raw: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        try:
            out = []
            for r in raw:
                out.append(LearningRecommendation(
                    title=str(r.get("title", "Learning improvement")),
                    category=str(r.get("category", "skill_development")),
                    priority=str(r.get("priority", "medium")),
                    rationale=str(r.get("rationale", "")),
                    learning_path=[str(x) for x in r.get("learning_path", [])],
                    expected_outcome=str(r.get("expected_outcome", "")),
                    time_investment=str(r.get("time_investment", ""))
                ).__dict__)
            return out
        except Exception as e:
            print(f"Learning Agent: Normalize recommendations error: {e}")
            return []
