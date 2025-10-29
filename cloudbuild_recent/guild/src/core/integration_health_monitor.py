"""
Integration Health Monitor
Tracks which integrations are connected and functioning for each user.
Enables data-grounded decision making and graceful fallback to mock data.
"""

import asyncio
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from enum import Enum

from guild.src.core.complete_integration_registry import (
    INTEGRATION_CAPABILITIES,
    get_all_integration_ids,
    get_integration_by_id
)

logger = logging.getLogger(__name__)


class IntegrationStatus(Enum):
    """Integration connection status"""
    CONNECTED = "connected"
    DISCONNECTED = "disconnected"
    ERROR = "error"
    EXPIRED = "expired"
    UNKNOWN = "unknown"


@dataclass
class IntegrationHealth:
    """Health status of an integration"""
    integration_id: str
    integration_name: str
    status: IntegrationStatus
    last_sync: Optional[datetime]
    last_error: Optional[str]
    credentials_valid: bool
    data_available: bool
    last_health_check: datetime
    connection_quality: str  # "excellent", "good", "poor", "unavailable"
    uptime_percentage: float
    total_api_calls: int
    failed_api_calls: int
    average_response_time: float  # milliseconds


class IntegrationHealthMonitor:
    """
    Monitors health and connectivity of all user integrations.
    Provides real-time status for data grounding decisions.
    """
    
    def __init__(self):
        self.user_integration_status: Dict[str, Dict[str, IntegrationHealth]] = {}
        self.monitoring_interval = 300  # 5 minutes
        self.monitoring_active = False
    
    async def start_monitoring(self):
        """Start background monitoring of integrations"""
        self.monitoring_active = True
        logger.info("Integration health monitoring started")
        
        while self.monitoring_active:
            try:
                await self._monitor_all_users()
                await asyncio.sleep(self.monitoring_interval)
            except Exception as e:
                logger.error(f"Error in monitoring loop: {e}")
                await asyncio.sleep(self.monitoring_interval)
    
    async def stop_monitoring(self):
        """Stop background monitoring"""
        self.monitoring_active = False
        logger.info("Integration health monitoring stopped")
    
    async def check_integration_health(self, user_id: str, integration_id: str) -> IntegrationHealth:
        """
        Check health of specific integration for a user.
        
        Args:
            user_id: User identifier
            integration_id: Integration identifier
            
        Returns:
            IntegrationHealth object with current status
        """
        try:
            # Get integration capability
            capability = get_integration_by_id(integration_id)
            if not capability:
                return self._create_unknown_health(integration_id)
            
            # Check if user has this integration connected
            # This would query the database for user's connected integrations
            is_connected = await self._check_user_integration_connection(user_id, integration_id)
            
            if not is_connected:
                return IntegrationHealth(
                    integration_id=integration_id,
                    integration_name=capability.integration_name,
                    status=IntegrationStatus.DISCONNECTED,
                    last_sync=None,
                    last_error=None,
                    credentials_valid=False,
                    data_available=False,
                    last_health_check=datetime.now(),
                    connection_quality="unavailable",
                    uptime_percentage=0.0,
                    total_api_calls=0,
                    failed_api_calls=0,
                    average_response_time=0.0
                )
            
            # Test integration health
            health_check_result = await self._test_integration_connection(user_id, integration_id)
            
            # Determine connection quality
            connection_quality = self._calculate_connection_quality(health_check_result)
            
            return IntegrationHealth(
                integration_id=integration_id,
                integration_name=capability.integration_name,
                status=IntegrationStatus.CONNECTED if health_check_result['success'] else IntegrationStatus.ERROR,
                last_sync=health_check_result.get('last_sync'),
                last_error=health_check_result.get('error'),
                credentials_valid=health_check_result.get('credentials_valid', False),
                data_available=health_check_result.get('data_available', False),
                last_health_check=datetime.now(),
                connection_quality=connection_quality,
                uptime_percentage=health_check_result.get('uptime_percentage', 0.0),
                total_api_calls=health_check_result.get('total_api_calls', 0),
                failed_api_calls=health_check_result.get('failed_api_calls', 0),
                average_response_time=health_check_result.get('average_response_time', 0.0)
            )
            
        except Exception as e:
            logger.error(f"Error checking integration health: {e}")
            return self._create_error_health(integration_id, str(e))
    
    async def get_user_integration_status(self, user_id: str) -> Dict[str, IntegrationHealth]:
        """
        Get health status of all integrations for a user.
        
        Returns:
            Dictionary mapping integration_id to IntegrationHealth
        """
        if user_id not in self.user_integration_status:
            # Initialize status for user
            await self._initialize_user_status(user_id)
        
        return self.user_integration_status.get(user_id, {})
    
    async def get_connected_integrations(self, user_id: str) -> List[str]:
        """Get list of connected integration IDs for user"""
        status = await self.get_user_integration_status(user_id)
        return [
            int_id for int_id, health in status.items()
            if health.status == IntegrationStatus.CONNECTED
        ]
    
    async def get_available_integrations(self, user_id: str) -> Dict[str, Any]:
        """
        Get comprehensive integration availability summary for user.
        Used by orchestrator to understand what data sources are available.
        """
        status = await self.get_user_integration_status(user_id)
        
        connected = [int_id for int_id, health in status.items() if health.status == IntegrationStatus.CONNECTED]
        disconnected = [int_id for int_id, health in status.items() if health.status == IntegrationStatus.DISCONNECTED]
        error = [int_id for int_id, health in status.items() if health.status == IntegrationStatus.ERROR]
        
        # Get data sources available
        available_data_sources = []
        for int_id in connected:
            capability = get_integration_by_id(int_id)
            if capability:
                available_data_sources.extend(capability.data_provides)
        
        # Get actions available
        available_actions = []
        for int_id in connected:
            capability = get_integration_by_id(int_id)
            if capability:
                available_actions.extend([f"{int_id}_{action}" for action in capability.actions_available])
        
        return {
            "user_id": user_id,
            "total_available": len(INTEGRATION_CAPABILITIES),
            "total_connected": len(connected),
            "connected": connected,
            "disconnected": disconnected,
            "error": error,
            "available_data_sources": list(set(available_data_sources)),
            "available_actions": list(set(available_actions)),
            "connection_percentage": (len(connected) / len(INTEGRATION_CAPABILITIES) * 100) if INTEGRATION_CAPABILITIES else 0,
            "last_updated": datetime.now().isoformat()
        }
    
    def should_use_real_data(self, user_id: str, integration_id: str) -> bool:
        """
        Determine if real data should be used for an integration.
        Returns True if integration is connected and healthy, False for fallback to mock data.
        """
        if user_id not in self.user_integration_status:
            return False
        
        if integration_id not in self.user_integration_status[user_id]:
            return False
        
        health = self.user_integration_status[user_id][integration_id]
        return (
            health.status == IntegrationStatus.CONNECTED and
            health.credentials_valid and
            health.data_available
        )
    
    async def _initialize_user_status(self, user_id: str):
        """Initialize integration status for a user"""
        self.user_integration_status[user_id] = {}
        
        # Check health of all integrations for user
        for integration_id in get_all_integration_ids():
            health = await self.check_integration_health(user_id, integration_id)
            self.user_integration_status[user_id][integration_id] = health
    
    async def _check_user_integration_connection(self, user_id: str, integration_id: str) -> bool:
        """
        Check if user has connected a specific integration.
        This would query the database for user's OAuth credentials/API keys.
        """
        # TODO: Implement database query
        # For now, return False (disconnected) to default to mock data
        # In production, this would check the user_integrations table
        
        # Temporary logic: check if integration is in common platforms
        # This is placeholder - real implementation would query database
        common_platforms = ['stripe', 'quickbooks', 'google_analytics', 'hubspot', 'salesforce']
        
        # For demo purposes, assume some common platforms might be connected
        # Real implementation: return await db_service.check_user_integration(user_id, integration_id)
        return False  # Default to disconnected until database integration complete
    
    async def _test_integration_connection(self, user_id: str, integration_id: str) -> Dict[str, Any]:
        """
        Test actual API connection to integration.
        Makes a lightweight API call to verify connectivity.
        """
        # This would make actual API calls to test connectivity
        # For now, return mock data
        # TODO: Implement real API health checks
        
        return {
            'success': False,  # Default to unsuccessful
            'last_sync': None,
            'error': 'Integration not connected - using demo data',
            'credentials_valid': False,
            'data_available': False,
            'uptime_percentage': 0.0,
            'total_api_calls': 0,
            'failed_api_calls': 0,
            'average_response_time': 0.0
        }
    
    async def _monitor_all_users(self):
        """Background task to monitor all users' integrations"""
        # Would iterate through active users and check their integrations
        # TODO: Implement when user management is in place
        pass
    
    def _calculate_connection_quality(self, health_check_result: Dict[str, Any]) -> str:
        """Calculate connection quality rating"""
        if not health_check_result['success']:
            return "unavailable"
        
        uptime = health_check_result.get('uptime_percentage', 0)
        failed_rate = health_check_result.get('failed_api_calls', 0) / max(health_check_result.get('total_api_calls', 1), 1)
        
        if uptime >= 99 and failed_rate < 0.01:
            return "excellent"
        elif uptime >= 95 and failed_rate < 0.05:
            return "good"
        elif uptime >= 90:
            return "fair"
        else:
            return "poor"
    
    def _create_unknown_health(self, integration_id: str) -> IntegrationHealth:
        """Create health object for unknown integration"""
        return IntegrationHealth(
            integration_id=integration_id,
            integration_name=integration_id.title(),
            status=IntegrationStatus.UNKNOWN,
            last_sync=None,
            last_error="Integration not found in registry",
            credentials_valid=False,
            data_available=False,
            last_health_check=datetime.now(),
            connection_quality="unavailable",
            uptime_percentage=0.0,
            total_api_calls=0,
            failed_api_calls=0,
            average_response_time=0.0
        )
    
    def _create_error_health(self, integration_id: str, error: str) -> IntegrationHealth:
        """Create health object for integration with error"""
        return IntegrationHealth(
            integration_id=integration_id,
            integration_name=integration_id.title(),
            status=IntegrationStatus.ERROR,
            last_sync=None,
            last_error=error,
            credentials_valid=False,
            data_available=False,
            last_health_check=datetime.now(),
            connection_quality="unavailable",
            uptime_percentage=0.0,
            total_api_calls=0,
            failed_api_calls=0,
            average_response_time=0.0
        )


