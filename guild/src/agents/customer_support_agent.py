"""
Customer Support Agent for Guild-AI
Handles customer support tickets and FAQs.
"""

from typing import Dict, List, Any
from datetime import datetime


class CustomerSupportAgent:
    """Customer Support Agent for handling customer inquiries."""
    
    def __init__(self):
        self.agent_name = "Customer Support Agent"
        self.agent_type = "Product"
        self.capabilities = [
            "Ticket management",
            "FAQ responses",
            "Issue escalation",
            "Customer satisfaction tracking"
        ]
        self.support_tickets = {}
        self.faq_database = {}
        
    def get_agent_info(self) -> Dict[str, Any]:
        """Return agent information."""
        return {
            "name": self.agent_name,
            "type": self.agent_type,
            "capabilities": self.capabilities,
            "status": "active"
        }
    
    def create_support_ticket(self, ticket_data: Dict[str, Any]) -> str:
        """Create new support ticket."""
        try:
            ticket_id = f"ticket_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            ticket = {
                "id": ticket_id,
                "customer_id": ticket_data.get("customer_id", ""),
                "subject": ticket_data.get("subject", ""),
                "description": ticket_data.get("description", ""),
                "priority": ticket_data.get("priority", "medium"),
                "category": ticket_data.get("category", "general"),
                "status": "open",
                "created_date": datetime.now().isoformat()
            }
            self.support_tickets[ticket_id] = ticket
            return f"Created ticket: {ticket_id}"
        except Exception as e:
            return f"Error: {str(e)}"
    
    def respond_to_ticket(self, ticket_id: str, response: str) -> str:
        """Respond to support ticket."""
        try:
            if ticket_id not in self.support_tickets:
                return "Ticket not found"
            
            ticket = self.support_tickets[ticket_id]
            ticket["response"] = response
            ticket["status"] = "responded"
            ticket["response_date"] = datetime.now().isoformat()
            
            return f"Responded to ticket: {ticket_id}"
        except Exception as e:
            return f"Error: {str(e)}"
    
    def add_faq(self, faq_data: Dict[str, Any]) -> str:
        """Add FAQ to database."""
        try:
            faq_id = f"faq_{len(self.faq_database) + 1}"
            faq = {
                "id": faq_id,
                "question": faq_data.get("question", ""),
                "answer": faq_data.get("answer", ""),
                "category": faq_data.get("category", "general"),
                "keywords": faq_data.get("keywords", [])
            }
            self.faq_database[faq_id] = faq
            return f"Added FAQ: {faq_id}"
        except Exception as e:
            return f"Error: {str(e)}"
    
    def search_faq(self, query: str) -> List[Dict[str, Any]]:
        """Search FAQ database."""
        try:
            results = []
            query_lower = query.lower()
            
            for faq in self.faq_database.values():
                if (query_lower in faq["question"].lower() or 
                    query_lower in faq["answer"].lower() or
                    any(query_lower in keyword.lower() for keyword in faq.get("keywords", []))):
                    results.append(faq)
            
            return results
        except Exception as e:
            return [{"error": str(e)}]
    
    def escalate_ticket(self, ticket_id: str, reason: str) -> str:
        """Escalate support ticket."""
        try:
            if ticket_id not in self.support_tickets:
                return "Ticket not found"
            
            ticket = self.support_tickets[ticket_id]
            ticket["status"] = "escalated"
            ticket["escalation_reason"] = reason
            ticket["escalation_date"] = datetime.now().isoformat()
            
            return f"Escalated ticket: {ticket_id}"
        except Exception as e:
            return f"Error: {str(e)}"
    
    def get_agent_capabilities(self) -> List[str]:
        """Return agent capabilities."""
        return [
            "Support ticket management",
            "FAQ database management",
            "Customer inquiry responses",
            "Issue escalation handling",
            "Customer satisfaction tracking"
        ]