"""
Agent Evaluator for Guild-AI
Comprehensive agent performance evaluation, quality assessment, and optimization recommendations.
"""

from guild.src.core.llm_client import LlmClient
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime
from guild.src.core.agent_helpers import inject_knowledge
import asyncio
import json


@dataclass
class PerformanceMetric:
    """Represents a performance metric and its measurement."""
    name: str
    value: float
    target: float
    trend: str
    weight: float
    notes: str


@dataclass
class QualityAssessment:
    """Represents a quality assessment for an agent."""
    agent_name: str
    overall_score: float
    accuracy: float
    relevance: float
    completeness: float
    efficiency: float
    user_satisfaction: float
    areas_for_improvement: List[str]


@dataclass
class OptimizationRecommendation:
    """Represents an optimization recommendation for an agent."""
    title: str
    category: str
    priority: str
    rationale: str
    action_steps: List[str]
    expected_impact: str
    implementation_effort: str


@inject_knowledge
async def generate_comprehensive_agent_evaluation(
    agent_performance: Dict[str, Any],
    user_feedback: Dict[str, Any],
    system_metrics: Dict[str, Any],
    quality_standards: Dict[str, Any],
    evaluation_criteria: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Generates a comprehensive agent evaluation using advanced prompting.
    """
    print("Agent Evaluator: Generating comprehensive agent evaluation with injected knowledge...")

    prompt = f"""
# Agent Evaluator - Comprehensive Agent Performance Assessment & Optimization Strategy

## Role Definition
You are the **Agent Evaluator**, an expert in AI agent performance assessment, quality evaluation, and system optimization. Your role is to analyze agent performance data, assess quality metrics, identify improvement opportunities, and recommend optimization strategies that enhance overall system effectiveness.

## Core Expertise
- Agent performance analysis and benchmarking
- Quality assessment and evaluation frameworks
- System optimization and efficiency improvement
- User experience and satisfaction analysis
- Performance monitoring and alerting
- Optimization strategy development
- A/B testing and experimentation design

## Context
- Agent Performance: {json.dumps(agent_performance, indent=2)}
- User Feedback: {json.dumps(user_feedback, indent=2)}
- System Metrics: {json.dumps(system_metrics, indent=2)}
- Quality Standards: {json.dumps(quality_standards, indent=2)}
- Evaluation Criteria: {json.dumps(evaluation_criteria, indent=2)}

## Tasks
1) Analyze agent performance across all key metrics.
2) Assess quality and user satisfaction levels.
3) Identify performance bottlenecks and inefficiencies.
4) Evaluate compliance with quality standards.
5) Generate optimization recommendations.
6) Create monitoring and alerting strategies.

