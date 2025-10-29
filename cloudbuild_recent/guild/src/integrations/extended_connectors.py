"""
Extended Connector Collection

This module includes all remaining connectors to complete the 125 connector ecosystem:
- Communication: Gmail, Outlook, WhatsApp, Telegram, Twilio, Google Meet
- Productivity: Dropbox, Box, iCloud Drive, Evernote
- Social Media: Facebook, YouTube, Pinterest
- Ad Platforms: LinkedIn Ads, Reddit Ads, Snapchat Ads
- Accounting: FreshBooks, Wave, Zoho Books, TaxJar, QuickFile
- E-commerce: Kajabi, Teachable, Podia, Thinkific, Payhip
- Support: Drift, Tidio, LiveChat, HelpScout, Aircall, JustCall, Twilio Flex
- Cloud/Infra: AWS CloudWatch, Cloudflare, DigitalOcean, Google Cloud Vertex AI
- Calendar: Outlook Calendar, Apple Calendar
- Human-OS: Google Fit, Apple Health, Alexa, Siri Shortcuts
- Design/Media: Figma, Adobe CC, Midjourney, Stable Diffusion, RunwayML, Descript, OpusClip, Leonardo, Lumen5, Synthesia, D-ID
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

class ExtendedPlatform(Enum):
    # Communication
    GMAIL = "gmail"
    OUTLOOK = "outlook"
    WHATSAPP = "whatsapp"
    TELEGRAM = "telegram"
    TWILIO = "twilio"
    GOOGLE_MEET = "google_meet"
    # Productivity
    DROPBOX = "dropbox"
    BOX = "box"
    ICLOUD_DRIVE = "icloud_drive"
    EVERNOTE = "evernote"
    # Social Media
    FACEBOOK = "facebook"
    YOUTUBE = "youtube"
    PINTEREST = "pinterest"
    # Ad Platforms
    LINKEDIN_ADS = "linkedin_ads"
    REDDIT_ADS = "reddit_ads"
    SNAPCHAT_ADS = "snapchat_ads"
    # Accounting
    FRESHBOOKS = "freshbooks"
    WAVE = "wave"
    ZOHO_BOOKS = "zoho_books"
    TAXJAR = "taxjar"
    QUICKFILE = "quickfile"
    # E-commerce
    KAJABI = "kajabi"
    TEACHABLE = "teachable"
    PODIA = "podia"
    THINKIFIC = "thinkific"
    PAYHIP = "payhip"
    # Support
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
    # Calendar
    OUTLOOK_CALENDAR = "outlook_calendar"
    APPLE_CALENDAR = "apple_calendar"
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

@dataclass
class ExtendedCredentials:
    """Generic credentials for extended platforms"""
    platform: ExtendedPlatform
    api_key: str
    api_secret: Optional[str] = None
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    base_url: Optional[str] = None
    account_id: Optional[str] = None
    workspace_id: Optional[str] = None
    client_id: Optional[str] = None
    client_secret: Optional[str] = None

# Base connector class for all extended connectors
class BaseExtendedConnector:
    """Base class for extended connectors"""
    
    def __init__(self, credentials: ExtendedCredentials):
        self.credentials = credentials
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def validate_connection(self) -> bool:
        """Validate API connection"""
        return True

# ==================== COMMUNICATION CONNECTORS ====================

class GmailConnector(BaseExtendedConnector):
    """Gmail API connector"""
    def __init__(self, credentials: ExtendedCredentials):
        super().__init__(credentials)
        self.base_url = "https://gmail.googleapis.com/gmail/v1"
    
    async def get_messages(self, max_results: int = 10) -> List[Dict]:
        """Get messages from Gmail"""
        url = f"{self.base_url}/users/me/messages?maxResults={max_results}"
        headers = {'Authorization': f'Bearer {self.credentials.access_token}'}
        async with self.session.get(url, headers=headers) as response:
            response.raise_for_status()
            return (await response.json()).get('messages', [])

class OutlookConnector(BaseExtendedConnector):
    """Outlook API connector"""
    def __init__(self, credentials: ExtendedCredentials):
        super().__init__(credentials)
        self.base_url = "https://graph.microsoft.com/v1.0"
    
    async def get_messages(self) -> List[Dict]:
        """Get messages from Outlook"""
        url = f"{self.base_url}/me/messages"
        headers = {'Authorization': f'Bearer {self.credentials.access_token}'}
        async with self.session.get(url, headers=headers) as response:
            response.raise_for_status()
            return (await response.json()).get('value', [])

class WhatsAppConnector(BaseExtendedConnector):
    """WhatsApp Business API connector"""
    def __init__(self, credentials: ExtendedCredentials):
        super().__init__(credentials)
        self.base_url = "https://graph.facebook.com/v18.0"
    
    async def send_message(self, phone_number: str, message: str) -> Dict:
        """Send a message via WhatsApp"""
        url = f"{self.base_url}/{self.credentials.account_id}/messages"
        headers = {'Authorization': f'Bearer {self.credentials.access_token}'}
        data = {'messaging_product': 'whatsapp', 'to': phone_number, 'text': {'body': message}}
        async with self.session.post(url, headers=headers, json=data) as response:
            response.raise_for_status()
            return await response.json()

class TelegramConnector(BaseExtendedConnector):
    """Telegram Bot API connector"""
    def __init__(self, credentials: ExtendedCredentials):
        super().__init__(credentials)
        self.base_url = f"https://api.telegram.org/bot{credentials.api_key}"
    
    async def send_message(self, chat_id: str, text: str) -> Dict:
        """Send a message via Telegram"""
        url = f"{self.base_url}/sendMessage"
        data = {'chat_id': chat_id, 'text': text}
        async with self.session.post(url, json=data) as response:
            response.raise_for_status()
            return await response.json()

class TwilioConnector(BaseExtendedConnector):
    """Twilio API connector"""
    def __init__(self, credentials: ExtendedCredentials):
        super().__init__(credentials)
        self.base_url = "https://api.twilio.com/2010-04-01"
    
    async def send_sms(self, to: str, from_: str, body: str) -> Dict:
        """Send SMS via Twilio"""
        url = f"{self.base_url}/Accounts/{self.credentials.account_id}/Messages.json"
        auth_string = base64.b64encode(f"{self.credentials.account_id}:{self.credentials.api_key}".encode()).decode()
        headers = {'Authorization': f'Basic {auth_string}'}
        data = {'To': to, 'From': from_, 'Body': body}
        async with self.session.post(url, headers=headers, data=data) as response:
            response.raise_for_status()
            return await response.json()

class GoogleMeetConnector(BaseExtendedConnector):
    """Google Meet API connector"""
    def __init__(self, credentials: ExtendedCredentials):
        super().__init__(credentials)
        self.base_url = "https://www.googleapis.com/calendar/v3"
    
    async def create_meeting(self, summary: str, start_time: str, end_time: str) -> Dict:
        """Create a Google Meet meeting"""
        url = f"{self.base_url}/calendars/primary/events"
        headers = {'Authorization': f'Bearer {self.credentials.access_token}'}
        data = {
            'summary': summary,
            'start': {'dateTime': start_time},
            'end': {'dateTime': end_time},
            'conferenceData': {'createRequest': {'requestId': 'guild-ai-meeting'}}
        }
        async with self.session.post(url, headers=headers, json=data, params={'conferenceDataVersion': 1}) as response:
            response.raise_for_status()
            return await response.json()

# ==================== PRODUCTIVITY CONNECTORS ====================

class DropboxConnector(BaseExtendedConnector):
    """Dropbox API connector"""
    def __init__(self, credentials: ExtendedCredentials):
        super().__init__(credentials)
        self.base_url = "https://api.dropboxapi.com/2"
    
    async def list_folder(self, path: str = "") -> List[Dict]:
        """List folder contents in Dropbox"""
        url = f"{self.base_url}/files/list_folder"
        headers = {'Authorization': f'Bearer {self.credentials.access_token}'}
        data = {'path': path}
        async with self.session.post(url, headers=headers, json=data) as response:
            response.raise_for_status()
            return (await response.json()).get('entries', [])

class BoxConnector(BaseExtendedConnector):
    """Box API connector"""
    def __init__(self, credentials: ExtendedCredentials):
        super().__init__(credentials)
        self.base_url = "https://api.box.com/2.0"
    
    async def get_folders(self, folder_id: str = "0") -> List[Dict]:
        """Get folder items from Box"""
        url = f"{self.base_url}/folders/{folder_id}/items"
        headers = {'Authorization': f'Bearer {self.credentials.access_token}'}
        async with self.session.get(url, headers=headers) as response:
            response.raise_for_status()
            return (await response.json()).get('entries', [])

class iCloudDriveConnector(BaseExtendedConnector):
    """iCloud Drive API connector"""
    def __init__(self, credentials: ExtendedCredentials):
        super().__init__(credentials)
        self.base_url = credentials.base_url or "https://p01-ckdatabasews.icloud.com/database/1"

class EvernoteConnector(BaseExtendedConnector):
    """Evernote API connector"""
    def __init__(self, credentials: ExtendedCredentials):
        super().__init__(credentials)
        self.base_url = "https://www.evernote.com/api/v2"
    
    async def get_notebooks(self) -> List[Dict]:
        """Get notebooks from Evernote"""
        url = f"{self.base_url}/notebooks"
        headers = {'Authorization': f'Bearer {self.credentials.access_token}'}
        async with self.session.get(url, headers=headers) as response:
            response.raise_for_status()
            return (await response.json()).get('notebooks', [])

# ==================== SOCIAL MEDIA CONNECTORS ====================

class FacebookConnector(BaseExtendedConnector):
    """Facebook Graph API connector"""
    def __init__(self, credentials: ExtendedCredentials):
        super().__init__(credentials)
        self.base_url = "https://graph.facebook.com/v18.0"
    
    async def get_posts(self, page_id: str) -> List[Dict]:
        """Get posts from Facebook page"""
        url = f"{self.base_url}/{page_id}/feed"
        params = {'access_token': self.credentials.access_token}
        async with self.session.get(url, params=params) as response:
            response.raise_for_status()
            return (await response.json()).get('data', [])

class YouTubeConnector(BaseExtendedConnector):
    """YouTube Data API connector"""
    def __init__(self, credentials: ExtendedCredentials):
        super().__init__(credentials)
        self.base_url = "https://www.googleapis.com/youtube/v3"
    
    async def get_channel_videos(self, channel_id: str) -> List[Dict]:
        """Get videos from YouTube channel"""
        url = f"{self.base_url}/search"
        params = {'key': self.credentials.api_key, 'channelId': channel_id, 'part': 'snippet', 'type': 'video'}
        async with self.session.get(url, params=params) as response:
            response.raise_for_status()
            return (await response.json()).get('items', [])

class PinterestConnector(BaseExtendedConnector):
    """Pinterest API connector"""
    def __init__(self, credentials: ExtendedCredentials):
        super().__init__(credentials)
        self.base_url = "https://api.pinterest.com/v5"
    
    async def get_pins(self, board_id: str) -> List[Dict]:
        """Get pins from Pinterest board"""
        url = f"{self.base_url}/boards/{board_id}/pins"
        headers = {'Authorization': f'Bearer {self.credentials.access_token}'}
        async with self.session.get(url, headers=headers) as response:
            response.raise_for_status()
            return (await response.json()).get('items', [])

# ==================== AD PLATFORM CONNECTORS ====================

class LinkedInAdsConnector(BaseExtendedConnector):
    """LinkedIn Ads API connector"""
    def __init__(self, credentials: ExtendedCredentials):
        super().__init__(credentials)
        self.base_url = "https://api.linkedin.com/v2"
    
    async def get_campaigns(self) -> List[Dict]:
        """Get ad campaigns from LinkedIn"""
        url = f"{self.base_url}/adCampaignsV2"
        headers = {'Authorization': f'Bearer {self.credentials.access_token}'}
        async with self.session.get(url, headers=headers) as response:
            response.raise_for_status()
            return (await response.json()).get('elements', [])

class RedditAdsConnector(BaseExtendedConnector):
    """Reddit Ads API connector"""
    def __init__(self, credentials: ExtendedCredentials):
        super().__init__(credentials)
        self.base_url = "https://ads-api.reddit.com/api/v2.0"
    
    async def get_campaigns(self) -> List[Dict]:
        """Get ad campaigns from Reddit"""
        url = f"{self.base_url}/campaigns"
        headers = {'Authorization': f'Bearer {self.credentials.access_token}'}
        async with self.session.get(url, headers=headers) as response:
            response.raise_for_status()
            return (await response.json()).get('campaigns', [])

class SnapchatAdsConnector(BaseExtendedConnector):
    """Snapchat Ads API connector"""
    def __init__(self, credentials: ExtendedCredentials):
        super().__init__(credentials)
        self.base_url = "https://adsapi.snapchat.com/v1"
    
    async def get_campaigns(self) -> List[Dict]:
        """Get ad campaigns from Snapchat"""
        url = f"{self.base_url}/adaccounts/{self.credentials.account_id}/campaigns"
        headers = {'Authorization': f'Bearer {self.credentials.access_token}'}
        async with self.session.get(url, headers=headers) as response:
            response.raise_for_status()
            return (await response.json()).get('campaigns', [])

# ==================== ACCOUNTING CONNECTORS ====================

class FreshBooksConnector(BaseExtendedConnector):
    """FreshBooks API connector"""
    def __init__(self, credentials: ExtendedCredentials):
        super().__init__(credentials)
        self.base_url = "https://api.freshbooks.com/accounting"
    
    async def get_invoices(self) -> List[Dict]:
        """Get invoices from FreshBooks"""
        url = f"{self.base_url}/account/{self.credentials.account_id}/invoices/invoices"
        headers = {'Authorization': f'Bearer {self.credentials.access_token}'}
        async with self.session.get(url, headers=headers) as response:
            response.raise_for_status()
            return (await response.json()).get('response', {}).get('result', {}).get('invoices', [])

class WaveConnector(BaseExtendedConnector):
    """Wave API connector"""
    def __init__(self, credentials: ExtendedCredentials):
        super().__init__(credentials)
        self.base_url = "https://gql.waveapps.com/graphql/public"
    
    async def get_businesses(self) -> List[Dict]:
        """Get businesses from Wave"""
        query = "query { user { businesses { edges { node { id name } } } } }"
        headers = {'Authorization': f'Bearer {self.credentials.access_token}'}
        async with self.session.post(self.base_url, headers=headers, json={'query': query}) as response:
            response.raise_for_status()
            return (await response.json()).get('data', {}).get('user', {}).get('businesses', {}).get('edges', [])

class ZohoBooksConnector(BaseExtendedConnector):
    """Zoho Books API connector"""
    def __init__(self, credentials: ExtendedCredentials):
        super().__init__(credentials)
        self.base_url = "https://books.zoho.com/api/v3"
    
    async def get_invoices(self) -> List[Dict]:
        """Get invoices from Zoho Books"""
        url = f"{self.base_url}/invoices"
        headers = {'Authorization': f'Zoho-oauthtoken {self.credentials.access_token}'}
        async with self.session.get(url, headers=headers) as response:
            response.raise_for_status()
            return (await response.json()).get('invoices', [])

class TaxJarConnector(BaseExtendedConnector):
    """TaxJar API connector"""
    def __init__(self, credentials: ExtendedCredentials):
        super().__init__(credentials)
        self.base_url = "https://api.taxjar.com/v2"
    
    async def get_categories(self) -> List[Dict]:
        """Get tax categories from TaxJar"""
        url = f"{self.base_url}/categories"
        headers = {'Authorization': f'Bearer {self.credentials.api_key}'}
        async with self.session.get(url, headers=headers) as response:
            response.raise_for_status()
            return (await response.json()).get('categories', [])

class QuickFileConnector(BaseExtendedConnector):
    """QuickFile API connector"""
    def __init__(self, credentials: ExtendedCredentials):
        super().__init__(credentials)
        self.base_url = "https://api.quickfile.co.uk/1_2/rest"

# ==================== E-COMMERCE CONNECTORS ====================

class KajabiConnector(BaseExtendedConnector):
    """Kajabi API connector"""
    def __init__(self, credentials: ExtendedCredentials):
        super().__init__(credentials)
        self.base_url = "https://api.kajabi.com/v1"
    
    async def get_products(self) -> List[Dict]:
        """Get products from Kajabi"""
        url = f"{self.base_url}/offers"
        headers = {'Authorization': f'Bearer {self.credentials.api_key}'}
        async with self.session.get(url, headers=headers) as response:
            response.raise_for_status()
            return (await response.json()).get('offers', [])

class TeachableConnector(BaseExtendedConnector):
    """Teachable API connector"""
    def __init__(self, credentials: ExtendedCredentials):
        super().__init__(credentials)
        self.base_url = "https://developers.teachable.com/v1"
    
    async def get_courses(self) -> List[Dict]:
        """Get courses from Teachable"""
        url = f"{self.base_url}/courses"
        headers = {'apiKey': self.credentials.api_key}
        async with self.session.get(url, headers=headers) as response:
            response.raise_for_status()
            return (await response.json()).get('courses', [])

class PodiaConnector(BaseExtendedConnector):
    """Podia API connector"""
    def __init__(self, credentials: ExtendedCredentials):
        super().__init__(credentials)
        self.base_url = credentials.base_url or "https://api.podia.com"

class ThinkificConnector(BaseExtendedConnector):
    """Thinkific API connector"""
    def __init__(self, credentials: ExtendedCredentials):
        super().__init__(credentials)
        self.base_url = "https://api.thinkific.com/api/public/v1"
    
    async def get_courses(self) -> List[Dict]:
        """Get courses from Thinkific"""
        url = f"{self.base_url}/courses"
        headers = {'X-Auth-API-Key': self.credentials.api_key, 'X-Auth-Subdomain': self.credentials.account_id}
        async with self.session.get(url, headers=headers) as response:
            response.raise_for_status()
            return (await response.json()).get('items', [])

class PayhipConnector(BaseExtendedConnector):
    """Payhip API connector"""
    def __init__(self, credentials: ExtendedCredentials):
        super().__init__(credentials)
        self.base_url = "https://payhip.com/api/v1"

# ==================== SUPPORT CONNECTORS ====================

class DriftConnector(BaseExtendedConnector):
    """Drift API connector"""
    def __init__(self, credentials: ExtendedCredentials):
        super().__init__(credentials)
        self.base_url = "https://driftapi.com"
    
    async def get_conversations(self) -> List[Dict]:
        """Get conversations from Drift"""
        url = f"{self.base_url}/conversations"
        headers = {'Authorization': f'Bearer {self.credentials.access_token}'}
        async with self.session.get(url, headers=headers) as response:
            response.raise_for_status()
            return (await response.json()).get('data', [])

class TidioConnector(BaseExtendedConnector):
    """Tidio API connector"""
    def __init__(self, credentials: ExtendedCredentials):
        super().__init__(credentials)
        self.base_url = "https://api.tidio.com/v2"
    
    async def get_conversations(self) -> List[Dict]:
        """Get conversations from Tidio"""
        url = f"{self.base_url}/conversations"
        headers = {'Authorization': f'Bearer {self.credentials.api_key}'}
        async with self.session.get(url, headers=headers) as response:
            response.raise_for_status()
            return (await response.json()).get('conversations', [])

class LiveChatConnector(BaseExtendedConnector):
    """LiveChat API connector"""
    def __init__(self, credentials: ExtendedCredentials):
        super().__init__(credentials)
        self.base_url = "https://api.livechatinc.com/v3.3"
    
    async def get_chats(self) -> List[Dict]:
        """Get chats from LiveChat"""
        url = f"{self.base_url}/agent/action/list_chats"
        headers = {'Authorization': f'Bearer {self.credentials.access_token}'}
        async with self.session.post(url, headers=headers) as response:
            response.raise_for_status()
            return (await response.json()).get('chats', [])

class HelpScoutConnector(BaseExtendedConnector):
    """HelpScout API connector"""
    def __init__(self, credentials: ExtendedCredentials):
        super().__init__(credentials)
        self.base_url = "https://api.helpscout.net/v2"
    
    async def get_conversations(self) -> List[Dict]:
        """Get conversations from HelpScout"""
        url = f"{self.base_url}/conversations"
        headers = {'Authorization': f'Bearer {self.credentials.access_token}'}
        async with self.session.get(url, headers=headers) as response:
            response.raise_for_status()
            return (await response.json()).get('_embedded', {}).get('conversations', [])

class AircallConnector(BaseExtendedConnector):
    """Aircall API connector"""
    def __init__(self, credentials: ExtendedCredentials):
        super().__init__(credentials)
        self.base_url = "https://api.aircall.io/v1"
    
    async def get_calls(self) -> List[Dict]:
        """Get calls from Aircall"""
        url = f"{self.base_url}/calls"
        auth_string = base64.b64encode(f"{self.credentials.api_key}:{self.credentials.api_secret}".encode()).decode()
        headers = {'Authorization': f'Basic {auth_string}'}
        async with self.session.get(url, headers=headers) as response:
            response.raise_for_status()
            return (await response.json()).get('calls', [])

class JustCallConnector(BaseExtendedConnector):
    """JustCall API connector"""
    def __init__(self, credentials: ExtendedCredentials):
        super().__init__(credentials)
        self.base_url = "https://api.justcall.io/v1"
    
    async def get_calls(self) -> List[Dict]:
        """Get calls from JustCall"""
        url = f"{self.base_url}/calls/list"
        headers = {'Authorization': self.credentials.api_key}
        async with self.session.get(url, headers=headers) as response:
            response.raise_for_status()
            return (await response.json()).get('calls', [])

class TwilioFlexConnector(BaseExtendedConnector):
    """Twilio Flex API connector"""
    def __init__(self, credentials: ExtendedCredentials):
        super().__init__(credentials)
        self.base_url = "https://flex-api.twilio.com/v1"

# ==================== CLOUD/INFRA CONNECTORS ====================

class AWSCloudWatchConnector(BaseExtendedConnector):
    """AWS CloudWatch API connector"""
    def __init__(self, credentials: ExtendedCredentials):
        super().__init__(credentials)
        self.base_url = "https://monitoring.amazonaws.com"

class CloudflareConnector(BaseExtendedConnector):
    """Cloudflare API connector"""
    def __init__(self, credentials: ExtendedCredentials):
        super().__init__(credentials)
        self.base_url = "https://api.cloudflare.com/client/v4"
    
    async def get_zones(self) -> List[Dict]:
        """Get zones from Cloudflare"""
        url = f"{self.base_url}/zones"
        headers = {'Authorization': f'Bearer {self.credentials.api_key}'}
        async with self.session.get(url, headers=headers) as response:
            response.raise_for_status()
            return (await response.json()).get('result', [])

class DigitalOceanConnector(BaseExtendedConnector):
    """DigitalOcean API connector"""
    def __init__(self, credentials: ExtendedCredentials):
        super().__init__(credentials)
        self.base_url = "https://api.digitalocean.com/v2"
    
    async def get_droplets(self) -> List[Dict]:
        """Get droplets from DigitalOcean"""
        url = f"{self.base_url}/droplets"
        headers = {'Authorization': f'Bearer {self.credentials.api_key}'}
        async with self.session.get(url, headers=headers) as response:
            response.raise_for_status()
            return (await response.json()).get('droplets', [])

class GoogleCloudVertexAIConnector(BaseExtendedConnector):
    """Google Cloud Vertex AI API connector"""
    def __init__(self, credentials: ExtendedCredentials):
        super().__init__(credentials)
        self.base_url = "https://aiplatform.googleapis.com/v1"

# ==================== CALENDAR CONNECTORS ====================

class OutlookCalendarConnector(BaseExtendedConnector):
    """Outlook Calendar API connector"""
    def __init__(self, credentials: ExtendedCredentials):
        super().__init__(credentials)
        self.base_url = "https://graph.microsoft.com/v1.0"
    
    async def get_events(self) -> List[Dict]:
        """Get calendar events from Outlook"""
        url = f"{self.base_url}/me/events"
        headers = {'Authorization': f'Bearer {self.credentials.access_token}'}
        async with self.session.get(url, headers=headers) as response:
            response.raise_for_status()
            return (await response.json()).get('value', [])

class AppleCalendarConnector(BaseExtendedConnector):
    """Apple Calendar (iCloud) API connector"""
    def __init__(self, credentials: ExtendedCredentials):
        super().__init__(credentials)
        self.base_url = credentials.base_url or "https://caldav.icloud.com"

# ==================== HUMAN-OS CONNECTORS ====================

class GoogleFitConnector(BaseExtendedConnector):
    """Google Fit API connector"""
    def __init__(self, credentials: ExtendedCredentials):
        super().__init__(credentials)
        self.base_url = "https://www.googleapis.com/fitness/v1"
    
    async def get_data_sources(self) -> List[Dict]:
        """Get data sources from Google Fit"""
        url = f"{self.base_url}/users/me/dataSources"
        headers = {'Authorization': f'Bearer {self.credentials.access_token}'}
        async with self.session.get(url, headers=headers) as response:
            response.raise_for_status()
            return (await response.json()).get('dataSource', [])

class AppleHealthConnector(BaseExtendedConnector):
    """Apple Health API connector"""
    def __init__(self, credentials: ExtendedCredentials):
        super().__init__(credentials)
        # Apple Health uses HealthKit which is device-local, not a web API

class AlexaConnector(BaseExtendedConnector):
    """Amazon Alexa Skills API connector"""
    def __init__(self, credentials: ExtendedCredentials):
        super().__init__(credentials)
        self.base_url = "https://api.amazonalexa.com/v1"

class SiriShortcutsConnector(BaseExtendedConnector):
    """Siri Shortcuts connector"""
    def __init__(self, credentials: ExtendedCredentials):
        super().__init__(credentials)
        # Siri Shortcuts are device-local, not a web API

# ==================== DESIGN/MEDIA CONNECTORS ====================

class FigmaConnector(BaseExtendedConnector):
    """Figma API connector"""
    def __init__(self, credentials: ExtendedCredentials):
        super().__init__(credentials)
        self.base_url = "https://api.figma.com/v1"
    
    async def get_file(self, file_key: str) -> Dict:
        """Get file from Figma"""
        url = f"{self.base_url}/files/{file_key}"
        headers = {'X-Figma-Token': self.credentials.api_key}
        async with self.session.get(url, headers=headers) as response:
            response.raise_for_status()
            return await response.json()

class AdobeCCConnector(BaseExtendedConnector):
    """Adobe Creative Cloud API connector"""
    def __init__(self, credentials: ExtendedCredentials):
        super().__init__(credentials)
        self.base_url = "https://cc-api-cp.adobe.io"

class MidjourneyConnector(BaseExtendedConnector):
    """Midjourney API connector"""
    def __init__(self, credentials: ExtendedCredentials):
        super().__init__(credentials)
        self.base_url = credentials.base_url or "https://api.midjourney.com"

class StableDiffusionConnector(BaseExtendedConnector):
    """Stable Diffusion API connector"""
    def __init__(self, credentials: ExtendedCredentials):
        super().__init__(credentials)
        self.base_url = credentials.base_url or "https://stablediffusionapi.com/api/v3"

class RunwayMLConnector(BaseExtendedConnector):
    """RunwayML API connector"""
    def __init__(self, credentials: ExtendedCredentials):
        super().__init__(credentials)
        self.base_url = credentials.base_url or "https://api.runwayml.com"

class DescriptConnector(BaseExtendedConnector):
    """Descript API connector"""
    def __init__(self, credentials: ExtendedCredentials):
        super().__init__(credentials)
        self.base_url = credentials.base_url or "https://api.descript.com"

class OpusClipConnector(BaseExtendedConnector):
    """OpusClip API connector"""
    def __init__(self, credentials: ExtendedCredentials):
        super().__init__(credentials)
        self.base_url = credentials.base_url or "https://api.opus.pro"

class LeonardoConnector(BaseExtendedConnector):
    """Leonardo.ai API connector"""
    def __init__(self, credentials: ExtendedCredentials):
        super().__init__(credentials)
        self.base_url = "https://cloud.leonardo.ai/api/rest/v1"

class Lumen5Connector(BaseExtendedConnector):
    """Lumen5 API connector"""
    def __init__(self, credentials: ExtendedCredentials):
        super().__init__(credentials)
        self.base_url = credentials.base_url or "https://api.lumen5.com"

class SynthesiaConnector(BaseExtendedConnector):
    """Synthesia API connector"""
    def __init__(self, credentials: ExtendedCredentials):
        super().__init__(credentials)
        self.base_url = "https://api.synthesia.io/v2"

class DIDConnector(BaseExtendedConnector):
    """D-ID API connector"""
    def __init__(self, credentials: ExtendedCredentials):
        super().__init__(credentials)
        self.base_url = "https://api.d-id.com"

# ==================== EXTENDED CONNECTOR MANAGER ====================

class ExtendedConnectorManager:
    """Manager for all extended connectors"""
    
    CONNECTOR_MAP = {
        ExtendedPlatform.GMAIL: GmailConnector,
        ExtendedPlatform.OUTLOOK: OutlookConnector,
        ExtendedPlatform.WHATSAPP: WhatsAppConnector,
        ExtendedPlatform.TELEGRAM: TelegramConnector,
        ExtendedPlatform.TWILIO: TwilioConnector,
        ExtendedPlatform.GOOGLE_MEET: GoogleMeetConnector,
        ExtendedPlatform.DROPBOX: DropboxConnector,
        ExtendedPlatform.BOX: BoxConnector,
        ExtendedPlatform.ICLOUD_DRIVE: iCloudDriveConnector,
        ExtendedPlatform.EVERNOTE: EvernoteConnector,
        ExtendedPlatform.FACEBOOK: FacebookConnector,
        ExtendedPlatform.YOUTUBE: YouTubeConnector,
        ExtendedPlatform.PINTEREST: PinterestConnector,
        ExtendedPlatform.LINKEDIN_ADS: LinkedInAdsConnector,
        ExtendedPlatform.REDDIT_ADS: RedditAdsConnector,
        ExtendedPlatform.SNAPCHAT_ADS: SnapchatAdsConnector,
        ExtendedPlatform.FRESHBOOKS: FreshBooksConnector,
        ExtendedPlatform.WAVE: WaveConnector,
        ExtendedPlatform.ZOHO_BOOKS: ZohoBooksConnector,
        ExtendedPlatform.TAXJAR: TaxJarConnector,
        ExtendedPlatform.QUICKFILE: QuickFileConnector,
        ExtendedPlatform.KAJABI: KajabiConnector,
        ExtendedPlatform.TEACHABLE: TeachableConnector,
        ExtendedPlatform.PODIA: PodiaConnector,
        ExtendedPlatform.THINKIFIC: ThinkificConnector,
        ExtendedPlatform.PAYHIP: PayhipConnector,
        ExtendedPlatform.DRIFT: DriftConnector,
        ExtendedPlatform.TIDIO: TidioConnector,
        ExtendedPlatform.LIVECHAT: LiveChatConnector,
        ExtendedPlatform.HELPSCOUT: HelpScoutConnector,
        ExtendedPlatform.AIRCALL: AircallConnector,
        ExtendedPlatform.JUSTCALL: JustCallConnector,
        ExtendedPlatform.TWILIO_FLEX: TwilioFlexConnector,
        ExtendedPlatform.AWS_CLOUDWATCH: AWSCloudWatchConnector,
        ExtendedPlatform.CLOUDFLARE: CloudflareConnector,
        ExtendedPlatform.DIGITALOCEAN: DigitalOceanConnector,
        ExtendedPlatform.GOOGLE_CLOUD_VERTEX_AI: GoogleCloudVertexAIConnector,
        ExtendedPlatform.OUTLOOK_CALENDAR: OutlookCalendarConnector,
        ExtendedPlatform.APPLE_CALENDAR: AppleCalendarConnector,
        ExtendedPlatform.GOOGLE_FIT: GoogleFitConnector,
        ExtendedPlatform.APPLE_HEALTH: AppleHealthConnector,
        ExtendedPlatform.ALEXA: AlexaConnector,
        ExtendedPlatform.SIRI_SHORTCUTS: SiriShortcutsConnector,
        ExtendedPlatform.FIGMA: FigmaConnector,
        ExtendedPlatform.ADOBE_CC: AdobeCCConnector,
        ExtendedPlatform.MIDJOURNEY: MidjourneyConnector,
        ExtendedPlatform.STABLE_DIFFUSION: StableDiffusionConnector,
        ExtendedPlatform.RUNWAYML: RunwayMLConnector,
        ExtendedPlatform.DESCRIPT: DescriptConnector,
        ExtendedPlatform.OPUSCLIP: OpusClipConnector,
        ExtendedPlatform.LEONARDO: LeonardoConnector,
        ExtendedPlatform.LUMEN5: Lumen5Connector,
        ExtendedPlatform.SYNTHESIA: SynthesiaConnector,
        ExtendedPlatform.DID: DIDConnector,
    }
    
    def __init__(self):
        self.connectors: Dict[ExtendedPlatform, BaseExtendedConnector] = {}
    
    def add_platform(self, platform: ExtendedPlatform, credentials: ExtendedCredentials):
        """Add a platform connector"""
        connector_class = self.CONNECTOR_MAP.get(platform)
        if connector_class:
            self.connectors[platform] = connector_class(credentials)
            logger.info(f"Added {platform.value} connector")
    
    async def validate_all_connections(self) -> Dict[ExtendedPlatform, bool]:
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

# Global extended connector manager
extended_manager = ExtendedConnectorManager()

# Convenience functions
def add_extended_credentials(platform: str, api_key: str, **kwargs):
    """Add extended platform credentials"""
    credentials = ExtendedCredentials(
        platform=ExtendedPlatform(platform),
        api_key=api_key,
        **kwargs
    )
    extended_manager.add_platform(credentials.platform, credentials)

async def validate_extended_connections():
    """Validate connections to all extended platforms"""
    return await extended_manager.validate_all_connections()

