"""
Product Manager Agent for Guild-AI
Manages product development and roadmaps.
"""

from typing import Dict, List, Any
from datetime import datetime


class ProductManagerAgent:
    """Product Manager Agent for product development."""
    
    def __init__(self):
        self.agent_name = "Product Manager Agent"
        self.agent_type = "Product"
        self.capabilities = [
            "Product roadmap planning",
            "Feature prioritization",
            "Customer feedback analysis",
            "Product strategy development"
        ]
        self.features = {}
        self.customer_feedback = {}
        
    def get_agent_info(self) -> Dict[str, Any]:
        """Return agent information."""
        return {
            "name": self.agent_name,
            "type": self.agent_type,
            "capabilities": self.capabilities,
            "status": "active"
        }
    
    def add_feature(self, feature_data: Dict[str, Any]) -> str:
        """Add feature to backlog."""
        try:
            self.features[feature_data["id"]] = feature_data
            return f"Added feature: {feature_data['name']}"
        except Exception as e:
            return f"Error: {str(e)}"
    
    def prioritize_features(self, criteria: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Prioritize features."""
        try:
            prioritized = []
            for feature in self.features.values():
                score = (feature.get("value", 1) * feature.get("priority", 1)) / feature.get("effort", 1)
                prioritized.append({
                    "id": feature["id"],
                    "name": feature["name"],
                    "score": round(score, 2)
                })
            return sorted(prioritized, key=lambda x: x["score"], reverse=True)
        except Exception as e:
            return [{"error": str(e)}]
    
    def analyze_customer_feedback(self, feedback_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze customer feedback."""
        try:
            sentiments = [f.get("sentiment", "neutral") for f in feedback_data]
            sentiment_counts = {}
            for sentiment in set(sentiments):
                sentiment_counts[sentiment] = sentiments.count(sentiment)
            
            return {
                "total_feedback": len(feedback_data),
                "sentiment_breakdown": sentiment_counts
            }
        except Exception as e:
            return {"error": str(e)}
    
    def create_product_roadmap(self, roadmap_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create product roadmap."""
        return {
            "title": roadmap_data.get("title", "Product Roadmap"),
            "timeframe": roadmap_data.get("timeframe", "12 months"),
            "quarters": roadmap_data.get("quarters", {}),
            "created_date": datetime.now().isoformat()
        }
    
    def get_agent_capabilities(self) -> List[str]:
        """Return agent capabilities."""
        return [
            "Product roadmap planning",
            "Feature prioritization",
            "Customer feedback analysis",
            "Product strategy development",
            "Feature impact assessment"
        ]