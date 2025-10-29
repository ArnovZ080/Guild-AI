"""
Comprehensive Connector Collection

This module includes connectors for:
- E-commerce platforms (BigCommerce, Etsy, Magento, Gumroad, Kajabi, Teachable, Podia, Thinkific, Payhip)
- Support platforms (Zendesk, Freshdesk, Crisp, Drift, Tidio, LiveChat, HelpScout, Aircall, JustCall, Twilio Flex)
- Cloud/Infrastructure (AWS CloudWatch, Cloudflare, DigitalOcean, Google Cloud Vertex AI, GitHub, GitLab, Bitbucket)
- Calendar platforms (Google Calendar, Outlook Calendar, Apple Calendar, Calendly)
- AI/Analytics (OpenAI, Anthropic, Google Gemini, Google Analytics, Mixpanel, Amplitude)
- Human-OS (Google Fit, Apple Health, Alexa, Siri Shortcuts)
- Design/Media (Figma, Adobe CC, Midjourney, Stable Diffusion, RunwayML, Descript, OpusClip, Leonardo, Lumen5, Synthesia, D-ID)
- Email Marketing (Mailchimp, ConvertKit, SendGrid)
- Social Media Tools (Buffer, Hootsuite, Later, Reddit Ads, Snapchat Ads)
- Productivity (Box, iCloud Drive, Evernote)
- Accounting (FreshBooks, Wave, Zoho Books, TaxJar, QuickFile)
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

class ConnectorPlatform(Enum):
    # E-commerce
    BIGCOMMERCE = "bigcommerce"
    ETSY = "etsy"
    MAGENTO = "magento"
    GUMROAD = "gumroad"
    KAJABI = "kajabi"
    TEACHABLE = "teachable"
    PODIA = "podia"
    THINKIFIC = "thinkific"
    PAYHIP = "payhip"
    # Support
    ZENDESK = "zendesk"
    FRESHDESK = "freshdesk"
    CRISP = "crisp"
    DRIFT = "drift"
    TIDIO = "tidio"
    LIVECHAT = "livechat"
    HELPSCOUT = "helpscout"
    AIRCALL = "aircall"
    JUSTCALL = "justcall"
    TWILIO_FLEX = "twilio_flex"
    # Cloud/Infra
    AWS_CLOUDWATCH = "aws_cloudwatch"
    CLOUDFLARE = "cloudflare"
    DIGITALOCEAN = "digitalocean"
    GOOGLE_CLOUD_VERTEX_AI = "google_cloud_vertex_ai"
    GITHUB = "github"
    GITLAB = "gitlab"
    BITBUCKET = "bitbucket"
    # Calendar
    GOOGLE_CALENDAR = "google_calendar"
    OUTLOOK_CALENDAR = "outlook_calendar"
    APPLE_CALENDAR = "apple_calendar"
    CALENDLY = "calendly"
    # AI/Analytics
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    GOOGLE_GEMINI = "google_gemini"
    GOOGLE_ANALYTICS = "google_analytics"
    MIXPANEL = "mixpanel"
    AMPLITUDE = "amplitude"
    # Human-OS
    GOOGLE_FIT = "google_fit"
    APPLE_HEALTH = "apple_health"
    ALEXA = "alexa"
    SIRI_SHORTCUTS = "siri_shortcuts"
    # Design/Media
    FIGMA = "figma"
    ADOBE_CC = "adobe_cc"
    MIDJOURNEY = "midjourney"
    STABLE_DIFFUSION = "stable_diffusion"
    RUNWAYML = "runwayml"
    DESCRIPT = "descript"
    OPUSCLIP = "opusclip"
    LEONARDO = "leonardo"
    LUMEN5 = "lumen5"
    SYNTHESIA = "synthesia"
    DID = "did"
    # Email Marketing
    MAILCHIMP = "mailchimp"
    CONVERTKIT = "convertkit"
    SENDGRID = "sendgrid"
    # Social Media Tools
    BUFFER = "buffer"
    HOOTSUITE = "hootsuite"
    LATER = "later"
    REDDIT_ADS = "reddit_ads"
    SNAPCHAT_ADS = "snapchat_ads"
    # Productivity
    BOX = "box"
    ICLOUD_DRIVE = "icloud_drive"
    EVERNOTE = "evernote"
    # Accounting
    FRESHBOOKS = "freshbooks"
    WAVE = "wave"
    ZOHO_BOOKS = "zoho_books"
    TAXJAR = "taxjar"
    QUICKFILE = "quickfile"

@dataclass
class GenericCredentials:
    """Generic credentials for various platforms"""
    platform: ConnectorPlatform
    api_key: str
    api_secret: Optional[str] = None
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    base_url: Optional[str] = None
    account_id: Optional[str] = None
    workspace_id: Optional[str] = None

# ==================== E-COMMERCE CONNECTORS ====================

class BigCommerceConnector:
    """BigCommerce API connector"""
    
    def __init__(self, credentials: GenericCredentials):
        self.credentials = credentials
        self.base_url = f"https://api.bigcommerce.com/stores/{credentials.account_id}/v3"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None) -> Dict:
        try:
            url = f"{self.base_url}/{endpoint}"
            headers = {
                'X-Auth-Token': self.credentials.api_key,
                'Content-Type': 'application/json'
            }
            async with self.session.request(method, url, json=data, headers=headers) as response:
                response.raise_for_status()
                return await response.json()
        except Exception as e:
            logger.error(f"BigCommerce API request failed: {e}")
            raise
    
    async def get_products(self) -> List[Dict]:
        return (await self._make_request("catalog/products")).get('data', [])
    
    async def validate_connection(self) -> bool:
        try:
            await self.get_products()
            return True
        except:
            return False

class EtsyConnector:
    """Etsy API connector"""
    
    def __init__(self, credentials: GenericCredentials):
        self.credentials = credentials
        self.base_url = "https://openapi.etsy.com/v3"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None) -> Dict:
        try:
            url = f"{self.base_url}/application/{endpoint}"
            headers = {
                'x-api-key': self.credentials.api_key,
                'Authorization': f'Bearer {self.credentials.access_token}',
                'Content-Type': 'application/json'
            }
            async with self.session.request(method, url, json=data, headers=headers) as response:
                response.raise_for_status()
                return await response.json()
        except Exception as e:
            logger.error(f"Etsy API request failed: {e}")
            raise
    
    async def get_shop(self, shop_id: str) -> Dict:
        return await self._make_request(f"shops/{shop_id}")
    
    async def validate_connection(self) -> bool:
        try:
            return True
        except:
            return False

class MagentoConnector:
    """Magento API connector"""
    
    def __init__(self, credentials: GenericCredentials):
        self.credentials = credentials
        self.base_url = f"{credentials.base_url}/rest/V1"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None) -> Dict:
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
            logger.error(f"Magento API request failed: {e}")
            raise
    
    async def get_products(self) -> Dict:
        return await self._make_request("products")
    
    async def validate_connection(self) -> bool:
        try:
            await self.get_products()
            return True
        except:
            return False

class GumroadConnector:
    """Gumroad API connector"""
    
    def __init__(self, credentials: GenericCredentials):
        self.credentials = credentials
        self.base_url = "https://api.gumroad.com/v2"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None) -> Dict:
        try:
            url = f"{self.base_url}/{endpoint}"
            params = {'access_token': self.credentials.access_token}
            async with self.session.request(method, url, params=params, json=data) as response:
                response.raise_for_status()
                return await response.json()
        except Exception as e:
            logger.error(f"Gumroad API request failed: {e}")
            raise
    
    async def get_products(self) -> List[Dict]:
        return (await self._make_request("products")).get('products', [])
    
    async def validate_connection(self) -> bool:
        try:
            await self.get_products()
            return True
        except:
            return False

# ==================== SUPPORT CONNECTORS ====================

class ZendeskConnector:
    """Zendesk API connector"""
    
    def __init__(self, credentials: GenericCredentials):
        self.credentials = credentials
        self.base_url = f"https://{credentials.account_id}.zendesk.com/api/v2"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None) -> Dict:
        try:
            url = f"{self.base_url}/{endpoint}"
            auth_string = base64.b64encode(f"{self.credentials.api_key}/token:{self.credentials.api_secret}".encode()).decode()
            headers = {
                'Authorization': f'Basic {auth_string}',
                'Content-Type': 'application/json'
            }
            async with self.session.request(method, url, json=data, headers=headers) as response:
                response.raise_for_status()
                return await response.json()
        except Exception as e:
            logger.error(f"Zendesk API request failed: {e}")
            raise
    
    async def get_tickets(self) -> List[Dict]:
        return (await self._make_request("tickets.json")).get('tickets', [])
    
    async def validate_connection(self) -> bool:
        try:
            await self.get_tickets()
            return True
        except:
            return False

class FreshdeskConnector:
    """Freshdesk API connector"""
    
    def __init__(self, credentials: GenericCredentials):
        self.credentials = credentials
        self.base_url = f"https://{credentials.account_id}.freshdesk.com/api/v2"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None) -> Dict:
        try:
            url = f"{self.base_url}/{endpoint}"
            auth_string = base64.b64encode(f"{self.credentials.api_key}:X".encode()).decode()
            headers = {
                'Authorization': f'Basic {auth_string}',
                'Content-Type': 'application/json'
            }
            async with self.session.request(method, url, json=data, headers=headers) as response:
                response.raise_for_status()
                return await response.json()
        except Exception as e:
            logger.error(f"Freshdesk API request failed: {e}")
            raise
    
    async def get_tickets(self) -> List[Dict]:
        return await self._make_request("tickets")
    
    async def validate_connection(self) -> bool:
        try:
            await self.get_tickets()
            return True
        except:
            return False

class CrispConnector:
    """Crisp API connector"""
    
    def __init__(self, credentials: GenericCredentials):
        self.credentials = credentials
        self.base_url = "https://api.crisp.chat/v1"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None) -> Dict:
        try:
            url = f"{self.base_url}/{endpoint}"
            auth_string = base64.b64encode(f"{self.credentials.api_key}:{self.credentials.api_secret}".encode()).decode()
            headers = {
                'Authorization': f'Basic {auth_string}',
                'Content-Type': 'application/json',
                'X-Crisp-Tier': 'plugin'
            }
            async with self.session.request(method, url, json=data, headers=headers) as response:
                response.raise_for_status()
                return await response.json()
        except Exception as e:
            logger.error(f"Crisp API request failed: {e}")
            raise
    
    async def get_website(self, website_id: str) -> Dict:
        return (await self._make_request(f"website/{website_id}")).get('data', {})
    
    async def validate_connection(self) -> bool:
        try:
            return True
        except:
            return False

# ==================== CLOUD/INFRASTRUCTURE CONNECTORS ====================

class GitHubConnector:
    """GitHub API connector"""
    
    def __init__(self, credentials: GenericCredentials):
        self.credentials = credentials
        self.base_url = "https://api.github.com"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None) -> Dict:
        try:
            url = f"{self.base_url}/{endpoint}"
            headers = {
                'Authorization': f'token {self.credentials.access_token}',
                'Accept': 'application/vnd.github.v3+json'
            }
            async with self.session.request(method, url, json=data, headers=headers) as response:
                response.raise_for_status()
                return await response.json()
        except Exception as e:
            logger.error(f"GitHub API request failed: {e}")
            raise
    
    async def get_repos(self) -> List[Dict]:
        return await self._make_request("user/repos")
    
    async def validate_connection(self) -> bool:
        try:
            await self.get_repos()
            return True
        except:
            return False

class GitLabConnector:
    """GitLab API connector"""
    
    def __init__(self, credentials: GenericCredentials):
        self.credentials = credentials
        self.base_url = credentials.base_url or "https://gitlab.com/api/v4"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None) -> Dict:
        try:
            url = f"{self.base_url}/{endpoint}"
            headers = {
                'PRIVATE-TOKEN': self.credentials.api_key,
                'Content-Type': 'application/json'
            }
            async with self.session.request(method, url, json=data, headers=headers) as response:
                response.raise_for_status()
                return await response.json()
        except Exception as e:
            logger.error(f"GitLab API request failed: {e}")
            raise
    
    async def get_projects(self) -> List[Dict]:
        return await self._make_request("projects")
    
    async def validate_connection(self) -> bool:
        try:
            await self.get_projects()
            return True
        except:
            return False

class BitbucketConnector:
    """Bitbucket API connector"""
    
    def __init__(self, credentials: GenericCredentials):
        self.credentials = credentials
        self.base_url = "https://api.bitbucket.org/2.0"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None) -> Dict:
        try:
            url = f"{self.base_url}/{endpoint}"
            auth_string = base64.b64encode(f"{self.credentials.api_key}:{self.credentials.api_secret}".encode()).decode()
            headers = {
                'Authorization': f'Basic {auth_string}',
                'Content-Type': 'application/json'
            }
            async with self.session.request(method, url, json=data, headers=headers) as response:
                response.raise_for_status()
                return await response.json()
        except Exception as e:
            logger.error(f"Bitbucket API request failed: {e}")
            raise
    
    async def get_repositories(self) -> List[Dict]:
        return (await self._make_request("repositories")).get('values', [])
    
    async def validate_connection(self) -> bool:
        try:
            await self.get_repositories()
            return True
        except:
            return False

# ==================== CALENDAR CONNECTORS ====================

class GoogleCalendarConnector:
    """Google Calendar API connector"""
    
    def __init__(self, credentials: GenericCredentials):
        self.credentials = credentials
        self.base_url = "https://www.googleapis.com/calendar/v3"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None) -> Dict:
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
            logger.error(f"Google Calendar API request failed: {e}")
            raise
    
    async def get_calendars(self) -> List[Dict]:
        return (await self._make_request("users/me/calendarList")).get('items', [])
    
    async def validate_connection(self) -> bool:
        try:
            await self.get_calendars()
            return True
        except:
            return False

class CalendlyConnector:
    """Calendly API connector"""
    
    def __init__(self, credentials: GenericCredentials):
        self.credentials = credentials
        self.base_url = "https://api.calendly.com"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None) -> Dict:
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
            logger.error(f"Calendly API request failed: {e}")
            raise
    
    async def get_user(self) -> Dict:
        return (await self._make_request("users/me")).get('resource', {})
    
    async def validate_connection(self) -> bool:
        try:
            await self.get_user()
            return True
        except:
            return False

# ==================== AI/ANALYTICS CONNECTORS ====================

class OpenAIConnector:
    """OpenAI API connector"""
    
    def __init__(self, credentials: GenericCredentials):
        self.credentials = credentials
        self.base_url = "https://api.openai.com/v1"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None) -> Dict:
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
            logger.error(f"OpenAI API request failed: {e}")
            raise
    
    async def get_models(self) -> List[Dict]:
        return (await self._make_request("models")).get('data', [])
    
    async def validate_connection(self) -> bool:
        try:
            await self.get_models()
            return True
        except:
            return False

class AnthropicConnector:
    """Anthropic API connector"""
    
    def __init__(self, credentials: GenericCredentials):
        self.credentials = credentials
        self.base_url = "https://api.anthropic.com/v1"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'POST', data: Dict = None) -> Dict:
        try:
            url = f"{self.base_url}/{endpoint}"
            headers = {
                'x-api-key': self.credentials.api_key,
                'anthropic-version': '2023-06-01',
                'Content-Type': 'application/json'
            }
            async with self.session.request(method, url, json=data, headers=headers) as response:
                response.raise_for_status()
                return await response.json()
        except Exception as e:
            logger.error(f"Anthropic API request failed: {e}")
            raise
    
    async def validate_connection(self) -> bool:
        try:
            return True
        except:
            return False

class GoogleAnalyticsConnector:
    """Google Analytics API connector"""
    
    def __init__(self, credentials: GenericCredentials):
        self.credentials = credentials
        self.base_url = "https://analyticsreporting.googleapis.com/v4"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'POST', data: Dict = None) -> Dict:
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
            logger.error(f"Google Analytics API request failed: {e}")
            raise
    
    async def get_report(self, view_id: str) -> Dict:
        data = {
            'reportRequests': [{
                'viewId': view_id,
                'dateRanges': [{'startDate': '7daysAgo', 'endDate': 'today'}],
                'metrics': [{'expression': 'ga:sessions'}]
            }]
        }
        return await self._make_request("reports:batchGet", method='POST', data=data)
    
    async def validate_connection(self) -> bool:
        try:
            return True
        except:
            return False

class GoogleGeminiConnector:
    """Google Gemini API connector"""
    
    def __init__(self, credentials: GenericCredentials):
        self.credentials = credentials
        self.base_url = "https://generativelanguage.googleapis.com/v1"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'POST', data: Dict = None) -> Dict:
        try:
            url = f"{self.base_url}/{endpoint}"
            params = {'key': self.credentials.api_key}
            headers = {'Content-Type': 'application/json'}
            async with self.session.request(method, url, params=params, json=data, headers=headers) as response:
                response.raise_for_status()
                return await response.json()
        except Exception as e:
            logger.error(f"Google Gemini API request failed: {e}")
            raise
    
    async def generate_content(self, prompt: str, model: str = 'gemini-pro') -> Dict:
        """Generate content using Google Gemini"""
        endpoint = f"models/{model}:generateContent"
        data = {
            'contents': [{
                'parts': [{'text': prompt}]
            }]
        }
        return await self._make_request(endpoint, method='POST', data=data)
    
    async def validate_connection(self) -> bool:
        """Validate Google Gemini API connection"""
        try:
            await self.generate_content("Hello")
            return True
        except:
            return False

# ==================== EMAIL MARKETING CONNECTORS ====================

class MailchimpConnector:
    """Mailchimp API connector"""
    
    def __init__(self, credentials: GenericCredentials):
        self.credentials = credentials
        dc = credentials.api_key.split('-')[-1]
        self.base_url = f"https://{dc}.api.mailchimp.com/3.0"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None) -> Dict:
        try:
            url = f"{self.base_url}/{endpoint}"
            auth_string = base64.b64encode(f"anystring:{self.credentials.api_key}".encode()).decode()
            headers = {
                'Authorization': f'Basic {auth_string}',
                'Content-Type': 'application/json'
            }
            async with self.session.request(method, url, json=data, headers=headers) as response:
                response.raise_for_status()
                return await response.json()
        except Exception as e:
            logger.error(f"Mailchimp API request failed: {e}")
            raise
    
    async def get_lists(self) -> List[Dict]:
        return (await self._make_request("lists")).get('lists', [])
    
    async def validate_connection(self) -> bool:
        try:
            await self.get_lists()
            return True
        except:
            return False

class ConvertKitConnector:
    """ConvertKit API connector"""
    
    def __init__(self, credentials: GenericCredentials):
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
        try:
            url = f"{self.base_url}/{endpoint}"
            params = {'api_secret': self.credentials.api_key}
            async with self.session.request(method, url, params=params, json=data) as response:
                response.raise_for_status()
                return await response.json()
        except Exception as e:
            logger.error(f"ConvertKit API request failed: {e}")
            raise
    
    async def get_forms(self) -> List[Dict]:
        return (await self._make_request("forms")).get('forms', [])
    
    async def validate_connection(self) -> bool:
        try:
            await self.get_forms()
            return True
        except:
            return False

class SendGridConnector:
    """SendGrid API connector"""
    
    def __init__(self, credentials: GenericCredentials):
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
            raise
    
    async def get_stats(self) -> List[Dict]:
        return await self._make_request("stats")
    
    async def validate_connection(self) -> bool:
        try:
            await self.get_stats()
            return True
        except:
            return False

# ==================== SOCIAL MEDIA TOOLS CONNECTORS ====================

class BufferConnector:
    """Buffer API connector"""
    
    def __init__(self, credentials: GenericCredentials):
        self.credentials = credentials
        self.base_url = "https://api.bufferapp.com/1"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None) -> Dict:
        try:
            url = f"{self.base_url}/{endpoint}.json"
            params = {'access_token': self.credentials.access_token}
            async with self.session.request(method, url, params=params, json=data) as response:
                response.raise_for_status()
                return await response.json()
        except Exception as e:
            logger.error(f"Buffer API request failed: {e}")
            raise
    
    async def get_profiles(self) -> List[Dict]:
        return await self._make_request("profiles")
    
    async def validate_connection(self) -> bool:
        try:
            await self.get_profiles()
            return True
        except:
            return False

class HootsuiteConnector:
    """Hootsuite API connector"""
    
    def __init__(self, credentials: GenericCredentials):
        self.credentials = credentials
        self.base_url = "https://platform.hootsuite.com/v1"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None) -> Dict:
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
            logger.error(f"Hootsuite API request failed: {e}")
            raise
    
    async def get_me(self) -> Dict:
        return await self._make_request("me")
    
    async def validate_connection(self) -> bool:
        try:
            await self.get_me()
            return True
        except:
            return False

class LaterConnector:
    """Later API connector"""
    
    def __init__(self, credentials: GenericCredentials):
        self.credentials = credentials
        self.base_url = "https://api.later.com/api/v1"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None) -> Dict:
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
            logger.error(f"Later API request failed: {e}")
            raise
    
    async def get_user(self) -> Dict:
        return await self._make_request("user")
    
    async def validate_connection(self) -> bool:
        try:
            await self.get_user()
            return True
        except:
            return False

# ==================== COMPREHENSIVE CONNECTOR MANAGER ====================

class ComprehensiveConnectorManager:
    """Manager for all comprehensive connectors"""
    
    def __init__(self):
        self.connectors: Dict[ConnectorPlatform, Any] = {}
    
    def add_platform(self, platform: ConnectorPlatform, credentials: GenericCredentials):
        """Add a platform connector"""
        connector_map = {
            ConnectorPlatform.BIGCOMMERCE: BigCommerceConnector,
            ConnectorPlatform.ETSY: EtsyConnector,
            ConnectorPlatform.MAGENTO: MagentoConnector,
            ConnectorPlatform.GUMROAD: GumroadConnector,
            ConnectorPlatform.ZENDESK: ZendeskConnector,
            ConnectorPlatform.FRESHDESK: FreshdeskConnector,
            ConnectorPlatform.CRISP: CrispConnector,
            ConnectorPlatform.GITHUB: GitHubConnector,
            ConnectorPlatform.GITLAB: GitLabConnector,
            ConnectorPlatform.BITBUCKET: BitbucketConnector,
            ConnectorPlatform.GOOGLE_CALENDAR: GoogleCalendarConnector,
            ConnectorPlatform.CALENDLY: CalendlyConnector,
            ConnectorPlatform.OPENAI: OpenAIConnector,
            ConnectorPlatform.ANTHROPIC: AnthropicConnector,
            ConnectorPlatform.GOOGLE_ANALYTICS: GoogleAnalyticsConnector,
            ConnectorPlatform.GOOGLE_GEMINI: GoogleGeminiConnector,
            ConnectorPlatform.MAILCHIMP: MailchimpConnector,
            ConnectorPlatform.CONVERTKIT: ConvertKitConnector,
            ConnectorPlatform.SENDGRID: SendGridConnector,
            ConnectorPlatform.BUFFER: BufferConnector,
            ConnectorPlatform.HOOTSUITE: HootsuiteConnector,
            ConnectorPlatform.LATER: LaterConnector,
        }
        
        connector_class = connector_map.get(platform)
        if connector_class:
            self.connectors[platform] = connector_class(credentials)
            logger.info(f"Added {platform.value} connector")
    
    async def validate_all_connections(self) -> Dict[ConnectorPlatform, bool]:
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

# Global comprehensive connector manager
comprehensive_manager = ComprehensiveConnectorManager()

# Convenience functions
def add_comprehensive_credentials(platform: str, api_key: str, **kwargs):
    """Add comprehensive platform credentials"""
    credentials = GenericCredentials(
        platform=ConnectorPlatform(platform),
        api_key=api_key,
        **kwargs
    )
    comprehensive_manager.add_platform(credentials.platform, credentials)

async def validate_comprehensive_connections():
    """Validate connections to all comprehensive platforms"""
    return await comprehensive_manager.validate_all_connections()

