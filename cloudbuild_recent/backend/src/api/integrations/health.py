"""
Integration Health API
Provides real-time integration status and health monitoring endpoints.
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, List, Optional
from datetime import datetime
from pydantic import BaseModel

# Import the health monitor
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent.parent.parent.parent))

from guild.src.core.integration_health_monitor import (
    integration_health_monitor,
    get_user_integration_status,
    check_integration_health,
    get_available_integrations_summary,
    get_connected_data_sources,
    get_available_integration_actions,
    IntegrationHealth,
    IntegrationStatus
)

router = APIRouter()


class IntegrationHealthResponse(BaseModel):
    """Response model for integration health"""
    integration_id: str
    integration_name: str
    status: str
    last_sync: Optional[datetime]
    last_error: Optional[str]
    credentials_valid: bool
    data_available: bool
    last_health_check: datetime
    connection_quality: str
    uptime_percentage: float
    total_api_calls: int
    failed_api_calls: int
    average_response_time: float


class UserIntegrationStatusResponse(BaseModel):
    """Response model for user's integration status"""
    user_id: str
    integrations: Dict[str, IntegrationHealthResponse]
    total_integrations: int
    connected_count: int
    disconnected_count: int
    error_count: int


class IntegrationSummaryResponse(BaseModel):
    """Response model for integration summary"""
    user_id: str
    total_available: int
    total_connected: int
    connected: List[str]
    disconnected: List[str]
    error: List[str]
    available_data_sources: List[str]
    available_actions: List[str]
    connection_percentage: float
    last_updated: str


