"""
Integration Capability Registry for Guild-AI
Maps all external platform integrations with their capabilities and connection status.
"""

from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
from enum import Enum


class IntegrationCategory(Enum):
    """Integration category types"""
    ACCOUNTING = "accounting"
    PAYMENT = "payment"
    SOCIAL_MEDIA = "social_media"
    ADVERTISING = "advertising"
    EMAIL_MARKETING = "email_marketing"
    ANALYTICS = "analytics"
    SEO = "seo"
    PRODUCTIVITY = "productivity"
    COMMUNICATION = "communication"
    MEETING = "meeting"
    ECOMMERCE = "ecommerce"
    RECRUITMENT = "recruitment"
    INTELLIGENCE = "intelligence"
    CRM = "crm"
    PROJECT_MANAGEMENT = "project_management"


@dataclass
class IntegrationCapability:
    """Integration capability definition"""
    integration_id: str
    integration_name: str
    category: IntegrationCategory
    capabilities: List[str]
    data_provides: List[str]  # What data this integration provides
    actions_available: List[str]  # What actions can be performed
    required_credentials: List[str]
    api_documentation: str = ""
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return asdict(self)


# Comprehensive Integration Capability Registry
INTEGRATION_CAPABILITIES = {
    # Accounting & Finance
    "quickbooks": IntegrationCapability(
        integration_id="quickbooks",
        integration_name="QuickBooks",
        category=IntegrationCategory.ACCOUNTING,
        capabilities=["transaction_sync", "financial_reporting", "expense_tracking", "invoice_management"],
        data_provides=["transactions", "invoices", "expenses", "revenue", "accounts"],
        actions_available=["create_invoice", "record_expense", "generate_report", "reconcile_account"],
        required_credentials=["client_id", "client_secret", "redirect_uri"],
        api_documentation="https://developer.intuit.com/app/developer/qbo/docs/api"
    ),
    
    "xero": IntegrationCapability(
        integration_id="xero",
        integration_name="Xero",
        category=IntegrationCategory.ACCOUNTING,
        capabilities=["accounting_sync", "bank_reconciliation", "financial_reports", "tax_management"],
        data_provides=["bank_transactions", "invoices", "bills", "contacts", "accounts"],
        actions_available=["create_invoice", "record_payment", "reconcile_bank", "generate_report"],
        required_credentials=["client_id", "client_secret"],
        api_documentation="https://developer.xero.com/documentation/"
    ),
    
    "stripe": IntegrationCapability(
        integration_id="stripe",
        integration_name="Stripe",
        category=IntegrationCategory.PAYMENT,
        capabilities=["payment_processing", "subscription_management", "revenue_tracking", "refund_processing"],
        data_provides=["payments", "customers", "subscriptions", "invoices", "revenue_data"],
        actions_available=["process_payment", "create_subscription", "issue_refund", "generate_invoice"],
        required_credentials=["publishable_key", "secret_key"],
        api_documentation="https://stripe.com/docs/api"
    ),
    
    # Social Media Platforms
    "linkedin": IntegrationCapability(
        integration_id="linkedin",
        integration_name="LinkedIn",
        category=IntegrationCategory.SOCIAL_MEDIA,
        capabilities=["content_publishing", "engagement_tracking", "audience_analytics", "lead_generation"],
        data_provides=["posts", "engagement_metrics", "follower_data", "company_updates"],
        actions_available=["create_post", "schedule_content", "get_analytics", "manage_page"],
        required_credentials=["client_id", "client_secret", "access_token"],
        api_documentation="https://docs.microsoft.com/en-us/linkedin/"
    ),
    
    "twitter": IntegrationCapability(
        integration_id="twitter",
        integration_name="Twitter/X",
        category=IntegrationCategory.SOCIAL_MEDIA,
        capabilities=["tweet_publishing", "engagement_monitoring", "trend_tracking", "dm_automation"],
        data_provides=["tweets", "engagement_data", "follower_metrics", "trending_topics"],
        actions_available=["post_tweet", "schedule_tweet", "get_trends", "send_dm"],
        required_credentials=["api_key", "api_secret", "access_token", "access_token_secret"],
        api_documentation="https://developer.twitter.com/en/docs"
    ),
    
    "instagram": IntegrationCapability(
        integration_id="instagram",
        integration_name="Instagram",
        category=IntegrationCategory.SOCIAL_MEDIA,
        capabilities=["content_publishing", "story_posting", "engagement_tracking", "shopping_integration"],
        data_provides=["posts", "stories", "engagement_metrics", "audience_insights"],
        actions_available=["create_post", "post_story", "schedule_content", "get_insights"],
        required_credentials=["access_token", "business_account_id"],
        api_documentation="https://developers.facebook.com/docs/instagram-api"
    ),
    
    "tiktok": IntegrationCapability(
        integration_id="tiktok",
        integration_name="TikTok",
        category=IntegrationCategory.SOCIAL_MEDIA,
        capabilities=["video_publishing", "analytics_tracking", "trend_monitoring", "creator_tools"],
        data_provides=["videos", "engagement_metrics", "trending_content", "audience_data"],
        actions_available=["upload_video", "get_analytics", "monitor_trends", "manage_account"],
        required_credentials=["client_key", "client_secret", "access_token"],
        api_documentation="https://developers.tiktok.com/"
    ),
    
    # Advertising Platforms
    "google_ads": IntegrationCapability(
        integration_id="google_ads",
        integration_name="Google Ads",
        category=IntegrationCategory.ADVERTISING,
        capabilities=["campaign_management", "ad_creation", "performance_tracking", "budget_optimization"],
        data_provides=["campaign_data", "ad_performance", "keyword_metrics", "conversion_data"],
        actions_available=["create_campaign", "manage_ads", "adjust_budget", "get_reports"],
        required_credentials=["developer_token", "client_id", "client_secret", "refresh_token"],
        api_documentation="https://developers.google.com/google-ads/api/docs"
    ),
    
    "meta_ads": IntegrationCapability(
        integration_id="meta_ads",
        integration_name="Meta Business Suite (Facebook/Instagram Ads)",
        category=IntegrationCategory.ADVERTISING,
        capabilities=["ad_campaign_management", "audience_targeting", "creative_testing", "conversion_tracking"],
        data_provides=["ad_insights", "campaign_performance", "audience_data", "conversion_metrics"],
        actions_available=["create_campaign", "manage_ads", "target_audience", "get_insights"],
        required_credentials=["access_token", "ad_account_id"],
        api_documentation="https://developers.facebook.com/docs/marketing-apis"
    ),
    
    "tiktok_ads": IntegrationCapability(
        integration_id="tiktok_ads",
        integration_name="TikTok Ads",
        category=IntegrationCategory.ADVERTISING,
        capabilities=["video_ad_creation", "campaign_optimization", "audience_targeting", "performance_analytics"],
        data_provides=["ad_performance", "campaign_metrics", "audience_insights", "creative_data"],
        actions_available=["create_campaign", "upload_creative", "target_audience", "get_analytics"],
        required_credentials=["advertiser_id", "access_token"],
        api_documentation="https://ads.tiktok.com/marketing_api/docs"
    ),
    
    # Email Marketing
    "mailchimp": IntegrationCapability(
        integration_id="mailchimp",
        integration_name="Mailchimp",
        category=IntegrationCategory.EMAIL_MARKETING,
        capabilities=["email_campaigns", "audience_segmentation", "automation_workflows", "analytics"],
        data_provides=["subscriber_data", "campaign_metrics", "automation_performance", "audience_insights"],
        actions_available=["create_campaign", "segment_audience", "setup_automation", "get_reports"],
        required_credentials=["api_key", "server_prefix"],
        api_documentation="https://mailchimp.com/developer/"
    ),
    
    "convertkit": IntegrationCapability(
        integration_id="convertkit",
        integration_name="ConvertKit",
        category=IntegrationCategory.EMAIL_MARKETING,
        capabilities=["email_sequences", "subscriber_management", "landing_pages", "automation"],
        data_provides=["subscriber_data", "sequence_metrics", "form_submissions", "tag_data"],
        actions_available=["create_sequence", "manage_subscribers", "create_form", "tag_subscriber"],
        required_credentials=["api_key", "api_secret"],
        api_documentation="https://developers.convertkit.com/"
    ),
    
    # Analytics
    "google_analytics": IntegrationCapability(
        integration_id="google_analytics",
        integration_name="Google Analytics",
        category=IntegrationCategory.ANALYTICS,
        capabilities=["website_analytics", "user_tracking", "conversion_tracking", "behavior_analysis"],
        data_provides=["traffic_data", "user_behavior", "conversion_metrics", "audience_demographics"],
        actions_available=["get_reports", "track_events", "analyze_traffic", "monitor_conversions"],
        required_credentials=["client_id", "client_secret", "refresh_token", "property_id"],
        api_documentation="https://developers.google.com/analytics"
    ),
    
    "mixpanel": IntegrationCapability(
        integration_id="mixpanel",
        integration_name="Mixpanel",
        category=IntegrationCategory.ANALYTICS,
        capabilities=["product_analytics", "user_journey_tracking", "cohort_analysis", "funnel_analysis"],
        data_provides=["event_data", "user_profiles", "funnel_metrics", "retention_data"],
        actions_available=["track_event", "create_funnel", "analyze_cohort", "get_insights"],
        required_credentials=["project_token", "api_secret"],
        api_documentation="https://developer.mixpanel.com/"
    ),
    
    # CRM
    "hubspot": IntegrationCapability(
        integration_id="hubspot",
        integration_name="HubSpot",
        category=IntegrationCategory.CRM,
        capabilities=["contact_management", "deal_tracking", "email_integration", "marketing_automation"],
        data_provides=["contact_data", "deal_pipeline", "email_metrics", "company_data"],
        actions_available=["create_contact", "update_deal", "send_email", "create_task"],
        required_credentials=["api_key"],
        api_documentation="https://developers.hubspot.com/"
    ),
    
    "salesforce": IntegrationCapability(
        integration_id="salesforce",
        integration_name="Salesforce",
        category=IntegrationCategory.CRM,
        capabilities=["crm_management", "sales_automation", "reporting", "workflow_automation"],
        data_provides=["lead_data", "opportunity_data", "account_data", "activity_data"],
        actions_available=["create_lead", "update_opportunity", "generate_report", "automate_workflow"],
        required_credentials=["client_id", "client_secret", "username", "password", "security_token"],
        api_documentation="https://developer.salesforce.com/"
    ),
    
    # Productivity
    "notion": IntegrationCapability(
        integration_id="notion",
        integration_name="Notion",
        category=IntegrationCategory.PRODUCTIVITY,
        capabilities=["knowledge_management", "database_operations", "page_creation", "collaboration"],
        data_provides=["pages", "databases", "blocks", "workspace_data"],
        actions_available=["create_page", "update_database", "query_data", "manage_workspace"],
        required_credentials=["integration_token"],
        api_documentation="https://developers.notion.com/"
    ),
    
    "google_drive": IntegrationCapability(
        integration_id="google_drive",
        integration_name="Google Drive",
        category=IntegrationCategory.PRODUCTIVITY,
        capabilities=["file_storage", "document_collaboration", "file_sharing", "backup"],
        data_provides=["files", "folders", "permissions", "activity_data"],
        actions_available=["upload_file", "create_folder", "share_file", "search_files"],
        required_credentials=["client_id", "client_secret", "refresh_token"],
        api_documentation="https://developers.google.com/drive"
    ),
    
    # Communication
    "slack": IntegrationCapability(
        integration_id="slack",
        integration_name="Slack",
        category=IntegrationCategory.COMMUNICATION,
        capabilities=["messaging", "channel_management", "bot_integration", "workflow_automation"],
        data_provides=["messages", "channel_data", "user_data", "file_data"],
        actions_available=["send_message", "create_channel", "upload_file", "trigger_workflow"],
        required_credentials=["bot_token", "app_token"],
        api_documentation="https://api.slack.com/"
    ),
    
    # E-commerce
    "shopify": IntegrationCapability(
        integration_id="shopify",
        integration_name="Shopify",
        category=IntegrationCategory.ECOMMERCE,
        capabilities=["inventory_management", "order_processing", "product_management", "customer_data"],
        data_provides=["products", "orders", "customers", "inventory_data"],
        actions_available=["create_product", "process_order", "update_inventory", "manage_customers"],
        required_credentials=["shop_domain", "access_token"],
        api_documentation="https://shopify.dev/api"
    ),
    
    # Intelligence Feeds
    "yahoo_finance": IntegrationCapability(
        integration_id="yahoo_finance",
        integration_name="Yahoo Finance",
        category=IntegrationCategory.INTELLIGENCE,
        capabilities=["market_data", "stock_quotes", "financial_news", "company_data"],
        data_provides=["stock_prices", "market_trends", "financial_news", "company_info"],
        actions_available=["get_quote", "get_news", "get_trends", "analyze_market"],
        required_credentials=[],  # Public API
        api_documentation="https://finance.yahoo.com/"
    ),
    
    "news_api": IntegrationCapability(
        integration_id="news_api",
        integration_name="NewsAPI",
        category=IntegrationCategory.INTELLIGENCE,
        capabilities=["news_aggregation", "topic_monitoring", "source_filtering", "trend_analysis"],
        data_provides=["news_articles", "trending_topics", "source_data", "category_news"],
        actions_available=["search_news", "get_headlines", "monitor_topics", "analyze_trends"],
        required_credentials=["api_key"],
        api_documentation="https://newsapi.org/docs"
    ),
}


