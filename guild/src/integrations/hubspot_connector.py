"""
HubSpot Integration Connector
Complete CRM, marketing automation, sales pipeline, and contact management.
"""

import asyncio
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
import aiohttp
import json
from enum import Enum

logger = logging.getLogger(__name__)


class HubSpotDataType(Enum):
    """Types of data available from HubSpot"""
    CONTACTS = "contacts"
    COMPANIES = "companies"
    DEALS = "deals"
    TICKETS = "tickets"
    EMAILS = "emails"
    MEETINGS = "meetings"
    TASKS = "tasks"
    PIPELINES = "pipelines"
    CAMPAIGNS = "campaigns"


@dataclass
class HubSpotCredentials:
    """HubSpot API credentials"""
    access_token: str
    refresh_token: Optional[str] = None
    token_expiry: Optional[datetime] = None
    client_id: Optional[str] = None
    client_secret: Optional[str] = None


@dataclass
class HubSpotContact:
    """Contact data from HubSpot"""
    id: str
    email: str
    firstname: Optional[str]
    lastname: Optional[str]
    phone: Optional[str]
    company: Optional[str]
    job_title: Optional[str]
    lifecycle_stage: Optional[str]
    lead_status: Optional[str]
    created_at: datetime
    updated_at: datetime
    properties: Dict[str, Any]


@dataclass
class HubSpotCompany:
    """Company data from HubSpot"""
    id: str
    name: str
    domain: Optional[str]
    industry: Optional[str]
    num_employees: Optional[int]
    annual_revenue: Optional[float]
    lifecycle_stage: Optional[str]
    created_at: datetime
    updated_at: datetime
    properties: Dict[str, Any]


@dataclass
class HubSpotDeal:
    """Deal data from HubSpot"""
    id: str
    dealname: str
    amount: float
    dealstage: str
    pipeline: str
    closedate: Optional[datetime]
    owner_id: Optional[str]
    company_id: Optional[str]
    created_at: datetime
    updated_at: datetime
    properties: Dict[str, Any]


