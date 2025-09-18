"""
Meta Business Suite Integration

This module provides comprehensive integration with Meta Business Suite for:
- Facebook Ads Manager
- Instagram Ads
- Meta Analytics
- Business Manager
- Creator Studio
- WhatsApp Business API

For use with Campaign Agents, Paid Ads Agents, and Analytics Agents.
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

class MetaProduct(Enum):
    FACEBOOK = "facebook"
    INSTAGRAM = "instagram"
    WHATSAPP = "whatsapp"
    MESSENGER = "messenger"
    AUDIENCE_NETWORK = "audience_network"

class CampaignObjective(Enum):
    BRAND_AWARENESS = "BRAND_AWARENESS"
    REACH = "REACH"
    TRAFFIC = "LINK_CLICKS"
    ENGAGEMENT = "POST_ENGAGEMENT"
    APP_INSTALLS = "APP_INSTALLS"
    VIDEO_VIEWS = "VIDEO_VIEWS"
    LEAD_GENERATION = "LEAD_GENERATION"
    MESSAGES = "MESSAGES"
    CONVERSIONS = "CONVERSIONS"
    CATALOG_SALES = "CATALOG_SALES"
    STORE_TRAFFIC = "STORE_TRAFFIC"

@dataclass
class MetaCredentials:
    """Credentials for Meta Business Suite"""
    access_token: str
    app_id: str
    app_secret: str
    business_id: Optional[str] = None
    ad_account_id: Optional[str] = None
    page_id: Optional[str] = None
    instagram_account_id: Optional[str] = None

@dataclass
class CampaignData:
    """Standardized campaign data format"""
    id: str
    name: str
    objective: CampaignObjective
    status: str
    budget: float
    daily_budget: float
    start_date: date
    end_date: Optional[date]
    target_audience: Dict[str, Any]
    placements: List[str]
    created_time: datetime
    updated_time: datetime
    performance_metrics: Dict[str, Any]
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}

@dataclass
class AdSetData:
    """Standardized ad set data format"""
    id: str
    name: str
    campaign_id: str
    status: str
    budget: float
    bid_strategy: str
    target_audience: Dict[str, Any]
    placements: List[str]
    optimization_goal: str
    performance_metrics: Dict[str, Any]
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}

@dataclass
class AdData:
    """Standardized ad data format"""
    id: str
    name: str
    ad_set_id: str
    status: str
    creative: Dict[str, Any]
    performance_metrics: Dict[str, Any]
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}

@dataclass
class AudienceData:
    """Standardized audience data format"""
    id: str
    name: str
    type: str  # custom, lookalike, saved, etc.
    size: int
    description: str
    targeting_specs: Dict[str, Any]
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}

class MetaBusinessSuiteConnector:
    """
    Comprehensive Meta Business Suite connector for advertising and analytics.
    
    Provides access to:
    - Facebook Ads Manager
    - Instagram Ads
    - Meta Analytics
    - Business Manager
    - Audience Insights
    - Creative Hub
    """
    
    def __init__(self, credentials: MetaCredentials):
        self.credentials = credentials
        self.base_url = "https://graph.facebook.com/v18.0"
        self.session: Optional[aiohttp.ClientSession] = None
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None, params: Dict = None) -> Dict:
        """Make authenticated request to Meta Graph API"""
        try:
            url = f"{self.base_url}/{endpoint}"
            
            # Add access token to params
            if params is None:
                params = {}
            params['access_token'] = self.credentials.access_token
            
            if method == 'GET':
                async with self.session.get(url, params=params) as response:
                    response.raise_for_status()
                    return await response.json()
            else:
                async with self.session.request(method, url, json=data, params=params) as response:
                    response.raise_for_status()
                    return await response.json()
                    
        except Exception as e:
            logger.error(f"Meta API request failed: {e}")
            raise
    
    # ==================== CAMPAIGN MANAGEMENT ====================
    
    async def get_campaigns(self, ad_account_id: str = None) -> List[CampaignData]:
        """Get all campaigns from an ad account"""
        account_id = ad_account_id or self.credentials.ad_account_id
        if not account_id:
            raise ValueError("Ad account ID required")
        
        endpoint = f"act_{account_id}/campaigns"
        params = {
            'fields': 'id,name,objective,status,daily_budget,lifetime_budget,start_time,stop_time,created_time,updated_time'
        }
        
        response = await self._make_request(endpoint, params=params)
        campaigns = []
        
        for campaign in response.get('data', []):
            campaign_data = CampaignData(
                id=campaign['id'],
                name=campaign['name'],
                objective=CampaignObjective(campaign['objective']),
                status=campaign['status'],
                budget=float(campaign.get('lifetime_budget', 0)),
                daily_budget=float(campaign.get('daily_budget', 0)),
                start_date=datetime.fromisoformat(campaign['start_time'].replace('Z', '+00:00')).date(),
                end_date=datetime.fromisoformat(campaign['stop_time'].replace('Z', '+00:00')).date() if campaign.get('stop_time') else None,
                target_audience={},
                placements=[],
                created_time=datetime.fromisoformat(campaign['created_time'].replace('Z', '+00:00')),
                updated_time=datetime.fromisoformat(campaign['updated_time'].replace('Z', '+00:00')),
                performance_metrics={},
                metadata={"raw_data": campaign}
            )
            campaigns.append(campaign_data)
        
        return campaigns
    
    async def create_campaign(self, 
                            name: str, 
                            objective: CampaignObjective,
                            daily_budget: float,
                            ad_account_id: str = None,
                            target_audience: Dict[str, Any] = None,
                            placements: List[str] = None) -> CampaignData:
        """Create a new advertising campaign"""
        account_id = ad_account_id or self.credentials.ad_account_id
        if not account_id:
            raise ValueError("Ad account ID required")
        
        endpoint = f"act_{account_id}/campaigns"
        
        data = {
            'name': name,
            'objective': objective.value,
            'status': 'PAUSED',  # Start paused for review
            'daily_budget': int(daily_budget * 100)  # Convert to cents
        }
        
        response = await self._make_request(endpoint, method='POST', data=data)
        
        campaign_data = CampaignData(
            id=response['id'],
            name=name,
            objective=objective,
            status='PAUSED',
            budget=0,
            daily_budget=daily_budget,
            start_date=date.today(),
            end_date=None,
            target_audience=target_audience or {},
            placements=placements or ['facebook', 'instagram'],
            created_time=datetime.now(),
            updated_time=datetime.now(),
            performance_metrics={},
            metadata={"created_via_api": True, "raw_response": response}
        )
        
        return campaign_data
    
    async def update_campaign(self, campaign_id: str, updates: Dict[str, Any]) -> bool:
        """Update an existing campaign"""
        endpoint = f"{campaign_id}"
        
        # Convert budget to cents if present
        if 'daily_budget' in updates:
            updates['daily_budget'] = int(updates['daily_budget'] * 100)
        
        response = await self._make_request(endpoint, method='POST', data=updates)
        return response.get('success', False)
    
    async def delete_campaign(self, campaign_id: str) -> bool:
        """Delete a campaign"""
        endpoint = f"{campaign_id}"
        data = {'status': 'DELETED'}
        
        response = await self._make_request(endpoint, method='POST', data=data)
        return response.get('success', False)
    
    # ==================== AD SET MANAGEMENT ====================
    
    async def get_ad_sets(self, campaign_id: str) -> List[AdSetData]:
        """Get ad sets for a campaign"""
        endpoint = f"{campaign_id}/adsets"
        params = {
            'fields': 'id,name,status,daily_budget,bid_strategy,targeting,optimization_goal,created_time,updated_time'
        }
        
        response = await self._make_request(endpoint, params=params)
        ad_sets = []
        
        for ad_set in response.get('data', []):
            ad_set_data = AdSetData(
                id=ad_set['id'],
                name=ad_set['name'],
                campaign_id=campaign_id,
                status=ad_set['status'],
                budget=float(ad_set.get('daily_budget', 0)),
                bid_strategy=ad_set.get('bid_strategy', ''),
                target_audience=ad_set.get('targeting', {}),
                placements=[],
                optimization_goal=ad_set.get('optimization_goal', ''),
                performance_metrics={},
                metadata={"raw_data": ad_set}
            )
            ad_sets.append(ad_set_data)
        
        return ad_sets
    
    async def create_ad_set(self, 
                          name: str,
                          campaign_id: str,
                          daily_budget: float,
                          targeting: Dict[str, Any],
                          optimization_goal: str = "LINK_CLICKS") -> AdSetData:
        """Create a new ad set"""
        endpoint = f"{campaign_id}/adsets"
        
        data = {
            'name': name,
            'status': 'PAUSED',
            'daily_budget': int(daily_budget * 100),
            'targeting': targeting,
            'optimization_goal': optimization_goal,
            'billing_event': 'IMPRESSIONS'
        }
        
        response = await self._make_request(endpoint, method='POST', data=data)
        
        ad_set_data = AdSetData(
            id=response['id'],
            name=name,
            campaign_id=campaign_id,
            status='PAUSED',
            budget=daily_budget,
            bid_strategy='',
            target_audience=targeting,
            placements=[],
            optimization_goal=optimization_goal,
            performance_metrics={},
            metadata={"created_via_api": True, "raw_response": response}
        )
        
        return ad_set_data
    
    # ==================== AD CREATIVE MANAGEMENT ====================
    
    async def get_ads(self, ad_set_id: str) -> List[AdData]:
        """Get ads for an ad set"""
        endpoint = f"{ad_set_id}/ads"
        params = {
            'fields': 'id,name,status,creative,created_time,updated_time'
        }
        
        response = await self._make_request(endpoint, params=params)
        ads = []
        
        for ad in response.get('data', []):
            ad_data = AdData(
                id=ad['id'],
                name=ad['name'],
                ad_set_id=ad_set_id,
                status=ad['status'],
                creative=ad.get('creative', {}),
                performance_metrics={},
                metadata={"raw_data": ad}
            )
            ads.append(ad_data)
        
        return ads
    
    async def create_ad(self, 
                       name: str,
                       ad_set_id: str,
                       creative: Dict[str, Any]) -> AdData:
        """Create a new ad"""
        endpoint = f"{ad_set_id}/ads"
        
        data = {
            'name': name,
            'status': 'PAUSED',
            'creative': creative
        }
        
        response = await self._make_request(endpoint, method='POST', data=data)
        
        ad_data = AdData(
            id=response['id'],
            name=name,
            ad_set_id=ad_set_id,
            status='PAUSED',
            creative=creative,
            performance_metrics={},
            metadata={"created_via_api": True, "raw_response": response}
        )
        
        return ad_data
    
    # ==================== AUDIENCE MANAGEMENT ====================
    
    async def get_custom_audiences(self, ad_account_id: str = None) -> List[AudienceData]:
        """Get custom audiences"""
        account_id = ad_account_id or self.credentials.ad_account_id
        if not account_id:
            raise ValueError("Ad account ID required")
        
        endpoint = f"act_{account_id}/customaudiences"
        params = {
            'fields': 'id,name,description,approximate_count,subtype,targeting'
        }
        
        response = await self._make_request(endpoint, params=params)
        audiences = []
        
        for audience in response.get('data', []):
            audience_data = AudienceData(
                id=audience['id'],
                name=audience['name'],
                type=audience.get('subtype', 'custom'),
                size=audience.get('approximate_count', 0),
                description=audience.get('description', ''),
                targeting_specs=audience.get('targeting', {}),
                metadata={"raw_data": audience}
            )
            audiences.append(audience_data)
        
        return audiences
    
    async def create_custom_audience(self, 
                                   name: str,
                                   description: str,
                                   subtype: str = "CUSTOM",
                                   ad_account_id: str = None) -> AudienceData:
        """Create a custom audience"""
        account_id = ad_account_id or self.credentials.ad_account_id
        if not account_id:
            raise ValueError("Ad account ID required")
        
        endpoint = f"act_{account_id}/customaudiences"
        
        data = {
            'name': name,
            'description': description,
            'subtype': subtype
        }
        
        response = await self._make_request(endpoint, method='POST', data=data)
        
        audience_data = AudienceData(
            id=response['id'],
            name=name,
            type=subtype,
            size=0,
            description=description,
            targeting_specs={},
            metadata={"created_via_api": True, "raw_response": response}
        )
        
        return audience_data
    
    # ==================== ANALYTICS & INSIGHTS ====================
    
    async def get_campaign_insights(self, 
                                  campaign_id: str,
                                  start_date: date,
                                  end_date: date,
                                  metrics: List[str] = None) -> Dict[str, Any]:
        """Get campaign performance insights"""
        if not metrics:
            metrics = [
                'impressions', 'clicks', 'spend', 'reach', 'frequency',
                'cpc', 'cpm', 'ctr', 'cpp', 'cost_per_result',
                'actions', 'conversions', 'conversion_values'
            ]
        
        endpoint = f"{campaign_id}/insights"
        params = {
            'fields': ','.join(metrics),
            'time_range': json.dumps({
                'since': start_date.isoformat(),
                'until': end_date.isoformat()
            }),
            'level': 'campaign'
        }
        
        response = await self._make_request(endpoint, params=params)
        
        if response.get('data'):
            return response['data'][0]  # Return first (and typically only) insight
        
        return {}
    
    async def get_ad_account_insights(self, 
                                    ad_account_id: str = None,
                                    start_date: date = None,
                                    end_date: date = None,
                                    metrics: List[str] = None) -> Dict[str, Any]:
        """Get ad account performance insights"""
        account_id = ad_account_id or self.credentials.ad_account_id
        if not account_id:
            raise ValueError("Ad account ID required")
        
        if not start_date:
            start_date = date.today() - timedelta(days=30)
        if not end_date:
            end_date = date.today()
        
        if not metrics:
            metrics = [
                'impressions', 'clicks', 'spend', 'reach', 'frequency',
                'cpc', 'cpm', 'ctr', 'cpp', 'cost_per_result',
                'actions', 'conversions', 'conversion_values'
            ]
        
        endpoint = f"act_{account_id}/insights"
        params = {
            'fields': ','.join(metrics),
            'time_range': json.dumps({
                'since': start_date.isoformat(),
                'until': end_date.isoformat()
            }),
            'level': 'account'
        }
        
        response = await self._make_request(endpoint, params=params)
        
        if response.get('data'):
            return response['data'][0]
        
        return {}
    
    async def get_page_insights(self, 
                              page_id: str = None,
                              start_date: date = None,
                              end_date: date = None,
                              metrics: List[str] = None) -> Dict[str, Any]:
        """Get Facebook page insights"""
        page_id = page_id or self.credentials.page_id
        if not page_id:
            raise ValueError("Page ID required")
        
        if not start_date:
            start_date = date.today() - timedelta(days=30)
        if not end_date:
            end_date = date.today()
        
        if not metrics:
            metrics = [
                'page_impressions', 'page_reach', 'page_engaged_users',
                'page_post_engagements', 'page_fans', 'page_views'
            ]
        
        endpoint = f"{page_id}/insights"
        params = {
            'metric': ','.join(metrics),
            'since': start_date.isoformat(),
            'until': end_date.isoformat(),
            'period': 'day'
        }
        
        response = await self._make_request(endpoint, params=params)
        
        insights = {}
        for insight in response.get('data', []):
            insights[insight['name']] = insight.get('values', [])
        
        return insights
    
    # ==================== BUSINESS MANAGER ====================
    
    async def get_business_accounts(self) -> List[Dict[str, Any]]:
        """Get business accounts accessible to the user"""
        endpoint = "me/businesses"
        params = {
            'fields': 'id,name,primary_page,timezone_id'
        }
        
        response = await self._make_request(endpoint, params=params)
        return response.get('data', [])
    
    async def get_ad_accounts(self, business_id: str = None) -> List[Dict[str, Any]]:
        """Get ad accounts"""
        if business_id:
            endpoint = f"{business_id}/owned_ad_accounts"
        else:
            endpoint = "me/adaccounts"
        
        params = {
            'fields': 'id,name,account_status,currency,timezone_name,amount_spent'
        }
        
        response = await self._make_request(endpoint, params=params)
        return response.get('data', [])
    
    async def get_pages(self, business_id: str = None) -> List[Dict[str, Any]]:
        """Get Facebook pages"""
        if business_id:
            endpoint = f"{business_id}/owned_pages"
        else:
            endpoint = "me/accounts"
        
        params = {
            'fields': 'id,name,category,access_token,tasks'
        }
        
        response = await self._make_request(endpoint, params=params)
        return response.get('data', [])
    
    async def get_instagram_accounts(self, business_id: str = None) -> List[Dict[str, Any]]:
        """Get Instagram business accounts"""
        if business_id:
            endpoint = f"{business_id}/owned_instagram_accounts"
        else:
            endpoint = "me/accounts"
        
        params = {
            'fields': 'id,username,name,profile_pic,followers_count,follows_count,media_count'
        }
        
        response = await self._make_request(endpoint, params=params)
        return response.get('data', [])
    
    # ==================== UTILITY METHODS ====================
    
    async def validate_connection(self) -> bool:
        """Validate the Meta API connection"""
        try:
            endpoint = "me"
            params = {'fields': 'id,name'}
            response = await self._make_request(endpoint, params=params)
            return 'id' in response
        except Exception as e:
            logger.error(f"Meta connection validation failed: {e}")
            return False
    
    async def get_user_permissions(self) -> Dict[str, Any]:
        """Get user permissions and available features"""
        endpoint = "me/permissions"
        response = await self._make_request(endpoint)
        
        permissions = {}
        for perm in response.get('data', []):
            permissions[perm['permission']] = perm['status'] == 'granted'
        
        return permissions

class MetaBusinessSuiteManager:
    """Manager for Meta Business Suite integrations"""
    
    def __init__(self):
        self.connectors: Dict[str, MetaBusinessSuiteConnector] = {}
    
    def add_credentials(self, name: str, credentials: MetaCredentials):
        """Add Meta credentials for a business"""
        self.connectors[name] = MetaBusinessSuiteConnector(credentials)
        logger.info(f"Added Meta Business Suite credentials for {name}")
    
    async def create_campaign_workflow(self, 
                                     business_name: str,
                                     campaign_name: str,
                                     objective: CampaignObjective,
                                     daily_budget: float,
                                     target_audience: Dict[str, Any],
                                     creative_assets: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Complete campaign creation workflow"""
        if business_name not in self.connectors:
            raise ValueError(f"No credentials found for business: {business_name}")
        
        connector = self.connectors[business_name]
        
        async with connector:
            # 1. Create campaign
            campaign = await connector.create_campaign(
                name=campaign_name,
                objective=objective,
                daily_budget=daily_budget,
                target_audience=target_audience
            )
            
            # 2. Create ad set
            ad_set = await connector.create_ad_set(
                name=f"{campaign_name} - Ad Set 1",
                campaign_id=campaign.id,
                daily_budget=daily_budget,
                targeting=target_audience
            )
            
            # 3. Create ads for each creative
            ads = []
            for i, creative in enumerate(creative_assets):
                ad = await connector.create_ad(
                    name=f"{campaign_name} - Ad {i+1}",
                    ad_set_id=ad_set.id,
                    creative=creative
                )
                ads.append(ad)
            
            return {
                "campaign": asdict(campaign),
                "ad_set": asdict(ad_set),
                "ads": [asdict(ad) for ad in ads],
                "status": "created_paused",
                "next_steps": [
                    "Review campaign settings",
                    "Upload creative assets",
                    "Test targeting parameters",
                    "Launch campaign"
                ]
            }
    
    async def get_campaign_analytics(self, 
                                   business_name: str,
                                   campaign_id: str,
                                   start_date: date,
                                   end_date: date) -> Dict[str, Any]:
        """Get comprehensive campaign analytics"""
        if business_name not in self.connectors:
            raise ValueError(f"No credentials found for business: {business_name}")
        
        connector = self.connectors[business_name]
        
        async with connector:
            # Get campaign insights
            insights = await connector.get_campaign_insights(campaign_id, start_date, end_date)
            
            # Get ad sets
            ad_sets = await connector.get_ad_sets(campaign_id)
            
            # Get ads for each ad set
            ads_data = {}
            for ad_set in ad_sets:
                ads = await connector.get_ads(ad_set.id)
                ads_data[ad_set.id] = [asdict(ad) for ad in ads]
            
            return {
                "campaign_id": campaign_id,
                "date_range": {
                    "start": start_date.isoformat(),
                    "end": end_date.isoformat()
                },
                "insights": insights,
                "ad_sets": [asdict(ad_set) for ad_set in ad_sets],
                "ads": ads_data,
                "summary": {
                    "total_spend": insights.get('spend', 0),
                    "total_impressions": insights.get('impressions', 0),
                    "total_clicks": insights.get('clicks', 0),
                    "ctr": insights.get('ctr', 0),
                    "cpc": insights.get('cpc', 0),
                    "cpm": insights.get('cpm', 0)
                }
            }