class IntegrationRegistry:
    """Registry for managing user integrations"""
    
    def __init__(self):
        self.user_integrations: Dict[str, Dict[str, Any]] = {}
    
    def register_user_integration(self, user_id: str, integration_id: str, credentials: Dict[str, str], status: str = "connected"):
        """Register a user's integration"""
        if user_id not in self.user_integrations:
            self.user_integrations[user_id] = {}
        
        self.user_integrations[user_id][integration_id] = {
            "integration_id": integration_id,
            "credentials": credentials,
            "status": status,
            "connected_at": "now"  # Would use datetime in production
        }
    
    def get_user_integrations(self, user_id: str) -> List[str]:
        """Get all connected integrations for a user"""
        if user_id not in self.user_integrations:
            return []
        return [k for k, v in self.user_integrations[user_id].items() if v["status"] == "connected"]
    
    def is_integration_connected(self, user_id: str, integration_id: str) -> bool:
        """Check if an integration is connected for a user"""
        if user_id not in self.user_integrations:
            return False
        return integration_id in self.user_integrations[user_id] and \
               self.user_integrations[user_id][integration_id]["status"] == "connected"
    
    def get_integration_credentials(self, user_id: str, integration_id: str) -> Optional[Dict[str, str]]:
        """Get credentials for a user's integration"""
        if self.is_integration_connected(user_id, integration_id):
            return self.user_integrations[user_id][integration_id]["credentials"]
        return None


