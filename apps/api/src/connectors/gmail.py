"""
Gmail API Connector
Handles Gmail integration for email automation and management
"""

import requests
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from ..core.schemas import DataRoom, DocumentMeta
from ..core.storage import Connector

logger = logging.getLogger(__name__)

class GmailConnector(Connector):
    provider: str = "gmail"
    
    def __init__(self, access_token: str, refresh_token: str, client_id: str, client_secret: str):
        self.access_token = access_token
        self.refresh_token = refresh_token
        self.client_id = client_id
        self.client_secret = client_secret
        self.base_url = "https://gmail.googleapis.com/gmail/v1"
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        })
    
    def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None) -> Dict:
        """Make authenticated request to Gmail API"""
        try:
            url = f"{self.base_url}/{endpoint}"
            response = self.session.request(method, url, json=data)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Gmail API request failed: {e}")
            raise
    
    def get_profile(self) -> Dict:
        """Get Gmail profile information"""
        try:
            response = self._make_request("users/me/profile")
            return response
        except Exception as e:
            logger.error(f"Failed to fetch Gmail profile: {e}")
            return {}
    
    def get_messages(self, query: str = None, max_results: int = 10) -> List[Dict]:
        """Get messages from Gmail"""
        try:
            endpoint = "users/me/messages"
            params = {'maxResults': max_results}
            if query:
                params['q'] = query
            
            response = self._make_request(endpoint, params=params)
            messages = response.get('messages', [])
            
            # Get full message details
            detailed_messages = []
            for message in messages:
                try:
                    detail = self.get_message(message['id'])
                    detailed_messages.append(detail)
                except Exception as e:
                    logger.warning(f"Failed to get message details for {message['id']}: {e}")
                    continue
            
            return detailed_messages
        except Exception as e:
            logger.error(f"Failed to fetch Gmail messages: {e}")
            return []
    
    def get_message(self, message_id: str) -> Dict:
        """Get detailed message information"""
        try:
            endpoint = f"users/me/messages/{message_id}"
            params = {'format': 'full'}
            response = self._make_request(endpoint, params=params)
            return response
        except Exception as e:
            logger.error(f"Failed to fetch message {message_id}: {e}")
            return {}
    
    def send_email(self, to: str, subject: str, body: str, 
                   cc: str = None, bcc: str = None, attachments: List[str] = None) -> Dict:
        """Send an email via Gmail"""
        try:
            import base64
            from email.mime.text import MIMEText
            from email.mime.multipart import MIMEMultipart
            from email.mime.base import MIMEBase
            from email import encoders
            
            # Create message
            msg = MIMEMultipart()
            msg['To'] = to
            msg['Subject'] = subject
            if cc:
                msg['Cc'] = cc
            if bcc:
                msg['Bcc'] = bcc
            
            # Add body
            msg.attach(MIMEText(body, 'html'))
            
            # Add attachments if provided
            if attachments:
                for attachment_path in attachments:
                    try:
                        with open(attachment_path, "rb") as attachment:
                            part = MIMEBase('application', 'octet-stream')
                            part.set_payload(attachment.read())
                            encoders.encode_base64(part)
                            part.add_header(
                                'Content-Disposition',
                                f'attachment; filename= {attachment_path.split("/")[-1]}'
                            )
                            msg.attach(part)
                    except Exception as e:
                        logger.warning(f"Failed to attach {attachment_path}: {e}")
            
            # Encode message
            raw_message = base64.urlsafe_b64encode(msg.as_bytes()).decode()
            
            # Send message
            endpoint = "users/me/messages/send"
            data = {'raw': raw_message}
            response = self._make_request(endpoint, method='POST', data=data)
            return response
            
        except Exception as e:
            logger.error(f"Failed to send email: {e}")
            return {}
    
    def create_draft(self, to: str, subject: str, body: str) -> Dict:
        """Create a draft email"""
        try:
            import base64
            from email.mime.text import MIMEText
            
            # Create message
            msg = MIMEText(body, 'html')
            msg['To'] = to
            msg['Subject'] = subject
            
            # Encode message
            raw_message = base64.urlsafe_b64encode(msg.as_bytes()).decode()
            
            # Create draft
            endpoint = "users/me/drafts"
            data = {'message': {'raw': raw_message}}
            response = self._make_request(endpoint, method='POST', data=data)
            return response
            
        except Exception as e:
            logger.error(f"Failed to create draft: {e}")
            return {}
    
    def get_labels(self) -> List[Dict]:
        """Get all Gmail labels"""
        try:
            response = self._make_request("users/me/labels")
            return response.get('labels', [])
        except Exception as e:
            logger.error(f"Failed to fetch Gmail labels: {e}")
            return []
    
    def create_label(self, name: str, label_list_visibility: str = "labelShow") -> Dict:
        """Create a new Gmail label"""
        try:
            endpoint = "users/me/labels"
            data = {
                'name': name,
                'labelListVisibility': label_list_visibility,
                'messageListVisibility': 'show'
            }
            response = self._make_request(endpoint, method='POST', data=data)
            return response
        except Exception as e:
            logger.error(f"Failed to create label: {e}")
            return {}
    
    def add_label_to_message(self, message_id: str, label_ids: List[str]) -> Dict:
        """Add labels to a message"""
        try:
            endpoint = f"users/me/messages/{message_id}/modify"
            data = {'addLabelIds': label_ids}
            response = self._make_request(endpoint, method='POST', data=data)
            return response
        except Exception as e:
            logger.error(f"Failed to add labels to message: {e}")
            return {}
    
    def search_messages(self, query: str, max_results: int = 10) -> List[Dict]:
        """Search for messages with specific criteria"""
        try:
            return self.get_messages(query=query, max_results=max_results)
        except Exception as e:
            logger.error(f"Failed to search messages: {e}")
            return []
    
    def get_threads(self, query: str = None, max_results: int = 10) -> List[Dict]:
        """Get email threads"""
        try:
            endpoint = "users/me/threads"
            params = {'maxResults': max_results}
            if query:
                params['q'] = query
            
            response = self._make_request(endpoint, params=params)
            threads = response.get('threads', [])
            
            # Get full thread details
            detailed_threads = []
            for thread in threads:
                try:
                    detail = self.get_thread(thread['id'])
                    detailed_threads.append(detail)
                except Exception as e:
                    logger.warning(f"Failed to get thread details for {thread['id']}: {e}")
                    continue
            
            return detailed_threads
        except Exception as e:
            logger.error(f"Failed to fetch Gmail threads: {e}")
            return []
    
    def get_thread(self, thread_id: str) -> Dict:
        """Get detailed thread information"""
        try:
            endpoint = f"users/me/threads/{thread_id}"
            params = {'format': 'full'}
            response = self._make_request(endpoint, params=params)
            return response
        except Exception as e:
            logger.error(f"Failed to fetch thread {thread_id}: {e}")
            return {}
    
    def mark_as_read(self, message_id: str) -> Dict:
        """Mark a message as read"""
        try:
            endpoint = f"users/me/messages/{message_id}/modify"
            data = {'removeLabelIds': ['UNREAD']}
            response = self._make_request(endpoint, method='POST', data=data)
            return response
        except Exception as e:
            logger.error(f"Failed to mark message as read: {e}")
            return {}
    
    def mark_as_unread(self, message_id: str) -> Dict:
        """Mark a message as unread"""
        try:
            endpoint = f"users/me/messages/{message_id}/modify"
            data = {'addLabelIds': ['UNREAD']}
            response = self._make_request(endpoint, method='POST', data=data)
            return response
        except Exception as e:
            logger.error(f"Failed to mark message as unread: {e}")
            return {}
    
    def delete_message(self, message_id: str) -> Dict:
        """Delete a message"""
        try:
            endpoint = f"users/me/messages/{message_id}/delete"
            response = self._make_request(endpoint, method='POST')
            return response
        except Exception as e:
            logger.error(f"Failed to delete message: {e}")
            return {}
    
    def list_documents(self, data_room: DataRoom) -> List[DocumentMeta]:
        """List Gmail-related documents (messages, threads, labels)"""
        documents = []
        
        try:
            # Get profile
            profile = self.get_profile()
            if profile:
                documents.append(DocumentMeta(
                    id=f"gmail_profile_{profile.get('emailAddress')}",
                    title=f"Gmail Account: {profile.get('emailAddress')}",
                    source=f"gmail://profile/{profile.get('emailAddress')}",
                    provider=self.provider,
                    created_at=datetime.now(),
                    metadata={
                        'type': 'profile',
                        'email_address': profile.get('emailAddress'),
                        'messages_total': profile.get('messagesTotal'),
                        'threads_total': profile.get('threadsTotal')
                    }
                ))
            
            # Get recent messages
            messages = self.get_messages(max_results=5)
            for i, message in enumerate(messages):
                if message:
                    documents.append(DocumentMeta(
                        id=f"gmail_message_{message.get('id')}",
                        title=f"Email: {message.get('snippet', 'No subject')[:50]}...",
                        source=f"gmail://message/{message.get('id')}",
                        provider=self.provider,
                        created_at=datetime.now(),
                        metadata={
                            'type': 'message',
                            'message_id': message.get('id'),
                            'thread_id': message.get('threadId'),
                            'snippet': message.get('snippet')
                        }
                    ))
                
        except Exception as e:
            logger.error(f"Failed to list Gmail documents: {e}")
        
        return documents
    
    def fetch_content(self, doc: DocumentMeta) -> str:
        """Fetch content for a specific Gmail document"""
        try:
            doc_type = doc.metadata.get('type')
            
            if doc_type == 'profile':
                profile = self.get_profile()
                labels = self.get_labels()
                return f"Gmail Profile:\n{profile}\n\nLabels:\n{labels}"
            
            elif doc_type == 'message':
                message_id = doc.metadata['message_id']
                message = self.get_message(message_id)
                return f"Gmail Message:\n{message}"
            
            return ""
            
        except Exception as e:
            logger.error(f"Failed to fetch Gmail content: {e}")
            return ""
    
    def validate_connection(self) -> bool:
        """Validate the Gmail API connection"""
        try:
            response = self.get_profile()
            return 'emailAddress' in response
        except Exception as e:
            logger.error(f"Gmail connection validation failed: {e}")
            return False
