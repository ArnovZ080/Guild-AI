"""
Marketing Automation & Workflow Platform Integrations

Comprehensive integration with Zapier, n8n, Make, Pabbly, Tray, Google Apps Script, ClickFunnels, and Systeme.io APIs
for Workflow Automation and Campaign Management Agents.
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

class AutomationPlatform(Enum):
    ZAPIER = "zapier"
    N8N = "n8n"
    MAKE = "make"
    PABBLY = "pabbly"
    TRAY = "tray"
    GOOGLE_APPS_SCRIPT = "google_apps_script"
    CLICKFUNNELS = "clickfunnels"
    SYSTEME_IO = "systeme_io"

@dataclass
class AutomationCredentials:
    """Credentials for automation platforms"""
    platform: AutomationPlatform
    api_key: str
    workspace_id: Optional[str] = None
    account_id: Optional[str] = None
    base_url: Optional[str] = None

class ZapierConnector:
    """Zapier API connector"""
    
    def __init__(self, credentials: AutomationCredentials):
        self.credentials = credentials
        self.base_url = "https://api.zapier.com/v1"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None) -> Dict:
        """Make authenticated request to Zapier API"""
        try:
            url = f"{self.base_url}/{endpoint}"
            headers = {
                'X-API-Key': self.credentials.api_key,
                'Content-Type': 'application/json'
            }
            
            async with self.session.request(method, url, json=data, headers=headers) as response:
                response.raise_for_status()
                return await response.json()
                
        except Exception as e:
            logger.error(f"Zapier API request failed: {e}")
            raise
    
    async def get_zaps(self) -> List[Dict]:
        """Get zaps from Zapier"""
        endpoint = "zaps"
        response = await self._make_request(endpoint)
        return response.get('zaps', [])
    
    async def validate_connection(self) -> bool:
        """Validate Zapier API connection"""
        try:
            await self.get_zaps()
            return True
        except Exception as e:
            logger.error(f"Zapier connection validation failed: {e}")
            return False

class N8nConnector:
    """n8n API connector"""
    
    def __init__(self, credentials: AutomationCredentials):
        self.credentials = credentials
        self.base_url = credentials.base_url or "http://localhost:5678/api/v1"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None) -> Dict:
        """Make authenticated request to n8n API"""
        try:
            url = f"{self.base_url}/{endpoint}"
            headers = {
                'X-N8N-API-KEY': self.credentials.api_key,
                'Content-Type': 'application/json'
            }
            
            async with self.session.request(method, url, json=data, headers=headers) as response:
                response.raise_for_status()
                return await response.json()
                
        except Exception as e:
            logger.error(f"n8n API request failed: {e}")
            raise
    
    async def get_workflows(self) -> List[Dict]:
        """Get workflows from n8n"""
        endpoint = "workflows"
        response = await self._make_request(endpoint)
        return response.get('data', []) if isinstance(response, dict) else response
    
    async def execute_workflow(self, workflow_id: str, data: Dict = None) -> Dict:
        """Execute a workflow in n8n"""
        endpoint = f"workflows/{workflow_id}/execute"
        response = await self._make_request(endpoint, method='POST', data=data)
        return response
    
    async def validate_connection(self) -> bool:
        """Validate n8n API connection"""
        try:
            await self.get_workflows()
            return True
        except Exception as e:
            logger.error(f"n8n connection validation failed: {e}")
            return False

class MakeConnector:
    """Make (formerly Integromat) API connector"""
    
    def __init__(self, credentials: AutomationCredentials):
        self.credentials = credentials
        self.base_url = "https://api.make.com/v2"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None) -> Dict:
        """Make authenticated request to Make API"""
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
            logger.error(f"Make API request failed: {e}")
            raise
    
    async def get_scenarios(self) -> List[Dict]:
        """Get scenarios from Make"""
        endpoint = "scenarios"
        response = await self._make_request(endpoint)
        return response.get('scenarios', [])
    
    async def validate_connection(self) -> bool:
        """Validate Make API connection"""
        try:
            await self.get_scenarios()
            return True
        except Exception as e:
            logger.error(f"Make connection validation failed: {e}")
            return False

class PabblyConnector:
    """Pabbly Connect API connector"""
    
    def __init__(self, credentials: AutomationCredentials):
        self.credentials = credentials
        self.base_url = "https://connect.pabbly.com/api/v1"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None) -> Dict:
        """Make authenticated request to Pabbly API"""
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
            logger.error(f"Pabbly API request failed: {e}")
            raise
    
    async def get_workflows(self) -> List[Dict]:
        """Get workflows from Pabbly"""
        endpoint = "workflows"
        response = await self._make_request(endpoint)
        return response.get('data', [])
    
    async def validate_connection(self) -> bool:
        """Validate Pabbly API connection"""
        try:
            await self.get_workflows()
            return True
        except Exception as e:
            logger.error(f"Pabbly connection validation failed: {e}")
            return False

class TrayConnector:
    """Tray.io API connector"""
    
    def __init__(self, credentials: AutomationCredentials):
        self.credentials = credentials
        self.base_url = "https://api.tray.io/core/v1"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None) -> Dict:
        """Make authenticated request to Tray API"""
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
            logger.error(f"Tray API request failed: {e}")
            raise
    
    async def get_workflows(self) -> List[Dict]:
        """Get workflows from Tray"""
        endpoint = "workflows"
        response = await self._make_request(endpoint)
        return response.get('data', [])
    
    async def validate_connection(self) -> bool:
        """Validate Tray API connection"""
        try:
            await self.get_workflows()
            return True
        except Exception as e:
            logger.error(f"Tray connection validation failed: {e}")
            return False

class GoogleAppsScriptConnector:
    """Google Apps Script API connector"""
    
    def __init__(self, credentials: AutomationCredentials):
        self.credentials = credentials
        self.base_url = "https://script.googleapis.com/v1"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None) -> Dict:
        """Make authenticated request to Google Apps Script API"""
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
            logger.error(f"Google Apps Script API request failed: {e}")
            raise
    
    async def list_projects(self) -> List[Dict]:
        """List Google Apps Script projects"""
        endpoint = "projects"
        response = await self._make_request(endpoint)
        return response.get('projects', [])
    
    async def validate_connection(self) -> bool:
        """Validate Google Apps Script API connection"""
        try:
            await self.list_projects()
            return True
        except Exception as e:
            logger.error(f"Google Apps Script connection validation failed: {e}")
            return False

class ClickFunnelsConnector:
    """ClickFunnels API connector"""
    
    def __init__(self, credentials: AutomationCredentials):
        self.credentials = credentials
        self.base_url = "https://api.clickfunnels.com/v2"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None) -> Dict:
        """Make authenticated request to ClickFunnels API"""
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
            logger.error(f"ClickFunnels API request failed: {e}")
            raise
    
    async def get_funnels(self) -> List[Dict]:
        """Get funnels from ClickFunnels"""
        endpoint = "funnels"
        response = await self._make_request(endpoint)
        return response.get('funnels', [])
    
    async def validate_connection(self) -> bool:
        """Validate ClickFunnels API connection"""
        try:
            await self.get_funnels()
            return True
        except Exception as e:
            logger.error(f"ClickFunnels connection validation failed: {e}")
            return False

class SystemeIoConnector:
    """Systeme.io API connector"""
    
    def __init__(self, credentials: AutomationCredentials):
        self.credentials = credentials
        self.base_url = "https://systeme.io/api"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None) -> Dict:
        """Make authenticated request to Systeme.io API"""
        try:
            url = f"{self.base_url}/{endpoint}"
            headers = {
                'X-API-Key': self.credentials.api_key,
                'Content-Type': 'application/json'
            }
            
            async with self.session.request(method, url, json=data, headers=headers) as response:
                response.raise_for_status()
                return await response.json()
                
        except Exception as e:
            logger.error(f"Systeme.io API request failed: {e}")
            raise
    
    async def get_contacts(self) -> List[Dict]:
        """Get contacts from Systeme.io"""
        endpoint = "contacts"
        response = await self._make_request(endpoint)
        return response.get('contacts', [])
    
    async def validate_connection(self) -> bool:
        """Validate Systeme.io API connection"""
        try:
            await self.get_contacts()
            return True
        except Exception as e:
            logger.error(f"Systeme.io connection validation failed: {e}")
            return False

class ActiveCampaignConnector:
    """ActiveCampaign API connector"""
    
    def __init__(self, credentials: AutomationCredentials):
        self.credentials = credentials
        self.base_url = f"https://{credentials.account_id}.api-us1.com/api/3"
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
            url = f"{self.base_url}/{endpoint}"
            headers = {
                'Api-Token': self.credentials.api_key,
                'Content-Type': 'application/json'
            }
            
            async with self.session.request(method, url, json=data, headers=headers) as response:
                response.raise_for_status()
                return await response.json()
                
        except Exception as e:
            logger.error(f"ActiveCampaign API request failed: {e}")
            raise
    
    async def get_contacts(self) -> List[Dict]:
        """Get contacts from ActiveCampaign"""
        endpoint = "contacts"
        response = await self._make_request(endpoint)
        return response.get('contacts', [])
    
    async def validate_connection(self) -> bool:
        """Validate ActiveCampaign API connection"""
        try:
            await self.get_contacts()
            return True
        except Exception as e:
            logger.error(f"ActiveCampaign connection validation failed: {e}")
            return False

class AutomationManager:
    """Manager for multiple automation platform integrations"""
    
    def __init__(self):
        self.connectors: Dict[AutomationPlatform, Any] = {}
    
    def add_platform(self, platform: AutomationPlatform, credentials: AutomationCredentials):
        """Add an automation platform connector"""
        connector_map = {
            AutomationPlatform.ZAPIER: ZapierConnector,
            AutomationPlatform.N8N: N8nConnector,
            AutomationPlatform.MAKE: MakeConnector,
            AutomationPlatform.PABBLY: PabblyConnector,
            AutomationPlatform.TRAY: TrayConnector,
            AutomationPlatform.GOOGLE_APPS_SCRIPT: GoogleAppsScriptConnector,
            AutomationPlatform.CLICKFUNNELS: ClickFunnelsConnector,
            AutomationPlatform.SYSTEME_IO: SystemeIoConnector,
        }
        
        connector_class = connector_map.get(platform)
        if connector_class:
            self.connectors[platform] = connector_class(credentials)
            logger.info(f"Added {platform.value} connector")
    
    async def validate_all_connections(self) -> Dict[AutomationPlatform, bool]:
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

# Global automation manager
automation_manager = AutomationManager()

# Convenience functions
def add_automation_credentials(platform: str, api_key: str, workspace_id: str = None, account_id: str = None, base_url: str = None):
    """Add automation platform credentials"""
    credentials = AutomationCredentials(
        platform=AutomationPlatform(platform),
        api_key=api_key,
        workspace_id=workspace_id,
        account_id=account_id,
        base_url=base_url
    )
    automation_manager.add_platform(credentials.platform, credentials)

async def validate_automation_connections():
    """Validate connections to all automation platforms"""
    return await automation_manager.validate_all_connections()

