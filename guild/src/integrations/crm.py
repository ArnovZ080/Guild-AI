"""
CRM Platform Integrations

Comprehensive integration with HubSpot, Salesforce, Pipedrive, Zoho CRM, Keap, Close, Freshsales, and GoHighLevel APIs
for Customer Relations and Sales Agents.
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

class CRMPlatform(Enum):
    HUBSPOT = "hubspot"
    SALESFORCE = "salesforce"
    PIPEDRIVE = "pipedrive"
    ZOHO_CRM = "zoho_crm"
    KEAP = "keap"
    CLOSE = "close"
    FRESHSALES = "freshsales"
    GOHIGHLEVEL = "gohighlevel"

class LeadStatus(Enum):
    NEW = "new"
    CONTACTED = "contacted"
    QUALIFIED = "qualified"
    UNQUALIFIED = "unqualified"
    WON = "won"
    LOST = "lost"

@dataclass
class CRMCredentials:
    """Credentials for CRM platforms"""
    platform: CRMPlatform
    api_key: str
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    instance_url: Optional[str] = None
    domain: Optional[str] = None
    expires_at: Optional[datetime] = None

@dataclass
class Contact:
    """Standardized contact format"""
    id: str
    email: str
    first_name: str
    last_name: str
    phone: Optional[str]
    company: Optional[str]
    title: Optional[str]
    status: LeadStatus
    tags: List[str]
    created_at: datetime
    updated_at: datetime
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}

@dataclass
class Deal:
    """Standardized deal format"""
    id: str
    title: str
    amount: float
    currency: str
    stage: str
    status: str
    contact_id: str
    owner_id: str
    probability: float
    expected_close_date: Optional[date]
    created_at: datetime
    updated_at: datetime
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}

class HubSpotConnector:
    """HubSpot API connector"""
    
    def __init__(self, credentials: CRMCredentials):
        self.credentials = credentials
        self.base_url = "https://api.hubapi.com"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None) -> Dict:
        """Make authenticated request to HubSpot API"""
        try:
            url = f"{self.base_url}/{endpoint}"
            headers = {
                'Authorization': f'Bearer {self.credentials.access_token}',
                'Content-Type': 'application/json'
            }
            
            async with self.session.request(method, url, json=data, headers=headers) as response:
                response.raise_for_status()
                return await response.json()
                
        except Exception as e:
            logger.error(f"HubSpot API request failed: {e}")
            raise
    
    async def get_contacts(self, limit: int = 100) -> List[Contact]:
        """Get contacts from HubSpot"""
        endpoint = f"crm/v3/objects/contacts?limit={limit}"
        response = await self._make_request(endpoint)
        
        contacts = []
        for contact_data in response.get('results', []):
            properties = contact_data.get('properties', {})
            contact = Contact(
                id=contact_data['id'],
                email=properties.get('email', ''),
                first_name=properties.get('firstname', ''),
                last_name=properties.get('lastname', ''),
                phone=properties.get('phone'),
                company=properties.get('company'),
                title=properties.get('jobtitle'),
                status=LeadStatus.NEW,
                tags=[],
                created_at=datetime.fromisoformat(properties.get('createdate', datetime.now().isoformat()).replace('Z', '+00:00')),
                updated_at=datetime.fromisoformat(properties.get('lastmodifieddate', datetime.now().isoformat()).replace('Z', '+00:00')),
                metadata={'hubspot_data': contact_data}
            )
            contacts.append(contact)
        return contacts
    
    async def create_contact(self, email: str, first_name: str = '', last_name: str = '', **kwargs) -> Contact:
        """Create a contact in HubSpot"""
        endpoint = "crm/v3/objects/contacts"
        data = {
            'properties': {
                'email': email,
                'firstname': first_name,
                'lastname': last_name,
                **kwargs
            }
        }
        
        response = await self._make_request(endpoint, method='POST', data=data)
        properties = response.get('properties', {})
        
        return Contact(
            id=response['id'],
            email=properties.get('email', ''),
            first_name=properties.get('firstname', ''),
            last_name=properties.get('lastname', ''),
            phone=properties.get('phone'),
            company=properties.get('company'),
            title=properties.get('jobtitle'),
            status=LeadStatus.NEW,
            tags=[],
            created_at=datetime.now(),
            updated_at=datetime.now(),
            metadata={'hubspot_data': response}
        )
    
    async def get_deals(self, limit: int = 100) -> List[Deal]:
        """Get deals from HubSpot"""
        endpoint = f"crm/v3/objects/deals?limit={limit}"
        response = await self._make_request(endpoint)
        
        deals = []
        for deal_data in response.get('results', []):
            properties = deal_data.get('properties', {})
            deal = Deal(
                id=deal_data['id'],
                title=properties.get('dealname', ''),
                amount=float(properties.get('amount', 0)),
                currency='USD',
                stage=properties.get('dealstage', ''),
                status=properties.get('hs_deal_stage_probability', ''),
                contact_id='',
                owner_id=properties.get('hubspot_owner_id', ''),
                probability=float(properties.get('hs_deal_stage_probability', 0)),
                expected_close_date=None,
                created_at=datetime.fromisoformat(properties.get('createdate', datetime.now().isoformat()).replace('Z', '+00:00')),
                updated_at=datetime.fromisoformat(properties.get('hs_lastmodifieddate', datetime.now().isoformat()).replace('Z', '+00:00')),
                metadata={'hubspot_data': deal_data}
            )
            deals.append(deal)
        return deals
    
    async def validate_connection(self) -> bool:
        """Validate HubSpot API connection"""
        try:
            await self._make_request("crm/v3/objects/contacts?limit=1")
            return True
        except Exception as e:
            logger.error(f"HubSpot connection validation failed: {e}")
            return False

class SalesforceConnector:
    """Salesforce API connector"""
    
    def __init__(self, credentials: CRMCredentials):
        self.credentials = credentials
        self.base_url = f"{credentials.instance_url}/services/data/v58.0"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None) -> Dict:
        """Make authenticated request to Salesforce API"""
        try:
            url = f"{self.base_url}/{endpoint}"
            headers = {
                'Authorization': f'Bearer {self.credentials.access_token}',
                'Content-Type': 'application/json'
            }
            
            async with self.session.request(method, url, json=data, headers=headers) as response:
                response.raise_for_status()
                return await response.json()
                
        except Exception as e:
            logger.error(f"Salesforce API request failed: {e}")
            raise
    
    async def get_contacts(self) -> List[Contact]:
        """Get contacts from Salesforce"""
        endpoint = "query?q=SELECT Id, Email, FirstName, LastName, Phone, Title, Company FROM Contact LIMIT 100"
        response = await self._make_request(endpoint)
        
        contacts = []
        for record in response.get('records', []):
            contact = Contact(
                id=record['Id'],
                email=record.get('Email', ''),
                first_name=record.get('FirstName', ''),
                last_name=record.get('LastName', ''),
                phone=record.get('Phone'),
                company=record.get('Company'),
                title=record.get('Title'),
                status=LeadStatus.NEW,
                tags=[],
                created_at=datetime.now(),
                updated_at=datetime.now(),
                metadata={'salesforce_data': record}
            )
            contacts.append(contact)
        return contacts
    
    async def create_contact(self, email: str, first_name: str = '', last_name: str = '') -> Contact:
        """Create a contact in Salesforce"""
        endpoint = "sobjects/Contact"
        data = {
            'Email': email,
            'FirstName': first_name,
            'LastName': last_name
        }
        
        response = await self._make_request(endpoint, method='POST', data=data)
        
        return Contact(
            id=response['id'],
            email=email,
            first_name=first_name,
            last_name=last_name,
            phone=None,
            company=None,
            title=None,
            status=LeadStatus.NEW,
            tags=[],
            created_at=datetime.now(),
            updated_at=datetime.now(),
            metadata={'salesforce_data': response}
        )
    
    async def validate_connection(self) -> bool:
        """Validate Salesforce API connection"""
        try:
            await self._make_request("limits")
            return True
        except Exception as e:
            logger.error(f"Salesforce connection validation failed: {e}")
            return False

class PipedriveConnector:
    """Pipedrive API connector"""
    
    def __init__(self, credentials: CRMCredentials):
        self.credentials = credentials
        self.base_url = "https://api.pipedrive.com/v1"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None) -> Dict:
        """Make authenticated request to Pipedrive API"""
        try:
            url = f"{self.base_url}/{endpoint}"
            params = {'api_token': self.credentials.api_key}
            
            async with self.session.request(method, url, params=params, json=data) as response:
                response.raise_for_status()
                return await response.json()
                
        except Exception as e:
            logger.error(f"Pipedrive API request failed: {e}")
            raise
    
    async def get_persons(self) -> List[Contact]:
        """Get persons from Pipedrive"""
        endpoint = "persons"
        response = await self._make_request(endpoint)
        
        contacts = []
        for person in response.get('data', []):
            contact = Contact(
                id=str(person['id']),
                email=person.get('email', [{}])[0].get('value', '') if person.get('email') else '',
                first_name=person.get('first_name', ''),
                last_name=person.get('last_name', ''),
                phone=person.get('phone', [{}])[0].get('value') if person.get('phone') else None,
                company=person.get('org_name'),
                title=None,
                status=LeadStatus.NEW,
                tags=[],
                created_at=datetime.fromisoformat(person.get('add_time', datetime.now().isoformat()).replace('Z', '+00:00')),
                updated_at=datetime.fromisoformat(person.get('update_time', datetime.now().isoformat()).replace('Z', '+00:00')),
                metadata={'pipedrive_data': person}
            )
            contacts.append(contact)
        return contacts
    
    async def create_person(self, name: str, email: str = '') -> Contact:
        """Create a person in Pipedrive"""
        endpoint = "persons"
        data = {
            'name': name,
            'email': email
        }
        
        response = await self._make_request(endpoint, method='POST', data=data)
        person = response.get('data', {})
        
        return Contact(
            id=str(person['id']),
            email=person.get('email', [{}])[0].get('value', '') if person.get('email') else '',
            first_name=person.get('first_name', ''),
            last_name=person.get('last_name', ''),
            phone=None,
            company=None,
            title=None,
            status=LeadStatus.NEW,
            tags=[],
            created_at=datetime.now(),
            updated_at=datetime.now(),
            metadata={'pipedrive_data': person}
        )
    
    async def validate_connection(self) -> bool:
        """Validate Pipedrive API connection"""
        try:
            await self._make_request("users/me")
            return True
        except Exception as e:
            logger.error(f"Pipedrive connection validation failed: {e}")
            return False

class ZohoCRMConnector:
    """Zoho CRM API connector"""
    
    def __init__(self, credentials: CRMCredentials):
        self.credentials = credentials
        self.base_url = "https://www.zohoapis.com/crm/v3"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None) -> Dict:
        """Make authenticated request to Zoho CRM API"""
        try:
            url = f"{self.base_url}/{endpoint}"
            headers = {
                'Authorization': f'Zoho-oauthtoken {self.credentials.access_token}',
                'Content-Type': 'application/json'
            }
            
            async with self.session.request(method, url, json=data, headers=headers) as response:
                response.raise_for_status()
                return await response.json()
                
        except Exception as e:
            logger.error(f"Zoho CRM API request failed: {e}")
            raise
    
    async def get_contacts(self) -> List[Contact]:
        """Get contacts from Zoho CRM"""
        endpoint = "Contacts"
        response = await self._make_request(endpoint)
        
        contacts = []
        for contact_data in response.get('data', []):
            contact = Contact(
                id=contact_data['id'],
                email=contact_data.get('Email', ''),
                first_name=contact_data.get('First_Name', ''),
                last_name=contact_data.get('Last_Name', ''),
                phone=contact_data.get('Phone'),
                company=contact_data.get('Account_Name', {}).get('name') if isinstance(contact_data.get('Account_Name'), dict) else contact_data.get('Account_Name'),
                title=contact_data.get('Title'),
                status=LeadStatus.NEW,
                tags=[],
                created_at=datetime.fromisoformat(contact_data.get('Created_Time', datetime.now().isoformat()).replace('Z', '+00:00')),
                updated_at=datetime.fromisoformat(contact_data.get('Modified_Time', datetime.now().isoformat()).replace('Z', '+00:00')),
                metadata={'zoho_data': contact_data}
            )
            contacts.append(contact)
        return contacts
    
    async def create_contact(self, email: str, first_name: str = '', last_name: str = '') -> Contact:
        """Create a contact in Zoho CRM"""
        endpoint = "Contacts"
        data = {
            'data': [{
                'Email': email,
                'First_Name': first_name,
                'Last_Name': last_name
            }]
        }
        
        response = await self._make_request(endpoint, method='POST', data=data)
        contact_data = response.get('data', [{}])[0]
        
        return Contact(
            id=contact_data.get('details', {}).get('id', ''),
            email=email,
            first_name=first_name,
            last_name=last_name,
            phone=None,
            company=None,
            title=None,
            status=LeadStatus.NEW,
            tags=[],
            created_at=datetime.now(),
            updated_at=datetime.now(),
            metadata={'zoho_data': contact_data}
        )
    
    async def validate_connection(self) -> bool:
        """Validate Zoho CRM API connection"""
        try:
            await self._make_request("users?type=CurrentUser")
            return True
        except Exception as e:
            logger.error(f"Zoho CRM connection validation failed: {e}")
            return False

class KeapConnector:
    """Keap (formerly Infusionsoft) API connector"""
    
    def __init__(self, credentials: CRMCredentials):
        self.credentials = credentials
        self.base_url = "https://api.infusionsoft.com/crm/rest/v1"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None) -> Dict:
        """Make authenticated request to Keap API"""
        try:
            url = f"{self.base_url}/{endpoint}"
            headers = {
                'Authorization': f'Bearer {self.credentials.access_token}',
                'Content-Type': 'application/json'
            }
            
            async with self.session.request(method, url, json=data, headers=headers) as response:
                response.raise_for_status()
                return await response.json()
                
        except Exception as e:
            logger.error(f"Keap API request failed: {e}")
            raise
    
    async def get_contacts(self) -> List[Contact]:
        """Get contacts from Keap"""
        endpoint = "contacts"
        response = await self._make_request(endpoint)
        
        contacts = []
        for contact_data in response.get('contacts', []):
            email_addresses = contact_data.get('email_addresses', [])
            email = email_addresses[0].get('email') if email_addresses else ''
            
            contact = Contact(
                id=str(contact_data['id']),
                email=email,
                first_name=contact_data.get('given_name', ''),
                last_name=contact_data.get('family_name', ''),
                phone=contact_data.get('phone_numbers', [{}])[0].get('number') if contact_data.get('phone_numbers') else None,
                company=contact_data.get('company', {}).get('company_name') if contact_data.get('company') else None,
                title=contact_data.get('job_title'),
                status=LeadStatus.NEW,
                tags=[],
                created_at=datetime.now(),
                updated_at=datetime.now(),
                metadata={'keap_data': contact_data}
            )
            contacts.append(contact)
        return contacts
    
    async def create_contact(self, email: str, first_name: str = '', last_name: str = '') -> Contact:
        """Create a contact in Keap"""
        endpoint = "contacts"
        data = {
            'email_addresses': [{'email': email, 'field': 'EMAIL1'}],
            'given_name': first_name,
            'family_name': last_name
        }
        
        response = await self._make_request(endpoint, method='POST', data=data)
        
        return Contact(
            id=str(response['id']),
            email=email,
            first_name=first_name,
            last_name=last_name,
            phone=None,
            company=None,
            title=None,
            status=LeadStatus.NEW,
            tags=[],
            created_at=datetime.now(),
            updated_at=datetime.now(),
            metadata={'keap_data': response}
        )
    
    async def validate_connection(self) -> bool:
        """Validate Keap API connection"""
        try:
            await self._make_request("contacts?limit=1")
            return True
        except Exception as e:
            logger.error(f"Keap connection validation failed: {e}")
            return False

class CloseConnector:
    """Close CRM API connector"""
    
    def __init__(self, credentials: CRMCredentials):
        self.credentials = credentials
        self.base_url = "https://api.close.com/api/v1"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None) -> Dict:
        """Make authenticated request to Close API"""
        try:
            url = f"{self.base_url}/{endpoint}"
            auth_string = base64.b64encode(f"{self.credentials.api_key}:".encode()).decode()
            headers = {
                'Authorization': f'Basic {auth_string}',
                'Content-Type': 'application/json'
            }
            
            async with self.session.request(method, url, json=data, headers=headers) as response:
                response.raise_for_status()
                return await response.json()
                
        except Exception as e:
            logger.error(f"Close API request failed: {e}")
            raise
    
    async def get_contacts(self) -> List[Contact]:
        """Get contacts from Close"""
        endpoint = "contact"
        response = await self._make_request(endpoint)
        
        contacts = []
        for contact_data in response.get('data', []):
            emails = contact_data.get('emails', [])
            email = emails[0].get('email') if emails else ''
            
            phones = contact_data.get('phones', [])
            phone = phones[0].get('phone') if phones else None
            
            contact = Contact(
                id=contact_data['id'],
                email=email,
                first_name=contact_data.get('name', '').split()[0] if contact_data.get('name') else '',
                last_name=' '.join(contact_data.get('name', '').split()[1:]) if contact_data.get('name') else '',
                phone=phone,
                company=contact_data.get('organization_id'),
                title=contact_data.get('title'),
                status=LeadStatus.NEW,
                tags=[],
                created_at=datetime.fromisoformat(contact_data.get('date_created', datetime.now().isoformat()).replace('Z', '+00:00')),
                updated_at=datetime.fromisoformat(contact_data.get('date_updated', datetime.now().isoformat()).replace('Z', '+00:00')),
                metadata={'close_data': contact_data}
            )
            contacts.append(contact)
        return contacts
    
    async def create_contact(self, name: str, email: str = '') -> Contact:
        """Create a contact in Close"""
        endpoint = "contact"
        data = {
            'name': name,
            'emails': [{'email': email}] if email else []
        }
        
        response = await self._make_request(endpoint, method='POST', data=data)
        
        return Contact(
            id=response['id'],
            email=email,
            first_name=name.split()[0] if name else '',
            last_name=' '.join(name.split()[1:]) if name else '',
            phone=None,
            company=None,
            title=None,
            status=LeadStatus.NEW,
            tags=[],
            created_at=datetime.now(),
            updated_at=datetime.now(),
            metadata={'close_data': response}
        )
    
    async def validate_connection(self) -> bool:
        """Validate Close API connection"""
        try:
            await self._make_request("me")
            return True
        except Exception as e:
            logger.error(f"Close connection validation failed: {e}")
            return False

class FreshsalesConnector:
    """Freshsales API connector"""
    
    def __init__(self, credentials: CRMCredentials):
        self.credentials = credentials
        self.base_url = f"https://{credentials.domain}.freshsales.io/api"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None) -> Dict:
        """Make authenticated request to Freshsales API"""
        try:
            url = f"{self.base_url}/{endpoint}"
            headers = {
                'Authorization': f'Token token={self.credentials.api_key}',
                'Content-Type': 'application/json'
            }
            
            async with self.session.request(method, url, json=data, headers=headers) as response:
                response.raise_for_status()
                return await response.json()
                
        except Exception as e:
            logger.error(f"Freshsales API request failed: {e}")
            raise
    
    async def get_contacts(self) -> List[Contact]:
        """Get contacts from Freshsales"""
        endpoint = "contacts/view/all"
        response = await self._make_request(endpoint)
        
        contacts = []
        for contact_data in response.get('contacts', []):
            contact = Contact(
                id=str(contact_data['id']),
                email=contact_data.get('email', ''),
                first_name=contact_data.get('first_name', ''),
                last_name=contact_data.get('last_name', ''),
                phone=contact_data.get('mobile_number') or contact_data.get('work_number'),
                company=contact_data.get('company_name'),
                title=contact_data.get('job_title'),
                status=LeadStatus.NEW,
                tags=[],
                created_at=datetime.fromisoformat(contact_data.get('created_at', datetime.now().isoformat()).replace('Z', '+00:00')),
                updated_at=datetime.fromisoformat(contact_data.get('updated_at', datetime.now().isoformat()).replace('Z', '+00:00')),
                metadata={'freshsales_data': contact_data}
            )
            contacts.append(contact)
        return contacts
    
    async def create_contact(self, email: str, first_name: str = '', last_name: str = '') -> Contact:
        """Create a contact in Freshsales"""
        endpoint = "contacts"
        data = {
            'contact': {
                'email': email,
                'first_name': first_name,
                'last_name': last_name
            }
        }
        
        response = await self._make_request(endpoint, method='POST', data=data)
        contact_data = response.get('contact', {})
        
        return Contact(
            id=str(contact_data['id']),
            email=email,
            first_name=first_name,
            last_name=last_name,
            phone=None,
            company=None,
            title=None,
            status=LeadStatus.NEW,
            tags=[],
            created_at=datetime.now(),
            updated_at=datetime.now(),
            metadata={'freshsales_data': contact_data}
        )
    
    async def validate_connection(self) -> bool:
        """Validate Freshsales API connection"""
        try:
            await self._make_request("selector/contact_statuses")
            return True
        except Exception as e:
            logger.error(f"Freshsales connection validation failed: {e}")
            return False

class GoHighLevelConnector:
    """GoHighLevel API connector"""
    
    def __init__(self, credentials: CRMCredentials):
        self.credentials = credentials
        self.base_url = "https://rest.gohighlevel.com/v1"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None) -> Dict:
        """Make authenticated request to GoHighLevel API"""
        try:
            url = f"{self.base_url}/{endpoint}"
            headers = {
                'Authorization': f'Bearer {self.credentials.access_token}',
                'Content-Type': 'application/json'
            }
            
            async with self.session.request(method, url, json=data, headers=headers) as response:
                response.raise_for_status()
                return await response.json()
                
        except Exception as e:
            logger.error(f"GoHighLevel API request failed: {e}")
            raise
    
    async def get_contacts(self) -> List[Contact]:
        """Get contacts from GoHighLevel"""
        endpoint = "contacts"
        response = await self._make_request(endpoint)
        
        contacts = []
        for contact_data in response.get('contacts', []):
            contact = Contact(
                id=contact_data['id'],
                email=contact_data.get('email', ''),
                first_name=contact_data.get('firstName', ''),
                last_name=contact_data.get('lastName', ''),
                phone=contact_data.get('phone'),
                company=contact_data.get('companyName'),
                title=None,
                status=LeadStatus.NEW,
                tags=[tag.get('name') for tag in contact_data.get('tags', [])],
                created_at=datetime.fromisoformat(contact_data.get('dateAdded', datetime.now().isoformat()).replace('Z', '+00:00')),
                updated_at=datetime.now(),
                metadata={'gohighlevel_data': contact_data}
            )
            contacts.append(contact)
        return contacts
    
    async def create_contact(self, email: str, first_name: str = '', last_name: str = '') -> Contact:
        """Create a contact in GoHighLevel"""
        endpoint = "contacts"
        data = {
            'email': email,
            'firstName': first_name,
            'lastName': last_name
        }
        
        response = await self._make_request(endpoint, method='POST', data=data)
        
        return Contact(
            id=response['contact']['id'],
            email=email,
            first_name=first_name,
            last_name=last_name,
            phone=None,
            company=None,
            title=None,
            status=LeadStatus.NEW,
            tags=[],
            created_at=datetime.now(),
            updated_at=datetime.now(),
            metadata={'gohighlevel_data': response}
        )
    
    async def validate_connection(self) -> bool:
        """Validate GoHighLevel API connection"""
        try:
            await self._make_request("contacts?limit=1")
            return True
        except Exception as e:
            logger.error(f"GoHighLevel connection validation failed: {e}")
            return False

class CRMManager:
    """Manager for multiple CRM platform integrations"""
    
    def __init__(self):
        self.connectors: Dict[CRMPlatform, Any] = {}
    
    def add_platform(self, platform: CRMPlatform, credentials: CRMCredentials):
        """Add a CRM platform connector"""
        connector_map = {
            CRMPlatform.HUBSPOT: HubSpotConnector,
            CRMPlatform.SALESFORCE: SalesforceConnector,
            CRMPlatform.PIPEDRIVE: PipedriveConnector,
            CRMPlatform.ZOHO_CRM: ZohoCRMConnector,
            CRMPlatform.KEAP: KeapConnector,
            CRMPlatform.CLOSE: CloseConnector,
            CRMPlatform.FRESHSALES: FreshsalesConnector,
            CRMPlatform.GOHIGHLEVEL: GoHighLevelConnector,
        }
        
        connector_class = connector_map.get(platform)
        if connector_class:
            self.connectors[platform] = connector_class(credentials)
            logger.info(f"Added {platform.value} connector")
    
    async def get_all_contacts(self) -> Dict[CRMPlatform, List[Contact]]:
        """Get contacts from all connected platforms"""
        all_contacts = {}
        
        for platform, connector in self.connectors.items():
            try:
                async with connector:
                    contacts = await connector.get_contacts()
                    all_contacts[platform] = contacts
            except Exception as e:
                logger.error(f"Error getting contacts from {platform.value}: {e}")
                all_contacts[platform] = []
        
        return all_contacts
    
    async def validate_all_connections(self) -> Dict[CRMPlatform, bool]:
        """Validate connections to all platforms"""
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

# Global CRM manager
crm_manager = CRMManager()

# Convenience functions
def add_crm_credentials(platform: str, api_key: str, access_token: str = None, instance_url: str = None, domain: str = None):
    """Add CRM platform credentials"""
    credentials = CRMCredentials(
        platform=CRMPlatform(platform),
        api_key=api_key,
        access_token=access_token,
        instance_url=instance_url,
        domain=domain
    )
    crm_manager.add_platform(credentials.platform, credentials)

async def get_all_crm_contacts():
    """Get contacts from all connected CRM platforms"""
    return await crm_manager.get_all_contacts()

async def validate_crm_connections():
    """Validate connections to all CRM platforms"""
    return await crm_manager.validate_all_connections()