# Global health monitor instance
integration_health_monitor = IntegrationHealthMonitor()


# Convenience functions

async def start_health_monitoring():
    """Start integration health monitoring"""
    await integration_health_monitor.start_monitoring()


async def stop_health_monitoring():
    """Stop integration health monitoring"""
    await integration_health_monitor.stop_monitoring()


async def get_user_integration_status(user_id: str) -> Dict[str, IntegrationHealth]:
    """Get integration status for a user"""
    return await integration_health_monitor.get_user_integration_status(user_id)


async def check_integration_health(user_id: str, integration_id: str) -> IntegrationHealth:
    """Check health of specific integration"""
    return await integration_health_monitor.check_integration_health(user_id, integration_id)


def should_use_real_data(user_id: str, integration_id: str) -> bool:
    """Determine if real data should be used"""
    return integration_health_monitor.should_use_real_data(user_id, integration_id)


async def get_available_integrations_summary(user_id: str) -> Dict[str, Any]:
    """Get comprehensive integration availability summary"""
    return await integration_health_monitor.get_available_integrations(user_id)


async def get_connected_data_sources(user_id: str) -> List[str]:
    """Get list of available data sources from connected integrations"""
    summary = await get_available_integrations_summary(user_id)
    return summary.get('available_data_sources', [])


