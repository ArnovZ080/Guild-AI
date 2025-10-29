"""
Salesforce Integration Connector
Complete enterprise CRM, sales automation, and customer management.
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


class SalesforceEnvironment(Enum):
    """Salesforce environments"""
    PRODUCTION = "production"
    SANDBOX = "sandbox"


class SalesforceDataType(Enum):
    """Types of data available from Salesforce"""
    ACCOUNTS = "accounts"
    CONTACTS = "contacts"
    LEADS = "leads"
    OPPORTUNITIES = "opportunities"
    CASES = "cases"
    CAMPAIGNS = "campaigns"
    TASKS = "tasks"
    EVENTS = "events"


@dataclass
class SalesforceCredentials:
    """Salesforce API credentials"""
    access_token: str
    instance_url: str
    refresh_token: Optional[str] = None
    client_id: Optional[str] = None
    client_secret: Optional[str] = None
    token_expiry: Optional[datetime] = None
    environment: SalesforceEnvironment = SalesforceEnvironment.PRODUCTION


@dataclass
class SalesforceAccount:
    """Account (Company) data from Salesforce"""
    Id: str
    Name: str
    Type: Optional[str]
    Industry: Optional[str]
    AnnualRevenue: Optional[float]
    NumberOfEmployees: Optional[int]
    BillingCity: Optional[str]
    BillingCountry: Optional[str]
    Website: Optional[str]
    Phone: Optional[str]
    CreatedDate: datetime
    LastModifiedDate: datetime


@dataclass
class SalesforceContact:
    """Contact data from Salesforce"""
    Id: str
    FirstName: Optional[str]
    LastName: str
    Email: Optional[str]
    Phone: Optional[str]
    Title: Optional[str]
    Department: Optional[str]
    AccountId: Optional[str]
    LeadSource: Optional[str]
    CreatedDate: datetime
    LastModifiedDate: datetime


@dataclass
class SalesforceLead:
    """Lead data from Salesforce"""
    Id: str
    FirstName: Optional[str]
    LastName: str
    Email: Optional[str]
    Company: str
    Title: Optional[str]
    Status: str
    Rating: Optional[str]
    Industry: Optional[str]
    LeadSource: Optional[str]
    CreatedDate: datetime
    LastModifiedDate: datetime


@dataclass
class SalesforceOpportunity:
    """Opportunity (Deal) data from Salesforce"""
    Id: str
    Name: str
    Amount: Optional[float]
    StageName: str
    Probability: Optional[int]
    CloseDate: datetime
    AccountId: Optional[str]
    OwnerId: str
    Type: Optional[str]
    LeadSource: Optional[str]
    CreatedDate: datetime
    LastModifiedDate: datetime


class SalesforceConnector:
    """
    Comprehensive Salesforce integration connector.
    Handles enterprise CRM, sales automation, and customer management.
    """
    
    def __init__(self, credentials: SalesforceCredentials):
        self.credentials = credentials
        self.session: Optional[aiohttp.ClientSession] = None
        self.api_version = "v59.0"  # Latest API version
        
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
        
        if self.credentials.environment == SalesforceEnvironment.SANDBOX:
            token_url = "https://test.salesforce.com/services/oauth2/token"
        else:
            token_url = "https://login.salesforce.com/services/oauth2/token"
        
        data = {
            "grant_type": "refresh_token",
            "client_id": self.credentials.client_id,
            "client_secret": self.credentials.client_secret,
            "refresh_token": self.credentials.refresh_token
        }
        
        if not self.session:
            self.session = aiohttp.ClientSession()
        
        async with self.session.post(token_url, data=data) as response:
            if response.status == 200:
                token_data = await response.json()
                self.credentials.access_token = token_data['access_token']
                self.credentials.instance_url = token_data['instance_url']
                # Salesforce tokens typically last for 2 hours
                self.credentials.token_expiry = datetime.now() + timedelta(hours=2) - timedelta(minutes=5)
                logger.info("Salesforce access token refreshed successfully")
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
    
    def _get_api_url(self, endpoint: str) -> str:
        """Construct full API URL"""
        return f"{self.credentials.instance_url}/services/data/{self.api_version}/{endpoint}"
    
    async def validate_connection(self) -> bool:
        """Validate Salesforce API connection"""
        try:
            url = self._get_api_url("sobjects/Account/describe")
            headers = await self._get_headers()
            
            if not self.session:
                self.session = aiohttp.ClientSession()
            
            async with self.session.get(url, headers=headers) as response:
                if response.status == 200:
                    logger.info("Salesforce connection validated successfully")
                    return True
                else:
                    logger.error(f"Salesforce validation failed: {response.status}")
                    return False
                    
        except Exception as e:
            logger.error(f"Salesforce connection validation failed: {e}")
            return False
    
    # ============================================================================
    # SOQL QUERY
    # ============================================================================
    
    async def query(self, soql: str) -> Dict[str, Any]:
        """
        Execute a SOQL query.
        
        Args:
            soql: Salesforce Object Query Language query
            
        Returns:
            Query results
        """
        try:
            url = self._get_api_url("query")
            headers = await self._get_headers()
            
            params = {"q": soql}
            
            async with self.session.get(url, headers=headers, params=params) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    error_text = await response.text()
                    raise Exception(f"SOQL query failed: {response.status} - {error_text}")
                    
        except Exception as e:
            logger.error(f"Error executing SOQL query: {e}")
            raise
    
    # ============================================================================
    # ACCOUNT MANAGEMENT
    # ============================================================================
    
    async def get_accounts(
        self,
        limit: int = 100,
        where_clause: Optional[str] = None
    ) -> List[SalesforceAccount]:
        """Get accounts (companies) from Salesforce"""
        try:
            fields = "Id, Name, Type, Industry, AnnualRevenue, NumberOfEmployees, BillingCity, BillingCountry, Website, Phone, CreatedDate, LastModifiedDate"
            
            soql = f"SELECT {fields} FROM Account"
            
            if where_clause:
                soql += f" WHERE {where_clause}"
            
            soql += f" LIMIT {limit}"
            
            data = await self.query(soql)
            
            accounts = []
            for record in data.get('records', []):
                accounts.append(SalesforceAccount(
                    Id=record['Id'],
                    Name=record['Name'],
                    Type=record.get('Type'),
                    Industry=record.get('Industry'),
                    AnnualRevenue=record.get('AnnualRevenue'),
                    NumberOfEmployees=record.get('NumberOfEmployees'),
                    BillingCity=record.get('BillingCity'),
                    BillingCountry=record.get('BillingCountry'),
                    Website=record.get('Website'),
                    Phone=record.get('Phone'),
                    CreatedDate=datetime.fromisoformat(record['CreatedDate'].replace('Z', '+00:00')),
                    LastModifiedDate=datetime.fromisoformat(record['LastModifiedDate'].replace('Z', '+00:00'))
                ))
            
            return accounts
                    
        except Exception as e:
            logger.error(f"Error getting Salesforce accounts: {e}")
            raise
    
    async def create_account(
        self,
        name: str,
        account_type: Optional[str] = None,
        industry: Optional[str] = None,
        website: Optional[str] = None,
        phone: Optional[str] = None,
        additional_fields: Optional[Dict[str, Any]] = None
    ) -> SalesforceAccount:
        """Create a new account"""
        try:
            url = self._get_api_url("sobjects/Account")
            headers = await self._get_headers()
            
            payload = {"Name": name}
            
            if account_type:
                payload["Type"] = account_type
            if industry:
                payload["Industry"] = industry
            if website:
                payload["Website"] = website
            if phone:
                payload["Phone"] = phone
            
            if additional_fields:
                payload.update(additional_fields)
            
            async with self.session.post(url, headers=headers, json=payload) as response:
                if response.status == 201:
                    data = await response.json()
                    
                    # Fetch full account record
                    accounts = await self.get_accounts(where_clause=f"Id = '{data['id']}'")
                    return accounts[0] if accounts else None
                else:
                    error_text = await response.text()
                    raise Exception(f"Failed to create account: {response.status} - {error_text}")
                    
        except Exception as e:
            logger.error(f"Error creating Salesforce account: {e}")
            raise
    
    # ============================================================================
    # CONTACT MANAGEMENT
    # ============================================================================
    
    async def get_contacts(
        self,
        limit: int = 100,
        where_clause: Optional[str] = None
    ) -> List[SalesforceContact]:
        """Get contacts from Salesforce"""
        try:
            fields = "Id, FirstName, LastName, Email, Phone, Title, Department, AccountId, LeadSource, CreatedDate, LastModifiedDate"
            
            soql = f"SELECT {fields} FROM Contact"
            
            if where_clause:
                soql += f" WHERE {where_clause}"
            
            soql += f" LIMIT {limit}"
            
            data = await self.query(soql)
            
            contacts = []
            for record in data.get('records', []):
                contacts.append(SalesforceContact(
                    Id=record['Id'],
                    FirstName=record.get('FirstName'),
                    LastName=record['LastName'],
                    Email=record.get('Email'),
                    Phone=record.get('Phone'),
                    Title=record.get('Title'),
                    Department=record.get('Department'),
                    AccountId=record.get('AccountId'),
                    LeadSource=record.get('LeadSource'),
                    CreatedDate=datetime.fromisoformat(record['CreatedDate'].replace('Z', '+00:00')),
                    LastModifiedDate=datetime.fromisoformat(record['LastModifiedDate'].replace('Z', '+00:00'))
                ))
            
            return contacts
                    
        except Exception as e:
            logger.error(f"Error getting Salesforce contacts: {e}")
            raise
    
    async def create_contact(
        self,
        last_name: str,
        first_name: Optional[str] = None,
        email: Optional[str] = None,
        phone: Optional[str] = None,
        account_id: Optional[str] = None,
        title: Optional[str] = None,
        additional_fields: Optional[Dict[str, Any]] = None
    ) -> SalesforceContact:
        """Create a new contact"""
        try:
            url = self._get_api_url("sobjects/Contact")
            headers = await self._get_headers()
            
            payload = {"LastName": last_name}
            
            if first_name:
                payload["FirstName"] = first_name
            if email:
                payload["Email"] = email
            if phone:
                payload["Phone"] = phone
            if account_id:
                payload["AccountId"] = account_id
            if title:
                payload["Title"] = title
            
            if additional_fields:
                payload.update(additional_fields)
            
            async with self.session.post(url, headers=headers, json=payload) as response:
                if response.status == 201:
                    data = await response.json()
                    
                    # Fetch full contact record
                    contacts = await self.get_contacts(where_clause=f"Id = '{data['id']}'")
                    return contacts[0] if contacts else None
                else:
                    error_text = await response.text()
                    raise Exception(f"Failed to create contact: {response.status} - {error_text}")
                    
        except Exception as e:
            logger.error(f"Error creating Salesforce contact: {e}")
            raise
    
    # ============================================================================
    # LEAD MANAGEMENT
    # ============================================================================
    
    async def get_leads(
        self,
        limit: int = 100,
        where_clause: Optional[str] = None
    ) -> List[SalesforceLead]:
        """Get leads from Salesforce"""
        try:
            fields = "Id, FirstName, LastName, Email, Company, Title, Status, Rating, Industry, LeadSource, CreatedDate, LastModifiedDate"
            
            soql = f"SELECT {fields} FROM Lead"
            
            if where_clause:
                soql += f" WHERE {where_clause}"
            
            soql += f" LIMIT {limit}"
            
            data = await self.query(soql)
            
            leads = []
            for record in data.get('records', []):
                leads.append(SalesforceLead(
                    Id=record['Id'],
                    FirstName=record.get('FirstName'),
                    LastName=record['LastName'],
                    Email=record.get('Email'),
                    Company=record['Company'],
                    Title=record.get('Title'),
                    Status=record['Status'],
                    Rating=record.get('Rating'),
                    Industry=record.get('Industry'),
                    LeadSource=record.get('LeadSource'),
                    CreatedDate=datetime.fromisoformat(record['CreatedDate'].replace('Z', '+00:00')),
                    LastModifiedDate=datetime.fromisoformat(record['LastModifiedDate'].replace('Z', '+00:00'))
                ))
            
            return leads
                    
        except Exception as e:
            logger.error(f"Error getting Salesforce leads: {e}")
            raise
    
    async def create_lead(
        self,
        last_name: str,
        company: str,
        first_name: Optional[str] = None,
        email: Optional[str] = None,
        phone: Optional[str] = None,
        status: str = "Open - Not Contacted",
        lead_source: Optional[str] = None,
        additional_fields: Optional[Dict[str, Any]] = None
    ) -> SalesforceLead:
        """Create a new lead"""
        try:
            url = self._get_api_url("sobjects/Lead")
            headers = await self._get_headers()
            
            payload = {
                "LastName": last_name,
                "Company": company,
                "Status": status
            }
            
            if first_name:
                payload["FirstName"] = first_name
            if email:
                payload["Email"] = email
            if phone:
                payload["Phone"] = phone
            if lead_source:
                payload["LeadSource"] = lead_source
            
            if additional_fields:
                payload.update(additional_fields)
            
            async with self.session.post(url, headers=headers, json=payload) as response:
                if response.status == 201:
                    data = await response.json()
                    
                    # Fetch full lead record
                    leads = await self.get_leads(where_clause=f"Id = '{data['id']}'")
                    return leads[0] if leads else None
                else:
                    error_text = await response.text()
                    raise Exception(f"Failed to create lead: {response.status} - {error_text}")
                    
        except Exception as e:
            logger.error(f"Error creating Salesforce lead: {e}")
            raise
    
    async def update_lead_status(
        self,
        lead_id: str,
        status: str
    ) -> Dict[str, Any]:
        """Update lead status"""
        return await self.update_record("Lead", lead_id, {"Status": status})
    
    # ============================================================================
    # OPPORTUNITY (SALES PIPELINE) MANAGEMENT
    # ============================================================================
    
    async def get_opportunities(
        self,
        limit: int = 100,
        where_clause: Optional[str] = None
    ) -> List[SalesforceOpportunity]:
        """Get opportunities (deals) from Salesforce"""
        try:
            fields = "Id, Name, Amount, StageName, Probability, CloseDate, AccountId, OwnerId, Type, LeadSource, CreatedDate, LastModifiedDate"
            
            soql = f"SELECT {fields} FROM Opportunity"
            
            if where_clause:
                soql += f" WHERE {where_clause}"
            
            soql += f" LIMIT {limit}"
            
            data = await self.query(soql)
            
            opportunities = []
            for record in data.get('records', []):
                opportunities.append(SalesforceOpportunity(
                    Id=record['Id'],
                    Name=record['Name'],
                    Amount=record.get('Amount'),
                    StageName=record['StageName'],
                    Probability=record.get('Probability'),
                    CloseDate=datetime.fromisoformat(record['CloseDate']),
                    AccountId=record.get('AccountId'),
                    OwnerId=record['OwnerId'],
                    Type=record.get('Type'),
                    LeadSource=record.get('LeadSource'),
                    CreatedDate=datetime.fromisoformat(record['CreatedDate'].replace('Z', '+00:00')),
                    LastModifiedDate=datetime.fromisoformat(record['LastModifiedDate'].replace('Z', '+00:00'))
                ))
            
            return opportunities
                    
        except Exception as e:
            logger.error(f"Error getting Salesforce opportunities: {e}")
            raise
    
    async def create_opportunity(
        self,
        name: str,
        stage_name: str,
        close_date: datetime,
        amount: Optional[float] = None,
        account_id: Optional[str] = None,
        probability: Optional[int] = None,
        additional_fields: Optional[Dict[str, Any]] = None
    ) -> SalesforceOpportunity:
        """Create a new opportunity"""
        try:
            url = self._get_api_url("sobjects/Opportunity")
            headers = await self._get_headers()
            
            payload = {
                "Name": name,
                "StageName": stage_name,
                "CloseDate": close_date.strftime("%Y-%m-%d")
            }
            
            if amount:
                payload["Amount"] = amount
            if account_id:
                payload["AccountId"] = account_id
            if probability is not None:
                payload["Probability"] = probability
            
            if additional_fields:
                payload.update(additional_fields)
            
            async with self.session.post(url, headers=headers, json=payload) as response:
                if response.status == 201:
                    data = await response.json()
                    
                    # Fetch full opportunity record
                    opportunities = await self.get_opportunities(where_clause=f"Id = '{data['id']}'")
                    return opportunities[0] if opportunities else None
                else:
                    error_text = await response.text()
                    raise Exception(f"Failed to create opportunity: {response.status} - {error_text}")
                    
        except Exception as e:
            logger.error(f"Error creating Salesforce opportunity: {e}")
            raise
    
    async def update_opportunity_stage(
        self,
        opportunity_id: str,
        stage_name: str
    ) -> Dict[str, Any]:
        """Update opportunity stage"""
        return await self.update_record("Opportunity", opportunity_id, {"StageName": stage_name})
    
    # ============================================================================
    # GENERIC RECORD OPERATIONS
    # ============================================================================
    
    async def update_record(
        self,
        object_type: str,
        record_id: str,
        fields: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Update a record of any type"""
        try:
            url = self._get_api_url(f"sobjects/{object_type}/{record_id}")
            headers = await self._get_headers()
            
            async with self.session.patch(url, headers=headers, json=fields) as response:
                if response.status == 204:
                    return {"success": True, "id": record_id}
                else:
                    error_text = await response.text()
                    raise Exception(f"Failed to update record: {response.status} - {error_text}")
                    
        except Exception as e:
            logger.error(f"Error updating Salesforce record: {e}")
            raise
    
    async def delete_record(
        self,
        object_type: str,
        record_id: str
    ) -> Dict[str, Any]:
        """Delete a record"""
        try:
            url = self._get_api_url(f"sobjects/{object_type}/{record_id}")
            headers = await self._get_headers()
            
            async with self.session.delete(url, headers=headers) as response:
                if response.status == 204:
                    return {"success": True, "id": record_id, "deleted": True}
                else:
                    error_text = await response.text()
                    raise Exception(f"Failed to delete record: {response.status} - {error_text}")
                    
        except Exception as e:
            logger.error(f"Error deleting Salesforce record: {e}")
            raise
    
    # ============================================================================
    # ANALYTICS & REPORTING
    # ============================================================================
    
    async def get_pipeline_metrics(self) -> Dict[str, Any]:
        """Get sales pipeline metrics"""
        opportunities = await self.get_opportunities()
        
        total_value = sum(opp.Amount for opp in opportunities if opp.Amount)
        by_stage = {}
        
        for opp in opportunities:
            if opp.StageName not in by_stage:
                by_stage[opp.StageName] = {
                    'count': 0,
                    'total_value': 0,
                    'avg_probability': 0,
                    'opportunities': []
                }
            
            by_stage[opp.StageName]['count'] += 1
            by_stage[opp.StageName]['total_value'] += (opp.Amount or 0)
            by_stage[opp.StageName]['avg_probability'] += (opp.Probability or 0)
            by_stage[opp.StageName]['opportunities'].append(opp.Id)
        
        # Calculate averages
        for stage_data in by_stage.values():
            if stage_data['count'] > 0:
                stage_data['avg_probability'] /= stage_data['count']
        
        return {
            'total_opportunities': len(opportunities),
            'total_pipeline_value': total_value,
            'average_deal_size': total_value / len(opportunities) if opportunities else 0,
            'by_stage': by_stage
        }
    
    async def get_lead_metrics(self) -> Dict[str, Any]:
        """Get lead metrics"""
        leads = await self.get_leads()
        
        by_status = {}
        by_source = {}
        by_rating = {}
        
        for lead in leads:
            # By status
            status = lead.Status or 'Unknown'
            by_status[status] = by_status.get(status, 0) + 1
            
            # By source
            source = lead.LeadSource or 'Unknown'
            by_source[source] = by_source.get(source, 0) + 1
            
            # By rating
            rating = lead.Rating or 'Unrated'
            by_rating[rating] = by_rating.get(rating, 0) + 1
        
        return {
            'total_leads': len(leads),
            'by_status': by_status,
            'by_source': by_source,
            'by_rating': by_rating
        }