@router.get("/health/{user_id}", response_model=UserIntegrationStatusResponse)
async def get_integration_health_status(user_id: str):
    """
    Get health status of all integrations for a user.
    
    Returns connection status, data availability, and health metrics
    for each integration the user has access to.
    """
    try:
        # Get integration status from health monitor
        status = await get_user_integration_status(user_id)
        
        # Convert to response format
        integrations_response = {}
        connected_count = 0
        disconnected_count = 0
        error_count = 0
        
        for integration_id, health in status.items():
            # Convert IntegrationHealth to response model
            integrations_response[integration_id] = IntegrationHealthResponse(
                integration_id=health.integration_id,
                integration_name=health.integration_name,
                status=health.status.value,
                last_sync=health.last_sync,
                last_error=health.last_error,
                credentials_valid=health.credentials_valid,
                data_available=health.data_available,
                last_health_check=health.last_health_check,
                connection_quality=health.connection_quality,
                uptime_percentage=health.uptime_percentage,
                total_api_calls=health.total_api_calls,
                failed_api_calls=health.failed_api_calls,
                average_response_time=health.average_response_time
            )
            
            # Count statuses
            if health.status == IntegrationStatus.CONNECTED:
                connected_count += 1
            elif health.status == IntegrationStatus.DISCONNECTED:
                disconnected_count += 1
            elif health.status == IntegrationStatus.ERROR:
                error_count += 1
        
        return UserIntegrationStatusResponse(
            user_id=user_id,
            integrations=integrations_response,
            total_integrations=len(integrations_response),
            connected_count=connected_count,
            disconnected_count=disconnected_count,
            error_count=error_count
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get integration health: {str(e)}")


@router.get("/health/{user_id}/{integration_id}", response_model=IntegrationHealthResponse)
async def get_specific_integration_health(user_id: str, integration_id: str):
    """
    Get health status of a specific integration for a user.
    
    Provides detailed health metrics including connection quality,
    uptime percentage, and API call statistics.
    """
    try:
        health = await check_integration_health(user_id, integration_id)
        
        return IntegrationHealthResponse(
            integration_id=health.integration_id,
            integration_name=health.integration_name,
            status=health.status.value,
            last_sync=health.last_sync,
            last_error=health.last_error,
            credentials_valid=health.credentials_valid,
            data_available=health.data_available,
            last_health_check=health.last_health_check,
            connection_quality=health.connection_quality,
            uptime_percentage=health.uptime_percentage,
            total_api_calls=health.total_api_calls,
            failed_api_calls=health.failed_api_calls,
            average_response_time=health.average_response_time
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get integration health: {str(e)}")


@router.get("/summary/{user_id}", response_model=IntegrationSummaryResponse)
async def get_integration_summary(user_id: str):
    """
    Get comprehensive integration summary for a user.
    
    Provides overview of connected/disconnected integrations,
    available data sources, and available actions.
    """
    try:
        summary = await get_available_integrations_summary(user_id)
        
        return IntegrationSummaryResponse(**summary)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get integration summary: {str(e)}")


@router.get("/data-sources/{user_id}")
async def get_user_data_sources(user_id: str):
    """
    Get list of available data sources from user's connected integrations.
    
    Returns data types that can be accessed through connected integrations.
    """
    try:
        data_sources = await get_connected_data_sources(user_id)
        
        return {
            "user_id": user_id,
            "data_sources": data_sources,
            "count": len(data_sources)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get data sources: {str(e)}")


@router.get("/actions/{user_id}")
async def get_user_available_actions(user_id: str):
    """
    Get list of available actions from user's connected integrations.
    
    Returns actions that can be performed through connected integrations.
    """
    try:
        actions = await get_available_integration_actions(user_id)
        
        return {
            "user_id": user_id,
            "actions": actions,
            "count": len(actions)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get available actions: {str(e)}")


@router.post("/refresh/{user_id}")
async def refresh_integration_status(user_id: str):
    """
    Force refresh of integration health status for a user.
    
    Triggers immediate health check of all user's integrations.
    """
    try:
        # Reinitialize user status (forces fresh health checks)
        await integration_health_monitor._initialize_user_status(user_id)
        
        # Get updated status
        summary = await get_available_integrations_summary(user_id)
        
        return {
            "success": True,
            "message": "Integration status refreshed",
            "summary": summary
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to refresh integration status: {str(e)}")


@router.get("/connection-quality/{user_id}")
async def get_connection_quality_report(user_id: str):
    """
    Get detailed connection quality report for user's integrations.
    
    Provides quality metrics and recommendations for improvement.
    """
    try:
        status = await get_user_integration_status(user_id)
        
        quality_report = {
            "excellent": [],
            "good": [],
            "fair": [],
            "poor": [],
            "unavailable": []
        }
        
        for integration_id, health in status.items():
            quality_report[health.connection_quality].append({
                "integration_id": integration_id,
                "integration_name": health.integration_name,
                "uptime_percentage": health.uptime_percentage,
                "average_response_time": health.average_response_time,
                "failed_api_calls": health.failed_api_calls,
                "total_api_calls": health.total_api_calls
            })
        
        return {
            "user_id": user_id,
            "quality_distribution": {
                quality: len(integrations)
                for quality, integrations in quality_report.items()
            },
            "details": quality_report,
            "overall_health_score": _calculate_overall_health_score(quality_report)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get connection quality report: {str(e)}")


def _calculate_overall_health_score(quality_report: Dict) -> float:
    """Calculate overall health score from quality distribution"""
    quality_weights = {
        "excellent": 1.0,
        "good": 0.8,
        "fair": 0.6,
        "poor": 0.3,
        "unavailable": 0.0
    }
    
    total_integrations = sum(len(integrations) for integrations in quality_report.values())
    
    if total_integrations == 0:
        return 0.0
    
    weighted_score = sum(
        len(integrations) * quality_weights[quality]
        for quality, integrations in quality_report.items()
    )
    
    return round((weighted_score / total_integrations) * 100, 2)


# Include router in main API
def setup_integration_health_routes(app):
    """Setup integration health routes in FastAPI app"""
    app.include_router(router, prefix="/api/integrations", tags=["integrations"])

