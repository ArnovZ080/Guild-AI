"""
Analytics Platform Integrations

Comprehensive integration with Google Analytics, Mixpanel, and Amplitude APIs
for Trend Spotter and Growth Agents.
"""

import asyncio
import aiohttp
import json
import base64
from typing import Dict, Any, List, Optional, Union
from datetime import datetime, date, timedelta
from dataclasses import dataclass, asdict
from enum import Enum
from guild.src.core.config import settings
from guild.src.utils.logging_utils import get_logger

logger = get_logger(__name__)

class AnalyticsPlatform(Enum):
    GOOGLE_ANALYTICS = "google_analytics"
    MIXPANEL = "mixpanel"
    AMPLITUDE = "amplitude"

class MetricType(Enum):
    PAGEVIEWS = "pageviews"
    SESSIONS = "sessions"
    USERS = "users"
    REVENUE = "revenue"
    CONVERSIONS = "conversions"
    EVENTS = "events"
    RETENTION = "retention"
    FUNNEL = "funnel"

class DimensionType(Enum):
    DATE = "date"
    COUNTRY = "country"
    DEVICE = "device"
    SOURCE = "source"
    MEDIUM = "medium"
    CAMPAIGN = "campaign"
    PAGE = "page"
    USER_TYPE = "user_type"

@dataclass
class AnalyticsCredentials:
    """Credentials for analytics platforms"""
    platform: AnalyticsPlatform
    access_token: str
    refresh_token: Optional[str] = None
    api_key: Optional[str] = None
    property_id: Optional[str] = None  # For Google Analytics
    project_id: Optional[str] = None  # For Mixpanel/Amplitude
    expires_at: Optional[datetime] = None

@dataclass
class AnalyticsData:
    """Standardized analytics data format"""
    platform: AnalyticsPlatform
    metric: MetricType
    dimension: DimensionType
    value: Union[int, float]
    date: date
    dimensions: Dict[str, Any]
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}

@dataclass
class UserEvent:
    """Standardized user event format"""
    user_id: str
    event_name: str
    timestamp: datetime
    properties: Dict[str, Any]
    session_id: Optional[str]
    platform: AnalyticsPlatform
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}

@dataclass
class CohortData:
    """Standardized cohort analysis data"""
    cohort_date: date
    cohort_size: int
    retention_rates: Dict[str, float]  # period -> retention rate
    platform: AnalyticsPlatform
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}

@dataclass
class FunnelData:
    """Standardized funnel analysis data"""
    funnel_name: str
    steps: List[str]
    conversion_rates: List[float]
    drop_off_rates: List[float]
    total_users: int
    platform: AnalyticsPlatform
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}

