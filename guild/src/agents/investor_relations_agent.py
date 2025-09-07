"""
Investor Relations Agent for Guild-AI
Manages investor communications and funding activities.
"""

from typing import Dict, List, Any
from datetime import datetime


class InvestorRelationsAgent:
    """Investor Relations Agent for managing investor communications and funding activities."""
    
    def __init__(self):
        self.agent_name = "Investor Relations Agent"
        self.agent_type = "Finance"
        self.capabilities = [
            "Investor relationship management",
            "Funding update preparation", 
            "Pitch deck creation",
            "Due diligence support"
        ]
        self.investor_database = {}
        
    def get_agent_info(self) -> Dict[str, Any]:
        """Return agent information."""
        return {
            "name": self.agent_name,
            "type": self.agent_type,
            "capabilities": self.capabilities,
            "status": "active"
        }
    
    def add_investor(self, investor_data: Dict[str, Any]) -> str:
        """Add investor to database."""
        try:
            self.investor_database[investor_data["name"]] = investor_data
            return f"Added investor: {investor_data['name']}"
        except Exception as e:
            return f"Error: {str(e)}"
    
    def prepare_funding_update(self, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """Prepare funding update."""
        return {
            "type": update_data.get("type", "milestone"),
            "title": update_data.get("title", ""),
            "description": update_data.get("description", ""),
            "metrics": update_data.get("metrics", {}),
            "date": datetime.now().isoformat()
        }
    
    def create_pitch_deck_outline(self, company_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create pitch deck outline."""
        return {
            "title": f"{company_data.get('company_name', 'Company')} - Investment Opportunity",
            "sections": [
                "Problem & Solution",
                "Market Opportunity", 
                "Business Model",
                "Traction & Metrics",
                "Team",
                "Financial Projections",
                "Funding Ask"
            ],
            "recommended_length": "15-20 slides"
        }
    
    def track_funding_pipeline(self) -> Dict[str, Any]:
        """Track funding pipeline."""
        return {
            "total_investors": len(self.investor_database),
            "active_prospects": len([i for i in self.investor_database.values() 
                                   if i.get("status") == "prospect"]),
            "due_diligence": len([i for i in self.investor_database.values() 
                                if i.get("status") == "due_diligence"]),
            "closed_deals": len([i for i in self.investor_database.values() 
                               if i.get("status") == "closed"])
        }
    
    def get_agent_capabilities(self) -> List[str]:
        """Return agent capabilities."""
        return [
            "Investor relationship management",
            "Funding update preparation",
            "Pitch deck creation",
            "Due diligence support",
            "Investor communication tracking",
            "Funding pipeline analysis"
        ]