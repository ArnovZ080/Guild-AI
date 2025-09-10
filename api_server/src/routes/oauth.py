"""
OAuth API Routes for Guild-AI

Handles OAuth authentication flows for Google Drive, Dropbox, and other providers.
"""

from fastapi import APIRouter, HTTPException, Depends, Query, Request
from sqlalchemy.orm import Session
from typing import Dict, Any, List
import uuid
import secrets
import os
from datetime import datetime, timedelta

from .. import models
from ..database import get_db
# For now, we'll implement a simple OAuth flow without the complex connectors
# This will be expanded once the basic structure is working
google_drive_connector = None
dropbox_connector = None

router = APIRouter(
    prefix="/oauth",
    tags=["OAuth"],
)

# Connectors are initialized above with error handling

@router.get("/providers")
async def get_available_providers():
    """
    Get list of available OAuth providers.
    """
    return {
        "success": True,
        "data": [
            {
                "id": "workspace",
                "name": "Workspace",
                "oauth_required": False,
                "description": "Local workspace storage"
            },
            {
                "id": "gdrive",
                "name": "Google Drive",
                "oauth_required": True,
                "description": "Google Drive cloud storage"
            },
            {
                "id": "dropbox",
                "name": "Dropbox",
                "oauth_required": True,
                "description": "Dropbox file sharing platform"
            }
        ]
    }

@router.get("/{provider}/start")
async def start_oauth_flow(
    provider: str,
    redirect_uri: str = Query(None, description="Custom redirect URI"),
    db: Session = Depends(get_db)
):
    """
    Start OAuth flow for a provider.
    
    Args:
        provider: Provider ID (gdrive, dropbox)
        redirect_uri: Optional custom redirect URI
    """
    try:
        # Generate state for CSRF protection
        state = secrets.token_urlsafe(32)
        
        # Store state in database for validation
        state_record = models.OAuthState(
            state=state,
            provider=provider,
            expires_at=datetime.utcnow() + timedelta(minutes=10)
        )
        db.add(state_record)
        db.commit()
        
        # Generate auth URL (simplified for now)
        if provider == "gdrive":
            client_id = os.getenv('GOOGLE_CLIENT_ID')
            redirect_uri = os.getenv('GOOGLE_REDIRECT_URI', 'http://localhost:5001/api/oauth/gdrive/callback')
            auth_url = f"https://accounts.google.com/o/oauth2/auth?client_id={client_id}&redirect_uri={redirect_uri}&scope=https://www.googleapis.com/auth/drive.readonly&response_type=code&state={state}"
            auth_data = {"auth_url": auth_url, "state": state}
        elif provider == "dropbox":
            # Placeholder for Dropbox
            auth_data = {"auth_url": "https://www.dropbox.com/oauth2/authorize", "state": state}
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported provider: {provider}")
        
        return {
            "success": True,
            "data": {
                "auth_url": auth_data["auth_url"],
                "state": state
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error starting OAuth flow: {str(e)}")

@router.get("/{provider}/callback")
async def oauth_callback(
    provider: str,
    code: str = Query(..., description="Authorization code"),
    state: str = Query(..., description="State parameter"),
    db: Session = Depends(get_db)
):
    """
    Handle OAuth callback from provider.
    
    Args:
        provider: Provider ID
        code: Authorization code
        state: State parameter
    """
    try:
        # Validate state
        state_record = db.query(models.OAuthState).filter(
            models.OAuthState.state == state,
            models.OAuthState.provider == provider,
            models.OAuthState.expires_at > datetime.utcnow()
        ).first()
        
        if not state_record:
            raise HTTPException(status_code=400, detail="Invalid or expired state")
        
        # For now, return mock token data (will be implemented properly later)
        if provider == "gdrive":
            token_data = {
                "access_token": f"mock_access_token_{code[:10]}",
                "refresh_token": f"mock_refresh_token_{code[:10]}",
                "expires_at": (datetime.utcnow() + timedelta(hours=1)).isoformat(),
                "account_id": "test@gmail.com",
                "account_name": "Test User",
                "scopes": ["https://www.googleapis.com/auth/drive.readonly"]
            }
        elif provider == "dropbox":
            token_data = {
                "access_token": f"mock_dropbox_token_{code[:10]}",
                "refresh_token": None,
                "expires_at": None,
                "account_id": "test@dropbox.com",
                "account_name": "Test Dropbox User",
                "scopes": ["files.metadata.read", "files.content.read"]
            }
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported provider: {provider}")
        
        # Store credentials in database
        credential = models.ConnectorCredential(
            id=str(uuid.uuid4()),
            provider=provider,
            account_id=token_data.get("account_id"),
            account_name=token_data.get("account_name"),
            access_token=token_data.get("access_token"),
            refresh_token=token_data.get("refresh_token"),
            expires_at=datetime.fromisoformat(token_data["expires_at"]) if token_data.get("expires_at") else None,
            scopes=token_data.get("scopes", [])
        )
        
        db.add(credential)
        db.delete(state_record)  # Clean up state
        db.commit()
        
        return {
            "success": True,
            "data": {
                "credential_id": credential.id,
                "provider": provider,
                "account_id": credential.account_id,
                "expires_at": credential.expires_at.isoformat() if credential.expires_at else None
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing OAuth callback: {str(e)}")

@router.get("/credentials")
async def list_oauth_credentials(db: Session = Depends(get_db)):
    """
    List all OAuth credentials.
    """
    try:
        credentials = db.query(models.ConnectorCredential).all()
        
        credential_list = []
        for cred in credentials:
            credential_list.append({
                "id": cred.id,
                "provider": cred.provider,
                "account_id": cred.account_id,
                "account_name": cred.account_name,
                "expires_at": cred.expires_at.isoformat() if cred.expires_at else None,
                "scopes": cred.scopes,
                "created_at": cred.created_at.isoformat()
            })
        
        return {
            "success": True,
            "data": credential_list
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing credentials: {str(e)}")

@router.delete("/credentials/{credential_id}")
async def delete_oauth_credential(
    credential_id: str,
    db: Session = Depends(get_db)
):
    """
    Delete an OAuth credential.
    
    Args:
        credential_id: Credential UUID
    """
    try:
        credential = db.query(models.ConnectorCredential).filter(
            models.ConnectorCredential.id == credential_id
        ).first()
        
        if not credential:
            raise HTTPException(status_code=404, detail="Credential not found")
        
        db.delete(credential)
        db.commit()
        
        return {
            "success": True,
            "message": "Credential deleted successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting credential: {str(e)}")

@router.post("/credentials/{credential_id}/test")
async def test_oauth_credential(
    credential_id: str,
    db: Session = Depends(get_db)
):
    """
    Test an OAuth credential.
    
    Args:
        credential_id: Credential UUID
    """
    try:
        credential = db.query(models.ConnectorCredential).filter(
            models.ConnectorCredential.id == credential_id
        ).first()
        
        if not credential:
            raise HTTPException(status_code=404, detail="Credential not found")
        
        # Prepare credentials dict
        creds_dict = {
            "access_token": credential.access_token,
            "refresh_token": credential.refresh_token
        }
        
        # For now, return mock test result
        success = True  # Mock successful connection
        
        return {
            "success": True,
            "data": {
                "credential_id": credential_id,
                "provider": credential.provider,
                "connection_successful": success
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error testing credential: {str(e)}")
