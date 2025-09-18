"""
Email Marketing Platform Integrations

Comprehensive integration with Mailchimp, ConvertKit, ActiveCampaign, 
GoHighLevel (GHL), Systeme.io, and SendGrid APIs for Customer Success 
and Feedback Agents.
"""

import asyncio
import aiohttp
import json
import base64
from typing import Dict, Any, List, Optional, Union
from datetime import datetime, date, timedelta
from dataclasses import dataclass, asdict
from enum import Enum
from guild.src.core.config import settings
from guild.src.utils.logging_utils import get_logger

logger = get_logger(__name__)

class EmailPlatform(Enum):
    MAILCHIMP = "mailchimp"
    CONVERTKIT = "convertkit"
    ACTIVECAMPAIGN = "activecampaign"
    GOHIGHLEVEL = "gohighlevel"
    SYSTEME_IO = "systeme_io"
    SENDGRID = "sendgrid"

class CampaignStatus(Enum):
    SAVED = "saved"
    PAUSED = "paused"
    SCHEDULED = "scheduled"
    SENDING = "sending"
    SENT = "sent"
    CANCELED = "canceled"

class AutomationTrigger(Enum):
    SUBSCRIBE = "subscribe"
    TAG_ADDED = "tag_added"
    PURCHASE = "purchase"
    DATE = "date"
    WEBHOOK = "webhook"
    LINK_CLICKED = "link_clicked"
    EMAIL_OPENED = "email_opened"

@dataclass
class EmailCredentials:
    """Credentials for email marketing platforms"""
    platform: EmailPlatform
    api_key: str
    api_secret: Optional[str] = None
    server_prefix: Optional[str] = None  # For Mailchimp
    account_id: Optional[str] = None  # For GoHighLevel
    username: Optional[str] = None  # For ActiveCampaign
    expires_at: Optional[datetime] = None

@dataclass
class EmailCampaign:
    """Standardized email campaign format"""
    id: str
    name: str
    subject: str
    content: str
    status: CampaignStatus
    recipients: int
    sent_count: int
    open_rate: float
    click_rate: float
    unsubscribe_rate: float
    created_at: datetime
    scheduled_at: Optional[datetime]
    sent_at: Optional[datetime]
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}

@dataclass
class EmailSubscriber:
    """Standardized email subscriber format"""
    id: str
    email: str
    first_name: Optional[str]
    last_name: Optional[str]
    tags: List[str]
    status: str  # subscribed, unsubscribed, bounced, etc.
    created_at: datetime
    last_activity: Optional[datetime]
    custom_fields: Dict[str, Any]
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}

@dataclass
class EmailAutomation:
    """Standardized email automation format"""
    id: str
    name: str
    status: str
    trigger: AutomationTrigger
    trigger_conditions: Dict[str, Any]
    steps: List[Dict[str, Any]]
    subscribers_count: int
    conversion_rate: float
    created_at: datetime
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}

