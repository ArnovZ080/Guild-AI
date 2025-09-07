"""
PR/Outreach Agent for Guild-AI
Writes press releases, finds journalists/bloggers, pitches podcast guest spots, and builds backlinks.
"""

from typing import Dict, List, Any
from dataclasses import dataclass
from datetime import datetime


@dataclass
class PressRelease:
    title: str
    content: str
    target_audience: str
    distribution_channels: List[str]
    key_messages: List[str]
    media_kit: Dict[str, Any]


class PROutreachAgent:
    """
    PR/Outreach Agent - Expert in public relations and media outreach.
    
    You are the PR/Outreach Agent, a skilled public relations specialist who manages 
    external communications, builds media relationships, and creates compelling narratives 
    that enhance brand visibility and credibility. You write press releases, identify 
    relevant journalists and bloggers, pitch podcast guest spots, and build strategic 
    backlinks to strengthen the brand's online presence.
    
    Core Directives:
    1. Press Release Creation: Write compelling, newsworthy press releases that capture 
       attention and communicate key messages effectively to target audiences.
    2. Media Contact Identification: Research and maintain databases of relevant journalists, 
       bloggers, podcasters, and influencers in the industry.
    3. Pitch Development: Create personalized, value-driven pitches that demonstrate 
       understanding of the media contact's audience and interests.
    4. Relationship Building: Foster long-term relationships with media contacts through 
       consistent, valuable communication and mutual respect.
    5. Backlink Strategy: Develop and execute strategies for earning high-quality backlinks 
       that improve SEO and domain authority.
    
    Constraints and Guardrails:
    - Maintain journalistic integrity and avoid misleading or exaggerated claims
    - Respect media contacts' time and preferences for communication
    - Ensure all content is accurate, fact-checked, and properly attributed
    - Follow up professionally without being pushy or spammy
    - Focus on providing genuine value to media contacts and their audiences
    """
    
    def __init__(self):
        self.agent_name = "PR/Outreach Agent"
        self.agent_type = "Marketing"
        self.capabilities = [
            "Press release writing and distribution",
            "Media contact identification and management",
            "Pitch development and outreach",
            "Backlink strategy and execution",
            "Crisis communication management"
        ]
        self.media_contacts = {}
        self.campaign_tracking = {}
    
    def get_agent_info(self) -> Dict[str, Any]:
        """Return comprehensive agent information."""
        return {
            "name": self.agent_name,
            "type": self.agent_type,
            "capabilities": self.capabilities,
            "status": "active",
            "last_updated": datetime.now().isoformat()
        }
    
    def create_press_release(self, 
                           news_item: str,
                           company_info: Dict[str, Any],
                           target_audience: str = "general") -> PressRelease:
        """Create a comprehensive professional press release"""
        
        title = self._generate_title(news_item, company_info)
        content = self._write_content(news_item, company_info)
        distribution_channels = self._select_channels(target_audience)
        key_messages = self._extract_key_messages(news_item, company_info)
        media_kit = self._create_media_kit(company_info)
        
        return PressRelease(
            title=title,
            content=content,
            target_audience=target_audience,
            distribution_channels=distribution_channels,
            key_messages=key_messages,
            media_kit=media_kit
        )
    
    def _generate_title(self, news_item: str, company_info: Dict[str, Any]) -> str:
        """Generate compelling press release title"""
        company_name = company_info.get("name", "Company")
        
        if "launch" in news_item.lower():
            return f"{company_name} Launches New Initiative"
        elif "partnership" in news_item.lower():
            return f"{company_name} Forms Strategic Partnership"
        else:
            return f"{company_name} Makes Major Announcement"
    
    def _write_content(self, news_item: str, company_info: Dict[str, Any]) -> str:
        """Write professional press release content"""
        company_name = company_info.get("name", "Company")
        
        content = f"""
FOR IMMEDIATE RELEASE

{self._generate_title(news_item, company_info)}

{company_name} today announced {news_item.lower()}.

This development represents a significant milestone for {company_name} and demonstrates our commitment to innovation and growth.

"We are excited about this opportunity to expand our capabilities and better serve our customers," said a company spokesperson.

About {company_name}:
{company_info.get('description', 'A leading company focused on innovation and customer success.')}

For more information, please contact:
{company_info.get('contact_email', 'media@company.com')}

###
"""
        return content.strip()
    
    def _select_channels(self, target_audience: str) -> List[str]:
        """Select appropriate distribution channels"""
        channels = ["Company Website", "Social Media"]
        
        if target_audience == "tech":
            channels.extend(["TechCrunch", "VentureBeat"])
        elif target_audience == "business":
            channels.extend(["Business Wire", "PR Newswire"])
        else:
            channels.extend(["PR Newswire", "Local Media"])
        
        return channels
    
    def create_pitch_email(self, contact_name: str, story_angle: str) -> str:
        """Create personalized pitch email"""
        
        subject = f"Story Idea: {story_angle}"
        
        email_body = f"""
Hi {contact_name},

I hope this email finds you well. I have a story idea that I believe would be perfect for your coverage.

{story_angle}

I'd love to discuss this story with you and provide any additional information you might need. Would you be interested in a brief call this week?

Best regards,
PR Team
"""
        
        return f"Subject: {subject}\n\n{email_body}"
    
    def _extract_key_messages(self, news_item: str, company_info: Dict[str, Any]) -> List[str]:
        """Extract key messages from the news item."""
        key_messages = []
        
        if "launch" in news_item.lower():
            key_messages.extend([
                "Innovation and market leadership",
                "Customer value and benefits",
                "Future growth and expansion plans"
            ])
        elif "partnership" in news_item.lower():
            key_messages.extend([
                "Strategic collaboration benefits",
                "Market expansion opportunities",
                "Enhanced customer offerings"
            ])
        elif "funding" in news_item.lower():
            key_messages.extend([
                "Growth and expansion plans",
                "Market validation and confidence",
                "Future product development"
            ])
        else:
            key_messages.extend([
                "Company milestone achievement",
                "Market impact and significance",
                "Future strategic direction"
            ])
        
        return key_messages
    
    def _create_media_kit(self, company_info: Dict[str, Any]) -> Dict[str, Any]:
        """Create comprehensive media kit for press release."""
        return {
            "company_logo": company_info.get("logo_url", ""),
            "executive_photos": company_info.get("executive_photos", []),
            "product_images": company_info.get("product_images", []),
            "company_fact_sheet": {
                "founded": company_info.get("founded", ""),
                "headquarters": company_info.get("headquarters", ""),
                "employees": company_info.get("employee_count", ""),
                "revenue": company_info.get("revenue", ""),
                "key_products": company_info.get("key_products", [])
            },
            "contact_information": {
                "media_contact": company_info.get("media_contact", ""),
                "email": company_info.get("contact_email", ""),
                "phone": company_info.get("contact_phone", ""),
                "website": company_info.get("website", "")
            }
        }
    
    def identify_media_contacts(self, industry: str, story_angle: str) -> List[Dict[str, Any]]:
        """Identify relevant media contacts for a specific story."""
        contacts = []
        
        # Simulate media contact identification
        if industry == "tech":
            contacts.extend([
                {
                    "name": "Tech Journalist",
                    "outlet": "TechCrunch",
                    "email": "tech@techcrunch.com",
                    "beat": "startups",
                    "recent_articles": ["AI startups", "SaaS platforms"]
                },
                {
                    "name": "Business Reporter",
                    "outlet": "VentureBeat",
                    "email": "business@venturebeat.com",
                    "beat": "enterprise tech",
                    "recent_articles": ["B2B software", "Digital transformation"]
                }
            ])
        elif industry == "business":
            contacts.extend([
                {
                    "name": "Business Editor",
                    "outlet": "Forbes",
                    "email": "business@forbes.com",
                    "beat": "entrepreneurship",
                    "recent_articles": ["Small business", "Innovation"]
                }
            ])
        
        return contacts
    
    def create_podcast_pitch(self, podcast_info: Dict[str, Any], expertise_areas: List[str]) -> str:
        """Create personalized podcast guest pitch."""
        podcast_name = podcast_info.get("name", "the podcast")
        host_name = podcast_info.get("host", "the host")
        audience = podcast_info.get("audience", "entrepreneurs")
        
        pitch = f"""
Subject: Guest Expert Available for {podcast_name}

Hi {host_name},

I hope this email finds you well. I've been following {podcast_name} and really appreciate the valuable content you provide for {audience}.

I'd love to contribute to your show as a guest expert. Here's what I can offer your audience:

• Deep expertise in: {', '.join(expertise_areas[:3])}
• Practical insights and actionable strategies
• Real-world case studies and examples
• Engaging storytelling that resonates with {audience}

I'm particularly excited about discussing topics that align with your recent episodes on [specific topic from their recent content].

Would you be interested in having me on the show? I'm flexible with timing and happy to provide any additional information you might need.

Best regards,
[Your name]
"""
        return pitch.strip()
    
    def get_agent_capabilities(self) -> List[str]:
        """Return detailed list of agent capabilities."""
        return [
            "Press release writing and professional distribution",
            "Media contact identification and relationship building",
            "Personalized pitch development for journalists and bloggers",
            "Podcast guest pitching and media kit creation",
            "Backlink strategy development and execution",
            "Crisis communication management and response",
            "Media monitoring and coverage analysis",
            "Brand messaging and narrative development"
        ]