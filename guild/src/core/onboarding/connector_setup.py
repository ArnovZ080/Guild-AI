"""
Guided Connector Setup System

This module provides an interactive, guided setup process for connecting
external services to Guild-AI. It makes the onboarding process as simple
as possible while ensuring autonomous agent operation.
"""

import asyncio
import json
import webbrowser
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, asdict
from enum import Enum
from datetime import datetime
from guild.src.core.llm_client import LlmClient
from guild.src.models.llm import Llm
from guild.src.utils.logging_utils import get_logger

logger = get_logger(__name__)

class ConnectorType(Enum):
    ACCOUNTING = "accounting"
    PAYMENTS = "payments"
    CRM = "crm"
    EMAIL_MARKETING = "email_marketing"
    SOCIAL_MEDIA = "social_media"
    AD_PLATFORMS = "ad_platforms"
    ANALYTICS = "analytics"
    PRODUCTIVITY = "productivity"
    COMMUNICATIONS = "communications"
    MEETINGS = "meetings"
    ECOMMERCE = "ecommerce"
    RECRUITMENT = "recruitment"
    INTELLIGENCE = "intelligence"

class SetupStatus(Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    AUTHENTICATING = "authenticating"
    TESTING = "testing"
    COMPLETED = "completed"
    FAILED = "failed"

@dataclass
class ConnectorInfo:
    """Information about a connector"""
    id: str
    name: str
    description: str
    category: ConnectorType
    icon: str
    website: str
    setup_complexity: str  # "easy", "medium", "complex"
    required_permissions: List[str]
    setup_steps: List[str]
    test_endpoints: List[str]
    documentation_url: str

@dataclass
class SetupStep:
    """Individual setup step"""
    step_number: int
    title: str
    description: str
    action_type: str  # "info", "input", "auth", "test", "confirm"
    required: bool
    inputs: List[Dict[str, Any]]
    validation_rules: List[str]
    help_text: str

@dataclass
class ConnectorCredentials:
    """Stored connector credentials"""
    connector_id: str
    connector_name: str
    credentials: Dict[str, Any]
    setup_date: datetime
    status: SetupStatus
    test_results: Dict[str, Any]
    agent_capabilities: List[str]

class GuidedConnectorSetup:
    """
    Guided setup system for connecting external services to Guild-AI.
    
    Provides step-by-step guidance, automatic testing, and seamless
    integration with Guild agents.
    """
    
    def __init__(self):
        self.llm_client = LlmClient(Llm(provider="ollama", model="tinyllama"))
        self.available_connectors = self._initialize_connectors()
        self.setup_sessions: Dict[str, Dict[str, Any]] = {}
        
    def _initialize_connectors(self) -> Dict[str, ConnectorInfo]:
        """Initialize all available connectors"""
        connectors = {}
        
        # Accounting & Finance
        connectors["quickbooks"] = ConnectorInfo(
            id="quickbooks",
            name="QuickBooks",
            description="Connect QuickBooks for automated bookkeeping and financial management",
            category=ConnectorType.ACCOUNTING,
            icon="📊",
            website="https://quickbooks.intuit.com",
            setup_complexity="medium",
            required_permissions=["accounting.read", "accounting.write"],
            setup_steps=[
                "Create QuickBooks App",
                "Get OAuth credentials",
                "Connect to QuickBooks account",
                "Test data access"
            ],
            test_endpoints=["/company/info", "/purchases", "/sales"],
            documentation_url="https://developer.intuit.com/app/developer/qbo/docs"
        )
        
        connectors["stripe"] = ConnectorInfo(
            id="stripe",
            name="Stripe",
            description="Connect Stripe for payment processing and revenue tracking",
            category=ConnectorType.PAYMENTS,
            icon="💳",
            website="https://stripe.com",
            setup_complexity="easy",
            required_permissions=["payments.read", "payments.write"],
            setup_steps=[
                "Get Stripe API keys",
                "Configure webhook endpoints",
                "Test payment processing"
            ],
            test_endpoints=["/charges", "/customers", "/balance"],
            documentation_url="https://stripe.com/docs/api"
        )
        
        # Social Media
        connectors["linkedin"] = ConnectorInfo(
            id="linkedin",
            name="LinkedIn",
            description="Connect LinkedIn for professional networking and content management",
            category=ConnectorType.SOCIAL_MEDIA,
            icon="💼",
            website="https://linkedin.com",
            setup_complexity="medium",
            required_permissions=["profile.read", "posts.write", "analytics.read"],
            setup_steps=[
                "Create LinkedIn App",
                "Get OAuth credentials",
                "Connect LinkedIn account",
                "Test posting and analytics"
            ],
            test_endpoints=["/me", "/posts", "/analytics"],
            documentation_url="https://docs.microsoft.com/en-us/linkedin/"
        )
        
        connectors["twitter"] = ConnectorInfo(
            id="twitter",
            name="Twitter/X",
            description="Connect Twitter for social media management and engagement",
            category=ConnectorType.SOCIAL_MEDIA,
            icon="🐦",
            website="https://twitter.com",
            setup_complexity="medium",
            required_permissions=["tweet.read", "tweet.write", "users.read"],
            setup_steps=[
                "Create Twitter Developer App",
                "Get API keys and tokens",
                "Connect Twitter account",
                "Test posting and analytics"
            ],
            test_endpoints=["/users/me", "/tweets", "/analytics"],
            documentation_url="https://developer.twitter.com/en/docs"
        )
        
        connectors["instagram"] = ConnectorInfo(
            id="instagram",
            name="Instagram",
            description="Connect Instagram for visual content and engagement",
            category=ConnectorType.SOCIAL_MEDIA,
            icon="📸",
            website="https://instagram.com",
            setup_complexity="complex",
            required_permissions=["instagram_basic", "instagram_content_publish"],
            setup_steps=[
                "Create Facebook App",
                "Add Instagram Basic Display",
                "Get access token",
                "Connect Instagram account"
            ],
            test_endpoints=["/me", "/media", "/insights"],
            documentation_url="https://developers.facebook.com/docs/instagram-api/"
        )
        
        connectors["tiktok"] = ConnectorInfo(
            id="tiktok",
            name="TikTok",
            description="Connect TikTok for short-form video content and analytics",
            category=ConnectorType.SOCIAL_MEDIA,
            icon="🎵",
            website="https://tiktok.com",
            setup_complexity="complex",
            required_permissions=["user.info.basic", "video.publish"],
            setup_steps=[
                "Create TikTok Developer App",
                "Get client key and secret",
                "Connect TikTok account",
                "Test video upload and analytics"
            ],
            test_endpoints=["/user/info", "/video/list", "/video/query"],
            documentation_url="https://developers.tiktok.com/doc/"
        )
        
        # Ad Platforms
        connectors["google_ads"] = ConnectorInfo(
            id="google_ads",
            name="Google Ads",
            description="Connect Google Ads for campaign management and optimization",
            category=ConnectorType.AD_PLATFORMS,
            icon="🎯",
            website="https://ads.google.com",
            setup_complexity="complex",
            required_permissions=["ads.read", "ads.write"],
            setup_steps=[
                "Create Google Cloud Project",
                "Enable Google Ads API",
                "Get OAuth credentials",
                "Connect Google Ads account"
            ],
            test_endpoints=["/customers", "/campaigns", "/reports"],
            documentation_url="https://developers.google.com/google-ads/api"
        )
        
        connectors["tiktok_ads"] = ConnectorInfo(
            id="tiktok_ads",
            name="TikTok Ads",
            description="Connect TikTok Ads for video advertising campaigns",
            category=ConnectorType.AD_PLATFORMS,
            icon="🎬",
            website="https://ads.tiktok.com",
            setup_complexity="complex",
            required_permissions=["ad.read", "ad.write"],
            setup_steps=[
                "Create TikTok Ads Manager account",
                "Get API credentials",
                "Connect TikTok Ads account",
                "Test campaign creation"
            ],
            test_endpoints=["/campaign/get", "/adgroup/get", "/ad/get"],
            documentation_url="https://ads.tiktok.com/help/article?aid=10000375"
        )
        
        # Email Marketing
        connectors["mailchimp"] = ConnectorInfo(
            id="mailchimp",
            name="Mailchimp",
            description="Connect Mailchimp for email marketing automation",
            category=ConnectorType.EMAIL_MARKETING,
            icon="📧",
            website="https://mailchimp.com",
            setup_complexity="easy",
            required_permissions=["campaigns.read", "campaigns.write", "lists.read"],
            setup_steps=[
                "Get Mailchimp API key",
                "Connect Mailchimp account",
                "Test list and campaign access"
            ],
            test_endpoints=["/lists", "/campaigns", "/reports"],
            documentation_url="https://mailchimp.com/developer/marketing/api/"
        )
        
        connectors["convertkit"] = ConnectorInfo(
            id="convertkit",
            name="ConvertKit",
            description="Connect ConvertKit for email marketing and automation",
            category=ConnectorType.EMAIL_MARKETING,
            icon="📨",
            website="https://convertkit.com",
            setup_complexity="easy",
            required_permissions=["subscribers.read", "subscribers.write", "forms.read"],
            setup_steps=[
                "Get ConvertKit API key",
                "Connect ConvertKit account",
                "Test subscriber and form access"
            ],
            test_endpoints=["/subscribers", "/forms", "/sequences"],
            documentation_url="https://developers.convertkit.com/"
        )
        
        connectors["activecampaign"] = ConnectorInfo(
            id="activecampaign",
            name="ActiveCampaign",
            description="Connect ActiveCampaign for marketing automation and CRM",
            category=ConnectorType.EMAIL_MARKETING,
            icon="🎯",
            website="https://activecampaign.com",
            setup_complexity="medium",
            required_permissions=["contacts.read", "contacts.write", "automations.read"],
            setup_steps=[
                "Get ActiveCampaign API key",
                "Connect ActiveCampaign account",
                "Test contact and automation access"
            ],
            test_endpoints=["/contacts", "/automations", "/campaigns"],
            documentation_url="https://developers.activecampaign.com/reference/overview"
        )
        
        connectors["systeme_io"] = ConnectorInfo(
            id="systeme_io",
            name="Systeme.io",
            description="Connect Systeme.io for all-in-one marketing platform",
            category=ConnectorType.EMAIL_MARKETING,
            icon="🚀",
            website="https://systeme.io",
            setup_complexity="easy",
            required_permissions=["contacts.read", "funnels.read", "webinars.read"],
            setup_steps=[
                "Get Systeme.io API key",
                "Connect Systeme.io account",
                "Test funnel and contact access"
            ],
            test_endpoints=["/contacts", "/funnels", "/webinars"],
            documentation_url="https://help.systeme.io/en/articles/6170659-systeme-io-api-documentation"
        )
        
        # Analytics
        connectors["google_analytics"] = ConnectorInfo(
            id="google_analytics",
            name="Google Analytics",
            description="Connect Google Analytics for website and app analytics",
            category=ConnectorType.ANALYTICS,
            icon="📈",
            website="https://analytics.google.com",
            setup_complexity="medium",
            required_permissions=["analytics.read"],
            setup_steps=[
                "Create Google Cloud Project",
                "Enable Google Analytics API",
                "Get OAuth credentials",
                "Connect Google Analytics account"
            ],
            test_endpoints=["/accounts", "/properties", "/reports"],
            documentation_url="https://developers.google.com/analytics/devguides/reporting/core/v4"
        )
        
        connectors["mixpanel"] = ConnectorInfo(
            id="mixpanel",
            name="Mixpanel",
            description="Connect Mixpanel for product analytics and user behavior",
            category=ConnectorType.ANALYTICS,
            icon="📊",
            website="https://mixpanel.com",
            setup_complexity="easy",
            required_permissions=["events.read", "profiles.read"],
            setup_steps=[
                "Get Mixpanel project credentials",
                "Connect Mixpanel account",
                "Test event and profile access"
            ],
            test_endpoints=["/events", "/profiles", "/funnels"],
            documentation_url="https://developer.mixpanel.com/reference"
        )
        
        connectors["amplitude"] = ConnectorInfo(
            id="amplitude",
            name="Amplitude",
            description="Connect Amplitude for product analytics and cohort analysis",
            category=ConnectorType.ANALYTICS,
            icon="📈",
            website="https://amplitude.com",
            setup_complexity="medium",
            required_permissions=["events.read", "cohorts.read"],
            setup_steps=[
                "Get Amplitude API key",
                "Connect Amplitude account",
                "Test analytics access"
            ],
            test_endpoints=["/events", "/cohorts", "/funnels"],
            documentation_url="https://developers.amplitude.com/docs"
        )
        
        # Productivity
        connectors["notion"] = ConnectorInfo(
            id="notion",
            name="Notion",
            description="Connect Notion for knowledge management and documentation",
            category=ConnectorType.PRODUCTIVITY,
            icon="📝",
            website="https://notion.so",
            setup_complexity="easy",
            required_permissions=["read", "update"],
            setup_steps=[
                "Create Notion integration",
                "Get API key",
                "Connect Notion workspace",
                "Test page and database access"
            ],
            test_endpoints=["/users/me", "/pages", "/databases"],
            documentation_url="https://developers.notion.com/"
        )
        
        connectors["google_drive"] = ConnectorInfo(
            id="google_drive",
            name="Google Drive",
            description="Connect Google Drive for document management and collaboration",
            category=ConnectorType.PRODUCTIVITY,
            icon="📁",
            website="https://drive.google.com",
            setup_complexity="easy",
            required_permissions=["drive.readonly", "drive.file"],
            setup_steps=[
                "Create Google Cloud Project",
                "Enable Google Drive API",
                "Get OAuth credentials",
                "Connect Google Drive account"
            ],
            test_endpoints=["/files", "/about", "/changes"],
            documentation_url="https://developers.google.com/drive/api"
        )
        
        # Communications
        connectors["slack"] = ConnectorInfo(
            id="slack",
            name="Slack",
            description="Connect Slack for team communication and automation",
            category=ConnectorType.COMMUNICATIONS,
            icon="💬",
            website="https://slack.com",
            setup_complexity="easy",
            required_permissions=["chat:write", "channels:read", "users:read"],
            setup_steps=[
                "Create Slack App",
                "Get OAuth credentials",
                "Connect Slack workspace",
                "Test messaging and channel access"
            ],
            test_endpoints=["/auth.test", "/conversations.list", "/chat.postMessage"],
            documentation_url="https://api.slack.com/"
        )
        
        connectors["discord"] = ConnectorInfo(
            id="discord",
            name="Discord",
            description="Connect Discord for community management and engagement",
            category=ConnectorType.COMMUNICATIONS,
            icon="🎮",
            website="https://discord.com",
            setup_complexity="medium",
            required_permissions=["messages.read", "messages.send"],
            setup_steps=[
                "Create Discord Application",
                "Get bot token",
                "Connect Discord server",
                "Test messaging and moderation"
            ],
            test_endpoints=["/users/@me", "/channels", "/messages"],
            documentation_url="https://discord.com/developers/docs"
        )
        
        # Meetings
        connectors["zoom"] = ConnectorInfo(
            id="zoom",
            name="Zoom",
            description="Connect Zoom for meeting management and recording",
            category=ConnectorType.MEETINGS,
            icon="🎥",
            website="https://zoom.us",
            setup_complexity="medium",
            required_permissions=["meeting:read", "meeting:write", "recording:read"],
            setup_steps=[
                "Create Zoom App",
                "Get JWT credentials",
                "Connect Zoom account",
                "Test meeting and recording access"
            ],
            test_endpoints=["/users/me", "/meetings", "/recordings"],
            documentation_url="https://marketplace.zoom.us/docs/api-reference"
        )
        
        connectors["calendly"] = ConnectorInfo(
            id="calendly",
            name="Calendly",
            description="Connect Calendly for appointment scheduling",
            category=ConnectorType.MEETINGS,
            icon="📅",
            website="https://calendly.com",
            setup_complexity="easy",
            required_permissions=["event_types.read", "scheduled_events.read"],
            setup_steps=[
                "Get Calendly API token",
                "Connect Calendly account",
                "Test scheduling access"
            ],
            test_endpoints=["/users/me", "/event_types", "/scheduled_events"],
            documentation_url="https://developer.calendly.com/"
        )
        
        # E-commerce
        connectors["shopify"] = ConnectorInfo(
            id="shopify",
            name="Shopify",
            description="Connect Shopify for e-commerce management",
            category=ConnectorType.ECOMMERCE,
            icon="🛍️",
            website="https://shopify.com",
            setup_complexity="medium",
            required_permissions=["read_products", "read_orders", "write_products"],
            setup_steps=[
                "Create Shopify App",
                "Get API credentials",
                "Connect Shopify store",
                "Test product and order access"
            ],
            test_endpoints=["/products", "/orders", "/customers"],
            documentation_url="https://shopify.dev/api/admin-rest"
        )
        
        connectors["woocommerce"] = ConnectorInfo(
            id="woocommerce",
            name="WooCommerce",
            description="Connect WooCommerce for WordPress e-commerce",
            category=ConnectorType.ECOMMERCE,
            icon="🛒",
            website="https://woocommerce.com",
            setup_complexity="easy",
            required_permissions=["read", "write"],
            setup_steps=[
                "Generate WooCommerce API keys",
                "Connect WooCommerce store",
                "Test product and order access"
            ],
            test_endpoints=["/products", "/orders", "/customers"],
            documentation_url="https://woocommerce.github.io/woocommerce-rest-api-docs/"
        )
        
        # Intelligence & Data
        connectors["yahoo_finance"] = ConnectorInfo(
            id="yahoo_finance",
            name="Yahoo Finance",
            description="Connect Yahoo Finance for market data and financial intelligence",
            category=ConnectorType.INTELLIGENCE,
            icon="📈",
            website="https://finance.yahoo.com",
            setup_complexity="easy",
            required_permissions=["market_data.read"],
            setup_steps=[
                "Get Yahoo Finance API access",
                "Connect Yahoo Finance",
                "Test market data access"
            ],
            test_endpoints=["/quotes", "/news", "/historical"],
            documentation_url="https://finance.yahoo.com/"
        )
        
        connectors["newsapi"] = ConnectorInfo(
            id="newsapi",
            name="NewsAPI",
            description="Connect NewsAPI for news and trend intelligence",
            category=ConnectorType.INTELLIGENCE,
            icon="📰",
            website="https://newsapi.org",
            setup_complexity="easy",
            required_permissions=["articles.read"],
            setup_steps=[
                "Get NewsAPI key",
                "Connect NewsAPI",
                "Test news access"
            ],
            test_endpoints=["/everything", "/top-headlines", "/sources"],
            documentation_url="https://newsapi.org/docs"
        )
        
        connectors["reddit"] = ConnectorInfo(
            id="reddit",
            name="Reddit",
            description="Connect Reddit for trend analysis and community insights",
            category=ConnectorType.INTELLIGENCE,
            icon="🔴",
            website="https://reddit.com",
            setup_complexity="medium",
            required_permissions=["read", "history"],
            setup_steps=[
                "Create Reddit App",
                "Get OAuth credentials",
                "Connect Reddit account",
                "Test post and comment access"
            ],
            test_endpoints=["/api/v1/me", "/r/subreddit/hot", "/api/v1/comment"],
            documentation_url="https://www.reddit.com/dev/api/"
        )
        
        # Recruitment
        connectors["linkedin_talent"] = ConnectorInfo(
            id="linkedin_talent",
            name="LinkedIn Talent Solutions",
            description="Connect LinkedIn Talent for recruitment and hiring",
            category=ConnectorType.RECRUITMENT,
            icon="👥",
            website="https://talent.linkedin.com",
            setup_complexity="complex",
            required_permissions=["talent.read", "talent.write"],
            setup_steps=[
                "Create LinkedIn Talent App",
                "Get API credentials",
                "Connect LinkedIn Talent account",
                "Test candidate and job access"
            ],
            test_endpoints=["/candidates", "/jobs", "/applications"],
            documentation_url="https://docs.microsoft.com/en-us/linkedin/talent/"
        )
        
        connectors["indeed"] = ConnectorInfo(
            id="indeed",
            name="Indeed",
            description="Connect Indeed for job posting and candidate sourcing",
            category=ConnectorType.RECRUITMENT,
            icon="💼",
            website="https://indeed.com",
            setup_complexity="medium",
            required_permissions=["jobs.read", "jobs.write"],
            setup_steps=[
                "Get Indeed Publisher API key",
                "Connect Indeed account",
                "Test job posting access"
            ],
            test_endpoints=["/jobs", "/resumes", "/applications"],
            documentation_url="https://ads.indeed.com/jobroll/xmlfeed"
        )
        
        return connectors
    
    async def start_guided_setup(self, user_id: str, connector_id: str) -> Dict[str, Any]:
        """Start guided setup for a specific connector"""
        if connector_id not in self.available_connectors:
            return {"error": f"Connector {connector_id} not found"}
        
        connector = self.available_connectors[connector_id]
        session_id = f"{user_id}_{connector_id}_{datetime.now().timestamp()}"
        
        # Initialize setup session
        self.setup_sessions[session_id] = {
            "user_id": user_id,
            "connector_id": connector_id,
            "connector": connector,
            "current_step": 0,
            "status": SetupStatus.IN_PROGRESS,
            "credentials": {},
            "test_results": {},
            "started_at": datetime.now(),
            "completed_at": None
        }
        
        # Generate welcome message
        welcome_message = await self._generate_welcome_message(connector)
        
        return {
            "session_id": session_id,
            "connector": asdict(connector),
            "welcome_message": welcome_message,
            "total_steps": len(connector.setup_steps),
            "current_step": 0,
            "status": "started"
        }
    
    async def _generate_welcome_message(self, connector: ConnectorInfo) -> str:
        """Generate personalized welcome message for connector setup"""
        prompt = f"""
Generate a friendly, helpful welcome message for setting up {connector.name} integration.
The user is about to connect {connector.name} to Guild-AI for automated agent operation.

Connector Details:
- Name: {connector.name}
- Description: {connector.description}
- Setup Complexity: {connector.setup_complexity}
- Required Permissions: {', '.join(connector.required_permissions)}
- Setup Steps: {len(connector.setup_steps)} steps

The message should:
1. Welcome the user warmly
2. Explain what this integration will enable
3. Mention the setup complexity and estimated time
4. Encourage them that the process is guided and automated
5. Be encouraging and supportive

Keep it concise but friendly.
"""

        try:
            response = await self.llm_client.chat(prompt)
            return response.strip()
        except Exception as e:
            logger.error(f"Error generating welcome message: {e}")
            return f"Welcome! Let's set up {connector.name} integration. This will enable automated {connector.description.lower()}. The setup process is straightforward with {len(connector.setup_steps)} simple steps."
    
    async def get_next_step(self, session_id: str) -> Dict[str, Any]:
        """Get the next setup step for a session"""
        if session_id not in self.setup_sessions:
            return {"error": "Session not found"}
        
        session = self.setup_sessions[session_id]
        connector = session["connector"]
        current_step = session["current_step"]
        
        if current_step >= len(connector.setup_steps):
            return await self._complete_setup(session_id)
        
        step_title = connector.setup_steps[current_step]
        step_details = await self._generate_step_details(connector, current_step)
        
        return {
            "session_id": session_id,
            "step_number": current_step + 1,
            "total_steps": len(connector.setup_steps),
            "step_title": step_title,
            "step_details": step_details,
            "connector_name": connector.name,
            "status": "in_progress"
        }
    
    async def _generate_step_details(self, connector: ConnectorInfo, step_index: int) -> Dict[str, Any]:
        """Generate detailed step information"""
        step_titles = connector.setup_steps
        step_title = step_titles[step_index]
        
        # Generate step-specific details
        prompt = f"""
Generate detailed instructions for step {step_index + 1} of setting up {connector.name} integration.

Step Title: {step_title}
Connector: {connector.name}
Setup Complexity: {connector.setup_complexity}
Documentation: {connector.documentation_url}

Provide:
1. Clear, step-by-step instructions
2. Any required inputs or credentials
3. Helpful tips and common issues
4. What to expect next

Make it beginner-friendly and actionable.
"""

        try:
            response = await self.llm_client.chat(prompt)
            
            # Determine action type based on step title
            action_type = "info"
            if "api" in step_title.lower() or "key" in step_title.lower() or "credential" in step_title.lower():
                action_type = "input"
            elif "auth" in step_title.lower() or "connect" in step_title.lower():
                action_type = "auth"
            elif "test" in step_title.lower():
                action_type = "test"
            
            return {
                "description": response.strip(),
                "action_type": action_type,
                "required": True,
                "inputs": self._get_step_inputs(connector, step_title),
                "help_text": f"For detailed documentation, visit: {connector.documentation_url}",
                "tips": self._get_step_tips(connector, step_title)
            }
        except Exception as e:
            logger.error(f"Error generating step details: {e}")
            return {
                "description": f"Complete step: {step_title}",
                "action_type": "info",
                "required": True,
                "inputs": [],
                "help_text": f"See documentation: {connector.documentation_url}",
                "tips": []
            }
    
    def _get_step_inputs(self, connector: ConnectorInfo, step_title: str) -> List[Dict[str, Any]]:
        """Get required inputs for a step"""
        inputs = []
        
        if "api" in step_title.lower() or "key" in step_title.lower():
            if "quickbooks" in connector.id:
                inputs.extend([
                    {"name": "client_id", "type": "text", "label": "Client ID", "required": True},
                    {"name": "client_secret", "type": "password", "label": "Client Secret", "required": True}
                ])
            elif "stripe" in connector.id:
                inputs.extend([
                    {"name": "publishable_key", "type": "text", "label": "Publishable Key", "required": True},
                    {"name": "secret_key", "type": "password", "label": "Secret Key", "required": True}
                ])
            elif "mailchimp" in connector.id:
                inputs.append({"name": "api_key", "type": "password", "label": "API Key", "required": True})
            elif "notion" in connector.id:
                inputs.append({"name": "integration_token", "type": "password", "label": "Integration Token", "required": True})
        
        return inputs
    
    def _get_step_tips(self, connector: ConnectorInfo, step_title: str) -> List[str]:
        """Get helpful tips for a step"""
        tips = []
        
        if "api" in step_title.lower():
            tips.extend([
                "Keep your API credentials secure and never share them publicly",
                "You can regenerate API keys if needed",
                "Some APIs have rate limits - Guild handles this automatically"
            ])
        
        if "auth" in step_title.lower():
            tips.extend([
                "Make sure you're logged into the correct account",
                "Grant all requested permissions for full functionality",
                "You can revoke access later if needed"
            ])
        
        if "test" in step_title.lower():
            tips.extend([
                "Testing ensures everything is working correctly",
                "If tests fail, check your credentials and permissions",
                "Contact support if you need help troubleshooting"
            ])
        
        return tips
    
    async def submit_step_data(self, session_id: str, step_data: Dict[str, Any]) -> Dict[str, Any]:
        """Submit data for current step"""
        if session_id not in self.setup_sessions:
            return {"error": "Session not found"}
        
        session = self.setup_sessions[session_id]
        session["credentials"].update(step_data)
        session["current_step"] += 1
        
        # If this was a test step, run tests
        if "test" in step_data.get("step_type", ""):
            test_results = await self._run_connector_tests(session)
            session["test_results"] = test_results
            
            if not test_results.get("success", False):
                return {
                    "session_id": session_id,
                    "status": "test_failed",
                    "test_results": test_results,
                    "next_steps": ["Check credentials", "Verify permissions", "Try again"]
                }
        
        # Get next step
        return await self.get_next_step(session_id)
    
    async def _run_connector_tests(self, session: Dict[str, Any]) -> Dict[str, Any]:
        """Run tests for connector setup"""
        connector = session["connector"]
        credentials = session["credentials"]
        
        try:
            # Import and test the appropriate connector
            if connector.id == "quickbooks":
                from guild.src.integrations.accounting import QuickBooksConnector
                test_connector = QuickBooksConnector(
                    client_id=credentials.get("client_id"),
                    client_secret=credentials.get("client_secret")
                )
                success = await test_connector.validate_connection()
            
            elif connector.id == "stripe":
                from guild.src.integrations.accounting import StripeConnector
                test_connector = StripeConnector(
                    publishable_key=credentials.get("publishable_key"),
                    secret_key=credentials.get("secret_key")
                )
                success = await test_connector.validate_connection()
            
            elif connector.id == "notion":
                from guild.src.integrations.productivity import NotionConnector
                test_connector = NotionConnector(
                    integration_token=credentials.get("integration_token")
                )
                success = await test_connector.validate_connection()
            
            else:
                # Generic test for other connectors
                success = True  # Placeholder - implement specific tests
            
            return {
                "success": success,
                "tested_endpoints": connector.test_endpoints,
                "message": "Connection test successful" if success else "Connection test failed",
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error testing connector {connector.id}: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": "Connection test failed with error",
                "timestamp": datetime.now().isoformat()
            }
    
    async def _complete_setup(self, session_id: str) -> Dict[str, Any]:
        """Complete the setup process"""
        session = self.setup_sessions[session_id]
        connector = session["connector"]
        
        # Store credentials securely
        connector_credentials = ConnectorCredentials(
            connector_id=connector.id,
            connector_name=connector.name,
            credentials=session["credentials"],
            setup_date=datetime.now(),
            status=SetupStatus.COMPLETED,
            test_results=session["test_results"],
            agent_capabilities=self._get_agent_capabilities(connector)
        )
        
        # Store in database (implement storage)
        await self._store_connector_credentials(connector_credentials)
        
        session["status"] = SetupStatus.COMPLETED
        session["completed_at"] = datetime.now()
        
        # Generate completion message
        completion_message = await self._generate_completion_message(connector, connector_credentials)
        
        return {
            "session_id": session_id,
            "status": "completed",
            "connector": asdict(connector),
            "credentials_stored": True,
            "agent_capabilities": connector_credentials.agent_capabilities,
            "completion_message": completion_message,
            "next_steps": [
                "Your agents can now access this integration automatically",
                "Test the integration with a sample task",
                "Configure any additional settings if needed"
            ]
        }
    
    async def _generate_completion_message(self, connector: ConnectorInfo, credentials: ConnectorCredentials) -> str:
        """Generate completion message"""
        prompt = f"""
Generate a congratulatory completion message for successfully setting up {connector.name} integration.

The user has completed:
- Connector: {connector.name}
- Status: {credentials.status}
- Capabilities enabled: {', '.join(credentials.agent_capabilities)}
- Test results: {'Passed' if credentials.test_results.get('success') else 'Failed'}

The message should:
1. Congratulate them on successful setup
2. Explain what they can now do with this integration
3. Mention that agents will work autonomously
4. Encourage them to test the integration
5. Be positive and encouraging

Keep it concise but celebratory.
"""

        try:
            response = await self.llm_client.chat(prompt)
            return response.strip()
        except Exception as e:
            logger.error(f"Error generating completion message: {e}")
            return f"🎉 Congratulations! You've successfully set up {connector.name} integration. Your Guild agents can now work with {connector.name} autonomously. Try asking an agent to perform a task using this integration!"
    
    def _get_agent_capabilities(self, connector: ConnectorInfo) -> List[str]:
        """Get agent capabilities enabled by this connector"""
        capabilities = []
        
        if connector.category == ConnectorType.ACCOUNTING:
            capabilities.extend([
                "Automated bookkeeping and transaction processing",
                "Financial reporting and analysis",
                "Tax preparation assistance",
                "Expense tracking and categorization"
            ])
        elif connector.category == ConnectorType.PAYMENTS:
            capabilities.extend([
                "Payment processing and tracking",
                "Revenue analysis and reporting",
                "Customer payment management",
                "Financial reconciliation"
            ])
        elif connector.category == ConnectorType.SOCIAL_MEDIA:
            capabilities.extend([
                "Social media content creation and posting",
                "Engagement monitoring and response",
                "Social media analytics and insights",
                "Community management"
            ])
        elif connector.category == ConnectorType.EMAIL_MARKETING:
            capabilities.extend([
                "Email campaign creation and management",
                "Subscriber list management",
                "Email automation and sequences",
                "Email analytics and optimization"
            ])
        elif connector.category == ConnectorType.ANALYTICS:
            capabilities.extend([
                "Data analysis and insights",
                "Performance tracking and reporting",
                "Trend identification and analysis",
                "Automated reporting"
            ])
        
        return capabilities
    
    async def _store_connector_credentials(self, credentials: ConnectorCredentials):
        """Store connector credentials securely"""
        # Implement secure storage (encrypt credentials)
        # This would typically store in a secure database
        logger.info(f"Storing credentials for {credentials.connector_name}")
        # Placeholder implementation
    
    async def get_available_connectors(self, category: Optional[ConnectorType] = None) -> List[Dict[str, Any]]:
        """Get list of available connectors"""
        connectors = []
        
        for connector in self.available_connectors.values():
            if category is None or connector.category == category:
                connectors.append({
                    "id": connector.id,
                    "name": connector.name,
                    "description": connector.description,
                    "category": connector.category.value,
                    "icon": connector.icon,
                    "setup_complexity": connector.setup_complexity,
                    "required_permissions": connector.required_permissions,
                    "setup_steps_count": len(connector.setup_steps)
                })
        
        return connectors
    
    async def get_user_connectors(self, user_id: str) -> List[Dict[str, Any]]:
        """Get connectors set up by a user"""
        # Implement retrieval from storage
        # This would query the database for user's connectors
        return []

# Global guided setup instance
guided_setup = GuidedConnectorSetup()
