"""
Webhook Endpoints for Event-Driven Triggers

This module provides webhook endpoints that allow external services
to trigger blueprint execution based on events.
"""

from fastapi import APIRouter, HTTPException, Request, Depends
from typing import Dict, List, Any, Optional
from pydantic import BaseModel
import sys
import os
import json

# Add the guild package to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../..', 'guild'))

from guild.src.core.blueprint_engine import BlueprintEngine

router = APIRouter(prefix="/webhooks", tags=["webhooks"])

# Initialize blueprint engine (in production, this should be a singleton)
class MockOrchestrator:
    pass

orchestrator = MockOrchestrator()
blueprint_engine = BlueprintEngine(orchestrator)

# Pydantic models for webhook requests
class WebhookPayload(BaseModel):
    event_type: str
    data: Dict[str, Any]
    timestamp: Optional[str] = None
    source: Optional[str] = None

class WebhookResponse(BaseModel):
    status: str
    message: str
    blueprint_triggered: Optional[str] = None
    execution_id: Optional[str] = None

# Webhook configuration - maps event types to blueprints
WEBHOOK_CONFIG = {
    "invoice_received": ["accounting_manager"],
    "new_lead": ["lead_generation_manager"],
    "customer_churn_risk": ["customer_success_manager"],
    "market_opportunity": ["business_development_manager"],
    "pr_mention": ["pr_opportunities_manager"],
    "competitor_activity": ["market_intelligence_manager"],
    "monthly_close": ["monthly_accounting_reconciliation"],
    "social_media_engagement": ["social_media_manager"]
}

