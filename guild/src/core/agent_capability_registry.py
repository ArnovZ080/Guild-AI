"""
Comprehensive Agent Capability Registry for Guild-AI
Maps all 115+ agents with their capabilities, specializations, and use cases.
"""

from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict

@dataclass
class AgentCapability:
    """Agent capability definition"""
    agent_name: str
    agent_class_name: str
    category: str
    capabilities: List[str]
    specializations: List[str]
    primary_use_cases: List[str]
    input_requirements: List[str]
    integration_dependencies: List[str] = None
    
    def __post_init__(self):
        if self.integration_dependencies is None:
            self.integration_dependencies = []


# Comprehensive Agent Capability Registry
AGENT_CAPABILITIES = {
    # Foundational & Orchestration
    "JudgeAgent": AgentCapability(
        agent_name="Judge Agent",
        agent_class_name="JudgeAgent",
        category="Quality Assurance",
        capabilities=["quality_evaluation", "rubric_generation", "revision_management", "deliverable_assessment"],
        specializations=["content_quality", "brand_compliance", "audience_alignment"],
        primary_use_cases=["Evaluate deliverable quality", "Generate quality rubrics", "Manage revision cycles"],
        input_requirements=["deliverable_data", "quality_requirements", "brand_guidelines"]
    ),
    
    "OrchestratorAgent": AgentCapability(
        agent_name="Orchestrator Agent",
        agent_class_name="OrchestratorAgent",
        category="Orchestration",
        capabilities=["workflow_orchestration", "multi_agent_coordination", "task_delegation", "dependency_management"],
        specializations=["workflow_optimization", "agent_coordination", "resource_allocation"],
        primary_use_cases=["Create complex workflows", "Coordinate multiple agents", "Manage task dependencies"],
        input_requirements=["workflow_request", "task_requirements", "available_agents"]
    ),
    
    # Executive Layer
    "ChiefOfStaffAgent": AgentCapability(
        agent_name="Chief of Staff Agent",
        agent_class_name="ChiefOfStaffAgent",
        category="Executive",
        capabilities=["strategic_coordination", "task_prioritization", "executive_delegation", "stakeholder_management"],
        specializations=["strategic_planning", "resource_optimization", "executive_communication"],
        primary_use_cases=["Coordinate executive decisions", "Prioritize business initiatives", "Manage strategic projects"],
        input_requirements=["business_priorities", "available_resources", "strategic_goals"]
    ),
    
    "StrategyAgent": AgentCapability(
        agent_name="Strategy Agent",
        agent_class_name="StrategyAgent",
        category="Executive",
        capabilities=["long_term_planning", "market_analysis", "strategic_decision_making", "competitive_positioning"],
        specializations=["business_strategy", "market_research", "strategic_frameworks"],
        primary_use_cases=["Develop business strategy", "Analyze market opportunities", "Create strategic roadmaps"],
        input_requirements=["business_context", "market_data", "strategic_objectives"]
    ),
    
    "BusinessStrategistAgent": AgentCapability(
        agent_name="Business Strategist Agent",
        agent_class_name="BusinessStrategistAgent",
        category="Executive",
        capabilities=["strategic_thinking", "business_model_design", "value_proposition", "growth_strategy"],
        specializations=["business_model_innovation", "strategic_frameworks", "competitive_advantage"],
        primary_use_cases=["Design business models", "Create growth strategies", "Develop value propositions"],
        input_requirements=["business_model", "market_landscape", "growth_objectives"]
    ),
    
    # Intelligence Agents
    "BusinessIntelligenceAgent": AgentCapability(
        agent_name="Business Intelligence Agent",
        agent_class_name="BusinessIntelligenceAgent",
        category="Intelligence",
        capabilities=["data_synthesis", "dashboard_curation", "alert_generation", "executive_reporting", "kpi_tracking"],
        specializations=["financial_health_analysis", "customer_metrics", "operational_intelligence"],
        primary_use_cases=["Generate CEO snapshots", "Curate business dashboards", "Track KPIs"],
        input_requirements=["data_sources", "user_goals", "dashboard_requirements"],
        integration_dependencies=["analytics_platforms", "financial_systems", "crm_platforms"]
    ),
    
    "CustomerIntelligenceAgent": AgentCapability(
        agent_name="Customer Intelligence Agent",
        agent_class_name="CustomerIntelligenceAgent",
        category="Intelligence",
        capabilities=["customer_sentiment_analysis", "behavior_prediction", "lifecycle_tracking", "engagement_optimization"],
        specializations=["sentiment_analysis", "customer_journey_mapping", "retention_strategy"],
        primary_use_cases=["Analyze customer sentiment", "Predict customer behavior", "Optimize engagement"],
        input_requirements=["customer_data", "interaction_history", "business_goals"],
        integration_dependencies=["crm_platforms", "analytics_tools", "communication_platforms"]
    ),
    
    "CompetitiveIntelligenceAgent": AgentCapability(
        agent_name="Competitive Intelligence Agent",
        agent_class_name="CompetitiveIntelligenceAgent",
        category="Intelligence",
        capabilities=["competitor_analysis", "market_monitoring", "competitive_positioning", "threat_assessment"],
        specializations=["competitor_tracking", "market_intelligence", "strategic_positioning"],
        primary_use_cases=["Analyze competitors", "Monitor market changes", "Identify threats/opportunities"],
        input_requirements=["competitor_list", "market_segment", "analysis_timeframe"],
        integration_dependencies=["web_scraping", "social_media_platforms", "news_apis"]
    ),
    
    "ContentIntelligenceAgent": AgentCapability(
        agent_name="Content Intelligence Agent",
        agent_class_name="ContentIntelligenceAgent",
        category="Intelligence",
        capabilities=["content_performance_analysis", "engagement_optimization", "content_strategy", "trend_identification"],
        specializations=["content_analytics", "engagement_metrics", "content_optimization"],
        primary_use_cases=["Analyze content performance", "Optimize engagement", "Develop content strategy"],
        input_requirements=["content_data", "engagement_metrics", "audience_profile"],
        integration_dependencies=["analytics_platforms", "social_media_platforms", "content_platforms"]
    ),
    
    "FinancialIntelligenceAgent": AgentCapability(
        agent_name="Financial Intelligence Agent",
        agent_class_name="FinancialIntelligenceAgent",
        category="Intelligence",
        capabilities=["financial_analysis", "revenue_forecasting", "expense_optimization", "financial_reporting"],
        specializations=["financial_metrics", "revenue_analysis", "cost_optimization"],
        primary_use_cases=["Analyze financial health", "Forecast revenue", "Optimize expenses"],
        input_requirements=["financial_data", "revenue_streams", "expense_categories"],
        integration_dependencies=["accounting_platforms", "payment_processors", "banking_apis"]
    ),
    
    # Content Creation
    "ContentStrategist": AgentCapability(
        agent_name="Content Strategist",
        agent_class_name="ContentStrategist",
        category="Content",
        capabilities=["content_strategy", "content_planning", "calendar_creation", "editorial_direction"],
        specializations=["content_calendars", "editorial_strategy", "content_frameworks"],
        primary_use_cases=["Develop content strategy", "Create content calendars", "Plan editorial direction"],
        input_requirements=["business_goals", "audience_profile", "brand_guidelines"]
    ),
    
    "Copywriter": AgentCapability(
        agent_name="Copywriter",
        agent_class_name="Copywriter",
        category="Content",
        capabilities=["content_creation", "copywriting", "messaging", "storytelling"],
        specializations=["ad_copy", "long_form_content", "email_copy"],
        primary_use_cases=["Write compelling copy", "Create ad content", "Craft brand messaging"],
        input_requirements=["content_brief", "target_audience", "brand_voice"]
    ),
    
    "CopywriterAgent": AgentCapability(
        agent_name="Copywriter Agent",
        agent_class_name="CopywriterAgent",
        category="Content",
        capabilities=["persuasive_writing", "conversion_copy", "brand_storytelling"],
        specializations=["sales_copy", "marketing_content", "brand_narrative"],
        primary_use_cases=["Create sales copy", "Write marketing content", "Develop brand stories"],
        input_requirements=["content_requirements", "audience_persona", "conversion_goals"]
    ),
    
    # Marketing & Growth
    "SEOAgent": AgentCapability(
        agent_name="SEO Agent",
        agent_class_name="SEOAgent",
        category="Marketing",
        capabilities=["keyword_research", "seo_optimization", "content_optimization", "ranking_analysis"],
        specializations=["on_page_seo", "technical_seo", "keyword_strategy"],
        primary_use_cases=["Optimize for search engines", "Research keywords", "Improve rankings"],
        input_requirements=["target_keywords", "content", "competitor_analysis"],
        integration_dependencies=["seo_tools", "analytics_platforms", "search_console"]
    ),
    
    "PaidAdsAgent": AgentCapability(
        agent_name="Paid Ads Agent",
        agent_class_name="PaidAdsAgent",
        category="Marketing",
        capabilities=["ad_campaign_creation", "budget_optimization", "audience_targeting", "performance_analysis"],
        specializations=["google_ads", "facebook_ads", "campaign_optimization"],
        primary_use_cases=["Create ad campaigns", "Optimize ad spend", "Target audiences"],
        input_requirements=["campaign_goals", "budget", "target_audience"],
        integration_dependencies=["google_ads", "meta_ads", "advertising_platforms"]
    ),
    
    "EnhancedCampaignAgent": AgentCapability(
        agent_name="Enhanced Campaign Agent",
        agent_class_name="EnhancedCampaignAgent",
        category="Marketing",
        capabilities=["campaign_management", "cross_platform_advertising", "performance_optimization", "automated_bidding"],
        specializations=["multi_platform_campaigns", "campaign_automation", "roi_optimization"],
        primary_use_cases=["Manage complex campaigns", "Optimize across platforms", "Automate campaign execution"],
        input_requirements=["campaign_objectives", "platform_requirements", "budget_allocation"],
        integration_dependencies=["google_ads", "meta_ads", "tiktok_ads", "linkedin_ads"]
    ),
    
    # Sales & CRM
    "CRMAgent": AgentCapability(
        agent_name="CRM Agent",
        agent_class_name="CRMAgent",
        category="Sales",
        capabilities=["crm_management", "lead_tracking", "pipeline_management", "customer_data_management"],
        specializations=["salesforce_management", "hubspot_operations", "crm_automation"],
        primary_use_cases=["Manage CRM data", "Track leads", "Optimize sales pipeline"],
        input_requirements=["crm_data", "sales_process", "customer_segments"],
        integration_dependencies=["crm_platforms", "sales_tools"]
    ),
    
    "CRMAutomationAgent": AgentCapability(
        agent_name="CRM Automation Agent",
        agent_class_name="CRMAutomationAgent",
        category="Sales",
        capabilities=["crm_automation", "workflow_automation", "data_synchronization", "automated_follow_ups"],
        specializations=["crm_workflows", "automated_nurturing", "data_integration"],
        primary_use_cases=["Automate CRM workflows", "Sync customer data", "Automate follow-ups"],
        input_requirements=["crm_workflows", "automation_rules", "data_mapping"],
        integration_dependencies=["crm_platforms", "automation_tools", "email_platforms"]
    ),
    
    "OutboundSalesAgent": AgentCapability(
        agent_name="Outbound Sales Agent",
        agent_class_name="OutboundSalesAgent",
        category="Sales",
        capabilities=["cold_outreach", "lead_generation", "sales_prospecting", "outreach_automation"],
        specializations=["email_outreach", "linkedin_prospecting", "cold_calling"],
        primary_use_cases=["Generate leads", "Cold outreach", "Prospect new customers"],
        input_requirements=["target_audience", "outreach_templates", "sales_objectives"]
    ),
    
    # Operations & Finance
    "BookkeepingAgent": AgentCapability(
        agent_name="Bookkeeping Agent",
        agent_class_name="BookkeepingAgent",
        category="Finance",
        capabilities=["transaction_processing", "reconciliation", "financial_categorization", "expense_tracking"],
        specializations=["transaction_management", "account_reconciliation", "expense_categorization"],
        primary_use_cases=["Process transactions", "Reconcile accounts", "Track expenses"],
        input_requirements=["transaction_data", "account_structure", "categorization_rules"],
        integration_dependencies=["accounting_platforms", "banking_apis", "payment_processors"]
    ),
    
    "AccountingAgent": AgentCapability(
        agent_name="Accounting Agent",
        agent_class_name="AccountingAgent",
        category="Finance",
        capabilities=["financial_reporting", "tax_preparation", "financial_analysis", "compliance"],
        specializations=["financial_statements", "tax_compliance", "financial_planning"],
        primary_use_cases=["Generate financial reports", "Prepare taxes", "Financial analysis"],
        input_requirements=["financial_data", "reporting_requirements", "compliance_standards"],
        integration_dependencies=["accounting_platforms", "tax_software"]
    ),
    
    "ProjectManagerAgent": AgentCapability(
        agent_name="Project Manager Agent",
        agent_class_name="ProjectManagerAgent",
        category="Operations",
        capabilities=["project_planning", "task_management", "resource_allocation", "timeline_management"],
        specializations=["agile_project_management", "waterfall_methodology", "project_coordination"],
        primary_use_cases=["Plan projects", "Manage tasks", "Allocate resources"],
        input_requirements=["project_scope", "available_resources", "timeline_requirements"]
    ),
    
    "HRAgent": AgentCapability(
        agent_name="HR Agent",
        agent_class_name="HRAgent",
        category="Operations",
        capabilities=["recruitment", "onboarding", "performance_management", "hr_compliance"],
        specializations=["talent_acquisition", "employee_onboarding", "performance_reviews"],
        primary_use_cases=["Recruit talent", "Onboard employees", "Manage performance"],
        input_requirements=["role_requirements", "company_culture", "recruitment_goals"]
    ),
    
    # Automation & Tools
    "UnifiedAutomationAgent": AgentCapability(
        agent_name="Unified Automation Agent",
        agent_class_name="UnifiedAutomationAgent",
        category="Automation",
        capabilities=["visual_automation", "web_automation", "cross_platform_automation", "workflow_automation"],
        specializations=["pyautogui_automation", "selenium_automation", "desktop_automation"],
        primary_use_cases=["Automate desktop tasks", "Automate web tasks", "Create automation scripts"],
        input_requirements=["task_description", "automation_platform", "automation_requirements"]
    ),
    
    "AutomationAgent": AgentCapability(
        agent_name="Automation Agent",
        agent_class_name="AutomationAgent",
        category="Automation",
        capabilities=["task_automation", "workflow_automation", "process_optimization"],
        specializations=["business_process_automation", "workflow_design", "automation_optimization"],
        primary_use_cases=["Automate business processes", "Optimize workflows", "Create automation"],
        input_requirements=["process_definition", "automation_goals", "integration_requirements"]
    ),
    
    # Media & Creative
    "ImageGenerationAgent": AgentCapability(
        agent_name="Image Generation Agent",
        agent_class_name="ImageGenerationAgent",
        category="Creative",
        capabilities=["image_generation", "ai_art_creation", "visual_content_creation", "image_editing"],
        specializations=["stable_diffusion", "ai_image_generation", "visual_design"],
        primary_use_cases=["Generate images", "Create visual content", "Design graphics"],
        input_requirements=["image_description", "style_requirements", "dimensions"]
    ),
    
    "VideoEditorAgent": AgentCapability(
        agent_name="Video Editor Agent",
        agent_class_name="VideoEditorAgent",
        category="Creative",
        capabilities=["video_editing", "video_creation", "multimedia_production", "video_automation"],
        specializations=["video_editing", "video_assembly", "multimedia_content"],
        primary_use_cases=["Edit videos", "Create video content", "Produce multimedia"],
        input_requirements=["video_assets", "editing_requirements", "output_specifications"]
    ),
    
    "VoiceAgent": AgentCapability(
        agent_name="Voice Agent",
        agent_class_name="VoiceAgent",
        category="Creative",
        capabilities=["text_to_speech", "speech_to_text", "voice_generation", "audio_processing"],
        specializations=["tts_conversion", "stt_transcription", "voice_synthesis"],
        primary_use_cases=["Convert text to speech", "Transcribe audio", "Generate voice content"],
        input_requirements=["text_content", "voice_requirements", "audio_specifications"]
    ),
    
    # Research & Data
    "ScraperAgent": AgentCapability(
        agent_name="Scraper Agent",
        agent_class_name="ScraperAgent",
        category="Research",
        capabilities=["web_scraping", "data_extraction", "lead_generation", "data_enrichment"],
        specializations=["scrapy_scraping", "lead_prospecting", "data_validation"],
        primary_use_cases=["Scrape websites", "Extract data", "Generate leads"],
        input_requirements=["target_urls", "data_requirements", "extraction_rules"]
    ),
    
    "ResearchAgent": AgentCapability(
        agent_name="Research Agent",
        agent_class_name="ResearchAgent",
        category="Research",
        capabilities=["market_research", "data_gathering", "trend_analysis", "competitive_research"],
        specializations=["market_analysis", "trend_identification", "research_synthesis"],
        primary_use_cases=["Conduct market research", "Analyze trends", "Gather insights"],
        input_requirements=["research_topic", "research_scope", "data_sources"]
    ),
    
    "LeadPersonalizationAgent": AgentCapability(
        agent_name="Lead Personalization Agent",
        agent_class_name="LeadPersonalizationAgent",
        category="Sales",
        capabilities=["lead_personalization", "outreach_customization", "sales_psychology", "message_crafting"],
        specializations=["personalized_outreach", "sales_messaging", "psychological_frameworks"],
        primary_use_cases=["Personalize outreach", "Craft sales messages", "Optimize conversion"],
        input_requirements=["lead_data", "value_proposition", "communication_channel"]
    ),
}


