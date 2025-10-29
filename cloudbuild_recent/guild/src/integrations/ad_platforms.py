"""
Advertising Platform Integrations

Comprehensive integration with Google Ads and TikTok Ads APIs
for Ad Optimizer Agent to run experiments automatically.
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

class AdPlatform(Enum):
    GOOGLE_ADS = "google_ads"
    TIKTOK_ADS = "tiktok_ads"
    META_ADS = "meta_ads"  # Already implemented in meta_business_suite.py

class CampaignObjective(Enum):
    AWARENESS = "AWARENESS"
    TRAFFIC = "TRAFFIC"
    ENGAGEMENT = "ENGAGEMENT"
    LEADS = "LEADS"
    SALES = "SALES"
    APP_PROMOTION = "APP_PROMOTION"

class BidStrategy(Enum):
    MANUAL_CPC = "MANUAL_CPC"
    TARGET_CPA = "TARGET_CPA"
    TARGET_ROAS = "TARGET_ROAS"
    MAXIMIZE_CONVERSIONS = "MAXIMIZE_CONVERSIONS"
    MAXIMIZE_CONVERSION_VALUE = "MAXIMIZE_CONVERSION_VALUE"

@dataclass
class AdCredentials:
    """Credentials for advertising platforms"""
    platform: AdPlatform
    access_token: str
    refresh_token: Optional[str] = None
    client_id: Optional[str] = None
    client_secret: Optional[str] = None
    developer_token: Optional[str] = None
    customer_id: Optional[str] = None
    expires_at: Optional[datetime] = None

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
    bid_strategy: BidStrategy
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
    bid_strategy: BidStrategy
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
class AdExperiment:
    """Ad experiment configuration"""
    experiment_id: str
    name: str
    description: str
    platform: AdPlatform
    campaigns: List[str]
    traffic_split: float  # Percentage of traffic for experiment
    start_date: date
    end_date: date
    success_metrics: List[str]
    status: str
    results: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.results is None:
            self.results = {}

class GoogleAdsConnector:
    """Google Ads API connector for campaign management"""
    
    def __init__(self, credentials: AdCredentials):
        self.credentials = credentials
        self.base_url = "https://googleads.googleapis.com/v14"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None) -> Dict:
        """Make authenticated request to Google Ads API"""
        try:
            url = f"{self.base_url}/{endpoint}"
            headers = {
                'Authorization': f'Bearer {self.credentials.access_token}',
                'developer-token': self.credentials.developer_token,
                'Content-Type': 'application/json'
            }
            
            async with self.session.request(method, url, json=data, headers=headers) as response:
                response.raise_for_status()
                return await response.json()
                
        except Exception as e:
            logger.error(f"Google Ads API request failed: {e}")
            raise
    
    async def get_campaigns(self, customer_id: str = None) -> List[CampaignData]:
        """Get all campaigns from a Google Ads account"""
        customer_id = customer_id or self.credentials.customer_id
        if not customer_id:
            raise ValueError("Customer ID required")
        
        endpoint = f"customers/{customer_id}/campaigns"
        params = {
            'fields': 'campaign.id,campaign.name,campaign.status,campaign.bidding_strategy_type,campaign.start_date,campaign.end_date,campaign_budget.amount_micros'
        }
        
        response = await self._make_request(endpoint, params=params)
        campaigns = []
        
        for campaign in response.get('results', []):
            campaign_data = CampaignData(
                id=campaign['campaign']['id'],
                name=campaign['campaign']['name'],
                objective=CampaignObjective.TRAFFIC,  # Would map from Google Ads campaign type
                status=campaign['campaign']['status'],
                budget=0,  # Would extract from campaign budget
                daily_budget=0,
                start_date=date.fromisoformat(campaign['campaign']['start_date']),
                end_date=date.fromisoformat(campaign['campaign']['end_date']) if campaign['campaign'].get('end_date') else None,
                target_audience={},
                placements=[],
                bid_strategy=BidStrategy(campaign['campaign']['bidding_strategy_type']),
                performance_metrics={},
                metadata={"raw_data": campaign}
            )
            campaigns.append(campaign_data)
        
        return campaigns
    
    async def create_campaign(self, 
                            name: str, 
                            objective: CampaignObjective,
                            daily_budget: float,
                            customer_id: str = None,
                            target_audience: Dict[str, Any] = None) -> CampaignData:
        """Create a new Google Ads campaign"""
        customer_id = customer_id or self.credentials.customer_id
        if not customer_id:
            raise ValueError("Customer ID required")
        
        endpoint = f"customers/{customer_id}/campaigns:mutate"
        
        # Convert budget to micros (Google Ads uses micro currency units)
        budget_micros = int(daily_budget * 1000000)
        
        data = {
            'operations': [{
                'create': {
                    'name': name,
                    'status': 'PAUSED',  # Start paused for review
                    'campaign_budget': {
                        'amount_micros': budget_micros,
                        'delivery_method': 'STANDARD'
                    },
                    'advertising_channel_type': 'SEARCH',  # Default to Search
                    'bidding_strategy_type': 'TARGET_CPA'
                }
            }]
        }
        
        response = await self._make_request(endpoint, method='POST', data=data)
        
        # Extract campaign ID from response
        campaign_id = response['results'][0]['resource_name'].split('/')[-1]
        
        campaign_data = CampaignData(
            id=campaign_id,
            name=name,
            objective=objective,
            status='PAUSED',
            budget=0,
            daily_budget=daily_budget,
            start_date=date.today(),
            end_date=None,
            target_audience=target_audience or {},
            placements=['google_search', 'google_display'],
            bid_strategy=BidStrategy.TARGET_CPA,
            performance_metrics={},
            metadata={"created_via_api": True, "raw_response": response}
        )
        
        return campaign_data
    
    async def get_ad_groups(self, campaign_id: str, customer_id: str = None) -> List[AdSetData]:
        """Get ad groups for a campaign"""
        customer_id = customer_id or self.credentials.customer_id
        if not customer_id:
            raise ValueError("Customer ID required")
        
        endpoint = f"customers/{customer_id}/adGroups"
        params = {
            'fields': 'ad_group.id,ad_group.name,ad_group.status,ad_group.campaign,cpc_bid_micros',
            'query': f'SELECT ad_group.id, ad_group.name, ad_group.status, ad_group.campaign, cpc_bid_micros FROM ad_group WHERE campaign.id = {campaign_id}'
        }
        
        response = await self._make_request(endpoint, params=params)
        ad_groups = []
        
        for ad_group in response.get('results', []):
            ad_group_data = AdSetData(
                id=ad_group['ad_group']['id'],
                name=ad_group['ad_group']['name'],
                campaign_id=campaign_id,
                status=ad_group['ad_group']['status'],
                budget=0,
                bid_strategy=BidStrategy.MANUAL_CPC,
                target_audience={},
                placements=[],
                optimization_goal='CLICKS',
                performance_metrics={},
                metadata={"raw_data": ad_group}
            )
            ad_groups.append(ad_group_data)
        
        return ad_groups
    
    async def create_ad_group(self, 
                            name: str,
                            campaign_id: str,
                            cpc_bid: float,
                            customer_id: str = None) -> AdSetData:
        """Create a new ad group"""
        customer_id = customer_id or self.credentials.customer_id
        if not customer_id:
            raise ValueError("Customer ID required")
        
        endpoint = f"customers/{customer_id}/adGroups:mutate"
        
        cpc_bid_micros = int(cpc_bid * 1000000)
        
        data = {
            'operations': [{
                'create': {
                    'name': name,
                    'status': 'ENABLED',
                    'campaign': f'customers/{customer_id}/campaigns/{campaign_id}',
                    'type': 'SEARCH_STANDARD',
                    'cpc_bid_micros': cpc_bid_micros
                }
            }]
        }
        
        response = await self._make_request(endpoint, method='POST', data=data)
        
        # Extract ad group ID from response
        ad_group_id = response['results'][0]['resource_name'].split('/')[-1]
        
        ad_group_data = AdSetData(
            id=ad_group_id,
            name=name,
            campaign_id=campaign_id,
            status='ENABLED',
            budget=0,
            bid_strategy=BidStrategy.MANUAL_CPC,
            target_audience={},
            placements=[],
            optimization_goal='CLICKS',
            performance_metrics={},
            metadata={"created_via_api": True, "raw_response": response}
        )
        
        return ad_group_data
    
    async def get_campaign_insights(self, 
                                  campaign_id: str,
                                  start_date: date,
                                  end_date: date,
                                  customer_id: str = None) -> Dict[str, Any]:
        """Get campaign performance insights"""
        customer_id = customer_id or self.credentials.customer_id
        if not customer_id:
            raise ValueError("Customer ID required")
        
        endpoint = f"customers/{customer_id}:searchStream"
        
        # Google Ads uses a different query format
        query = f"""
        SELECT 
            campaign.id,
            metrics.impressions,
            metrics.clicks,
            metrics.cost_micros,
            metrics.conversions,
            metrics.conversions_value
        FROM campaign 
        WHERE campaign.id = {campaign_id}
        AND segments.date BETWEEN '{start_date}' AND '{end_date}'
        """
        
        data = {'query': query}
        response = await self._make_request(endpoint, method='POST', data=data)
        
        # Process the response
        insights = {}
        for result in response.get('results', []):
            campaign = result['campaign']
            metrics = result.get('metrics', {})
            insights = {
                'campaign_id': campaign['id'],
                'impressions': metrics.get('impressions', 0),
                'clicks': metrics.get('clicks', 0),
                'spend': metrics.get('cost_micros', 0) / 1000000,  # Convert from micros
                'conversions': metrics.get('conversions', 0),
                'conversion_value': metrics.get('conversions_value', 0),
                'ctr': (metrics.get('clicks', 0) / metrics.get('impressions', 1)) * 100 if metrics.get('impressions') else 0,
                'cpc': (metrics.get('cost_micros', 0) / 1000000) / metrics.get('clicks', 1) if metrics.get('clicks') else 0
            }
        
        return insights
    
    async def create_experiment(self, 
                              name: str,
                              description: str,
                              campaigns: List[str],
                              traffic_split: float,
                              start_date: date,
                              end_date: date,
                              customer_id: str = None) -> AdExperiment:
        """Create an ad experiment"""
        customer_id = customer_id or self.credentials.customer_id
        if not customer_id:
            raise ValueError("Customer ID required")
        
        endpoint = f"customers/{customer_id}/campaignExperiments:mutate"
        
        data = {
            'operations': [{
                'create': {
                    'campaign_draft': {
                        'base_campaign': f'customers/{customer_id}/campaigns/{campaigns[0]}',
                        'name': f'{name} - Draft'
                    },
                    'name': name,
                    'description': description,
                    'traffic_split_percent': int(traffic_split * 100),
                    'traffic_split_type': 'RANDOM_QUERY'
                }
            }]
        }
        
        response = await self._make_request(endpoint, method='POST', data=data)
        
        experiment_data = AdExperiment(
            experiment_id=response['results'][0]['resource_name'].split('/')[-1],
            name=name,
            description=description,
            platform=AdPlatform.GOOGLE_ADS,
            campaigns=campaigns,
            traffic_split=traffic_split,
            start_date=start_date,
            end_date=end_date,
            success_metrics=['conversions', 'cost_per_conversion', 'ctr'],
            status='CREATED'
        )
        
        return experiment_data
    
    async def validate_connection(self) -> bool:
        """Validate Google Ads API connection"""
        try:
            customer_id = self.credentials.customer_id
            if not customer_id:
                return False
            
            endpoint = f"customers/{customer_id}"
            await self._make_request(endpoint)
            return True
        except Exception as e:
            logger.error(f"Google Ads connection validation failed: {e}")
            return False

class TikTokAdsConnector:
    """TikTok Ads API connector for video advertising"""
    
    def __init__(self, credentials: AdCredentials):
        self.credentials = credentials
        self.base_url = "https://business-api.tiktok.com/open_api/v1.3"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, method: str = 'GET', data: Dict = None) -> Dict:
        """Make authenticated request to TikTok Ads API"""
        try:
            url = f"{self.base_url}/{endpoint}"
            headers = {
                'Access-Token': self.credentials.access_token,
                'Content-Type': 'application/json'
            }
            
            async with self.session.request(method, url, json=data, headers=headers) as response:
                response.raise_for_status()
                return await response.json()
                
        except Exception as e:
            logger.error(f"TikTok Ads API request failed: {e}")
            raise
    
    async def get_campaigns(self, advertiser_id: str) -> List[CampaignData]:
        """Get all campaigns from a TikTok Ads account"""
        endpoint = "campaign/get"
        
        data = {
            'advertiser_id': advertiser_id,
            'fields': ['campaign_id', 'campaign_name', 'status', 'budget', 'objective_type']
        }
        
        response = await self._make_request(endpoint, method='POST', data=data)
        campaigns = []
        
        for campaign in response.get('data', {}).get('list', []):
            campaign_data = CampaignData(
                id=str(campaign['campaign_id']),
                name=campaign['campaign_name'],
                objective=CampaignObjective(campaign.get('objective_type', 'TRAFFIC')),
                status=campaign['status'],
                budget=float(campaign.get('budget', 0)),
                daily_budget=0,
                start_date=date.today(),
                end_date=None,
                target_audience={},
                placements=['tiktok', 'audience_network'],
                bid_strategy=BidStrategy.MANUAL_CPC,
                performance_metrics={},
                metadata={"raw_data": campaign}
            )
            campaigns.append(campaign_data)
        
        return campaigns
    
    async def create_campaign(self, 
                            name: str, 
                            objective: CampaignObjective,
                            budget: float,
                            advertiser_id: str) -> CampaignData:
        """Create a new TikTok Ads campaign"""
        endpoint = "campaign/create"
        
        data = {
            'advertiser_id': advertiser_id,
            'campaign_name': name,
            'objective_type': objective.value,
            'budget': budget,
            'budget_mode': 'BUDGET_MODE_DAY',
            'status': 'ENABLE'
        }
        
        response = await self._make_request(endpoint, method='POST', data=data)
        
        campaign_data = CampaignData(
            id=str(response['data']['campaign_id']),
            name=name,
            objective=objective,
            status='ENABLE',
            budget=budget,
            daily_budget=budget,
            start_date=date.today(),
            end_date=None,
            target_audience={},
            placements=['tiktok'],
            bid_strategy=BidStrategy.MANUAL_CPC,
            performance_metrics={},
            metadata={"created_via_api": True, "raw_response": response}
        )
        
        return campaign_data
    
    async def get_ad_groups(self, campaign_id: str, advertiser_id: str) -> List[AdSetData]:
        """Get ad groups for a campaign"""
        endpoint = "adgroup/get"
        
        data = {
            'advertiser_id': advertiser_id,
            'campaign_id': campaign_id,
            'fields': ['adgroup_id', 'adgroup_name', 'status', 'budget', 'optimization_goal']
        }
        
        response = await self._make_request(endpoint, method='POST', data=data)
        ad_groups = []
        
        for ad_group in response.get('data', {}).get('list', []):
            ad_group_data = AdSetData(
                id=str(ad_group['adgroup_id']),
                name=ad_group['adgroup_name'],
                campaign_id=campaign_id,
                status=ad_group['status'],
                budget=float(ad_group.get('budget', 0)),
                bid_strategy=BidStrategy.MANUAL_CPC,
                target_audience={},
                placements=['tiktok'],
                optimization_goal=ad_group.get('optimization_goal', 'CLICK'),
                performance_metrics={},
                metadata={"raw_data": ad_group}
            )
            ad_groups.append(ad_group_data)
        
        return ad_groups
    
    async def create_ad_group(self, 
                            name: str,
                            campaign_id: str,
                            budget: float,
                            advertiser_id: str) -> AdSetData:
        """Create a new ad group"""
        endpoint = "adgroup/create"
        
        data = {
            'advertiser_id': advertiser_id,
            'campaign_id': campaign_id,
            'adgroup_name': name,
            'budget': budget,
            'budget_mode': 'BUDGET_MODE_DAY',
            'optimization_goal': 'CLICK',
            'status': 'ENABLE'
        }
        
        response = await self._make_request(endpoint, method='POST', data=data)
        
        ad_group_data = AdSetData(
            id=str(response['data']['adgroup_id']),
            name=name,
            campaign_id=campaign_id,
            status='ENABLE',
            budget=budget,
            bid_strategy=BidStrategy.MANUAL_CPC,
            target_audience={},
            placements=['tiktok'],
            optimization_goal='CLICK',
            performance_metrics={},
            metadata={"created_via_api": True, "raw_response": response}
        )
        
        return ad_group_data
    
    async def get_campaign_insights(self, 
                                  campaign_id: str,
                                  start_date: date,
                                  end_date: date,
                                  advertiser_id: str) -> Dict[str, Any]:
        """Get campaign performance insights"""
        endpoint = "reports/integrated/get"
        
        data = {
            'advertiser_id': advertiser_id,
            'service_type': 'AUCTION',
            'report_type': 'BASIC',
            'data_level': 'CAMPAIGN',
            'dimensions': ['campaign_id', 'stat_time_day'],
            'metrics': ['impressions', 'clicks', 'spend', 'conversions'],
            'start_date': start_date.strftime('%Y-%m-%d'),
            'end_date': end_date.strftime('%Y-%m-%d'),
            'filters': [{
                'field': 'campaign_id',
                'operator': '=',
                'values': [campaign_id]
            }]
        }
        
        response = await self._make_request(endpoint, method='POST', data=data)
        
        insights = {
            'campaign_id': campaign_id,
            'impressions': 0,
            'clicks': 0,
            'spend': 0,
            'conversions': 0,
            'ctr': 0,
            'cpc': 0
        }
        
        for row in response.get('data', {}).get('list', []):
            metrics = row.get('metrics', {})
            insights['impressions'] += metrics.get('impressions', 0)
            insights['clicks'] += metrics.get('clicks', 0)
            insights['spend'] += metrics.get('spend', 0)
            insights['conversions'] += metrics.get('conversions', 0)
        
        if insights['impressions'] > 0:
            insights['ctr'] = (insights['clicks'] / insights['impressions']) * 100
        
        if insights['clicks'] > 0:
            insights['cpc'] = insights['spend'] / insights['clicks']
        
        return insights
    
    async def validate_connection(self) -> bool:
        """Validate TikTok Ads API connection"""
        try:
            # Test with advertiser info endpoint
            endpoint = "advertiser/info"
            data = {'advertiser_ids': ['test']}
            await self._make_request(endpoint, method='POST', data=data)
            return True
        except Exception as e:
            logger.error(f"TikTok Ads connection validation failed: {e}")
            return False

class AdPlatformManager:
    """Manager for multiple advertising platform integrations"""
    
    def __init__(self):
        self.connectors: Dict[AdPlatform, Any] = {}
    
    def add_platform(self, platform: AdPlatform, credentials: AdCredentials):
        """Add an advertising platform connector"""
        if platform == AdPlatform.GOOGLE_ADS:
            self.connectors[platform] = GoogleAdsConnector(credentials)
        elif platform == AdPlatform.TIKTOK_ADS:
            self.connectors[platform] = TikTokAdsConnector(credentials)
        
        logger.info(f"Added {platform.value} connector")
    
    async def run_cross_platform_experiment(self, 
                                          experiment_name: str,
                                          platforms: List[AdPlatform],
                                          campaign_configs: Dict[AdPlatform, Dict[str, Any]]) -> Dict[str, Any]:
        """Run experiments across multiple advertising platforms"""
        results = {}
        
        for platform in platforms:
            if platform in self.connectors:
                try:
                    connector = self.connectors[platform]
                    config = campaign_configs.get(platform, {})
                    
                    async with connector:
                        if platform == AdPlatform.GOOGLE_ADS:
                            # Create Google Ads experiment
                            experiment = await connector.create_experiment(
                                name=f"{experiment_name} - Google Ads",
                                description=f"Cross-platform experiment: {experiment_name}",
                                campaigns=[config.get('campaign_id', '')],
                                traffic_split=config.get('traffic_split', 0.5),
                                start_date=config.get('start_date', date.today()),
                                end_date=config.get('end_date', date.today() + timedelta(days=30))
                            )
                        elif platform == AdPlatform.TIKTOK_ADS:
                            # TikTok Ads doesn't have native experiments, simulate with campaign variants
                            campaign = await connector.create_campaign(
                                name=f"{experiment_name} - TikTok Ads",
                                objective=CampaignObjective(config.get('objective', 'TRAFFIC')),
                                budget=config.get('budget', 100),
                                advertiser_id=config.get('advertiser_id', '')
                            )
                            experiment = AdExperiment(
                                experiment_id=campaign.id,
                                name=f"{experiment_name} - TikTok Ads",
                                description=f"Campaign variant for experiment: {experiment_name}",
                                platform=platform,
                                campaigns=[campaign.id],
                                traffic_split=config.get('traffic_split', 0.5),
                                start_date=config.get('start_date', date.today()),
                                end_date=config.get('end_date', date.today() + timedelta(days=30)),
                                success_metrics=['clicks', 'conversions', 'cost_per_conversion'],
                                status='CREATED'
                            )
                        
                        results[platform.value] = asdict(experiment)
                        
                except Exception as e:
                    logger.error(f"Error creating experiment on {platform.value}: {e}")
                    results[platform.value] = {"error": str(e)}
        
        return results
    
    async def get_unified_campaign_analytics(self, 
                                           campaign_ids: Dict[AdPlatform, List[str]],
                                           start_date: date,
                                           end_date: date) -> Dict[AdPlatform, List[Dict[str, Any]]]:
        """Get unified analytics from multiple advertising platforms"""
        analytics = {}
        
        for platform, campaigns in campaign_ids.items():
            if platform in self.connectors:
                platform_analytics = []
                connector = self.connectors[platform]
                
                async with connector:
                    for campaign_id in campaigns:
                        try:
                            insights = await connector.get_campaign_insights(
                                campaign_id=campaign_id,
                                start_date=start_date,
                                end_date=end_date,
                                customer_id=getattr(connector.credentials, 'customer_id', None),
                                advertiser_id=getattr(connector.credentials, 'advertiser_id', None)
                            )
                            platform_analytics.append(insights)
                        except Exception as e:
                            logger.error(f"Error getting analytics for {platform.value} campaign {campaign_id}: {e}")
                
                analytics[platform] = platform_analytics
        
        return analytics
    
    async def validate_all_connections(self) -> Dict[AdPlatform, bool]:
        """Validate connections to all advertising platforms"""
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

# Global ad platform manager
ad_platform_manager = AdPlatformManager()

# Convenience functions
def add_ad_credentials(platform: str, access_token: str, customer_id: str = None, advertiser_id: str = None, developer_token: str = None):
    """Add advertising platform credentials"""
    credentials = AdCredentials(
        platform=AdPlatform(platform),
        access_token=access_token,
        customer_id=customer_id,
        advertiser_id=advertiser_id,
        developer_token=developer_token
    )
    ad_platform_manager.add_platform(credentials.platform, credentials)

async def run_ad_experiment(experiment_name: str, platforms: List[str], campaign_configs: Dict[str, Any]):
    """Run experiments across multiple advertising platforms"""
    platform_enums = [AdPlatform(platform) for platform in platforms]
    return await ad_platform_manager.run_cross_platform_experiment(experiment_name, platform_enums, campaign_configs)

async def get_ad_analytics(campaign_ids: Dict[str, List[str]], start_date: date, end_date: date):
    """Get analytics from multiple advertising platforms"""
    platform_campaigns = {AdPlatform(platform): campaigns for platform, campaigns in campaign_ids.items()}
    return await ad_platform_manager.get_unified_campaign_analytics(platform_campaigns, start_date, end_date)
