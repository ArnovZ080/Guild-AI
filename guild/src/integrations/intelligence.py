"""
Intelligence & Data Feed Integrations

Comprehensive integration with Yahoo Finance, Alpha Vantage, NewsAPI, 
Reddit, and Google Trends APIs for Competitive Intelligence & Market Trend Agents.
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

class IntelligencePlatform(Enum):
    YAHOO_FINANCE = "yahoo_finance"
    ALPHA_VANTAGE = "alpha_vantage"
    NEWSAPI = "newsapi"
    REDDIT = "reddit"
    GOOGLE_TRENDS = "google_trends"

class DataType(Enum):
    STOCK_PRICE = "stock_price"
    NEWS = "news"
    TRENDS = "trends"
    SOCIAL_SENTIMENT = "social_sentiment"
    MARKET_DATA = "market_data"

@dataclass
class IntelligenceCredentials:
    """Credentials for intelligence platforms"""
    platform: IntelligencePlatform
    api_key: str
    api_secret: Optional[str] = None
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    expires_at: Optional[datetime] = None

@dataclass
class StockData:
    """Standardized stock data format"""
    symbol: str
    price: float
    change: float
    change_percent: float
    volume: int
    market_cap: float
    high_52w: float
    low_52w: float
    pe_ratio: float
    dividend_yield: float
    timestamp: datetime
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}

@dataclass
class NewsArticle:
    """Standardized news article format"""
    id: str
    title: str
    content: str
    summary: str
    source: str
    author: str
    published_at: datetime
    url: str
    sentiment: float  # -1 to 1
    keywords: List[str]
    category: str
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}

@dataclass
class TrendData:
    """Standardized trend data format"""
    keyword: str
    score: float
    region: str
    timeframe: str
    related_queries: List[str]
    rising_queries: List[str]
    timestamp: datetime
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}

class YahooFinanceConnector:
    """Yahoo Finance API connector"""
    
    def __init__(self, credentials: IntelligenceCredentials):
        self.credentials = credentials
        self.base_url = "https://query1.finance.yahoo.com/v8/finance/chart"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, params: Dict = None) -> Dict:
        """Make request to Yahoo Finance API"""
        try:
            url = f"{self.base_url}{endpoint}"
            
            async with self.session.get(url, params=params) as response:
                response.raise_for_status()
                return await response.json()
                
        except Exception as e:
            logger.error(f"Yahoo Finance API request failed: {e}")
            raise
    
    async def get_stock_quote(self, symbol: str) -> StockData:
        """Get current stock quote"""
        endpoint = f"/{symbol}"
        params = {
            'range': '1d',
            'interval': '1m'
        }
        
        response = await self._make_request(endpoint, params=params)
        
        if response.get('chart', {}).get('result'):
            result = response['chart']['result'][0]
            meta = result.get('meta', {})
            quote = result.get('indicators', {}).get('quote', [{}])[0]
            
            current_price = quote.get('close', [0])[-1] if quote.get('close') else meta.get('regularMarketPrice', 0)
            previous_close = meta.get('previousClose', current_price)
            change = current_price - previous_close
            change_percent = (change / previous_close) * 100 if previous_close else 0
            
            stock_data = StockData(
                symbol=symbol,
                price=current_price,
                change=change,
                change_percent=change_percent,
                volume=meta.get('regularMarketVolume', 0),
                market_cap=meta.get('marketCap', 0),
                high_52w=meta.get('fiftyTwoWeekHigh', 0),
                low_52w=meta.get('fiftyTwoWeekLow', 0),
                pe_ratio=meta.get('trailingPE', 0),
                dividend_yield=meta.get('dividendYield', 0),
                timestamp=datetime.now(),
                metadata={"raw_data": response}
            )
            
            return stock_data
        
        raise ValueError(f"No data found for symbol {symbol}")
    
    async def get_historical_data(self, symbol: str, period: str = "1mo") -> List[Dict[str, Any]]:
        """Get historical stock data"""
        endpoint = f"/{symbol}"
        params = {
            'range': period,
            'interval': '1d'
        }
        
        response = await self._make_request(endpoint, params=params)
        
        if response.get('chart', {}).get('result'):
            result = response['chart']['result'][0]
            timestamps = result.get('timestamp', [])
            quote = result.get('indicators', {}).get('quote', [{}])[0]
            
            historical_data = []
            for i, timestamp in enumerate(timestamps):
                data_point = {
                    'date': datetime.fromtimestamp(timestamp),
                    'open': quote.get('open', [0])[i] if i < len(quote.get('open', [])) else 0,
                    'high': quote.get('high', [0])[i] if i < len(quote.get('high', [])) else 0,
                    'low': quote.get('low', [0])[i] if i < len(quote.get('low', [])) else 0,
                    'close': quote.get('close', [0])[i] if i < len(quote.get('close', [])) else 0,
                    'volume': quote.get('volume', [0])[i] if i < len(quote.get('volume', [])) else 0
                }
                historical_data.append(data_point)
            
            return historical_data
        
        return []
    
    async def validate_connection(self) -> bool:
        """Validate Yahoo Finance API connection"""
        try:
            await self.get_stock_quote("AAPL")
            return True
        except Exception as e:
            logger.error(f"Yahoo Finance connection validation failed: {e}")
            return False

class NewsAPIConnector:
    """NewsAPI connector"""
    
    def __init__(self, credentials: IntelligenceCredentials):
        self.credentials = credentials
        self.base_url = "https://newsapi.org/v2"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, params: Dict = None) -> Dict:
        """Make authenticated request to NewsAPI"""
        try:
            url = f"{self.base_url}{endpoint}"
            if params is None:
                params = {}
            params['apiKey'] = self.credentials.api_key
            
            async with self.session.get(url, params=params) as response:
                response.raise_for_status()
                return await response.json()
                
        except Exception as e:
            logger.error(f"NewsAPI request failed: {e}")
            raise
    
    async def get_news(self, 
                      query: str = None,
                      category: str = None,
                      country: str = None,
                      language: str = "en",
                      page_size: int = 100) -> List[NewsArticle]:
        """Get news articles"""
        if query:
            endpoint = "/everything"
            params = {
                'q': query,
                'language': language,
                'pageSize': page_size,
                'sortBy': 'publishedAt'
            }
        else:
            endpoint = "/top-headlines"
            params = {
                'language': language,
                'pageSize': page_size
            }
            if category:
                params['category'] = category
            if country:
                params['country'] = country
        
        response = await self._make_request(endpoint, params=params)
        
        articles = []
        for article_data in response.get('articles', []):
            article = NewsArticle(
                id=hash(article_data.get('url', '')) % 1000000,  # Simple ID generation
                title=article_data.get('title', ''),
                content=article_data.get('content', ''),
                summary=article_data.get('description', ''),
                source=article_data.get('source', {}).get('name', ''),
                author=article_data.get('author', ''),
                published_at=datetime.fromisoformat(article_data['publishedAt'].replace('Z', '+00:00')),
                url=article_data.get('url', ''),
                sentiment=0.0,  # Would need sentiment analysis
                keywords=[],
                category=category or 'general',
                metadata={"raw_data": article_data}
            )
            articles.append(article)
        
        return articles
    
    async def get_sources(self, category: str = None, country: str = None) -> List[Dict[str, Any]]:
        """Get available news sources"""
        endpoint = "/sources"
        params = {}
        
        if category:
            params['category'] = category
        if country:
            params['country'] = country
        
        response = await self._make_request(endpoint, params=params)
        return response.get('sources', [])
    
    async def validate_connection(self) -> bool:
        """Validate NewsAPI connection"""
        try:
            await self.get_news(page_size=1)
            return True
        except Exception as e:
            logger.error(f"NewsAPI connection validation failed: {e}")
            return False

class RedditConnector:
    """Reddit API connector"""
    
    def __init__(self, credentials: IntelligenceCredentials):
        self.credentials = credentials
        self.base_url = "https://oauth.reddit.com"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(self, endpoint: str, params: Dict = None) -> Dict:
        """Make authenticated request to Reddit API"""
        try:
            url = f"{self.base_url}{endpoint}"
            headers = {
                'Authorization': f'Bearer {self.credentials.access_token}',
                'User-Agent': 'Guild-AI/1.0'
            }
            
            async with self.session.get(url, params=params, headers=headers) as response:
                response.raise_for_status()
                return await response.json()
                
        except Exception as e:
            logger.error(f"Reddit API request failed: {e}")
            raise
    
    async def get_subreddit_posts(self, 
                                subreddit: str,
                                sort: str = "hot",
                                limit: int = 100) -> List[Dict[str, Any]]:
        """Get posts from a subreddit"""
        endpoint = f"/r/{subreddit}/{sort}"
        params = {'limit': limit}
        
        response = await self._make_request(endpoint, params=params)
        
        posts = []
        for post_data in response.get('data', {}).get('children', []):
            post = post_data.get('data', {})
            posts.append({
                'id': post.get('id', ''),
                'title': post.get('title', ''),
                'content': post.get('selftext', ''),
                'author': post.get('author', ''),
                'score': post.get('score', 0),
                'upvote_ratio': post.get('upvote_ratio', 0),
                'num_comments': post.get('num_comments', 0),
                'created_utc': datetime.fromtimestamp(post.get('created_utc', 0)),
                'url': post.get('url', ''),
                'subreddit': post.get('subreddit', ''),
                'metadata': {"raw_data": post}
            })
        
        return posts
    
    async def search_subreddits(self, query: str, limit: int = 25) -> List[Dict[str, Any]]:
        """Search for subreddits"""
        endpoint = "/subreddits/search"
        params = {'q': query, 'limit': limit}
        
        response = await self._make_request(endpoint, params=params)
        
        subreddits = []
        for subreddit_data in response.get('data', {}).get('children', []):
            subreddit = subreddit_data.get('data', {})
            subreddits.append({
                'name': subreddit.get('display_name', ''),
                'title': subreddit.get('title', ''),
                'description': subreddit.get('public_description', ''),
                'subscribers': subreddit.get('subscribers', 0),
                'active_users': subreddit.get('accounts_active', 0),
                'metadata': {"raw_data": subreddit}
            })
        
        return subreddits
    
    async def validate_connection(self) -> bool:
        """Validate Reddit API connection"""
        try:
            await self._make_request("/api/v1/me")
            return True
        except Exception as e:
            logger.error(f"Reddit connection validation failed: {e}")
            return False

class IntelligenceManager:
    """Manager for multiple intelligence platform integrations"""
    
    def __init__(self):
        self.connectors: Dict[IntelligencePlatform, Any] = {}
    
    def add_platform(self, platform: IntelligencePlatform, credentials: IntelligenceCredentials):
        """Add an intelligence platform connector"""
        if platform == IntelligencePlatform.YAHOO_FINANCE:
            self.connectors[platform] = YahooFinanceConnector(credentials)
        elif platform == IntelligencePlatform.NEWSAPI:
            self.connectors[platform] = NewsAPIConnector(credentials)
        elif platform == IntelligencePlatform.REDDIT:
            self.connectors[platform] = RedditConnector(credentials)
        
        logger.info(f"Added {platform.value} connector")
    
    async def get_market_intelligence(self, 
                                    symbols: List[str],
                                    keywords: List[str],
                                    platforms: List[IntelligencePlatform]) -> Dict[str, Any]:
        """Get comprehensive market intelligence"""
        results = {
            'stock_data': {},
            'news_data': {},
            'social_sentiment': {},
            'timestamp': datetime.now()
        }
        
        for platform in platforms:
            if platform in self.connectors:
                try:
                    connector = self.connectors[platform]
                    
                    async with connector:
                        if platform == IntelligencePlatform.YAHOO_FINANCE:
                            stock_data = {}
                            for symbol in symbols:
                                try:
                                    stock_info = await connector.get_stock_quote(symbol)
                                    stock_data[symbol] = stock_info
                                except Exception as e:
                                    logger.error(f"Error getting stock data for {symbol}: {e}")
                            results['stock_data'][platform.value] = stock_data
                        
                        elif platform == IntelligencePlatform.NEWSAPI:
                            news_data = {}
                            for keyword in keywords:
                                try:
                                    articles = await connector.get_news(query=keyword, page_size=20)
                                    news_data[keyword] = articles
                                except Exception as e:
                                    logger.error(f"Error getting news for {keyword}: {e}")
                            results['news_data'][platform.value] = news_data
                        
                        elif platform == IntelligencePlatform.REDDIT:
                            social_data = {}
                            for keyword in keywords:
                                try:
                                    # Search for subreddits related to the keyword
                                    subreddits = await connector.search_subreddits(keyword, limit=5)
                                    posts = []
                                    for subreddit in subreddits[:3]:  # Top 3 subreddits
                                        sub_posts = await connector.get_subreddit_posts(subreddit['name'], limit=10)
                                        posts.extend(sub_posts)
                                    social_data[keyword] = posts
                                except Exception as e:
                                    logger.error(f"Error getting Reddit data for {keyword}: {e}")
                            results['social_sentiment'][platform.value] = social_data
                            
                except Exception as e:
                    logger.error(f"Error getting intelligence from {platform.value}: {e}")
        
        return results
    
    async def get_trend_analysis(self, 
                               keywords: List[str],
                               platforms: List[IntelligencePlatform]) -> Dict[str, Any]:
        """Get trend analysis across multiple platforms"""
        results = {
            'trends': {},
            'news_trends': {},
            'social_trends': {},
            'timestamp': datetime.now()
        }
        
        for platform in platforms:
            if platform in self.connectors:
                try:
                    connector = self.connectors[platform]
                    
                    async with connector:
                        if platform == IntelligencePlatform.NEWSAPI:
                            news_trends = {}
                            for keyword in keywords:
                                articles = await connector.get_news(query=keyword, page_size=50)
                                # Analyze trends based on publication dates
                                recent_count = len([a for a in articles if (datetime.now() - a.published_at).days <= 7])
                                news_trends[keyword] = {
                                    'total_articles': len(articles),
                                    'recent_articles': recent_count,
                                    'trend_score': recent_count / len(articles) if articles else 0
                                }
                            results['news_trends'][platform.value] = news_trends
                        
                        elif platform == IntelligencePlatform.REDDIT:
                            social_trends = {}
                            for keyword in keywords:
                                posts = await connector.get_subreddit_posts(keyword, limit=100)
                                # Analyze engagement trends
                                total_score = sum(post['score'] for post in posts)
                                avg_score = total_score / len(posts) if posts else 0
                                social_trends[keyword] = {
                                    'total_posts': len(posts),
                                    'total_score': total_score,
                                    'avg_score': avg_score,
                                    'engagement_score': avg_score / 100  # Normalize
                                }
                            results['social_trends'][platform.value] = social_trends
                            
                except Exception as e:
                    logger.error(f"Error getting trend analysis from {platform.value}: {e}")
        
        return results
    
    async def validate_all_connections(self) -> Dict[IntelligencePlatform, bool]:
        """Validate connections to all intelligence platforms"""
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

# Global intelligence manager
intelligence_manager = IntelligenceManager()

# Convenience functions
def add_intelligence_credentials(platform: str, 
                                api_key: str,
                                access_token: str = None,
                                api_secret: str = None):
    """Add intelligence platform credentials"""
    credentials = IntelligenceCredentials(
        platform=IntelligencePlatform(platform),
        api_key=api_key,
        access_token=access_token,
        api_secret=api_secret
    )
    intelligence_manager.add_platform(credentials.platform, credentials)

async def get_market_intelligence(symbols: List[str], keywords: List[str], platforms: List[str]):
    """Get market intelligence from multiple platforms"""
    platform_enums = [IntelligencePlatform(platform) for platform in platforms]
    return await intelligence_manager.get_market_intelligence(symbols, keywords, platform_enums)

async def get_trend_analysis(keywords: List[str], platforms: List[str]):
    """Get trend analysis from multiple platforms"""
    platform_enums = [IntelligencePlatform(platform) for platform in platforms]
    return await intelligence_manager.get_trend_analysis(keywords, platform_enums)