# Global Meta Business Suite manager
meta_business_manager = MetaBusinessSuiteManager()

# Convenience functions
def add_meta_credentials(name: str, 
                        access_token: str,
                        app_id: str,
                        app_secret: str,
                        business_id: str = None,
                        ad_account_id: str = None,
                        page_id: str = None):
    """Add Meta Business Suite credentials"""
    credentials = MetaCredentials(
        access_token=access_token,
        app_id=app_id,
        app_secret=app_secret,
        business_id=business_id,
        ad_account_id=ad_account_id,
        page_id=page_id
    )
    meta_business_manager.add_credentials(name, credentials)

async def create_meta_campaign(business_name: str,
                             campaign_name: str,
                             objective: str,
                             daily_budget: float,
                             target_audience: Dict[str, Any],
                             creative_assets: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Create a Meta campaign with full workflow"""
    return await meta_business_manager.create_campaign_workflow(
        business_name=business_name,
        campaign_name=campaign_name,
        objective=CampaignObjective(objective),
        daily_budget=daily_budget,
        target_audience=target_audience,
        creative_assets=creative_assets
    )

async def get_meta_analytics(business_name: str,
                           campaign_id: str,
                           start_date: date,
                           end_date: date) -> Dict[str, Any]:
    """Get Meta campaign analytics"""
    return await meta_business_manager.get_campaign_analytics(
        business_name=business_name,
        campaign_id=campaign_id,
        start_date=start_date,
        end_date=end_date
    )
