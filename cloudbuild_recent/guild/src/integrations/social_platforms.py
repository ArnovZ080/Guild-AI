"""
Social Media Platform Integrations

Comprehensive integration with LinkedIn, Twitter/X, Instagram, and TikTok APIs
for Content + Trend Spotter + Influencer Outreach Agents.
"""

import asyncio
import aiohttp
import json
from typing import Dict, Any, List, Optional, Union
from datetime import datetime, date, timedelta
from dataclasses import dataclass, asdict
from enum import Enum
from guild.src.core.config import settings
from guild.src.utils.logging_utils import get_logger

logger = get_logger(__name__)

class SocialPlatform(Enum):
    LINKEDIN = "linkedin"
    TWITTER = "twitter"
    INSTAGRAM = "instagram"
    TIKTOK = "tiktok"

class PostType(Enum):
    TEXT = "text"
    IMAGE = "image"
    VIDEO = "video"
    CAROUSEL = "carousel"
    STORY = "story"

@dataclass
class SocialCredentials:
    """Credentials for social media platforms"""
    platform: SocialPlatform
    access_token: str
    refresh_token: Optional[str] = None
    app_id: Optional[str] = None
    app_secret: Optional[str] = None
    user_id: Optional[str] = None
    expires_at: Optional[datetime] = None

@dataclass
class SocialPost:
    """Standardized social media post format"""
    id: str
    platform: SocialPlatform
    content: str
    post_type: PostType
    media_urls: List[str]
    hashtags: List[str]
    mentions: List[str]
    created_at: datetime
    engagement_metrics: Dict[str, Any]
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}

@dataclass
class SocialAnalytics:
    """Standardized social media analytics format"""
    platform: SocialPlatform
    account_id: str
    date_range: Dict[str, date]
    followers_count: int
    engagement_rate: float
    impressions: int
    reach: int
    likes: int
    comments: int
    shares: int
    saves: int
    clicks: int
    profile_views: int
    website_clicks: int
    top_posts: List[Dict[str, Any]]
    audience_demographics: Dict[str, Any]
    best_posting_times: List[str]

class LinkedInConnector:
    """LinkedIn API connector for professional networking"""
    
    def __init__(self, credentials: SocialCredentials):
        self.credentials = credentials
        self.base_url = "https://api.linkedin.com/v2"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None) -> Dict:
        """Make authenticated request to LinkedIn API"""
        try:
            url = f"{self.base_url}/{endpoint}"
            headers = {
                'Authorization': f'Bearer {self.credentials.access_token}',
                'Content-Type': 'application/json'
            }
            
            async with self.session.request(method, url, json=data, headers=headers) as response:
                response.raise_for_status()
                return await response.json()
                
        except Exception as e:
            logger.error(f"LinkedIn API request failed: {e}")
            raise
    
    async def get_profile(self) -> Dict[str, Any]:
        """Get LinkedIn profile information"""
        endpoint = "people/~:(id,firstName,lastName,headline,summary,profilePicture)"
        return await self._make_request(endpoint)
    
    async def create_post(self, content: str, visibility: str = "PUBLIC") -> Dict[str, Any]:
        """Create a LinkedIn post"""
        endpoint = "ugcPosts"
        
        # Get user URN
        profile = await self.get_profile()
        author_urn = f"urn:li:person:{profile['id']}"
        
        data = {
            "author": author_urn,
            "lifecycleState": "PUBLISHED",
            "specificContent": {
                "com.linkedin.ugc.ShareContent": {
                    "shareCommentary": {
                        "text": content
                    },
                    "shareMediaCategory": "NONE"
                }
            },
            "visibility": {
                "com.linkedin.ugc.MemberNetworkVisibility": visibility
            }
        }
        
        return await self._make_request(endpoint, method='POST', data=data)
    
    async def get_posts(self, count: int = 10) -> List[Dict[str, Any]]:
        """Get recent posts from the user"""
        endpoint = "ugcPosts"
        params = {
            'q': 'authors',
            'authors': f'urn:li:person:{self.credentials.user_id}',
            'count': count
        }
        
        response = await self._make_request(endpoint, params=params)
        return response.get('elements', [])
    
    async def get_analytics(self, start_date: date, end_date: date) -> SocialAnalytics:
        """Get LinkedIn analytics"""
        # LinkedIn analytics require specific permissions and setup
        # This is a simplified implementation
        return SocialAnalytics(
            platform=SocialPlatform.LINKEDIN,
            account_id=self.credentials.user_id or "unknown",
            date_range={"start": start_date, "end": end_date},
            followers_count=0,  # Would need specific API call
            engagement_rate=0.0,
            impressions=0,
            reach=0,
            likes=0,
            comments=0,
            shares=0,
            saves=0,
            clicks=0,
            profile_views=0,
            website_clicks=0,
            top_posts=[],
            audience_demographics={},
            best_posting_times=[]
        )
    
    async def validate_connection(self) -> bool:
        """Validate LinkedIn API connection"""
        try:
            await self.get_profile()
            return True
        except Exception as e:
            logger.error(f"LinkedIn connection validation failed: {e}")
            return False

