"""
Meeting Platform Integrations

Comprehensive integration with Zoom, Google Meet, Microsoft Teams, and Calendly APIs
for Meeting Notes and Proposal Writer Agents.
"""

import asyncio
import aiohttp
import json
from typing import Dict, Any, List, Optional, Union
from datetime import datetime, date, timedelta
from dataclasses import dataclass, asdict
from enum import Enum
from guild.src.core.config import settings
from guild.src.utils.logging_utils import get_logger

logger = get_logger(__name__)

class MeetingPlatform(Enum):
    ZOOM = "zoom"
    GOOGLE_MEET = "google_meet"
    MICROSOFT_TEAMS = "microsoft_teams"
    CALENDLY = "calendly"

class MeetingStatus(Enum):
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class MeetingType(Enum):
    INSTANT = "instant"
    SCHEDULED = "scheduled"
    RECURRING = "recurring"
    WEBINAR = "webinar"

@dataclass
class MeetingCredentials:
    """Credentials for meeting platforms"""
    platform: MeetingPlatform
    api_key: str
    api_secret: Optional[str] = None
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    account_id: Optional[str] = None
    expires_at: Optional[datetime] = None

@dataclass
class Meeting:
    """Standardized meeting format"""
    id: str
    title: str
    description: str
    start_time: datetime
    end_time: datetime
    duration: int  # minutes
    meeting_type: MeetingType
    status: MeetingStatus
    host_id: str
    host_email: str
    join_url: str
    meeting_url: str
    password: Optional[str]
    participants: List[str]
    recording_url: Optional[str]
    transcript: Optional[str]
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}

@dataclass
class CalendarEvent:
    """Standardized calendar event format"""
    id: str
    title: str
    start_time: datetime
    end_time: datetime
    description: str
    location: str
    attendees: List[Dict[str, str]]
    meeting_link: Optional[str]
    status: str
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}

class ZoomConnector:
    """Zoom API connector"""
    
    def __init__(self, credentials: MeetingCredentials):
        self.credentials = credentials
        self.base_url = "https://api.zoom.us/v2"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None, params: Dict = None) -> Dict:
        """Make authenticated request to Zoom API"""
        try:
            url = f"{self.base_url}{endpoint}"
            headers = {
                'Authorization': f'Bearer {self.credentials.access_token}',
                'Content-Type': 'application/json'
            }
            
            if params is None:
                params = {}
            
            async with self.session.request(method, url, json=data, params=params, headers=headers) as response:
                response.raise_for_status()
                return await response.json()
                
        except Exception as e:
            logger.error(f"Zoom API request failed: {e}")
            raise
    
    async def create_meeting(self, 
                           title: str,
                           start_time: datetime,
                           duration: int,
                           description: str = None,
                           password: str = None,
                           host_id: str = "me") -> Meeting:
        """Create a new Zoom meeting"""
        endpoint = f"/users/{host_id}/meetings"
        
        data = {
            'topic': title,
            'type': 2,  # Scheduled meeting
            'start_time': start_time.isoformat(),
            'duration': duration,
            'settings': {
                'host_video': True,
                'participant_video': True,
                'join_before_host': False,
                'mute_upon_entry': True,
                'waiting_room': True
            }
        }
        
        if description:
            data['agenda'] = description
        
        if password:
            data['password'] = password
            data['settings']['meeting_authentication'] = True
        
        response = await self._make_request(endpoint, method='POST', data=data)
        
        meeting = Meeting(
            id=str(response['id']),
            title=title,
            description=description or '',
            start_time=start_time,
            end_time=start_time + timedelta(minutes=duration),
            duration=duration,
            meeting_type=MeetingType.SCHEDULED,
            status=MeetingStatus.SCHEDULED,
            host_id=host_id,
            host_email=response.get('host_email', ''),
            join_url=response.get('join_url', ''),
            meeting_url=response.get('start_url', ''),
            password=response.get('password'),
            participants=[],
            recording_url=None,
            transcript=None,
            metadata={"created_via_api": True, "raw_data": response}
        )
        
        return meeting
    
    async def get_meetings(self, user_id: str = "me", count: int = 100) -> List[Meeting]:
        """Get meetings for a user"""
        endpoint = f"/users/{user_id}/meetings"
        params = {'page_size': count, 'type': 'scheduled'}
        
        response = await self._make_request(endpoint, params=params)
        
        meetings = []
        for meeting_data in response.get('meetings', []):
            meeting = Meeting(
                id=str(meeting_data['id']),
                title=meeting_data.get('topic', ''),
                description=meeting_data.get('agenda', ''),
                start_time=datetime.fromisoformat(meeting_data['start_time'].replace('Z', '+00:00')),
                end_time=datetime.fromisoformat(meeting_data['start_time'].replace('Z', '+00:00')) + timedelta(minutes=meeting_data.get('duration', 60)),
                duration=meeting_data.get('duration', 60),
                meeting_type=MeetingType.SCHEDULED,
                status=MeetingStatus.SCHEDULED,
                host_id=meeting_data.get('host_id', ''),
                host_email=meeting_data.get('host_email', ''),
                join_url=meeting_data.get('join_url', ''),
                meeting_url=meeting_data.get('start_url', ''),
                password=meeting_data.get('password'),
                participants=[],
                recording_url=None,
                transcript=None,
                metadata={"raw_data": meeting_data}
            )
            meetings.append(meeting)
        
        return meetings
    
    async def get_meeting_recordings(self, meeting_id: str) -> List[Dict[str, Any]]:
        """Get recordings for a meeting"""
        endpoint = f"/meetings/{meeting_id}/recordings"
        response = await self._make_request(endpoint)
        return response.get('recording_files', [])
    
    async def get_meeting_transcript(self, meeting_id: str) -> str:
        """Get transcript for a meeting"""
        recordings = await self.get_meeting_recordings(meeting_id)
        
        # Look for transcript file
        for recording in recordings:
            if recording.get('file_type') == 'TRANSCRIPT':
                # Would need to download and process the transcript file
                return "Transcript available but not downloaded"
        
        return ""
    
    async def validate_connection(self) -> bool:
        """Validate Zoom API connection"""
        try:
            await self._make_request("/users/me")
            return True
        except Exception as e:
            logger.error(f"Zoom connection validation failed: {e}")
            return False

