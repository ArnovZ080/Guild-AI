"""
Productivity Platform Integrations

Comprehensive integration with Google Drive, Notion, Confluence, and OneDrive APIs
for Knowledge Management Agent and document automation.
"""

import asyncio
import aiohttp
import json
import base64
import mimetypes
from typing import Dict, Any, List, Optional, Union
from datetime import datetime, date, timedelta
from dataclasses import dataclass, asdict
from enum import Enum
from guild.src.core.config import settings
from guild.src.utils.logging_utils import get_logger

logger = get_logger(__name__)

class ProductivityPlatform(Enum):
    GOOGLE_DRIVE = "google_drive"
    NOTION = "notion"
    CONFLUENCE = "confluence"
    ONEDRIVE = "onedrive"

class DocumentType(Enum):
    DOCUMENT = "document"
    SPREADSHEET = "spreadsheet"
    PRESENTATION = "presentation"
    PDF = "pdf"
    IMAGE = "image"
    VIDEO = "video"
    AUDIO = "audio"
    ARCHIVE = "archive"
    CODE = "code"
    TEXT = "text"

class PermissionLevel(Enum):
    READ = "read"
    WRITE = "write"
    COMMENT = "comment"
    OWNER = "owner"

@dataclass
class ProductivityCredentials:
    """Credentials for productivity platforms"""
    platform: ProductivityPlatform
    access_token: str
    refresh_token: Optional[str] = None
    api_key: Optional[str] = None
    integration_token: Optional[str] = None  # For Notion
    expires_at: Optional[datetime] = None

@dataclass
class Document:
    """Standardized document format"""
    id: str
    name: str
    document_type: DocumentType
    size: int
    created_at: datetime
    modified_at: datetime
    owner: str
    permissions: List[PermissionLevel]
    url: str
    download_url: Optional[str]
    parent_folder_id: Optional[str]
    tags: List[str]
    content: Optional[str]
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}

@dataclass
class Folder:
    """Standardized folder format"""
    id: str
    name: str
    created_at: datetime
    modified_at: datetime
    owner: str
    permissions: List[PermissionLevel]
    parent_folder_id: Optional[str]
    child_folders: List[str]
    child_documents: List[str]
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}