async def get_available_integration_actions(user_id: str) -> List[str]:
    """Get list of available actions from connected integrations"""
    summary = await get_available_integrations_summary(user_id)
    return summary.get('available_actions', [])


# Data grounding helper functions

async def get_integration_data(
    user_id: str,
    integration_id: str,
    data_type: str,
    parameters: Dict[str, Any] = None
) -> Dict[str, Any]:
    """
    Get data from integration with automatic fallback to mock data.
    
    Args:
        user_id: User identifier
        integration_id: Integration identifier (e.g., 'stripe', 'quickbooks')
        data_type: Type of data to retrieve (e.g., 'revenue', 'transactions')
        parameters: Additional parameters for data retrieval
        
    Returns:
        Dict with 'success', 'data', 'source' ('real' or 'mock'), and 'integration_name'
    """
    # Check if integration is available
    health = await check_integration_health(user_id, integration_id)
    
    if health.status == IntegrationStatus.CONNECTED and health.data_available:
        # Use real data from integration
        try:
            # TODO: Implement actual integration data fetching
            # real_data = await fetch_from_integration(user_id, integration_id, data_type, parameters)
            
            logger.info(f"Using real data from {integration_id} for user {user_id}")
            
            return {
                'success': True,
                'data': {},  # Would contain real data
                'source': 'real',
                'integration_name': health.integration_name,
                'message': f"Real-time data from {health.integration_name}"
            }
        except Exception as e:
            logger.warning(f"Failed to fetch real data from {integration_id}: {e}")
            # Fall through to mock data
    
    # Use mock data as fallback
    logger.info(f"Using mock data for {integration_id} (integration not connected)")
    
    mock_data = await _generate_mock_data(data_type, parameters)
    
    return {
        'success': True,
        'data': mock_data,
        'source': 'mock',
        'integration_name': health.integration_name if health else integration_id.title(),
        'message': f"Demo data - Connect {health.integration_name if health else integration_id} for real insights",
        'fallback_reason': 'integration_not_connected'
    }