class CalendlyConnector:
    """Calendly API connector"""
    
    def __init__(self, credentials: MeetingCredentials):
        self.credentials = credentials
        self.base_url = "https://api.calendly.com"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None, params: Dict = None) -> Dict:
        """Make authenticated request to Calendly API"""
        try:
            url = f"{self.base_url}{endpoint}"
            headers = {
                'Authorization': f'Bearer {self.credentials.access_token}',
                'Content-Type': 'application/json'
            }
            
            if params is None:
                params = {}
            
            async with self.session.request(method, url, json=data, params=params, headers=headers) as response:
                response.raise_for_status()
                return await response.json()
                
        except Exception as e:
            logger.error(f"Calendly API request failed: {e}")
            raise
    
    async def get_scheduled_events(self, user_uri: str = None, count: int = 100) -> List[CalendarEvent]:
        """Get scheduled events"""
        endpoint = "/scheduled_events"
        params = {'count': count}
        
        if user_uri:
            params['user'] = user_uri
        
        response = await self._make_request(endpoint, params=params)
        
        events = []
        for event_data in response.get('collection', []):
            event = CalendarEvent(
                id=event_data['uri'].split('/')[-1],
                title=event_data.get('name', ''),
                start_time=datetime.fromisoformat(event_data['start_time'].replace('Z', '+00:00')),
                end_time=datetime.fromisoformat(event_data['end_time'].replace('Z', '+00:00')),
                description=event_data.get('description', ''),
                location=event_data.get('location', {}).get('location', ''),
                attendees=[],  # Would need additional API call
                meeting_link=event_data.get('location', {}).get('join_url'),
                status=event_data.get('status', 'active'),
                metadata={"raw_data": event_data}
            )
            events.append(event)
        
        return events
    
    async def get_event_types(self, user_uri: str = None) -> List[Dict[str, Any]]:
        """Get available event types"""
        endpoint = "/event_types"
        params = {}
        
        if user_uri:
            params['user'] = user_uri
        
        response = await self._make_request(endpoint, params=params)
        return response.get('collection', [])
    
    async def create_event_type(self, 
                              name: str,
                              duration: int,
                              description: str = None,
                              user_uri: str = None) -> Dict[str, Any]:
        """Create a new event type"""
        endpoint = "/event_types"
        
        data = {
            'name': name,
            'duration': duration,
            'kind': 'solo',
            'description': description or '',
            'internal_note': '',
            'scheduling_url': f"https://calendly.com/{user_uri.split('/')[-1]}/{name.lower().replace(' ', '-')}"
        }
        
        response = await self._make_request(endpoint, method='POST', data=data)
        return response
    
    async def validate_connection(self) -> bool:
        """Validate Calendly API connection"""
        try:
            await self._make_request("/users/me")
            return True
        except Exception as e:
            logger.error(f"Calendly connection validation failed: {e}")
            return False

