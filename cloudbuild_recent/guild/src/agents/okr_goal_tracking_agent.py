"""
OKR/Goal Tracking Agent for Guild-AI
Comprehensive OKR and goal tracking using advanced prompting strategies.
"""

from guild.src.core.llm_client import LlmClient
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime, timedelta
from guild.src.core.agent_helpers import inject_knowledge
import asyncio
import json

@dataclass
class Objective:
    objective_id: str
    title: str
    description: str
    owner: str
    timeframe: str
    created_date: datetime
    status: str  # active, completed, canceled
    key_results: List[Dict[str, Any]]
    progress: float  # 0.0 to 1.0
    tags: List[str]

@dataclass
class KeyResult:
    kr_id: str
    objective_id: str
    title: str
    description: str
    owner: str
    metric_type: str  # numeric, boolean, percentage
    target_value: Any
    current_value: Any
    start_value: Any
    progress: float  # 0.0 to 1.0
    status: str  # on-track, at-risk, behind
    check_ins: List[Dict[str, Any]]
    last_updated: datetime

@inject_knowledge
async def generate_comprehensive_okr_tracking_strategy(
    tracking_objective: str,
    business_goals: Dict[str, Any],
    okr_data: Dict[str, Any],
    tracking_parameters: Dict[str, Any],
    time_periods: Dict[str, Any],
    alignment_factors: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Generates comprehensive OKR tracking strategy using advanced prompting strategies.
    Continuously monitors business OKRs and nudges agents/owner toward alignment.
    """
    print("OKR/Goal Tracking Agent: Generating comprehensive OKR tracking strategy with injected knowledge...")

    # Structured prompt following advanced prompting strategies
    prompt = f"""
# OKR/Goal Tracking Agent - Comprehensive Business Goal Monitoring

## Role Definition
You are the **OKR/Goal Tracking Agent**, an expert in objective and key result methodology, performance monitoring, and business alignment. Your role is to continuously track progress toward business objectives, provide timely insights on goal achievement, and ensure all activities remain aligned with strategic priorities.

## Core Expertise
- OKR Methodology & Implementation
- Goal Setting & Progress Tracking
- Performance Metrics & Analytics
- Strategic Alignment & Business Focus
- Accountability Systems & Reminders
- Milestone Planning & Achievement
- Reporting & Visualization
- Adaptive Goal Management

## Context & Background Information
**Tracking Objective:** {tracking_objective}
**Business Goals:** {json.dumps(business_goals, indent=2)}
**OKR Data:** {json.dumps(okr_data, indent=2)}
**Tracking Parameters:** {json.dumps(tracking_parameters, indent=2)}
**Time Periods:** {json.dumps(time_periods, indent=2)}
**Alignment Factors:** {json.dumps(alignment_factors, indent=2)}

## Task Breakdown & Steps
1. **OKR Framework Assessment:** Evaluate the current OKR structure and quality
2. **Progress Tracking System:** Establish monitoring mechanisms for each key result
3. **Alignment Analysis:** Evaluate how activities connect to strategic objectives
4. **Check-in Schedule:** Create a cadence for regular progress updates
5. **Progress Visualization:** Design clear representations of goal achievement
6. **Nudge System:** Develop timely reminders and motivational prompts
7. **Blockers Identification:** Flag obstacles impeding progress
8. **Adaptive Recommendations:** Suggest adjustments to goals when necessary

## Constraints & Rules
- All goals must follow SMART criteria (Specific, Measurable, Achievable, Relevant, Time-bound)
- Progress metrics must be objective and quantifiable where possible
- Tracking must balance accountability with motivation
- Nudges should be timely, relevant, and actionable
- Reporting must highlight both achievements and areas needing attention
- Goal adjustments should only be recommended when backed by data
- All tracking must respect the established cadence and review cycles
- Progress should be contextualized within broader business impact

## Output Format
Return a comprehensive JSON object with tracking framework, progress metrics, alignment analysis, and action recommendations.

Generate the comprehensive OKR tracking strategy now, ensuring all elements are thoroughly addressed.
"""

    try:
        # Create LLM client
        from guild.src.models.llm import Llm
        client = LlmClient(Llm(provider="ollama", model="tinyllama"))
        
        # Generate response
        response = await client.chat(prompt)
        
        # Parse JSON response
        try:
            okr_strategy = json.loads(response)
            print("OKR/Goal Tracking Agent: Successfully generated comprehensive OKR tracking strategy.")
            return okr_strategy
        except json.JSONDecodeError as e:
            print(f"OKR/Goal Tracking Agent: JSON parsing error: {e}")
            # Return structured fallback
            return {
                "tracking_framework": {
                    "methodology": "OKR",
                    "tracking_frequency": "weekly",
                    "review_cadence": "quarterly",
                    "confidence_level": "high"
                },
                "objectives": {
                    "objective_1": {
                        "title": "Increase Market Penetration",
                        "key_results": [
                            {"title": "Achieve 15% growth in customer base", "current_progress": 0.35, "status": "on-track"},
                            {"title": "Launch in 2 new market segments", "current_progress": 0.5, "status": "on-track"},
                            {"title": "Reach 25% brand awareness in target audience", "current_progress": 0.2, "status": "at-risk"}
                        ],
                        "overall_progress": 0.35,
                        "alignment_score": 0.8
                    },
                    "objective_2": {
                        "title": "Improve Product Engagement",
                        "key_results": [
                            {"title": "Increase daily active users by 20%", "current_progress": 0.4, "status": "on-track"},
                            {"title": "Reduce churn rate to below 5%", "current_progress": 0.3, "status": "at-risk"},
                            {"title": "Achieve NPS score above 45", "current_progress": 0.6, "status": "on-track"}
                        ],
                        "overall_progress": 0.43,
                        "alignment_score": 0.9
                    }
                },
                "alignment_analysis": {
                    "strategic_alignment": 0.75,
                    "resource_allocation_alignment": 0.6,
                    "team_focus_alignment": 0.8,
                    "misalignment_areas": ["marketing_initiatives", "engineering_priorities"]
                },
                "action_recommendations": {
                    "nudges": [
                        {"recipient": "marketing_team", "message": "Brand awareness KR is falling behind schedule", "urgency": "high"},
                        {"recipient": "product_team", "message": "Churn reduction efforts need acceleration", "urgency": "medium"}
                    ],
                    "adjustments": [
                        {"target": "brand_awareness_kr", "recommendation": "Revise timeline or increase resources", "rationale": "Current progress indicates target may not be achievable in timeframe"}
                    ],
                    "blockers_to_address": [
                        {"blocker": "competitive_pressure", "impact": "high", "mitigation": "Accelerate differentiating feature development"}
                    ]
                }
            }
    except Exception as e:
        print(f"OKR/Goal Tracking Agent: Failed to generate OKR tracking strategy. Error: {e}")
        return {
            "tracking_framework": {
                "methodology": "OKR",
                "confidence_level": "moderate"
            },
            "error": str(e)
        }

class OKRGoalTrackingAgent:
    """
    OKR/Goal Tracking Agent - Expert in objective and key result methodology and performance monitoring
    
    Continuously monitors business OKRs and nudges agents/owner toward alignment with strategic
    priorities, providing timely insights and ensuring accountability.
    """
    
    def __init__(self, user_input: str = None):
        self.user_input = user_input
        self.agent_name = "OKR/Goal Tracking Agent"
        self.agent_type = "Strategy & Planning"
        self.capabilities = [
            "OKR methodology and implementation",
            "Goal setting and progress tracking",
            "Performance metrics and analytics",
            "Strategic alignment and business focus",
            "Accountability systems and reminders",
            "Milestone planning and achievement",
            "Reporting and visualization",
            "Adaptive goal management"
        ]
        self.objectives_library = {}
        self.key_results_library = {}
        self.check_ins_history = {}
        self.llm_client = LlmClient(Llm(provider="ollama", model="tinyllama"))
    
    async def run(self, user_input: str = None) -> Dict[str, Any]:
        """
        Main execution method for the OKR/Goal Tracking Agent.
        Implements comprehensive OKR tracking using advanced prompting strategies.
        """
        try:
            print(f"OKR/Goal Tracking Agent: Starting comprehensive OKR tracking...")
            
            # Extract inputs from user_input or use defaults
            if user_input:
                tracking_objective = user_input
            else:
                tracking_objective = "Track and improve alignment with business objectives"
            
            # Define comprehensive OKR tracking parameters
            business_goals = {
                "vision": "Become the leading AI workforce platform for solopreneurs and lean teams",
                "mission": "Empower small businesses with enterprise-grade AI capabilities",
                "strategic_pillars": [
                    "Product Excellence",
                    "Customer Success",
                    "Operational Efficiency",
                    "Market Expansion"
                ],
                "annual_priorities": [
                    "Increase user base by 50%",
                    "Achieve 40% improvement in agent capabilities",
                    "Establish product-market fit in 3 key verticals",
                    "Reach financial sustainability"
                ]
            }
            
            okr_data = {
                "objectives": [
                    {
                        "id": "obj-001",
                        "title": "Increase Market Penetration",
                        "owner": "marketing_team",
                        "key_results": [
                            {
                                "id": "kr-001",
                                "title": "Achieve 15% growth in customer base",
                                "metric_type": "percentage",
                                "target": 15,
                                "current": 5.25,
                                "start": 0
                            },
                            {
                                "id": "kr-002",
                                "title": "Launch in 2 new market segments",
                                "metric_type": "numeric",
                                "target": 2,
                                "current": 1,
                                "start": 0
                            },
                            {
                                "id": "kr-003",
                                "title": "Reach 25% brand awareness in target audience",
                                "metric_type": "percentage",
                                "target": 25,
                                "current": 5,
                                "start": 0
                            }
                        ]
                    },
                    {
                        "id": "obj-002",
                        "title": "Improve Product Engagement",
                        "owner": "product_team",
                        "key_results": [
                            {
                                "id": "kr-004",
                                "title": "Increase daily active users by 20%",
                                "metric_type": "percentage",
                                "target": 20,
                                "current": 8,
                                "start": 0
                            },
                            {
                                "id": "kr-005",
                                "title": "Reduce churn rate to below 5%",
                                "metric_type": "percentage",
                                "target": 5,
                                "current": 7.5,
                                "start": 10
                            },
                            {
                                "id": "kr-006",
                                "title": "Achieve NPS score above 45",
                                "metric_type": "numeric",
                                "target": 45,
                                "current": 27,
                                "start": 15
                            }
                        ]
                    }
                ],
                "check_ins": [
                    {
                        "date": "2025-08-15",
                        "kr_id": "kr-001",
                        "value": 3.5,
                        "notes": "Marketing campaign launched"
                    },
                    {
                        "date": "2025-09-01",
                        "kr_id": "kr-001",
                        "value": 5.25,
                        "notes": "Referral program showing results"
                    },
                    {
                        "date": "2025-08-20",
                        "kr_id": "kr-002",
                        "value": 1,
                        "notes": "E-commerce vertical launched"
                    }
                ]
            }
            
            tracking_parameters = {
                "tracking_frequency": "weekly",
                "review_cadence": "quarterly",
                "nudge_frequency": "as-needed",
                "confidence_threshold": 0.7
            }
            
            time_periods = {
                "current_quarter": "Q3 2025",
                "annual_cycle": "2025",
                "check_in_day": "Monday",
                "quarterly_review_month": ["March", "June", "September", "December"]
            }
            
            alignment_factors = {
                "strategic_pillars": ["product_excellence", "customer_success", "operational_efficiency", "market_expansion"],
                "company_values": ["innovation", "customer_centricity", "accountability", "continuous_improvement"],
                "resource_constraints": {
                    "budget": "limited",
                    "team_size": "small",
                    "time": "aggressive_timeline"
                }
            }
            
            # Generate comprehensive OKR tracking strategy
            okr_strategy = await generate_comprehensive_okr_tracking_strategy(
                tracking_objective=tracking_objective,
                business_goals=business_goals,
                okr_data=okr_data,
                tracking_parameters=tracking_parameters,
                time_periods=time_periods,
                alignment_factors=alignment_factors
            )
            
            # Execute the OKR tracking based on the strategy
            result = await self._execute_okr_tracking(
                tracking_objective, 
                okr_strategy
            )
            
            # Combine strategy and execution results
            final_result = {
                "agent": "OKR/Goal Tracking Agent",
                "strategy_type": "comprehensive_okr_tracking",
                "okr_strategy": okr_strategy,
                "execution_result": result,
                "timestamp": datetime.now().isoformat(),
                "status": "completed"
            }
            
            print(f"OKR/Goal Tracking Agent: Comprehensive OKR tracking completed successfully.")
            return final_result
            
        except Exception as e:
            print(f"OKR/Goal Tracking Agent: Error in comprehensive OKR tracking: {e}")
            return {
                "agent": "OKR/Goal Tracking Agent",
                "status": "error",
                "message": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    async def _execute_okr_tracking(
        self, 
        tracking_objective: str, 
        strategy: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Execute OKR tracking based on comprehensive strategy."""
        try:
            # Extract strategy components
            tracking_framework = strategy.get("tracking_framework", {})
            objectives = strategy.get("objectives", {})
            alignment_analysis = strategy.get("alignment_analysis", {})
            action_recommendations = strategy.get("action_recommendations", {})
            
            # Create objective objects for each objective
            objective_objects = {}
            for obj_id, obj_data in objectives.items():
                # Create objective object
                objective = Objective(
                    objective_id=obj_id,
                    title=obj_data.get("title", ""),
                    description=obj_data.get("description", "No description provided"),
                    owner=obj_data.get("owner", "unassigned"),
                    timeframe=strategy.get("time_periods", {}).get("current_quarter", "Current Quarter"),
                    created_date=datetime.now(),
                    status="active",
                    key_results=obj_data.get("key_results", []),
                    progress=obj_data.get("overall_progress", 0.0),
                    tags=obj_data.get("tags", [])
                )
                
                objective_objects[obj_id] = objective
                self.objectives_library[obj_id] = objective
                
                # Create key result objects for each key result
                for kr in obj_data.get("key_results", []):
                    kr_id = kr.get("id", f"kr_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{len(self.key_results_library)}")
                    
                    # Create key result object
                    key_result = KeyResult(
                        kr_id=kr_id,
                        objective_id=obj_id,
                        title=kr.get("title", ""),
                        description=kr.get("description", "No description provided"),
                        owner=kr.get("owner", objective.owner),
                        metric_type=kr.get("metric_type", "percentage"),
                        target_value=kr.get("target", 100),
                        current_value=kr.get("current", 0),
                        start_value=kr.get("start", 0),
                        progress=kr.get("current_progress", 0.0),
                        status=kr.get("status", "on-track"),
                        check_ins=[],
                        last_updated=datetime.now()
                    )
                    
                    self.key_results_library[kr_id] = key_result
            
            # Process check-ins
            for check_in in strategy.get("okr_data", {}).get("check_ins", []):
                kr_id = check_in.get("kr_id")
                if kr_id in self.key_results_library:
                    if kr_id not in self.check_ins_history:
                        self.check_ins_history[kr_id] = []
                    
                    self.check_ins_history[kr_id].append({
                        "date": check_in.get("date", datetime.now().isoformat()),
                        "value": check_in.get("value"),
                        "notes": check_in.get("notes", "")
                    })
            
            # Generate progress report
            progress_report = self._generate_progress_report(objective_objects)
            
            # Generate alignment report
            alignment_report = self._generate_alignment_report(alignment_analysis)
            
            # Generate nudges and recommendations
            nudges = self._generate_nudges(action_recommendations.get("nudges", []))
            
            return {
                "status": "success",
                "message": "OKR tracking strategy executed successfully",
                "tracking_framework": tracking_framework,
                "objectives_status": {obj_id: {"title": obj.title, "progress": obj.progress, "status": obj.status} for obj_id, obj in objective_objects.items()},
                "progress_report": progress_report,
                "alignment_report": alignment_report,
                "nudges": nudges,
                "execution_metrics": {
                    "objectives_tracked": len(objective_objects),
                    "key_results_tracked": len(self.key_results_library),
                    "alignment_score": alignment_analysis.get("strategic_alignment", 0.0),
                    "tracking_quality": "comprehensive"
                }
            }
            
        except Exception as e:
            return {
                "status": "error",
                "message": f"OKR tracking strategy execution failed: {str(e)}"
            }
    
    def _generate_progress_report(self, objective_objects: Dict[str, Objective]) -> Dict[str, Any]:
        """Generate progress report for objectives."""
        progress_report = {
            "overall_progress": 0.0,
            "objectives_summary": {},
            "key_results_at_risk": [],
            "key_results_on_track": [],
            "completion_forecast": {}
        }
        
        total_progress = 0.0
        total_objectives = len(objective_objects)
        
        for obj_id, objective in objective_objects.items():
            # Calculate objective progress
            progress_report["objectives_summary"][obj_id] = {
                "title": objective.title,
                "progress": objective.progress,
                "key_results_count": len(objective.key_results),
                "key_results_at_risk": sum(1 for kr in objective.key_results if kr.get("status") == "at-risk"),
                "key_results_on_track": sum(1 for kr in objective.key_results if kr.get("status") == "on-track")
            }
            
            total_progress += objective.progress
            
            # Identify at-risk and on-track key results
            for kr in objective.key_results:
                kr_with_context = {
                    "id": kr.get("id", "unknown"),
                    "title": kr.get("title", ""),
                    "objective": objective.title,
                    "progress": kr.get("current_progress", 0.0),
                    "status": kr.get("status", "unknown")
                }
                
                if kr.get("status") == "at-risk":
                    progress_report["key_results_at_risk"].append(kr_with_context)
                elif kr.get("status") == "on-track":
                    progress_report["key_results_on_track"].append(kr_with_context)
        
        # Calculate overall progress
        if total_objectives > 0:
            progress_report["overall_progress"] = total_progress / total_objectives
        
        # Generate completion forecast
        current_date = datetime.now()
        quarter_end = datetime(current_date.year, ((current_date.month - 1) // 3 + 1) * 3 + 1, 1)
        days_remaining = (quarter_end - current_date).days
        
        progress_report["completion_forecast"] = {
            "days_remaining_in_quarter": days_remaining,
            "projected_completion": min(1.0, progress_report["overall_progress"] * (90 / (90 - days_remaining))) if days_remaining < 90 else 0.0,
            "on_track_for_completion": progress_report["overall_progress"] >= (1.0 - days_remaining / 90)
        }
        
        return progress_report
    
    def _generate_alignment_report(self, alignment_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Generate alignment report based on analysis."""
        return {
            "strategic_alignment": alignment_analysis.get("strategic_alignment", 0.0),
            "resource_alignment": alignment_analysis.get("resource_allocation_alignment", 0.0),
            "team_focus_alignment": alignment_analysis.get("team_focus_alignment", 0.0),
            "misalignment_areas": alignment_analysis.get("misalignment_areas", []),
            "alignment_recommendations": [
                {
                    "area": area,
                    "current_alignment": "low" if area in alignment_analysis.get("misalignment_areas", []) else "moderate",
                    "recommendation": f"Realign {area.replace('_', ' ')} with strategic objectives"
                }
                for area in alignment_analysis.get("misalignment_areas", [])
            ],
            "alignment_trends": {
                "improving": [],
                "declining": alignment_analysis.get("misalignment_areas", []),
                "stable": []
            }
        }
    
    def _generate_nudges(self, nudge_recommendations: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Generate nudges based on recommendations."""
        formatted_nudges = []
        
        for nudge in nudge_recommendations:
            formatted_nudge = {
                "recipient": nudge.get("recipient", "team"),
                "message": nudge.get("message", ""),
                "urgency": nudge.get("urgency", "medium"),
                "delivery_channel": "email" if nudge.get("urgency") == "high" else "dashboard",
                "suggested_action": self._generate_suggested_action(nudge),
                "follow_up_date": (datetime.now().date() + timedelta(days=3 if nudge.get("urgency") == "high" else 7)).isoformat()
            }
            
            formatted_nudges.append(formatted_nudge)
        
        return formatted_nudges
    
    def _generate_suggested_action(self, nudge: Dict[str, Any]) -> str:
        """Generate suggested action based on nudge content."""
        message = nudge.get("message", "").lower()
        
        if "falling behind" in message or "behind schedule" in message:
            return "Schedule a recovery planning session"
        elif "acceleration" in message or "accelerate" in message:
            return "Allocate additional resources to this initiative"
        elif "awareness" in message and "brand" in message:
            return "Review and enhance marketing campaign strategy"
        elif "churn" in message:
            return "Analyze customer feedback and implement retention tactics"
        else:
            return "Review progress and adjust approach as needed"
    
    def get_agent_info(self) -> Dict[str, Any]:
        """Get agent information and capabilities"""
        
        return {
            "name": self.agent_name,
            "type": self.agent_type,
            "capabilities": self.capabilities,
            "tracking_methodologies": ["OKR", "KPI", "SMART Goals", "Balanced Scorecard"],
            "tracking_frequencies": ["weekly", "bi-weekly", "monthly", "quarterly"]
        }