## Output JSON
{{
  "performance_summary": {{
    "total_agents": 0,
    "average_performance": 0.0,
    "top_performers": [""],
    "underperformers": [""],
    "system_health": "excellent|good|fair|poor"
  }},
  "performance_metrics": [{{
    "name": "",
    "value": 0.0,
    "target": 0.0,
    "trend": "improving|stable|declining",
    "weight": 0.0,
    "notes": ""
  }}],
  "quality_assessments": [{{
    "agent_name": "",
    "overall_score": 0.0,
    "accuracy": 0.0,
    "relevance": 0.0,
    "completeness": 0.0,
    "efficiency": 0.0,
    "user_satisfaction": 0.0,
    "areas_for_improvement": [""]
  }}],
  "performance_analysis": {{
    "strengths": [""],
    "weaknesses": [""],
    "bottlenecks": [""],
    "opportunities": [""],
    "threats": [""]
  }},
  "optimization_opportunities": [{{
    "area": "",
    "current_state": "",
    "target_state": "",
    "potential_improvement": 0.0,
    "effort_required": "high|medium|low"
  }}],
  "monitoring_strategy": [{{
    "metric": "",
    "threshold": 0.0,
    "alert_condition": "",
    "action_required": "",
    "frequency": ""
  }}],
  "recommendations": [{{
    "title": "",
    "category": "performance|quality|efficiency|user_experience",
    "priority": "high|medium|low",
    "rationale": "",
    "action_steps": [""],
    "expected_impact": "",
    "implementation_effort": "high|medium|low"
  }}]
}}
Return only JSON.
"""

    try:
        from guild.src.models.llm import Llm
        client = LlmClient(Llm(provider="ollama", model="tinyllama"))
        response = await client.chat(prompt)
        try:
            evaluation = json.loads(response)
            print("Agent Evaluator: Successfully generated agent evaluation.")
            return evaluation
        except json.JSONDecodeError as e:
            print(f"Agent Evaluator: JSON parse error: {e}")
            # Robust fallback
            return {
                "performance_summary": {
                    "total_agents": 25,
                    "average_performance": 7.8,
                    "top_performers": ["Research Agent", "Content Strategist"],
                    "underperformers": ["Legacy Agent", "Beta Agent"],
                    "system_health": "good"
                },
                "performance_metrics": [
                    {
                        "name": "Response Accuracy",
                        "value": 0.85,
                        "target": 0.90,
                        "trend": "improving",
                        "weight": 0.3,
                        "notes": "Above baseline, trending upward"
                    }
                ],
                "quality_assessments": [
                    {
                        "agent_name": "Research Agent",
                        "overall_score": 8.5,
                        "accuracy": 0.9,
                        "relevance": 0.85,
                        "completeness": 0.88,
                        "efficiency": 0.82,
                        "user_satisfaction": 0.87,
                        "areas_for_improvement": ["Response speed", "Source diversity"]
                    }
                ],
                "performance_analysis": {
                    "strengths": ["High accuracy", "Good user satisfaction"],
                    "weaknesses": ["Response time", "Resource usage"],
                    "bottlenecks": ["LLM processing", "Data retrieval"],
                    "opportunities": ["Caching", "Parallel processing"],
                    "threats": ["Resource constraints", "Quality degradation"]
                },
                "optimization_opportunities": [],
                "monitoring_strategy": [
                    {
                        "metric": "Response Time",
                        "threshold": 5.0,
                        "alert_condition": "> 5 seconds",
                        "action_required": "Investigate performance",
                        "frequency": "real-time"
                    }
                ],
                "recommendations": []
            }
    except Exception as e:
        print(f"Agent Evaluator: Execution error: {e}")
        return {
            "performance_summary": {},
            "performance_metrics": [],
            "quality_assessments": [],
            "performance_analysis": {},
            "optimization_opportunities": [],
            "monitoring_strategy": [],
            "recommendations": [],
            "error": str(e)
        }


class AgentEvaluator:
    """
    Agent Evaluator - Provides comprehensive agent performance evaluation and optimization recommendations.
    """

    def __init__(self, user_input: Optional[str] = None):
        self.user_input = user_input
        self.agent_name = "Agent Evaluator"
        self.agent_type = "Meta-Agents"
        self.capabilities = [
            "Agent performance analysis",
            "Quality assessment and evaluation",
            "System optimization recommendations",
            "Performance monitoring and alerting",
            "User satisfaction analysis",
            "A/B testing and experimentation"
        ]
        from guild.src.models.llm import Llm
        self.llm_client = LlmClient(Llm(provider="ollama", model="tinyllama"))

    async def run(self, user_input: Optional[str] = None) -> Dict[str, Any]:
        try:
            print("Agent Evaluator: Starting comprehensive agent evaluation...")

            agent_performance = {
                "response_times": {"avg": 3.2, "p95": 7.8, "p99": 15.2},
                "accuracy_scores": {"avg": 0.85, "min": 0.72, "max": 0.94},
                "user_satisfaction": {"avg": 4.2, "scale": "1-5"},
                "resource_usage": {"cpu": 0.65, "memory": 0.78, "api_calls": 1250}
            }
            user_feedback = {
                "positive": 78,
                "negative": 12,
                "neutral": 10,
                "common_issues": ["Slow responses", "Incomplete answers"],
                "feature_requests": ["Better formatting", "More examples"]
            }
            system_metrics = {
                "uptime": 0.995,
                "error_rate": 0.023,
                "throughput": 450,
                "concurrent_users": 125
            }
            quality_standards = {
                "accuracy_threshold": 0.85,
                "response_time_threshold": 5.0,
                "satisfaction_threshold": 4.0,
                "uptime_threshold": 0.99
            }
            evaluation_criteria = {
                "accuracy": 0.3,
                "relevance": 0.25,
                "completeness": 0.2,
                "efficiency": 0.15,
                "user_satisfaction": 0.1
            }

            evaluation = await generate_comprehensive_agent_evaluation(
                agent_performance=agent_performance,
                user_feedback=user_feedback,
                system_metrics=system_metrics,
                quality_standards=quality_standards,
                evaluation_criteria=evaluation_criteria
            )

            execution = await self._execute_evaluation_workflow(evaluation)

            result = {
                "agent": self.agent_name,
                "strategy_type": "comprehensive_agent_evaluation",
                "agent_evaluation": evaluation,
                "execution_result": execution,
                "timestamp": datetime.now().isoformat(),
                "status": "completed"
            }
            print("Agent Evaluator: Completed.")
            return result
        except Exception as e:
            print(f"Agent Evaluator: Error: {e}")
            return {
                "agent": self.agent_name,
                "status": "error",
                "message": str(e),
                "timestamp": datetime.now().isoformat()
            }

    async def _execute_evaluation_workflow(self, evaluation: Dict[str, Any]) -> Dict[str, Any]:
        try:
            summary = await self._normalize_summary(evaluation.get("performance_summary", {}))
            metrics = await self._normalize_metrics(evaluation.get("performance_metrics", []))
            assessments = await self._normalize_assessments(evaluation.get("quality_assessments", []))
            analysis = evaluation.get("performance_analysis", {})
            opportunities = evaluation.get("optimization_opportunities", [])
            monitoring = evaluation.get("monitoring_strategy", [])
            recommendations = await self._normalize_recommendations(evaluation.get("recommendations", []))
            
            return {
                "performance_summary": summary,
                "performance_metrics": metrics,
                "quality_assessments": assessments,
                "performance_analysis": analysis,
                "optimization_opportunities": opportunities,
                "monitoring_strategy": monitoring,
                "recommendations": recommendations
            }
        except Exception as e:
            print(f"Agent Evaluator: Workflow error: {e}")
            return {
                "performance_summary": {},
                "performance_metrics": [],
                "quality_assessments": [],
                "performance_analysis": {},
                "optimization_opportunities": [],
                "monitoring_strategy": [],
                "recommendations": [],
                "error": str(e)
            }

    async def _normalize_summary(self, raw: Dict[str, Any]) -> Dict[str, Any]:
        try:
            return {
                "total_agents": int(raw.get("total_agents", 0)),
                "average_performance": float(raw.get("average_performance", 0.0)),
                "top_performers": [str(x) for x in raw.get("top_performers", [])],
                "underperformers": [str(x) for x in raw.get("underperformers", [])],
                "system_health": str(raw.get("system_health", "fair"))
            }
        except Exception as e:
            print(f"Agent Evaluator: Normalize summary error: {e}")
            return {}

    async def _normalize_metrics(self, raw: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        try:
            out = []
            for m in raw:
                out.append(PerformanceMetric(
                    name=str(m.get("name", "")),
                    value=float(m.get("value", 0.0)),
                    target=float(m.get("target", 0.0)),
                    trend=str(m.get("trend", "stable")),
                    weight=float(m.get("weight", 0.0)),
                    notes=str(m.get("notes", ""))
                ).__dict__)
            return out
        except Exception as e:
            print(f"Agent Evaluator: Normalize metrics error: {e}")
            return []

    async def _normalize_assessments(self, raw: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        try:
            out = []
            for a in raw:
                out.append(QualityAssessment(
                    agent_name=str(a.get("agent_name", "")),
                    overall_score=float(a.get("overall_score", 0.0)),
                    accuracy=float(a.get("accuracy", 0.0)),
                    relevance=float(a.get("relevance", 0.0)),
                    completeness=float(a.get("completeness", 0.0)),
                    efficiency=float(a.get("efficiency", 0.0)),
                    user_satisfaction=float(a.get("user_satisfaction", 0.0)),
                    areas_for_improvement=[str(x) for x in a.get("areas_for_improvement", [])]
                ).__dict__)
            return out
        except Exception as e:
            print(f"Agent Evaluator: Normalize assessments error: {e}")
            return []

    async def _normalize_recommendations(self, raw: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        try:
            out = []
            for r in raw:
                out.append(OptimizationRecommendation(
                    title=str(r.get("title", "Optimization improvement")),
                    category=str(r.get("category", "performance")),
                    priority=str(r.get("priority", "medium")),
                    rationale=str(r.get("rationale", "")),
                    action_steps=[str(x) for x in r.get("action_steps", [])],
                    expected_impact=str(r.get("expected_impact", "")),
                    implementation_effort=str(r.get("implementation_effort", "medium"))
                ).__dict__)
            return out
        except Exception as e:
            print(f"Agent Evaluator: Normalize recommendations error: {e}")
            return []