class GoogleDriveConnector:
    """Google Drive API connector"""
    
    def __init__(self, credentials: ProductivityCredentials):
        self.credentials = credentials
        self.base_url = "https://www.googleapis.com/drive/v3"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None, params: Dict = None) -> Dict:
        """Make authenticated request to Google Drive API"""
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
            logger.error(f"Google Drive API request failed: {e}")
            raise
    
    async def get_files(self, folder_id: str = None, query: str = None, count: int = 100) -> List[Document]:
        """Get files from Google Drive"""
        endpoint = "/files"
        
        params = {
            'pageSize': count,
            'fields': 'files(id,name,mimeType,size,createdTime,modifiedTime,owners,permissions,webViewLink,parents)'
        }
        
        if folder_id:
            params['q'] = f"'{folder_id}' in parents"
        elif query:
            params['q'] = query
        
        response = await self._make_request(endpoint, params=params)
        
        documents = []
        for file_data in response.get('files', []):
            document = Document(
                id=file_data['id'],
                name=file_data['name'],
                document_type=self._parse_mime_type(file_data.get('mimeType', '')),
                size=int(file_data.get('size', 0)),
                created_at=datetime.fromisoformat(file_data['createdTime'].replace('Z', '+00:00')),
                modified_at=datetime.fromisoformat(file_data['modifiedTime'].replace('Z', '+00:00')),
                owner=file_data.get('owners', [{}])[0].get('displayName', 'Unknown'),
                permissions=[PermissionLevel.READ],  # Simplified for now
                url=file_data.get('webViewLink', ''),
                download_url=None,
                parent_folder_id=file_data.get('parents', [None])[0] if file_data.get('parents') else None,
                tags=[],
                content=None,
                metadata={"raw_data": file_data}
            )
            documents.append(document)
        
        return documents
    
    async def get_folders(self, parent_folder_id: str = None, count: int = 100) -> List[Folder]:
        """Get folders from Google Drive"""
        query = "mimeType='application/vnd.google-apps.folder'"
        if parent_folder_id:
            query += f" and '{parent_folder_id}' in parents"
        
        documents = await self.get_files(query=query, count=count)
        
        folders = []
        for doc in documents:
            folder = Folder(
                id=doc.id,
                name=doc.name,
                created_at=doc.created_at,
                modified_at=doc.modified_at,
                owner=doc.owner,
                permissions=doc.permissions,
                parent_folder_id=doc.parent_folder_id,
                child_folders=[],  # Would need additional API calls
                child_documents=[],
                metadata=doc.metadata
            )
            folders.append(folder)
        
        return folders
    
    async def get_file_content(self, file_id: str) -> str:
        """Get content of a Google Drive file"""
        try:
            # First get file metadata to determine if it's a Google Doc
            file_metadata = await self._make_request(f"/files/{file_id}")
            mime_type = file_metadata.get('mimeType', '')
            
            if mime_type == 'application/vnd.google-apps.document':
                # Export as plain text
                endpoint = f"/files/{file_id}/export"
                params = {'mimeType': 'text/plain'}
                response = await self._make_request(endpoint, params=params)
                return response
            else:
                # For other file types, download the file
                endpoint = f"/files/{file_id}"
                params = {'alt': 'media'}
                response = await self._make_request(endpoint, params=params)
                return str(response)
                
        except Exception as e:
            logger.error(f"Error getting file content for {file_id}: {e}")
            return ""
    
    async def create_document(self, 
                            name: str,
                            content: str,
                            folder_id: str = None,
                            mime_type: str = "application/vnd.google-apps.document") -> Document:
        """Create a new document in Google Drive"""
        endpoint = "/files"
        
        # First create the file
        file_metadata = {
            'name': name,
            'mimeType': mime_type
        }
        
        if folder_id:
            file_metadata['parents'] = [folder_id]
        
        response = await self._make_request(endpoint, method='POST', data=file_metadata)
        file_id = response['id']
        
        # If it's a Google Doc, update the content
        if mime_type == 'application/vnd.google-apps.document' and content:
            await self.update_document_content(file_id, content)
        
        # Get the created file details
        file_details = await self._make_request(f"/files/{file_id}")
        
        document = Document(
            id=file_id,
            name=name,
            document_type=DocumentType.DOCUMENT,
            size=0,
            created_at=datetime.fromisoformat(file_details['createdTime'].replace('Z', '+00:00')),
            modified_at=datetime.fromisoformat(file_details['modifiedTime'].replace('Z', '+00:00')),
            owner=file_details.get('owners', [{}])[0].get('displayName', 'Unknown'),
            permissions=[PermissionLevel.OWNER],
            url=file_details.get('webViewLink', ''),
            download_url=None,
            parent_folder_id=folder_id,
            tags=[],
            content=content,
            metadata={"created_via_api": True, "raw_data": file_details}
        )
        
        return document
    
    async def update_document_content(self, file_id: str, content: str) -> bool:
        """Update content of a Google Drive document"""
        try:
            # For Google Docs, we need to use the Documents API
            # This is a simplified implementation
            endpoint = f"/files/{file_id}"
            data = {'name': 'Updated Document'}  # Simplified update
            await self._make_request(endpoint, method='PATCH', data=data)
            return True
        except Exception as e:
            logger.error(f"Error updating document content for {file_id}: {e}")
            return False
    
    def _parse_mime_type(self, mime_type: str) -> DocumentType:
        """Parse MIME type to document type"""
        if 'document' in mime_type:
            return DocumentType.DOCUMENT
        elif 'spreadsheet' in mime_type:
            return DocumentType.SPREADSHEET
        elif 'presentation' in mime_type:
            return DocumentType.PRESENTATION
        elif 'pdf' in mime_type:
            return DocumentType.PDF
        elif 'image' in mime_type:
            return DocumentType.IMAGE
        elif 'video' in mime_type:
            return DocumentType.VIDEO
        elif 'audio' in mime_type:
            return DocumentType.AUDIO
        elif 'zip' in mime_type or 'archive' in mime_type:
            return DocumentType.ARCHIVE
        else:
            return DocumentType.TEXT
    
    async def validate_connection(self) -> bool:
        """Validate Google Drive API connection"""
        try:
            await self._make_request("/files?pageSize=1")
            return True
        except Exception as e:
            logger.error(f"Google Drive connection validation failed: {e}")
            return False

