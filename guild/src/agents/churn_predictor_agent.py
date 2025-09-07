"""
Churn Predictor Agent for Guild-AI
Monitors customer behavior and flags at-risk users.
"""

from typing import Dict, List, Any
from datetime import datetime, timedelta


class ChurnPredictorAgent:
    """Churn Predictor Agent for identifying at-risk customers."""
    
    def __init__(self):
        self.agent_name = "Churn Predictor Agent"
        self.agent_type = "Product"
        self.capabilities = [
            "Churn prediction modeling",
            "Customer behavior analysis",
            "Risk scoring",
            "Retention recommendations"
        ]
        self.customer_data = {}
        self.churn_models = {}
        
    def get_agent_info(self) -> Dict[str, Any]:
        """Return agent information."""
        return {
            "name": self.agent_name,
            "type": self.agent_type,
            "capabilities": self.capabilities,
            "status": "active"
        }
    
    def analyze_customer_behavior(self, customer_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze customer behavior patterns."""
        try:
            # Extract key metrics
            login_frequency = customer_data.get("login_frequency", 0)
            feature_usage = customer_data.get("feature_usage", 0)
            support_tickets = customer_data.get("support_tickets", 0)
            days_since_last_activity = customer_data.get("days_since_last_activity", 0)
            
            # Calculate behavior score
            behavior_score = 0
            
            # Login frequency (0-30 points)
            if login_frequency >= 7:
                behavior_score += 30
            elif login_frequency >= 3:
                behavior_score += 20
            elif login_frequency >= 1:
                behavior_score += 10
            
            # Feature usage (0-25 points)
            if feature_usage >= 0.8:
                behavior_score += 25
            elif feature_usage >= 0.5:
                behavior_score += 15
            elif feature_usage >= 0.2:
                behavior_score += 5
            
            # Support tickets (0-20 points, negative impact)
            if support_tickets == 0:
                behavior_score += 20
            elif support_tickets <= 2:
                behavior_score += 10
            else:
                behavior_score -= 10
            
            # Activity recency (0-25 points)
            if days_since_last_activity <= 1:
                behavior_score += 25
            elif days_since_last_activity <= 7:
                behavior_score += 15
            elif days_since_last_activity <= 30:
                behavior_score += 5
            else:
                behavior_score -= 15
            
            return {
                "customer_id": customer_data.get("customer_id", ""),
                "behavior_score": max(0, min(100, behavior_score)),
                "risk_level": self._determine_risk_level(behavior_score),
                "key_indicators": {
                    "login_frequency": login_frequency,
                    "feature_usage": feature_usage,
                    "support_tickets": support_tickets,
                    "days_since_last_activity": days_since_last_activity
                }
            }
            
        except Exception as e:
            return {"error": f"Behavior analysis failed: {str(e)}"}
    
    def _determine_risk_level(self, score: float) -> str:
        """Determine churn risk level based on score."""
        if score >= 80:
            return "low"
        elif score >= 60:
            return "medium"
        elif score >= 40:
            return "high"
        else:
            return "critical"
    
    def predict_churn_probability(self, customer_id: str, historical_data: Dict[str, Any]) -> Dict[str, Any]:
        """Predict churn probability for a customer."""
        try:
            # Simple churn prediction model
            base_probability = 0.1  # 10% base churn rate
            
            # Adjust based on factors
            if historical_data.get("payment_delays", 0) > 0:
                base_probability += 0.3
            
            if historical_data.get("feature_usage_decline", 0) > 0.5:
                base_probability += 0.2
            
            if historical_data.get("support_escalations", 0) > 2:
                base_probability += 0.15
            
            if historical_data.get("competitor_mentions", 0) > 0:
                base_probability += 0.1
            
            # Reduce probability for positive factors
            if historical_data.get("recent_purchases", 0) > 0:
                base_probability -= 0.1
            
            if historical_data.get("referrals", 0) > 0:
                base_probability -= 0.05
            
            # Ensure probability is between 0 and 1
            churn_probability = max(0, min(1, base_probability))
            
            return {
                "customer_id": customer_id,
                "churn_probability": round(churn_probability, 3),
                "risk_level": self._determine_risk_level(churn_probability * 100),
                "confidence": 0.75,  # Model confidence
                "prediction_date": datetime.now().isoformat()
            }
            
        except Exception as e:
            return {"error": f"Churn prediction failed: {str(e)}"}
    
    def generate_retention_recommendations(self, customer_id: str, risk_level: str) -> List[str]:
        """Generate retention recommendations based on risk level."""
        try:
            recommendations = []
            
            if risk_level == "critical":
                recommendations.extend([
                    "Immediate personal outreach from account manager",
                    "Offer emergency support or consultation",
                    "Provide temporary discount or free features",
                    "Schedule urgent customer success call"
                ])
            elif risk_level == "high":
                recommendations.extend([
                    "Proactive customer success check-in",
                    "Offer additional training or onboarding",
                    "Provide usage analytics and optimization tips",
                    "Introduce new features that match their use case"
                ])
            elif risk_level == "medium":
                recommendations.extend([
                    "Send personalized usage report",
                    "Invite to upcoming product webinars",
                    "Share relevant case studies or success stories",
                    "Offer feature consultation call"
                ])
            else:  # low risk
                recommendations.extend([
                    "Continue regular check-ins",
                    "Share product updates and new features",
                    "Encourage referrals and testimonials",
                    "Maintain engagement through content"
                ])
            
            return recommendations
            
        except Exception as e:
            return [f"Error generating recommendations: {str(e)}"]
    
    def get_agent_capabilities(self) -> List[str]:
        """Return agent capabilities."""
        return [
            "Customer behavior analysis",
            "Churn probability prediction",
            "Risk level assessment",
            "Retention strategy recommendations",
            "Customer health scoring"
        ]