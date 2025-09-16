"""
WhatsApp Business API Connector
Handles WhatsApp Business messaging, media, and automation
"""

import requests
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from ..core.schemas import DataRoom, DocumentMeta
from ..core.storage import Connector

logger = logging.getLogger(__name__)

class WhatsAppConnector(Connector):
    provider: str = "whatsapp"
    
    def __init__(self, access_token: str, phone_number_id: str, business_account_id: str):
        self.access_token = access_token
        self.phone_number_id = phone_number_id
        self.business_account_id = business_account_id
        self.base_url = "https://graph.facebook.com/v18.0"
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        })
    
    def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None) -> Dict:
        """Make authenticated request to WhatsApp Business API"""
        try:
            url = f"{self.base_url}/{endpoint}"
            response = self.session.request(method, url, json=data)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"WhatsApp API request failed: {e}")
            raise
    
    def send_text_message(self, to: str, message: str) -> Dict:
        """Send a text message via WhatsApp"""
        try:
            endpoint = f"{self.phone_number_id}/messages"
            data = {
                "messaging_product": "whatsapp",
                "to": to,
                "type": "text",
                "text": {
                    "body": message
                }
            }
            response = self._make_request(endpoint, method='POST', data=data)
            return response
        except Exception as e:
            logger.error(f"Failed to send WhatsApp text message: {e}")
            return {}
    
    def send_media_message(self, to: str, media_type: str, media_url: str, 
                          caption: str = None) -> Dict:
        """Send a media message (image, video, document, audio) via WhatsApp"""
        try:
            endpoint = f"{self.phone_number_id}/messages"
            data = {
                "messaging_product": "whatsapp",
                "to": to,
                "type": media_type,
                media_type: {
                    "link": media_url
                }
            }
            
            if caption and media_type in ['image', 'video', 'document']:
                data[media_type]["caption"] = caption
            
            response = self._make_request(endpoint, method='POST', data=data)
            return response
        except Exception as e:
            logger.error(f"Failed to send WhatsApp media message: {e}")
            return {}
    
    def send_template_message(self, to: str, template_name: str, 
                             language_code: str, components: List[Dict] = None) -> Dict:
        """Send a template message via WhatsApp"""
        try:
            endpoint = f"{self.phone_number_id}/messages"
            data = {
                "messaging_product": "whatsapp",
                "to": to,
                "type": "template",
                "template": {
                    "name": template_name,
                    "language": {
                        "code": language_code
                    }
                }
            }
            
            if components:
                data["template"]["components"] = components
            
            response = self._make_request(endpoint, method='POST', data=data)
            return response
        except Exception as e:
            logger.error(f"Failed to send WhatsApp template message: {e}")
            return {}
    
    def send_interactive_message(self, to: str, interactive_type: str, 
                                header: Dict = None, body: Dict = None, 
                                footer: Dict = None, action: Dict = None) -> Dict:
        """Send an interactive message (buttons, lists) via WhatsApp"""
        try:
            endpoint = f"{self.phone_number_id}/messages"
            data = {
                "messaging_product": "whatsapp",
                "to": to,
                "type": "interactive",
                "interactive": {
                    "type": interactive_type
                }
            }
            
            if header:
                data["interactive"]["header"] = header
            if body:
                data["interactive"]["body"] = body
            if footer:
                data["interactive"]["footer"] = footer
            if action:
                data["interactive"]["action"] = action
            
            response = self._make_request(endpoint, method='POST', data=data)
            return response
        except Exception as e:
            logger.error(f"Failed to send WhatsApp interactive message: {e}")
            return {}
    
    def send_button_message(self, to: str, body_text: str, buttons: List[Dict]) -> Dict:
        """Send a message with buttons"""
        try:
            action = {
                "buttons": buttons
            }
            
            return self.send_interactive_message(
                to=to,
                interactive_type="button",
                body={"text": body_text},
                action=action
            )
        except Exception as e:
            logger.error(f"Failed to send WhatsApp button message: {e}")
            return {}
    
    def send_list_message(self, to: str, body_text: str, button_text: str, 
                         sections: List[Dict]) -> Dict:
        """Send a message with a list"""
        try:
            action = {
                "button": button_text,
                "sections": sections
            }
            
            return self.send_interactive_message(
                to=to,
                interactive_type="list",
                body={"text": body_text},
                action=action
            )
        except Exception as e:
            logger.error(f"Failed to send WhatsApp list message: {e}")
            return {}
    
    def get_media_url(self, media_id: str) -> str:
        """Get the URL for a media file"""
        try:
            endpoint = f"{media_id}"
            response = self._make_request(endpoint)
            return response.get('url', '')
        except Exception as e:
            logger.error(f"Failed to get media URL: {e}")
            return ""
    
    def download_media(self, media_id: str, file_path: str) -> bool:
        """Download media file to local path"""
        try:
            media_url = self.get_media_url(media_id)
            if not media_url:
                return False
            
            # Download the media
            response = requests.get(media_url, headers={'Authorization': f'Bearer {self.access_token}'})
            response.raise_for_status()
            
            with open(file_path, 'wb') as f:
                f.write(response.content)
            
            return True
        except Exception as e:
            logger.error(f"Failed to download media: {e}")
            return False
    
    def mark_message_as_read(self, message_id: str) -> Dict:
        """Mark a message as read"""
        try:
            endpoint = f"{self.phone_number_id}/messages"
            data = {
                "messaging_product": "whatsapp",
                "status": "read",
                "message_id": message_id
            }
            response = self._make_request(endpoint, method='POST', data=data)
            return response
        except Exception as e:
            logger.error(f"Failed to mark message as read: {e}")
            return {}
    
    def get_business_profile(self) -> Dict:
        """Get WhatsApp Business profile information"""
        try:
            endpoint = f"{self.phone_number_id}/whatsapp_business_profile"
            response = self._make_request(endpoint)
            return response
        except Exception as e:
            logger.error(f"Failed to fetch business profile: {e}")
            return {}
    
    def update_business_profile(self, about: str = None, address: str = None, 
                               description: str = None, email: str = None, 
                               website: List[str] = None) -> Dict:
        """Update WhatsApp Business profile"""
        try:
            endpoint = f"{self.phone_number_id}/whatsapp_business_profile"
            data = {}
            
            if about:
                data['about'] = about
            if address:
                data['address'] = address
            if description:
                data['description'] = description
            if email:
                data['email'] = email
            if website:
                data['websites'] = website
            
            response = self._make_request(endpoint, method='POST', data=data)
            return response
        except Exception as e:
            logger.error(f"Failed to update business profile: {e}")
            return {}
    
    def get_templates(self) -> List[Dict]:
        """Get approved message templates"""
        try:
            endpoint = f"{self.business_account_id}/message_templates"
            response = self._make_request(endpoint)
            return response.get('data', [])
        except Exception as e:
            logger.error(f"Failed to fetch templates: {e}")
            return []
    
    def create_template(self, name: str, category: str, language: str, 
                       components: List[Dict]) -> Dict:
        """Create a new message template"""
        try:
            endpoint = f"{self.business_account_id}/message_templates"
            data = {
                "name": name,
                "category": category,
                "language": language,
                "components": components
            }
            response = self._make_request(endpoint, method='POST', data=data)
            return response
        except Exception as e:
            logger.error(f"Failed to create template: {e}")
            return {}
    
    def get_phone_numbers(self) -> List[Dict]:
        """Get all phone numbers for the business account"""
        try:
            endpoint = f"{self.business_account_id}/phone_numbers"
            response = self._make_request(endpoint)
            return response.get('data', [])
        except Exception as e:
            logger.error(f"Failed to fetch phone numbers: {e}")
            return []
    
    def get_webhook_events(self, limit: int = 100) -> List[Dict]:
        """Get recent webhook events (messages, status updates)"""
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
    
    def create_contact(self, phone_number: str, name: str = None, 
                      labels: List[str] = None) -> Dict:
        """Create or update a contact"""
        try:
            # WhatsApp Business API doesn't have direct contact management
            # This would typically be handled by your CRM integration
            return {
                "phone_number": phone_number,
                "name": name,
                "labels": labels or [],
                "created_at": datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Failed to create contact: {e}")
            return {}
    
    def list_documents(self, data_room: DataRoom) -> List[DocumentMeta]:
        """List WhatsApp-related documents (templates, profiles, contacts)"""
        documents = []
        
        try:
            # Get business profile
            profile = self.get_business_profile()
            if profile:
                documents.append(DocumentMeta(
                    id=f"whatsapp_profile_{self.phone_number_id}",
                    title=f"WhatsApp Business: {profile.get('business_name', 'Unknown')}",
                    source=f"whatsapp://profile/{self.phone_number_id}",
                    provider=self.provider,
                    created_at=datetime.now(),
                    metadata={
                        'type': 'profile',
                        'phone_number_id': self.phone_number_id,
                        'business_name': profile.get('business_name'),
                        'about': profile.get('about')
                    }
                ))
            
            # Get templates
            templates = self.get_templates()
            for template in templates:
                documents.append(DocumentMeta(
                    id=f"whatsapp_template_{template.get('name')}",
                    title=f"Template: {template.get('name')}",
                    source=f"whatsapp://template/{template.get('name')}",
                    provider=self.provider,
                    created_at=datetime.now(),
                    metadata={
                        'type': 'template',
                        'name': template.get('name'),
                        'category': template.get('category'),
                        'language': template.get('language'),
                        'status': template.get('status')
                    }
                ))
                
        except Exception as e:
            logger.error(f"Failed to list WhatsApp documents: {e}")
        
        return documents
    
    def fetch_content(self, doc: DocumentMeta) -> str:
        """Fetch content for a specific WhatsApp document"""
        try:
            doc_type = doc.metadata.get('type')
            
            if doc_type == 'profile':
                profile = self.get_business_profile()
                phone_numbers = self.get_phone_numbers()
                return f"WhatsApp Business Profile:\n{profile}\n\nPhone Numbers:\n{phone_numbers}"
            
            elif doc_type == 'template':
                template_name = doc.metadata['name']
                templates = self.get_templates()
                template = next((t for t in templates if t.get('name') == template_name), {})
                return f"WhatsApp Template:\n{template}"
            
            return ""
            
        except Exception as e:
            logger.error(f"Failed to fetch WhatsApp content: {e}")
            return ""
    
    def validate_connection(self) -> bool:
        """Validate the WhatsApp Business API connection"""
        try:
            profile = self.get_business_profile()
            return 'business_name' in profile or 'about' in profile
        except Exception as e:
            logger.error(f"WhatsApp connection validation failed: {e}")
            return False