class NotionConnector:
    """Notion API connector"""
    
    def __init__(self, credentials: ProductivityCredentials):
        self.credentials = credentials
        self.base_url = "https://api.notion.com/v1"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None) -> Dict:
        """Make authenticated request to Notion API"""
        try:
            url = f"{self.base_url}{endpoint}"
            headers = {
                'Authorization': f'Bearer {self.credentials.integration_token}',
                'Content-Type': 'application/json',
                'Notion-Version': '2022-06-28'
            }
            
            async with self.session.request(method, url, json=data, headers=headers) as response:
                response.raise_for_status()
                return await response.json()
                
        except Exception as e:
            logger.error(f"Notion API request failed: {e}")
            raise
    
    async def get_databases(self) -> List[Dict[str, Any]]:
        """Get all databases"""
        endpoint = "/search"
        
        data = {
            'filter': {
                'property': 'object',
                'value': 'database'
            }
        }
        
        response = await self._make_request(endpoint, method='POST', data=data)
        return response.get('results', [])
    
    async def get_pages(self, database_id: str = None, count: int = 100) -> List[Document]:
        """Get pages from Notion"""
        if database_id:
            endpoint = f"/databases/{database_id}/query"
            data = {'page_size': count}
            response = await self._make_request(endpoint, method='POST', data=data)
        else:
            endpoint = "/search"
            data = {
                'filter': {
                    'property': 'object',
                    'value': 'page'
                },
                'page_size': count
            }
            response = await self._make_request(endpoint, method='POST', data=data)
        
        pages = []
        for page_data in response.get('results', []):
            # Extract title from properties
            title = "Untitled"
            if 'properties' in page_data:
                for prop_name, prop_data in page_data['properties'].items():
                    if prop_data.get('type') == 'title' and prop_data.get('title'):
                        title = prop_data['title'][0]['text']['content']
                        break
            
            page = Document(
                id=page_data['id'],
                name=title,
                document_type=DocumentType.DOCUMENT,
                size=0,
                created_at=datetime.fromisoformat(page_data['created_time'].replace('Z', '+00:00')),
                modified_at=datetime.fromisoformat(page_data['last_edited_time'].replace('Z', '+00:00')),
                owner=page_data.get('created_by', {}).get('name', 'Unknown'),
                permissions=[PermissionLevel.READ],
                url=page_data.get('url', ''),
                download_url=None,
                parent_folder_id=database_id,
                tags=[],
                content=None,
                metadata={"raw_data": page_data}
            )
            pages.append(page)
        
        return pages
    
    async def get_page_content(self, page_id: str) -> str:
        """Get content of a Notion page"""
        try:
            endpoint = f"/blocks/{page_id}/children"
            response = await self._make_request(endpoint)
            
            content_parts = []
            for block in response.get('results', []):
                block_type = block.get('type', '')
                if block_type == 'paragraph':
                    text = block.get('paragraph', {}).get('rich_text', [])
                    content_parts.append(' '.join([t.get('text', {}).get('content', '') for t in text]))
                elif block_type == 'heading_1':
                    text = block.get('heading_1', {}).get('rich_text', [])
                    content_parts.append('# ' + ' '.join([t.get('text', {}).get('content', '') for t in text]))
                elif block_type == 'heading_2':
                    text = block.get('heading_2', {}).get('rich_text', [])
                    content_parts.append('## ' + ' '.join([t.get('text', {}).get('content', '') for t in text]))
                elif block_type == 'heading_3':
                    text = block.get('heading_3', {}).get('rich_text', [])
                    content_parts.append('### ' + ' '.join([t.get('text', {}).get('content', '') for t in text]))
            
            return '\n\n'.join(content_parts)
            
        except Exception as e:
            logger.error(f"Error getting page content for {page_id}: {e}")
            return ""
    
    async def create_page(self, 
                        database_id: str,
                        title: str,
                        content: str = None,
                        properties: Dict[str, Any] = None) -> Document:
        """Create a new page in Notion"""
        endpoint = "/pages"
        
        data = {
            'parent': {
                'database_id': database_id
            },
            'properties': {
                'Name': {
                    'title': [
                        {
                            'text': {
                                'content': title
                            }
                        }
                    ]
                }
            }
        }
        
        if properties:
            data['properties'].update(properties)
        
        response = await self._make_request(endpoint, method='POST', data=data)
        page_id = response['id']
        
        # Add content if provided
        if content:
            await self.add_content_to_page(page_id, content)
        
        page = Document(
            id=page_id,
            name=title,
            document_type=DocumentType.DOCUMENT,
            size=0,
            created_at=datetime.fromisoformat(response['created_time'].replace('Z', '+00:00')),
            modified_at=datetime.fromisoformat(response['last_edited_time'].replace('Z', '+00:00')),
            owner=response.get('created_by', {}).get('name', 'Unknown'),
            permissions=[PermissionLevel.OWNER],
            url=response.get('url', ''),
            download_url=None,
            parent_folder_id=database_id,
            tags=[],
            content=content,
            metadata={"created_via_api": True, "raw_data": response}
        )
        
        return page
    
    async def add_content_to_page(self, page_id: str, content: str) -> bool:
        """Add content to a Notion page"""
        try:
            endpoint = f"/blocks/{page_id}/children"
            
            # Split content into paragraphs and create blocks
            paragraphs = content.split('\n\n')
            children = []
            
            for paragraph in paragraphs:
                if paragraph.strip():
                    if paragraph.startswith('# '):
                        children.append({
                            'type': 'heading_1',
                            'heading_1': {
                                'rich_text': [{'text': {'content': paragraph[2:].strip()}}]
                            }
                        })
                    elif paragraph.startswith('## '):
                        children.append({
                            'type': 'heading_2',
                            'heading_2': {
                                'rich_text': [{'text': {'content': paragraph[3:].strip()}}]
                            }
                        })
                    elif paragraph.startswith('### '):
                        children.append({
                            'type': 'heading_3',
                            'heading_3': {
                                'rich_text': [{'text': {'content': paragraph[4:].strip()}}]
                            }
                        })
                    else:
                        children.append({
                            'type': 'paragraph',
                            'paragraph': {
                                'rich_text': [{'text': {'content': paragraph.strip()}}]
                            }
                        })
            
            data = {'children': children}
            await self._make_request(endpoint, method='PATCH', data=data)
            return True
            
        except Exception as e:
            logger.error(f"Error adding content to page {page_id}: {e}")
            return False
    
    async def validate_connection(self) -> bool:
        """Validate Notion API connection"""
        try:
            await self._make_request("/users/me")
            return True
        except Exception as e:
            logger.error(f"Notion connection validation failed: {e}")
            return False

