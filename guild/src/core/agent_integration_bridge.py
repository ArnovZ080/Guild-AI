"""
Agent-Integration Bridge
Enables agents to access integration connectors at runtime for autonomous operations
"""

from typing import Dict, List, Any, Optional
import logging
from datetime import datetime

# Import integration registry
from guild.src.core.integration_capability_registry import (
    integration_registry,
    INTEGRATION_CAPABILITIES,
    get_connected_integrations_summary
)

# Import actual integration connectors
try:
    from guild.src.integrations.accounting import QuickBooksConnector, StripeConnector, XeroConnector
    from guild.src.integrations.social_platforms import LinkedInConnector, TwitterConnector, InstagramConnector
    from guild.src.integrations.email_marketing import MailchimpConnector, ConvertKitConnector
    from guild.src.integrations.analytics import GoogleAnalyticsConnector, MixpanelConnector
    from guild.src.integrations.meta_business_suite import MetaBusinessSuiteConnector
    from guild.src.integrations.ad_platforms import GoogleAdsConnector, TikTokAdsConnector
    INTEGRATIONS_AVAILABLE = True
except ImportError as e:
    logging.warning(f"Some integrations not available: {e}")
    INTEGRATIONS_AVAILABLE = False

logger = logging.getLogger(__name__)


class AgentIntegrationBridge:
    """
    Bridge that allows agents to access integration connectors at runtime.
    Provides secure, tracked access to external platform APIs.
    """
    
    def __init__(self):
        self.active_connectors: Dict[str, Any] = {}
        self.access_log: List[Dict[str, Any]] = []
    
    def get_connector(self, user_id: str, integration_id: str) -> Optional[Any]:
        """
        Get integration connector for an agent to use.
        
        Args:
            user_id: User ID
            integration_id: Integration ID (e.g., 'stripe', 'quickbooks')
            
        Returns:
            Initialized connector instance or None
        """
        try:
            # Check if user has this integration connected
            if not integration_registry.is_integration_connected(user_id, integration_id):
                logger.warning(f"Integration {integration_id} not connected for user {user_id}")
                return None
            
            # Get credentials
            credentials = integration_registry.get_integration_credentials(user_id, integration_id)
            if not credentials:
                logger.error(f"No credentials found for {integration_id}")
                return None
            
            # Create connector cache key
            cache_key = f"{user_id}_{integration_id}"
            
            # Return cached connector if exists
            if cache_key in self.active_connectors:
                return self.active_connectors[cache_key]
            
            # Initialize new connector
            connector = self._initialize_connector(integration_id, credentials)
            if connector:
                self.active_connectors[cache_key] = connector
                
                # Log access
                self.log_access(user_id, integration_id, "connector_initialized")
                
                return connector
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to get connector {integration_id}: {e}")
            return None
    
    def _initialize_connector(self, integration_id: str, credentials: Dict[str, str]) -> Optional[Any]:
        """Initialize integration connector with credentials"""
        if not INTEGRATIONS_AVAILABLE:
            logger.warning("Integrations not available - returning None")
            return None
        
        try:
            # Map integration IDs to connector classes
            connector_map = {
                'quickbooks': QuickBooksConnector,
                'stripe': StripeConnector,
                'xero': XeroConnector,
                'linkedin': LinkedInConnector,
                'twitter': TwitterConnector,
                'instagram': InstagramConnector,
                'mailchimp': MailchimpConnector,
                'convertkit': ConvertKitConnector,
                'google_analytics': GoogleAnalyticsConnector,
                'mixpanel': MixpanelConnector,
                'meta_ads': MetaBusinessSuiteConnector,
                'google_ads': GoogleAdsConnector,
                'tiktok_ads': TikTokAdsConnector,
            }
            
            connector_class = connector_map.get(integration_id)
            if not connector_class:
                logger.warning(f"No connector class found for {integration_id}")
                return None
            
            # Initialize connector with credentials
            connector = connector_class(**credentials)
            logger.info(f"Initialized {integration_id} connector")
            
            return connector
            
        except Exception as e:
            logger.error(f"Failed to initialize {integration_id} connector: {e}")
            return None
    
    def call_integration(self, user_id: str, integration_id: str, method: str, **kwargs) -> Dict[str, Any]:
        """
        Call an integration method and return results.
        
        Args:
            user_id: User ID
            integration_id: Integration ID
            method: Method to call on connector
            **kwargs: Method arguments
            
        Returns:
            Dict with success status and data/error
        """
        try:
            connector = self.get_connector(user_id, integration_id)
            if not connector:
                return {
                    "success": False,
                    "error": f"Integration {integration_id} not available",
                    "fallback_to_mock": True
                }
            
            # Check if method exists
            if not hasattr(connector, method):
                return {
                    "success": False,
                    "error": f"Method {method} not available on {integration_id}",
                    "fallback_to_mock": True
                }
            
            # Call method
            method_func = getattr(connector, method)
            result = method_func(**kwargs)
            
            # Log successful access
            self.log_access(user_id, integration_id, method, kwargs, success=True)
            
            return {
                "success": True,
                "data": result,
                "integration_id": integration_id,
                "method": method,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Integration call failed for {integration_id}.{method}: {e}")
            self.log_access(user_id, integration_id, method, kwargs, success=False, error=str(e))
            
            return {
                "success": False,
                "error": str(e),
                "fallback_to_mock": True,
                "integration_id": integration_id,
                "method": method
            }
    
    def get_data_from_integration(self, user_id: str, integration_id: str, data_type: str, **params) -> Dict[str, Any]:
        """
        Get specific data from an integration.
        
        Examples:
        - get_data_from_integration(user_id, 'stripe', 'revenue', timeframe='30d')
        - get_data_from_integration(user_id, 'quickbooks', 'transactions', start_date='2025-01-01')
        - get_data_from_integration(user_id, 'salesforce', 'leads', status='qualified')
        
        Returns:
            Dict with data or indication to use mock data
        """
        # Map data types to integration methods
        method_map = {
            'stripe': {
                'revenue': 'get_revenue',
                'payments': 'get_payments',
                'customers': 'get_customers'
            },
            'quickbooks': {
                'transactions': 'get_transactions',
                'expenses': 'get_expenses',
                'revenue': 'get_revenue_data'
            },
            'salesforce': {
                'leads': 'get_leads',
                'opportunities': 'get_opportunities',
                'customers': 'get_accounts'
            },
            'google_analytics': {
                'traffic': 'get_traffic_data',
                'conversions': 'get_conversions',
                'behavior': 'get_user_behavior'
            }
        }
        
        if integration_id in method_map and data_type in method_map[integration_id]:
            method = method_map[integration_id][data_type]
            return self.call_integration(user_id, integration_id, method, **params)
        
        return {
            "success": False,
            "error": f"Data type {data_type} not supported for {integration_id}",
            "fallback_to_mock": True
        }
    
    def log_access(self, user_id: str, integration_id: str, action: str, 
                   params: Dict[str, Any] = None, success: bool = True, error: str = None):
        """Log integration access for transparency"""
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "user_id": user_id,
            "integration_id": integration_id,
            "action": action,
            "params": params or {},
            "success": success,
            "error": error
        }
        
        self.access_log.append(log_entry)
        
        # Keep log size manageable (last 1000 entries)
        if len(self.access_log) > 1000:
            self.access_log = self.access_log[-1000:]
    
    def get_access_log(self, user_id: str = None, limit: int = 100) -> List[Dict[str, Any]]:
        """Get integration access log for transparency"""
        logs = self.access_log
        
        if user_id:
            logs = [log for log in logs if log["user_id"] == user_id]
        
        # Return most recent first
        return sorted(logs, key=lambda x: x["timestamp"], reverse=True)[:limit]
    
    def get_available_integrations_for_agent(self, user_id: str, agent_name: str) -> List[str]:
        """
        Get list of integrations available for an agent to use.
        
        Args:
            user_id: User ID
            agent_name: Agent name
            
        Returns:
            List of integration IDs the agent can access
        """
        # Get user's connected integrations
        connected = integration_registry.get_user_integrations(user_id)
        
        # In production, would also check agent permissions here
        # For now, agents can access all user's connected integrations
        
        return connected