class TwitterConnector:
    """Twitter/X API connector for social media management"""
    
    def __init__(self, credentials: SocialCredentials):
        self.credentials = credentials
        self.base_url = "https://api.twitter.com/2"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None, params: Dict = None) -> Dict:
        """Make authenticated request to Twitter API"""
        try:
            url = f"{self.base_url}/{endpoint}"
            headers = {
                'Authorization': f'Bearer {self.credentials.access_token}',
                'Content-Type': 'application/json'
            }
            
            async with self.session.request(method, url, json=data, params=params, headers=headers) as response:
                response.raise_for_status()
                return await response.json()
                
        except Exception as e:
            logger.error(f"Twitter API request failed: {e}")
            raise
    
    async def get_user_info(self) -> Dict[str, Any]:
        """Get Twitter user information"""
        endpoint = f"users/by/username/{self.credentials.user_id}"
        params = {
            'user.fields': 'id,name,username,public_metrics,verified'
        }
        return await self._make_request(endpoint, params=params)
    
    async def create_tweet(self, content: str, media_ids: List[str] = None) -> Dict[str, Any]:
        """Create a tweet"""
        endpoint = "tweets"
        
        data = {"text": content}
        if media_ids:
            data["media"] = {"media_ids": media_ids}
        
        return await self._make_request(endpoint, method='POST', data=data)
    
    async def get_tweets(self, user_id: str = None, count: int = 10) -> List[Dict[str, Any]]:
        """Get recent tweets"""
        user_id = user_id or self.credentials.user_id
        endpoint = f"users/{user_id}/tweets"
        params = {
            'max_results': count,
            'tweet.fields': 'created_at,public_metrics'
        }
        
        response = await self._make_request(endpoint, params=params)
        return response.get('data', [])
    
    async def get_analytics(self, start_date: date, end_date: date) -> SocialAnalytics:
        """Get Twitter analytics"""
        user_info = await self.get_user_info()
        user_data = user_info.get('data', {})
        metrics = user_data.get('public_metrics', {})
        
        return SocialAnalytics(
            platform=SocialPlatform.TWITTER,
            account_id=user_data.get('id', 'unknown'),
            date_range={"start": start_date, "end": end_date},
            followers_count=metrics.get('followers_count', 0),
            engagement_rate=0.0,  # Would need specific analytics API
            impressions=0,
            reach=0,
            likes=metrics.get('like_count', 0),
            comments=metrics.get('reply_count', 0),
            shares=metrics.get('retweet_count', 0),
            saves=0,
            clicks=0,
            profile_views=0,
            website_clicks=0,
            top_posts=[],
            audience_demographics={},
            best_posting_times=[]
        )
    
    async def validate_connection(self) -> bool:
        """Validate Twitter API connection"""
        try:
            await self.get_user_info()
            return True
        except Exception as e:
            logger.error(f"Twitter connection validation failed: {e}")
            return False

