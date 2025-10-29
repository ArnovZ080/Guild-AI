"""
Google Calendar Integration Service
Handles OAuth, sync, and bidirectional calendar updates
"""

from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import os
import json
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError


class GoogleCalendarService:
    """Service for Google Calendar API integration"""
    
    SCOPES = [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events'
    ]
    
    def __init__(self, user_id: str, credentials_json: Optional[str] = None):
        self.user_id = user_id
        self.credentials = None
        self.service = None
        
        if credentials_json:
            self._load_credentials(credentials_json)
    
    def _load_credentials(self, credentials_json: str):
        """Load credentials from JSON string"""
        try:
            creds_dict = json.loads(credentials_json)
            self.credentials = Credentials.from_authorized_user_info(creds_dict, self.SCOPES)
            self._build_service()
        except Exception as e:
            print(f"Error loading credentials: {e}")
    
    def _build_service(self):
        """Build Google Calendar API service"""
        if self.credentials and self.credentials.valid:
            self.service = build('calendar', 'v3', credentials=self.credentials)
        elif self.credentials and self.credentials.expired and self.credentials.refresh_token:
            self.credentials.refresh(Request())
            self.service = build('calendar', 'v3', credentials=self.credentials)
    
    @staticmethod
    def get_authorization_url(client_config: Dict[str, Any], redirect_uri: str) -> tuple:
        """
        Get OAuth authorization URL
        Returns: (authorization_url, state)
        """
        flow = Flow.from_client_config(
            client_config,
            scopes=GoogleCalendarService.SCOPES,
            redirect_uri=redirect_uri
        )
        
        authorization_url, state = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            prompt='consent'  # Force consent to get refresh token
        )
        
        return authorization_url, state
    
    @staticmethod
    def exchange_code_for_credentials(
        client_config: Dict[str, Any],
        authorization_code: str,
        redirect_uri: str,
        state: str
    ) -> Dict[str, Any]:
        """
        Exchange authorization code for credentials
        Returns: credentials dict
        """
        flow = Flow.from_client_config(
            client_config,
            scopes=GoogleCalendarService.SCOPES,
            redirect_uri=redirect_uri,
            state=state
        )
        
        flow.fetch_token(code=authorization_code)
        credentials = flow.credentials
        
        return {
            'token': credentials.token,
            'refresh_token': credentials.refresh_token,
            'token_uri': credentials.token_uri,
            'client_id': credentials.client_id,
            'client_secret': credentials.client_secret,
            'scopes': credentials.scopes,
            'expiry': credentials.expiry.isoformat() if credentials.expiry else None
        }
    
    def list_calendars(self) -> List[Dict[str, Any]]:
        """List all calendars for the user"""
        if not self.service:
            raise Exception("Service not initialized. Please authenticate first.")
        
        try:
            calendar_list = self.service.calendarList().list().execute()
            return calendar_list.get('items', [])
        except HttpError as error:
            print(f"An error occurred: {error}")
            return []
    
    def get_events(
        self,
        calendar_id: str = 'primary',
        time_min: Optional[datetime] = None,
        time_max: Optional[datetime] = None,
        max_results: int = 100,
        sync_token: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get events from Google Calendar
        Supports incremental sync using sync_token
        """
        if not self.service:
            raise Exception("Service not initialized. Please authenticate first.")
        
        try:
            params = {
                'calendarId': calendar_id,
                'maxResults': max_results,
                'singleEvents': True,
                'orderBy': 'startTime'
            }
            
            if sync_token:
                # Incremental sync
                params['syncToken'] = sync_token
            else:
                # Full sync with time range
                if time_min:
                    params['timeMin'] = time_min.isoformat() + 'Z'
                if time_max:
                    params['timeMax'] = time_max.isoformat() + 'Z'
            
            events_result = self.service.events().list(**params).execute()
            
            return {
                'events': events_result.get('items', []),
                'next_sync_token': events_result.get('nextSyncToken'),
                'next_page_token': events_result.get('nextPageToken')
            }
        except HttpError as error:
            print(f"An error occurred: {error}")
            return {'events': [], 'next_sync_token': None, 'next_page_token': None}
    
    def create_event(
        self,
        title: str,
        start_time: datetime,
        end_time: datetime,
        description: Optional[str] = None,
        location: Optional[str] = None,
        attendees: Optional[List[str]] = None,
        calendar_id: str = 'primary',
        reminders: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Create a new event in Google Calendar"""
        if not self.service:
            raise Exception("Service not initialized. Please authenticate first.")
        
        event = {
            'summary': title,
            'start': {
                'dateTime': start_time.isoformat(),
                'timeZone': 'UTC',
            },
            'end': {
                'dateTime': end_time.isoformat(),
                'timeZone': 'UTC',
            },
        }
        
        if description:
            event['description'] = description
        
        if location:
            event['location'] = location
        
        if attendees:
            event['attendees'] = [{'email': email} for email in attendees]
        
        if reminders:
            event['reminders'] = reminders
        else:
            event['reminders'] = {
                'useDefault': True
            }
        
        try:
            created_event = self.service.events().insert(
                calendarId=calendar_id,
                body=event
            ).execute()
            
            return created_event
        except HttpError as error:
            print(f"An error occurred: {error}")
            raise
    
    def update_event(
        self,
        event_id: str,
        title: Optional[str] = None,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
        description: Optional[str] = None,
        location: Optional[str] = None,
        attendees: Optional[List[str]] = None,
        calendar_id: str = 'primary'
    ) -> Dict[str, Any]:
        """Update an existing event in Google Calendar"""
        if not self.service:
            raise Exception("Service not initialized. Please authenticate first.")
        
        try:
            # Get existing event
            event = self.service.events().get(
                calendarId=calendar_id,
                eventId=event_id
            ).execute()
            
            # Update fields
            if title:
                event['summary'] = title
            if description is not None:
                event['description'] = description
            if location is not None:
                event['location'] = location
            if start_time:
                event['start'] = {
                    'dateTime': start_time.isoformat(),
                    'timeZone': 'UTC',
                }
            if end_time:
                event['end'] = {
                    'dateTime': end_time.isoformat(),
                    'timeZone': 'UTC',
                }
            if attendees is not None:
                event['attendees'] = [{'email': email} for email in attendees]
            
            # Update event
            updated_event = self.service.events().update(
                calendarId=calendar_id,
                eventId=event_id,
                body=event
            ).execute()
            
            return updated_event
        except HttpError as error:
            print(f"An error occurred: {error}")
            raise
    
    def delete_event(self, event_id: str, calendar_id: str = 'primary'):
        """Delete an event from Google Calendar"""
        if not self.service:
            raise Exception("Service not initialized. Please authenticate first.")
        
        try:
            self.service.events().delete(
                calendarId=calendar_id,
                eventId=event_id
            ).execute()
            return True
        except HttpError as error:
            print(f"An error occurred: {error}")
            return False
    
    def watch_calendar(
        self,
        webhook_url: str,
        calendar_id: str = 'primary',
        ttl: int = 604800  # 7 days in seconds
    ) -> Dict[str, Any]:
        """
        Set up push notifications for calendar changes
        webhook_url: Your webhook endpoint URL
        ttl: Time to live in seconds (max 604800 = 7 days)
        """
        if not self.service:
            raise Exception("Service not initialized. Please authenticate first.")
        
        try:
            body = {
                'id': f"guild-ai-{self.user_id}-{datetime.now().timestamp()}",
                'type': 'web_hook',
                'address': webhook_url,
                'params': {
                    'ttl': str(ttl)
                }
            }
            
            watch_response = self.service.events().watch(
                calendarId=calendar_id,
                body=body
            ).execute()
            
            return watch_response
        except HttpError as error:
            print(f"An error occurred: {error}")
            raise
    
    def convert_to_guild_event(self, google_event: Dict[str, Any]) -> Dict[str, Any]:
        """Convert Google Calendar event to Guild AI event format"""
        # Handle both datetime and date formats
        start = google_event.get('start', {})
        end = google_event.get('end', {})
        
        start_time = start.get('dateTime') or start.get('date')
        end_time = end.get('dateTime') or end.get('date')
        
        if start_time and isinstance(start_time, str):
            start_time = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
        if end_time and isinstance(end_time, str):
            end_time = datetime.fromisoformat(end_time.replace('Z', '+00:00'))
        
        # Calculate duration
        duration = None
        if start_time and end_time:
            duration = int((end_time - start_time).total_seconds() / 60)
        
        # Extract attendees
        attendees = []
        if 'attendees' in google_event:
            attendees = [att.get('email') for att in google_event['attendees']]
        
        return {
            'title': google_event.get('summary', 'Untitled Event'),
            'description': google_event.get('description', ''),
            'start_time': start_time,
            'end_time': end_time,
            'duration': duration,
            'location': google_event.get('location', ''),
            'attendees': attendees,
            'external_calendar_id': google_event.get('id'),
            'external_source': 'google',
            'type': self._infer_event_type(google_event),
            'metadata': {
                'google_event_link': google_event.get('htmlLink'),
                'google_hangout_link': google_event.get('hangoutLink'),
                'google_status': google_event.get('status'),
                'organizer': google_event.get('organizer', {}).get('email')
            }
        }
    
    def _infer_event_type(self, google_event: Dict[str, Any]) -> str:
        """Infer event type from Google Calendar event"""
        summary = (google_event.get('summary', '') or '').lower()
        description = (google_event.get('description', '') or '').lower()
        combined = f"{summary} {description}"
        
        # Check for keywords
        if any(word in combined for word in ['meeting', 'call', 'zoom', 'teams', 'meet']):
            return 'meeting'
        elif any(word in combined for word in ['lunch', 'dinner', 'breakfast', 'coffee']):
            return 'personal'
        elif any(word in combined for word in ['workout', 'gym', 'yoga', 'exercise', 'run']):
            return 'wellness'
        elif any(word in combined for word in ['report', 'review', 'financial', 'budget']):
            return 'financial'
        elif any(word in combined for word in ['write', 'post', 'content', 'blog', 'social']):
            return 'content'
        else:
            return 'meeting'  # Default to meeting
    
    def sync_to_guild(self, calendar_id: str = 'primary', sync_token: Optional[str] = None) -> Dict[str, Any]:
        """
        Sync Google Calendar events to Guild AI
        Returns events and new sync token
        """
        result = self.get_events(calendar_id=calendar_id, sync_token=sync_token)
        
        guild_events = []
        for google_event in result['events']:
            # Skip cancelled events
            if google_event.get('status') == 'cancelled':
                continue
            
            guild_event = self.convert_to_guild_event(google_event)
            guild_events.append(guild_event)
        
        return {
            'events': guild_events,
            'next_sync_token': result['next_sync_token'],
            'count': len(guild_events)
        }


# Example usage and helper functions
def get_google_calendar_oauth_url(redirect_uri: str) -> tuple:
    """
    Get OAuth URL for Google Calendar
    Returns: (url, state)
    """
    client_config = {
        "web": {
            "client_id": os.getenv("GOOGLE_CLIENT_ID"),
            "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs"
        }
    }
    
    return GoogleCalendarService.get_authorization_url(client_config, redirect_uri)


def exchange_google_code(authorization_code: str, redirect_uri: str, state: str) -> Dict[str, Any]:
    """Exchange Google authorization code for credentials"""
    client_config = {
        "web": {
            "client_id": os.getenv("GOOGLE_CLIENT_ID"),
            "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs"
        }
    }
    
    return GoogleCalendarService.exchange_code_for_credentials(
        client_config, authorization_code, redirect_uri, state
    )