class MailchimpConnector:
    """Mailchimp API connector for email marketing"""
    
    def __init__(self, credentials: EmailCredentials):
        self.credentials = credentials
        self.server_prefix = credentials.server_prefix
        if not self.server_prefix:
            raise ValueError("Mailchimp server prefix required")
        
        self.base_url = f"https://{self.server_prefix}.api.mailchimp.com/3.0"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None) -> Dict:
        """Make authenticated request to Mailchimp API"""
        try:
            url = f"{self.base_url}/{endpoint}"
            auth = base64.b64encode(f"anystring:{self.credentials.api_key}".encode()).decode()
            headers = {
                'Authorization': f'Basic {auth}',
                'Content-Type': 'application/json'
            }
            
            async with self.session.request(method, url, json=data, headers=headers) as response:
                response.raise_for_status()
                return await response.json()
                
        except Exception as e:
            logger.error(f"Mailchimp API request failed: {e}")
            raise
    
    async def get_lists(self) -> List[Dict[str, Any]]:
        """Get all mailing lists"""
        endpoint = "lists"
        params = {"count": 100}
        
        response = await self._make_request(endpoint, params=params)
        return response.get('lists', [])
    
    async def get_campaigns(self) -> List[EmailCampaign]:
        """Get all email campaigns"""
        endpoint = "campaigns"
        params = {"count": 100, "status": "sent,scheduled,sending"}
        
        response = await self._make_request(endpoint, params=params)
        campaigns = []
        
        for campaign in response.get('campaigns', []):
            campaign_data = EmailCampaign(
                id=campaign['id'],
                name=campaign['settings']['title'],
                subject=campaign['settings']['subject_line'],
                content=campaign.get('content', {}).get('html', ''),
                status=CampaignStatus(campaign['status']),
                recipients=campaign['recipients']['recipient_count'],
                sent_count=campaign.get('emails_sent', 0),
                open_rate=campaign.get('report_summary', {}).get('open_rate', 0),
                click_rate=campaign.get('report_summary', {}).get('click_rate', 0),
                unsubscribe_rate=campaign.get('report_summary', {}).get('unsub_rate', 0),
                created_at=datetime.fromisoformat(campaign['create_time'].replace('Z', '+00:00')),
                scheduled_at=datetime.fromisoformat(campaign['send_time'].replace('Z', '+00:00')) if campaign.get('send_time') else None,
                sent_at=datetime.fromisoformat(campaign['send_time'].replace('Z', '+00:00')) if campaign.get('send_time') and campaign['status'] == 'sent' else None,
                metadata={"raw_data": campaign}
            )
            campaigns.append(campaign_data)
        
        return campaigns
    
    async def create_campaign(self, 
                            name: str,
                            subject: str,
                            content: str,
                            list_id: str,
                            from_name: str,
                            from_email: str,
                            reply_to: str = None) -> EmailCampaign:
        """Create a new email campaign"""
        endpoint = "campaigns"
        
        data = {
            "type": "regular",
            "recipients": {"list_id": list_id},
            "settings": {
                "subject_line": subject,
                "title": name,
                "from_name": from_name,
                "reply_to": reply_to or from_email,
                "to_name": "*|FNAME|*"
            },
            "content_type": "html",
            "content": {"html": content}
        }
        
        response = await self._make_request(endpoint, method='POST', data=data)
        
        campaign_data = EmailCampaign(
            id=response['id'],
            name=name,
            subject=subject,
            content=content,
            status=CampaignStatus.SAVED,
            recipients=0,
            sent_count=0,
            open_rate=0.0,
            click_rate=0.0,
            unsubscribe_rate=0.0,
            created_at=datetime.now(),
            scheduled_at=None,
            sent_at=None,
            metadata={"created_via_api": True, "raw_response": response}
        )
        
        return campaign_data
    
    async def get_subscribers(self, list_id: str, count: int = 100) -> List[EmailSubscriber]:
        """Get subscribers from a list"""
        endpoint = f"lists/{list_id}/members"
        params = {"count": count}
        
        response = await self._make_request(endpoint, params=params)
        subscribers = []
        
        for member in response.get('members', []):
            subscriber_data = EmailSubscriber(
                id=member['id'],
                email=member['email_address'],
                first_name=member.get('merge_fields', {}).get('FNAME'),
                last_name=member.get('merge_fields', {}).get('LNAME'),
                tags=[tag['name'] for tag in member.get('tags', [])],
                status=member['status'],
                created_at=datetime.fromisoformat(member['timestamp_signup'].replace('Z', '+00:00')),
                last_activity=datetime.fromisoformat(member['last_changed'].replace('Z', '+00:00')) if member.get('last_changed') else None,
                custom_fields=member.get('merge_fields', {}),
                metadata={"raw_data": member}
            )
            subscribers.append(subscriber_data)
        
        return subscribers
    
    async def add_subscriber(self, 
                           list_id: str,
                           email: str,
                           first_name: str = None,
                           last_name: str = None,
                           tags: List[str] = None,
                           custom_fields: Dict[str, Any] = None) -> EmailSubscriber:
        """Add a new subscriber to a list"""
        endpoint = f"lists/{list_id}/members"
        
        merge_fields = {}
        if first_name:
            merge_fields['FNAME'] = first_name
        if last_name:
            merge_fields['LNAME'] = last_name
        if custom_fields:
            merge_fields.update(custom_fields)
        
        data = {
            "email_address": email,
            "status": "subscribed",
            "merge_fields": merge_fields,
            "tags": tags or []
        }
        
        response = await self._make_request(endpoint, method='POST', data=data)
        
        subscriber_data = EmailSubscriber(
            id=response['id'],
            email=email,
            first_name=first_name,
            last_name=last_name,
            tags=tags or [],
            status="subscribed",
            created_at=datetime.now(),
            last_activity=datetime.now(),
            custom_fields=custom_fields or {},
            metadata={"created_via_api": True, "raw_response": response}
        )
        
        return subscriber_data
    
    async def get_automations(self) -> List[EmailAutomation]:
        """Get email automations"""
        endpoint = "automations"
        params = {"count": 100}
        
        response = await self._make_request(endpoint, params=params)
        automations = []
        
        for automation in response.get('automations', []):
            automation_data = EmailAutomation(
                id=automation['id'],
                name=automation['settings']['title'],
                status=automation['status'],
                trigger=AutomationTrigger.WEBHOOK,  # Mailchimp has different trigger types
                trigger_conditions={},
                steps=[],  # Would need additional API call to get steps
                subscribers_count=automation.get('recipients', {}).get('total_recipients', 0),
                conversion_rate=0.0,  # Would need additional calculation
                created_at=datetime.fromisoformat(automation['create_time'].replace('Z', '+00:00')),
                metadata={"raw_data": automation}
            )
            automations.append(automation_data)
        
        return automations
    
    async def validate_connection(self) -> bool:
        """Validate Mailchimp API connection"""
        try:
            await self._make_request("")
            return True
        except Exception as e:
            logger.error(f"Mailchimp connection validation failed: {e}")
            return False

