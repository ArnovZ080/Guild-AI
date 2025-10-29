"""
MCP Integration for Guild-AI Orchestrator
Enables autonomous execution through Model Context Protocol
"""

import json
import logging
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
import httpx
import asyncio

logger = logging.getLogger(__name__)

@dataclass
class MCPServer:
    """MCP Server configuration"""
    name: str
    url: str
    label: str
    allowed_tools: List[str]
    require_approval: str = "never"
    headers: Optional[Dict[str, str]] = None

class MCPOrchestrator:
    """Orchestrator for MCP-based autonomous execution"""
    
    def __init__(self):
        # Use environment variable for API URL, fallback to Cloud Run URL
        import os
        api_url = os.getenv("VITE_API_URL", "https://guild-ai-api-881782424.us-central1.run.app")
        
        self.servers = {
            # Original 10 MCP Servers
            "social_media": MCPServer(
                name="social_media",
                url=f"{api_url}/mcp/social-media",
                label="social_media",
                allowed_tools=[
                    "create_facebook_post",
                    "create_instagram_story", 
                    "publish_linkedin_article",
                    "create_twitter_thread",
                    "analyze_engagement_metrics"
                ]
            ),
            "crm": MCPServer(
                name="crm",
                url=f"{api_url}/mcp/crm",
                label="crm",
                allowed_tools=[
                    "create_lead",
                    "send_email_sequence",
                    "update_contact_info",
                    "schedule_follow_up",
                    "analyze_lead_quality"
                ]
            ),
            "accounting": MCPServer(
                name="accounting",
                url=f"{api_url}/mcp/accounting",
                label="accounting",
                allowed_tools=[
                    "create_invoice",
                    "record_expense",
                    "generate_financial_report",
                    "reconcile_accounts",
                    "track_tax_obligations"
                ]
            ),
            "calendar": MCPServer(
                name="calendar",
                url=f"{api_url}/mcp/calendar",
                label="calendar",
                allowed_tools=[
                    "create_event",
                    "schedule_meeting",
                    "check_availability",
                    "find_meeting_times",
                    "send_meeting_invite"
                ]
            ),
            "ecommerce": MCPServer(
                name="ecommerce",
                url=f"{api_url}/mcp/ecommerce",
                label="ecommerce",
                allowed_tools=[
                    "create_product",
                    "update_inventory",
                    "process_order",
                    "generate_sales_report",
                    "manage_coupons"
                ]
            ),
            "analytics": MCPServer(
                name="analytics",
                url=f"{api_url}/mcp/analytics",
                label="analytics",
                allowed_tools=[
                    "fetch_website_analytics",
                    "analyze_conversion_funnel",
                    "track_campaign_performance",
                    "generate_insights_report",
                    "setup_goal_tracking"
                ]
            ),
            "project_management": MCPServer(
                name="project_management",
                url=f"{api_url}/mcp/project-management",
                label="project_management",
                allowed_tools=[
                    "create_task",
                    "update_task_status",
                    "create_project",
                    "generate_project_report",
                    "schedule_team_meeting"
                ]
            ),
            "payments": MCPServer(
                name="payments",
                url=f"{api_url}/mcp/payments",
                label="payments",
                allowed_tools=[
                    "create_payment_link",
                    "process_refund",
                    "generate_payment_report",
                    "setup_recurring_payment",
                    "track_payment_status"
                ]
            ),
            "communication": MCPServer(
                name="communication",
                url=f"{api_url}/mcp/communication",
                label="communication",
                allowed_tools=[
                    "send_message",
                    "create_meeting",
                    "send_bulk_message",
                    "schedule_reminder",
                    "analyze_communication_metrics"
                ]
            ),
            "email_marketing": MCPServer(
                name="email_marketing",
                url=f"{api_url}/mcp/email-marketing",
                label="email_marketing",
                allowed_tools=[
                    "create_email_campaign",
                    "manage_subscribers",
                    "analyze_campaign_performance",
                    "create_automation_workflow",
                    "segment_audience"
                ]
            ),
            
            # Additional 10 MCP Servers (Categories 11-20)
            "ad_platforms": MCPServer(
                name="ad_platforms",
                url=f"{api_url}/mcp/ad-platforms",
                label="ad_platforms",
                allowed_tools=[
                    "create_google_ads_campaign",
                    "create_meta_ads_campaign",
                    "create_linkedin_ads_campaign",
                    "create_tiktok_ads_campaign",
                    "optimize_ad_performance"
                ]
            ),
            "support": MCPServer(
                name="support",
                url=f"{api_url}/mcp/support",
                label="support",
                allowed_tools=[
                    "create_support_ticket",
                    "update_ticket_status",
                    "assign_ticket",
                    "create_knowledge_base_article",
                    "setup_automated_responses"
                ]
            ),
            "cloud_infrastructure": MCPServer(
                name="cloud_infrastructure",
                url=f"{api_url}/mcp/cloud-infrastructure",
                label="cloud_infrastructure",
                allowed_tools=[
                    "deploy_application",
                    "scale_resources",
                    "setup_monitoring",
                    "create_backup",
                    "run_security_scan"
                ]
            ),
            "ai_analytics": MCPServer(
                name="ai_analytics",
                url=f"{api_url}/mcp/ai-analytics",
                label="ai_analytics",
                allowed_tools=[
                    "generate_ai_content",
                    "analyze_data_insights",
                    "create_predictive_model",
                    "generate_analytics_report",
                    "setup_automated_insights"
                ]
            ),
            "human_os": MCPServer(
                name="human_os",
                url=f"{api_url}/mcp/human-os",
                label="human_os",
                allowed_tools=[
                    "track_wellness_goal",
                    "schedule_productivity_task",
                    "log_health_metrics",
                    "setup_habit_tracking",
                    "generate_wellness_report"
                ]
            ),
            "design_media": MCPServer(
                name="design_media",
                url=f"{api_url}/mcp/design-media",
                label="design_media",
                allowed_tools=[
                    "generate_ai_image",
                    "create_logo_design",
                    "design_social_media_post",
                    "create_video_content",
                    "generate_thumbnail"
                ]
            ),
            "intelligence": MCPServer(
                name="intelligence",
                url=f"{api_url}/mcp/intelligence",
                label="intelligence",
                allowed_tools=[
                    "gather_market_intelligence",
                    "monitor_news_sentiment",
                    "analyze_competitor_strategy",
                    "track_industry_trends",
                    "generate_market_report"
                ]
            ),
            "recruitment": MCPServer(
                name="recruitment",
                url=f"{api_url}/mcp/recruitment",
                label="recruitment",
                allowed_tools=[
                    "create_job_posting",
                    "source_candidates",
                    "screen_candidates",
                    "schedule_interviews",
                    "conduct_skills_assessment"
                ]
            ),
            "seo_tools": MCPServer(
                name="seo_tools",
                url=f"{api_url}/mcp/seo-tools",
                label="seo_tools",
                allowed_tools=[
                    "analyze_website_seo",
                    "conduct_keyword_research",
                    "optimize_content_seo",
                    "analyze_competitor_seo",
                    "generate_seo_report"
                ]
            ),
            "productivity": MCPServer(
                name="productivity",
                url=f"{api_url}/mcp/productivity",
                label="productivity",
                allowed_tools=[
                    "create_task",
                    "schedule_meeting",
                    "create_document",
                    "setup_workflow_automation",
                    "organize_files"
                ]
            )
        }
        
        self.client = httpx.AsyncClient(timeout=30.0)
    
    async def get_available_tools(self, server_name: str) -> List[Dict[str, Any]]:
        """Get available tools from an MCP server"""
        try:
            server = self.servers.get(server_name)
            if not server:
                raise ValueError(f"Unknown MCP server: {server_name}")
            
            response = await self.client.get(f"{server.url}/mcp/tools")
            response.raise_for_status()
            
            data = response.json()
            return data.get("tools", [])
            
        except Exception as e:
            logger.error(f"Failed to get tools from {server_name}: {e}")
            return []
    
    async def execute_tool(self, server_name: str, tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a tool on an MCP server"""
        try:
            server = self.servers.get(server_name)
            if not server:
                raise ValueError(f"Unknown MCP server: {server_name}")
            
            if tool_name not in server.allowed_tools:
                raise ValueError(f"Tool {tool_name} not allowed on server {server_name}")
            
            payload = {
                "name": tool_name,
                "arguments": arguments
            }
            
            response = await self.client.post(
                f"{server.url}/mcp/tools/call",
                json=payload,
                headers=server.headers or {}
            )
            response.raise_for_status()
            
            result = response.json()
            return result
            
        except Exception as e:
            logger.error(f"Failed to execute tool {tool_name} on {server_name}: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def autonomous_content_campaign(self, campaign_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute an autonomous content campaign across platforms"""
        try:
            results = {}
            
            # 1. Generate content
            content_result = await self.execute_tool(
                "content",
                "generate_blog_post",
                {
                    "topic": campaign_data.get("topic"),
                    "target_audience": campaign_data.get("audience"),
                    "tone": campaign_data.get("tone", "professional")
                }
            )
            results["content_generation"] = content_result
            
            if not content_result.get("success"):
                return {"success": False, "error": "Content generation failed"}
            
            content = content_result.get("result", {})
            
            # 2. Create social media posts
            social_tasks = []
            if campaign_data.get("platforms", {}).get("facebook"):
                social_tasks.append(
                    self.execute_tool(
                        "social_media",
                        "create_facebook_post",
                        {
                            "content": content.get("summary", ""),
                            "image_url": content.get("image_url"),
                            "schedule_time": campaign_data.get("schedule_time")
                        }
                    )
                )
            
            if campaign_data.get("platforms", {}).get("instagram"):
                social_tasks.append(
                    self.execute_tool(
                        "social_media",
                        "create_instagram_story",
                        {
                            "content": content.get("summary", ""),
                            "image_url": content.get("image_url")
                        }
                    )
                )
            
            if campaign_data.get("platforms", {}).get("linkedin"):
                social_tasks.append(
                    self.execute_tool(
                        "social_media",
                        "publish_linkedin_article",
                        {
                            "title": content.get("title", ""),
                            "content": content.get("full_content", ""),
                            "tags": content.get("tags", [])
                        }
                    )
                )
            
            # Execute social media tasks in parallel
            social_results = await asyncio.gather(*social_tasks, return_exceptions=True)
            results["social_media"] = social_results
            
            # 3. Send email campaign if requested
            if campaign_data.get("email_campaign"):
                email_result = await self.execute_tool(
                    "crm",
                    "send_email_sequence",
                    {
                        "sequence_name": campaign_data.get("email_sequence", "campaign_sequence"),
                        "contact_list": campaign_data.get("contact_list", []),
                        "personalization": {
                            "content": content.get("summary", ""),
                            "title": content.get("title", "")
                        }
                    }
                )
                results["email_campaign"] = email_result
            
            # 4. Set up analytics tracking
            analytics_result = await self.execute_tool(
                "analytics",
                "track_conversion_rates",
                {
                    "campaign_id": campaign_data.get("campaign_id"),
                    "platforms": list(campaign_data.get("platforms", {}).keys()),
                    "metrics": ["engagement", "clicks", "conversions"]
                }
            )
            results["analytics_tracking"] = analytics_result
            
            return {
                "success": True,
                "results": results,
                "campaign_id": campaign_data.get("campaign_id"),
                "status": "executed"
            }
            
        except Exception as e:
            logger.error(f"Autonomous campaign execution failed: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def autonomous_lead_management(self, lead_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute autonomous lead management workflow"""
        try:
            results = {}
            
            # 1. Create lead
            lead_result = await self.execute_tool(
                "crm",
                "create_lead",
                {
                    "name": lead_data.get("name"),
                    "email": lead_data.get("email"),
                    "company": lead_data.get("company"),
                    "phone": lead_data.get("phone"),
                    "source": lead_data.get("source", "website"),
                    "notes": lead_data.get("notes", "")
                }
            )
            results["lead_creation"] = lead_result
            
            if not lead_result.get("success"):
                return {"success": False, "error": "Lead creation failed"}
            
            lead_id = lead_result.get("result", {}).get("lead_id")
            
            # 2. Analyze lead quality
            quality_result = await self.execute_tool(
                "crm",
                "analyze_lead_quality",
                {
                    "lead_id": lead_id,
                    "criteria": ["engagement", "demographics", "behavior"]
                }
            )
            results["lead_analysis"] = quality_result
            
            # 3. Schedule follow-up based on quality
            quality_score = quality_result.get("result", {}).get("quality_score", 0)
            if quality_score >= 70:
                follow_up_result = await self.execute_tool(
                    "crm",
                    "schedule_follow_up",
                    {
                        "contact_id": lead_id,
                        "task_type": "high_priority_call",
                        "due_date": "2024-01-02T09:00:00Z",
                        "notes": "High quality lead - immediate follow-up required"
                    }
                )
                results["follow_up"] = follow_up_result
            
            # 4. Send welcome email sequence
            email_result = await self.execute_tool(
                "crm",
                "send_email_sequence",
                {
                    "sequence_name": "welcome_sequence",
                    "contact_list": [lead_id],
                    "personalization": {
                        "name": lead_data.get("name"),
                        "company": lead_data.get("company")
                    }
                }
            )
            results["welcome_email"] = email_result
            
            return {
                "success": True,
                "results": results,
                "lead_id": lead_id,
                "status": "processed"
            }
            
        except Exception as e:
            logger.error(f"Autonomous lead management failed: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def get_server_status(self) -> Dict[str, Any]:
        """Get status of all MCP servers"""
        status = {}
        
        for server_name, server in self.servers.items():
            try:
                response = await self.client.get(f"{server.url}/mcp/tools", timeout=5.0)
                status[server_name] = {
                    "status": "online",
                    "tools_count": len(response.json().get("tools", [])),
                    "url": server.url
                }
            except Exception as e:
                status[server_name] = {
                    "status": "offline",
                    "error": str(e),
                    "url": server.url
                }
        
        return status

# Global MCP Orchestrator instance
mcp_orchestrator = MCPOrchestrator()