def get_all_agent_capabilities() -> Dict[str, AgentCapability]:
    """Get all registered agent capabilities"""
    return AGENT_CAPABILITIES


def get_agents_by_category(category: str) -> List[AgentCapability]:
    """Get all agents in a specific category"""
    return [agent for agent in AGENT_CAPABILITIES.values() if agent.category == category]


def get_agents_by_capability(capability: str) -> List[AgentCapability]:
    """Get all agents with a specific capability"""
    return [
        agent for agent in AGENT_CAPABILITIES.values() 
        if capability in agent.capabilities
    ]


def get_agent_for_task(task_description: str, required_capabilities: List[str] = None) -> Optional[AgentCapability]:
    """Find the most suitable agent for a task based on capabilities"""
    if required_capabilities:
        matching_agents = []
        for agent in AGENT_CAPABILITIES.values():
            if any(cap in agent.capabilities for cap in required_capabilities):
                matching_agents.append(agent)
        
        # Return agent with most matching capabilities
        if matching_agents:
            return max(matching_agents, key=lambda a: len(set(a.capabilities) & set(required_capabilities)))
    
    return None


def generate_orchestrator_agent_list() -> str:
    """Generate comprehensive agent list for orchestrator prompt"""
    categories = {}
    for agent in AGENT_CAPABILITIES.values():
        if agent.category not in categories:
            categories[agent.category] = []
        categories[agent.category].append(agent)
    
    agent_list = []
    for category, agents in sorted(categories.items()):
        agent_list.append(f"\n**{category} Agents:**")
        for agent in agents:
            capabilities = ", ".join(agent.capabilities[:3])  # Top 3 capabilities
            agent_list.append(f"- **{agent.agent_name}**: {capabilities}")
    
    return "\n".join(agent_list)


def generate_agent_capability_descriptions() -> str:
    """Generate detailed agent capability descriptions for orchestrator"""
    descriptions = []
    for agent in sorted(AGENT_CAPABILITIES.values(), key=lambda a: a.category):
        desc = f"- **{agent.agent_name}** ({agent.category}): "
        desc += f"{', '.join(agent.capabilities)}. "
        desc += f"Best for: {', '.join(agent.primary_use_cases[:2])}"
        descriptions.append(desc)
    
    return "\n".join(descriptions)


def get_integration_requirements(agent_name: str) -> List[str]:
    """Get required integrations for an agent"""
    if agent_name in AGENT_CAPABILITIES:
        return AGENT_CAPABILITIES[agent_name].integration_dependencies
    return []