class ConvertKitConnector:
    """ConvertKit API connector for creator-focused email marketing"""
    
    def __init__(self, credentials: EmailCredentials):
        self.credentials = credentials
        self.base_url = "https://api.convertkit.com/v3"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None) -> Dict:
        """Make authenticated request to ConvertKit API"""
        try:
            url = f"{self.base_url}/{endpoint}"
            params = {"api_secret": self.credentials.api_key}
            
            async with self.session.request(method, url, json=data, params=params) as response:
                response.raise_for_status()
                return await response.json()
                
        except Exception as e:
            logger.error(f"ConvertKit API request failed: {e}")
            raise
    
    async def get_forms(self) -> List[Dict[str, Any]]:
        """Get all forms"""
        endpoint = "forms"
        response = await self._make_request(endpoint)
        return response.get('forms', [])
    
    async def get_sequences(self) -> List[Dict[str, Any]]:
        """Get email sequences"""
        endpoint = "sequences"
        response = await self._make_request(endpoint)
        return response.get('sequences', [])
    
    async def get_subscribers(self, form_id: str = None, sequence_id: str = None, count: int = 100) -> List[EmailSubscriber]:
        """Get subscribers"""
        if form_id:
            endpoint = f"forms/{form_id}/subscriptions"
        elif sequence_id:
            endpoint = f"sequences/{sequence_id}/subscriptions"
        else:
            endpoint = "subscribers"
        
        params = {"api_secret": self.credentials.api_key}
        response = await self._make_request(endpoint, params=params)
        
        subscribers = []
        for subscriber in response.get('subscriptions', []):
            subscriber_data = EmailSubscriber(
                id=str(subscriber['id']),
                email=subscriber['email'],
                first_name=subscriber.get('first_name'),
                last_name=subscriber.get('last_name'),
                tags=subscriber.get('tags', []),
                status=subscriber.get('state', 'active'),
                created_at=datetime.fromisoformat(subscriber['created_at'].replace('Z', '+00:00')),
                last_activity=datetime.fromisoformat(subscriber['updated_at'].replace('Z', '+00:00')) if subscriber.get('updated_at') else None,
                custom_fields=subscriber.get('fields', {}),
                metadata={"raw_data": subscriber}
            )
            subscribers.append(subscriber_data)
        
        return subscribers
    
    async def add_subscriber(self, 
                           email: str,
                           form_id: str = None,
                           first_name: str = None,
                           tags: List[str] = None,
                           custom_fields: Dict[str, Any] = None) -> EmailSubscriber:
        """Add a new subscriber"""
        if form_id:
            endpoint = f"forms/{form_id}/subscribe"
        else:
            endpoint = "subscribers"
        
        data = {
            "api_secret": self.credentials.api_key,
            "email": email,
            "first_name": first_name,
            "tags": tags or [],
            "fields": custom_fields or {}
        }
        
        response = await self._make_request(endpoint, method='POST', data=data)
        
        subscriber_data = EmailSubscriber(
            id=str(response.get('subscription', {}).get('id', '')),
            email=email,
            first_name=first_name,
            last_name=None,
            tags=tags or [],
            status="active",
            created_at=datetime.now(),
            last_activity=datetime.now(),
            custom_fields=custom_fields or {},
            metadata={"created_via_api": True, "raw_response": response}
        )
        
        return subscriber_data
    
    async def validate_connection(self) -> bool:
        """Validate ConvertKit API connection"""
        try:
            await self._make_request("account")
            return True
        except Exception as e:
            logger.error(f"ConvertKit connection validation failed: {e}")
            return False