class InstagramConnector:
    """Instagram API connector for visual content management"""
    
    def __init__(self, credentials: SocialCredentials):
        self.credentials = credentials
        self.base_url = "https://graph.facebook.com/v18.0"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None) -> Dict:
        """Make authenticated request to Instagram API"""
        try:
            url = f"{self.base_url}/{endpoint}"
            params = {
                'access_token': self.credentials.access_token
            }
            
            async with self.session.request(method, url, json=data, params=params) as response:
                response.raise_for_status()
                return await response.json()
                
        except Exception as e:
            logger.error(f"Instagram API request failed: {e}")
            raise
    
    async def get_user_info(self) -> Dict[str, Any]:
        """Get Instagram user information"""
        endpoint = f"{self.credentials.user_id}"
        params = {
            'fields': 'id,username,account_type,media_count,followers_count,follows_count'
        }
        
        response = await self._make_request(endpoint, params=params)
        return response
    
    async def get_media(self, count: int = 10) -> List[Dict[str, Any]]:
        """Get recent Instagram media"""
        endpoint = f"{self.credentials.user_id}/media"
        params = {
            'fields': 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp',
            'limit': count
        }
        
        response = await self._make_request(endpoint, params=params)
        return response.get('data', [])
    
    async def create_media_container(self, image_url: str, caption: str) -> Dict[str, Any]:
        """Create media container for Instagram post"""
        endpoint = f"{self.credentials.user_id}/media"
        
        data = {
            'image_url': image_url,
            'caption': caption
        }
        
        return await self._make_request(endpoint, method='POST', data=data)
    
    async def publish_media(self, creation_id: str) -> Dict[str, Any]:
        """Publish Instagram media"""
        endpoint = f"{self.credentials.user_id}/media_publish"
        
        data = {
            'creation_id': creation_id
        }
        
        return await self._make_request(endpoint, method='POST', data=data)
    
    async def get_insights(self, start_date: date, end_date: date) -> SocialAnalytics:
        """Get Instagram insights"""
        # Instagram insights require Instagram Business accounts
        user_info = await self.get_user_info()
        
        return SocialAnalytics(
            platform=SocialPlatform.INSTAGRAM,
            account_id=user_info.get('id', 'unknown'),
            date_range={"start": start_date, "end": end_date},
            followers_count=user_info.get('followers_count', 0),
            engagement_rate=0.0,
            impressions=0,
            reach=0,
            likes=0,
            comments=0,
            shares=0,
            saves=0,
            clicks=0,
            profile_views=0,
            website_clicks=0,
            top_posts=[],
            audience_demographics={},
            best_posting_times=[]
        )
    
    async def validate_connection(self) -> bool:
        """Validate Instagram API connection"""
        try:
            await self.get_user_info()
            return True
        except Exception as e:
            logger.error(f"Instagram connection validation failed: {e}")
            return False

class TikTokConnector:
    """TikTok API connector for short-form video content"""
    
    def __init__(self, credentials: SocialCredentials):
        self.credentials = credentials
        self.base_url = "https://open.tiktokapis.com/v2"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None) -> Dict:
        """Make authenticated request to TikTok API"""
        try:
            url = f"{self.base_url}/{endpoint}"
            headers = {
                'Authorization': f'Bearer {self.credentials.access_token}',
                'Content-Type': 'application/json'
            }
            
            async with self.session.request(method, url, json=data, headers=headers) as response:
                response.raise_for_status()
                return await response.json()
                
        except Exception as e:
            logger.error(f"TikTok API request failed: {e}")
            raise
    
    async def get_user_info(self) -> Dict[str, Any]:
        """Get TikTok user information"""
        endpoint = "user/info"
        params = {
            'fields': 'open_id,union_id,avatar_url,display_name,follower_count,following_count,likes_count,video_count'
        }
        
        response = await self._make_request(endpoint, params=params)
        return response
    
    async def get_videos(self, count: int = 10) -> List[Dict[str, Any]]:
        """Get recent TikTok videos"""
        endpoint = "video/list"
        params = {
            'fields': 'id,title,video_description,duration,cover_image_url,embed_url,like_count,comment_count,share_count,view_count',
            'max_count': count
        }
        
        response = await self._make_request(endpoint, params=params)
        return response.get('videos', [])
    
    async def upload_video(self, video_file_path: str, description: str) -> Dict[str, Any]:
        """Upload a TikTok video"""
        # TikTok video upload is complex and requires multiple steps
        # This is a simplified implementation
        endpoint = "post/publish/video/init"
        
        data = {
            'post_info': {
                'title': description,
                'description': description,
                'privacy_level': 'PUBLIC_TO_EVERYONE',
                'disable_duet': False,
                'disable_comment': False,
                'disable_stitch': False,
                'video_cover_timestamp_ms': 1000
            },
            'source_info': {
                'source': 'FILE_UPLOAD',
                'video_size': 0,  # Would get actual file size
                'chunk_size': 10000000,
                'total_chunk_count': 1
            }
        }
        
        return await self._make_request(endpoint, method='POST', data=data)
    
    async def get_analytics(self, start_date: date, end_date: date) -> SocialAnalytics:
        """Get TikTok analytics"""
        user_info = await self.get_user_info()
        user_data = user_info.get('data', {})
        
        return SocialAnalytics(
            platform=SocialPlatform.TIKTOK,
            account_id=user_data.get('open_id', 'unknown'),
            date_range={"start": start_date, "end": end_date},
            followers_count=user_data.get('follower_count', 0),
            engagement_rate=0.0,
            impressions=0,
            reach=0,
            likes=user_data.get('likes_count', 0),
            comments=0,
            shares=0,
            saves=0,
            clicks=0,
            profile_views=0,
            website_clicks=0,
            top_posts=[],
            audience_demographics={},
            best_posting_times=[]
        )
    
    async def validate_connection(self) -> bool:
        """Validate TikTok API connection"""
        try:
            await self.get_user_info()
            return True
        except Exception as e:
            logger.error(f"TikTok connection validation failed: {e}")
            return False

