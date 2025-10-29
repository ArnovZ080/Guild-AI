"""
Google Drive Connector for Guild-AI

This connector handles OAuth authentication and file operations with Google Drive.
It integrates with the MarkItDown processor to handle various document formats.
"""

import os
import logging
from typing import Iterable, Dict, Any, Optional, List
from datetime import datetime, timedelta
import tempfile
import shutil

try:
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import Flow
    from google.auth.transport.requests import Request
    from googleapiclient.discovery import build
    from googleapiclient.errors import HttpError
    GOOGLE_AVAILABLE = True
except ImportError:
    GOOGLE_AVAILABLE = False
    print("Warning: Google Drive connector not available. Install with: pip install google-api-python-client google-auth-httplib2 google-auth-oauthlib")

from ..core.schemas import DataRoom, DocumentMeta
from ..core.storage import Connector

logger = logging.getLogger(__name__)

class GoogleDriveConnector(Connector):
    """
    Google Drive connector for OAuth authentication and file operations.
    """
    
    provider: str = "gdrive"
    
    def __init__(self):
        """Initialize the Google Drive connector."""
        if not GOOGLE_AVAILABLE:
            raise ImportError(
                "Google Drive connector is not available. Please install:\n"
                "pip install google-api-python-client google-auth-httplib2 google-auth-oauthlib"
            )
        
        # OAuth configuration
        self.client_id = os.getenv('GOOGLE_CLIENT_ID')
        self.client_secret = os.getenv('GOOGLE_CLIENT_SECRET')
        self.redirect_uri = os.getenv('GOOGLE_REDIRECT_URI', 'http://localhost:5001/api/oauth/gdrive/callback')
        
        # Scopes for Google Drive access
        self.scopes = [
            'https://www.googleapis.com/auth/drive.readonly',
            'https://www.googleapis.com/auth/drive.metadata.readonly'
        ]
        
        logger.info("Google Drive connector initialized")
    
    def get_auth_url(self, state: str = None) -> Dict[str, str]:
        """
        Generate OAuth authorization URL.
        
        Args:
            state: Optional state parameter for CSRF protection
            
        Returns:
            Dictionary with auth_url and state
        """
        if not self.client_id or not self.client_secret:
            raise ValueError("Google OAuth credentials not configured")
        
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": [self.redirect_uri]
                }
            },
            scopes=self.scopes
        )
        flow.redirect_uri = self.redirect_uri
        
        auth_url, state = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            state=state
        )
        
        return {
            "auth_url": auth_url,
            "state": state
        }
    
    def exchange_code_for_token(self, code: str, state: str = None) -> Dict[str, Any]:
        """
        Exchange authorization code for access token.
        
        Args:
            code: Authorization code from OAuth callback
            state: State parameter for CSRF protection
            
        Returns:
            Dictionary with token information
        """
        if not self.client_id or not self.client_secret:
            raise ValueError("Google OAuth credentials not configured")
        
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": [self.redirect_uri]
                }
            },
            scopes=self.scopes
        )
        flow.redirect_uri = self.redirect_uri
        
        try:
            flow.fetch_token(code=code)
            credentials = flow.credentials
            
            # Get user info
            service = build('oauth2', 'v2', credentials=credentials)
            user_info = service.userinfo().get().execute()
            
            return {
                "access_token": credentials.token,
                "refresh_token": credentials.refresh_token,
                "expires_at": credentials.expiry.isoformat() if credentials.expiry else None,
                "account_id": user_info.get('email'),
                "account_name": user_info.get('name'),
                "scopes": self.scopes
            }
            
        except Exception as e:
            logger.error(f"Error exchanging code for token: {str(e)}")
            raise
    
    def refresh_token(self, refresh_token: str) -> Dict[str, Any]:
        """
        Refresh expired access token.
        
        Args:
            refresh_token: Refresh token from stored credentials
            
        Returns:
            Dictionary with new token information
        """
        credentials = Credentials(
            token=None,
            refresh_token=refresh_token,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=self.client_id,
            client_secret=self.client_secret
        )
        
        try:
            credentials.refresh(Request())
            
            return {
                "access_token": credentials.token,
                "expires_at": credentials.expiry.isoformat() if credentials.expiry else None
            }
            
        except Exception as e:
            logger.error(f"Error refreshing token: {str(e)}")
            raise
    
    def list_documents(self, data_room: DataRoom, credentials: Dict[str, Any]) -> Iterable[DocumentMeta]:
        """
        List documents from Google Drive folder.
        
        Args:
            data_room: Data room configuration
            credentials: OAuth credentials
            
        Returns:
            Iterable of DocumentMeta objects
        """
        try:
            # Create credentials object
            creds = Credentials(
                token=credentials.get('access_token'),
                refresh_token=credentials.get('refresh_token'),
                token_uri="https://oauth2.googleapis.com/token",
                client_id=self.client_id,
                client_secret=self.client_secret
            )
            
            # Build Drive service
            service = build('drive', 'v3', credentials=creds)
            
            # Get folder ID from data room config
            folder_id = data_room.config.get('folder_id')
            if not folder_id:
                raise ValueError("No folder_id specified in data room config")
            
            # List files in folder
            query = f"'{folder_id}' in parents and trashed=false"
            results = service.files().list(
                q=query,
                fields="nextPageToken, files(id, name, mimeType, modifiedTime, size, webViewLink)"
            ).execute()
            
            documents = []
            for file in results.get('files', []):
                # Skip folders
                if file.get('mimeType') == 'application/vnd.google-apps.folder':
                    continue
                
                # Create document metadata
                doc = DocumentMeta(
                    source_id=file['id'],
                    data_room_id=data_room.id,
                    provider=self.provider,
                    path=file['name'],
                    mime_type=file.get('mimeType', 'application/octet-stream'),
                    updated_at=datetime.fromisoformat(file['modifiedTime'].replace('Z', '+00:00')),
                    size_bytes=int(file.get('size', 0)),
                    web_url=file.get('webViewLink'),
                    status='pending'
                )
                documents.append(doc)
            
            logger.info(f"Found {len(documents)} documents in Google Drive folder {folder_id}")
            return documents
            
        except Exception as e:
            logger.error(f"Error listing Google Drive documents: {str(e)}")
            raise
    
    def fetch_content(self, doc: DocumentMeta, credentials: Dict[str, Any]) -> str:
        """
        Download and process document content using MarkItDown.
        
        Args:
            doc: Document metadata
            credentials: OAuth credentials
            
        Returns:
            Processed text content
        """
        try:
            # Create credentials object
            creds = Credentials(
                token=credentials.get('access_token'),
                refresh_token=credentials.get('refresh_token'),
                token_uri="https://oauth2.googleapis.com/token",
                client_id=self.client_id,
                client_secret=self.client_secret
            )
            
            # Build Drive service
            service = build('drive', 'v3', credentials=creds)
            
            # Download file to temporary location
            with tempfile.NamedTemporaryFile(delete=False, suffix=self._get_file_extension(doc.mime_type)) as temp_file:
                request = service.files().get_media(fileId=doc.source_id)
                request.execute()
                
                # Write content to temp file
                import io
                fh = io.BytesIO()
                downloader = service.files().get_media(fileId=doc.source_id)
                downloader.execute()
                
                # Get file content
                file_content = downloader.execute()
                temp_file.write(file_content)
                temp_file.flush()
                
                temp_path = temp_file.name
            
            try:
                # Process with MarkItDown
                from ...core.markitdown_processor import MarkItDownProcessor
                processor = MarkItDownProcessor()
                
                # Convert to markdown
                markdown_content = processor.convert_to_markdown(temp_path)
                
                if not markdown_content:
                    logger.warning(f"No content extracted from {doc.path}")
                    return ""
                
                logger.info(f"Successfully processed {doc.path} ({len(markdown_content)} characters)")
                return markdown_content
                
            finally:
                # Clean up temp file
                if os.path.exists(temp_path):
                    os.unlink(temp_path)
            
        except Exception as e:
            logger.error(f"Error fetching content for {doc.path}: {str(e)}")
            return ""
    
    def _get_file_extension(self, mime_type: str) -> str:
        """
        Get file extension from MIME type.
        
        Args:
            mime_type: MIME type
            
        Returns:
            File extension with dot
        """
        mime_to_ext = {
            'application/pdf': '.pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
            'application/vnd.google-apps.document': '.docx',
            'application/vnd.google-apps.presentation': '.pptx',
            'application/vnd.google-apps.spreadsheet': '.xlsx',
            'text/plain': '.txt',
            'text/html': '.html',
            'text/markdown': '.md',
            'application/rtf': '.rtf'
        }
        
        return mime_to_ext.get(mime_type, '.bin')
    
    def test_connection(self, credentials: Dict[str, Any]) -> bool:
        """
        Test the connection to Google Drive.
        
        Args:
            credentials: OAuth credentials
            
        Returns:
            True if connection is successful
        """
        try:
            creds = Credentials(
                token=credentials.get('access_token'),
                refresh_token=credentials.get('refresh_token'),
                token_uri="https://oauth2.googleapis.com/token",
                client_id=self.client_id,
                client_secret=self.client_secret
            )
            
            service = build('drive', 'v3', credentials=creds)
            
            # Try to list files in root
            results = service.files().list(pageSize=1).execute()
            
            logger.info("Google Drive connection test successful")
            return True
            
        except Exception as e:
            logger.error(f"Google Drive connection test failed: {str(e)}")
            return False
