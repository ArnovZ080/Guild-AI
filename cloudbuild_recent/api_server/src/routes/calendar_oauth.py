"""
Calendar OAuth & Sync Routes
Google Calendar and Outlook Calendar OAuth flows and webhook handlers
"""

from fastapi import APIRouter, HTTPException, Request, BackgroundTasks
from pydantic import BaseModel
from typing import Optional
import os
import secrets
from datetime import datetime, timedelta

router = APIRouter(prefix="/calendar/oauth", tags=["calendar-oauth"])

# In-memory session store (replace with Redis in production)
oauth_sessions = {}
sync_tokens = {}


# ==================== MODELS ====================

class OAuthInitRequest(BaseModel):
    user_id: str
    provider: str  # 'google' or 'outlook'
    redirect_uri: str


class OAuthCallbackRequest(BaseModel):
    user_id: str
    provider: str
    code: str
    state: str
    redirect_uri: str


class WebhookPayload(BaseModel):
    channel_id: str
    resource_id: str
    resource_state: str  # 'sync', 'exists', 'not_exists'
    resource_uri: str
    changed: Optional[str] = None


# ==================== GOOGLE CALENDAR OAUTH ====================

@router.post("/google/init")
async def init_google_oauth(request: OAuthInitRequest):
    """
    Initialize Google Calendar OAuth flow
    Returns authorization URL and state token
    """
    # Generate state token for security
    state = secrets.token_urlsafe(32)
    
    # Store session
    oauth_sessions[state] = {
        'user_id': request.user_id,
        'provider': 'google',
        'redirect_uri': request.redirect_uri,
        'created_at': datetime.now(),
        'expires_at': datetime.now() + timedelta(minutes=10)
    }
    
    # Build Google OAuth URL
    google_oauth_url = "https://accounts.google.com/o/oauth2/v2/auth"
    client_id = os.getenv('GOOGLE_CLIENT_ID', 'your_client_id')
    
    params = {
        'client_id': client_id,
        'redirect_uri': request.redirect_uri,
        'response_type': 'code',
        'scope': 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events',
        'state': state,
        'access_type': 'offline',
        'prompt': 'consent'
    }
    
    auth_url = f"{google_oauth_url}?{'&'.join([f'{k}={v}' for k, v in params.items()])}"
    
    return {
        "success": True,
        "authorization_url": auth_url,
        "state": state,
        "expires_in": 600  # 10 minutes
    }


@router.post("/google/callback")
async def google_oauth_callback(request: OAuthCallbackRequest, background_tasks: BackgroundTasks):
    """
    Handle Google OAuth callback
    Exchange authorization code for access tokens
    """
    # Verify state token
    session = oauth_sessions.get(request.state)
    if not session:
        raise HTTPException(status_code=400, detail="Invalid or expired state token")
    
    if session['user_id'] != request.user_id:
        raise HTTPException(status_code=403, detail="User mismatch")
    
    if datetime.now() > session['expires_at']:
        raise HTTPException(status_code=400, detail="Session expired")
    
    # In production, exchange code for tokens using Google OAuth API
    # For now, simulate the response
    mock_tokens = {
        'access_token': f'ya29.mock_access_token_{secrets.token_urlsafe(32)}',
        'refresh_token': f'1//mock_refresh_token_{secrets.token_urlsafe(32)}',
        'token_type': 'Bearer',
        'expires_in': 3600,
        'scope': 'https://www.googleapis.com/auth/calendar'
    }
    
    # Store tokens (in production, encrypt and store in database)
    sync_tokens[request.user_id] = {
        'provider': 'google',
        'access_token': mock_tokens['access_token'],
        'refresh_token': mock_tokens['refresh_token'],
        'expires_at': datetime.now() + timedelta(seconds=mock_tokens['expires_in']),
        'created_at': datetime.now()
    }
    
    # Clean up session
    del oauth_sessions[request.state]
    
    # Schedule initial sync in background
    background_tasks.add_task(initial_calendar_sync, request.user_id, 'google')
    
    return {
        "success": True,
        "message": "Google Calendar connected successfully",
        "provider": "google",
        "user_id": request.user_id,
        "sync_scheduled": True
    }


