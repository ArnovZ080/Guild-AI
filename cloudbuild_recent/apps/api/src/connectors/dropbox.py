"""
Dropbox Connector for Guild-AI

This connector handles OAuth authentication and file operations with Dropbox.
It integrates with the MarkItDown processor to handle various document formats.
"""

import os
import logging
from typing import Iterable, Dict, Any, Optional, List
from datetime import datetime, timedelta
import tempfile
import shutil

try:
    import dropbox
    from dropbox.exceptions import AuthError, ApiError
    DROPBOX_AVAILABLE = True
except ImportError:
    DROPBOX_AVAILABLE = False
    print("Warning: Dropbox connector not available. Install with: pip install dropbox")

from ..core.schemas import DataRoom, DocumentMeta
from ..core.storage import Connector

logger = logging.getLogger(__name__)

class DropboxConnector(Connector):
    """
    Dropbox connector for OAuth authentication and file operations.
    """
    
    provider: str = "dropbox"
    
    def __init__(self):
        """Initialize the Dropbox connector."""
        if not DROPBOX_AVAILABLE:
            raise ImportError(
                "Dropbox connector is not available. Please install:\n"
                "pip install dropbox"
            )
        
        # OAuth configuration
        self.app_key = os.getenv('DROPBOX_APP_KEY')
        self.app_secret = os.getenv('DROPBOX_APP_SECRET')
        self.redirect_uri = os.getenv('DROPBOX_REDIRECT_URI', 'http://localhost:5001/api/oauth/dropbox/callback')
        
        logger.info("Dropbox connector initialized")
    
    def get_auth_url(self, state: str = None) -> Dict[str, str]:
        """
        Generate OAuth authorization URL.
        
        Args:
            state: Optional state parameter for CSRF protection
            
        Returns:
            Dictionary with auth_url and state
        """
        if not self.app_key or not self.app_secret:
            raise ValueError("Dropbox OAuth credentials not configured")
        
        try:
            auth_flow = dropbox.DropboxOAuth2FlowNoRedirect(
                self.app_key,
                self.app_secret
            )
            
            auth_url = auth_flow.start()
            
            return {
                "auth_url": auth_url,
                "state": state or "dropbox_auth"
            }
            
        except Exception as e:
            logger.error(f"Error generating Dropbox auth URL: {str(e)}")
            raise
    
    def exchange_code_for_token(self, code: str, state: str = None) -> Dict[str, Any]:
        """
        Exchange authorization code for access token.
        
        Args:
            code: Authorization code from OAuth callback
            state: State parameter for CSRF protection
            
        Returns:
            Dictionary with token information
        """
        if not self.app_key or not self.app_secret:
            raise ValueError("Dropbox OAuth credentials not configured")
        
        try:
            auth_flow = dropbox.DropboxOAuth2FlowNoRedirect(
                self.app_key,
                self.app_secret
            )
            
            # Complete the OAuth flow
            oauth_result = auth_flow.finish(code)
            
            # Get account info
            dbx = dropbox.Dropbox(oauth_result.access_token)
            account_info = dbx.users_get_current_account()
            
            return {
                "access_token": oauth_result.access_token,
                "refresh_token": None,  # Dropbox doesn't use refresh tokens
                "expires_at": None,  # Dropbox tokens don't expire
                "account_id": account_info.account_id,
                "account_name": account_info.name.display_name,
                "scopes": ["files.metadata.read", "files.content.read"]
            }
            
        except Exception as e:
            logger.error(f"Error exchanging code for token: {str(e)}")
            raise
    
    def refresh_token(self, refresh_token: str) -> Dict[str, Any]:
        """
        Refresh expired access token (not applicable for Dropbox).
        
        Args:
            refresh_token: Refresh token (not used for Dropbox)
            
        Returns:
            Dictionary with token information
        """
        # Dropbox tokens don't expire, so no refresh needed
        return {
            "access_token": None,
            "expires_at": None
        }
    
    def list_documents(self, data_room: DataRoom, credentials: Dict[str, Any]) -> Iterable[DocumentMeta]:
        """
        List documents from Dropbox folder.
        
        Args:
            data_room: Data room configuration
            credentials: OAuth credentials
            
        Returns:
            Iterable of DocumentMeta objects
        """
        try:
            # Create Dropbox client
            dbx = dropbox.Dropbox(credentials.get('access_token'))
            
            # Get folder path from data room config
            folder_path = data_room.config.get('folder_path', '/')
            if not folder_path.startswith('/'):
                folder_path = '/' + folder_path
            
            # List files in folder
            try:
                result = dbx.files_list_folder(folder_path)
                files = result.entries
                
                # Handle pagination
                while result.has_more:
                    result = dbx.files_list_folder_continue(result.cursor)
                    files.extend(result.entries)
                
            except ApiError as e:
                if e.error.is_path() and e.error.get_path().is_not_found():
                    logger.warning(f"Dropbox folder not found: {folder_path}")
                    return []
                raise
            
            documents = []
            for file in files:
                # Skip folders
                if isinstance(file, dropbox.files.FolderMetadata):
                    continue
                
                # Create document metadata
                doc = DocumentMeta(
                    source_id=file.id,
                    data_room_id=data_room.id,
                    provider=self.provider,
                    path=file.path_display,
                    mime_type=self._get_mime_type(file.name),
                    updated_at=datetime.fromtimestamp(file.server_modified.timestamp()),
                    size_bytes=file.size if hasattr(file, 'size') else 0,
                    web_url=file.preview_url if hasattr(file, 'preview_url') else None,
                    status='pending'
                )
                documents.append(doc)
            
            logger.info(f"Found {len(documents)} documents in Dropbox folder {folder_path}")
            return documents
            
        except Exception as e:
            logger.error(f"Error listing Dropbox documents: {str(e)}")
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
            # Create Dropbox client
            dbx = dropbox.Dropbox(credentials.get('access_token'))
            
            # Download file to temporary location
            with tempfile.NamedTemporaryFile(delete=False, suffix=self._get_file_extension(doc.path)) as temp_file:
                try:
                    # Download file content
                    _, response = dbx.files_download(doc.path)
                    
                    # Write content to temp file
                    temp_file.write(response.content)
                    temp_file.flush()
                    
                    temp_path = temp_file.name
                    
                except ApiError as e:
                    logger.error(f"Error downloading file {doc.path}: {str(e)}")
                    return ""
            
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
    
    def _get_mime_type(self, filename: str) -> str:
        """
        Get MIME type from filename.
        
        Args:
            filename: File name
            
        Returns:
            MIME type
        """
        ext = os.path.splitext(filename)[1].lower()
        ext_to_mime = {
            '.pdf': 'application/pdf',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            '.doc': 'application/msword',
            '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            '.ppt': 'application/vnd.ms-powerpoint',
            '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            '.xls': 'application/vnd.ms-excel',
            '.txt': 'text/plain',
            '.html': 'text/html',
            '.htm': 'text/html',
            '.md': 'text/markdown',
            '.rtf': 'application/rtf',
            '.odt': 'application/vnd.oasis.opendocument.text',
            '.odp': 'application/vnd.oasis.opendocument.presentation',
            '.ods': 'application/vnd.oasis.opendocument.spreadsheet'
        }
        
        return ext_to_mime.get(ext, 'application/octet-stream')
    
    def _get_file_extension(self, path: str) -> str:
        """
        Get file extension from path.
        
        Args:
            path: File path
            
        Returns:
            File extension with dot
        """
        return os.path.splitext(path)[1] or '.bin'
    
    def test_connection(self, credentials: Dict[str, Any]) -> bool:
        """
        Test the connection to Dropbox.
        
        Args:
            credentials: OAuth credentials
            
        Returns:
            True if connection is successful
        """
        try:
            dbx = dropbox.Dropbox(credentials.get('access_token'))
            
            # Try to get account info
            account_info = dbx.users_get_current_account()
            
            logger.info(f"Dropbox connection test successful for {account_info.name.display_name}")
            return True
            
        except Exception as e:
            logger.error(f"Dropbox connection test failed: {str(e)}")
            return False
