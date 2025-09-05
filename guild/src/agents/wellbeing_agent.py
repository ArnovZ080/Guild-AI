"""
Well-being & Workload Optimization Agent - Monitors and optimizes team well-being and workload distribution.
"""

from typing import Dict, List, Any
from ..core.base_agent import BaseAgent


class WellbeingAgent(BaseAgent):
    """
    Well-being & Workload Optimization Agent
    
    Responsibilities:
    - Monitor team well-being and stress levels
    - Optimize workload distribution
    - Prevent burnout and overwork
    - Promote work-life balance
    - Track productivity metrics
    """
    
    def __init__(self, **kwargs):
        super().__init__(
            name="Well-being & Workload Optimization Agent",
            role="Team well-being and workload optimization",
            **kwargs
        )
        self.team_wellbeing: Dict[str, Any] = {}
        self.workload_distribution: Dict[str, Any] = {}
        self.productivity_metrics: Dict[str, Any] = {}
    
    async def assess_team_wellbeing(self, team_data: Dict[str, Any]) -> Dict[str, Any]:
        """Assess overall team well-being and identify areas of concern"""
        try:
            wellbeing_assessment = {
                "assessment_id": f"wellbeing_{len(self.team_wellbeing) + 1}",
                "team_size": team_data.get("team_size", 0),
                "stress_indicators": self._analyze_stress_indicators(team_data),
                "workload_balance": self._assess_workload_balance(team_data),
                "productivity_levels": self._assess_productivity_levels(team_data),
                "recommendations": self._generate_wellbeing_recommendations(team_data),
                "created_at": self._get_current_time()
            }
            
            self.team_wellbeing[wellbeing_assessment["assessment_id"]] = wellbeing_assessment
            
            return {
                "status": "success",
                "wellbeing_assessment": wellbeing_assessment
            }
            
        except Exception as e:
            return {
                "status": "error",
                "message": f"Failed to assess team well-being: {str(e)}"
            }
    
    async def optimize_workload_distribution(self, current_workloads: Dict[str, Any]) -> Dict[str, Any]:
        """Optimize workload distribution across team members"""
        try:
            optimization_plan = {
                "optimization_id": f"workload_{len(self.workload_distribution) + 1}",
                "current_distribution": current_workloads,
                "identified_imbalances": self._identify_workload_imbalances(current_workloads),
                "redistribution_plan": self._create_redistribution_plan(current_workloads),
                "expected_benefits": self._calculate_optimization_benefits(current_workloads),
                "implementation_steps": self._define_implementation_steps(current_workloads),
                "created_at": self._get_current_time()
            }
            
            self.workload_distribution[optimization_plan["optimization_id"]] = optimization_plan
            
            return {
                "status": "success",
                "optimization_plan": optimization_plan
            }
            
        except Exception as e:
            return {
                "status": "error",
                "message": f"Failed to optimize workload distribution: {str(e)}"
            }
    
    async def monitor_burnout_risk(self, individual_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Monitor individual team members for burnout risk"""
        try:
            burnout_analysis = {
                "analysis_id": f"burnout_{len(self.team_wellbeing) + 1}",
                "high_risk_individuals": [],
                "medium_risk_individuals": [],
                "low_risk_individuals": [],
                "intervention_recommendations": [],
                "created_at": self._get_current_time()
            }
            
            for person in individual_data:
                risk_level = self._assess_burnout_risk(person)
                person_analysis = {
                    "person_id": person.get("id", ""),
                    "name": person.get("name", ""),
                    "risk_level": risk_level,
                    "risk_factors": self._identify_risk_factors(person),
                    "recommendations": self._generate_individual_recommendations(person, risk_level)
                }
                
                if risk_level == "high":
                    burnout_analysis["high_risk_individuals"].append(person_analysis)
                elif risk_level == "medium":
                    burnout_analysis["medium_risk_individuals"].append(person_analysis)
                else:
                    burnout_analysis["low_risk_individuals"].append(person_analysis)
            
            burnout_analysis["intervention_recommendations"] = self._generate_intervention_recommendations(burnout_analysis)
            
            return {
                "status": "success",
                "burnout_analysis": burnout_analysis
            }
            
        except Exception as e:
            return {
                "status": "error",
                "message": f"Failed to monitor burnout risk: {str(e)}"
            }
    
    async def track_productivity_metrics(self, productivity_data: Dict[str, Any]) -> Dict[str, Any]:
        """Track and analyze productivity metrics"""
        try:
            productivity_analysis = {
                "analysis_id": f"productivity_{len(self.productivity_metrics) + 1}",
                "overall_productivity": self._calculate_overall_productivity(productivity_data),
                "individual_metrics": self._analyze_individual_metrics(productivity_data),
                "trend_analysis": self._analyze_productivity_trends(productivity_data),
                "improvement_opportunities": self._identify_improvement_opportunities(productivity_data),
                "created_at": self._get_current_time()
            }
            
            self.productivity_metrics[productivity_analysis["analysis_id"]] = productivity_analysis
            
            return {
                "status": "success",
                "productivity_analysis": productivity_analysis
            }
            
        except Exception as e:
            return {
                "status": "error",
                "message": f"Failed to track productivity metrics: {str(e)}"
            }
    
    def _analyze_stress_indicators(self, team_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze stress indicators across the team"""
        return {
            "average_work_hours": team_data.get("average_work_hours", 40),
            "overtime_frequency": team_data.get("overtime_frequency", 0),
            "sick_leave_trends": team_data.get("sick_leave_trends", []),
            "stress_survey_scores": team_data.get("stress_survey_scores", [])
        }
    
    def _assess_workload_balance(self, team_data: Dict[str, Any]) -> Dict[str, Any]:
        """Assess workload balance across team members"""
        return {
            "workload_variance": team_data.get("workload_variance", 0),
            "overloaded_members": team_data.get("overloaded_members", []),
            "underutilized_members": team_data.get("underutilized_members", []),
            "balance_score": self._calculate_balance_score(team_data)
        }
    
    def _assess_productivity_levels(self, team_data: Dict[str, Any]) -> Dict[str, Any]:
        """Assess productivity levels across the team"""
        return {
            "average_productivity": team_data.get("average_productivity", 0),
            "productivity_trends": team_data.get("productivity_trends", []),
            "high_performers": team_data.get("high_performers", []),
            "improvement_areas": team_data.get("improvement_areas", [])
        }
    
    def _generate_wellbeing_recommendations(self, team_data: Dict[str, Any]) -> List[str]:
        """Generate recommendations for improving team well-being"""
        recommendations = []
        
        if team_data.get("average_work_hours", 40) > 45:
            recommendations.append("Reduce average work hours to prevent burnout")
        
        if team_data.get("overtime_frequency", 0) > 3:
            recommendations.append("Implement overtime limits and better workload planning")
        
        recommendations.extend([
            "Implement regular well-being check-ins",
            "Promote work-life balance initiatives",
            "Provide stress management resources"
        ])
        
        return recommendations
    
    def _identify_workload_imbalances(self, current_workloads: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Identify workload imbalances"""
        imbalances = []
        
        for person_id, workload in current_workloads.items():
            if workload.get("hours", 0) > 50:
                imbalances.append({
                    "person_id": person_id,
                    "issue": "Overloaded",
                    "current_hours": workload.get("hours", 0),
                    "recommended_hours": 40
                })
            elif workload.get("hours", 0) < 30:
                imbalances.append({
                    "person_id": person_id,
                    "issue": "Underutilized",
                    "current_hours": workload.get("hours", 0),
                    "recommended_hours": 40
                })
        
        return imbalances
    
    def _create_redistribution_plan(self, current_workloads: Dict[str, Any]) -> Dict[str, Any]:
        """Create a plan to redistribute workloads"""
        return {
            "redistribution_strategy": "Balance workloads across team members",
            "target_hours_per_person": 40,
            "reallocation_plan": self._create_reallocation_plan(current_workloads),
            "timeline": "2 weeks"
        }
    
    def _calculate_optimization_benefits(self, current_workloads: Dict[str, Any]) -> List[str]:
        """Calculate expected benefits of workload optimization"""
        return [
            "Reduced burnout risk",
            "Improved work-life balance",
            "Increased productivity",
            "Better team morale",
            "Reduced turnover risk"
        ]
    
    def _define_implementation_steps(self, current_workloads: Dict[str, Any]) -> List[str]:
        """Define steps to implement workload optimization"""
        return [
            "Analyze current workload distribution",
            "Identify imbalances and over/under-utilized team members",
            "Create redistribution plan",
            "Communicate changes to team",
            "Monitor and adjust as needed"
        ]
    
    def _assess_burnout_risk(self, person_data: Dict[str, Any]) -> str:
        """Assess individual burnout risk level"""
        risk_score = 0
        
        # Factors that increase burnout risk
        if person_data.get("work_hours", 0) > 50:
            risk_score += 3
        if person_data.get("overtime_frequency", 0) > 2:
            risk_score += 2
        if person_data.get("stress_level", 0) > 7:
            risk_score += 2
        if person_data.get("sick_days", 0) > 5:
            risk_score += 1
        
        if risk_score >= 6:
            return "high"
        elif risk_score >= 3:
            return "medium"
        else:
            return "low"
    
    def _identify_risk_factors(self, person_data: Dict[str, Any]) -> List[str]:
        """Identify specific risk factors for an individual"""
        risk_factors = []
        
        if person_data.get("work_hours", 0) > 50:
            risk_factors.append("Excessive work hours")
        if person_data.get("overtime_frequency", 0) > 2:
            risk_factors.append("Frequent overtime")
        if person_data.get("stress_level", 0) > 7:
            risk_factors.append("High stress levels")
        if person_data.get("sick_days", 0) > 5:
            risk_factors.append("Frequent sick days")
        
        return risk_factors
    
    def _generate_individual_recommendations(self, person_data: Dict[str, Any], risk_level: str) -> List[str]:
        """Generate recommendations for an individual based on their risk level"""
        recommendations = []
        
        if risk_level == "high":
            recommendations.extend([
                "Immediate workload reduction",
                "Mandatory time off",
                "Stress management counseling",
                "Regular check-ins with manager"
            ])
        elif risk_level == "medium":
            recommendations.extend([
                "Monitor workload closely",
                "Encourage breaks and time off",
                "Provide stress management resources"
            ])
        else:
            recommendations.extend([
                "Maintain current work patterns",
                "Continue regular well-being check-ins"
            ])
        
        return recommendations
    
    def _generate_intervention_recommendations(self, burnout_analysis: Dict[str, Any]) -> List[str]:
        """Generate intervention recommendations based on burnout analysis"""
        recommendations = []
        
        if len(burnout_analysis["high_risk_individuals"]) > 0:
            recommendations.append("Implement immediate intervention for high-risk individuals")
        
        if len(burnout_analysis["medium_risk_individuals"]) > 2:
            recommendations.append("Develop team-wide stress management program")
        
        recommendations.extend([
            "Regular well-being assessments",
            "Workload monitoring and adjustment",
            "Promote work-life balance culture"
        ])
        
        return recommendations
    
    def _calculate_overall_productivity(self, productivity_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate overall productivity metrics"""
        return {
            "average_productivity": productivity_data.get("average_productivity", 0),
            "productivity_trend": productivity_data.get("productivity_trend", "stable"),
            "team_efficiency": productivity_data.get("team_efficiency", 0)
        }
    
    def _analyze_individual_metrics(self, productivity_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Analyze individual productivity metrics"""
        individual_metrics = []
        
        for person in productivity_data.get("individual_data", []):
            individual_metrics.append({
                "person_id": person.get("id", ""),
                "productivity_score": person.get("productivity_score", 0),
                "efficiency_rating": person.get("efficiency_rating", 0),
                "improvement_areas": person.get("improvement_areas", [])
            })
        
        return individual_metrics
    
    def _analyze_productivity_trends(self, productivity_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze productivity trends over time"""
        return {
            "trend_direction": productivity_data.get("trend_direction", "stable"),
            "trend_strength": productivity_data.get("trend_strength", 0),
            "seasonal_patterns": productivity_data.get("seasonal_patterns", []),
            "forecast": productivity_data.get("forecast", {})
        }
    
    def _identify_improvement_opportunities(self, productivity_data: Dict[str, Any]) -> List[str]:
        """Identify opportunities for productivity improvement"""
        return [
            "Process optimization",
            "Skill development programs",
            "Technology upgrades",
            "Workflow automation",
            "Team collaboration improvements"
        ]
    
    def _calculate_balance_score(self, team_data: Dict[str, Any]) -> float:
        """Calculate workload balance score (0-100)"""
        # Simplified calculation
        return 75.0
    
    def _create_reallocation_plan(self, current_workloads: Dict[str, Any]) -> Dict[str, Any]:
        """Create detailed reallocation plan"""
        return {
            "from_overloaded": [],
            "to_underutilized": [],
            "new_assignments": {}
        }
    
    def _get_current_time(self) -> str:
        """Get current timestamp"""
        return "2024-01-01T00:00:00Z"
