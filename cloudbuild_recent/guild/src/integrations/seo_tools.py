"""
SEO Tools Integration

Comprehensive integration with Ahrefs, SEMrush, and Google Search Console APIs
for SEO Agent and Content Garden optimization.
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

class SEOTool(Enum):
    AHREFS = "ahrefs"
    SEMRUSH = "semrush"
    GOOGLE_SEARCH_CONSOLE = "google_search_console"

class KeywordDifficulty(Enum):
    VERY_EASY = "very_easy"
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"
    VERY_HARD = "very_hard"

class SearchVolume(Enum):
    LOW = "low"          # 0-100
    MEDIUM = "medium"    # 100-1000
    HIGH = "high"        # 1000-10000
    VERY_HIGH = "very_high"  # 10000+

@dataclass
class SEOCredentials:
    """Credentials for SEO tools"""
    tool: SEOTool
    api_key: str
    api_secret: Optional[str] = None
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    expires_at: Optional[datetime] = None

@dataclass
class KeywordData:
    """Standardized keyword data format"""
    keyword: str
    search_volume: int
    difficulty: KeywordDifficulty
    cpc: float
    competition: float
    related_keywords: List[str]
    trending: bool
    seasonal: bool
    long_tail: bool
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}

@dataclass
class BacklinkData:
    """Standardized backlink data format"""
    source_url: str
    target_url: str
    anchor_text: str
    domain_rating: float
    url_rating: float
    traffic_value: float
    link_type: str  # dofollow, nofollow, etc.
    first_seen: datetime
    last_seen: datetime
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}

@dataclass
class SERPData:
    """Standardized SERP data format"""
    keyword: str
    position: int
    url: str
    title: str
    description: str
    domain: str
    domain_rating: float
    date: date
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}

@dataclass
class SiteAuditData:
    """Standardized site audit data format"""
    url: str
    issues_found: int
    critical_issues: int
    warnings: int
    notices: int
    performance_score: float
    accessibility_score: float
    seo_score: float
    mobile_score: float
    crawl_errors: List[Dict[str, Any]]
    recommendations: List[str]
    last_audit: datetime
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}

class AhrefsConnector:
    """Ahrefs API connector for SEO analysis"""
    
    def __init__(self, credentials: SEOCredentials):
        self.credentials = credentials
        self.base_url = "https://apiv2.ahrefs.com"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, params: Dict = None) -> Dict:
        """Make authenticated request to Ahrefs API"""
        try:
            url = f"{self.base_url}{endpoint}"
            if params is None:
                params = {}
            params['token'] = self.credentials.api_key
            
            async with self.session.get(url, params=params) as response:
                response.raise_for_status()
                return await response.json()
                
        except Exception as e:
            logger.error(f"Ahrefs API request failed: {e}")
            raise
    
    async def get_keyword_data(self, keywords: List[str]) -> List[KeywordData]:
        """Get keyword data for multiple keywords"""
        endpoint = "/keywords-explorer/overview"
        
        keyword_data = []
        for keyword in keywords:
            try:
                params = {
                    'keyword': keyword,
                    'output': 'json'
                }
                
                response = await self._make_request(endpoint, params)
                data = response.get('data', [])
                
                if data:
                    kw_data = data[0]
                    keyword_info = KeywordData(
                        keyword=keyword,
                        search_volume=kw_data.get('search_volume', 0),
                        difficulty=self._parse_difficulty(kw_data.get('keyword_difficulty', 0)),
                        cpc=kw_data.get('cpc', 0.0),
                        competition=kw_data.get('competition', 0.0),
                        related_keywords=[],
                        trending=False,
                        seasonal=False,
                        long_tail=len(keyword.split()) > 2,
                        metadata={"raw_data": kw_data}
                    )
                    keyword_data.append(keyword_info)
                    
            except Exception as e:
                logger.error(f"Error getting keyword data for {keyword}: {e}")
        
        return keyword_data
    
    async def get_related_keywords(self, seed_keyword: str, count: int = 100) -> List[KeywordData]:
        """Get related keywords for a seed keyword"""
        endpoint = "/keywords-explorer/related-keywords"
        
        params = {
            'keyword': seed_keyword,
            'output': 'json',
            'limit': count
        }
        
        response = await self._make_request(endpoint, params)
        keywords = []
        
        for kw_data in response.get('data', []):
            keyword_info = KeywordData(
                keyword=kw_data.get('keyword', ''),
                search_volume=kw_data.get('search_volume', 0),
                difficulty=self._parse_difficulty(kw_data.get('keyword_difficulty', 0)),
                cpc=kw_data.get('cpc', 0.0),
                competition=kw_data.get('competition', 0.0),
                related_keywords=[],
                trending=False,
                seasonal=False,
                long_tail=len(kw_data.get('keyword', '').split()) > 2,
                metadata={"raw_data": kw_data}
            )
            keywords.append(keyword_info)
        
        return keywords
    
    async def get_backlinks(self, domain: str, count: int = 100) -> List[BacklinkData]:
        """Get backlinks for a domain"""
        endpoint = "/backlinks/overview"
        
        params = {
            'target': domain,
            'output': 'json',
            'limit': count
        }
        
        response = await self._make_request(endpoint, params)
        backlinks = []
        
        for link_data in response.get('data', []):
            backlink = BacklinkData(
                source_url=link_data.get('source_url', ''),
                target_url=link_data.get('target_url', ''),
                anchor_text=link_data.get('anchor_text', ''),
                domain_rating=link_data.get('domain_rating', 0.0),
                url_rating=link_data.get('url_rating', 0.0),
                traffic_value=link_data.get('traffic_value', 0.0),
                link_type=link_data.get('link_type', 'dofollow'),
                first_seen=datetime.fromisoformat(link_data.get('first_seen', '2020-01-01').replace('Z', '+00:00')),
                last_seen=datetime.fromisoformat(link_data.get('last_seen', '2020-01-01').replace('Z', '+00:00')),
                metadata={"raw_data": link_data}
            )
            backlinks.append(backlink)
        
        return backlinks
    
    async def get_serp_data(self, keyword: str, country: str = "us") -> List[SERPData]:
        """Get SERP data for a keyword"""
        endpoint = "/serp/overview"
        
        params = {
            'keyword': keyword,
            'country': country,
            'output': 'json'
        }
        
        response = await self._make_request(endpoint, params)
        serp_results = []
        
        for result in response.get('data', []):
            serp_data = SERPData(
                keyword=keyword,
                position=result.get('position', 0),
                url=result.get('url', ''),
                title=result.get('title', ''),
                description=result.get('description', ''),
                domain=result.get('domain', ''),
                domain_rating=result.get('domain_rating', 0.0),
                date=date.today(),
                metadata={"raw_data": result}
            )
            serp_results.append(serp_data)
        
        return serp_results
    
    async def analyze_competitor(self, domain: str) -> Dict[str, Any]:
        """Analyze competitor domain"""
        endpoint = "/site-explorer/overview"
        
        params = {
            'target': domain,
            'output': 'json'
        }
        
        response = await self._make_request(endpoint, params)
        
        if response.get('data'):
            data = response['data'][0]
            return {
                'domain': domain,
                'domain_rating': data.get('domain_rating', 0.0),
                'url_rating': data.get('url_rating', 0.0),
                'backlinks': data.get('backlinks', 0),
                'referring_domains': data.get('referring_domains', 0),
                'organic_keywords': data.get('organic_keywords', 0),
                'organic_traffic': data.get('organic_traffic', 0),
                'organic_cost': data.get('organic_cost', 0.0)
            }
        
        return {}
    
    def _parse_difficulty(self, difficulty_score: float) -> KeywordDifficulty:
        """Parse difficulty score to enum"""
        if difficulty_score <= 20:
            return KeywordDifficulty.VERY_EASY
        elif difficulty_score <= 40:
            return KeywordDifficulty.EASY
        elif difficulty_score <= 60:
            return KeywordDifficulty.MEDIUM
        elif difficulty_score <= 80:
            return KeywordDifficulty.HARD
        else:
            return KeywordDifficulty.VERY_HARD
    
    async def validate_connection(self) -> bool:
        """Validate Ahrefs API connection"""
        try:
            # Test with a simple API call
            await self._make_request("/keywords-explorer/overview", {"keyword": "test", "output": "json"})
            return True
        except Exception as e:
            logger.error(f"Ahrefs connection validation failed: {e}")
            return False

class SEMrushConnector:
    """SEMrush API connector for SEO analysis"""
    
    def __init__(self, credentials: SEOCredentials):
        self.credentials = credentials
        self.base_url = "https://api.semrush.com"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, params: Dict = None) -> Dict:
        """Make authenticated request to SEMrush API"""
        try:
            url = f"{self.base_url}{endpoint}"
            if params is None:
                params = {}
            params['key'] = self.credentials.api_key
            
            async with self.session.get(url, params=params) as response:
                response.raise_for_status()
                data = await response.text()
                # SEMrush returns CSV data, need to parse it
                return self._parse_csv_response(data)
                
        except Exception as e:
            logger.error(f"SEMrush API request failed: {e}")
            raise
    
    def _parse_csv_response(self, csv_data: str) -> List[Dict[str, Any]]:
        """Parse SEMrush CSV response"""
        lines = csv_data.strip().split('\n')
        if len(lines) < 2:
            return []
        
        headers = lines[0].split(';')
        results = []
        
        for line in lines[1:]:
            values = line.split(';')
            if len(values) == len(headers):
                result = {}
                for i, header in enumerate(headers):
                    result[header.strip()] = values[i].strip()
                results.append(result)
        
        return results
    
    async def get_keyword_overview(self, keywords: List[str]) -> List[KeywordData]:
        """Get keyword overview data"""
        endpoint = "/"
        
        keyword_data = []
        for keyword in keywords:
            try:
                params = {
                    'type': 'phrase_organic',
                    'phrase': keyword,
                    'database': 'us',
                    'export_columns': 'Ph,Nq,Cp,Co,Nr,Td'
                }
                
                response = await self._make_request(endpoint, params)
                
                if response:
                    data = response[0]
                    keyword_info = KeywordData(
                        keyword=data.get('Ph', keyword),
                        search_volume=int(data.get('Nq', 0)),
                        difficulty=self._parse_semrush_difficulty(data.get('Kd', '0')),
                        cpc=float(data.get('Cp', 0)),
                        competition=float(data.get('Co', 0)),
                        related_keywords=[],
                        trending=False,
                        seasonal=False,
                        long_tail=len(keyword.split()) > 2,
                        metadata={"raw_data": data}
                    )
                    keyword_data.append(keyword_info)
                    
            except Exception as e:
                logger.error(f"Error getting SEMrush keyword data for {keyword}: {e}")
        
        return keyword_data
    
    async def get_related_keywords(self, seed_keyword: str, count: int = 100) -> List[KeywordData]:
        """Get related keywords from SEMrush"""
        endpoint = "/"
        
        params = {
            'type': 'phrase_related',
            'phrase': seed_keyword,
            'database': 'us',
            'export_columns': 'Ph,Nq,Cp,Co,Nr,Td',
            'display_limit': count
        }
        
        response = await self._make_request(endpoint, params)
        keywords = []
        
        for data in response:
            keyword_info = KeywordData(
                keyword=data.get('Ph', ''),
                search_volume=int(data.get('Nq', 0)),
                difficulty=self._parse_semrush_difficulty(data.get('Kd', '0')),
                cpc=float(data.get('Cp', 0)),
                competition=float(data.get('Co', 0)),
                related_keywords=[],
                trending=False,
                seasonal=False,
                long_tail=len(data.get('Ph', '').split()) > 2,
                metadata={"raw_data": data}
            )
            keywords.append(keyword_info)
        
        return keywords
    
    async def get_domain_rank(self, domain: str) -> Dict[str, Any]:
        """Get domain ranking data"""
        endpoint = "/"
        
        params = {
            'type': 'domain_ranks',
            'key': self.credentials.api_key,
            'domain': domain,
            'database': 'us',
            'export_columns': 'Dn,Rk,Or,Ot,Oc,Ad,At,Ac,FKn,FKt,FKc'
        }
        
        response = await self._make_request(endpoint, params)
        
        if response:
            data = response[0]
            return {
                'domain': data.get('Dn', domain),
                'rank': int(data.get('Rk', 0)),
                'organic_keywords': int(data.get('Or', 0)),
                'organic_traffic': int(data.get('Ot', 0)),
                'organic_cost': float(data.get('Oc', 0)),
                'ad_keywords': int(data.get('Ad', 0)),
                'ad_traffic': int(data.get('At', 0)),
                'ad_cost': float(data.get('Ac', 0)),
                'facebook_keywords': int(data.get('FKn', 0)),
                'facebook_traffic': int(data.get('FKt', 0)),
                'facebook_cost': float(data.get('FKc', 0))
            }
        
        return {}
    
    async def get_backlinks_overview(self, domain: str) -> Dict[str, Any]:
        """Get backlinks overview"""
        endpoint = "/"
        
        params = {
            'type': 'backlinks_overview',
            'key': self.credentials.api_key,
            'target': domain,
            'target_type': 'root_domain',
            'export_columns': 'total,domains_num,urls_num,ip_num,ipclassc_num,follows_num,nofollows_num,sponsors_num,ugc_num,texts_num,images_num,forms_num,frames_num'
        }
        
        response = await self._make_request(endpoint, params)
        
        if response:
            data = response[0]
            return {
                'total_backlinks': int(data.get('total', 0)),
                'referring_domains': int(data.get('domains_num', 0)),
                'referring_urls': int(data.get('urls_num', 0)),
                'referring_ips': int(data.get('ip_num', 0)),
                'referring_c_blocks': int(data.get('ipclassc_num', 0)),
                'follow_links': int(data.get('follows_num', 0)),
                'nofollow_links': int(data.get('nofollows_num', 0)),
                'sponsored_links': int(data.get('sponsors_num', 0)),
                'ugc_links': int(data.get('ugc_num', 0)),
                'text_links': int(data.get('texts_num', 0)),
                'image_links': int(data.get('images_num', 0)),
                'form_links': int(data.get('forms_num', 0)),
                'frame_links': int(data.get('frames_num', 0))
            }
        
        return {}
    
    def _parse_semrush_difficulty(self, difficulty_str: str) -> KeywordDifficulty:
        """Parse SEMrush difficulty string to enum"""
        try:
            difficulty = float(difficulty_str)
            if difficulty <= 20:
                return KeywordDifficulty.VERY_EASY
            elif difficulty <= 40:
                return KeywordDifficulty.EASY
            elif difficulty <= 60:
                return KeywordDifficulty.MEDIUM
            elif difficulty <= 80:
                return KeywordDifficulty.HARD
            else:
                return KeywordDifficulty.VERY_HARD
        except:
            return KeywordDifficulty.MEDIUM
    
    async def validate_connection(self) -> bool:
        """Validate SEMrush API connection"""
        try:
            # Test with a simple API call
            await self._make_request("/", {"type": "phrase_organic", "phrase": "test", "database": "us"})
            return True
        except Exception as e:
            logger.error(f"SEMrush connection validation failed: {e}")
            return False

class GoogleSearchConsoleConnector:
    """Google Search Console API connector"""
    
    def __init__(self, credentials: SEOCredentials):
        self.credentials = credentials
        self.base_url = "https://searchconsole.googleapis.com/webmasters/v3"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, params: Dict = None) -> Dict:
        """Make authenticated request to Google Search Console API"""
        try:
            url = f"{self.base_url}{endpoint}"
            headers = {
                'Authorization': f'Bearer {self.credentials.access_token}',
                'Content-Type': 'application/json'
            }
            
            async with self.session.get(url, params=params, headers=headers) as response:
                response.raise_for_status()
                return await response.json()
                
        except Exception as e:
            logger.error(f"Google Search Console API request failed: {e}")
            raise
    
    async def get_sites(self) -> List[Dict[str, Any]]:
        """Get all sites in Search Console"""
        endpoint = "/sites"
        response = await self._make_request(endpoint)
        return response.get('siteEntry', [])
    
    async def get_search_analytics(self, 
                                 site_url: str,
                                 start_date: date,
                                 end_date: date,
                                 dimensions: List[str] = None) -> Dict[str, Any]:
        """Get search analytics data"""
        endpoint = f"/sites/{site_url}/searchAnalytics/query"
        
        if dimensions is None:
            dimensions = ['query']
        
        data = {
            'startDate': start_date.strftime('%Y-%m-%d'),
            'endDate': end_date.strftime('%Y-%m-%d'),
            'dimensions': dimensions,
            'rowLimit': 1000
        }
        
        response = await self._make_request(endpoint, data=data)
        
        return {
            'site_url': site_url,
            'date_range': {
                'start': start_date.isoformat(),
                'end': end_date.isoformat()
            },
            'dimensions': dimensions,
            'rows': response.get('rows', []),
            'row_count': len(response.get('rows', []))
        }
    
    async def get_top_queries(self, 
                            site_url: str,
                            start_date: date,
                            end_date: date,
                            count: int = 100) -> List[Dict[str, Any]]:
        """Get top performing queries"""
        analytics = await self.get_search_analytics(
            site_url=site_url,
            start_date=start_date,
            end_date=end_date,
            dimensions=['query']
        )
        
        # Sort by clicks and return top queries
        rows = analytics.get('rows', [])
        rows.sort(key=lambda x: x.get('clicks', 0), reverse=True)
        
        return rows[:count]
    
    async def get_top_pages(self, 
                          site_url: str,
                          start_date: date,
                          end_date: date,
                          count: int = 100) -> List[Dict[str, Any]]:
        """Get top performing pages"""
        analytics = await self.get_search_analytics(
            site_url=site_url,
            start_date=start_date,
            end_date=end_date,
            dimensions=['page']
        )
        
        # Sort by clicks and return top pages
        rows = analytics.get('rows', [])
        rows.sort(key=lambda x: x.get('clicks', 0), reverse=True)
        
        return rows[:count]
    
    async def get_crawl_errors(self, site_url: str) -> Dict[str, Any]:
        """Get crawl errors"""
        endpoint = f"/sites/{site_url}/urlCrawlErrorsCounts/query"
        
        response = await self._make_request(endpoint)
        
        return {
            'site_url': site_url,
            'errors': response.get('countPerTypes', []),
            'last_checked': response.get('lastUpdated', '')
        }
    
    async def validate_connection(self) -> bool:
        """Validate Google Search Console API connection"""
        try:
            await self.get_sites()
            return True
        except Exception as e:
            logger.error(f"Google Search Console connection validation failed: {e}")
            return False

class SEOToolsManager:
    """Manager for multiple SEO tools integrations"""
    
    def __init__(self):
        self.connectors: Dict[SEOTool, Any] = {}
    
    def add_tool(self, tool: SEOTool, credentials: SEOCredentials):
        """Add an SEO tool connector"""
        if tool == SEOTool.AHREFS:
            self.connectors[tool] = AhrefsConnector(credentials)
        elif tool == SEOTool.SEMRUSH:
            self.connectors[tool] = SEMrushConnector(credentials)
        elif tool == SEOTool.GOOGLE_SEARCH_CONSOLE:
            self.connectors[tool] = GoogleSearchConsoleConnector(credentials)
        
        logger.info(f"Added {tool.value} connector")
    
    async def comprehensive_keyword_research(self, 
                                           seed_keywords: List[str],
                                           tools: List[SEOTool]) -> Dict[str, List[KeywordData]]:
        """Perform comprehensive keyword research across multiple tools"""
        results = {}
        
        for tool in tools:
            if tool in self.connectors:
                try:
                    connector = self.connectors[tool]
                    
                    async with connector:
                        if tool == SEOTool.AHREFS:
                            keywords = await connector.get_keyword_data(seed_keywords)
                            # Get related keywords for each seed
                            for seed in seed_keywords:
                                related = await connector.get_related_keywords(seed, 50)
                                keywords.extend(related)
                        
                        elif tool == SEOTool.SEMRUSH:
                            keywords = await connector.get_keyword_overview(seed_keywords)
                            # Get related keywords
                            for seed in seed_keywords:
                                related = await connector.get_related_keywords(seed, 50)
                                keywords.extend(related)
                        
                        else:
                            keywords = []
                        
                        results[tool.value] = keywords
                        
                except Exception as e:
                    logger.error(f"Error in keyword research with {tool.value}: {e}")
                    results[tool.value] = []
        
        return results
    
    async def competitor_analysis(self, 
                                competitor_domains: List[str],
                                tools: List[SEOTool]) -> Dict[str, Dict[str, Any]]:
        """Perform comprehensive competitor analysis"""
        results = {}
        
        for tool in tools:
            if tool in self.connectors:
                tool_results = {}
                connector = self.connectors[tool]
                
                async with connector:
                    for domain in competitor_domains:
                        try:
                            if tool == SEOTool.AHREFS:
                                analysis = await connector.analyze_competitor(domain)
                            elif tool == SEOTool.SEMRUSH:
                                analysis = await connector.get_domain_rank(domain)
                                backlinks = await connector.get_backlinks_overview(domain)
                                analysis.update(backlinks)
                            else:
                                analysis = {}
                            
                            tool_results[domain] = analysis
                            
                        except Exception as e:
                            logger.error(f"Error analyzing {domain} with {tool.value}: {e}")
                            tool_results[domain] = {}
                
                results[tool.value] = tool_results
        
        return results
    
    async def validate_all_connections(self) -> Dict[SEOTool, bool]:
        """Validate connections to all SEO tools"""
        results = {}
        
        for tool, connector in self.connectors.items():
            try:
                async with connector:
                    is_valid = await connector.validate_connection()
                    results[tool] = is_valid
            except Exception as e:
                logger.error(f"Error validating {tool.value} connection: {e}")
                results[tool] = False
        
        return results

# Global SEO tools manager
seo_tools_manager = SEOToolsManager()

# Convenience functions
def add_seo_credentials(tool: str, 
                       api_key: str,
                       api_secret: str = None,
                       access_token: str = None):
    """Add SEO tool credentials"""
    credentials = SEOCredentials(
        tool=SEOTool(tool),
        api_key=api_key,
        api_secret=api_secret,
        access_token=access_token
    )
    seo_tools_manager.add_tool(credentials.tool, credentials)

async def research_keywords(seed_keywords: List[str], tools: List[str]):
    """Perform keyword research across multiple SEO tools"""
    tool_enums = [SEOTool(tool) for tool in tools]
    return await seo_tools_manager.comprehensive_keyword_research(seed_keywords, tool_enums)

async def analyze_competitors(domains: List[str], tools: List[str]):
    """Analyze competitors across multiple SEO tools"""
    tool_enums = [SEOTool(tool) for tool in tools]
    return await seo_tools_manager.competitor_analysis(domains, tool_enums)
