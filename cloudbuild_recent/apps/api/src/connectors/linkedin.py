"""
LinkedIn API Connector
Handles LinkedIn company pages, posts, and professional networking features
"""

import requests
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from ..core.schemas import DataRoom, DocumentMeta
from ..core.storage import Connector

logger = logging.getLogger(__name__)

class LinkedInConnector(Connector):
    provider: str = "linkedin"
    
    def __init__(self, access_token: str, client_id: str, client_secret: str):
        self.access_token = access_token
        self.client_id = client_id
        self.client_secret = client_secret
        self.base_url = "https://api.linkedin.com/v2"
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0'
        })
    
    def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None) -> Dict:
        """Make authenticated request to LinkedIn API"""
        try:
            url = f"{self.base_url}/{endpoint}"
            response = self.session.request(method, url, json=data)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"LinkedIn API request failed: {e}")
            raise
    
    def get_profile(self) -> Dict:
        """Get current user's LinkedIn profile"""
        try:
            endpoint = "people/~"
            params = {
                'projection': '(id,firstName,lastName,headline,summary,industry,location,profilePicture(displayImage~:playableStreams))'
            }
            response = self._make_request(endpoint, params=params)
            return response
        except Exception as e:
            logger.error(f"Failed to fetch LinkedIn profile: {e}")
            return {}
    
    def get_companies(self) -> List[Dict]:
        """Get companies the user has access to"""
        try:
            endpoint = "organizationAcls"
            params = {
                'q': 'roleAssignee',
                'role': 'ADMINISTRATOR',
                'projection': '(elements*(organization~(id,name,logoV2,vanityName,website,industry,companySize,description)))'
            }
            response = self._make_request(endpoint, params=params)
            return response.get('elements', [])
        except Exception as e:
            logger.error(f"Failed to fetch LinkedIn companies: {e}")
            return []
    
    def get_company_posts(self, company_id: str, limit: int = 25) -> List[Dict]:
        """Get posts for a company page"""
        try:
            endpoint = f"organizations/{company_id}/updates"
            params = {
                'count': limit,
                'start': 0
            }
            response = self._make_request(endpoint, params=params)
            return response.get('elements', [])
        except Exception as e:
            logger.error(f"Failed to fetch company posts: {e}")
            return []
    
    def create_company_post(self, company_id: str, text: str, 
                           image_url: str = None, link_url: str = None) -> Dict:
        """Create a post on a company page"""
        try:
            endpoint = f"organizations/{company_id}/updates"
            
            # Build the post content
            post_data = {
                "author": f"urn:li:organization:{company_id}",
                "lifecycleState": "PUBLISHED",
                "specificContent": {
                    "com.linkedin.ugc.ShareContent": {
                        "shareCommentary": {
                            "text": text
                        },
                        "shareMediaCategory": "NONE"
                    }
                },
                "visibility": {
                    "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
                }
            }
            
            # Add image if provided
            if image_url:
                post_data["specificContent"]["com.linkedin.ugc.ShareContent"]["shareMediaCategory"] = "IMAGE"
                post_data["specificContent"]["com.linkedin.ugc.ShareContent"]["media"] = [
                    {
                        "status": "READY",
                        "description": {
                            "text": text
                        },
                        "media": image_url,
                        "title": {
                            "text": "Image"
                        }
                    }
                ]
            
            # Add link if provided
            if link_url:
                post_data["specificContent"]["com.linkedin.ugc.ShareContent"]["shareMediaCategory"] = "ARTICLE"
                post_data["specificContent"]["com.linkedin.ugc.ShareContent"]["media"] = [
                    {
                        "status": "READY",
                        "description": {
                            "text": text
                        },
                        "originalUrl": link_url,
                        "title": {
                            "text": "Link"
                        }
                    }
                ]
            
            response = self._make_request(endpoint, method='POST', data=post_data)
            return response
        except Exception as e:
            logger.error(f"Failed to create company post: {e}")
            return {}
    
    def get_company_analytics(self, company_id: str, start_date: str = None, 
                             end_date: str = None) -> Dict:
        """Get analytics for a company page"""
        try:
            if not start_date:
                start_date = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
            if not end_date:
                end_date = datetime.now().strftime('%Y-%m-%d')
            
            endpoint = f"organizations/{company_id}/updates"
            params = {
                'count': 100,
                'start': 0,
                'timeRange': {
                    'start': start_date,
                    'end': end_date
                }
            }
            
            response = self._make_request(endpoint, params=params)
            
            # Calculate basic analytics
            posts = response.get('elements', [])
            total_impressions = 0
            total_clicks = 0
            total_likes = 0
            total_comments = 0
            total_shares = 0
            
            for post in posts:
                # Note: Detailed analytics require additional API calls
                # This is a simplified version
                total_likes += post.get('numLikes', 0)
                total_comments += post.get('numComments', 0)
                total_shares += post.get('numShares', 0)
            
            return {
                'total_posts': len(posts),
                'total_likes': total_likes,
                'total_comments': total_comments,
                'total_shares': total_shares,
                'engagement_rate': (total_likes + total_comments + total_shares) / max(len(posts), 1)
            }
            
        except Exception as e:
            logger.error(f"Failed to fetch company analytics: {e}")
            return {}
    
    def search_companies(self, keywords: str, limit: int = 10) -> List[Dict]:
        """Search for companies by keywords"""
        try:
            endpoint = "search"
            params = {
                'keywords': keywords,
                'count': limit,
                'start': 0,
                'type': 'company'
            }
            response = self._make_request(endpoint, params=params)
            return response.get('elements', [])
        except Exception as e:
            logger.error(f"Failed to search companies: {e}")
            return []
    
    def get_company_followers(self, company_id: str) -> Dict:
        """Get follower statistics for a company"""
        try:
            endpoint = f"organizations/{company_id}"
            params = {
                'projection': '(id,name,numFollowers)'
            }
            response = self._make_request(endpoint, params=params)
            return response
        except Exception as e:
            logger.error(f"Failed to fetch company followers: {e}")
            return {}
    
    def get_connections(self, limit: int = 100) -> List[Dict]:
        """Get user's connections"""
        try:
            endpoint = "people/~/connections"
            params = {
                'count': limit,
                'start': 0,
                'projection': '(elements*(id,firstName,lastName,headline,industry,location))'
            }
            response = self._make_request(endpoint, params=params)
            return response.get('elements', [])
        except Exception as e:
            logger.error(f"Failed to fetch connections: {e}")
            return []
    
    def send_message(self, recipient_id: str, subject: str, message: str) -> Dict:
        """Send a message to a connection"""
        try:
            endpoint = "messaging/conversations"
            
            # First, create or get conversation
            conversation_data = {
                "participants": [
                    f"urn:li:person:{recipient_id}"
                ]
            }
            
            conversation_response = self._make_request(endpoint, method='POST', data=conversation_data)
            conversation_id = conversation_response.get('id')
            
            if not conversation_id:
                return {}
            
            # Send the message
            message_endpoint = f"messaging/conversations/{conversation_id}/events"
            message_data = {
                "eventCreate": {
                    "value": {
                        "com.linkedin.ugc.MessageEvent": {
                            "body": {
                                "text": message
                            },
                            "subject": subject
                        }
                    }
                }
            }
            
            response = self._make_request(message_endpoint, method='POST', data=message_data)
            return response
            
        except Exception as e:
            logger.error(f"Failed to send message: {e}")
            return {}
    
    def get_job_postings(self, company_id: str, limit: int = 25) -> List[Dict]:
        """Get job postings for a company"""
        try:
            endpoint = f"organizations/{company_id}/jobPostings"
            params = {
                'count': limit,
                'start': 0
            }
            response = self._make_request(endpoint, params=params)
            return response.get('elements', [])
        except Exception as e:
            logger.error(f"Failed to fetch job postings: {e}")
            return []
    
    def create_job_posting(self, company_id: str, job_data: Dict) -> Dict:
        """Create a job posting"""
        try:
            endpoint = f"organizations/{company_id}/jobPostings"
            
            # Build job posting data
            posting_data = {
                "author": f"urn:li:organization:{company_id}",
                "lifecycleState": "PUBLISHED",
                "specificContent": {
                    "com.linkedin.ugc.ShareContent": {
                        "shareCommentary": {
                            "text": job_data.get('description', '')
                        },
                        "shareMediaCategory": "NONE"
                    }
                },
                "visibility": {
                    "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
                }
            }
            
            response = self._make_request(endpoint, method='POST', data=posting_data)
            return response
            
        except Exception as e:
            logger.error(f"Failed to create job posting: {e}")
            return {}
    
    def list_documents(self, data_room: DataRoom) -> List[DocumentMeta]:
        """List LinkedIn-related documents (companies, posts, connections)"""
        documents = []
        
        try:
            # Get user profile
            profile = self.get_profile()
            if profile:
                documents.append(DocumentMeta(
                    id=f"linkedin_profile_{profile.get('id')}",
                    title=f"LinkedIn Profile: {profile.get('firstName', '')} {profile.get('lastName', '')}",
                    source=f"linkedin://profile/{profile.get('id')}",
                    provider=self.provider,
                    created_at=datetime.now(),
                    metadata={
                        'type': 'profile',
                        'profile_id': profile.get('id'),
                        'name': f"{profile.get('firstName', '')} {profile.get('lastName', '')}",
                        'headline': profile.get('headline')
                    }
                ))
            
            # Get companies
            companies = self.get_companies()
            for company in companies:
                org = company.get('organization', {})
                if org:
                    documents.append(DocumentMeta(
                        id=f"linkedin_company_{org.get('id')}",
                        title=f"LinkedIn Company: {org.get('name')}",
                        source=f"linkedin://company/{org.get('id')}",
                        provider=self.provider,
                        created_at=datetime.now(),
                        metadata={
                            'type': 'company',
                            'company_id': org.get('id'),
                            'name': org.get('name'),
                            'vanity_name': org.get('vanityName')
                        }
                    ))
                
        except Exception as e:
            logger.error(f"Failed to list LinkedIn documents: {e}")
        
        return documents
    
    def fetch_content(self, doc: DocumentMeta) -> str:
        """Fetch content for a specific LinkedIn document"""
        try:
            doc_type = doc.metadata.get('type')
            
            if doc_type == 'profile':
                profile_id = doc.metadata['profile_id']
                profile = self.get_profile()
                connections = self.get_connections(limit=10)
                return f"LinkedIn Profile:\n{profile}\n\nRecent Connections:\n{connections}"
            
            elif doc_type == 'company':
                company_id = doc.metadata['company_id']
                posts = self.get_company_posts(company_id, limit=10)
                analytics = self.get_company_analytics(company_id)
                followers = self.get_company_followers(company_id)
                
                return f"""LinkedIn Company Posts:
{posts}

Analytics:
{analytics}

Followers:
{followers}"""
            
            return ""
            
        except Exception as e:
            logger.error(f"Failed to fetch LinkedIn content: {e}")
            return ""
    
    def validate_connection(self) -> bool:
        """Validate the LinkedIn API connection"""
        try:
            response = self.get_profile()
            return 'id' in response
        except Exception as e:
            logger.error(f"LinkedIn connection validation failed: {e}")
            return False
