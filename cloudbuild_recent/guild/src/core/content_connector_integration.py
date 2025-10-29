"""
Content Connector Integration System for Guild-AI
Provides real-time content data synchronization between social media and content platform connectors.
"""

import asyncio
import json
import logging
from typing import Dict, List, Any, Optional, Union
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from enum import Enum
import uuid

# Import connector system
try:
    from apps.api.src.connectors.registry import REGISTRY
    from apps.api.src.core.schemas import ConnectorCredential
    CONNECTOR_SYSTEM_AVAILABLE = True
except ImportError as e:
    logging.warning(f"Connector system not available: {e}")
    CONNECTOR_SYSTEM_AVAILABLE = False

class ContentDataSourceType(Enum):
    """Types of content data sources from connectors"""
    SOCIAL_POSTS = "social_posts"
    SOCIAL_INSIGHTS = "social_insights"
    SOCIAL_ENGAGEMENT = "social_engagement"
    SOCIAL_AUDIENCE = "social_audience"
    CONTENT_PERFORMANCE = "content_performance"
    CAMPAIGN_DATA = "campaign_data"
    AD_PERFORMANCE = "ad_performance"
    EMAIL_CAMPAIGNS = "email_campaigns"
    BLOG_CONTENT = "blog_content"
    VIDEO_CONTENT = "video_content"
    PODCAST_CONTENT = "podcast_content"
    WEBINAR_CONTENT = "webinar_content"

class ContentSyncStatus(Enum):
    """Content synchronization status"""
    PENDING = "pending"
    SYNCING = "syncing"
    COMPLETED = "completed"
    FAILED = "failed"
    RATE_LIMITED = "rate_limited"

@dataclass
class ContentDataSource:
    """Content data source configuration for a connector"""
    connector_id: str
    data_source_type: ContentDataSourceType
    sync_interval: int  # seconds
    last_sync: Optional[datetime] = None
    sync_status: ContentSyncStatus = ContentSyncStatus.PENDING
    credentials: Optional[Dict[str, Any]] = None
    mapping_config: Optional[Dict[str, Any]] = None
    filters: Optional[Dict[str, Any]] = None

@dataclass
class ContentDataPoint:
    """Standardized content data point from connectors"""
    source_connector: str
    source_type: ContentDataSourceType
    content_id: str
    data_type: str
    raw_data: Dict[str, Any]
    processed_data: Dict[str, Any]
    timestamp: datetime
    sync_id: str