class ActiveCampaignConnector:
    """ActiveCampaign API connector for marketing automation"""
    
    def __init__(self, credentials: EmailCredentials):
        self.credentials = credentials
        self.base_url = credentials.api_key  # ActiveCampaign uses full URL as API key
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None) -> Dict:
        """Make authenticated request to ActiveCampaign API"""
        try:
            url = f"{self.base_url}/api/3/{endpoint}"
            auth = base64.b64encode(f"{self.credentials.username}:{self.credentials.api_secret}".encode()).decode()
            headers = {
                'Authorization': f'Basic {auth}',
                'Content-Type': 'application/json'
            }
            
            async with self.session.request(method, url, json=data, headers=headers) as response:
                response.raise_for_status()
                return await response.json()
                
        except Exception as e:
            logger.error(f"ActiveCampaign API request failed: {e}")
            raise
    
    async def get_contacts(self, count: int = 100) -> List[EmailSubscriber]:
        """Get all contacts"""
        endpoint = "contacts"
        params = {"limit": count}
        
        response = await self._make_request(endpoint, params=params)
        contacts = []
        
        for contact in response.get('contacts', []):
            contact_data = EmailSubscriber(
                id=str(contact['id']),
                email=contact['email'],
                first_name=contact.get('firstName'),
                last_name=contact.get('lastName'),
                tags=[tag['tag'] for tag in contact.get('tags', [])],
                status="active" if contact.get('status') == 1 else "inactive",
                created_at=datetime.fromisoformat(contact['cdate'].replace('Z', '+00:00')),
                last_activity=datetime.fromisoformat(contact['udate'].replace('Z', '+00:00')) if contact.get('udate') else None,
                custom_fields=contact.get('fields', {}),
                metadata={"raw_data": contact}
            )
            contacts.append(contact_data)
        
        return contacts
    
    async def get_campaigns(self) -> List[EmailCampaign]:
        """Get all campaigns"""
        endpoint = "campaigns"
        params = {"limit": 100}
        
        response = await self._make_request(endpoint, params=params)
        campaigns = []
        
        for campaign in response.get('campaigns', []):
            campaign_data = EmailCampaign(
                id=str(campaign['id']),
                name=campaign['name'],
                subject=campaign.get('subject', ''),
                content=campaign.get('htmlContent', ''),
                status=CampaignStatus.SENT if campaign.get('status') == 1 else CampaignStatus.SAVED,
                recipients=campaign.get('recipients', 0),
                sent_count=campaign.get('sentcount', 0),
                open_rate=0.0,  # Would need separate API call
                click_rate=0.0,  # Would need separate API call
                unsubscribe_rate=0.0,  # Would need separate API call
                created_at=datetime.fromisoformat(campaign['cdate'].replace('Z', '+00:00')),
                scheduled_at=None,
                sent_at=datetime.fromisoformat(campaign['udate'].replace('Z', '+00:00')) if campaign.get('status') == 1 else None,
                metadata={"raw_data": campaign}
            )
            campaigns.append(campaign_data)
        
        return campaigns
    
    async def create_contact(self, 
                           email: str,
                           first_name: str = None,
                           last_name: str = None,
                           tags: List[str] = None,
                           custom_fields: Dict[str, Any] = None) -> EmailSubscriber:
        """Create a new contact"""
        endpoint = "contacts"
        
        data = {
            "contact": {
                "email": email,
                "firstName": first_name,
                "lastName": last_name,
                "tags": ",".join(tags) if tags else ""
            }
        }
        
        if custom_fields:
            data["contact"]["fieldValues"] = [
                {"field": key, "value": value} for key, value in custom_fields.items()
            ]
        
        response = await self._make_request(endpoint, method='POST', data=data)
        
        contact_data = EmailSubscriber(
            id=str(response['contact']['id']),
            email=email,
            first_name=first_name,
            last_name=last_name,
            tags=tags or [],
            status="active",
            created_at=datetime.now(),
            last_activity=datetime.now(),
            custom_fields=custom_fields or {},
            metadata={"created_via_api": True, "raw_response": response}
        )
        
        return contact_data
    
    async def validate_connection(self) -> bool:
        """Validate ActiveCampaign API connection"""
        try:
            await self._make_request("users")
            return True
        except Exception as e:
            logger.error(f"ActiveCampaign connection validation failed: {e}")
            return False