class GoogleAnalyticsConnector:
    """Google Analytics API connector"""
    
    def __init__(self, credentials: AnalyticsCredentials):
        self.credentials = credentials
        self.base_url = "https://analyticsreporting.googleapis.com/v4/reports:batchGet"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, data: Dict) -> Dict:
        """Make authenticated request to Google Analytics API"""
        try:
            headers = {
                'Authorization': f'Bearer {self.credentials.access_token}',
                'Content-Type': 'application/json'
            }
            
            async with self.session.post(self.base_url, json=data, headers=headers) as response:
                response.raise_for_status()
                return await response.json()
                
        except Exception as e:
            logger.error(f"Google Analytics API request failed: {e}")
            raise
    
    async def get_pageviews(self, 
                          start_date: date,
                          end_date: date,
                          dimensions: List[str] = None) -> List[AnalyticsData]:
        """Get pageview data"""
        if dimensions is None:
            dimensions = ['ga:date', 'ga:pagePath']
        
        request_data = {
            'reportRequests': [{
                'viewId': self.credentials.property_id,
                'dateRanges': [{
                    'startDate': start_date.strftime('%Y-%m-%d'),
                    'endDate': end_date.strftime('%Y-%m-%d')
                }],
                'metrics': [{'expression': 'ga:pageviews'}],
                'dimensions': [{'name': dim} for dim in dimensions]
            }]
        }
        
        response = await self._make_request(request_data)
        
        analytics_data = []
        for report in response.get('reports', []):
            for row in report.get('data', {}).get('rows', []):
                dimensions_data = {}
                for i, dimension in enumerate(dimensions):
                    dimensions_data[dimension] = row['dimensions'][i]
                
                metric_value = int(row['metrics'][0]['values'][0])
                
                analytics_data.append(AnalyticsData(
                    platform=AnalyticsPlatform.GOOGLE_ANALYTICS,
                    metric=MetricType.PAGEVIEWS,
                    dimension=DimensionType.PAGE,
                    value=metric_value,
                    date=datetime.strptime(dimensions_data.get('ga:date', ''), '%Y%m%d').date(),
                    dimensions=dimensions_data,
                    metadata={"raw_data": row}
                ))
        
        return analytics_data
    
    async def get_sessions(self, 
                         start_date: date,
                         end_date: date,
                         dimensions: List[str] = None) -> List[AnalyticsData]:
        """Get session data"""
        if dimensions is None:
            dimensions = ['ga:date', 'ga:source', 'ga:medium']
        
        request_data = {
            'reportRequests': [{
                'viewId': self.credentials.property_id,
                'dateRanges': [{
                    'startDate': start_date.strftime('%Y-%m-%d'),
                    'endDate': end_date.strftime('%Y-%m-%d')
                }],
                'metrics': [{'expression': 'ga:sessions'}],
                'dimensions': [{'name': dim} for dim in dimensions]
            }]
        }
        
        response = await self._make_request(request_data)
        
        analytics_data = []
        for report in response.get('reports', []):
            for row in report.get('data', {}).get('rows', []):
                dimensions_data = {}
                for i, dimension in enumerate(dimensions):
                    dimensions_data[dimension] = row['dimensions'][i]
                
                metric_value = int(row['metrics'][0]['values'][0])
                
                analytics_data.append(AnalyticsData(
                    platform=AnalyticsPlatform.GOOGLE_ANALYTICS,
                    metric=MetricType.SESSIONS,
                    dimension=DimensionType.SOURCE,
                    value=metric_value,
                    date=datetime.strptime(dimensions_data.get('ga:date', ''), '%Y%m%d').date(),
                    dimensions=dimensions_data,
                    metadata={"raw_data": row}
                ))
        
        return analytics_data
    
    async def get_users(self, 
                      start_date: date,
                      end_date: date,
                      dimensions: List[str] = None) -> List[AnalyticsData]:
        """Get user data"""
        if dimensions is None:
            dimensions = ['ga:date', 'ga:userType']
        
        request_data = {
            'reportRequests': [{
                'viewId': self.credentials.property_id,
                'dateRanges': [{
                    'startDate': start_date.strftime('%Y-%m-%d'),
                    'endDate': end_date.strftime('%Y-%m-%d')
                }],
                'metrics': [{'expression': 'ga:users'}],
                'dimensions': [{'name': dim} for dim in dimensions]
            }]
        }
        
        response = await self._make_request(request_data)
        
        analytics_data = []
        for report in response.get('reports', []):
            for row in report.get('data', {}).get('rows', []):
                dimensions_data = {}
                for i, dimension in enumerate(dimensions):
                    dimensions_data[dimension] = row['dimensions'][i]
                
                metric_value = int(row['metrics'][0]['values'][0])
                
                analytics_data.append(AnalyticsData(
                    platform=AnalyticsPlatform.GOOGLE_ANALYTICS,
                    metric=MetricType.USERS,
                    dimension=DimensionType.USER_TYPE,
                    value=metric_value,
                    date=datetime.strptime(dimensions_data.get('ga:date', ''), '%Y%m%d').date(),
                    dimensions=dimensions_data,
                    metadata={"raw_data": row}
                ))
        
        return analytics_data
    
    async def get_goals(self, 
                       start_date: date,
                       end_date: date,
                       goal_id: str = None) -> List[AnalyticsData]:
        """Get goal conversion data"""
        request_data = {
            'reportRequests': [{
                'viewId': self.credentials.property_id,
                'dateRanges': [{
                    'startDate': start_date.strftime('%Y-%m-%d'),
                    'endDate': end_date.strftime('%Y-%m-%d')
                }],
                'metrics': [{'expression': f'ga:goal{goal_id or "1"}Completions'}],
                'dimensions': [{'name': 'ga:date'}]
            }]
        }
        
        response = await self._make_request(request_data)
        
        analytics_data = []
        for report in response.get('reports', []):
            for row in report.get('data', {}).get('rows', []):
                dimensions_data = {'ga:date': row['dimensions'][0]}
                metric_value = int(row['metrics'][0]['values'][0])
                
                analytics_data.append(AnalyticsData(
                    platform=AnalyticsPlatform.GOOGLE_ANALYTICS,
                    metric=MetricType.CONVERSIONS,
                    dimension=DimensionType.DATE,
                    value=metric_value,
                    date=datetime.strptime(dimensions_data['ga:date'], '%Y%m%d').date(),
                    dimensions=dimensions_data,
                    metadata={"raw_data": row, "goal_id": goal_id}
                ))
        
        return analytics_data
    
    async def validate_connection(self) -> bool:
        """Validate Google Analytics API connection"""
        try:
            # Test with a simple request
            request_data = {
                'reportRequests': [{
                    'viewId': self.credentials.property_id,
                    'dateRanges': [{
                        'startDate': '7daysAgo',
                        'endDate': 'today'
                    }],
                    'metrics': [{'expression': 'ga:sessions'}]
                }]
            }
            await self._make_request(request_data)
            return True
        except Exception as e:
            logger.error(f"Google Analytics connection validation failed: {e}")
            return False

