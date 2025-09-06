"""
CRM/Automation Agent - Connects with CRM platforms and automates workflows
"""

from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime, timedelta

@dataclass
class AutomationWorkflow:
    workflow_id: str
    name: str
    trigger_conditions: Dict[str, Any]
    actions: List[Dict[str, Any]]
    status: str
    performance_metrics: Dict[str, Any]

@dataclass
class LeadData:
    lead_id: str
    contact_info: Dict[str, Any]
    lead_score: float
    source: str
    status: str
    tags: List[str]

class CRMAutomationAgent:
    """CRM/Automation Agent - Connects with CRM platforms and automates workflows"""
    
    def __init__(self, name: str = "CRM/Automation Agent"):
        self.name = name
        self.role = "CRM & Automation Specialist"
        self.expertise = [
            "CRM Platforms",
            "Marketing Automation",
            "Email Marketing",
            "Lead Nurturing",
            "Workflow Design",
            "Data Synchronization"
        ]
    
    def setup_crm_integration(self, 
                            crm_platform: str,
                            api_credentials: Dict[str, str]) -> Dict[str, Any]:
        """Set up CRM integration and connection"""
        
        # Test connection
        connection_status = self._test_crm_connection(crm_platform, api_credentials)
        
        if connection_status["success"]:
            # Configure data mapping
            data_mapping = self._configure_data_mapping(crm_platform)
            
            # Set up sync settings
            sync_settings = self._setup_sync_settings(crm_platform)
            
            return {
                "status": "connected",
                "crm_platform": crm_platform,
                "connection_details": connection_status,
                "data_mapping": data_mapping,
                "sync_settings": sync_settings,
                "setup_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
        else:
            return {
                "status": "failed",
                "error": connection_status["error"],
                "troubleshooting": connection_status["troubleshooting"]
            }
    
    def _test_crm_connection(self, crm_platform: str, credentials: Dict[str, str]) -> Dict[str, Any]:
        """Test CRM connection and API access"""
        
        # Mock connection test
        if crm_platform.lower() in ["hubspot", "salesforce", "pipedrive"]:
            return {
                "success": True,
                "api_version": "v3",
                "rate_limits": {"requests_per_minute": 100, "requests_per_day": 10000},
                "available_endpoints": ["contacts", "deals", "companies", "activities"]
            }
        else:
            return {
                "success": False,
                "error": f"Unsupported CRM platform: {crm_platform}",
                "troubleshooting": "Please check if the CRM platform is supported or contact support"
            }
    
    def _configure_data_mapping(self, crm_platform: str) -> Dict[str, Any]:
        """Configure data mapping between systems"""
        
        mapping_templates = {
            "hubspot": {
                "contact_fields": {
                    "email": "email",
                    "first_name": "firstname",
                    "last_name": "lastname",
                    "company": "company",
                    "phone": "phone",
                    "lead_source": "hs_lead_status"
                },
                "deal_fields": {
                    "deal_name": "dealname",
                    "amount": "amount",
                    "stage": "dealstage",
                    "close_date": "closedate"
                }
            },
            "salesforce": {
                "contact_fields": {
                    "email": "Email",
                    "first_name": "FirstName",
                    "last_name": "LastName",
                    "company": "AccountId",
                    "phone": "Phone"
                },
                "opportunity_fields": {
                    "opportunity_name": "Name",
                    "amount": "Amount",
                    "stage": "StageName",
                    "close_date": "CloseDate"
                }
            }
        }
        
        return mapping_templates.get(crm_platform.lower(), mapping_templates["hubspot"])
    
    def _setup_sync_settings(self, crm_platform: str) -> Dict[str, Any]:
        """Set up data synchronization settings"""
        
        return {
            "sync_frequency": "real_time",
            "sync_direction": "bidirectional",
            "conflict_resolution": "crm_wins",
            "sync_objects": ["contacts", "deals", "companies"],
            "field_mapping": "automatic",
            "error_handling": "retry_with_notification"
        }
    
    def create_automation_workflow(self, 
                                 automation_objective: str,
                                 target_audience_segment: Dict[str, Any],
                                 communication_content: Dict[str, Any],
                                 trigger_conditions: Dict[str, Any]) -> AutomationWorkflow:
        """Create automated workflow for lead nurturing or customer communication"""
        
        # Design workflow structure
        workflow_structure = self._design_workflow_structure(automation_objective, target_audience_segment)
        
        # Create workflow actions
        workflow_actions = self._create_workflow_actions(communication_content, workflow_structure)
        
        # Set up trigger conditions
        trigger_setup = self._setup_trigger_conditions(trigger_conditions, automation_objective)
        
        # Generate workflow ID
        workflow_id = f"workflow_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        return AutomationWorkflow(
            workflow_id=workflow_id,
            name=f"{automation_objective}_automation",
            trigger_conditions=trigger_setup,
            actions=workflow_actions,
            status="active",
            performance_metrics={}
        )
    
    def _design_workflow_structure(self, 
                                 objective: str,
                                 audience_segment: Dict[str, Any]) -> Dict[str, Any]:
        """Design the structure of the automation workflow"""
        
        if objective == "lead_nurturing":
            return {
                "workflow_type": "nurturing_sequence",
                "stages": [
                    {"stage": "welcome", "delay": "immediate", "action": "send_welcome_email"},
                    {"stage": "education", "delay": "1_day", "action": "send_educational_content"},
                    {"stage": "value_demonstration", "delay": "3_days", "action": "send_case_study"},
                    {"stage": "conversion", "delay": "7_days", "action": "send_offer"}
                ],
                "exit_conditions": ["converted", "unsubscribed", "inactive_30_days"]
            }
        elif objective == "onboarding":
            return {
                "workflow_type": "onboarding_sequence",
                "stages": [
                    {"stage": "welcome", "delay": "immediate", "action": "send_welcome_series"},
                    {"stage": "setup_guide", "delay": "1_day", "action": "send_setup_instructions"},
                    {"stage": "feature_introduction", "delay": "3_days", "action": "send_feature_tutorials"},
                    {"stage": "success_check", "delay": "7_days", "action": "send_success_tips"}
                ],
                "exit_conditions": ["completed_onboarding", "churned"]
            }
        else:
            return {
                "workflow_type": "general_communication",
                "stages": [
                    {"stage": "initial_contact", "delay": "immediate", "action": "send_initial_message"},
                    {"stage": "follow_up", "delay": "2_days", "action": "send_follow_up"}
                ],
                "exit_conditions": ["responded", "unsubscribed"]
            }
    
    def _create_workflow_actions(self, 
                               communication_content: Dict[str, Any],
                               workflow_structure: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Create specific actions for the workflow"""
        
        actions = []
        
        for stage in workflow_structure["stages"]:
            action = {
                "action_id": f"action_{stage['stage']}",
                "action_type": stage["action"],
                "delay": stage["delay"],
                "content": self._get_stage_content(stage["stage"], communication_content),
                "conditions": self._get_stage_conditions(stage["stage"]),
                "tracking": {
                    "track_opens": True,
                    "track_clicks": True,
                    "track_conversions": True
                }
            }
            actions.append(action)
        
        return actions
    
    def _get_stage_content(self, stage: str, communication_content: Dict[str, Any]) -> Dict[str, Any]:
        """Get content for specific workflow stage"""
        
        content_templates = {
            "welcome": {
                "subject": "Welcome to [Company Name]!",
                "body": "Thank you for your interest. Here's what you can expect...",
                "cta": "Get Started"
            },
            "education": {
                "subject": "Learn how to [Benefit]",
                "body": "Here's a comprehensive guide to help you...",
                "cta": "Read More"
            },
            "value_demonstration": {
                "subject": "See how [Company] achieved [Result]",
                "body": "Check out this case study showing real results...",
                "cta": "View Case Study"
            },
            "conversion": {
                "subject": "Special offer just for you",
                "body": "As a valued subscriber, here's an exclusive offer...",
                "cta": "Claim Offer"
            }
        }
        
        return content_templates.get(stage, content_templates["welcome"])
    
    def _get_stage_conditions(self, stage: str) -> Dict[str, Any]:
        """Get conditions for workflow stage execution"""
        
        return {
            "audience_segment": "all",
            "engagement_required": stage in ["education", "value_demonstration"],
            "time_restrictions": {
                "send_during_business_hours": True,
                "timezone": "recipient_timezone"
            }
        }
    
    def _setup_trigger_conditions(self, 
                                trigger_conditions: Dict[str, Any],
                                objective: str) -> Dict[str, Any]:
        """Set up trigger conditions for workflow activation"""
        
        if objective == "lead_nurturing":
            return {
                "trigger_type": "form_submission",
                "trigger_conditions": {
                    "form_name": trigger_conditions.get("form_name", "lead_capture"),
                    "lead_source": trigger_conditions.get("lead_source", "website"),
                    "lead_score": trigger_conditions.get("min_lead_score", 50)
                },
                "exclusion_conditions": {
                    "existing_customers": True,
                    "unsubscribed": True
                }
            }
        elif objective == "onboarding":
            return {
                "trigger_type": "purchase_completion",
                "trigger_conditions": {
                    "product_type": trigger_conditions.get("product_type", "subscription"),
                    "customer_tier": trigger_conditions.get("customer_tier", "all")
                }
            }
        else:
            return {
                "trigger_type": "manual",
                "trigger_conditions": trigger_conditions
            }
    
    def process_lead_data(self, 
                         lead_data: Dict[str, Any],
                         crm_platform: str) -> LeadData:
        """Process and enrich lead data before CRM integration"""
        
        # Validate and clean lead data
        cleaned_data = self._clean_lead_data(lead_data)
        
        # Enrich lead data
        enriched_data = self._enrich_lead_data(cleaned_data)
        
        # Calculate lead score
        lead_score = self._calculate_lead_score(enriched_data)
        
        # Generate lead ID
        lead_id = f"lead_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        return LeadData(
            lead_id=lead_id,
            contact_info=enriched_data,
            lead_score=lead_score,
            source=lead_data.get("source", "unknown"),
            status="new",
            tags=self._generate_lead_tags(enriched_data)
        )
    
    def _clean_lead_data(self, lead_data: Dict[str, Any]) -> Dict[str, Any]:
        """Clean and validate lead data"""
        
        cleaned_data = {}
        
        # Clean email
        if "email" in lead_data:
            cleaned_data["email"] = lead_data["email"].lower().strip()
        
        # Clean name fields
        if "first_name" in lead_data:
            cleaned_data["first_name"] = lead_data["first_name"].strip().title()
        
        if "last_name" in lead_data:
            cleaned_data["last_name"] = lead_data["last_name"].strip().title()
        
        # Clean company
        if "company" in lead_data:
            cleaned_data["company"] = lead_data["company"].strip()
        
        # Clean phone
        if "phone" in lead_data:
            cleaned_data["phone"] = self._format_phone_number(lead_data["phone"])
        
        return cleaned_data
    
    def _format_phone_number(self, phone: str) -> str:
        """Format phone number to standard format"""
        
        # Remove all non-digit characters
        digits = ''.join(filter(str.isdigit, phone))
        
        # Format as (XXX) XXX-XXXX for US numbers
        if len(digits) == 10:
            return f"({digits[:3]}) {digits[3:6]}-{digits[6:]}"
        elif len(digits) == 11 and digits[0] == '1':
            return f"({digits[1:4]}) {digits[4:7]}-{digits[7:]}"
        else:
            return phone  # Return original if can't format
    
    def _enrich_lead_data(self, cleaned_data: Dict[str, Any]) -> Dict[str, Any]:
        """Enrich lead data with additional information"""
        
        enriched_data = cleaned_data.copy()
        
        # Add timestamp
        enriched_data["created_at"] = datetime.now().isoformat()
        
        # Add lead source if not present
        if "lead_source" not in enriched_data:
            enriched_data["lead_source"] = "website"
        
        # Add lead status
        enriched_data["lead_status"] = "new"
        
        # Add enrichment data (mock)
        if "company" in enriched_data:
            enriched_data["company_size"] = "small"  # Would be enriched from external API
            enriched_data["industry"] = "technology"  # Would be enriched from external API
        
        return enriched_data
    
    def _calculate_lead_score(self, lead_data: Dict[str, Any]) -> float:
        """Calculate lead score based on available data"""
        
        score = 0.0
        
        # Email domain score
        if "email" in lead_data:
            email_domain = lead_data["email"].split("@")[1]
            if email_domain in ["gmail.com", "yahoo.com", "hotmail.com"]:
                score += 10  # Personal email
            else:
                score += 30  # Business email
        
        # Company information
        if "company" in lead_data and lead_data["company"]:
            score += 25
        
        # Phone number
        if "phone" in lead_data and lead_data["phone"]:
            score += 20
        
        # Lead source
        lead_source = lead_data.get("lead_source", "")
        if lead_source in ["referral", "organic"]:
            score += 15
        elif lead_source in ["paid_ads", "social_media"]:
            score += 10
        
        # Industry (if available)
        if lead_data.get("industry") == "technology":
            score += 15
        
        return min(100.0, score)  # Cap at 100
    
    def _generate_lead_tags(self, lead_data: Dict[str, Any]) -> List[str]:
        """Generate relevant tags for the lead"""
        
        tags = []
        
        # Source-based tags
        if lead_data.get("lead_source"):
            tags.append(f"source_{lead_data['lead_source']}")
        
        # Industry-based tags
        if lead_data.get("industry"):
            tags.append(f"industry_{lead_data['industry']}")
        
        # Company size tags
        if lead_data.get("company_size"):
            tags.append(f"size_{lead_data['company_size']}")
        
        # Lead score tags
        lead_score = self._calculate_lead_score(lead_data)
        if lead_score >= 70:
            tags.append("high_quality")
        elif lead_score >= 40:
            tags.append("medium_quality")
        else:
            tags.append("low_quality")
        
        return tags
    
    def sync_data_with_crm(self, 
                          lead_data: LeadData,
                          crm_platform: str) -> Dict[str, Any]:
        """Sync lead data with CRM platform"""
        
        # Prepare data for CRM
        crm_data = self._prepare_crm_data(lead_data, crm_platform)
        
        # Send to CRM
        sync_result = self._send_to_crm(crm_data, crm_platform)
        
        # Update local record
        if sync_result["success"]:
            self._update_local_record(lead_data.lead_id, sync_result["crm_id"])
        
        return sync_result
    
    def _prepare_crm_data(self, lead_data: LeadData, crm_platform: str) -> Dict[str, Any]:
        """Prepare lead data for CRM platform"""
        
        # Get field mapping for the CRM platform
        field_mapping = self._configure_data_mapping(crm_platform)
        
        crm_data = {}
        
        # Map contact fields
        contact_mapping = field_mapping.get("contact_fields", {})
        for local_field, crm_field in contact_mapping.items():
            if local_field in lead_data.contact_info:
                crm_data[crm_field] = lead_data.contact_info[local_field]
        
        # Add custom fields
        crm_data["lead_score"] = lead_data.lead_score
        crm_data["lead_source"] = lead_data.source
        crm_data["tags"] = ",".join(lead_data.tags)
        
        return crm_data
    
    def _send_to_crm(self, crm_data: Dict[str, Any], crm_platform: str) -> Dict[str, Any]:
        """Send data to CRM platform"""
        
        # Mock CRM API call
        if crm_platform.lower() in ["hubspot", "salesforce", "pipedrive"]:
            return {
                "success": True,
                "crm_id": f"crm_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                "sync_timestamp": datetime.now().isoformat(),
                "platform": crm_platform
            }
        else:
            return {
                "success": False,
                "error": f"Failed to sync with {crm_platform}",
                "error_code": "UNSUPPORTED_PLATFORM"
            }
    
    def _update_local_record(self, lead_id: str, crm_id: str) -> None:
        """Update local record with CRM ID"""
        
        # In real implementation, this would update the local database
        pass
    
    def get_agent_info(self) -> Dict[str, Any]:
        """Get agent information and capabilities"""
        
        return {
            "name": self.name,
            "role": self.role,
            "expertise": self.expertise,
            "capabilities": [
                "CRM platform integration",
                "Automated workflow creation",
                "Lead data processing and enrichment",
                "Email marketing automation",
                "Data synchronization",
                "Lead scoring and segmentation",
                "Performance tracking and optimization"
            ]
        }