class SendGridConnector:
    """SendGrid API connector for transactional emails"""
    
    def __init__(self, credentials: EmailCredentials):
        self.credentials = credentials
        self.base_url = "https://api.sendgrid.com/v3"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None) -> Dict:
        """Make authenticated request to SendGrid API"""
        try:
            url = f"{self.base_url}/{endpoint}"
            headers = {
                'Authorization': f'Bearer {self.credentials.api_key}',
                'Content-Type': 'application/json'
            }
            
            async with self.session.request(method, url, json=data, headers=headers) as response:
                response.raise_for_status()
                return await response.json()
                
        except Exception as e:
            logger.error(f"SendGrid API request failed: {e}")
            return {}
    
    async def send_email(self, 
                        to_email: str,
                        subject: str,
                        content: str,
                        from_email: str,
                        from_name: str = None) -> Dict[str, Any]:
        """Send a transactional email"""
        endpoint = "mail/send"
        
        data = {
            "personalizations": [
                {
                    "to": [{"email": to_email}],
                    "subject": subject
                }
            ],
            "from": {
                "email": from_email,
                "name": from_name or from_email
            },
            "content": [
                {
                    "type": "text/html",
                    "value": content
                }
            ]
        }
        
        response = await self._make_request(endpoint, method='POST', data=data)
        return response
    
    async def get_email_activity(self, start_date: date, end_date: date) -> Dict[str, Any]:
        """Get email activity statistics"""
        endpoint = "stats"
        params = {
            "start_date": start_date.strftime('%Y-%m-%d'),
            "end_date": end_date.strftime('%Y-%m-%d'),
            "aggregated_by": "day"
        }
        
        response = await self._make_request(endpoint, params=params)
        return response
    
    async def validate_connection(self) -> bool:
        """Validate SendGrid API connection"""
        try:
            await self._make_request("user/account")
            return True
        except Exception as e:
            logger.error(f"SendGrid connection validation failed: {e}")
            return False

