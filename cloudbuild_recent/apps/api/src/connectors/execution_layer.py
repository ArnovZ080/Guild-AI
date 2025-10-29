"""
Execution Layer
Connects visual automation to platform connectors for automated workflows
"""

import logging
from typing import Dict, List, Optional, Any, Union
from datetime import datetime, timedelta
from ..core.schemas import DataRoom, DocumentMeta
from ..core.storage import Connector

# Import all platform connectors
from .facebook import FacebookConnector
from .instagram import InstagramConnector
from .linkedin import LinkedInConnector
from .gmail import GmailConnector
from .whatsapp import WhatsAppConnector
from .messenger import MessengerConnector
from .automation_platforms import N8NConnector, MakeConnector, ZapierConnector

logger = logging.getLogger(__name__)

class ExecutionLayer:
    """
    Orchestrates automated workflows across multiple platforms
    Connects visual automation with platform APIs for seamless execution
    """
    
    def __init__(self):
        self.connectors = {}
        self.automation_platforms = {}
        self.workflow_templates = self._load_workflow_templates()
    
    def register_connector(self, platform: str, connector: Connector):
        """Register a platform connector"""
        self.connectors[platform] = connector
        logger.info(f"Registered {platform} connector")
    
    def register_automation_platform(self, platform: str, connector: Union[N8NConnector, MakeConnector, ZapierConnector]):
        """Register an automation platform connector"""
        self.automation_platforms[platform] = connector
        logger.info(f"Registered {platform} automation platform")
    
    def _load_workflow_templates(self) -> Dict[str, Dict]:
        """Load predefined workflow templates for common business tasks"""
        return {
            "social_media_posting": {
                "name": "Social Media Content Publishing",
                "description": "Automatically post content across Facebook, Instagram, and LinkedIn",
                "platforms": ["facebook", "instagram", "linkedin"],
                "automation_platforms": ["n8n", "make", "zapier"],
                "steps": [
                    {
                        "step": 1,
                        "action": "content_creation",
                        "description": "Generate or prepare content for posting",
                        "platform": "internal"
                    },
                    {
                        "step": 2,
                        "action": "schedule_posting",
                        "description": "Schedule posts across platforms",
                        "platforms": ["facebook", "instagram", "linkedin"]
                    },
                    {
                        "step": 3,
                        "action": "monitor_engagement",
                        "description": "Track engagement and respond to comments",
                        "platforms": ["facebook", "instagram", "linkedin"]
                    }
                ]
            },
            "lead_generation": {
                "name": "Automated Lead Generation",
                "description": "Generate and nurture leads across multiple channels",
                "platforms": ["facebook", "instagram", "linkedin", "whatsapp", "messenger"],
                "automation_platforms": ["n8n", "make", "zapier"],
                "steps": [
                    {
                        "step": 1,
                        "action": "prospect_research",
                        "description": "Research and identify potential leads",
                        "platform": "internal"
                    },
                    {
                        "step": 2,
                        "action": "outreach_automation",
                        "description": "Send personalized outreach messages",
                        "platforms": ["linkedin", "whatsapp", "messenger"]
                    },
                    {
                        "step": 3,
                        "action": "follow_up_sequence",
                        "description": "Automated follow-up sequence",
                        "platforms": ["gmail", "whatsapp", "messenger"]
                    }
                ]
            },
            "email_marketing": {
                "name": "Email Marketing Automation",
                "description": "Automated email campaigns and sequences",
                "platforms": ["gmail"],
                "automation_platforms": ["n8n", "make", "zapier"],
                "steps": [
                    {
                        "step": 1,
                        "action": "list_segmentation",
                        "description": "Segment email lists based on behavior",
                        "platform": "internal"
                    },
                    {
                        "step": 2,
                        "action": "email_creation",
                        "description": "Create personalized email content",
                        "platform": "internal"
                    },
                    {
                        "step": 3,
                        "action": "send_emails",
                        "description": "Send emails via Gmail API",
                        "platforms": ["gmail"]
                    }
                ]
            },
            "customer_support": {
                "name": "Multi-Channel Customer Support",
                "description": "Automated customer support across messaging platforms",
                "platforms": ["whatsapp", "messenger", "gmail"],
                "automation_platforms": ["n8n", "make", "zapier"],
                "steps": [
                    {
                        "step": 1,
                        "action": "message_routing",
                        "description": "Route messages to appropriate agents",
                        "platform": "internal"
                    },
                    {
                        "step": 2,
                        "action": "auto_response",
                        "description": "Send automated responses for common queries",
                        "platforms": ["whatsapp", "messenger"]
                    },
                    {
                        "step": 3,
                        "action": "escalation",
                        "description": "Escalate complex issues to human agents",
                        "platform": "internal"
                    }
                ]
            }
        }
    
    def create_workflow(self, template_name: str, custom_config: Dict = None) -> Dict:
        """Create a workflow based on a template"""
        try:
            if template_name not in self.workflow_templates:
                raise ValueError(f"Template '{template_name}' not found")
            
            template = self.workflow_templates[template_name]
            workflow_config = {
                "name": template["name"],
                "description": template["description"],
                "template": template_name,
                "platforms": template["platforms"],
                "automation_platforms": template["automation_platforms"],
                "steps": template["steps"],
                "custom_config": custom_config or {},
                "created_at": datetime.now().isoformat(),
                "status": "draft"
            }
            
            return workflow_config
            
        except Exception as e:
            logger.error(f"Failed to create workflow: {e}")
            return {}
    
    def deploy_workflow(self, workflow_config: Dict, automation_platform: str = "n8n") -> Dict:
        """Deploy a workflow to an automation platform"""
        try:
            if automation_platform not in self.automation_platforms:
                raise ValueError(f"Automation platform '{automation_platform}' not registered")
            
            platform_connector = self.automation_platforms[automation_platform]
            
            # Convert workflow config to platform-specific format
            if automation_platform == "n8n":
                nodes, connections = self._convert_to_n8n_format(workflow_config)
                result = platform_connector.create_workflow(
                    name=workflow_config["name"],
                    nodes=nodes,
                    connections=connections
                )
            elif automation_platform == "make":
                blueprint = self._convert_to_make_format(workflow_config)
                result = platform_connector.create_scenario(
                    name=workflow_config["name"],
                    blueprint=blueprint
                )
            elif automation_platform == "zapier":
                trigger, action = self._convert_to_zapier_format(workflow_config)
                result = platform_connector.create_zap(
                    title=workflow_config["name"],
                    trigger=trigger,
                    action=action
                )
            
            return result
            
        except Exception as e:
            logger.error(f"Failed to deploy workflow: {e}")
            return {}
    
    def _convert_to_n8n_format(self, workflow_config: Dict) -> tuple:
        """Convert workflow config to n8n nodes and connections format"""
        nodes = []
        connections = {}
        
        # Create nodes for each step
        for i, step in enumerate(workflow_config["steps"]):
            node_id = f"step_{i+1}"
            
            if step["action"] == "content_creation":
                nodes.append({
                    "id": node_id,
                    "name": "Content Creation",
                    "type": "n8n-nodes-base.function",
                    "typeVersion": 1,
                    "position": [i * 300, 0],
                    "parameters": {
                        "functionCode": "// Content creation logic\nreturn items;"
                    }
                })
            elif step["action"] == "schedule_posting":
                for platform in step.get("platforms", []):
                    platform_node_id = f"{node_id}_{platform}"
                    nodes.append({
                        "id": platform_node_id,
                        "name": f"Post to {platform.title()}",
                        "type": f"n8n-nodes-base.{platform}",
                        "typeVersion": 1,
                        "position": [i * 300, 100],
                        "parameters": {
                            "operation": "create_post",
                            "message": "={{ $json.content }}"
                        }
                    })
            elif step["action"] == "send_emails":
                nodes.append({
                    "id": node_id,
                    "name": "Send Email",
                    "type": "n8n-nodes-base.gmail",
                    "typeVersion": 1,
                    "position": [i * 300, 0],
                    "parameters": {
                        "operation": "send",
                        "to": "={{ $json.email }}",
                        "subject": "={{ $json.subject }}",
                        "message": "={{ $json.message }}"
                    }
                })
            
            # Create connections
            if i > 0:
                connections[node_id] = {
                    "main": [[{"node": f"step_{i}", "type": "main", "index": 0}]]
                }
        
        return nodes, connections
    
    def _convert_to_make_format(self, workflow_config: Dict) -> Dict:
        """Convert workflow config to Make scenario blueprint format"""
        modules = []
        
        for i, step in enumerate(workflow_config["steps"]):
            if step["action"] == "content_creation":
                modules.append({
                    "id": i + 1,
                    "type": "function",
                    "name": "Content Creation",
                    "parameters": {
                        "script": "// Content creation logic"
                    }
                })
            elif step["action"] == "schedule_posting":
                for platform in step.get("platforms", []):
                    modules.append({
                        "id": len(modules) + 1,
                        "type": platform,
                        "name": f"Post to {platform.title()}",
                        "parameters": {
                            "operation": "create_post"
                        }
                    })
        
        return {
            "modules": modules,
            "connections": list(range(len(modules) - 1))
        }
    
    def _convert_to_zapier_format(self, workflow_config: Dict) -> tuple:
        """Convert workflow config to Zapier trigger and action format"""
        # For Zapier, we'll create a simple trigger-action pair
        trigger = {
            "key": "webhook",
            "label": "Webhook",
            "type": "webhook"
        }
        
        action = {
            "key": "gmail",
            "label": "Gmail",
            "type": "action",
            "operation": "send_email"
        }
        
        return trigger, action
    
    def execute_platform_action(self, platform: str, action: str, **kwargs) -> Dict:
        """Execute a specific action on a platform"""
        try:
            if platform not in self.connectors:
                raise ValueError(f"Platform '{platform}' not registered")
            
            connector = self.connectors[platform]
            
            if platform == "facebook":
                if action == "create_post":
                    return connector.create_post(
                        page_id=kwargs.get("page_id"),
                        message=kwargs.get("message"),
                        link=kwargs.get("link"),
                        image_url=kwargs.get("image_url")
                    )
                elif action == "create_campaign":
                    return connector.create_campaign(
                        ad_account_id=kwargs.get("ad_account_id"),
                        name=kwargs.get("name"),
                        objective=kwargs.get("objective"),
                        daily_budget=kwargs.get("daily_budget")
                    )
            
            elif platform == "instagram":
                if action == "create_post":
                    return connector.create_post(
                        instagram_account_id=kwargs.get("instagram_account_id"),
                        image_url=kwargs.get("image_url"),
                        caption=kwargs.get("caption")
                    )
                elif action == "create_story":
                    return connector.create_story(
                        instagram_account_id=kwargs.get("instagram_account_id"),
                        image_url=kwargs.get("image_url")
                    )
            
            elif platform == "linkedin":
                if action == "create_company_post":
                    return connector.create_company_post(
                        company_id=kwargs.get("company_id"),
                        text=kwargs.get("text"),
                        image_url=kwargs.get("image_url"),
                        link_url=kwargs.get("link_url")
                    )
            
            elif platform == "gmail":
                if action == "send_email":
                    return connector.send_email(
                        to=kwargs.get("to"),
                        subject=kwargs.get("subject"),
                        body=kwargs.get("body"),
                        cc=kwargs.get("cc"),
                        bcc=kwargs.get("bcc")
                    )
                elif action == "create_draft":
                    return connector.create_draft(
                        to=kwargs.get("to"),
                        subject=kwargs.get("subject"),
                        body=kwargs.get("body")
                    )
            
            elif platform == "whatsapp":
                if action == "send_text_message":
                    return connector.send_text_message(
                        to=kwargs.get("to"),
                        message=kwargs.get("message")
                    )
                elif action == "send_media_message":
                    return connector.send_media_message(
                        to=kwargs.get("to"),
                        media_type=kwargs.get("media_type"),
                        media_url=kwargs.get("media_url"),
                        caption=kwargs.get("caption")
                    )
            
            elif platform == "messenger":
                if action == "send_text_message":
                    return connector.send_text_message(
                        recipient_id=kwargs.get("recipient_id"),
                        message=kwargs.get("message")
                    )
                elif action == "send_attachment_message":
                    return connector.send_attachment_message(
                        recipient_id=kwargs.get("recipient_id"),
                        attachment_type=kwargs.get("attachment_type"),
                        attachment_url=kwargs.get("attachment_url")
                    )
            
            return {"error": f"Action '{action}' not supported for platform '{platform}'"}
            
        except Exception as e:
            logger.error(f"Failed to execute platform action: {e}")
            return {"error": str(e)}
    
    def schedule_content(self, content: Dict, platforms: List[str], 
                        schedule_time: datetime = None) -> Dict:
        """Schedule content across multiple platforms"""
        try:
            results = {}
            
            for platform in platforms:
                if platform not in self.connectors:
                    results[platform] = {"error": f"Platform '{platform}' not registered"}
                    continue
                
                # Schedule the content
                if schedule_time:
                    # In a real implementation, this would use a job scheduler
                    # For now, we'll execute immediately
                    pass
                
                # Execute the posting action
                if platform in ["facebook", "instagram", "linkedin"]:
                    result = self.execute_platform_action(
                        platform=platform,
                        action="create_post",
                        **content
                    )
                else:
                    result = {"error": f"Content scheduling not supported for {platform}"}
                
                results[platform] = result
            
            return results
            
        except Exception as e:
            logger.error(f"Failed to schedule content: {e}")
            return {"error": str(e)}
    
    def send_campaign(self, campaign_config: Dict) -> Dict:
        """Send a multi-channel campaign"""
        try:
            results = {}
            
            # Send emails
            if "email" in campaign_config:
                email_config = campaign_config["email"]
                for recipient in email_config.get("recipients", []):
                    result = self.execute_platform_action(
                        platform="gmail",
                        action="send_email",
                        to=recipient["email"],
                        subject=email_config.get("subject"),
                        body=email_config.get("body")
                    )
                    results[f"email_{recipient['email']}"] = result
            
            # Send social media posts
            if "social_media" in campaign_config:
                social_config = campaign_config["social_media"]
                for platform in social_config.get("platforms", []):
                    result = self.execute_platform_action(
                        platform=platform,
                        action="create_post",
                        **social_config.get("content", {})
                    )
                    results[f"social_{platform}"] = result
            
            # Send messaging
            if "messaging" in campaign_config:
                messaging_config = campaign_config["messaging"]
                for platform in messaging_config.get("platforms", []):
                    for recipient in messaging_config.get("recipients", []):
                        result = self.execute_platform_action(
                            platform=platform,
                            action="send_text_message",
                            **recipient,
                            message=messaging_config.get("message")
                        )
                        results[f"message_{platform}_{recipient.get('id', 'unknown')}"] = result
            
            return results
            
        except Exception as e:
            logger.error(f"Failed to send campaign: {e}")
            return {"error": str(e)}
    
    def monitor_performance(self, workflow_id: str, platforms: List[str]) -> Dict:
        """Monitor performance across platforms for a workflow"""
        try:
            results = {}
            
            for platform in platforms:
                if platform not in self.connectors:
                    results[platform] = {"error": f"Platform '{platform}' not registered"}
                    continue
                
                connector = self.connectors[platform]
                
                # Get platform-specific analytics
                if platform == "facebook":
                    # Get page insights
                    pages = connector.get_pages()
                    for page in pages:
                        insights = connector.get_page_insights(page["id"])
                        results[f"facebook_page_{page['id']}"] = insights
                
                elif platform == "instagram":
                    # Get Instagram insights
                    accounts = connector.get_business_accounts()
                    for account in accounts:
                        insights = connector.get_insights(account["id"])
                        results[f"instagram_account_{account['id']}"] = insights
                
                elif platform == "linkedin":
                    # Get LinkedIn analytics
                    companies = connector.get_companies()
                    for company in companies:
                        analytics = connector.get_company_analytics(company["organization"]["id"])
                        results[f"linkedin_company_{company['organization']['id']}"] = analytics
            
            return results
            
        except Exception as e:
            logger.error(f"Failed to monitor performance: {e}")
            return {"error": str(e)}
    
    def get_available_workflows(self) -> List[Dict]:
        """Get list of available workflow templates"""
        return [
            {
                "name": template_name,
                "title": template["name"],
                "description": template["description"],
                "platforms": template["platforms"],
                "automation_platforms": template["automation_platforms"]
            }
            for template_name, template in self.workflow_templates.items()
        ]
    
    def validate_platform_connections(self) -> Dict[str, bool]:
        """Validate all registered platform connections"""
        results = {}
        
        for platform, connector in self.connectors.items():
            try:
                results[platform] = connector.validate_connection()
            except Exception as e:
                logger.error(f"Failed to validate {platform} connection: {e}")
                results[platform] = False
        
        for platform, connector in self.automation_platforms.items():
            try:
                results[f"{platform}_automation"] = connector.validate_connection()
            except Exception as e:
                logger.error(f"Failed to validate {platform} automation connection: {e}")
                results[f"{platform}_automation"] = False
        
        return results
