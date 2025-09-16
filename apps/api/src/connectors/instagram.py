"""
Instagram Business API Connector
Handles Instagram Business accounts, posts, stories, and insights
"""

import requests
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from ..core.schemas import DataRoom, DocumentMeta
from ..core.storage import Connector

logger = logging.getLogger(__name__)

class InstagramConnector(Connector):
    provider: str = "instagram"
    
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
        """Make authenticated request to Instagram Graph API"""
        try:
            url = f"{self.base_url}/{endpoint}"
            response = self.session.request(method, url, json=data)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Instagram API request failed: {e}")
            raise
    
    def get_business_accounts(self) -> List[Dict]:
        """Get all Instagram business accounts for the user"""
        try:
            response = self._make_request("me/accounts")
            instagram_accounts = []
            
            for account in response.get('data', []):
                # Get Instagram account for each Facebook page
                try:
                    ig_response = self._make_request(f"{account['id']}/instagram_accounts")
                    for ig_account in ig_response.get('data', []):
                        ig_account['facebook_page_id'] = account['id']
                        ig_account['facebook_page_name'] = account['name']
                        instagram_accounts.append(ig_account)
                except Exception as e:
                    logger.warning(f"Failed to get Instagram account for page {account['id']}: {e}")
                    continue
            
            return instagram_accounts
        except Exception as e:
            logger.error(f"Failed to fetch Instagram business accounts: {e}")
            return []
    
    def get_media(self, instagram_account_id: str, limit: int = 25) -> List[Dict]:
        """Get media posts for an Instagram business account"""
        try:
            endpoint = f"{instagram_account_id}/media"
            params = {'limit': limit}
            response = self._make_request(endpoint, params=params)
            return response.get('data', [])
        except Exception as e:
            logger.error(f"Failed to fetch Instagram media: {e}")
            return []
    
    def create_media_container(self, instagram_account_id: str, image_url: str, 
                              caption: str = None, media_type: str = 'IMAGE') -> Dict:
        """Create a media container for posting"""
        try:
            endpoint = f"{instagram_account_id}/media"
            data = {
                'image_url': image_url,
                'media_type': media_type
            }
            
            if caption:
                data['caption'] = caption
            
            response = self._make_request(endpoint, method='POST', data=data)
            return response
        except Exception as e:
            logger.error(f"Failed to create media container: {e}")
            return {}
    
    def publish_media(self, instagram_account_id: str, creation_id: str) -> Dict:
        """Publish a media container"""
        try:
            endpoint = f"{instagram_account_id}/media_publish"
            data = {'creation_id': creation_id}
            
            response = self._make_request(endpoint, method='POST', data=data)
            return response
        except Exception as e:
            logger.error(f"Failed to publish media: {e}")
            return {}
    
    def create_post(self, instagram_account_id: str, image_url: str, caption: str) -> Dict:
        """Create and publish an Instagram post"""
        try:
            # Step 1: Create media container
            container_response = self.create_media_container(
                instagram_account_id, image_url, caption
            )
            
            if 'id' not in container_response:
                return container_response
            
            creation_id = container_response['id']
            
            # Step 2: Publish the media
            publish_response = self.publish_media(instagram_account_id, creation_id)
            return publish_response
            
        except Exception as e:
            logger.error(f"Failed to create Instagram post: {e}")
            return {}
    
    def create_story(self, instagram_account_id: str, image_url: str, 
                    media_type: str = 'IMAGE') -> Dict:
        """Create an Instagram story"""
        try:
            endpoint = f"{instagram_account_id}/media"
            data = {
                'image_url': image_url,
                'media_type': media_type,
                'is_story': True
            }
            
            response = self._make_request(endpoint, method='POST', data=data)
            
            if 'id' in response:
                # Publish the story
                publish_response = self.publish_media(instagram_account_id, response['id'])
                return publish_response
            
            return response
        except Exception as e:
            logger.error(f"Failed to create Instagram story: {e}")
            return {}
    
    def get_insights(self, instagram_account_id: str, metric: str = 'impressions') -> Dict:
        """Get insights for an Instagram business account"""
        try:
            endpoint = f"{instagram_account_id}/insights"
            params = {
                'metric': metric,
                'period': 'day',
                'since': (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d'),
                'until': datetime.now().strftime('%Y-%m-%d')
            }
            
            response = self._make_request(endpoint, params=params)
            return response
        except Exception as e:
            logger.error(f"Failed to fetch Instagram insights: {e}")
            return {}
    
    def get_media_insights(self, media_id: str) -> Dict:
        """Get insights for a specific media post"""
        try:
            endpoint = f"{media_id}/insights"
            params = {'metric': 'impressions,reach,engagement,likes,comments,shares,saved'}
            
            response = self._make_request(endpoint, params=params)
            return response
        except Exception as e:
            logger.error(f"Failed to fetch media insights: {e}")
            return {}
    
    def get_hashtag_info(self, hashtag: str) -> Dict:
        """Get information about a hashtag"""
        try:
            # First, search for the hashtag
            search_response = self._make_request(f"ig_hashtag_search", params={'q': hashtag})
            
            if not search_response.get('data'):
                return {}
            
            hashtag_id = search_response['data'][0]['id']
            
            # Get hashtag information
            info_response = self._make_request(f"{hashtag_id}")
            return info_response
            
        except Exception as e:
            logger.error(f"Failed to fetch hashtag info: {e}")
            return {}
    
    def get_hashtag_media(self, hashtag: str, limit: int = 25) -> List[Dict]:
        """Get recent media for a hashtag"""
        try:
            # First, search for the hashtag
            search_response = self._make_request(f"ig_hashtag_search", params={'q': hashtag})
            
            if not search_response.get('data'):
                return []
            
            hashtag_id = search_response['data'][0]['id']
            
            # Get recent media
            media_response = self._make_request(f"{hashtag_id}/recent_media", params={'limit': limit})
            return media_response.get('data', [])
            
        except Exception as e:
            logger.error(f"Failed to fetch hashtag media: {e}")
            return []
    
    def get_user_profile(self, instagram_account_id: str) -> Dict:
        """Get user profile information"""
        try:
            endpoint = f"{instagram_account_id}"
            params = {'fields': 'id,username,account_type,media_count,followers_count,follows_count'}
            
            response = self._make_request(endpoint, params=params)
            return response
        except Exception as e:
            logger.error(f"Failed to fetch user profile: {e}")
            return {}
    
    def get_comments(self, media_id: str) -> List[Dict]:
        """Get comments for a media post"""
        try:
            endpoint = f"{media_id}/comments"
            response = self._make_request(endpoint)
            return response.get('data', [])
        except Exception as e:
            logger.error(f"Failed to fetch comments: {e}")
            return []
    
    def reply_to_comment(self, comment_id: str, message: str) -> Dict:
        """Reply to a comment"""
        try:
            endpoint = f"{comment_id}/replies"
            data = {'message': message}
            
            response = self._make_request(endpoint, method='POST', data=data)
            return response
        except Exception as e:
            logger.error(f"Failed to reply to comment: {e}")
            return {}
    
    def list_documents(self, data_room: DataRoom) -> List[DocumentMeta]:
        """List Instagram-related documents (accounts, posts, insights)"""
        documents = []
        
        try:
            # Get Instagram business accounts
            accounts = self.get_business_accounts()
            for account in accounts:
                documents.append(DocumentMeta(
                    id=f"instagram_account_{account['id']}",
                    title=f"Instagram Account: {account.get('username', 'Unknown')}",
                    source=f"instagram://account/{account['id']}",
                    provider=self.provider,
                    created_at=datetime.now(),
                    metadata={
                        'type': 'account',
                        'account_id': account['id'],
                        'username': account.get('username'),
                        'facebook_page_id': account.get('facebook_page_id'),
                        'facebook_page_name': account.get('facebook_page_name')
                    }
                ))
                
        except Exception as e:
            logger.error(f"Failed to list Instagram documents: {e}")
        
        return documents
    
    def fetch_content(self, doc: DocumentMeta) -> str:
        """Fetch content for a specific Instagram document"""
        try:
            doc_type = doc.metadata.get('type')
            
            if doc_type == 'account':
                account_id = doc.metadata['account_id']
                profile = self.get_user_profile(account_id)
                insights = self.get_insights(account_id)
                media = self.get_media(account_id, limit=10)
                
                return f"""Instagram Account Profile:
{profile}

Recent Insights:
{insights}

Recent Media:
{media}"""
            
            return ""
            
        except Exception as e:
            logger.error(f"Failed to fetch Instagram content: {e}")
            return ""
    
    def validate_connection(self) -> bool:
        """Validate the Instagram API connection"""
        try:
            response = self._make_request("me")
            return 'id' in response
        except Exception as e:
            logger.error(f"Instagram connection validation failed: {e}")
            return False
