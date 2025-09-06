"""
Well-being & Workload Optimization Agent - Monitors workload and prevents burnout
"""

from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime, timedelta

@dataclass
class WorkloadAnalysis:
    current_utilization: float
    burnout_risk_score: float
    workload_trends: Dict[str, Any]
    optimization_suggestions: List[str]
    wellbeing_interventions: List[str]

@dataclass
class WellbeingIntervention:
    intervention_type: str
    description: str
    scheduled_time: datetime
    priority: str
    expected_impact: str

class WellbeingWorkloadAgent:
    """
    Well-being & Workload Optimization Agent - Workload monitoring and burnout prevention
    
    Monitors the solo-founder's workload, identifies patterns that could lead to burnout,
    and proactively suggests interventions to maintain a healthy work-life balance.
    """
    
    def __init__(self, name: str = "Well-being & Workload Optimization Agent"):
        self.name = name
        self.role = "Well-being Coach"
        self.expertise = [
            "Workload Analysis",
            "Time Management",
            "Burnout Prevention",
            "Behavioral Nudges",
            "Scheduling Optimization",
            "Stress Management"
        ]
    
    def analyze_workload(self, 
                        workload_data: Dict[str, Any],
                        solo_founder_preferences: Dict[str, Any],
                        self_report: Optional[Dict[str, Any]] = None) -> WorkloadAnalysis:
        """
        Analyze workload data to identify burnout risk and optimization opportunities
        
        Args:
            workload_data: Data from Project Manager, Time Tracking, Calendar tools
            solo_founder_preferences: User-defined preferences for work hours and breaks
            self_report: Optional self-reported stress levels or feelings
            
        Returns:
            WorkloadAnalysis: Comprehensive analysis with recommendations
        """
        
        # Analyze workload patterns
        utilization_analysis = self._analyze_utilization(workload_data, solo_founder_preferences)
        
        # Assess burnout risk
        burnout_risk = self._assess_burnout_risk(workload_data, self_report)
        
        # Identify workload trends
        workload_trends = self._identify_workload_trends(workload_data)
        
        # Generate optimization suggestions
        optimization_suggestions = self._generate_optimization_suggestions(utilization_analysis, workload_trends)
        
        # Recommend wellbeing interventions
        wellbeing_interventions = self._recommend_wellbeing_interventions(burnout_risk, workload_data)
        
        return WorkloadAnalysis(
            current_utilization=utilization_analysis["current_utilization"],
            burnout_risk_score=burnout_risk["risk_score"],
            workload_trends=workload_trends,
            optimization_suggestions=optimization_suggestions,
            wellbeing_interventions=wellbeing_interventions
        )
    
    def _analyze_utilization(self, 
                           workload_data: Dict[str, Any],
                           preferences: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze current workload utilization against preferences"""
        
        # Calculate current utilization
        current_hours = workload_data.get("hours_worked_this_week", 0)
        preferred_hours = preferences.get("preferred_weekly_hours", 40)
        
        utilization = current_hours / preferred_hours if preferred_hours > 0 else 0
        
        # Analyze task distribution
        task_breakdown = workload_data.get("task_breakdown", {})
        
        # Check for overwork patterns
        overwork_indicators = []
        if utilization > 1.2:
            overwork_indicators.append("Working significantly more than preferred hours")
        if workload_data.get("consecutive_long_days", 0) > 3:
            overwork_indicators.append("Multiple consecutive long work days")
        if workload_data.get("weekend_hours", 0) > 8:
            overwork_indicators.append("Excessive weekend work")
        
        return {
            "current_utilization": utilization,
            "hours_worked": current_hours,
            "preferred_hours": preferred_hours,
            "overwork_indicators": overwork_indicators,
            "task_distribution": task_breakdown
        }
    
    def _assess_burnout_risk(self, 
                           workload_data: Dict[str, Any],
                           self_report: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """Assess burnout risk based on workload patterns and self-report"""
        
        risk_factors = []
        risk_score = 0.0
        
        # Workload-based risk factors
        if workload_data.get("hours_worked_this_week", 0) > 50:
            risk_factors.append("Excessive weekly hours")
            risk_score += 0.3
        
        if workload_data.get("overdue_tasks", 0) > 5:
            risk_factors.append("High number of overdue tasks")
            risk_score += 0.2
        
        if workload_data.get("consecutive_work_days", 0) > 10:
            risk_factors.append("No rest days in extended period")
            risk_score += 0.2
        
        if workload_data.get("late_night_work", 0) > 3:
            risk_factors.append("Frequent late-night work sessions")
            risk_score += 0.1
        
        # Self-report based risk factors
        if self_report:
            stress_level = self_report.get("stress_level", 0)
            if stress_level > 7:
                risk_factors.append("High self-reported stress level")
                risk_score += 0.2
            
            if self_report.get("feeling_overwhelmed", False):
                risk_factors.append("Feeling overwhelmed")
                risk_score += 0.2
            
            if self_report.get("sleep_quality", 5) < 3:
                risk_factors.append("Poor sleep quality")
                risk_score += 0.1
        
        # Determine risk level
        if risk_score >= 0.7:
            risk_level = "high"
        elif risk_score >= 0.4:
            risk_level = "medium"
        else:
            risk_level = "low"
        
        return {
            "risk_score": risk_score,
            "risk_level": risk_level,
            "risk_factors": risk_factors,
            "recommendations": self._generate_burnout_prevention_recommendations(risk_level, risk_factors)
        }
    
    def _generate_burnout_prevention_recommendations(self, 
                                                   risk_level: str,
                                                   risk_factors: List[str]) -> List[str]:
        """Generate specific recommendations to prevent burnout"""
        
        recommendations = []
        
        if risk_level == "high":
            recommendations.extend([
                "Immediate intervention required - consider taking a day off",
                "Reduce workload by delegating or postponing non-critical tasks",
                "Schedule regular breaks every 2 hours",
                "Consider professional support or counseling"
            ])
        elif risk_level == "medium":
            recommendations.extend([
                "Schedule regular breaks and time off",
                "Prioritize tasks and delegate where possible",
                "Implement better work-life boundaries",
                "Consider stress management techniques"
            ])
        else:
            recommendations.extend([
                "Maintain current healthy work patterns",
                "Continue regular breaks and self-care",
                "Monitor for early warning signs"
            ])
        
        return recommendations
    
    def _identify_workload_trends(self, workload_data: Dict[str, Any]) -> Dict[str, Any]:
        """Identify patterns and trends in workload data"""
        
        trends = {
            "weekly_pattern": self._analyze_weekly_pattern(workload_data),
            "task_completion_rate": workload_data.get("completion_rate", 0),
            "productivity_trends": self._analyze_productivity_trends(workload_data),
            "peak_performance_hours": self._identify_peak_hours(workload_data)
        }
        
        return trends
    
    def _analyze_weekly_pattern(self, workload_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze weekly work patterns"""
        
        daily_hours = workload_data.get("daily_hours", {})
        
        # Calculate average hours per day
        total_hours = sum(daily_hours.values())
        avg_daily_hours = total_hours / 7 if daily_hours else 0
        
        # Identify patterns
        patterns = []
        if daily_hours.get("monday", 0) > avg_daily_hours * 1.2:
            patterns.append("Heavy Monday workload")
        if daily_hours.get("friday", 0) > avg_daily_hours * 1.2:
            patterns.append("Heavy Friday workload")
        if daily_hours.get("saturday", 0) > 0 or daily_hours.get("sunday", 0) > 0:
            patterns.append("Weekend work detected")
        
        return {
            "average_daily_hours": avg_daily_hours,
            "patterns": patterns,
            "consistency_score": self._calculate_consistency_score(daily_hours)
        }
    
    def _calculate_consistency_score(self, daily_hours: Dict[str, float]) -> float:
        """Calculate consistency score for daily work hours"""
        
        if not daily_hours:
            return 0.0
        
        values = list(daily_hours.values())
        if len(values) < 2:
            return 1.0
        
        # Calculate coefficient of variation (lower is more consistent)
        mean_hours = sum(values) / len(values)
        variance = sum((x - mean_hours) ** 2 for x in values) / len(values)
        std_dev = variance ** 0.5
        
        if mean_hours == 0:
            return 1.0
        
        cv = std_dev / mean_hours
        consistency_score = max(0, 1 - cv)  # Convert to 0-1 scale where 1 is most consistent
        
        return consistency_score
    
    def _analyze_productivity_trends(self, workload_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze productivity trends over time"""
        
        return {
            "productivity_score": workload_data.get("productivity_score", 0.7),
            "trend_direction": "stable",  # Would be calculated from historical data
            "peak_productivity_periods": ["morning", "early_afternoon"],
            "low_productivity_periods": ["late_afternoon", "evening"]
        }
    
    def _identify_peak_hours(self, workload_data: Dict[str, Any]) -> List[str]:
        """Identify hours of peak performance"""
        
        hourly_productivity = workload_data.get("hourly_productivity", {})
        
        if not hourly_productivity:
            return ["9:00-11:00", "14:00-16:00"]  # Default peak hours
        
        # Find hours with highest productivity
        sorted_hours = sorted(hourly_productivity.items(), key=lambda x: x[1], reverse=True)
        peak_hours = [hour for hour, score in sorted_hours[:3]]
        
        return peak_hours
    
    def _generate_optimization_suggestions(self, 
                                         utilization_analysis: Dict[str, Any],
                                         workload_trends: Dict[str, Any]) -> List[str]:
        """Generate workload optimization suggestions"""
        
        suggestions = []
        
        # Utilization-based suggestions
        if utilization_analysis["current_utilization"] > 1.1:
            suggestions.append("Consider reducing workload by 10-15% to prevent burnout")
            suggestions.append("Delegate non-critical tasks to other agents or freelancers")
        
        if utilization_analysis["current_utilization"] < 0.8:
            suggestions.append("Workload is below preferred level - consider taking on additional projects")
        
        # Pattern-based suggestions
        weekly_pattern = workload_trends["weekly_pattern"]
        if weekly_pattern["consistency_score"] < 0.6:
            suggestions.append("Work hours are inconsistent - consider establishing a more regular schedule")
        
        if "Weekend work detected" in weekly_pattern["patterns"]:
            suggestions.append("Limit weekend work to maintain work-life balance")
        
        # Productivity-based suggestions
        productivity_trends = workload_trends["productivity_trends"]
        if productivity_trends["productivity_score"] < 0.6:
            suggestions.append("Productivity is below optimal - consider time management techniques")
        
        peak_hours = workload_trends["peak_performance_hours"]
        if peak_hours:
            suggestions.append(f"Schedule most important tasks during peak hours: {', '.join(peak_hours)}")
        
        return suggestions
    
    def _recommend_wellbeing_interventions(self, 
                                         burnout_risk: Dict[str, Any],
                                         workload_data: Dict[str, Any]) -> List[str]:
        """Recommend specific wellbeing interventions"""
        
        interventions = []
        
        risk_level = burnout_risk["risk_level"]
        
        if risk_level == "high":
            interventions.extend([
                "Schedule immediate break or day off",
                "Implement mandatory 15-minute breaks every 2 hours",
                "Block calendar for personal time and activities",
                "Consider professional stress management support"
            ])
        elif risk_level == "medium":
            interventions.extend([
                "Schedule regular breaks throughout the day",
                "Block time for lunch and personal activities",
                "Implement end-of-day wind-down routine",
                "Practice mindfulness or meditation techniques"
            ])
        else:
            interventions.extend([
                "Maintain current healthy work patterns",
                "Continue regular breaks and self-care",
                "Monitor workload and stress levels"
            ])
        
        # Add general wellbeing interventions
        interventions.extend([
            "Ensure adequate sleep (7-9 hours per night)",
            "Maintain regular exercise routine",
            "Stay hydrated and eat nutritious meals",
            "Connect with friends and family regularly"
        ])
        
        return interventions
    
    def schedule_wellbeing_interventions(self, 
                                       interventions: List[str],
                                       preferences: Dict[str, Any]) -> List[WellbeingIntervention]:
        """Schedule specific wellbeing interventions"""
        
        scheduled_interventions = []
        
        for i, intervention in enumerate(interventions):
            # Determine intervention type
            if "break" in intervention.lower():
                intervention_type = "break"
                priority = "high"
            elif "day off" in intervention.lower():
                intervention_type = "time_off"
                priority = "urgent"
            elif "block" in intervention.lower():
                intervention_type = "calendar_block"
                priority = "medium"
            else:
                intervention_type = "reminder"
                priority = "low"
            
            # Schedule intervention
            scheduled_time = self._calculate_intervention_time(intervention_type, preferences)
            
            wellbeing_intervention = WellbeingIntervention(
                intervention_type=intervention_type,
                description=intervention,
                scheduled_time=scheduled_time,
                priority=priority,
                expected_impact=self._assess_intervention_impact(intervention_type)
            )
            
            scheduled_interventions.append(wellbeing_intervention)
        
        return scheduled_interventions
    
    def _calculate_intervention_time(self, 
                                   intervention_type: str,
                                   preferences: Dict[str, Any]) -> datetime:
        """Calculate appropriate time for intervention"""
        
        now = datetime.now()
        
        if intervention_type == "break":
            # Schedule break within next 2 hours
            return now + timedelta(hours=1)
        elif intervention_type == "time_off":
            # Schedule day off for next available day
            return now + timedelta(days=1)
        elif intervention_type == "calendar_block":
            # Schedule calendar block for tomorrow
            return now.replace(hour=9, minute=0, second=0, microsecond=0) + timedelta(days=1)
        else:
            # Schedule reminder for later today
            return now + timedelta(hours=2)
    
    def _assess_intervention_impact(self, intervention_type: str) -> str:
        """Assess expected impact of intervention"""
        
        impact_mapping = {
            "break": "Immediate stress relief and productivity boost",
            "time_off": "Significant stress reduction and recovery",
            "calendar_block": "Protected time for personal activities",
            "reminder": "Increased awareness and behavior change"
        }
        
        return impact_mapping.get(intervention_type, "Positive impact on wellbeing")
    
    def send_wellbeing_nudge(self, 
                           intervention: WellbeingIntervention,
                           current_context: Dict[str, Any]) -> str:
        """Generate personalized wellbeing nudge message"""
        
        if intervention.intervention_type == "break":
            return f"⏰ Time for a break! You've been working for a while. Take 15 minutes to stretch, hydrate, or step outside. Your productivity will thank you!"
        
        elif intervention.intervention_type == "time_off":
            return f"🏖️ You've been working hard! Consider taking some time off to recharge. Your wellbeing is important for long-term success."
        
        elif intervention.intervention_type == "calendar_block":
            return f"📅 I've blocked time in your calendar for personal activities. Use this time for yourself - no work allowed!"
        
        else:
            return f"💡 Friendly reminder: {intervention.description}"
    
    def get_agent_info(self) -> Dict[str, Any]:
        """Get agent information and capabilities"""
        
        return {
            "name": self.name,
            "role": self.role,
            "expertise": self.expertise,
            "capabilities": [
                "Workload utilization analysis",
                "Burnout risk assessment",
                "Workload trend identification",
                "Optimization suggestion generation",
                "Wellbeing intervention scheduling",
                "Personalized nudge delivery",
                "Work-life balance monitoring"
            ]
        }