@router.post("/{workspace_id}/{trigger_source}")
async def webhook_handler(
    workspace_id: str,
    trigger_source: str,
    request: Request,
    payload: Optional[WebhookPayload] = None
):
    """
    Generic webhook endpoint for triggering blueprints based on external events.
    
    Args:
        workspace_id: The workspace identifier
        trigger_source: The source of the webhook (e.g., 'stripe', 'mailchimp', 'zapier')
        request: The raw request object
        payload: The webhook payload
    """
    try:
        # If no payload provided, try to parse from request body
        if not payload:
            body = await request.body()
            if body:
                try:
                    payload_data = json.loads(body)
                    payload = WebhookPayload(**payload_data)
                except Exception as e:
                    # If JSON parsing fails, create a basic payload
                    payload = WebhookPayload(
                        event_type=trigger_source,
                        data={"raw_body": body.decode()},
                        source=trigger_source
                    )
            else:
                payload = WebhookPayload(
                    event_type=trigger_source,
                    data={},
                    source=trigger_source
                )
        
        # Determine which blueprints to trigger based on event type
        blueprints_to_trigger = WEBHOOK_CONFIG.get(payload.event_type, [])
        
        if not blueprints_to_trigger:
            # No specific mapping, try to infer from trigger source
            if "accounting" in trigger_source.lower():
                blueprints_to_trigger = ["accounting_manager"]
            elif "lead" in trigger_source.lower():
                blueprints_to_trigger = ["lead_generation_manager"]
            elif "customer" in trigger_source.lower():
                blueprints_to_trigger = ["customer_success_manager"]
            elif "pr" in trigger_source.lower() or "media" in trigger_source.lower():
                blueprints_to_trigger = ["pr_opportunities_manager"]
            elif "market" in trigger_source.lower():
                blueprints_to_trigger = ["market_intelligence_manager"]
        
        # Execute triggered blueprints
        execution_results = []
        for blueprint_id in blueprints_to_trigger:
            try:
                # Check if blueprint exists
                blueprint = blueprint_engine.get_blueprint(blueprint_id)
                if not blueprint:
                    continue
                
                # Execute blueprint with webhook data
                result = blueprint_engine.execute_blueprint(
                    blueprint_id,
                    {
                        "webhook_source": trigger_source,
                        "workspace_id": workspace_id,
                        "event_type": payload.event_type,
                        "event_data": payload.data,
                        "timestamp": payload.timestamp
                    }
                )
                
                execution_results.append({
                    "blueprint_id": blueprint_id,
                    "blueprint_name": blueprint.name,
                    "status": result.get("status", "unknown"),
                    "execution_id": result.get("execution_id", "unknown")
                })
                
            except Exception as e:
                execution_results.append({
                    "blueprint_id": blueprint_id,
                    "status": "failed",
                    "error": str(e)
                })
        
        # Return response
        if execution_results:
            return WebhookResponse(
                status="success",
                message=f"Webhook processed successfully. {len(execution_results)} blueprints triggered.",
                blueprint_triggered=", ".join([r["blueprint_id"] for r in execution_results if r.get("status") == "completed"]),
                execution_id=", ".join([r["execution_id"] for r in execution_results if r.get("execution_id")])
            )
        else:
            return WebhookResponse(
                status="no_action",
                message="Webhook received but no blueprints were triggered."
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Webhook processing failed: {str(e)}")

@router.post("/{workspace_id}/stripe")
async def stripe_webhook(workspace_id: str, request: Request):
    """Handle Stripe webhooks for payment-related events."""
    try:
        body = await request.body()
        payload_data = json.loads(body)
        
        # Map Stripe events to blueprints
        stripe_event_mapping = {
            "invoice.payment_succeeded": "accounting_manager",
            "invoice.payment_failed": "customer_success_manager",
            "customer.subscription.created": "lead_generation_manager",
            "customer.subscription.updated": "customer_success_manager",
            "customer.subscription.deleted": "customer_success_manager"
        }
        
        event_type = payload_data.get("type")
        blueprint_id = stripe_event_mapping.get(event_type)
        
        if blueprint_id:
            result = blueprint_engine.execute_blueprint(
                blueprint_id,
                {
                    "webhook_source": "stripe",
                    "workspace_id": workspace_id,
                    "event_type": event_type,
                    "event_data": payload_data.get("data", {}),
                    "timestamp": payload_data.get("created")
                }
            )
            
            return WebhookResponse(
                status="success",
                message=f"Stripe webhook processed. Blueprint {blueprint_id} triggered.",
                blueprint_triggered=blueprint_id,
                execution_id=result.get("execution_id", "unknown")
            )
        else:
            return WebhookResponse(
                status="no_action",
                message=f"Stripe event {event_type} received but no blueprints configured."
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Stripe webhook processing failed: {str(e)}")

@router.post("/{workspace_id}/mailchimp")
async def mailchimp_webhook(workspace_id: str, request: Request):
    """Handle Mailchimp webhooks for email marketing events."""
    try:
        body = await request.body()
        payload_data = json.loads(body)
        
        # Map Mailchimp events to blueprints
        mailchimp_event_mapping = {
            "subscribe": "lead_generation_manager",
            "unsubscribe": "customer_success_manager",
            "profile": "lead_generation_manager",
            "cleaned": "lead_generation_manager"
        }
        
        event_type = payload_data.get("type")
        blueprint_id = mailchimp_event_mapping.get(event_type)
        
        if blueprint_id:
            result = blueprint_engine.execute_blueprint(
                blueprint_id,
                {
                    "webhook_source": "mailchimp",
                    "workspace_id": workspace_id,
                    "event_type": event_type,
                    "event_data": payload_data,
                    "timestamp": payload_data.get("fired_at")
                }
            )
            
            return WebhookResponse(
                status="success",
                message=f"Mailchimp webhook processed. Blueprint {blueprint_id} triggered.",
                blueprint_triggered=blueprint_id,
                execution_id=result.get("execution_id", "unknown")
            )
        else:
            return WebhookResponse(
                status="no_action",
                message=f"Mailchimp event {event_type} received but no blueprints configured."
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Mailchimp webhook processing failed: {str(e)}")

@router.get("/{workspace_id}/health")
async def webhook_health_check(workspace_id: str):
    """Health check endpoint for webhook service."""
    return {
        "status": "healthy",
        "workspace_id": workspace_id,
        "webhook_sources": list(WEBHOOK_CONFIG.keys()),
        "message": "Webhook service is operational"
    }
