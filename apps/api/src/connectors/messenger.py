"""
Facebook Messenger API Connector
Handles Facebook Messenger and Instagram Direct messaging
"""

import requests
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from ..core.schemas import DataRoom, DocumentMeta
from ..core.storage import Connector

logger = logging.getLogger(__name__)

class MessengerConnector(Connector):
    provider: str = "messenger"
    
    def __init__(self, access_token: str, app_id: str, app_secret: str):
        self.access_token = access_token
        self.app_id = app_id
        self.app_secret = app_secret
        self.base_url = "https://graph.facebook.com/v18.0"
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        })
    
    def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None) -> Dict:
        """Make authenticated request to Messenger API"""
        try:
            url = f"{self.base_url}/{endpoint}"
            response = self.session.request(method, url, json=data)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Messenger API request failed: {e}")
            raise
    
    def send_text_message(self, recipient_id: str, message: str) -> Dict:
        """Send a text message via Messenger"""
        try:
            endpoint = "me/messages"
            data = {
                "recipient": {"id": recipient_id},
                "message": {"text": message}
            }
            response = self._make_request(endpoint, method='POST', data=data)
            return response
        except Exception as e:
            logger.error(f"Failed to send Messenger text message: {e}")
            return {}
    
    def send_attachment_message(self, recipient_id: str, attachment_type: str, 
                               attachment_url: str) -> Dict:
        """Send an attachment (image, video, audio, file) via Messenger"""
        try:
            endpoint = "me/messages"
            data = {
                "recipient": {"id": recipient_id},
                "message": {
                    "attachment": {
                        "type": attachment_type,
                        "payload": {
                            "url": attachment_url
                        }
                    }
                }
            }
            response = self._make_request(endpoint, method='POST', data=data)
            return response
        except Exception as e:
            logger.error(f"Failed to send Messenger attachment: {e}")
            return {}
    
    def send_quick_reply(self, recipient_id: str, text: str, quick_replies: List[Dict]) -> Dict:
        """Send a message with quick reply buttons"""
        try:
            endpoint = "me/messages"
            data = {
                "recipient": {"id": recipient_id},
                "message": {
                    "text": text,
                    "quick_replies": quick_replies
                }
            }
            response = self._make_request(endpoint, method='POST', data=data)
            return response
        except Exception as e:
            logger.error(f"Failed to send Messenger quick reply: {e}")
            return {}
    
    def send_generic_template(self, recipient_id: str, elements: List[Dict]) -> Dict:
        """Send a generic template with cards"""
        try:
            endpoint = "me/messages"
            data = {
                "recipient": {"id": recipient_id},
                "message": {
                    "attachment": {
                        "type": "template",
                        "payload": {
                            "template_type": "generic",
                            "elements": elements
                        }
                    }
                }
            }
            response = self._make_request(endpoint, method='POST', data=data)
            return response
        except Exception as e:
            logger.error(f"Failed to send Messenger generic template: {e}")
            return {}
    
    def send_button_template(self, recipient_id: str, text: str, buttons: List[Dict]) -> Dict:
        """Send a button template"""
        try:
            endpoint = "me/messages"
            data = {
                "recipient": {"id": recipient_id},
                "message": {
                    "attachment": {
                        "type": "template",
                        "payload": {
                            "template_type": "button",
                            "text": text,
                            "buttons": buttons
                        }
                    }
                }
            }
            response = self._make_request(endpoint, method='POST', data=data)
            return response
        except Exception as e:
            logger.error(f"Failed to send Messenger button template: {e}")
            return {}
    
    def send_list_template(self, recipient_id: str, elements: List[Dict], 
                          buttons: List[Dict] = None) -> Dict:
        """Send a list template"""
        try:
            endpoint = "me/messages"
            payload = {
                "template_type": "list",
                "elements": elements
            }
            
            if buttons:
                payload["buttons"] = buttons
            
            data = {
                "recipient": {"id": recipient_id},
                "message": {
                    "attachment": {
                        "type": "template",
                        "payload": payload
                    }
                }
            }
            response = self._make_request(endpoint, method='POST', data=data)
            return response
        except Exception as e:
            logger.error(f"Failed to send Messenger list template: {e}")
            return {}
    
    def send_receipt_template(self, recipient_id: str, recipient_name: str, 
                             order_number: str, currency: str, payment_method: str,
                             order_url: str, elements: List[Dict], 
                             address: Dict = None, summary: Dict = None,
                             adjustments: List[Dict] = None) -> Dict:
        """Send a receipt template"""
        try:
            endpoint = "me/messages"
            payload = {
                "template_type": "receipt",
                "recipient_name": recipient_name,
                "order_number": order_number,
                "currency": currency,
                "payment_method": payment_method,
                "order_url": order_url,
                "elements": elements
            }
            
            if address:
                payload["address"] = address
            if summary:
                payload["summary"] = summary
            if adjustments:
                payload["adjustments"] = adjustments
            
            data = {
                "recipient": {"id": recipient_id},
                "message": {
                    "attachment": {
                        "type": "template",
                        "payload": payload
                    }
                }
            }
            response = self._make_request(endpoint, method='POST', data=data)
            return response
        except Exception as e:
            logger.error(f"Failed to send Messenger receipt template: {e}")
            return {}
    
    def send_typing_indicator(self, recipient_id: str, action: str = "typing_on") -> Dict:
        """Send typing indicator"""
        try:
            endpoint = "me/messages"
            data = {
                "recipient": {"id": recipient_id},
                "sender_action": action
            }
            response = self._make_request(endpoint, method='POST', data=data)
            return response
        except Exception as e:
            logger.error(f"Failed to send typing indicator: {e}")
            return {}
    
    def mark_message_as_read(self, recipient_id: str) -> Dict:
        """Mark messages as read"""
        try:
            endpoint = "me/messages"
            data = {
                "recipient": {"id": recipient_id},
                "sender_action": "mark_seen"
            }
            response = self._make_request(endpoint, method='POST', data=data)
            return response
        except Exception as e:
            logger.error(f"Failed to mark message as read: {e}")
            return {}
    
    def get_user_profile(self, user_id: str) -> Dict:
        """Get user profile information"""
        try:
            endpoint = f"{user_id}"
            params = {
                'fields': 'first_name,last_name,profile_pic,locale,timezone,gender'
            }
            response = self._make_request(endpoint, params=params)
            return response
        except Exception as e:
            logger.error(f"Failed to fetch user profile: {e}")
            return {}
    
    def get_page_info(self) -> Dict:
        """Get page information"""
        try:
            endpoint = "me"
            params = {
                'fields': 'id,name,access_token'
            }
            response = self._make_request(endpoint, params=params)
            return response
        except Exception as e:
            logger.error(f"Failed to fetch page info: {e}")
            return {}
    
    def get_conversations(self, limit: int = 25) -> List[Dict]:
        """Get recent conversations"""
        try:
            endpoint = "me/conversations"
            params = {
                'limit': limit,
                'fields': 'id,updated_time,message_count,participants'
            }
            response = self._make_request(endpoint, params=params)
            return response.get('data', [])
        except Exception as e:
            logger.error(f"Failed to fetch conversations: {e}")
            return []
    
    def get_messages(self, conversation_id: str, limit: int = 25) -> List[Dict]:
        """Get messages from a conversation"""
        try:
            endpoint = f"{conversation_id}/messages"
            params = {
                'limit': limit,
                'fields': 'id,message,created_time,from,to,attachments'
            }
            response = self._make_request(endpoint, params=params)
            return response.get('data', [])
        except Exception as e:
            logger.error(f"Failed to fetch messages: {e}")
            return []
    
    def get_instagram_accounts(self) -> List[Dict]:
        """Get Instagram business accounts connected to the page"""
        try:
            endpoint = "me/instagram_accounts"
            response = self._make_request(endpoint)
            return response.get('data', [])
        except Exception as e:
            logger.error(f"Failed to fetch Instagram accounts: {e}")
            return []
    
    def send_instagram_message(self, instagram_account_id: str, recipient_id: str, 
                              message: str) -> Dict:
        """Send a message via Instagram Direct"""
        try:
            endpoint = f"{instagram_account_id}/messages"
            data = {
                "recipient": {"id": recipient_id},
                "message": {"text": message}
            }
            response = self._make_request(endpoint, method='POST', data=data)
            return response
        except Exception as e:
            logger.error(f"Failed to send Instagram message: {e}")
            return {}
    
    def send_instagram_media(self, instagram_account_id: str, recipient_id: str,
                            media_type: str, media_url: str) -> Dict:
        """Send media via Instagram Direct"""
        try:
            endpoint = f"{instagram_account_id}/messages"
            data = {
                "recipient": {"id": recipient_id},
                "message": {
                    "attachment": {
                        "type": media_type,
                        "payload": {
                            "url": media_url
                        }
                    }
                }
            }
            response = self._make_request(endpoint, method='POST', data=data)
            return response
        except Exception as e:
            logger.error(f"Failed to send Instagram media: {e}")
            return {}
    
    def get_instagram_conversations(self, instagram_account_id: str, 
                                   limit: int = 25) -> List[Dict]:
        """Get Instagram Direct conversations"""
        try:
            endpoint = f"{instagram_account_id}/conversations"
            params = {
                'limit': limit,
                'fields': 'id,updated_time,participants'
            }
            response = self._make_request(endpoint, params=params)
            return response.get('data', [])
        except Exception as e:
            logger.error(f"Failed to fetch Instagram conversations: {e}")
            return []
    
    def get_instagram_messages(self, instagram_account_id: str, conversation_id: str,
                              limit: int = 25) -> List[Dict]:
        """Get messages from an Instagram Direct conversation"""
        try:
            endpoint = f"{conversation_id}/messages"
            params = {
                'limit': limit,
                'fields': 'id,message,created_time,from,to,attachments'
            }
            response = self._make_request(endpoint, params=params)
            return response.get('data', [])
        except Exception as e:
            logger.error(f"Failed to fetch Instagram messages: {e}")
            return []
    
    def set_messenger_profile(self, get_started_payload: str = None,
                             persistent_menu: List[Dict] = None,
                             greeting: List[Dict] = None) -> Dict:
        """Set Messenger profile settings"""
        try:
            endpoint = "me/messenger_profile"
            data = {}
            
            if get_started_payload:
                data["get_started"] = {"payload": get_started_payload}
            if persistent_menu:
                data["persistent_menu"] = persistent_menu
            if greeting:
                data["greeting"] = greeting
            
            response = self._make_request(endpoint, method='POST', data=data)
            return response
        except Exception as e:
            logger.error(f"Failed to set Messenger profile: {e}")
            return {}
    
    def get_webhook_events(self, limit: int = 100) -> List[Dict]:
        """Get recent webhook events (messages, postbacks, etc.)"""
        try:
            # This would typically be handled by webhook endpoints
            # For now, return empty list as webhooks are real-time
            return []
        except Exception as e:
            logger.error(f"Failed to fetch webhook events: {e}")
            return []
    
    def send_bulk_messages(self, recipients: List[str], message: str,
                          delay_seconds: int = 1) -> List[Dict]:
        """Send messages to multiple recipients with rate limiting"""
        try:
            results = []
            for recipient in recipients:
                result = self.send_text_message(recipient, message)
                results.append(result)
                
                # Rate limiting - wait between messages
                if delay_seconds > 0:
                    import time
                    time.sleep(delay_seconds)
            
            return results
        except Exception as e:
            logger.error(f"Failed to send bulk messages: {e}")
            return []
    
    def list_documents(self, data_room: DataRoom) -> List[DocumentMeta]:
        """List Messenger-related documents (conversations, profiles, accounts)"""
        documents = []
        
        try:
            # Get page info
            page_info = self.get_page_info()
            if page_info:
                documents.append(DocumentMeta(
                    id=f"messenger_page_{page_info.get('id')}",
                    title=f"Messenger Page: {page_info.get('name')}",
                    source=f"messenger://page/{page_info.get('id')}",
                    provider=self.provider,
                    created_at=datetime.now(),
                    metadata={
                        'type': 'page',
                        'page_id': page_info.get('id'),
                        'name': page_info.get('name')
                    }
                ))
            
            # Get Instagram accounts
            instagram_accounts = self.get_instagram_accounts()
            for account in instagram_accounts:
                documents.append(DocumentMeta(
                    id=f"instagram_account_{account.get('id')}",
                    title=f"Instagram Account: {account.get('username')}",
                    source=f"instagram://account/{account.get('id')}",
                    provider=self.provider,
                    created_at=datetime.now(),
                    metadata={
                        'type': 'instagram_account',
                        'account_id': account.get('id'),
                        'username': account.get('username')
                    }
                ))
            
            # Get conversations
            conversations = self.get_conversations(limit=5)
            for conversation in conversations:
                documents.append(DocumentMeta(
                    id=f"messenger_conversation_{conversation.get('id')}",
                    title=f"Conversation: {conversation.get('id')}",
                    source=f"messenger://conversation/{conversation.get('id')}",
                    provider=self.provider,
                    created_at=datetime.now(),
                    metadata={
                        'type': 'conversation',
                        'conversation_id': conversation.get('id'),
                        'message_count': conversation.get('message_count'),
                        'updated_time': conversation.get('updated_time')
                    }
                ))
                
        except Exception as e:
            logger.error(f"Failed to list Messenger documents: {e}")
        
        return documents
    
    def fetch_content(self, doc: DocumentMeta) -> str:
        """Fetch content for a specific Messenger document"""
        try:
            doc_type = doc.metadata.get('type')
            
            if doc_type == 'page':
                page_info = self.get_page_info()
                conversations = self.get_conversations(limit=5)
                return f"Messenger Page Info:\n{page_info}\n\nRecent Conversations:\n{conversations}"
            
            elif doc_type == 'instagram_account':
                account_id = doc.metadata['account_id']
                conversations = self.get_instagram_conversations(account_id, limit=5)
                return f"Instagram Conversations:\n{conversations}"
            
            elif doc_type == 'conversation':
                conversation_id = doc.metadata['conversation_id']
                messages = self.get_messages(conversation_id, limit=10)
                return f"Conversation Messages:\n{messages}"
            
            return ""
            
        except Exception as e:
            logger.error(f"Failed to fetch Messenger content: {e}")
            return ""
    
    def validate_connection(self) -> bool:
        """Validate the Messenger API connection"""
        try:
            response = self.get_page_info()
            return 'id' in response
        except Exception as e:
            logger.error(f"Messenger connection validation failed: {e}")
            return False