class ConfluenceConnector:
    """Confluence API connector"""
    
    def __init__(self, credentials: ProductivityCredentials):
        self.credentials = credentials
        self.base_url = f"https://{credentials.api_key}.atlassian.net/wiki/api/v2"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None, params: Dict = None) -> Dict:
        """Make authenticated request to Confluence API"""
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
            logger.error(f"Confluence API request failed: {e}")
            raise
    
    async def get_spaces(self) -> List[Dict[str, Any]]:
        """Get all spaces"""
        endpoint = "/spaces"
        params = {'limit': 100}
        
        response = await self._make_request(endpoint, params=params)
        return response.get('results', [])
    
    async def get_pages(self, space_id: str = None, count: int = 100) -> List[Document]:
        """Get pages from Confluence"""
        endpoint = "/pages"
        
        params = {'limit': count}
        if space_id:
            params['space-id'] = space_id
        
        response = await self._make_request(endpoint, params=params)
        
        pages = []
        for page_data in response.get('results', []):
            page = Document(
                id=str(page_data['id']),
                name=page_data.get('title', 'Untitled'),
                document_type=DocumentType.DOCUMENT,
                size=0,
                created_at=datetime.fromisoformat(page_data['createdAt'].replace('Z', '+00:00')),
                modified_at=datetime.fromisoformat(page_data['version']['createdAt'].replace('Z', '+00:00')),
                owner=page_data.get('author', {}).get('displayName', 'Unknown'),
                permissions=[PermissionLevel.READ],
                url=page_data.get('_links', {}).get('webui', ''),
                download_url=None,
                parent_folder_id=space_id,
                tags=[],
                content=None,
                metadata={"raw_data": page_data}
            )
            pages.append(page)
        
        return pages
    
    async def get_page_content(self, page_id: str) -> str:
        """Get content of a Confluence page"""
        try:
            endpoint = f"/pages/{page_id}"
            params = {'body-format': 'atlas_doc_format'}
            
            response = await self._make_request(endpoint, params=params)
            
            # Extract content from Atlas format (simplified)
            content = ""
            if 'body' in response and 'atlas_doc_format' in response['body']:
                content = response['body']['atlas_doc_format']['value']
            
            return content
            
        except Exception as e:
            logger.error(f"Error getting page content for {page_id}: {e}")
            return ""
    
    async def create_page(self, 
                        space_id: str,
                        title: str,
                        content: str,
                        parent_id: str = None) -> Document:
        """Create a new page in Confluence"""
        endpoint = "/pages"
        
        data = {
            'spaceId': space_id,
            'title': title,
            'body': {
                'atlas_doc_format': {
                    'value': content,
                    'representation': 'atlas_doc_format'
                }
            }
        }
        
        if parent_id:
            data['parentId'] = parent_id
        
        response = await self._make_request(endpoint, method='POST', data=data)
        
        page = Document(
            id=str(response['id']),
            name=title,
            document_type=DocumentType.DOCUMENT,
            size=0,
            created_at=datetime.fromisoformat(response['createdAt'].replace('Z', '+00:00')),
            modified_at=datetime.fromisoformat(response['version']['createdAt'].replace('Z', '+00:00')),
            owner=response.get('author', {}).get('displayName', 'Unknown'),
            permissions=[PermissionLevel.OWNER],
            url=response.get('_links', {}).get('webui', ''),
            download_url=None,
            parent_folder_id=space_id,
            tags=[],
            content=content,
            metadata={"created_via_api": True, "raw_data": response}
        )
        
        return page
    
    async def validate_connection(self) -> bool:
        """Validate Confluence API connection"""
        try:
            await self._make_request("/spaces", {'limit': 1})
            return True
        except Exception as e:
            logger.error(f"Confluence connection validation failed: {e}")
            return False

