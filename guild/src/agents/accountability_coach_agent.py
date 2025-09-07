"""
Accountability & Motivation Coach Agent for Guild-AI
Sets personalized goals, tracks progress, and provides regular check-ins and encouragement.
"""

from typing import Dict, List, Any
from dataclasses import dataclass
from datetime import datetime, timedelta


@dataclass
class MotivationSession:
    session_type: str
    message: str
    action_items: List[str]
    next_checkin: datetime
    encouragement_level: float
    progress_insights: List[str]
    motivational_techniques: List[str]


class AccountabilityCoachAgent:
    """
    Accountability & Motivation Coach Agent - Expert in motivation and accountability support.
    
    You are the Accountability & Motivation Coach Agent, a dedicated partner in the solopreneur's 
    journey toward achieving their goals. You set personalized goals, track progress, provide 
    regular check-ins, offer encouraging feedback, and help re-align focus when needed. You 
    understand the unique challenges of working alone and provide the support system that 
    solopreneurs often lack.
    
    Core Directives:
    1. Personalized Goal Setting: Work with the solopreneur to establish SMART goals that 
       align with their vision, values, and current capacity.
    2. Progress Tracking: Monitor progress through regular check-ins, milestone tracking, 
       and performance metrics analysis.
    3. Motivational Support: Provide encouragement, celebrate wins, and offer motivation 
       during challenging periods.
    4. Accountability Systems: Implement effective accountability mechanisms including 
       regular check-ins, progress reviews, and consequence systems.
    5. Focus Re-alignment: Help solopreneurs get back on track when they lose focus or 
       encounter obstacles.
    
    Constraints and Guardrails:
    - Maintain a supportive, non-judgmental tone while holding firm accountability
    - Adapt communication style to the solopreneur's personality and preferences
    - Balance encouragement with realistic expectations and honest feedback
    - Respect boundaries and avoid overwhelming with too many check-ins
    - Focus on sustainable progress rather than perfection
    """
    
    def __init__(self):
        self.agent_name = "Accountability & Motivation Coach Agent"
        self.agent_type = "Executive"
        self.capabilities = [
            "Personalized goal setting",
            "Progress tracking and monitoring",
            "Motivational coaching sessions",
            "Accountability system implementation",
            "Focus re-alignment support"
        ]
        self.goal_tracking = {}
        self.motivation_history = {}
    
    def get_agent_info(self) -> Dict[str, Any]:
        """Return comprehensive agent information."""
        return {
            "name": self.agent_name,
            "type": self.agent_type,
            "capabilities": self.capabilities,
            "status": "active",
            "last_updated": datetime.now().isoformat()
        }
    
    def conduct_motivation_session(self, 
                                 user_goals: List[str],
                                 progress_data: Dict[str, Any],
                                 current_challenges: List[str]) -> MotivationSession:
        """Conduct a comprehensive motivation and accountability session"""
        
        session_type = self._determine_session_type(progress_data, current_challenges)
        message = self._generate_motivational_message(progress_data, current_challenges)
        action_items = self._create_action_items(user_goals, current_challenges)
        next_checkin = self._schedule_next_checkin(session_type)
        encouragement_level = self._calculate_encouragement_level(progress_data)
        progress_insights = self._generate_progress_insights(progress_data)
        motivational_techniques = self._select_motivational_techniques(session_type)
        
        return MotivationSession(
            session_type=session_type,
            message=message,
            action_items=action_items,
            next_checkin=next_checkin,
            encouragement_level=encouragement_level,
            progress_insights=progress_insights,
            motivational_techniques=motivational_techniques
        )
    
    def _determine_session_type(self, progress: Dict, challenges: List[str]) -> str:
        """Determine the type of motivation session needed"""
        if len(challenges) > 3:
            return "crisis_support"
        elif progress.get("completion_rate", 0) < 0.5:
            return "motivation_boost"
        elif progress.get("completion_rate", 0) > 0.8:
            return "celebration"
        else:
            return "routine_checkin"
    
    def _generate_motivational_message(self, progress: Dict, challenges: List[str]) -> str:
        """Generate personalized motivational message with depth and context."""
        completion_rate = progress.get("completion_rate", 0)
        recent_activity = progress.get("recent_activity", 0)
        streak_days = progress.get("streak_days", 0)
        
        if completion_rate > 0.8:
            return f"🎉 Outstanding work! You've achieved {completion_rate*100:.0f}% completion and maintained a {streak_days}-day streak. Your consistency is inspiring and you're setting a powerful example of what's possible with focused effort. Keep this incredible momentum going!"
        elif completion_rate > 0.5:
            return f"💪 Excellent progress! You're at {completion_rate*100:.0f}% completion and showing real dedication. Every step forward is building your success foundation. Let's tackle the remaining challenges together - you have the skills and determination to push through."
        elif recent_activity < 0.3:
            return "🌟 I understand this might be a challenging time. Remember, every successful entrepreneur faces setbacks - it's how you respond that defines your journey. Take a deep breath, reconnect with your 'why', and take just one small step forward today. Progress, not perfection, is the goal."
        else:
            return "🚀 You're building momentum! Even small consistent actions create significant results over time. Trust the process, stay focused on your vision, and remember that every expert was once a beginner. You've got this!"
    
    def _create_action_items(self, goals: List[str], challenges: List[str]) -> List[str]:
        """Create actionable items for the user"""
        action_items = []
        
        # Add goal-specific actions
        for goal in goals[:2]:  # Focus on top 2 goals
            action_items.append(f"Take one specific action toward: {goal}")
        
        # Add challenge-specific actions
        if challenges:
            action_items.append(f"Address the main challenge: {challenges[0]}")
        
        # Add general accountability actions
        action_items.extend([
            "Review progress and celebrate small wins",
            "Plan tomorrow's priorities before bed",
            "Share progress with accountability partner"
        ])
        
        return action_items[:5]  # Limit to 5 actionable items
    
    def _schedule_next_checkin(self, session_type: str) -> datetime:
        """Schedule the next check-in based on session type"""
        now = datetime.now()
        
        if session_type == "crisis_support":
            return now + timedelta(hours=12)  # Check in twice daily
        elif session_type == "motivation_boost":
            return now + timedelta(days=1)    # Daily check-ins
        elif session_type == "celebration":
            return now + timedelta(days=3)    # Every 3 days
        else:
            return now + timedelta(days=2)    # Every 2 days
    
    def _calculate_encouragement_level(self, progress: Dict) -> float:
        """Calculate how much encouragement the user needs"""
        completion_rate = progress.get("completion_rate", 0)
        recent_activity = progress.get("recent_activity", 0)
        
        # Higher encouragement needed for lower progress
        base_encouragement = 1.0 - completion_rate
        
        # Adjust based on recent activity
        if recent_activity < 0.3:
            base_encouragement += 0.2
        
        return max(0.1, min(1.0, base_encouragement))
    
    def track_goal_progress(self, goal: str, milestones: List[str]) -> Dict[str, Any]:
        """Track progress toward a specific goal"""
        return {
            "goal": goal,
            "milestones": milestones,
            "completion_percentage": len([m for m in milestones if m.get("completed", False)]) / len(milestones) if milestones else 0,
            "next_milestone": next((m for m in milestones if not m.get("completed", False)), None),
            "estimated_completion": "Based on current pace, goal should be achieved within 2-3 weeks"
        }
    
    def create_habit_tracker(self, habits: List[str]) -> Dict[str, Any]:
        """Create a habit tracking system"""
        return {
            "habits": habits,
            "tracking_period": "30 days",
            "success_metrics": [
                "Consistency rate (days completed / total days)",
                "Streak length (consecutive days)",
                "Quality score (1-10 self-assessment)"
            ],
            "motivation_tips": [
                "Start small and build momentum",
                "Track progress visually",
                "Celebrate small wins",
                "Use habit stacking (attach to existing habits)"
            ]
        }
    
    def _generate_progress_insights(self, progress: Dict) -> List[str]:
        """Generate insights about progress patterns and trends."""
        insights = []
        completion_rate = progress.get("completion_rate", 0)
        recent_activity = progress.get("recent_activity", 0)
        streak_days = progress.get("streak_days", 0)
        
        if streak_days > 7:
            insights.append(f"Impressive {streak_days}-day consistency streak - this shows strong habit formation")
        
        if completion_rate > 0.7:
            insights.append("High completion rate indicates effective goal-setting and execution")
        elif completion_rate < 0.3:
            insights.append("Lower completion rate suggests goals may need to be more achievable or better prioritized")
        
        if recent_activity > 0.8:
            insights.append("High recent activity shows strong current momentum")
        elif recent_activity < 0.3:
            insights.append("Low recent activity may indicate need for motivation boost or goal adjustment")
        
        return insights
    
    def _select_motivational_techniques(self, session_type: str) -> List[str]:
        """Select appropriate motivational techniques based on session type."""
        techniques = {
            "crisis_support": [
                "Break down overwhelming tasks into micro-actions",
                "Focus on one small win today",
                "Use the 2-minute rule for getting started",
                "Practice self-compassion and positive self-talk"
            ],
            "motivation_boost": [
                "Visualize the end result and how it feels",
                "Connect current actions to long-term vision",
                "Use implementation intentions (if-then planning)",
                "Celebrate progress, not just completion"
            ],
            "celebration": [
                "Document and share your achievements",
                "Reward yourself with something meaningful",
                "Reflect on lessons learned and growth",
                "Set new stretch goals to maintain momentum"
            ],
            "routine_checkin": [
                "Review and adjust goals if needed",
                "Identify and remove friction points",
                "Use time-blocking for important tasks",
                "Practice gratitude for progress made"
            ]
        }
        
        return techniques.get(session_type, techniques["routine_checkin"])
    
    def get_agent_capabilities(self) -> List[str]:
        """Return detailed list of agent capabilities."""
        return [
            "Personalized goal setting and SMART goal development",
            "Progress tracking with milestone monitoring and analytics",
            "Motivational coaching sessions with tailored messaging",
            "Accountability system implementation and management",
            "Habit formation support and behavior change guidance",
            "Focus re-alignment and obstacle resolution strategies",
            "Performance encouragement and celebration systems",
            "Challenge resolution and crisis support mechanisms"
        ]