class MixpanelConnector:
    """Mixpanel API connector for product analytics"""
    
    def __init__(self, credentials: AnalyticsCredentials):
        self.credentials = credentials
        self.base_url = "https://mixpanel.com/api/2.0"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, params: Dict = None) -> Dict:
        """Make authenticated request to Mixpanel API"""
        try:
            url = f"{self.base_url}{endpoint}"
            if params is None:
                params = {}
            
            # Mixpanel uses basic auth with API secret
            auth = base64.b64encode(f"{self.credentials.api_key}:".encode()).decode()
            headers = {
                'Authorization': f'Basic {auth}',
                'Content-Type': 'application/json'
            }
            
            async with self.session.get(url, params=params, headers=headers) as response:
                response.raise_for_status()
                return await response.json()
                
        except Exception as e:
            logger.error(f"Mixpanel API request failed: {e}")
            raise
    
    async def get_events(self, 
                        event_name: str,
                        start_date: date,
                        end_date: date,
                        properties: List[str] = None) -> List[UserEvent]:
        """Get event data from Mixpanel"""
        endpoint = "/events"
        
        params = {
            'event': json.dumps([event_name]),
            'from_date': start_date.strftime('%Y-%m-%d'),
            'to_date': end_date.strftime('%Y-%m-%d'),
            'limit': 1000
        }
        
        if properties:
            params['where'] = json.dumps(properties)
        
        response = await self._make_request(endpoint, params)
        
        events = []
        for event_data in response.get('data', {}).get('values', []):
            event = UserEvent(
                user_id=event_data.get('distinct_id', ''),
                event_name=event_name,
                timestamp=datetime.fromtimestamp(event_data.get('time', 0)),
                properties=event_data.get('properties', {}),
                session_id=event_data.get('$session_id'),
                platform=AnalyticsPlatform.MIXPANEL,
                metadata={"raw_data": event_data}
            )
            events.append(event)
        
        return events
    
    async def get_funnel_data(self, 
                            funnel_id: str,
                            start_date: date,
                            end_date: date) -> FunnelData:
        """Get funnel analysis data"""
        endpoint = "/funnels"
        
        params = {
            'funnel_id': funnel_id,
            'from_date': start_date.strftime('%Y-%m-%d'),
            'to_date': end_date.strftime('%Y-%m-%d')
        }
        
        response = await self._make_request(endpoint, params)
        
        funnel_info = response.get('data', {})
        steps = funnel_info.get('steps', [])
        
        conversion_rates = []
        drop_off_rates = []
        
        for i, step in enumerate(steps):
            if i == 0:
                conversion_rates.append(100.0)  # First step is 100%
                drop_off_rates.append(0.0)
            else:
                current_count = step.get('count', 0)
                previous_count = steps[i-1].get('count', 1)
                conversion_rate = (current_count / previous_count) * 100
                drop_off_rate = 100 - conversion_rate
                
                conversion_rates.append(conversion_rate)
                drop_off_rates.append(drop_off_rate)
        
        return FunnelData(
            funnel_name=funnel_info.get('name', 'Unknown Funnel'),
            steps=[step.get('event', '') for step in steps],
            conversion_rates=conversion_rates,
            drop_off_rates=drop_off_rates,
            total_users=steps[0].get('count', 0) if steps else 0,
            platform=AnalyticsPlatform.MIXPANEL,
            metadata={"raw_data": funnel_info}
        )
    
    async def get_cohort_analysis(self, 
                                cohort_type: str = "user",
                                start_date: date = None,
                                end_date: date = None) -> List[CohortData]:
        """Get cohort analysis data"""
        endpoint = "/cohorts"
        
        params = {
            'type': cohort_type,
            'unit': 'day',
            'interval': 7  # 7-day intervals
        }
        
        if start_date:
            params['from_date'] = start_date.strftime('%Y-%m-%d')
        if end_date:
            params['to_date'] = end_date.strftime('%Y-%m-%d')
        
        response = await self._make_request(endpoint, params)
        
        cohorts = []
        for cohort_data in response.get('data', []):
            cohort = CohortData(
                cohort_date=datetime.strptime(cohort_data.get('cohort_date', ''), '%Y-%m-%d').date(),
                cohort_size=cohort_data.get('size', 0),
                retention_rates=cohort_data.get('retention_rates', {}),
                platform=AnalyticsPlatform.MIXPANEL,
                metadata={"raw_data": cohort_data}
            )
            cohorts.append(cohort)
        
        return cohorts
    
    async def validate_connection(self) -> bool:
        """Validate Mixpanel API connection"""
        try:
            # Test with a simple request
            await self._make_request("/events", {'event': '["test"]', 'from_date': '2020-01-01', 'to_date': '2020-01-02'})
            return True
        except Exception as e:
            logger.error(f"Mixpanel connection validation failed: {e}")
            return False