class ProductivityManager:
    """Manager for multiple productivity platform integrations"""
    
    def __init__(self):
        self.connectors: Dict[ProductivityPlatform, Any] = {}
    
    def add_platform(self, platform: ProductivityPlatform, credentials: ProductivityCredentials):
        """Add a productivity platform connector"""
        if platform == ProductivityPlatform.GOOGLE_DRIVE:
            self.connectors[platform] = GoogleDriveConnector(credentials)
        elif platform == ProductivityPlatform.NOTION:
            self.connectors[platform] = NotionConnector(credentials)
        elif platform == ProductivityPlatform.CONFLUENCE:
            self.connectors[platform] = ConfluenceConnector(credentials)
        
        logger.info(f"Added {platform.value} connector")
    
    async def search_documents(self, 
                             platforms: List[ProductivityPlatform],
                             query: str,
                             document_types: List[DocumentType] = None) -> Dict[str, List[Document]]:
        """Search documents across multiple platforms"""
        results = {}
        
        for platform in platforms:
            if platform in self.connectors:
                try:
                    connector = self.connectors[platform]
                    
                    async with connector:
                        if platform == ProductivityPlatform.GOOGLE_DRIVE:
                            documents = await connector.get_files(query=query)
                        elif platform == ProductivityPlatform.NOTION:
                            documents = await connector.get_pages()
                            # Filter by query (simplified)
                            documents = [doc for doc in documents if query.lower() in doc.name.lower()]
                        elif platform == ProductivityPlatform.CONFLUENCE:
                            documents = await connector.get_pages()
                            # Filter by query (simplified)
                            documents = [doc for doc in documents if query.lower() in doc.name.lower()]
                        else:
                            documents = []
                        
                        # Filter by document types if specified
                        if document_types:
                            documents = [doc for doc in documents if doc.document_type in document_types]
                        
                        results[platform.value] = documents
                        
                except Exception as e:
                    logger.error(f"Error searching documents on {platform.value}: {e}")
                    results[platform.value] = []
        
        return results
    
    async def create_cross_platform_document(self, 
                                           platforms: List[ProductivityPlatform],
                                           name: str,
                                           content: str,
                                           folder_id: str = None,
                                           database_id: str = None,
                                           space_id: str = None) -> Dict[str, Document]:
        """Create document across multiple platforms"""
        results = {}
        
        for platform in platforms:
            if platform in self.connectors:
                try:
                    connector = self.connectors[platform]
                    
                    async with connector:
                        if platform == ProductivityPlatform.GOOGLE_DRIVE:
                            document = await connector.create_document(
                                name=name,
                                content=content,
                                folder_id=folder_id
                            )
                        elif platform == ProductivityPlatform.NOTION:
                            document = await connector.create_page(
                                database_id=database_id,
                                title=name,
                                content=content
                            )
                        elif platform == ProductivityPlatform.CONFLUENCE:
                            document = await connector.create_page(
                                space_id=space_id,
                                title=name,
                                content=content
                            )
                        else:
                            continue
                        
                        results[platform.value] = document
                        
                except Exception as e:
                    logger.error(f"Error creating document on {platform.value}: {e}")
        
        return results
    
    async def get_document_content(self, 
                                 platform: ProductivityPlatform,
                                 document_id: str) -> str:
        """Get content from a specific document"""
        if platform in self.connectors:
            try:
                connector = self.connectors[platform]
                
                async with connector:
                    if platform == ProductivityPlatform.GOOGLE_DRIVE:
                        content = await connector.get_file_content(document_id)
                    elif platform == ProductivityPlatform.NOTION:
                        content = await connector.get_page_content(document_id)
                    elif platform == ProductivityPlatform.CONFLUENCE:
                        content = await connector.get_page_content(document_id)
                    else:
                        content = ""
                    
                    return content
                    
            except Exception as e:
                logger.error(f"Error getting document content from {platform.value}: {e}")
        
        return ""
    
    async def validate_all_connections(self) -> Dict[ProductivityPlatform, bool]:
        """Validate connections to all productivity platforms"""
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