class EmailMarketingManager:
    """Manager for multiple email marketing platform integrations"""
    
    def __init__(self):
        self.connectors: Dict[EmailPlatform, Any] = {}
    
    def add_platform(self, platform: EmailPlatform, credentials: EmailCredentials):
        """Add an email marketing platform connector"""
        if platform == EmailPlatform.MAILCHIMP:
            self.connectors[platform] = MailchimpConnector(credentials)
        elif platform == EmailPlatform.CONVERTKIT:
            self.connectors[platform] = ConvertKitConnector(credentials)
        elif platform == EmailPlatform.ACTIVECAMPAIGN:
            self.connectors[platform] = ActiveCampaignConnector(credentials)
        elif platform == EmailPlatform.SENDGRID:
            self.connectors[platform] = SendGridConnector(credentials)
        
        logger.info(f"Added {platform.value} connector")
    
    async def send_cross_platform_campaign(self, 
                                         platforms: List[EmailPlatform],
                                         campaign_config: Dict[str, Any]) -> Dict[str, Any]:
        """Send campaign across multiple platforms"""
        results = {}
        
        for platform in platforms:
            if platform in self.connectors:
                try:
                    connector = self.connectors[platform]
                    
                    async with connector:
                        if platform == EmailPlatform.SENDGRID:
                            # SendGrid is for transactional emails
                            result = await connector.send_email(
                                to_email=campaign_config['to_email'],
                                subject=campaign_config['subject'],
                                content=campaign_config['content'],
                                from_email=campaign_config['from_email'],
                                from_name=campaign_config.get('from_name')
                            )
                        else:
                            # Other platforms create campaigns
                            result = await connector.create_campaign(
                                name=campaign_config['name'],
                                subject=campaign_config['subject'],
                                content=campaign_config['content'],
                                list_id=campaign_config.get('list_id', ''),
                                from_name=campaign_config.get('from_name', ''),
                                from_email=campaign_config.get('from_email', '')
                            )
                        
                        results[platform.value] = result
                        
                except Exception as e:
                    logger.error(f"Error sending campaign on {platform.value}: {e}")
                    results[platform.value] = {"error": str(e)}
        
        return results
    
    async def get_unified_subscriber_analytics(self, 
                                             platforms: List[EmailPlatform],
                                             start_date: date,
                                             end_date: date) -> Dict[str, Any]:
        """Get unified subscriber analytics across platforms"""
        analytics = {}
        
        for platform in platforms:
            if platform in self.connectors:
                try:
                    connector = self.connectors[platform]
                    
                    async with connector:
                        if platform == EmailPlatform.MAILCHIMP:
                            campaigns = await connector.get_campaigns()
                            total_sent = sum(c.sent_count for c in campaigns)
                            total_opens = sum(c.sent_count * c.open_rate for c in campaigns)
                            total_clicks = sum(c.sent_count * c.click_rate for c in campaigns)
                            
                            analytics[platform.value] = {
                                "total_campaigns": len(campaigns),
                                "total_sent": total_sent,
                                "total_opens": total_opens,
                                "total_clicks": total_clicks,
                                "avg_open_rate": total_opens / total_sent if total_sent > 0 else 0,
                                "avg_click_rate": total_clicks / total_sent if total_sent > 0 else 0
                            }
                        else:
                            # Other platforms would have similar analytics
                            analytics[platform.value] = {
                                "total_campaigns": 0,
                                "total_sent": 0,
                                "total_opens": 0,
                                "total_clicks": 0,
                                "avg_open_rate": 0,
                                "avg_click_rate": 0
                            }
                            
                except Exception as e:
                    logger.error(f"Error getting analytics from {platform.value}: {e}")
        
        return analytics
    
    async def validate_all_connections(self) -> Dict[EmailPlatform, bool]:
        """Validate connections to all email platforms"""
        results = {}
        
        for platform, connector in self.connectors.items():
            try:
                async with connector:
                    is_valid = await connector.validate_connection()
                    results[platform] = is_valid
            except Exception as e:
                logger.error(f"Error validating {platform.value} connection: {e}")
                results[platform] = False
        
        return results

# Global email marketing manager
email_marketing_manager = EmailMarketingManager()

# Convenience functions
def add_email_credentials(platform: str, 
                         api_key: str,
                         api_secret: str = None,
                         server_prefix: str = None,
                         username: str = None):
    """Add email marketing platform credentials"""
    credentials = EmailCredentials(
        platform=EmailPlatform(platform),
        api_key=api_key,
        api_secret=api_secret,
        server_prefix=server_prefix,
        username=username
    )
    email_marketing_manager.add_platform(credentials.platform, credentials)

async def send_email_campaign(platforms: List[str], campaign_config: Dict[str, Any]):
    """Send campaign across multiple email platforms"""
    platform_enums = [EmailPlatform(platform) for platform in platforms]
    return await email_marketing_manager.send_cross_platform_campaign(platform_enums, campaign_config)

async def get_email_analytics(platforms: List[str], start_date: date, end_date: date):
    """Get analytics from multiple email platforms"""
    platform_enums = [EmailPlatform(platform) for platform in platforms]
    return await email_marketing_manager.get_unified_subscriber_analytics(platform_enums, start_date, end_date)