class AmplitudeConnector:
    """Amplitude API connector for product analytics"""
    
    def __init__(self, credentials: AnalyticsCredentials):
        self.credentials = credentials
        self.base_url = "https://amplitude.com/api/2"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, params: Dict = None) -> Dict:
        """Make authenticated request to Amplitude API"""
        try:
            url = f"{self.base_url}{endpoint}"
            if params is None:
                params = {}
            params['api_key'] = self.credentials.api_key
            params['secret_key'] = self.credentials.api_secret
            
            async with self.session.get(url, params=params) as response:
                response.raise_for_status()
                return await response.json()
                
        except Exception as e:
            logger.error(f"Amplitude API request failed: {e}")
            raise
    
    async def get_events(self, 
                        event_type: str,
                        start_date: date,
                        end_date: date,
                        limit: int = 1000) -> List[UserEvent]:
        """Get event data from Amplitude"""
        endpoint = "/events"
        
        params = {
            'start': start_date.strftime('%Y%m%d'),
            'end': end_date.strftime('%Y%m%d'),
            'event_type': event_type,
            'limit': limit
        }
        
        response = await self._make_request(endpoint, params)
        
        events = []
        for event_data in response.get('events', []):
            event = UserEvent(
                user_id=event_data.get('user_id', ''),
                event_name=event_type,
                timestamp=datetime.fromtimestamp(event_data.get('timestamp', 0) / 1000),
                properties=event_data.get('event_properties', {}),
                session_id=event_data.get('session_id'),
                platform=AnalyticsPlatform.AMPLITUDE,
                metadata={"raw_data": event_data}
            )
            events.append(event)
        
        return events
    
    async def get_cohort_analysis(self, 
                                cohort_id: str,
                                start_date: date = None,
                                end_date: date = None) -> List[CohortData]:
        """Get cohort analysis data"""
        endpoint = "/cohorts"
        
        params = {
            'cohort_id': cohort_id
        }
        
        if start_date:
            params['start'] = start_date.strftime('%Y%m%d')
        if end_date:
            params['end'] = end_date.strftime('%Y%m%d')
        
        response = await self._make_request(endpoint, params)
        
        cohorts = []
        for cohort_data in response.get('cohorts', []):
            cohort = CohortData(
                cohort_date=datetime.strptime(cohort_data.get('cohort_date', ''), '%Y-%m-%d').date(),
                cohort_size=cohort_data.get('size', 0),
                retention_rates=cohort_data.get('retention_rates', {}),
                platform=AnalyticsPlatform.AMPLITUDE,
                metadata={"raw_data": cohort_data}
            )
            cohorts.append(cohort)
        
        return cohorts
    
    async def get_funnel_analysis(self, 
                                funnel_id: str,
                                start_date: date,
                                end_date: date) -> FunnelData:
        """Get funnel analysis data"""
        endpoint = "/funnels"
        
        params = {
            'funnel_id': funnel_id,
            'start': start_date.strftime('%Y%m%d'),
            'end': end_date.strftime('%Y%m%d')
        }
        
        response = await self._make_request(endpoint, params)
        
        funnel_info = response.get('funnel', {})
        steps = funnel_info.get('steps', [])
        
        conversion_rates = []
        drop_off_rates = []
        
        for i, step in enumerate(steps):
            if i == 0:
                conversion_rates.append(100.0)
                drop_off_rates.append(0.0)
            else:
                current_count = step.get('count', 0)
                previous_count = steps[i-1].get('count', 1)
                conversion_rate = (current_count / previous_count) * 100
                drop_off_rate = 100 - conversion_rate
                
                conversion_rates.append(conversion_rate)
                drop_off_rates.append(drop_off_rate)
        
        return FunnelData(
            funnel_name=funnel_info.get('name', 'Unknown Funnel'),
            steps=[step.get('event', '') for step in steps],
            conversion_rates=conversion_rates,
            drop_off_rates=drop_off_rates,
            total_users=steps[0].get('count', 0) if steps else 0,
            platform=AnalyticsPlatform.AMPLITUDE,
            metadata={"raw_data": funnel_info}
        )
    
    async def validate_connection(self) -> bool:
        """Validate Amplitude API connection"""
        try:
            # Test with a simple request
            await self._make_request("/events", {'start': '20200101', 'end': '20200102', 'limit': 1})
            return True
        except Exception as e:
            logger.error(f"Amplitude connection validation failed: {e}")
            return False