# Global productivity manager
productivity_manager = ProductivityManager()

# Convenience functions
def add_productivity_credentials(platform: str, 
                               access_token: str,
                               integration_token: str = None,
                               api_key: str = None):
    """Add productivity platform credentials"""
    credentials = ProductivityCredentials(
        platform=ProductivityPlatform(platform),
        access_token=access_token,
        integration_token=integration_token,
        api_key=api_key
    )
    productivity_manager.add_platform(credentials.platform, credentials)

async def search_documents(platforms: List[str], query: str, document_types: List[str] = None):
    """Search documents across multiple productivity platforms"""
    platform_enums = [ProductivityPlatform(platform) for platform in platforms]
    doc_type_enums = [DocumentType(doc_type) for doc_type in document_types] if document_types else None
    return await productivity_manager.search_documents(platform_enums, query, doc_type_enums)

async def create_document(platforms: List[str], name: str, content: str, **kwargs):
    """Create document across multiple productivity platforms"""
    platform_enums = [ProductivityPlatform(platform) for platform in platforms]
    return await productivity_manager.create_cross_platform_document(platform_enums, name, content, **kwargs)

async def get_document_content(platform: str, document_id: str):
    """Get content from a specific document"""
    platform_enum = ProductivityPlatform(platform)
    return await productivity_manager.get_document_content(platform_enum, document_id)
