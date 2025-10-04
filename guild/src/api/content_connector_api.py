"""
Content Connector Integration API
Provides REST endpoints for content connector data access and synchronization.
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
from datetime import datetime
import asyncio
import logging

from guild.src.core.content_connector_integration import (
    content_connector_integrator, start_content_sync, get_content_data_from_connectors,
    get_content_performance_summary_from_connectors, get_platform_analytics_from_connectors,
    get_content_connector_sync_status, ContentDataSourceType
)

# API Router
router = APIRouter(prefix="/api/content-connectors", tags=["Content Connectors"])

# Request/Response Models
class ContentSyncRequest(BaseModel):
    source_id: Optional[str] = None

class ContentDataRequest(BaseModel):
    content_id: str
    content_types: Optional[List[str]] = None

class PlatformAnalyticsRequest(BaseModel):
    platform: str

class ContentPerformanceResponse(BaseModel):
    total_content_items: int
    platforms: Dict[str, Any]
    content_types: Dict[str, int]
    engagement_metrics: Dict[str, Any]
    top_performing_content: List[Dict[str, Any]]
    last_updated: str

class PlatformAnalyticsResponse(BaseModel):
    platform: str
    total_content: int
    content_types: Dict[str, int]
    performance_metrics: Dict[str, Any]
    top_content: List[Dict[str, Any]]
    last_updated: str

# API Endpoints

@router.post("/sync")
async def sync_content_data_endpoint(request: ContentSyncRequest, background_tasks: BackgroundTasks):
    """Start content data synchronization from connected platforms."""
    try:
        # Start content sync in background
        background_tasks.add_task(start_content_sync, request.source_id)
        
        return {
            "status": "success",
            "message": f"Content synchronization started{' for ' + request.source_id if request.source_id else ' for all sources'}",
            "source_id": request.source_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sync-status")
async def get_content_sync_status_endpoint():
    """Get content synchronization status for all connected platforms."""
    try:
        status = get_content_connector_sync_status()
        
        return {
            "status": "success",
            "sync_status": status
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/content-data")
async def get_content_data_endpoint(request: ContentDataRequest):
    """Get content data from connected platforms."""
    try:
        # Convert string content types to enum
        content_types = None
        if request.content_types:
            try:
                content_types = [ContentDataSourceType(content_type) for content_type in request.content_types]
            except ValueError as e:
                raise HTTPException(status_code=400, detail=f"Invalid content type: {e}")
        
        content_data = await get_content_data_from_connectors(request.content_id, content_types)
        
        return {
            "status": "success",
            "content_id": request.content_id,
            "content_data": content_data
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/performance-summary")
async def get_content_performance_summary_endpoint():
    """Get comprehensive content performance summary from all connected platforms."""
    try:
        performance_summary = await get_content_performance_summary_from_connectors()
        
        return {
            "status": "success",
            "performance_summary": performance_summary
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/platform-analytics")
async def get_platform_analytics_endpoint(request: PlatformAnalyticsRequest):
    """Get detailed analytics for a specific platform."""
    try:
        analytics = await get_platform_analytics_from_connectors(request.platform)
        
        return {
            "status": "success",
            "platform": request.platform,
            "analytics": analytics
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/available-platforms")
async def get_available_content_platforms():
    """Get list of available content platforms and their data types."""
    try:
        platforms = {}
        
        for source_id, source in content_connector_integrator.content_sources.items():
            platform = source.connector_id
            if platform not in platforms:
                platforms[platform] = {
                    "connector_id": platform,
                    "data_sources": [],
                    "sync_status": source.sync_status.value,
                    "last_sync": source.last_sync.isoformat() if source.last_sync else None
                }
            
            platforms[platform]["data_sources"].append({
                "source_id": source_id,
                "data_type": source.data_source_type.value,
                "sync_interval": source.sync_interval
            })
        
        return {
            "status": "success",
            "available_platforms": platforms,
            "total_platforms": len(platforms)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/content-types")
async def get_available_content_types():
    """Get list of available content data types."""
    try:
        content_types = [
            {
                "type": content_type.value,
                "description": content_type.value.replace("_", " ").title(),
                "category": _get_content_type_category(content_type)
            }
            for content_type in ContentDataSourceType
        ]
        
        return {
            "status": "success",
            "content_types": content_types,
            "total_types": len(content_types)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/dashboard-data")
async def get_content_dashboard_data():
    """Get comprehensive data for the Content Dashboard."""
    try:
        # Get performance summary
        performance_summary = await get_content_performance_summary_from_connectors()
        
        # Get sync status
        sync_status = get_content_connector_sync_status()
        
        # Get available platforms
        platforms = {}
        for source_id, source in content_connector_integrator.content_sources.items():
            platform = source.connector_id
            if platform not in platforms:
                platforms[platform] = {
                    "name": platform.title(),
                    "status": source.sync_status.value,
                    "last_sync": source.last_sync.isoformat() if source.last_sync else None,
                    "data_types": []
                }
            platforms[platform]["data_types"].append(source.data_source_type.value)
        
        dashboard_data = {
            "performance_summary": performance_summary,
            "sync_status": sync_status,
            "connected_platforms": platforms,
            "total_platforms": len(platforms),
            "total_content_items": performance_summary.get("total_content_items", 0),
            "last_updated": datetime.now().isoformat()
        }
        
        return {
            "status": "success",
            "dashboard_data": dashboard_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/test/social-media")
async def test_social_media_integration():
    """Test social media platform integration."""
    try:
        # Test Facebook integration
        facebook_sources = [
            source_id for source_id in content_connector_integrator.content_sources.keys()
            if source_id.startswith("facebook")
        ]
        
        if facebook_sources:
            await start_content_sync(facebook_sources[0])
            
            # Wait a moment for sync to complete
            await asyncio.sleep(2)
            
            performance_summary = await get_content_performance_summary_from_connectors()
            
            return {
                "status": "success",
                "platform": "facebook",
                "test_result": "Social media integration test completed",
                "performance_summary": performance_summary
            }
        else:
            return {
                "status": "warning",
                "message": "No Facebook sources configured for testing"
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/test/email-marketing")
async def test_email_marketing_integration():
    """Test email marketing platform integration."""
    try:
        # Test Mailchimp integration
        mailchimp_sources = [
            source_id for source_id in content_connector_integrator.content_sources.keys()
            if source_id.startswith("mailchimp")
        ]
        
        if mailchimp_sources:
            await start_content_sync(mailchimp_sources[0])
            
            # Wait a moment for sync to complete
            await asyncio.sleep(2)
            
            performance_summary = await get_content_performance_summary_from_connectors()
            
            return {
                "status": "success",
                "platform": "mailchimp",
                "test_result": "Email marketing integration test completed",
                "performance_summary": performance_summary
            }
        else:
            return {
                "status": "warning",
                "message": "No Mailchimp sources configured for testing"
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/test/content-platforms")
async def test_all_content_platforms():
    """Test all connected content platforms."""
    try:
        test_results = []
        
        # Test each platform
        for source_id, source in content_connector_integrator.content_sources.items():
            try:
                await start_content_sync(source_id)
                await asyncio.sleep(1)  # Brief pause between tests
                
                test_results.append({
                    "platform": source.connector_id,
                    "source_id": source_id,
                    "data_type": source.data_source_type.value,
                    "status": "success"
                })
            except Exception as e:
                test_results.append({
                    "platform": source.connector_id,
                    "source_id": source_id,
                    "data_type": source.data_source_type.value,
                    "status": "failed",
                    "error": str(e)
                })
        
        # Get overall performance summary
        performance_summary = await get_content_performance_summary_from_connectors()
        
        return {
            "status": "success",
            "test_results": test_results,
            "performance_summary": performance_summary,
            "total_tests": len(test_results),
            "successful_tests": len([r for r in test_results if r["status"] == "success"])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/content-insights")
async def get_content_insights():
    """Get AI-generated insights from content performance data."""
    try:
        performance_summary = await get_content_performance_summary_from_connectors()
        
        # Generate insights based on performance data
        insights = []
        
        # Top performing platform insight
        if performance_summary.get("platforms"):
            top_platform = max(
                performance_summary["platforms"].items(),
                key=lambda x: x[1].get("total_likes", 0) + x[1].get("total_comments", 0) + x[1].get("total_shares", 0)
            )
            insights.append({
                "type": "performance",
                "title": f"Top Performing Platform: {top_platform[0].title()}",
                "description": f"{top_platform[0].title()} is generating the highest engagement with {top_platform[1].get('total_likes', 0)} likes, {top_platform[1].get('total_comments', 0)} comments, and {top_platform[1].get('total_shares', 0)} shares.",
                "recommendation": f"Consider increasing content output on {top_platform[0].title()} or applying successful strategies to other platforms."
            })
        
        # Engagement rate insight
        avg_engagement_rate = performance_summary.get("engagement_metrics", {}).get("average_engagement_rate", 0)
        if avg_engagement_rate > 0:
            if avg_engagement_rate > 5:
                insights.append({
                    "type": "engagement",
                    "title": "High Engagement Rate",
                    "description": f"Your content is performing excellently with an average engagement rate of {avg_engagement_rate:.1f}%.",
                    "recommendation": "Maintain current content strategy and consider scaling successful content types."
                })
            elif avg_engagement_rate < 2:
                insights.append({
                    "type": "engagement",
                    "title": "Low Engagement Rate",
                    "description": f"Your content engagement rate is {avg_engagement_rate:.1f}%, which is below industry average.",
                    "recommendation": "Review top-performing content and adjust strategy to increase engagement."
                })
        
        # Content type insight
        if performance_summary.get("content_types"):
            top_content_type = max(performance_summary["content_types"].items(), key=lambda x: x[1])
            insights.append({
                "type": "content_strategy",
                "title": f"Most Active Content Type: {top_content_type[0].replace('_', ' ').title()}",
                "description": f"You've published {top_content_type[1]} {top_content_type[0].replace('_', ' ')} pieces, making it your most active content type.",
                "recommendation": "Consider diversifying content types or doubling down on what's working."
            })
        
        return {
            "status": "success",
            "insights": insights,
            "performance_summary": performance_summary,
            "total_insights": len(insights)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Helper functions
def _get_content_type_category(content_type: ContentDataSourceType) -> str:
    """Get category for content type."""
    categories = {
        ContentDataSourceType.SOCIAL_POSTS: "Social Media",
        ContentDataSourceType.SOCIAL_INSIGHTS: "Social Media",
        ContentDataSourceType.SOCIAL_ENGAGEMENT: "Social Media",
        ContentDataSourceType.SOCIAL_AUDIENCE: "Social Media",
        ContentDataSourceType.CONTENT_PERFORMANCE: "Analytics",
        ContentDataSourceType.CAMPAIGN_DATA: "Marketing",
        ContentDataSourceType.AD_PERFORMANCE: "Advertising",
        ContentDataSourceType.EMAIL_CAMPAIGNS: "Email Marketing",
        ContentDataSourceType.BLOG_CONTENT: "Content",
        ContentDataSourceType.VIDEO_CONTENT: "Content",
        ContentDataSourceType.PODCAST_CONTENT: "Content",
        ContentDataSourceType.WEBINAR_CONTENT: "Content"
    }
    return categories.get(content_type, "Other")