class AnalyticsManager:
    """Manager for multiple analytics platform integrations"""
    
    def __init__(self):
        self.connectors: Dict[AnalyticsPlatform, Any] = {}
    
    def add_platform(self, platform: AnalyticsPlatform, credentials: AnalyticsCredentials):
        """Add an analytics platform connector"""
        if platform == AnalyticsPlatform.GOOGLE_ANALYTICS:
            self.connectors[platform] = GoogleAnalyticsConnector(credentials)
        elif platform == AnalyticsPlatform.MIXPANEL:
            self.connectors[platform] = MixpanelConnector(credentials)
        elif platform == AnalyticsPlatform.AMPLITUDE:
            self.connectors[platform] = AmplitudeConnector(credentials)
        
        logger.info(f"Added {platform.value} connector")
    
    async def get_unified_analytics(self, 
                                  platforms: List[AnalyticsPlatform],
                                  metrics: List[MetricType],
                                  start_date: date,
                                  end_date: date,
                                  dimensions: List[DimensionType] = None) -> Dict[str, List[AnalyticsData]]:
        """Get unified analytics data across multiple platforms"""
        results = {}
        
        for platform in platforms:
            if platform in self.connectors:
                platform_data = []
                connector = self.connectors[platform]
                
                async with connector:
                    try:
                        for metric in metrics:
                            if metric == MetricType.PAGEVIEWS and platform == AnalyticsPlatform.GOOGLE_ANALYTICS:
                                data = await connector.get_pageviews(start_date, end_date)
                                platform_data.extend(data)
                            elif metric == MetricType.SESSIONS and platform == AnalyticsPlatform.GOOGLE_ANALYTICS:
                                data = await connector.get_sessions(start_date, end_date)
                                platform_data.extend(data)
                            elif metric == MetricType.USERS and platform == AnalyticsPlatform.GOOGLE_ANALYTICS:
                                data = await connector.get_users(start_date, end_date)
                                platform_data.extend(data)
                            elif metric == MetricType.CONVERSIONS and platform == AnalyticsPlatform.GOOGLE_ANALYTICS:
                                data = await connector.get_goals(start_date, end_date)
                                platform_data.extend(data)
                            # Add more metric mappings as needed
                        
                        results[platform.value] = platform_data
                        
                    except Exception as e:
                        logger.error(f"Error getting analytics from {platform.value}: {e}")
                        results[platform.value] = []
        
        return results
    
    async def get_cross_platform_funnels(self, 
                                       platforms: List[AnalyticsPlatform],
                                       funnel_configs: Dict[AnalyticsPlatform, str]) -> Dict[str, FunnelData]:
        """Get funnel data from multiple platforms"""
        results = {}
        
        for platform in platforms:
            if platform in self.connectors and platform in funnel_configs:
                try:
                    connector = self.connectors[platform]
                    funnel_id = funnel_configs[platform]
                    
                    async with connector:
                        if platform == AnalyticsPlatform.MIXPANEL:
                            funnel_data = await connector.get_funnel_data(
                                funnel_id=funnel_id,
                                start_date=date.today() - timedelta(days=30),
                                end_date=date.today()
                            )
                        elif platform == AnalyticsPlatform.AMPLITUDE:
                            funnel_data = await connector.get_funnel_analysis(
                                funnel_id=funnel_id,
                                start_date=date.today() - timedelta(days=30),
                                end_date=date.today()
                            )
                        else:
                            continue
                        
                        results[platform.value] = funnel_data
                        
                except Exception as e:
                    logger.error(f"Error getting funnel data from {platform.value}: {e}")
        
        return results
    
    async def get_cross_platform_cohorts(self, 
                                       platforms: List[AnalyticsPlatform]) -> Dict[str, List[CohortData]]:
        """Get cohort analysis from multiple platforms"""
        results = {}
        
        for platform in platforms:
            if platform in self.connectors:
                try:
                    connector = self.connectors[platform]
                    
                    async with connector:
                        if platform == AnalyticsPlatform.MIXPANEL:
                            cohorts = await connector.get_cohort_analysis()
                        elif platform == AnalyticsPlatform.AMPLITUDE:
                            cohorts = await connector.get_cohort_analysis("default")
                        else:
                            continue
                        
                        results[platform.value] = cohorts
                        
                except Exception as e:
                    logger.error(f"Error getting cohort data from {platform.value}: {e}")
        
        return results
    
    async def validate_all_connections(self) -> Dict[AnalyticsPlatform, bool]:
        """Validate connections to all analytics platforms"""
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

