"""
Inter-Agent Communication API
Provides REST endpoints for managing inter-agent communication and coordination.
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
from datetime import datetime
import asyncio
import logging

from guild.src.core.inter_agent_communication import (
    get_communication_hub, initialize_communication_hub, 
    shutdown_communication_hub, MessageType, MessagePriority
)
from guild.src.agents.customer_intelligence_agent import CustomerIntelligenceAgent
from guild.src.agents.content_intelligence_agent import ContentIntelligenceAgent

# API Router
router = APIRouter(prefix="/api/inter-agent", tags=["Inter-Agent Communication"])

# Request/Response Models
class MessageRequest(BaseModel):
    sender_agent: str
    recipient_agent: str
    message_type: str
    priority: str = "medium"
    payload: Dict[str, Any]
    requires_response: bool = False

class CoordinationRequest(BaseModel):
    coordination_type: str
    customer_id: Optional[str] = None
    content_id: Optional[str] = None
    coordination_data: Dict[str, Any]

class DataSyncRequest(BaseModel):
    sync_type: str
    source_agent: str
    target_agent: str
    sync_data: Dict[str, Any]

class CrossDashboardSyncRequest(BaseModel):
    customer_id: str
    sync_direction: str  # "customer_to_content" or "content_to_customer"
    data: Dict[str, Any]

# Global agent instances (would be managed by dependency injection in production)
customer_agent = None
content_agent = None
communication_hub = None

async def initialize_agents():
    """Initialize agent instances and communication hub."""
    global customer_agent, content_agent, communication_hub
    
    try:
        # Initialize communication hub
        communication_hub = get_communication_hub()
        await communication_hub.start()
        
        # Initialize agents
        customer_agent = CustomerIntelligenceAgent()
        content_agent = ContentIntelligenceAgent()
        
        logging.info("Inter-agent communication system initialized successfully")
        
    except Exception as e:
        logging.error(f"Failed to initialize inter-agent communication: {e}")
        raise

# API Endpoints

@router.post("/initialize")
async def initialize_inter_agent_system(background_tasks: BackgroundTasks):
    """Initialize the inter-agent communication system."""
    try:
        background_tasks.add_task(initialize_agents)
        return {
            "status": "success",
            "message": "Inter-agent communication system initialization started",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
async def get_communication_status():
    """Get the status of the inter-agent communication system."""
    try:
        if not communication_hub:
            return {
                "status": "not_initialized",
                "message": "Communication hub not initialized"
            }
        
        metrics = communication_hub.get_communication_metrics()
        return {
            "status": "active",
            "metrics": metrics,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/message/send")
async def send_message(request: MessageRequest):
    """Send a message between agents."""
    try:
        if not communication_hub:
            raise HTTPException(status_code=503, detail="Communication hub not initialized")
        
        # Convert string enums to actual enum values
        try:
            message_type = MessageType(request.message_type)
            priority = MessagePriority(request.priority)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=f"Invalid enum value: {e}")
        
        # Create message
        from guild.src.core.inter_agent_communication import InterAgentMessage
        import uuid
        
        message = InterAgentMessage(
            message_id=str(uuid.uuid4()),
            sender_agent=request.sender_agent,
            recipient_agent=request.recipient_agent,
            message_type=message_type,
            priority=priority,
            payload=request.payload,
            timestamp=datetime.now(),
            requires_response=request.requires_response
        )
        
        # Send message
        success = await communication_hub.send_message(message)
        
        if success:
            return {
                "status": "success",
                "message_id": message.message_id,
                "timestamp": datetime.now().isoformat()
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to send message")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/coordination/request")
async def request_coordination(request: CoordinationRequest):
    """Request coordination between agents."""
    try:
        if not customer_agent or not content_agent:
            raise HTTPException(status_code=503, detail="Agents not initialized")
        
        coordination_type = request.coordination_type
        result = None
        
        if coordination_type == "customer_content_sync":
            # Sync customer data with content intelligence
            customer_data = {
                "customer_id": request.customer_id,
                "profile": request.coordination_data.get("profile", {}),
                "engagement_history": request.coordination_data.get("engagement_history", []),
                "content_preferences": request.coordination_data.get("content_preferences", {}),
                "sentiment_analysis": request.coordination_data.get("sentiment_analysis", {})
            }
            
            result = await customer_agent.sync_with_content_intelligence(customer_data)
            
        elif coordination_type == "content_customer_sync":
            # Sync content data with customer intelligence
            content_data = {
                "content_id": request.content_id,
                "metrics": request.coordination_data.get("metrics", {}),
                "engagement": request.coordination_data.get("engagement", {}),
                "target_segments": request.coordination_data.get("target_segments", []),
                "insights": request.coordination_data.get("insights", {})
            }
            
            result = await content_agent.sync_with_customer_intelligence(content_data)
            
        elif coordination_type == "sentiment_analysis":
            # Perform sentiment analysis coordination
            customer_id = request.customer_id
            interaction_data = request.coordination_data.get("interaction_data", {})
            
            if customer_agent:
                result = await customer_agent.analyze_customer_sentiment(customer_id, interaction_data)
                
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported coordination type: {coordination_type}")
        
        return {
            "status": "success",
            "coordination_type": coordination_type,
            "result": result,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sync/cross-dashboard")
async def sync_cross_dashboard(request: CrossDashboardSyncRequest):
    """Synchronize data between Customer and Content dashboards."""
    try:
        if not customer_agent or not content_agent:
            raise HTTPException(status_code=503, detail="Agents not initialized")
        
        customer_id = request.customer_id
        sync_direction = request.sync_direction
        data = request.data
        
        result = None
        
        if sync_direction == "customer_to_content":
            # Sync customer data to content intelligence
            customer_data = {
                "customer_id": customer_id,
                "profile": data.get("profile", {}),
                "engagement_history": data.get("engagement_history", []),
                "content_preferences": data.get("content_preferences", {}),
                "sentiment_analysis": data.get("sentiment_analysis", {})
            }
            
            result = await customer_agent.sync_with_content_intelligence(customer_data)
            
        elif sync_direction == "content_to_customer":
            # Sync content data to customer intelligence
            content_data = {
                "content_id": data.get("content_id"),
                "metrics": data.get("metrics", {}),
                "engagement": data.get("engagement", {}),
                "target_segments": data.get("target_segments", []),
                "insights": data.get("insights", {})
            }
            
            result = await content_agent.sync_with_customer_intelligence(content_data)
            
        else:
            raise HTTPException(status_code=400, detail=f"Invalid sync direction: {sync_direction}")
        
        return {
            "status": "success",
            "sync_direction": sync_direction,
            "customer_id": customer_id,
            "result": result,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/agents/status")
async def get_agent_status():
    """Get the status of all registered agents."""
    try:
        if not communication_hub:
            raise HTTPException(status_code=503, detail="Communication hub not initialized")
        
        agents = {}
        for agent_name in communication_hub.agents:
            agents[agent_name] = communication_hub.get_agent_status(agent_name)
        
        return {
            "status": "success",
            "agents": agents,
            "total_agents": len(agents),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/metrics")
async def get_communication_metrics():
    """Get communication system metrics."""
    try:
        if not communication_hub:
            raise HTTPException(status_code=503, detail="Communication hub not initialized")
        
        metrics = communication_hub.get_communication_metrics()
        return {
            "status": "success",
            "metrics": metrics,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/test/coordination")
async def test_coordination():
    """Test the coordination between Customer and Content Intelligence Agents."""
    try:
        if not customer_agent or not content_agent:
            raise HTTPException(status_code=503, detail="Agents not initialized")
        
        # Create test data
        test_customer_data = {
            "customer_id": "test_customer_001",
            "profile": {
                "name": "Test Customer",
                "email": "test@example.com",
                "segment": "high_value",
                "health_score": 85,
                "content_preferences": {
                    "email": 0.8,
                    "social_media": 0.6,
                    "video": 0.9
                }
            },
            "engagement_history": [
                {
                    "content_type": "email",
                    "engagement_score": 0.8,
                    "open_rate": 0.9,
                    "click_rate": 0.7,
                    "send_time": "09:00"
                },
                {
                    "content_type": "video",
                    "engagement_score": 0.9,
                    "open_rate": 0.95,
                    "click_rate": 0.8,
                    "send_time": "14:00"
                }
            ],
            "sentiment_analysis": {
                "sentiment_score": 0.7,
                "sentiment_category": "positive",
                "confidence": 0.8
            }
        }
        
        # Test customer to content sync
        customer_to_content_result = await customer_agent.sync_with_content_intelligence(test_customer_data)
        
        # Create test content data
        test_content_data = {
            "content_id": "test_content_001",
            "metrics": {
                "views": 1000,
                "engagement_rate": 0.85,
                "conversion_rate": 0.12
            },
            "engagement": {
                "likes": 150,
                "shares": 25,
                "comments": 40
            },
            "target_segments": ["high_value", "engaged"],
            "insights": {
                "best_performing_type": "video",
                "optimal_timing": "14:00-16:00"
            }
        }
        
        # Test content to customer sync
        content_to_customer_result = await content_agent.sync_with_customer_intelligence(test_content_data)
        
        return {
            "status": "success",
            "test_results": {
                "customer_to_content_sync": customer_to_content_result,
                "content_to_customer_sync": content_to_customer_result
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/shutdown")
async def shutdown_communication_system():
    """Shutdown the inter-agent communication system."""
    try:
        if communication_hub:
            await communication_hub.stop()
        
        return {
            "status": "success",
            "message": "Inter-agent communication system shutdown",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