class ContentConnectorIntegrator:
    """
    Integrates content connector data with Content Dashboard and autonomous workflows.
    """
    
    def __init__(self):
        self.content_sources: Dict[str, ContentDataSource] = {}
        self.content_data_cache: Dict[str, List[ContentDataPoint]] = {}
        self.sync_tasks: Dict[str, asyncio.Task] = {}
        self.sync_history: List[Dict[str, Any]] = []
        
        # Content mapping configurations for different connectors
        self.content_connector_mappings = self._initialize_content_connector_mappings()
        
        # Initialize content sources
        self._initialize_content_sources()
    
    def _initialize_content_connector_mappings(self) -> Dict[str, Dict[str, Any]]:
        """Initialize content field mappings for different connectors"""
        return {
            "facebook": {
                "posts": {
                    "content_id": "id",
                    "message": "message",
                    "created_time": "created_time",
                    "likes": "likes.summary.total_count",
                    "comments": "comments.summary.total_count",
                    "shares": "shares.count",
                    "reach": "insights.data[0].values[0].value",
                    "impressions": "insights.data[1].values[0].value",
                    "engagement_rate": "calculated_engagement_rate",
                    "post_type": "type",
                    "media_url": "attachments.data[0].media.image.src"
                },
                "insights": {
                    "page_id": "id",
                    "followers": "followers_count",
                    "page_views": "page_views_total",
                    "post_reach": "post_reach_total",
                    "engagement": "post_engagements_total",
                    "reach": "page_reach_total",
                    "impressions": "page_impressions_total"
                },
                "ads": {
                    "ad_id": "id",
                    "campaign_id": "campaign_id",
                    "adset_id": "adset_id",
                    "name": "name",
                    "status": "status",
                    "spend": "spend",
                    "impressions": "impressions",
                    "clicks": "clicks",
                    "ctr": "ctr",
                    "cpc": "cpc",
                    "cpm": "cpm",
                    "conversions": "conversions"
                }
            },
            "instagram": {
                "posts": {
                    "content_id": "id",
                    "caption": "caption",
                    "media_type": "media_type",
                    "media_url": "media_url",
                    "thumbnail_url": "thumbnail_url",
                    "timestamp": "timestamp",
                    "likes": "like_count",
                    "comments": "comments_count",
                    "reach": "insights.reach",
                    "impressions": "insights.impressions",
                    "engagement": "insights.engagement"
                },
                "stories": {
                    "story_id": "id",
                    "media_type": "media_type",
                    "media_url": "media_url",
                    "timestamp": "timestamp",
                    "impressions": "insights.impressions",
                    "reach": "insights.reach",
                    "replies": "insights.replies",
                    "taps_forward": "insights.taps_forward",
                    "taps_back": "insights.taps_back"
                },
                "insights": {
                    "account_id": "id",
                    "followers": "followers_count",
                    "follows": "follows_count",
                    "media_count": "media_count",
                    "website_clicks": "website_clicks",
                    "email_contacts": "email_contacts",
                    "phone_call_clicks": "phone_call_clicks"
                }
            },
            "linkedin": {
                "posts": {
                    "content_id": "id",
                    "text": "text",
                    "created_time": "created_time",
                    "likes": "numLikes",
                    "comments": "numComments",
                    "shares": "numShares",
                    "impressions": "numImpressions",
                    "clicks": "numClicks",
                    "engagement_rate": "calculated_engagement_rate"
                },
                "company_posts": {
                    "content_id": "id",
                    "text": "text",
                    "created_time": "created_time",
                    "likes": "numLikes",
                    "comments": "numComments",
                    "shares": "numShares",
                    "impressions": "numImpressions",
                    "clicks": "numClicks"
                },
                "insights": {
                    "company_id": "id",
                    "followers": "followers_count",
                    "page_views": "page_views_total",
                    "post_impressions": "post_impressions_total",
                    "engagement": "post_engagements_total"
                }
            },
            "twitter": {
                "tweets": {
                    "content_id": "id",
                    "text": "text",
                    "created_at": "created_at",
                    "retweets": "public_metrics.retweet_count",
                    "likes": "public_metrics.like_count",
                    "replies": "public_metrics.reply_count",
                    "quotes": "public_metrics.quote_count",
                    "impressions": "public_metrics.impression_count",
                    "engagement_rate": "calculated_engagement_rate"
                },
                "insights": {
                    "user_id": "id",
                    "followers": "public_metrics.followers_count",
                    "following": "public_metrics.following_count",
                    "tweets": "public_metrics.tweet_count",
                    "listed": "public_metrics.listed_count"
                }
            },
            "tiktok": {
                "posts": {
                    "content_id": "id",
                    "caption": "caption",
                    "created_time": "create_time",
                    "likes": "statistics.like_count",
                    "comments": "statistics.comment_count",
                    "shares": "statistics.share_count",
                    "views": "statistics.play_count",
                    "video_url": "video.download_addr.url_list[0]"
                },
                "insights": {
                    "user_id": "id",
                    "followers": "follower_count",
                    "following": "following_count",
                    "likes": "heart_count",
                    "videos": "video_count"
                }
            },
            "youtube": {
                "videos": {
                    "content_id": "id",
                    "title": "snippet.title",
                    "description": "snippet.description",
                    "published_at": "snippet.publishedAt",
                    "views": "statistics.viewCount",
                    "likes": "statistics.likeCount",
                    "dislikes": "statistics.dislikeCount",
                    "comments": "statistics.commentCount",
                    "thumbnail": "snippet.thumbnails.high.url"
                },
                "channel": {
                    "channel_id": "id",
                    "title": "snippet.title",
                    "description": "snippet.description",
                    "subscribers": "statistics.subscriberCount",
                    "videos": "statistics.videoCount",
                    "views": "statistics.viewCount"
                }
            },
            "mailchimp": {
                "campaigns": {
                    "campaign_id": "id",
                    "name": "settings.subject_line",
                    "status": "status",
                    "send_time": "send_time",
                    "emails_sent": "emails_sent",
                    "opens": "opens.unique_opens",
                    "clicks": "clicks.unique_clicks",
                    "open_rate": "opens.open_rate",
                    "click_rate": "clicks.click_rate",
                    "unsubscribes": "unsubscribed"
                },
                "lists": {
                    "list_id": "id",
                    "name": "name",
                    "member_count": "stats.member_count",
                    "unsubscribe_count": "stats.unsubscribe_count",
                    "open_rate": "stats.open_rate",
                    "click_rate": "stats.click_rate"
                }
            },
            "convertkit": {
                "broadcasts": {
                    "broadcast_id": "id",
                    "subject": "email_address",
                    "status": "status",
                    "sent_at": "sent_at",
                    "recipients": "recipients_count",
                    "opens": "opens_count",
                    "clicks": "clicks_count"
                },
                "subscribers": {
                    "subscriber_id": "id",
                    "email": "email_address",
                    "first_name": "first_name",
                    "last_name": "last_name",
                    "state": "state",
                    "created_at": "created_at",
                    "tags": "tags"
                }
            },
            "activecampaign": {
                "campaigns": {
                    "campaign_id": "id",
                    "name": "name",
                    "status": "status",
                    "send_time": "send_time",
                    "sent": "sent",
                    "delivered": "delivered",
                    "opens": "opens",
                    "clicks": "clicks",
                    "bounces": "bounces"
                }
            },
            "wordpress": {
                "posts": {
                    "post_id": "id",
                    "title": "title.rendered",
                    "content": "content.rendered",
                    "excerpt": "excerpt.rendered",
                    "status": "status",
                    "date": "date",
                    "modified": "modified",
                    "featured_media": "featured_media",
                    "categories": "categories",
                    "tags": "tags"
                },
                "stats": {
                    "views": "views",
                    "visitors": "visitors",
                    "posts": "posts",
                    "comments": "comments"
                }
            }
        }
    
    def _initialize_content_sources(self):
        """Initialize content sources for connected connectors"""
        if CONNECTOR_SYSTEM_AVAILABLE:
            # Get connected services from the connector registry
            for connector_id, connector_class in REGISTRY.items():
                if connector_id in self.content_connector_mappings:
                    self._add_content_connector_sources(connector_id)
    
    def _add_content_connector_sources(self, connector_id: str):
        """Add content sources for a specific connector"""
        mappings = self.content_connector_mappings.get(connector_id, {})
        
        for content_type, mapping in mappings.items():
            content_source_type = self._map_content_data_type(connector_id, content_type)
            if content_source_type:
                source_id = f"{connector_id}_{content_type}"
                self.content_sources[source_id] = ContentDataSource(
                    connector_id=connector_id,
                    data_source_type=content_source_type,
                    sync_interval=600,  # 10 minutes default for content
                    mapping_config=mapping
                )
    
    def _map_content_data_type(self, connector_id: str, content_type: str) -> Optional[ContentDataSourceType]:
        """Map connector-specific content types to standardized content source types"""
        mapping = {
            "facebook": {
                "posts": ContentDataSourceType.SOCIAL_POSTS,
                "insights": ContentDataSourceType.SOCIAL_INSIGHTS,
                "ads": ContentDataSourceType.AD_PERFORMANCE
            },
            "instagram": {
                "posts": ContentDataSourceType.SOCIAL_POSTS,
                "stories": ContentDataSourceType.SOCIAL_POSTS,
                "insights": ContentDataSourceType.SOCIAL_INSIGHTS
            },
            "linkedin": {
                "posts": ContentDataSourceType.SOCIAL_POSTS,
                "company_posts": ContentDataSourceType.SOCIAL_POSTS,
                "insights": ContentDataSourceType.SOCIAL_INSIGHTS
            },
            "twitter": {
                "tweets": ContentDataSourceType.SOCIAL_POSTS,
                "insights": ContentDataSourceType.SOCIAL_INSIGHTS
            },
            "tiktok": {
                "posts": ContentDataSourceType.SOCIAL_POSTS,
                "insights": ContentDataSourceType.SOCIAL_INSIGHTS
            },
            "youtube": {
                "videos": ContentDataSourceType.VIDEO_CONTENT,
                "channel": ContentDataSourceType.SOCIAL_INSIGHTS
            },
            "mailchimp": {
                "campaigns": ContentDataSourceType.EMAIL_CAMPAIGNS,
                "lists": ContentDataSourceType.SOCIAL_AUDIENCE
            },
            "convertkit": {
                "broadcasts": ContentDataSourceType.EMAIL_CAMPAIGNS,
                "subscribers": ContentDataSourceType.SOCIAL_AUDIENCE
            },
            "activecampaign": {
                "campaigns": ContentDataSourceType.EMAIL_CAMPAIGNS
            },
            "wordpress": {
                "posts": ContentDataSourceType.BLOG_CONTENT,
                "stats": ContentDataSourceType.CONTENT_PERFORMANCE
            }
        }
        
        return mapping.get(connector_id, {}).get(content_type)
    
    async def start_content_sync(self, source_id: Optional[str] = None):
        """Start content synchronization for specified source or all sources"""
        if source_id:
            sources_to_sync = [source_id] if source_id in self.content_sources else []
        else:
            sources_to_sync = list(self.content_sources.keys())
        
        for source_id in sources_to_sync:
            if source_id not in self.sync_tasks or self.sync_tasks[source_id].done():
                self.sync_tasks[source_id] = asyncio.create_task(
                    self._sync_content_source(source_id)
                )
    
    async def _sync_content_source(self, source_id: str):
        """Sync content data from a specific connector source"""
        try:
            content_source = self.content_sources[source_id]
            content_source.sync_status = ContentSyncStatus.SYNCING
            
            # Get connector instance
            if CONNECTOR_SYSTEM_AVAILABLE and content_source.connector_id in REGISTRY:
                # Simulate content data fetching (in real implementation, this would call the connector)
                raw_data = await self._fetch_content_connector_data(content_source)
                
                # Process and standardize content data
                processed_data = await self._process_content_data(raw_data, content_source)
                
                # Store in cache
                await self._store_content_data(processed_data, content_source)
                
                content_source.last_sync = datetime.now()
                content_source.sync_status = ContentSyncStatus.COMPLETED
                
                # Log sync success
                self.sync_history.append({
                    "source_id": source_id,
                    "status": "success",
                    "timestamp": datetime.now(),
                    "content_items_synced": len(processed_data)
                })
                
            else:
                raise Exception(f"Content connector {content_source.connector_id} not available")
                
        except Exception as e:
            logging.error(f"Failed to sync content source {source_id}: {e}")
            self.content_sources[source_id].sync_status = ContentSyncStatus.FAILED
            
            self.sync_history.append({
                "source_id": source_id,
                "status": "failed",
                "timestamp": datetime.now(),
                "error": str(e)
            })
    
    async def _fetch_content_connector_data(self, content_source: ContentDataSource) -> List[Dict[str, Any]]:
        """Fetch raw content data from connector (simulated for now)"""
        # In real implementation, this would call the actual connector API
        # For now, we'll return mock content data based on the connector type
        
        mock_content_data = {
            "facebook": {
                "posts": [
                    {
                        "id": "fb_post_001",
                        "message": "Excited to share our latest product update! 🚀",
                        "created_time": "2024-01-15T10:30:00Z",
                        "likes": {"summary": {"total_count": 125}},
                        "comments": {"summary": {"total_count": 23}},
                        "shares": {"count": 45},
                        "type": "photo",
                        "attachments": {
                            "data": [{
                                "media": {
                                    "image": {
                                        "src": "https://example.com/image.jpg"
                                    }
                                }
                            }]
                        }
                    }
                ],
                "insights": [
                    {
                        "id": "fb_page_001",
                        "followers_count": 5420,
                        "page_views_total": 12500,
                        "post_reach_total": 8500,
                        "post_engagements_total": 1250
                    }
                ]
            },
            "instagram": {
                "posts": [
                    {
                        "id": "ig_post_001",
                        "caption": "Behind the scenes of our content creation process 📸",
                        "media_type": "IMAGE",
                        "media_url": "https://example.com/ig-image.jpg",
                        "timestamp": "2024-01-15T14:20:00Z",
                        "like_count": 89,
                        "comments_count": 12
                    }
                ]
            },
            "linkedin": {
                "posts": [
                    {
                        "id": "li_post_001",
                        "text": "Thoughts on the future of AI in business...",
                        "created_time": "2024-01-15T09:15:00Z",
                        "numLikes": 156,
                        "numComments": 34,
                        "numShares": 67,
                        "numImpressions": 1250
                    }
                ]
            },
            "mailchimp": {
                "campaigns": [
                    {
                        "id": "mc_campaign_001",
                        "settings": {"subject_line": "Weekly Newsletter - January 15th"},
                        "status": "sent",
                        "send_time": "2024-01-15T08:00:00Z",
                        "emails_sent": 1250,
                        "opens": {"unique_opens": 425, "open_rate": 0.34},
                        "clicks": {"unique_clicks": 89, "click_rate": 0.071}
                    }
                ]
            }
        }
        
        connector_data = mock_content_data.get(content_source.connector_id, {}).get(
            content_source.mapping_config.get("content_type", "posts"), []
        )
        
        return connector_data
    
    async def _process_content_data(self, raw_data: List[Dict[str, Any]], content_source: ContentDataSource) -> List[ContentDataPoint]:
        """Process and standardize content data"""
        processed_data = []
        mapping_config = content_source.mapping_config
        
        for record in raw_data:
            # Apply field mapping
            processed_record = {}
            for target_field, source_field in mapping_config.items():
                if target_field != "content_type":
                    processed_record[target_field] = self._extract_content_field_value(record, source_field)
            
            # Create standardized content data point
            content_id = processed_record.get("content_id", f"unknown_{uuid.uuid4().hex[:8]}")
            
            # Calculate engagement rate if possible
            if processed_record.get("likes") and processed_record.get("impressions"):
                likes = int(processed_record.get("likes", 0))
                impressions = int(processed_record.get("impressions", 1))
                processed_record["engagement_rate"] = (likes / impressions) * 100 if impressions > 0 else 0
            
            content_point = ContentDataPoint(
                source_connector=content_source.connector_id,
                source_type=content_source.data_source_type,
                content_id=content_id,
                data_type=content_source.data_source_type.value,
                raw_data=record,
                processed_data=processed_record,
                timestamp=datetime.now(),
                sync_id=str(uuid.uuid4())
            )
            
            processed_data.append(content_point)
        
        return processed_data
    
    def _extract_content_field_value(self, record: Dict[str, Any], field_path: str) -> Any:
        """Extract value from nested record using dot notation"""
        try:
            parts = field_path.split('.')
            value = record
            
            for part in parts:
                if isinstance(value, dict):
                    value = value.get(part)
                elif isinstance(value, list) and part.isdigit():
                    value = value[int(part)]
                else:
                    return None
            
            return value
        except (KeyError, IndexError, TypeError):
            return None
    
    async def _store_content_data(self, content_points: List[ContentDataPoint], content_source: ContentDataSource):
        """Store processed content data in cache"""
        for content_point in content_points:
            if content_point.content_id not in self.content_data_cache:
                self.content_data_cache[content_point.content_id] = []
            
            self.content_data_cache[content_point.content_id].append(content_point)
    
    async def get_content_data(self, content_id: str, content_types: Optional[List[ContentDataSourceType]] = None) -> Dict[str, List[ContentDataPoint]]:
        """Get content data from all connected sources"""
        content_data = self.content_data_cache.get(content_id, [])
        
        if content_types:
            filtered_data = {}
            for content_point in content_data:
                if content_point.source_type in content_types:
                    if content_point.source_type.value not in filtered_data:
                        filtered_data[content_point.source_type.value] = []
                    filtered_data[content_point.source_type.value].append(content_point)
            return filtered_data
        
        # Group by content type
        grouped_data = {}
        for content_point in content_data:
            if content_point.source_type.value not in grouped_data:
                grouped_data[content_point.source_type.value] = []
            grouped_data[content_point.source_type.value].append(content_point)
        
        return grouped_data
    
    async def get_content_performance_summary(self) -> Dict[str, Any]:
        """Get comprehensive content performance summary from all connected sources"""
        all_content_data = []
        
        # Collect all content data points
        for content_points in self.content_data_cache.values():
            all_content_data.extend(content_points)
        
        # Aggregate performance metrics
        performance_summary = {
            "total_content_items": len(all_content_data),
            "platforms": {},
            "content_types": {},
            "engagement_metrics": {
                "total_likes": 0,
                "total_comments": 0,
                "total_shares": 0,
                "total_impressions": 0,
                "average_engagement_rate": 0
            },
            "top_performing_content": [],
            "platform_breakdown": {},
            "content_trends": {},
            "last_updated": datetime.now().isoformat()
        }
        
        # Process each content data point
        for content_point in all_content_data:
            platform = content_point.source_connector
            content_type = content_point.source_type.value
            processed = content_point.processed_data
            
            # Platform breakdown
            if platform not in performance_summary["platforms"]:
                performance_summary["platforms"][platform] = {
                    "content_count": 0,
                    "total_likes": 0,
                    "total_comments": 0,
                    "total_shares": 0,
                    "total_impressions": 0
                }
            
            platform_data = performance_summary["platforms"][platform]
            platform_data["content_count"] += 1
            
            # Content type breakdown
            if content_type not in performance_summary["content_types"]:
                performance_summary["content_types"][content_type] = 0
            performance_summary["content_types"][content_type] += 1
            
            # Aggregate engagement metrics
            likes = int(processed.get("likes", 0))
            comments = int(processed.get("comments", 0))
            shares = int(processed.get("shares", 0))
            impressions = int(processed.get("impressions", 0))
            engagement_rate = float(processed.get("engagement_rate", 0))
            
            performance_summary["engagement_metrics"]["total_likes"] += likes
            performance_summary["engagement_metrics"]["total_comments"] += comments
            performance_summary["engagement_metrics"]["total_shares"] += shares
            performance_summary["engagement_metrics"]["total_impressions"] += impressions
            
            platform_data["total_likes"] += likes
            platform_data["total_comments"] += comments
            platform_data["total_shares"] += shares
            platform_data["total_impressions"] += impressions
            
            # Track top performing content
            total_engagement = likes + comments + shares
            performance_summary["top_performing_content"].append({
                "content_id": content_point.content_id,
                "platform": platform,
                "content_type": content_type,
                "engagement": total_engagement,
                "engagement_rate": engagement_rate,
                "timestamp": content_point.timestamp.isoformat(),
                "data": processed
            })
        
        # Sort top performing content
        performance_summary["top_performing_content"].sort(
            key=lambda x: x["engagement"], reverse=True
        )
        performance_summary["top_performing_content"] = performance_summary["top_performing_content"][:10]
        
        # Calculate average engagement rate
        if len(all_content_data) > 0:
            total_engagement_rate = sum(
                float(cp.processed_data.get("engagement_rate", 0)) 
                for cp in all_content_data 
                if cp.processed_data.get("engagement_rate")
            )
            performance_summary["engagement_metrics"]["average_engagement_rate"] = (
                total_engagement_rate / len(all_content_data)
            )
        
        return performance_summary
    
    async def get_platform_content_analytics(self, platform: str) -> Dict[str, Any]:
        """Get detailed analytics for a specific platform"""
        platform_data = []
        
        for content_points in self.content_data_cache.values():
            for content_point in content_points:
                if content_point.source_connector == platform:
                    platform_data.append(content_point)
        
        if not platform_data:
            return {"error": f"No data found for platform: {platform}"}
        
        analytics = {
            "platform": platform,
            "total_content": len(platform_data),
            "content_types": {},
            "performance_metrics": {
                "total_likes": 0,
                "total_comments": 0,
                "total_shares": 0,
                "total_impressions": 0,
                "average_engagement_rate": 0
            },
            "content_timeline": [],
            "engagement_trends": {},
            "top_content": [],
            "last_updated": datetime.now().isoformat()
        }
        
        # Process platform data
        for content_point in platform_data:
            processed = content_point.processed_data
            content_type = content_point.source_type.value
            
            # Content type breakdown
            if content_type not in analytics["content_types"]:
                analytics["content_types"][content_type] = 0
            analytics["content_types"][content_type] += 1
            
            # Performance metrics
            likes = int(processed.get("likes", 0))
            comments = int(processed.get("comments", 0))
            shares = int(processed.get("shares", 0))
            impressions = int(processed.get("impressions", 0))
            engagement_rate = float(processed.get("engagement_rate", 0))
            
            analytics["performance_metrics"]["total_likes"] += likes
            analytics["performance_metrics"]["total_comments"] += comments
            analytics["performance_metrics"]["total_shares"] += shares
            analytics["performance_metrics"]["total_impressions"] += impressions
            
            # Content timeline
            analytics["content_timeline"].append({
                "content_id": content_point.content_id,
                "timestamp": content_point.timestamp.isoformat(),
                "engagement": likes + comments + shares,
                "engagement_rate": engagement_rate,
                "type": content_type
            })
            
            # Top content
            analytics["top_content"].append({
                "content_id": content_point.content_id,
                "engagement": likes + comments + shares,
                "engagement_rate": engagement_rate,
                "timestamp": content_point.timestamp.isoformat(),
                "data": processed
            })
        
        # Sort and limit top content
        analytics["top_content"].sort(key=lambda x: x["engagement"], reverse=True)
        analytics["top_content"] = analytics["top_content"][:5]
        
        # Calculate average engagement rate
        if platform_data:
            total_engagement_rate = sum(
                float(cp.processed_data.get("engagement_rate", 0)) 
                for cp in platform_data 
                if cp.processed_data.get("engagement_rate")
            )
            analytics["performance_metrics"]["average_engagement_rate"] = (
                total_engagement_rate / len(platform_data)
            )
        
        return analytics
    
    def get_content_sync_status(self) -> Dict[str, Any]:
        """Get content synchronization status for all sources"""
        return {
            "content_sources": {
                source_id: {
                    "connector_id": source.connector_id,
                    "content_source_type": source.data_source_type.value,
                    "sync_status": source.sync_status.value,
                    "last_sync": source.last_sync.isoformat() if source.last_sync else None,
                    "sync_interval": source.sync_interval
                }
                for source_id, source in self.content_sources.items()
            },
            "sync_history": self.sync_history[-10:],  # Last 10 syncs
            "total_content_items": len(self.content_data_cache),
            "total_data_points": sum(len(content_points) for content_points in self.content_data_cache.values())
        }
    
    async def stop_all_content_sync(self):
        """Stop all content synchronization tasks"""
        for task in self.sync_tasks.values():
            if not task.done():
                task.cancel()
        
        await asyncio.gather(*self.sync_tasks.values(), return_exceptions=True)
        self.sync_tasks.clear()

# Global content integrator instance
content_connector_integrator = ContentConnectorIntegrator()

# Convenience functions
async def start_content_sync(source_id: Optional[str] = None):
    """Start content synchronization"""
    await content_connector_integrator.start_content_sync(source_id)

async def get_content_data_from_connectors(content_id: str, content_types: Optional[List[ContentDataSourceType]] = None) -> Dict[str, List[ContentDataPoint]]:
    """Get content data from all connected connectors"""
    return await content_connector_integrator.get_content_data(content_id, content_types)

async def get_content_performance_summary_from_connectors() -> Dict[str, Any]:
    """Get comprehensive content performance summary from all connectors"""
    return await content_connector_integrator.get_content_performance_summary()

async def get_platform_analytics_from_connectors(platform: str) -> Dict[str, Any]:
    """Get detailed analytics for a specific platform from connectors"""
    return await content_connector_integrator.get_platform_content_analytics(platform)

def get_content_connector_sync_status() -> Dict[str, Any]:
    """Get content connector synchronization status"""
    return content_connector_integrator.get_content_sync_status()