# Global analytics manager
analytics_manager = AnalyticsManager()

# Convenience functions
def add_analytics_credentials(platform: str, 
                             access_token: str,
                             api_key: str = None,
                             api_secret: str = None,
                             property_id: str = None):
    """Add analytics platform credentials"""
    credentials = AnalyticsCredentials(
        platform=AnalyticsPlatform(platform),
        access_token=access_token,
        api_key=api_key,
        api_secret=api_secret,
        property_id=property_id
    )
    analytics_manager.add_platform(credentials.platform, credentials)

async def get_analytics_data(platforms: List[str], 
                           metrics: List[str], 
                           start_date: date, 
                           end_date: date):
    """Get analytics data from multiple platforms"""
    platform_enums = [AnalyticsPlatform(platform) for platform in platforms]
    metric_enums = [MetricType(metric) for metric in metrics]
    return await analytics_manager.get_unified_analytics(platform_enums, metric_enums, start_date, end_date)

async def get_funnel_analysis(platforms: List[str], funnel_configs: Dict[str, str]):
    """Get funnel analysis from multiple platforms"""
    platform_enums = [AnalyticsPlatform(platform) for platform in platforms]
    funnel_configs_typed = {AnalyticsPlatform(platform): config for platform, config in funnel_configs.items()}
    return await analytics_manager.get_cross_platform_funnels(platform_enums, funnel_configs_typed)
