"""
Lead Personalization Agent for Guild-AI

This agent specializes in creating highly personalized outreach messages
using sales psychology principles to maximize engagement and conversion rates.
"""

import logging
from typing import Dict, Any, List, Optional
from .enhanced_prompts import EnhancedPrompts

logger = logging.getLogger(__name__)

class LeadPersonalizationAgent:
    """
    Agent that creates personalized outreach messages using sales psychology.
    """
    
    def __init__(self):
        self.prompt_template = EnhancedPrompts.get_lead_personalization_agent_prompt()
        logger.info("Lead Personalization Agent initialized")
    
    def personalize_outreach(self, 
                           lead_data: Dict[str, Any],
                           product_info: Dict[str, Any],
                           outreach_channel: str = "email",
                           user_info: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Create a personalized outreach message for a lead.
        
        Args:
            lead_data: Enriched lead data
            product_info: Information about the product/service
            outreach_channel: Channel for outreach (email, linkedin, cold_call)
            user_info: Information about the user/company
            
        Returns:
            Personalized outreach message and metadata
        """
        try:
            logger.info(f"Personalizing outreach for {lead_data.get('name', 'Unknown')} via {outreach_channel}")
            
            # Build the prompt with context
            prompt = self._build_personalization_prompt(
                lead_data, product_info, outreach_channel, user_info
            )
            
            # In a real implementation, this would call an LLM
            # For now, we'll create a template-based response
            personalized_message = self._generate_personalized_message(
                lead_data, product_info, outreach_channel, user_info
            )
            
            # Calculate personalization score
            personalization_score = self._calculate_personalization_score(
                lead_data, personalized_message
            )
            
            return {
                'status': 'success',
                'message': personalized_message,
                'channel': outreach_channel,
                'personalization_score': personalization_score,
                'lead_name': lead_data.get('name', 'Unknown'),
                'company': lead_data.get('company', 'Unknown'),
                'psychological_principles_used': self._identify_psychological_principles(lead_data)
            }
            
        except Exception as e:
            logger.error(f"Error personalizing outreach: {e}")
            return {
                'status': 'error',
                'error': str(e),
                'message': None
            }
    
    def _build_personalization_prompt(self, 
                                    lead_data: Dict[str, Any],
                                    product_info: Dict[str, Any],
                                    outreach_channel: str,
                                    user_info: Optional[Dict[str, Any]]) -> str:
        """Build the prompt for personalization."""
        
        prompt = f"""{self.prompt_template}

**Lead Data:**
```json
{self._format_lead_data(lead_data)}
```

**Product/Service Information:**
```json
{self._format_product_info(product_info)}
```

**Outreach Channel:** {outreach_channel}

**User/Company Information:**
```json
{self._format_user_info(user_info)}
```

Please generate a personalized outreach message for this lead using the psychological principles and guidelines above."""

        return prompt
    
    def _generate_personalized_message(self, 
                                     lead_data: Dict[str, Any],
                                     product_info: Dict[str, Any],
                                     outreach_channel: str,
                                     user_info: Optional[Dict[str, Any]]) -> Dict[str, str]:
        """Generate a personalized message (template-based for now)."""
        
        # Extract key information
        lead_name = lead_data.get('name', 'there')
        lead_title = lead_data.get('title', '')
        company = lead_data.get('company', 'your company')
        industry = lead_data.get('company_industry', '')
        location = lead_data.get('location', '')
        
        user_name = user_info.get('name', '') if user_info else ''
        user_company = user_info.get('company', 'Guild-AI') if user_info else 'Guild-AI'
        user_title = user_info.get('title', '') if user_info else ''
        
        product_name = product_info.get('name', 'our solution')
        value_proposition = product_info.get('value_proposition', 'helping businesses grow')
        
        # Generate channel-specific message
        if outreach_channel == "email":
            return self._generate_email_message(
                lead_name, lead_title, company, industry, location,
                user_name, user_company, user_title, product_name, value_proposition
            )
        elif outreach_channel == "linkedin":
            return self._generate_linkedin_message(
                lead_name, lead_title, company, industry, location,
                user_name, user_company, user_title, product_name, value_proposition
            )
        elif outreach_channel == "cold_call":
            return self._generate_cold_call_script(
                lead_name, lead_title, company, industry, location,
                user_name, user_company, user_title, product_name, value_proposition
            )
        else:
            return self._generate_generic_message(
                lead_name, lead_title, company, industry, location,
                user_name, user_company, user_title, product_name, value_proposition
            )
    
    def _generate_email_message(self, lead_name, lead_title, company, industry, location,
                              user_name, user_company, user_title, product_name, value_proposition):
        """Generate a personalized email message."""
        
        # Create subject line
        subject = f"Quick question about {company} and {user_company}"
        
        # Create email body
        body = f"""Hi {lead_name},

I noticed your work as {lead_title} at {company} in the {industry} industry. It caught my attention because we've been helping similar companies in {location} achieve significant growth through automation and AI.

At {user_company}, we specialize in {value_proposition}. Specifically, for companies like {company}, we've helped:
• Reduce manual tasks by 60-80%
• Increase productivity and focus on strategic initiatives
• Scale operations without proportional headcount increases

I'd love to share a quick case study of how we helped [Similar Company] in your industry achieve [Specific Result].

Would you be open to a brief 15-minute conversation next week to explore how {user_company} could specifically benefit {company}?

Best regards,
{user_name}
{user_title}
{user_company}"""

        return {
            'subject': subject,
            'body': body,
            'format': 'email'
        }
    
    def _generate_linkedin_message(self, lead_name, lead_title, company, industry, location,
                                 user_name, user_company, user_title, product_name, value_proposition):
        """Generate a personalized LinkedIn message."""
        
        message = f"""Hi {lead_name},

I came across your profile and was impressed by your role as {lead_title} at {company}. 

I noticed you're in the {industry} space - we've been working with similar companies to help them {value_proposition}.

Would you be interested in a brief chat about how {user_company} could help {company} streamline operations and focus on growth?

Happy to share some relevant case studies.

Best,
{user_name}"""

        return {
            'message': message,
            'format': 'linkedin'
        }
    
    def _generate_cold_call_script(self, lead_name, lead_title, company, industry, location,
                                 user_name, user_company, user_title, product_name, value_proposition):
        """Generate a cold call script."""
        
        script = f"""**Cold Call Script for {lead_name} at {company}**

**Opening:**
"Hi {lead_name}, this is {user_name} from {user_company}. I hope I'm not catching you at a bad time. I'm calling because I noticed {company} is in the {industry} space, and we've been helping similar companies {value_proposition}.

**Value Proposition:**
"We recently helped [Similar Company] reduce their manual processes by 70% and increase their team's productivity significantly. I thought you might be interested in hearing how we did that.

**Question:**
"What's your biggest operational challenge right now at {company}?"

**If Interested:**
"I'd love to share a quick 15-minute case study with you. Would you have time for a brief call next week?"

**If Not Interested:**
"No problem at all. Would it be okay if I sent you a brief email with some information instead?"

**Close:**
"Great! I'll send you a calendar link for next week. Thanks for your time, {lead_name}." """

        return {
            'script': script,
            'format': 'cold_call'
        }
    
    def _generate_generic_message(self, lead_name, lead_title, company, industry, location,
                                user_name, user_company, user_title, product_name, value_proposition):
        """Generate a generic personalized message."""
        
        message = f"""Hi {lead_name},

I hope this message finds you well. I came across your profile and was impressed by your work as {lead_title} at {company}.

At {user_company}, we specialize in {value_proposition} for companies in the {industry} industry. We've helped similar organizations achieve significant improvements in efficiency and growth.

I'd love to share how we could potentially help {company} achieve similar results.

Would you be interested in a brief conversation about this?

Best regards,
{user_name}
{user_company}"""

        return {
            'message': message,
            'format': 'generic'
        }
    
    def _format_lead_data(self, lead_data: Dict[str, Any]) -> str:
        """Format lead data for the prompt."""
        import json
        return json.dumps(lead_data, indent=2)
    
    def _format_product_info(self, product_info: Dict[str, Any]) -> str:
        """Format product information for the prompt."""
        import json
        return json.dumps(product_info, indent=2)
    
    def _format_user_info(self, user_info: Optional[Dict[str, Any]]) -> str:
        """Format user information for the prompt."""
        import json
        if user_info:
            return json.dumps(user_info, indent=2)
        else:
            return json.dumps({
                "name": "Your Name",
                "company": "Your Company",
                "title": "Your Title"
            }, indent=2)
    
    def _calculate_personalization_score(self, lead_data: Dict[str, Any], message: Dict[str, str]) -> float:
        """Calculate how personalized the message is."""
        score = 0.0
        max_score = 10.0
        
        # Check for personal details usage
        if lead_data.get('name') and lead_data['name'] in str(message):
            score += 2.0
        
        if lead_data.get('company') and lead_data['company'] in str(message):
            score += 2.0
        
        if lead_data.get('title') and lead_data['title'] in str(message):
            score += 2.0
        
        if lead_data.get('company_industry') and lead_data['company_industry'] in str(message):
            score += 2.0
        
        if lead_data.get('location') and lead_data['location'] in str(message):
            score += 1.0
        
        # Check for psychological principles
        message_text = str(message).lower()
        if any(word in message_text for word in ['help', 'benefit', 'value']):
            score += 0.5
        
        if any(word in message_text for word in ['similar', 'case study', 'example']):
            score += 0.5
        
        return min(score / max_score, 1.0)
    
    def _identify_psychological_principles(self, lead_data: Dict[str, Any]) -> List[str]:
        """Identify which psychological principles are being used."""
        principles = []
        
        # This would be more sophisticated in a real implementation
        principles.extend([
            "Personalization",
            "Social Proof",
            "Value Proposition",
            "Authority",
            "Reciprocity"
        ])
        
        return principles
    
    def batch_personalize(self, 
                        leads: List[Dict[str, Any]],
                        product_info: Dict[str, Any],
                        outreach_channel: str = "email",
                        user_info: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """
        Personalize outreach messages for multiple leads.
        
        Args:
            leads: List of lead data
            product_info: Information about the product/service
            outreach_channel: Channel for outreach
            user_info: Information about the user/company
            
        Returns:
            List of personalized messages
        """
        results = []
        
        for lead in leads:
            try:
                result = self.personalize_outreach(
                    lead, product_info, outreach_channel, user_info
                )
                results.append(result)
            except Exception as e:
                logger.error(f"Error personalizing lead {lead.get('name', 'Unknown')}: {e}")
                results.append({
                    'status': 'error',
                    'error': str(e),
                    'lead_name': lead.get('name', 'Unknown')
                })
        
        return results

# Convenience function
def get_lead_personalization_agent() -> LeadPersonalizationAgent:
    """Get an instance of the Lead Personalization Agent."""
    return LeadPersonalizationAgent()