# Global bridge instance
agent_integration_bridge = AgentIntegrationBridge()


# Convenience functions for agents to use

def get_integration_data(user_id: str, integration_id: str, data_type: str, **params) -> Dict[str, Any]:
    """
    Convenience function for agents to get data from integrations.
    
    Example usage in an agent:
    ```python
    from guild.src.core.agent_integration_bridge import get_integration_data
    
    # In agent's run method:
    revenue_data = get_integration_data(
        user_id=self.user_id,
        integration_id='stripe',
        data_type='revenue',
        timeframe='30d'
    )
    
    if revenue_data['success']:
        # Use real data
        revenue = revenue_data['data']
    else:
        # Use mock data
        revenue = generate_mock_revenue_data()
    ```
    """
    return agent_integration_bridge.get_data_from_integration(user_id, integration_id, data_type, **params)


def call_integration_action(user_id: str, integration_id: str, action: str, **params) -> Dict[str, Any]:
    """
    Convenience function for agents to perform actions on integrations.
    
    Example usage:
    ```python
    from guild.src.core.agent_integration_bridge import call_integration_action
    
    # In Enhanced Campaign Agent:
    result = call_integration_action(
        user_id=self.user_id,
        integration_id='google_ads',
        action='create_campaign',
        campaign_name='Q4 Growth Campaign',
        budget=5000,
        target_audience={'age': '25-45', 'interests': ['business', 'tech']}
    )
    
    if result['success']:
        # Campaign created successfully
        campaign_id = result['data']['campaign_id']
    else:
        # Log error and use alternative
        logger.error(f"Campaign creation failed: {result['error']}")
    ```
    """
    return agent_integration_bridge.call_integration(user_id, integration_id, action, **params)


def get_available_integrations(user_id: str, agent_name: str = None) -> List[str]:
    """
    Get list of integrations available for use.
    
    Returns list of integration IDs that the agent can access.
    """
    return agent_integration_bridge.get_available_integrations_for_agent(user_id, agent_name or "unknown")


def get_integration_access_log(user_id: str = None) -> List[Dict[str, Any]]:
    """
    Get integration access log for transparency.
    Used to show users what data agents are accessing.
    """
    return agent_integration_bridge.get_access_log(user_id)