@router.post("/google/disconnect")
async def disconnect_google_calendar(user_id: str):
    """Disconnect Google Calendar"""
    if user_id in sync_tokens:
        del sync_tokens[user_id]
        return {
            "success": True,
            "message": "Google Calendar disconnected"
        }
    
    raise HTTPException(status_code=404, detail="No Google Calendar connection found")


@router.get("/google/status")
async def get_google_sync_status(user_id: str):
    """Get Google Calendar sync status"""
    token_info = sync_tokens.get(user_id)
    
    if not token_info or token_info['provider'] != 'google':
        return {
            "success": True,
            "connected": False,
            "provider": "google"
        }
    
    is_expired = datetime.now() > token_info['expires_at']
    
    return {
        "success": True,
        "connected": True,
        "provider": "google",
        "connected_at": token_info['created_at'].isoformat(),
        "expires_at": token_info['expires_at'].isoformat(),
        "is_expired": is_expired,
        "last_sync": None  # Would come from database
    }


# ==================== OUTLOOK CALENDAR OAUTH ====================

@router.post("/outlook/init")
async def init_outlook_oauth(request: OAuthInitRequest):
    """
    Initialize Outlook Calendar OAuth flow
    Returns authorization URL and state token
    """
    state = secrets.token_urlsafe(32)
    
    oauth_sessions[state] = {
        'user_id': request.user_id,
        'provider': 'outlook',
        'redirect_uri': request.redirect_uri,
        'created_at': datetime.now(),
        'expires_at': datetime.now() + timedelta(minutes=10)
    }
    
    # Build Microsoft OAuth URL
    tenant = 'common'  # or 'organizations' or specific tenant ID
    client_id = os.getenv('MICROSOFT_CLIENT_ID', 'your_client_id')
    
    auth_url = f"https://login.microsoftonline.com/{tenant}/oauth2/v2.0/authorize"
    params = {
        'client_id': client_id,
        'response_type': 'code',
        'redirect_uri': request.redirect_uri,
        'response_mode': 'query',
        'scope': 'openid profile offline_access Calendars.ReadWrite',
        'state': state
    }
    
    full_url = f"{auth_url}?{'&'.join([f'{k}={v}' for k, v in params.items()])}"
    
    return {
        "success": True,
        "authorization_url": full_url,
        "state": state,
        "expires_in": 600
    }


@router.post("/outlook/callback")
async def outlook_oauth_callback(request: OAuthCallbackRequest, background_tasks: BackgroundTasks):
    """Handle Outlook OAuth callback"""
    session = oauth_sessions.get(request.state)
    if not session:
        raise HTTPException(status_code=400, detail="Invalid or expired state token")
    
    if session['user_id'] != request.user_id:
        raise HTTPException(status_code=403, detail="User mismatch")
    
    # Mock token exchange
    mock_tokens = {
        'access_token': f'EwB...mock_outlook_token_{secrets.token_urlsafe(32)}',
        'refresh_token': f'M.R3_...mock_refresh_{secrets.token_urlsafe(32)}',
        'token_type': 'Bearer',
        'expires_in': 3600
    }
    
    sync_tokens[request.user_id] = {
        'provider': 'outlook',
        'access_token': mock_tokens['access_token'],
        'refresh_token': mock_tokens['refresh_token'],
        'expires_at': datetime.now() + timedelta(seconds=mock_tokens['expires_in']),
        'created_at': datetime.now()
    }
    
    del oauth_sessions[request.state]
    
    background_tasks.add_task(initial_calendar_sync, request.user_id, 'outlook')
    
    return {
        "success": True,
        "message": "Outlook Calendar connected successfully",
        "provider": "outlook",
        "user_id": request.user_id,
        "sync_scheduled": True
    }


# ==================== WEBHOOKS ====================