class HubSpotConnector:
    """
    Comprehensive HubSpot integration connector.
    Handles CRM, marketing automation, sales pipeline, and analytics.
    """
    
    def __init__(self, credentials: HubSpotCredentials):
        self.credentials = credentials
        self.base_url = "https://api.hubapi.com"
        self.session: Optional[aiohttp.ClientSession] = None
        
    async def __aenter__(self):
        """Async context manager entry"""
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        if self.session:
            await self.session.close()
    
    async def _ensure_access_token(self):
        """Ensure we have a valid access token"""
        if (self.credentials.token_expiry and 
            datetime.now() >= self.credentials.token_expiry and
            self.credentials.refresh_token):
            await self._refresh_access_token()
    
    async def _refresh_access_token(self):
        """Refresh OAuth access token"""
        if not self.credentials.refresh_token or not self.credentials.client_id or not self.credentials.client_secret:
            logger.warning("Cannot refresh token: missing credentials")
            return
        
        url = f"{self.base_url}/oauth/v1/token"
        
        data = {
            "grant_type": "refresh_token",
            "client_id": self.credentials.client_id,
            "client_secret": self.credentials.client_secret,
            "refresh_token": self.credentials.refresh_token
        }
        
        if not self.session:
            self.session = aiohttp.ClientSession()
        
        async with self.session.post(url, data=data) as response:
            if response.status == 200:
                token_data = await response.json()
                self.credentials.access_token = token_data['access_token']
                self.credentials.refresh_token = token_data['refresh_token']
                expires_in = token_data.get('expires_in', 3600)
                self.credentials.token_expiry = datetime.now() + timedelta(seconds=expires_in - 60)
                logger.info("HubSpot access token refreshed successfully")
            else:
                error_text = await response.text()
                logger.error(f"Failed to refresh token: {response.status} - {error_text}")
    
    async def _get_headers(self) -> Dict[str, str]:
        """Get headers for API requests"""
        await self._ensure_access_token()
        return {
            "Authorization": f"Bearer {self.credentials.access_token}",
            "Content-Type": "application/json"
        }
    
    async def validate_connection(self) -> bool:
        """Validate HubSpot API connection"""
        try:
            url = f"{self.base_url}/crm/v3/objects/contacts?limit=1"
            headers = await self._get_headers()
            
            if not self.session:
                self.session = aiohttp.ClientSession()
            
            async with self.session.get(url, headers=headers) as response:
                if response.status == 200:
                    logger.info("HubSpot connection validated successfully")
                    return True
                else:
                    logger.error(f"HubSpot validation failed: {response.status}")
                    return False
                    
        except Exception as e:
            logger.error(f"HubSpot connection validation failed: {e}")
            return False
    
    # ============================================================================
    # CONTACT MANAGEMENT
    # ============================================================================
    
    async def get_contacts(
        self,
        limit: int = 100,
        filters: Optional[List[Dict[str, Any]]] = None,
        properties: Optional[List[str]] = None
    ) -> List[HubSpotContact]:
        """
        Get contacts from HubSpot.
        
        Args:
            limit: Maximum number to retrieve
            filters: Filter criteria
            properties: Specific properties to retrieve
        """
        try:
            url = f"{self.base_url}/crm/v3/objects/contacts"
            headers = await self._get_headers()
            
            params = {'limit': limit}
            
            if properties:
                params['properties'] = ','.join(properties)
            else:
                params['properties'] = 'email,firstname,lastname,phone,company,jobtitle,lifecyclestage,hs_lead_status'
            
            async with self.session.get(url, headers=headers, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    contacts = []
                    
                    for item in data.get('results', []):
                        props = item.get('properties', {})
                        
                        contacts.append(HubSpotContact(
                            id=item['id'],
                            email=props.get('email', ''),
                            firstname=props.get('firstname'),
                            lastname=props.get('lastname'),
                            phone=props.get('phone'),
                            company=props.get('company'),
                            job_title=props.get('jobtitle'),
                            lifecycle_stage=props.get('lifecyclestage'),
                            lead_status=props.get('hs_lead_status'),
                            created_at=datetime.fromisoformat(props.get('createdate', datetime.now().isoformat()).replace('Z', '+00:00')),
                            updated_at=datetime.fromisoformat(props.get('lastmodifieddate', datetime.now().isoformat()).replace('Z', '+00:00')),
                            properties=props
                        ))
                    
                    return contacts
                else:
                    error_text = await response.text()
                    logger.error(f"Failed to get contacts: {response.status} - {error_text}")
                    return []
                    
        except Exception as e:
            logger.error(f"Error getting HubSpot contacts: {e}")
            raise
    
    async def create_contact(
        self,
        email: str,
        firstname: Optional[str] = None,
        lastname: Optional[str] = None,
        phone: Optional[str] = None,
        company: Optional[str] = None,
        additional_properties: Optional[Dict[str, Any]] = None
    ) -> HubSpotContact:
        """Create a new contact"""
        try:
            url = f"{self.base_url}/crm/v3/objects/contacts"
            headers = await self._get_headers()
            
            properties = {'email': email}
            
            if firstname:
                properties['firstname'] = firstname
            if lastname:
                properties['lastname'] = lastname
            if phone:
                properties['phone'] = phone
            if company:
                properties['company'] = company
            
            if additional_properties:
                properties.update(additional_properties)
            
            payload = {'properties': properties}
            
            async with self.session.post(url, headers=headers, json=payload) as response:
                if response.status == 201:
                    data = await response.json()
                    props = data.get('properties', {})
                    
                    return HubSpotContact(
                        id=data['id'],
                        email=email,
                        firstname=props.get('firstname'),
                        lastname=props.get('lastname'),
                        phone=props.get('phone'),
                        company=props.get('company'),
                        job_title=props.get('jobtitle'),
                        lifecycle_stage=props.get('lifecyclestage'),
                        lead_status=props.get('hs_lead_status'),
                        created_at=datetime.now(),
                        updated_at=datetime.now(),
                        properties=props
                    )
                else:
                    error_text = await response.text()
                    raise Exception(f"Failed to create contact: {response.status} - {error_text}")
                    
        except Exception as e:
            logger.error(f"Error creating HubSpot contact: {e}")
            raise
    
    async def update_contact(
        self,
        contact_id: str,
        properties: Dict[str, Any]
    ) -> HubSpotContact:
        """Update a contact"""
        try:
            url = f"{self.base_url}/crm/v3/objects/contacts/{contact_id}"
            headers = await self._get_headers()
            
            payload = {'properties': properties}
            
            async with self.session.patch(url, headers=headers, json=payload) as response:
                if response.status == 200:
                    data = await response.json()
                    props = data.get('properties', {})
                    
                    return HubSpotContact(
                        id=data['id'],
                        email=props.get('email', ''),
                        firstname=props.get('firstname'),
                        lastname=props.get('lastname'),
                        phone=props.get('phone'),
                        company=props.get('company'),
                        job_title=props.get('jobtitle'),
                        lifecycle_stage=props.get('lifecyclestage'),
                        lead_status=props.get('hs_lead_status'),
                        created_at=datetime.fromisoformat(props.get('createdate', datetime.now().isoformat()).replace('Z', '+00:00')),
                        updated_at=datetime.now(),
                        properties=props
                    )
                else:
                    error_text = await response.text()
                    raise Exception(f"Failed to update contact: {response.status} - {error_text}")
                    
        except Exception as e:
            logger.error(f"Error updating HubSpot contact: {e}")
            raise
    
    # ============================================================================
    # COMPANY MANAGEMENT
    # ============================================================================
    
    async def get_companies(
        self,
        limit: int = 100,
        properties: Optional[List[str]] = None
    ) -> List[HubSpotCompany]:
        """Get companies from HubSpot"""
        try:
            url = f"{self.base_url}/crm/v3/objects/companies"
            headers = await self._get_headers()
            
            params = {'limit': limit}
            
            if properties:
                params['properties'] = ','.join(properties)
            else:
                params['properties'] = 'name,domain,industry,numberofemployees,annualrevenue,lifecyclestage'
            
            async with self.session.get(url, headers=headers, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    companies = []
                    
                    for item in data.get('results', []):
                        props = item.get('properties', {})
                        
                        companies.append(HubSpotCompany(
                            id=item['id'],
                            name=props.get('name', ''),
                            domain=props.get('domain'),
                            industry=props.get('industry'),
                            num_employees=int(props.get('numberofemployees', 0)) if props.get('numberofemployees') else None,
                            annual_revenue=float(props.get('annualrevenue', 0)) if props.get('annualrevenue') else None,
                            lifecycle_stage=props.get('lifecyclestage'),
                            created_at=datetime.fromisoformat(props.get('createdate', datetime.now().isoformat()).replace('Z', '+00:00')),
                            updated_at=datetime.fromisoformat(props.get('hs_lastmodifieddate', datetime.now().isoformat()).replace('Z', '+00:00')),
                            properties=props
                        ))
                    
                    return companies
                else:
                    error_text = await response.text()
                    logger.error(f"Failed to get companies: {response.status} - {error_text}")
                    return []
                    
        except Exception as e:
            logger.error(f"Error getting HubSpot companies: {e}")
            raise
    
    async def create_company(
        self,
        name: str,
        domain: Optional[str] = None,
        industry: Optional[str] = None,
        additional_properties: Optional[Dict[str, Any]] = None
    ) -> HubSpotCompany:
        """Create a new company"""
        try:
            url = f"{self.base_url}/crm/v3/objects/companies"
            headers = await self._get_headers()
            
            properties = {'name': name}
            
            if domain:
                properties['domain'] = domain
            if industry:
                properties['industry'] = industry
            
            if additional_properties:
                properties.update(additional_properties)
            
            payload = {'properties': properties}
            
            async with self.session.post(url, headers=headers, json=payload) as response:
                if response.status == 201:
                    data = await response.json()
                    props = data.get('properties', {})
                    
                    return HubSpotCompany(
                        id=data['id'],
                        name=name,
                        domain=props.get('domain'),
                        industry=props.get('industry'),
                        num_employees=None,
                        annual_revenue=None,
                        lifecycle_stage=props.get('lifecyclestage'),
                        created_at=datetime.now(),
                        updated_at=datetime.now(),
                        properties=props
                    )
                else:
                    error_text = await response.text()
                    raise Exception(f"Failed to create company: {response.status} - {error_text}")
                    
        except Exception as e:
            logger.error(f"Error creating HubSpot company: {e}")
            raise
    
    # ============================================================================
    # DEAL (SALES PIPELINE) MANAGEMENT
    # ============================================================================
    
    async def get_deals(
        self,
        limit: int = 100,
        pipeline_id: Optional[str] = None,
        properties: Optional[List[str]] = None
    ) -> List[HubSpotDeal]:
        """Get deals from HubSpot"""
        try:
            url = f"{self.base_url}/crm/v3/objects/deals"
            headers = await self._get_headers()
            
            params = {'limit': limit}
            
            if properties:
                params['properties'] = ','.join(properties)
            else:
                params['properties'] = 'dealname,amount,dealstage,pipeline,closedate,hubspot_owner_id'
            
            async with self.session.get(url, headers=headers, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    deals = []
                    
                    for item in data.get('results', []):
                        props = item.get('properties', {})
                        
                        # Filter by pipeline if specified
                        if pipeline_id and props.get('pipeline') != pipeline_id:
                            continue
                        
                        closedate = None
                        if props.get('closedate'):
                            try:
                                closedate = datetime.fromisoformat(props['closedate'].replace('Z', '+00:00'))
                            except:
                                pass
                        
                        deals.append(HubSpotDeal(
                            id=item['id'],
                            dealname=props.get('dealname', ''),
                            amount=float(props.get('amount', 0)) if props.get('amount') else 0,
                            dealstage=props.get('dealstage', ''),
                            pipeline=props.get('pipeline', 'default'),
                            closedate=closedate,
                            owner_id=props.get('hubspot_owner_id'),
                            company_id=None,  # Would need to fetch associations
                            created_at=datetime.fromisoformat(props.get('createdate', datetime.now().isoformat()).replace('Z', '+00:00')),
                            updated_at=datetime.fromisoformat(props.get('hs_lastmodifieddate', datetime.now().isoformat()).replace('Z', '+00:00')),
                            properties=props
                        ))
                    
                    return deals
                else:
                    error_text = await response.text()
                    logger.error(f"Failed to get deals: {response.status} - {error_text}")
                    return []
                    
        except Exception as e:
            logger.error(f"Error getting HubSpot deals: {e}")
            raise
    
    async def create_deal(
        self,
        dealname: str,
        amount: float,
        dealstage: str,
        pipeline: str = "default",
        closedate: Optional[datetime] = None,
        additional_properties: Optional[Dict[str, Any]] = None
    ) -> HubSpotDeal:
        """Create a new deal"""
        try:
            url = f"{self.base_url}/crm/v3/objects/deals"
            headers = await self._get_headers()
            
            properties = {
                'dealname': dealname,
                'amount': str(amount),
                'dealstage': dealstage,
                'pipeline': pipeline
            }
            
            if closedate:
                properties['closedate'] = closedate.isoformat()
            
            if additional_properties:
                properties.update(additional_properties)
            
            payload = {'properties': properties}
            
            async with self.session.post(url, headers=headers, json=payload) as response:
                if response.status == 201:
                    data = await response.json()
                    props = data.get('properties', {})
                    
                    return HubSpotDeal(
                        id=data['id'],
                        dealname=dealname,
                        amount=amount,
                        dealstage=dealstage,
                        pipeline=pipeline,
                        closedate=closedate,
                        owner_id=props.get('hubspot_owner_id'),
                        company_id=None,
                        created_at=datetime.now(),
                        updated_at=datetime.now(),
                        properties=props
                    )
                else:
                    error_text = await response.text()
                    raise Exception(f"Failed to create deal: {response.status} - {error_text}")
                    
        except Exception as e:
            logger.error(f"Error creating HubSpot deal: {e}")
            raise
    
    async def update_deal_stage(
        self,
        deal_id: str,
        new_stage: str
    ) -> HubSpotDeal:
        """Update deal stage in pipeline"""
        return await self.update_deal(deal_id, {'dealstage': new_stage})
    
    async def update_deal(
        self,
        deal_id: str,
        properties: Dict[str, Any]
    ) -> HubSpotDeal:
        """Update a deal"""
        try:
            url = f"{self.base_url}/crm/v3/objects/deals/{deal_id}"
            headers = await self._get_headers()
            
            payload = {'properties': properties}
            
            async with self.session.patch(url, headers=headers, json=payload) as response:
                if response.status == 200:
                    data = await response.json()
                    props = data.get('properties', {})
                    
                    closedate = None
                    if props.get('closedate'):
                        try:
                            closedate = datetime.fromisoformat(props['closedate'].replace('Z', '+00:00'))
                        except:
                            pass
                    
                    return HubSpotDeal(
                        id=data['id'],
                        dealname=props.get('dealname', ''),
                        amount=float(props.get('amount', 0)) if props.get('amount') else 0,
                        dealstage=props.get('dealstage', ''),
                        pipeline=props.get('pipeline', 'default'),
                        closedate=closedate,
                        owner_id=props.get('hubspot_owner_id'),
                        company_id=None,
                        created_at=datetime.fromisoformat(props.get('createdate', datetime.now().isoformat()).replace('Z', '+00:00')),
                        updated_at=datetime.now(),
                        properties=props
                    )
                else:
                    error_text = await response.text()
                    raise Exception(f"Failed to update deal: {response.status} - {error_text}")
                    
        except Exception as e:
            logger.error(f"Error updating HubSpot deal: {e}")
            raise
    
    # ============================================================================
    # EMAIL & ACTIVITY TRACKING
    # ============================================================================
    
    async def get_email_history(
        self,
        contact_id: str,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """Get email history for a contact"""
        try:
            url = f"{self.base_url}/crm/v3/objects/contacts/{contact_id}/associations/emails"
            headers = await self._get_headers()
            
            params = {'limit': limit}
            
            async with self.session.get(url, headers=headers, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    return data.get('results', [])
                else:
                    error_text = await response.text()
                    logger.error(f"Failed to get email history: {response.status} - {error_text}")
                    return []
                    
        except Exception as e:
            logger.error(f"Error getting email history: {e}")
            raise
    
    async def get_activities(
        self,
        contact_id: str,
        activity_type: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Get activities (calls, meetings, tasks) for a contact"""
        try:
            # Get all activity associations
            activities = []
            
            for activity in ['meetings', 'calls', 'tasks']:
                if activity_type and activity != activity_type:
                    continue
                
                url = f"{self.base_url}/crm/v3/objects/contacts/{contact_id}/associations/{activity}"
                headers = await self._get_headers()
                
                async with self.session.get(url, headers=headers) as response:
                    if response.status == 200:
                        data = await response.json()
                        for item in data.get('results', []):
                            item['activity_type'] = activity
                            activities.append(item)
            
            return activities
                    
        except Exception as e:
            logger.error(f"Error getting activities: {e}")
            raise
    
    # ============================================================================
    # ANALYTICS & REPORTING
    # ============================================================================
    
    async def get_pipeline_metrics(
        self,
        pipeline_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Get sales pipeline metrics"""
        deals = await self.get_deals(pipeline_id=pipeline_id)
        
        total_value = sum(deal.amount for deal in deals)
        by_stage = {}
        
        for deal in deals:
            if deal.dealstage not in by_stage:
                by_stage[deal.dealstage] = {
                    'count': 0,
                    'total_value': 0,
                    'deals': []
                }
            
            by_stage[deal.dealstage]['count'] += 1
            by_stage[deal.dealstage]['total_value'] += deal.amount
            by_stage[deal.dealstage]['deals'].append(deal.id)
        
        return {
            'total_deals': len(deals),
            'total_pipeline_value': total_value,
            'average_deal_size': total_value / len(deals) if deals else 0,
            'by_stage': by_stage,
            'pipeline_id': pipeline_id or 'all'
        }
    
    async def get_contact_metrics(self) -> Dict[str, Any]:
        """Get contact metrics"""
        contacts = await self.get_contacts(limit=1000)
        
        by_lifecycle = {}
        by_lead_status = {}
        
        for contact in contacts:
            # By lifecycle stage
            stage = contact.lifecycle_stage or 'unknown'
            by_lifecycle[stage] = by_lifecycle.get(stage, 0) + 1
            
            # By lead status
            status = contact.lead_status or 'unknown'
            by_lead_status[status] = by_lead_status.get(status, 0) + 1
        
        return {
            'total_contacts': len(contacts),
            'by_lifecycle_stage': by_lifecycle,
            'by_lead_status': by_lead_status
        }