# Global integration registry instance
integration_registry = IntegrationRegistry()


def get_available_integrations_for_user(user_id: str) -> List[Dict[str, Any]]:
    """Get all available integrations and their connection status for a user"""
    connected_integrations = integration_registry.get_user_integrations(user_id)
    
    return [
        {
            **integration.to_dict(),
            "connected": integration.integration_id in connected_integrations
        }
        for integration in INTEGRATION_CAPABILITIES.values()
    ]


def get_connected_integrations_summary(user_id: str) -> Dict[str, Any]:
    """Get summary of connected integrations for orchestrator"""
    connected = integration_registry.get_user_integrations(user_id)
    
    summary = {
        "total_connected": len(connected),
        "by_category": {},
        "available_capabilities": [],
        "data_sources": []
    }
    
    for integration_id in connected:
        if integration_id in INTEGRATION_CAPABILITIES:
            integration = INTEGRATION_CAPABILITIES[integration_id]
            category = integration.category.value
            
            if category not in summary["by_category"]:
                summary["by_category"][category] = []
            summary["by_category"][category].append(integration.integration_name)
            
            summary["available_capabilities"].extend(integration.capabilities)
            summary["data_sources"].extend(integration.data_provides)
    
    # Remove duplicates
    summary["available_capabilities"] = list(set(summary["available_capabilities"]))
    summary["data_sources"] = list(set(summary["data_sources"]))
    
    return summary


def generate_integration_context_for_orchestrator(user_id: str) -> str:
    """Generate integration context string for orchestrator prompt"""
    summary = get_connected_integrations_summary(user_id)
    
    if summary["total_connected"] == 0:
        return "**No integrations connected.** User will need to connect platforms for autonomous operations."
    
    context = f"**Connected Integrations ({summary['total_connected']}):**\n\n"
    
    for category, integrations in summary["by_category"].items():
        context += f"- {category.replace('_', ' ').title()}: {', '.join(integrations)}\n"
    
    context += f"\n**Available Data Sources:** {', '.join(summary['data_sources'][:10])}"
    context += f"\n**Available Actions:** {', '.join(summary['available_capabilities'][:15])}"
    
    return context


def get_integration_for_capability(capability: str) -> List[IntegrationCapability]:
    """Find integrations that provide a specific capability"""
    return [
        integration for integration in INTEGRATION_CAPABILITIES.values()
        if capability in integration.capabilities
    ]


def can_agent_access_integration(agent_name: str, integration_id: str, user_id: str) -> bool:
    """Check if an agent can access a specific integration for a user"""
    # Check if integration is connected
    if not integration_registry.is_integration_connected(user_id, integration_id):
        return False
    
    # In production, would check agent permissions here
    return True

