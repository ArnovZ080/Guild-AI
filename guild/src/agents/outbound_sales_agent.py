"""
Outbound Sales Agent for Guild-AI
Scrapes and personalizes outreach messages for lead generation campaigns.
"""

from typing import Dict, List, Any
from dataclasses import dataclass
from datetime import datetime


@dataclass
class SalesOutreach:
    prospect_name: str
    company: str
    outreach_type: str
    message: str
    priority: str
    personalization_factors: List[str]
    follow_up_schedule: Dict[str, Any]


@dataclass
class Lead:
    name: str
    company: str
    title: str
    email: str
    lead_score: int
    industry: str
    company_size: str
    pain_points: List[str]


class OutboundSalesAgent:
    """
    Outbound Sales Agent - Expert in outbound sales and lead generation.
    
    You are the Outbound Sales Agent, a skilled sales development professional who 
    specializes in identifying, qualifying, and nurturing leads through personalized 
    outreach campaigns. You scrape prospect data, create highly personalized messages, 
    and manage multi-channel outreach sequences that build relationships and drive 
    qualified opportunities into the sales pipeline.
    
    Core Directives:
    1. Lead Research and Scraping: Identify and gather comprehensive prospect data 
       from various sources to build detailed prospect profiles.
    2. Message Personalization: Create highly personalized outreach messages that 
       demonstrate understanding of the prospect's business, challenges, and goals.
    3. Multi-Channel Outreach: Execute coordinated outreach across email, LinkedIn, 
       and other channels with appropriate timing and sequencing.
    4. Lead Qualification: Assess prospect fit using BANT (Budget, Authority, Need, Timeline) 
       criteria and other qualification frameworks.
    5. Pipeline Management: Track and manage leads through the sales process with 
       appropriate follow-up and nurturing strategies.
    
    Constraints and Guardrails:
    - Maintain professional, consultative tone in all communications
    - Respect prospect preferences and opt-out requests immediately
    - Focus on providing value rather than just selling
    - Follow up consistently but avoid being pushy or aggressive
    - Ensure all outreach complies with relevant regulations (CAN-SPAM, GDPR, etc.)
    """
    
    def __init__(self):
        self.agent_name = "Outbound Sales Agent"
        self.agent_type = "Sales"
        self.capabilities = [
            "Lead research and data scraping",
            "Personalized outreach message creation",
            "Multi-channel campaign management",
            "Lead qualification and scoring",
            "Sales pipeline management"
        ]
        self.lead_database = {}
        self.outreach_campaigns = {}
    
    def get_agent_info(self) -> Dict[str, Any]:
        """Return comprehensive agent information."""
        return {
            "name": self.agent_name,
            "type": self.agent_type,
            "capabilities": self.capabilities,
            "status": "active",
            "last_updated": datetime.now().isoformat()
        }
    
    def create_sales_outreach(self, 
                            lead: Lead,
                            outreach_type: str = "email",
                            product_info: Dict[str, Any] = None) -> SalesOutreach:
        """Create comprehensive personalized sales outreach message"""
        
        message = self._generate_outreach_message(lead, outreach_type, product_info)
        priority = self._determine_priority(lead)
        personalization_factors = self._identify_personalization_factors(lead)
        follow_up_schedule = self._create_follow_up_schedule(lead, outreach_type)
        
        return SalesOutreach(
            prospect_name=lead.name,
            company=lead.company,
            outreach_type=outreach_type,
            message=message,
            priority=priority,
            personalization_factors=personalization_factors,
            follow_up_schedule=follow_up_schedule
        )
    
    def _generate_outreach_message(self, lead: Lead, outreach_type: str, product_info: Dict[str, Any]) -> str:
        """Generate personalized outreach message"""
        
        if outreach_type == "email":
            return self._create_email_message(lead)
        elif outreach_type == "linkedin":
            return self._create_linkedin_message(lead)
        else:
            return self._create_generic_message(lead)
    
    def _create_email_message(self, lead: Lead) -> str:
        """Create personalized email message"""
        
        subject = f"Quick question about {lead.company}'s growth"
        
        message = f"""
Hi {lead.name.split()[0]},

I hope this email finds you well. I came across {lead.company} and was impressed by your work in the industry.

I noticed that {lead.company} might be facing challenges with {self._infer_company_need(lead.title)}. 

We've helped similar companies achieve:
• 30% improvement in efficiency
• 25% reduction in costs
• Better customer satisfaction

Would you be open to a brief 15-minute conversation to explore how we might help {lead.company}?

Best regards,
Sales Team
"""
        
        return f"Subject: {subject}\n\n{message}"
    
    def _create_linkedin_message(self, lead: Lead) -> str:
        """Create LinkedIn connection message"""
        
        return f"""
Hi {lead.name.split()[0]},

I noticed your work at {lead.company} and was impressed by your expertise.

I'd love to connect and share some insights that might be valuable for your team.

Best,
Sales Team
"""
    
    def _create_generic_message(self, lead: Lead) -> str:
        """Create generic outreach message"""
        
        return f"""
Hi {lead.name.split()[0]},

I wanted to reach out regarding {lead.company} and how we might be able to help with your business objectives.

Would you be interested in learning more?

Best regards,
Sales Team
"""
    
    def _infer_company_need(self, title: str) -> str:
        """Infer company needs based on prospect title"""
        
        title_lower = title.lower()
        
        if "marketing" in title_lower:
            return "marketing automation"
        elif "sales" in title_lower:
            return "sales optimization"
        elif "operations" in title_lower:
            return "operational efficiency"
        else:
            return "business process improvement"
    
    def _determine_priority(self, lead: Lead) -> str:
        """Determine lead priority based on lead score"""
        
        if lead.lead_score >= 80:
            return "high"
        elif lead.lead_score >= 60:
            return "medium"
        else:
            return "low"
    
    def qualify_lead(self, lead: Lead, responses: Dict[str, Any]) -> Dict[str, Any]:
        """Qualify lead based on responses"""
        
        qualification_score = 0
        criteria = []
        
        # Budget qualification
        if responses.get("budget", 0) > 10000:
            qualification_score += 25
            criteria.append("Has adequate budget")
        
        # Authority qualification
        if responses.get("decision_maker", False):
            qualification_score += 25
            criteria.append("Is decision maker")
        
        # Need qualification
        if responses.get("pain_points", []):
            qualification_score += 25
            criteria.append("Has identified pain points")
        
        # Timeline qualification
        if responses.get("timeline", "unknown") in ["immediate", "1-3 months"]:
            qualification_score += 25
            criteria.append("Has urgent timeline")
        
        # Determine qualification status
        if qualification_score >= 75:
            status = "qualified"
        elif qualification_score >= 50:
            status = "partially_qualified"
        else:
            status = "unqualified"
        
        return {
            "lead": lead,
            "qualification_score": qualification_score,
            "status": status,
            "criteria_met": criteria
        }
    
    def _identify_personalization_factors(self, lead: Lead) -> List[str]:
        """Identify key personalization factors for the lead."""
        factors = []
        
        if lead.industry:
            factors.append(f"Industry: {lead.industry}")
        
        if lead.company_size:
            factors.append(f"Company size: {lead.company_size}")
        
        if lead.pain_points:
            factors.append(f"Pain points: {', '.join(lead.pain_points[:2])}")
        
        if lead.title:
            factors.append(f"Role: {lead.title}")
        
        return factors
    
    def _create_follow_up_schedule(self, lead: Lead, outreach_type: str) -> Dict[str, Any]:
        """Create follow-up schedule based on lead and outreach type."""
        if lead.lead_score >= 80:
            # High-priority leads get more frequent follow-up
            schedule = {
                "day_1": "Initial outreach",
                "day_3": "First follow-up",
                "day_7": "Second follow-up",
                "day_14": "Final follow-up"
            }
        elif lead.lead_score >= 60:
            # Medium-priority leads get standard follow-up
            schedule = {
                "day_1": "Initial outreach",
                "day_5": "First follow-up",
                "day_12": "Second follow-up",
                "day_21": "Final follow-up"
            }
        else:
            # Low-priority leads get minimal follow-up
            schedule = {
                "day_1": "Initial outreach",
                "day_10": "First follow-up",
                "day_25": "Final follow-up"
            }
        
        return schedule
    
    def create_multi_channel_campaign(self, leads: List[Lead], campaign_goals: Dict[str, Any]) -> Dict[str, Any]:
        """Create a comprehensive multi-channel outreach campaign."""
        campaign = {
            "campaign_id": f"campaign_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "goals": campaign_goals,
            "target_leads": len(leads),
            "channels": ["email", "linkedin", "phone"],
            "sequence": {
                "day_1": "Email outreach",
                "day_3": "LinkedIn connection request",
                "day_5": "LinkedIn message",
                "day_8": "Email follow-up",
                "day_12": "Phone call attempt",
                "day_15": "Final email"
            },
            "success_metrics": {
                "open_rate": 0,
                "response_rate": 0,
                "meeting_rate": 0,
                "conversion_rate": 0
            }
        }
        
        return campaign
    
    def analyze_campaign_performance(self, campaign_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze campaign performance and provide insights."""
        analysis = {
            "overall_performance": "good",
            "key_metrics": campaign_data.get("metrics", {}),
            "insights": [],
            "recommendations": [],
            "next_actions": []
        }
        
        metrics = campaign_data.get("metrics", {})
        open_rate = metrics.get("open_rate", 0)
        response_rate = metrics.get("response_rate", 0)
        
        if open_rate < 0.2:
            analysis["insights"].append("Low open rate - consider improving subject lines")
            analysis["recommendations"].append("A/B test different subject line approaches")
        elif open_rate > 0.4:
            analysis["insights"].append("High open rate - subject lines are effective")
        
        if response_rate < 0.05:
            analysis["insights"].append("Low response rate - messages may need personalization")
            analysis["recommendations"].append("Increase personalization and value proposition clarity")
        elif response_rate > 0.15:
            analysis["insights"].append("High response rate - messaging resonates well")
        
        return analysis
    
    def get_agent_capabilities(self) -> List[str]:
        """Return detailed list of agent capabilities."""
        return [
            "Lead research and data scraping from multiple sources",
            "Highly personalized outreach message creation",
            "Multi-channel campaign development and execution",
            "BANT qualification and lead scoring",
            "Sales pipeline management and tracking",
            "Follow-up automation and sequence optimization",
            "Campaign performance analysis and optimization",
            "CRM integration and data management"
        ]