class SocialMediaManager:
    """Manager for multiple social media platform integrations"""
    
    def __init__(self):
        self.connectors: Dict[SocialPlatform, Any] = {}
    
    def add_platform(self, platform: SocialPlatform, credentials: SocialCredentials):
        """Add a social media platform connector"""
        if platform == SocialPlatform.LINKEDIN:
            self.connectors[platform] = LinkedInConnector(credentials)
        elif platform == SocialPlatform.TWITTER:
            self.connectors[platform] = TwitterConnector(credentials)
        elif platform == SocialPlatform.INSTAGRAM:
            self.connectors[platform] = InstagramConnector(credentials)
        elif platform == SocialPlatform.TIKTOK:
            self.connectors[platform] = TikTokConnector(credentials)
        
        logger.info(f"Added {platform.value} connector")
    
    async def cross_platform_post(self, content: str, platforms: List[SocialPlatform], media_urls: List[str] = None) -> Dict[str, Any]:
        """Post content across multiple platforms"""
        results = {}
        
        for platform in platforms:
            if platform in self.connectors:
                try:
                    connector = self.connectors[platform]
                    
                    async with connector:
                        if platform == SocialPlatform.LINKEDIN:
                            result = await connector.create_post(content)
                        elif platform == SocialPlatform.TWITTER:
                            result = await connector.create_tweet(content)
                        elif platform == SocialPlatform.INSTAGRAM:
                            # Instagram requires image upload
                            if media_urls:
                                container = await connector.create_media_container(media_urls[0], content)
                                result = await connector.publish_media(container['id'])
                            else:
                                result = {"error": "Instagram requires media"}
                        elif platform == SocialPlatform.TIKTOK:
                            result = {"error": "TikTok video upload not implemented in this example"}
                        
                        results[platform.value] = result
                        
                except Exception as e:
                    logger.error(f"Error posting to {platform.value}: {e}")
                    results[platform.value] = {"error": str(e)}
        
        return results
    
    async def get_unified_analytics(self, start_date: date, end_date: date) -> Dict[SocialPlatform, SocialAnalytics]:
        """Get analytics from all connected platforms"""
        analytics = {}
        
        for platform, connector in self.connectors.items():
            try:
                async with connector:
                    platform_analytics = await connector.get_analytics(start_date, end_date)
                    analytics[platform] = platform_analytics
            except Exception as e:
                logger.error(f"Error getting analytics from {platform.value}: {e}")
        
        return analytics
    
    async def validate_all_connections(self) -> Dict[SocialPlatform, bool]:
        """Validate connections to all platforms"""
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

# Global social media manager
social_media_manager = SocialMediaManager()

# Convenience functions
def add_social_credentials(platform: str, access_token: str, user_id: str = None, app_id: str = None, app_secret: str = None):
    """Add social media platform credentials"""
    credentials = SocialCredentials(
        platform=SocialPlatform(platform),
        access_token=access_token,
        user_id=user_id,
        app_id=app_id,
        app_secret=app_secret
    )
    social_media_manager.add_platform(credentials.platform, credentials)

async def post_to_social_platforms(content: str, platforms: List[str], media_urls: List[str] = None):
    """Post content to multiple social platforms"""
    platform_enums = [SocialPlatform(platform) for platform in platforms]
    return await social_media_manager.cross_platform_post(content, platform_enums, media_urls)

async def get_social_analytics(start_date: date, end_date: date):
    """Get analytics from all connected social platforms"""
    return await social_media_manager.get_unified_analytics(start_date, end_date)