@router.post("/webhook/google")
async def google_calendar_webhook(request: Request, background_tasks: BackgroundTasks):
    """
    Handle Google Calendar push notifications
    Called when calendar events change
    """
    headers = request.headers
    
    # Verify webhook is from Google
    channel_id = headers.get('X-Goog-Channel-ID')
    resource_id = headers.get('X-Goog-Resource-ID')
    resource_state = headers.get('X-Goog-Resource-State')
    resource_uri = headers.get('X-Goog-Resource-URI')
    
    if not channel_id:
        raise HTTPException(status_code=400, detail="Invalid webhook")
    
    # Extract user_id from channel_id (format: guild-ai-{user_id}-{timestamp})
    try:
        user_id = channel_id.split('-')[2]
    except:
        raise HTTPException(status_code=400, detail="Invalid channel ID")
    
    # Handle different resource states
    if resource_state == 'sync':
        # Initial sync message, can be ignored
        return {"success": True, "message": "Sync acknowledged"}
    
    elif resource_state in ['exists', 'not_exists']:
        # Calendar changed, trigger incremental sync
        background_tasks.add_task(incremental_calendar_sync, user_id, 'google')
        
        return {
            "success": True,
            "message": "Sync triggered",
            "user_id": user_id,
            "state": resource_state
        }
    
    return {"success": True, "message": "Webhook received"}


@router.post("/webhook/outlook")
async def outlook_calendar_webhook(payload: WebhookPayload, background_tasks: BackgroundTasks):
    """
    Handle Outlook Calendar webhooks
    Microsoft Graph API notifications
    """
    # Extract user_id from subscription
    user_id = payload.channel_id.split('-')[2] if '-' in payload.channel_id else None
    
    if not user_id:
        raise HTTPException(status_code=400, detail="Invalid subscription")
    
    if payload.resource_state in ['created', 'updated', 'deleted']:
        background_tasks.add_task(incremental_calendar_sync, user_id, 'outlook')
    
    return {
        "success": True,
        "message": "Webhook processed",
        "user_id": user_id
    }


# ==================== SYNC FUNCTIONS ====================

async def initial_calendar_sync(user_id: str, provider: str):
    """Perform initial full calendar sync"""
    print(f"[SYNC] Starting initial {provider} calendar sync for user {user_id}")
    
    # In production:
    # 1. Fetch all events from external calendar
    # 2. Transform to Guild format
    # 3. Save to database
    # 4. Store sync token for incremental sync
    
    # Mock implementation
    await asyncio.sleep(2)  # Simulate API call
    print(f"[SYNC] Initial sync completed for user {user_id}")


async def incremental_calendar_sync(user_id: str, provider: str):
    """Perform incremental calendar sync using sync token"""
    print(f"[SYNC] Starting incremental {provider} calendar sync for user {user_id}")
    
    # In production:
    # 1. Use stored sync token
    # 2. Fetch only changed events
    # 3. Update database
    # 4. Update sync token
    
    await asyncio.sleep(1)  # Simulate API call
    print(f"[SYNC] Incremental sync completed for user {user_id}")


# ==================== SYNC MANAGEMENT ====================

@router.post("/sync/manual")
async def trigger_manual_sync(user_id: str, provider: str, background_tasks: BackgroundTasks):
    """Manually trigger calendar sync"""
    token_info = sync_tokens.get(user_id)
    
    if not token_info or token_info['provider'] != provider:
        raise HTTPException(status_code=404, detail=f"No {provider} connection found")
    
    if datetime.now() > token_info['expires_at']:
        raise HTTPException(status_code=401, detail="Token expired, please reconnect")
    
    background_tasks.add_task(initial_calendar_sync, user_id, provider)
    
    return {
        "success": True,
        "message": f"Manual sync triggered for {provider}",
        "user_id": user_id
    }


@router.get("/connections")
async def get_all_connections(user_id: str):
    """Get all calendar connections for a user"""
    connections = []
    
    token_info = sync_tokens.get(user_id)
    if token_info:
        connections.append({
            'provider': token_info['provider'],
            'connected': True,
            'connected_at': token_info['created_at'].isoformat(),
            'expires_at': token_info['expires_at'].isoformat(),
            'is_expired': datetime.now() > token_info['expires_at']
        })
    
    return {
        "success": True,
        "user_id": user_id,
        "connections": connections,
        "total": len(connections)
    }


# Async import for background tasks
import asyncio