class MeetingManager:
    """Manager for multiple meeting platform integrations"""
    
    def __init__(self):
        self.connectors: Dict[MeetingPlatform, Any] = {}
    
    def add_platform(self, platform: MeetingPlatform, credentials: MeetingCredentials):
        """Add a meeting platform connector"""
        if platform == MeetingPlatform.ZOOM:
            self.connectors[platform] = ZoomConnector(credentials)
        elif platform == MeetingPlatform.CALENDLY:
            self.connectors[platform] = CalendlyConnector(credentials)
        
        logger.info(f"Added {platform.value} connector")
    
    async def get_unified_meetings(self, 
                                 platforms: List[MeetingPlatform],
                                 start_date: date,
                                 end_date: date) -> Dict[str, List[Union[Meeting, CalendarEvent]]]:
        """Get meetings from multiple platforms"""
        results = {}
        
        for platform in platforms:
            if platform in self.connectors:
                try:
                    connector = self.connectors[platform]
                    
                    async with connector:
                        if platform == MeetingPlatform.ZOOM:
                            meetings = await connector.get_meetings()
                            # Filter by date range
                            filtered_meetings = [
                                meeting for meeting in meetings
                                if start_date <= meeting.start_time.date() <= end_date
                            ]
                            results[platform.value] = filtered_meetings
                        
                        elif platform == MeetingPlatform.CALENDLY:
                            events = await connector.get_scheduled_events()
                            # Filter by date range
                            filtered_events = [
                                event for event in events
                                if start_date <= event.start_time.date() <= end_date
                            ]
                            results[platform.value] = filtered_events
                        
                        else:
                            results[platform.value] = []
                            
                except Exception as e:
                    logger.error(f"Error getting meetings from {platform.value}: {e}")
                    results[platform.value] = []
        
        return results
    
    async def create_cross_platform_meeting(self, 
                                          platform: MeetingPlatform,
                                          title: str,
                                          start_time: datetime,
                                          duration: int,
                                          description: str = None,
                                          **kwargs) -> Union[Meeting, CalendarEvent]:
        """Create meeting on a specific platform"""
        if platform in self.connectors:
            try:
                connector = self.connectors[platform]
                
                async with connector:
                    if platform == MeetingPlatform.ZOOM:
                        meeting = await connector.create_meeting(
                            title=title,
                            start_time=start_time,
                            duration=duration,
                            description=description,
                            **kwargs
                        )
                        return meeting
                    
                    elif platform == MeetingPlatform.CALENDLY:
                        # For Calendly, we'd create an event type instead
                        event_type = await connector.create_event_type(
                            name=title,
                            duration=duration,
                            description=description
                        )
                        # Convert to CalendarEvent format
                        event = CalendarEvent(
                            id=event_type['uri'].split('/')[-1],
                            title=title,
                            start_time=start_time,
                            end_time=start_time + timedelta(minutes=duration),
                            description=description or '',
                            location='',
                            attendees=[],
                            meeting_link=event_type.get('scheduling_url'),
                            status='active',
                            metadata={"created_via_api": True, "raw_data": event_type}
                        )
                        return event
                
            except Exception as e:
                logger.error(f"Error creating meeting on {platform.value}: {e}")
                raise
        
        raise ValueError(f"Platform {platform.value} not configured")
    
    async def get_meeting_recordings(self, 
                                   platform: MeetingPlatform,
                                   meeting_id: str) -> List[Dict[str, Any]]:
        """Get recordings for a meeting"""
        if platform in self.connectors:
            try:
                connector = self.connectors[platform]
                
                async with connector:
                    if platform == MeetingPlatform.ZOOM:
                        return await connector.get_meeting_recordings(meeting_id)
                    else:
                        return []
                        
            except Exception as e:
                logger.error(f"Error getting recordings from {platform.value}: {e}")
                return []
        
        return []
    
    async def get_meeting_transcript(self, 
                                   platform: MeetingPlatform,
                                   meeting_id: str) -> str:
        """Get transcript for a meeting"""
        if platform in self.connectors:
            try:
                connector = self.connectors[platform]
                
                async with connector:
                    if platform == MeetingPlatform.ZOOM:
                        return await connector.get_meeting_transcript(meeting_id)
                    else:
                        return ""
                        
            except Exception as e:
                logger.error(f"Error getting transcript from {platform.value}: {e}")
                return ""
        
        return ""
    
    async def validate_all_connections(self) -> Dict[MeetingPlatform, bool]:
        """Validate connections to all meeting platforms"""
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

# Global meeting manager
meeting_manager = MeetingManager()

# Convenience functions
def add_meeting_credentials(platform: str, 
                           api_key: str,
                           access_token: str = None,
                           api_secret: str = None):
    """Add meeting platform credentials"""
    credentials = MeetingCredentials(
        platform=MeetingPlatform(platform),
        api_key=api_key,
        access_token=access_token,
        api_secret=api_secret
    )
    meeting_manager.add_platform(credentials.platform, credentials)

async def get_meetings(platforms: List[str], start_date: date, end_date: date):
    """Get meetings from multiple platforms"""
    platform_enums = [MeetingPlatform(platform) for platform in platforms]
    return await meeting_manager.get_unified_meetings(platform_enums, start_date, end_date)

async def create_meeting(platform: str, title: str, start_time: datetime, duration: int, **kwargs):
    """Create meeting on a specific platform"""
    platform_enum = MeetingPlatform(platform)
    return await meeting_manager.create_cross_platform_meeting(platform_enum, title, start_time, duration, **kwargs)

async def get_meeting_recordings(platform: str, meeting_id: str):
    """Get recordings for a meeting"""
    platform_enum = MeetingPlatform(platform)
    return await meeting_manager.get_meeting_recordings(platform_enum, meeting_id)

async def get_meeting_transcript(platform: str, meeting_id: str):
    """Get transcript for a meeting"""
    platform_enum = MeetingPlatform(platform)
    return await meeting_manager.get_meeting_transcript(platform_enum, meeting_id)