async def call_integration_action(
    user_id: str,
    integration_id: str,
    action: str,
    parameters: Dict[str, Any] = None
) -> Dict[str, Any]:
    """
    Call an action on an integration with automatic availability checking.
    
    Args:
        user_id: User identifier
        integration_id: Integration identifier
        action: Action to perform
        parameters: Action parameters
        
    Returns:
        Dict with 'success', 'result', and 'message'
    """
    # Check if integration is available
    health = await check_integration_health(user_id, integration_id)
    
    if health.status != IntegrationStatus.CONNECTED:
        return {
            'success': False,
            'error': f"{health.integration_name} is not connected",
            'message': f"Please connect {health.integration_name} to use this feature",
            'requires_setup': True,
            'integration_id': integration_id
        }
    
    try:
        # TODO: Implement actual integration action calls
        # result = await execute_integration_action(user_id, integration_id, action, parameters)
        
        logger.info(f"Executing action {action} on {integration_id} for user {user_id}")
        
        return {
            'success': True,
            'result': {},  # Would contain action result
            'message': f"Action {action} executed successfully on {health.integration_name}"
        }
    except Exception as e:
        logger.error(f"Failed to execute action on {integration_id}: {e}")
        return {
            'success': False,
            'error': str(e),
            'message': f"Failed to execute action on {health.integration_name}"
        }


async def _generate_mock_data(data_type: str, parameters: Dict[str, Any] = None) -> Dict[str, Any]:
    """Generate appropriate mock data based on data type"""
    # Generate realistic mock data for demos and testing
    mock_data_generators = {
        'revenue': lambda: {
            'total_revenue': 150000.0,
            'growth_rate': 20.5,
            'period': 'last_30_days',
            'currency': 'USD'
        },
        'transactions': lambda: {
            'count': 547,
            'total_amount': 125000.0,
            'categories': ['income', 'expenses', 'transfers']
        },
        'customers': lambda: {
            'total': 1250,
            'active': 1100,
            'new_this_month': 85
        },
        'traffic': lambda: {
            'pageviews': 15000,
            'unique_visitors': 8500,
            'bounce_rate': 42.5
        }
    }
    
    generator = mock_data_generators.get(data_type, lambda: {})
    return generator()


# Initialize global monitor
async def initialize_health_monitor():
    """Initialize the integration health monitor"""
    await start_health_monitoring()


async def shutdown_health_monitor():
    """Shutdown the integration health monitor"""
    await stop_health_monitoring()

