"""
Facebook Marketing API Connector
Handles Facebook Pages, Ads, and Business Manager integration
"""

import requests
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from ..core.schemas import DataRoom, DocumentMeta
from ..core.storage import Connector

logger = logging.getLogger(__name__)

class FacebookConnector(Connector):
    provider: str = "facebook"
    
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
        """Make authenticated request to Facebook Graph API"""
        try:
            url = f"{self.base_url}/{endpoint}"
            response = self.session.request(method, url, json=data)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Facebook API request failed: {e}")
            raise
    
    def get_pages(self) -> List[Dict]:
        """Get all Facebook pages for the user"""
        try:
            response = self._make_request("me/accounts")
            return response.get('data', [])
        except Exception as e:
            logger.error(f"Failed to fetch Facebook pages: {e}")
            return []
    
    def get_page_insights(self, page_id: str, metrics: List[str] = None) -> Dict:
        """Get insights for a specific page"""
        if not metrics:
            metrics = ['page_impressions', 'page_reach', 'page_engaged_users', 'page_post_engagements']
        
        try:
            endpoint = f"{page_id}/insights"
            params = {
                'metric': ','.join(metrics),
                'period': 'day',
                'since': (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d'),
                'until': datetime.now().strftime('%Y-%m-%d')
            }
            
            response = self._make_request(endpoint, params=params)
            return response
        except Exception as e:
            logger.error(f"Failed to fetch page insights: {e}")
            return {}
    
    def create_post(self, page_id: str, message: str, link: str = None, image_url: str = None) -> Dict:
        """Create a post on a Facebook page"""
        try:
            endpoint = f"{page_id}/feed"
            data = {'message': message}
            
            if link:
                data['link'] = link
            if image_url:
                data['picture'] = image_url
            
            response = self._make_request(endpoint, method='POST', data=data)
            return response
        except Exception as e:
            logger.error(f"Failed to create Facebook post: {e}")
            return {}
    
    def get_ad_accounts(self) -> List[Dict]:
        """Get all ad accounts for the user"""
        try:
            response = self._make_request("me/adaccounts")
            return response.get('data', [])
        except Exception as e:
            logger.error(f"Failed to fetch ad accounts: {e}")
            return []
    
    def get_campaigns(self, ad_account_id: str) -> List[Dict]:
        """Get campaigns for an ad account"""
        try:
            endpoint = f"act_{ad_account_id}/campaigns"
            response = self._make_request(endpoint)
            return response.get('data', [])
        except Exception as e:
            logger.error(f"Failed to fetch campaigns: {e}")
            return []
    
    def create_campaign(self, ad_account_id: str, name: str, objective: str, 
                       daily_budget: int, status: str = 'PAUSED') -> Dict:
        """Create a new ad campaign"""
        try:
            endpoint = f"act_{ad_account_id}/campaigns"
            data = {
                'name': name,
                'objective': objective,
                'daily_budget': daily_budget,
                'status': status
            }
            
            response = self._make_request(endpoint, method='POST', data=data)
            return response
        except Exception as e:
            logger.error(f"Failed to create campaign: {e}")
            return {}
    
    def get_audiences(self, ad_account_id: str) -> List[Dict]:
        """Get custom audiences for an ad account"""
        try:
            endpoint = f"act_{ad_account_id}/customaudiences"
            response = self._make_request(endpoint)
            return response.get('data', [])
        except Exception as e:
            logger.error(f"Failed to fetch audiences: {e}")
            return []
    
    def create_custom_audience(self, ad_account_id: str, name: str, 
                              description: str, subtype: str = 'CUSTOM') -> Dict:
        """Create a custom audience"""
        try:
            endpoint = f"act_{ad_account_id}/customaudiences"
            data = {
                'name': name,
                'description': description,
                'subtype': subtype
            }
            
            response = self._make_request(endpoint, method='POST', data=data)
            return response
        except Exception as e:
            logger.error(f"Failed to create custom audience: {e}")
            return {}
    
    def get_lead_forms(self, page_id: str) -> List[Dict]:
        """Get lead forms for a page"""
        try:
            endpoint = f"{page_id}/leadgen_forms"
            response = self._make_request(endpoint)
            return response.get('data', [])
        except Exception as e:
            logger.error(f"Failed to fetch lead forms: {e}")
            return []
    
    def create_lead_form(self, page_id: str, name: str, questions: List[Dict]) -> Dict:
        """Create a lead generation form"""
        try:
            endpoint = f"{page_id}/leadgen_forms"
            data = {
                'name': name,
                'questions': questions,
                'privacy_policy_url': 'https://example.com/privacy',
                'completion_message': 'Thank you for your interest!'
            }
            
            response = self._make_request(endpoint, method='POST', data=data)
            return response
        except Exception as e:
            logger.error(f"Failed to create lead form: {e}")
            return {}
    
    def get_lead_data(self, form_id: str) -> List[Dict]:
        """Get leads from a lead form"""
        try:
            endpoint = f"{form_id}/leads"
            response = self._make_request(endpoint)
            return response.get('data', [])
        except Exception as e:
            logger.error(f"Failed to fetch lead data: {e}")
            return []
    
    def list_documents(self, data_room: DataRoom) -> List[DocumentMeta]:
        """List Facebook-related documents (posts, campaigns, insights)"""
        documents = []
        
        try:
            # Get pages
            pages = self.get_pages()
            for page in pages:
                documents.append(DocumentMeta(
                    id=f"facebook_page_{page['id']}",
                    title=f"Facebook Page: {page['name']}",
                    source=f"facebook://page/{page['id']}",
                    provider=self.provider,
                    created_at=datetime.now(),
                    metadata={
                        'type': 'page',
                        'page_id': page['id'],
                        'name': page['name'],
                        'access_token': page.get('access_token')
                    }
                ))
            
            # Get ad accounts
            ad_accounts = self.get_ad_accounts()
            for account in ad_accounts:
                documents.append(DocumentMeta(
                    id=f"facebook_adaccount_{account['id']}",
                    title=f"Ad Account: {account['name']}",
                    source=f"facebook://adaccount/{account['id']}",
                    provider=self.provider,
                    created_at=datetime.now(),
                    metadata={
                        'type': 'ad_account',
                        'account_id': account['id'],
                        'name': account['name'],
                        'currency': account.get('currency')
                    }
                ))
                
        except Exception as e:
            logger.error(f"Failed to list Facebook documents: {e}")
        
        return documents
    
    def fetch_content(self, doc: DocumentMeta) -> str:
        """Fetch content for a specific Facebook document"""
        try:
            doc_type = doc.metadata.get('type')
            
            if doc_type == 'page':
                page_id = doc.metadata['page_id']
                insights = self.get_page_insights(page_id)
                return f"Facebook Page Insights for {doc.metadata['name']}:\n{insights}"
            
            elif doc_type == 'ad_account':
                account_id = doc.metadata['account_id']
                campaigns = self.get_campaigns(account_id)
                return f"Ad Account Campaigns for {doc.metadata['name']}:\n{campaigns}"
            
            return ""
            
        except Exception as e:
            logger.error(f"Failed to fetch Facebook content: {e}")
            return ""
    
    def validate_connection(self) -> bool:
        """Validate the Facebook API connection"""
        try:
            response = self._make_request("me")
            return 'id' in response
        except Exception as e:
            logger.error(f"Facebook connection validation failed: {e}")
            return False
