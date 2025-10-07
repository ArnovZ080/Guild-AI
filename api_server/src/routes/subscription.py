from fastapi import APIRouter, HTTPException, Depends, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
import httpx
import hmac
import hashlib
import os
import uuid

from .auth import get_current_user
from .. import models
from ..database import get_db

router = APIRouter(prefix="/subscription", tags=["subscription"])

# Paystack configuration
PAYSTACK_SECRET_KEY = os.getenv("PAYSTACK_SECRET_KEY")
PAYSTACK_PUBLIC_KEY = os.getenv("PAYSTACK_PUBLIC_KEY")
PAYSTACK_BASE_URL = "https://api.paystack.co"

# Pydantic models
class InitializeSubscriptionRequest(BaseModel):
    plan_id: str
    email: EmailStr

class VerifyPaymentRequest(BaseModel):
    reference: str

class CancelSubscriptionRequest(BaseModel):
    subscription_id: str

class UpdateSubscriptionRequest(BaseModel):
    subscription_id: str
    new_plan_id: str

class Invoice(BaseModel):
    id: str
    date: str
    amount: float
    currency: str
    status: str
    plan: str

class PaymentMethod(BaseModel):
    id: str
    brand: str
    last4: str
    exp_month: int
    exp_year: int

# Subscription plans configuration with USD display pricing
SUBSCRIPTION_PLANS = {
    "free": {
        "name": "Free",
        "credits": 100,
        "api_calls": 500,
        "usd_price": 0,
        "zar_price": 0,
        "features": ["basic_chat", "limited_workflows"],
        "paystack_plan_code": None,
        "included_agents_limit": 0,
        "extra_agent_monthly_usd": 15,
        "extra_agent_daily_usd": 2,
        "trial_days": 0
    },
    "starter": {
        "name": "Starter",
        "credits": 500,  # per new pricing
        "api_calls": 5000,
        "usd_price": 49,
        "zar_price": 910,
        "features": ["base_agents", "basic_templates", "marketplace_use"],
        "paystack_plan_code": "PLN_starter",
        "included_agents_limit": 5,
        "extra_agent_monthly_usd": 12,
        "extra_agent_daily_usd": 1.50,
        "trial_days": 21
    },
    "growth": {
        "name": "Growth",
        "credits": 1000,
        "api_calls": 10000,
        "usd_price": 99,
        "zar_price": 1830,
        "features": ["base_agents", "workflow_builder_full", "marketplace_use"],
        "paystack_plan_code": "PLN_growth",
        "included_agents_limit": 10,
        "extra_agent_monthly_usd": 11,
        "extra_agent_daily_usd": 1.25,
        "trial_days": 21
    },
    "professional": {
        "name": "Professional",
        "credits": 2500,
        "api_calls": 25000,
        "usd_price": 199,
        "zar_price": 3680,
        "features": ["base_agents", "workflow_builder_advanced", "marketplace_sell", "priority_support"],
        "paystack_plan_code": "PLN_professional",
        "included_agents_limit": 25,
        "extra_agent_monthly_usd": 10,
        "extra_agent_daily_usd": 1.00,
        "trial_days": 21
    },
    "enterprise": {
        "name": "Enterprise",
        "credits": 10000,
        "api_calls": 100000,
        "usd_price": 499,
        "zar_price": 9230,
        "features": ["all_agents", "workflow_builder_advanced", "marketplace_sell_earn", "custom_agents", "white_label", "dedicated_support"],
        "paystack_plan_code": "PLN_enterprise",
        "included_agents_limit": 100,
        "extra_agent_monthly_usd": 8,
        "extra_agent_daily_usd": 0.50,
        "trial_days": 21
    }
}

# Exchange rate configuration
EXCHANGE_RATE_API_KEY = os.getenv("EXCHANGE_RATE_API_KEY")  # Optional for premium API
FALLBACK_USD_TO_ZAR = 18.5  # Conservative fallback rate

async def get_current_exchange_rate():
    """Get current USD to ZAR exchange rate"""
    try:
        # Try multiple sources for reliability
        sources = [
            "https://api.exchangerate-api.com/v4/latest/USD",
            f"https://v6.exchangerate-api.com/v6/{EXCHANGE_RATE_API_KEY}/latest/USD" if EXCHANGE_RATE_API_KEY else None,
            "https://api.fixer.io/latest?base=USD&symbols=ZAR"
        ]
        
        for source in sources:
            if not source:
                continue
                
            async with httpx.AsyncClient() as client:
                try:
                    response = await client.get(source, timeout=5.0)
                    if response.status_code == 200:
                        data = response.json()
                        if "rates" in data and "ZAR" in data["rates"]:
                            rate = float(data["rates"]["ZAR"])
                            # Sanity check: USD to ZAR should be between 10 and 25
                            if 10 <= rate <= 25:
                                return rate
                except Exception as e:
                    print(f"Failed to fetch from {source}: {e}")
                    continue
        
        print(f"All exchange rate sources failed, using fallback: {FALLBACK_USD_TO_ZAR}")
        return FALLBACK_USD_TO_ZAR
        
    except Exception as e:
        print(f"Exchange rate fetch error: {e}")
        return FALLBACK_USD_TO_ZAR

async def calculate_zar_price(usd_price: float) -> int:
    """Convert USD price to ZAR and round appropriately"""
    if usd_price == 0:
        return 0
    
    exchange_rate = await get_current_exchange_rate()
    zar_amount = usd_price * exchange_rate
    
    # Round to nearest 10 for cleaner pricing
    return int(round(zar_amount / 10) * 10)

async def make_paystack_request(method: str, endpoint: str, data: dict = None):
    """Make authenticated request to Paystack API"""
    headers = {
        "Authorization": f"Bearer {PAYSTACK_SECRET_KEY}",
        "Content-Type": "application/json"
    }
    
    url = f"{PAYSTACK_BASE_URL}/{endpoint}"
    
    async with httpx.AsyncClient() as client:
        if method.upper() == "GET":
            response = await client.get(url, headers=headers, params=data)
        elif method.upper() == "POST":
            response = await client.post(url, headers=headers, json=data)
        elif method.upper() == "PUT":
            response = await client.put(url, headers=headers, json=data)
        else:
            raise ValueError(f"Unsupported method: {method}")
        
        if response.status_code not in [200, 201]:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Paystack API error: {response.text}"
            )
        
        return response.json()

@router.get("/plans")
async def get_available_plans():
    """Get all available subscription plans with current ZAR pricing"""
    try:
        plans_list = []
        current_rate = await get_current_exchange_rate()
        
        for plan_id, plan_data in SUBSCRIPTION_PLANS.items():
            # Calculate current ZAR price
            current_zar_price = await calculate_zar_price(plan_data["usd_price"])
            
            plan_info = {
                "id": plan_id,
                "name": plan_data["name"],
                "credits": plan_data["credits"],
                "api_calls": plan_data["api_calls"],
                "usd_price": plan_data["usd_price"],
                "zar_price": current_zar_price,
                "usd_display": f"${plan_data['usd_price']}" if plan_data["usd_price"] > 0 else "Free",
                "zar_display": f"R{current_zar_price:,}" if current_zar_price > 0 else "Free",
                "features": plan_data["features"],
                "paystack_plan_code": plan_data["paystack_plan_code"],
                "popular": plan_id == "professional",
                "exchange_rate": current_rate,
                "billing_currency": "ZAR",
                "display_currency": "USD",
                "included_agents_limit": plan_data.get("included_agents_limit"),
                "extra_agent_monthly_usd": plan_data.get("extra_agent_monthly_usd"),
                "extra_agent_daily_usd": plan_data.get("extra_agent_daily_usd"),
                "trial_days": plan_data.get("trial_days", 0)
            }
            plans_list.append(plan_info)
        
        return {
            "plans": plans_list,
            "exchange_rate": current_rate,
            "last_updated": datetime.utcnow().isoformat(),
            "billing_note": "Prices shown in USD for reference. You will be charged the equivalent amount in South African Rand (ZAR)."
        }
        
    except Exception as e:
        # Fallback to static pricing
        plans_list = []
        for plan_id, plan_data in SUBSCRIPTION_PLANS.items():
            plans_list.append({
                "id": plan_id,
                **plan_data,
                "zar_price": plan_data["zar_price"],  # Use fallback price
                "popular": plan_id == "professional"
            })
        
        return {
            "plans": plans_list,
            "exchange_rate": FALLBACK_USD_TO_ZAR,
            "error": "Using fallback pricing due to exchange rate service unavailability"
        }

@router.post("/initialize")
async def initialize_subscription(
    request: InitializeSubscriptionRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Initialize a subscription payment with current ZAR pricing"""
    try:
        # Get plan details
        plan = SUBSCRIPTION_PLANS.get(request.plan_id)
        if not plan:
            raise HTTPException(status_code=404, detail="Plan not found")
        
        if not plan["paystack_plan_code"]:
            raise HTTPException(status_code=400, detail="Free plan doesn't require payment")
        
        # Calculate current ZAR price
        current_zar_price = await calculate_zar_price(plan["usd_price"])
        current_exchange_rate = await get_current_exchange_rate()
        
        # Create or get Paystack customer
        customer_data = await create_or_get_paystack_customer(
            request.email, 
            current_user.full_name or "User"
        )
        
        # Update user with Paystack customer ID
        current_user.paystack_customer_id = customer_data["data"]["customer_code"]
        db.commit()
        
        # Generate reference
        reference = f"guild_sub_{uuid.uuid4().hex[:12]}"
        
        # Initialize transaction with current ZAR amount
        paystack_data = {
            "email": request.email,
            "amount": current_zar_price * 100,  # Convert ZAR to kobo (cents)
            "currency": "ZAR",
            "reference": reference,
            "plan": plan["paystack_plan_code"],
            "customer": customer_data["data"]["customer_code"],
            "extra_data": {
                "plan_id": request.plan_id,
                "plan_name": plan["name"],
                "user_id": current_user.id,
                "credits": plan["credits"],
                "api_calls": plan["api_calls"],
                "usd_price": plan["usd_price"],
                "zar_price": current_zar_price,
                "exchange_rate": current_exchange_rate,
                "pricing_date": datetime.utcnow().isoformat()
            }
        }
        
        result = await make_paystack_request("POST", "transaction/initialize", paystack_data)
        
        return {
            "authorization_url": result["data"]["authorization_url"],
            "reference": reference,
            "amount": current_zar_price * 100,  # Amount in kobo
            "zar_amount": current_zar_price,
            "usd_equivalent": plan["usd_price"],
            "exchange_rate": current_exchange_rate,
            "plan_name": plan["name"],
            "billing_note": f"You will be charged R{current_zar_price:,} ZAR (approximately ${plan['usd_price']} USD at current exchange rate)"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to initialize subscription: {str(e)}")

async def create_or_get_paystack_customer(email: str, name: str):
    """Create or get existing Paystack customer"""
    try:
        # Try to get existing customer
        customers = await make_paystack_request("GET", "customer", {"email": email})
        
        if customers["data"]:
            return {"data": customers["data"][0]}
        
        # Create new customer
        customer_data = {
            "email": email,
            "first_name": name.split()[0] if name else "User",
            "last_name": " ".join(name.split()[1:]) if len(name.split()) > 1 else "",
        }
        
        return await make_paystack_request("POST", "customer", customer_data)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create customer: {str(e)}")

@router.post("/verify")
async def verify_payment(
    request: VerifyPaymentRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Verify payment and activate subscription"""
    try:
        # Verify transaction with Paystack
        verification = await make_paystack_request("GET", f"transaction/verify/{request.reference}")
        
        if verification["data"]["status"] != "success":
            raise HTTPException(status_code=400, detail="Payment verification failed")
        
        transaction_data = verification["data"]
        extra_data = transaction_data.get("extra_data", {})
        plan_id = extra_data.get("plan_id")
        
        if not plan_id:
            raise HTTPException(status_code=400, detail="Invalid transaction extra_data")
        
        plan = SUBSCRIPTION_PLANS[plan_id]
        
        # Get or create subscription in Paystack
        subscription_data = None
        if transaction_data.get("plan"):
            # This is a subscription payment
            subscriptions = await make_paystack_request(
                "GET", 
                f"customer/{current_user.paystack_customer_id}/subscription"
            )
            
            if subscriptions["data"]:
                subscription_data = subscriptions["data"][0]
        
        # Create subscription record in database
        subscription = models.Subscription(
            user_id=current_user.id,
            paystack_subscription_code=subscription_data["subscription_code"] if subscription_data else None,
            paystack_plan_code=plan["paystack_plan_code"],
            status="active",
            tier=plan_id,
            amount=extra_data.get("zar_price", plan["zar_price"]),
            currency="ZAR",
            monthly_credits=plan["credits"],
            api_calls_limit=plan["api_calls"],
            features=plan["features"],
            current_period_start=datetime.utcnow(),
            current_period_end=datetime.utcnow() + timedelta(days=30)
        )
        
        db.add(subscription)
        
        # Update user subscription info
        current_user.subscription_status = "active"
        current_user.subscription_tier = plan_id
        current_user.credits_limit = plan["credits"]
        current_user.credits_used_this_month = 0  # Reset credits on new subscription
        
        db.commit()
        
        return {
            "success": True,
            "subscription_id": subscription.id,
            "plan_name": plan["name"],
            "status": "active",
            "credits": plan["credits"]
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to verify payment: {str(e)}")

@router.get("/info")
async def get_subscription_info(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's subscription information"""
    try:
        # Get active subscription
        subscription = db.query(models.Subscription).filter(
            models.Subscription.user_id == current_user.id,
            models.Subscription.status == "active"
        ).first()
        
        if not subscription:
            return {
                "tier": "free",
                "status": "free",
                "credits": {
                    "used": current_user.credits_used_this_month,
                    "limit": current_user.credits_limit,
                    "bonus": getattr(current_user, 'bonus_credits', 0),
                    "remaining": current_user.credits_limit - current_user.credits_used_this_month + getattr(current_user, 'bonus_credits', 0)
                },
                "plan_details": SUBSCRIPTION_PLANS["free"]
            }
        
        return {
            "id": subscription.id,
            "tier": subscription.tier,
            "status": subscription.status,
            "amount": float(subscription.amount),
            "currency": subscription.currency,
            "current_period_start": subscription.current_period_start.isoformat(),
            "current_period_end": subscription.current_period_end.isoformat(),
            "credits": {
                "used": current_user.credits_used_this_month,
                "limit": subscription.monthly_credits,
                "bonus": getattr(current_user, 'bonus_credits', 0),
                "remaining": subscription.monthly_credits - current_user.credits_used_this_month + getattr(current_user, 'bonus_credits', 0)
            },
            "features": subscription.features,
            "plan_details": SUBSCRIPTION_PLANS.get(subscription.tier, {})
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get subscription info: {str(e)}")

@router.get("/invoices")
async def get_invoices(current_user: models.User = Depends(get_current_user)):
    """Return recent invoices (mock if none)."""
    try:
        # TODO: replace with DB records once implemented
        mock: List[Invoice] = [
            Invoice(id="inv_20250901", date="2025-09-01", amount=49.0, currency="ZAR", status="paid", plan="Starter"),
            Invoice(id="inv_20250801", date="2025-08-01", amount=49.0, currency="ZAR", status="paid", plan="Starter"),
        ]
        return {"invoices": [i.dict() for i in mock]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get invoices: {str(e)}")

@router.get("/payment-methods")
async def get_payment_methods(current_user: models.User = Depends(get_current_user)):
    """Return payment methods (mock)."""
    try:
        methods: List[PaymentMethod] = [
            PaymentMethod(id="pm_visa_4242", brand="visa", last4="4242", exp_month=12, exp_year=2027)
        ]
        return {"methods": [m.dict() for m in methods]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get payment methods: {str(e)}")

@router.get("/invoices/{invoice_id}/download")
async def download_invoice(invoice_id: str, current_user: models.User = Depends(get_current_user)):
    """Return a downloadable payload (mock). Replace with real file serving."""
    try:
        content = f"Invoice {invoice_id}\nUser: {current_user.id}\nAmount: mock\nStatus: paid\n"
        return {
            "filename": f"{invoice_id}.txt",
            "content_type": "text/plain",
            "content": content
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to download invoice: {str(e)}")

@router.post("/cancel")
async def cancel_subscription(
    request: CancelSubscriptionRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cancel user's subscription"""
    try:
        # Get subscription
        subscription = db.query(models.Subscription).filter(
            models.Subscription.id == request.subscription_id,
            models.Subscription.user_id == current_user.id
        ).first()
        
        if not subscription:
            raise HTTPException(status_code=404, detail="Subscription not found")
        
        # Cancel with Paystack if it's a recurring subscription
        if subscription.paystack_subscription_code:
            await make_paystack_request(
                "POST",
                f"subscription/disable",
                {
                    "code": subscription.paystack_subscription_code,
                    "token": subscription.paystack_subscription_code  # Paystack token
                }
            )
        
        # Update subscription status
        subscription.status = "cancelled"
        subscription.cancelled_at = datetime.utcnow()
        
        # Update user to free tier at end of billing period
        # For now, we'll downgrade immediately, but you could keep them active until period_end
        current_user.subscription_status = "cancelled"
        current_user.subscription_tier = "free"
        current_user.credits_limit = SUBSCRIPTION_PLANS["free"]["credits"]
        
        db.commit()
        
        return {
            "success": True,
            "message": "Subscription cancelled successfully",
            "effective_date": subscription.current_period_end.isoformat()
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to cancel subscription: {str(e)}")

@router.get("/exchange-rate")
async def get_exchange_rate():
    """Get current USD to ZAR exchange rate"""
    try:
        rate = await get_current_exchange_rate()
        
        # Calculate sample conversions for common amounts
        sample_conversions = {}
        for plan_id, plan_data in SUBSCRIPTION_PLANS.items():
            if plan_data["usd_price"] > 0:
                zar_amount = await calculate_zar_price(plan_data["usd_price"])
                sample_conversions[plan_id] = {
                    "usd": plan_data["usd_price"],
                    "zar": zar_amount,
                    "usd_display": f"${plan_data['usd_price']}",
                    "zar_display": f"R{zar_amount:,}"
                }
        
        return {
            "rate": rate,
            "base_currency": "USD",
            "target_currency": "ZAR",
            "last_updated": datetime.utcnow().isoformat(),
            "sample_conversions": sample_conversions,
            "note": "Exchange rates are updated every 6 hours. Actual billing amounts may vary slightly based on the rate at time of payment."
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get exchange rate: {str(e)}")

@router.post("/webhook")
async def paystack_webhook(request: Request, db: Session = Depends(get_db)):
    """Handle Paystack webhooks for subscription events"""
    try:
        body = await request.body()
        signature = request.headers.get("x-paystack-signature")
        
        # Verify webhook signature
        expected_signature = hmac.new(
            PAYSTACK_SECRET_KEY.encode(),
            body,
            hashlib.sha512
        ).hexdigest()
        
        if signature != expected_signature:
            raise HTTPException(status_code=400, detail="Invalid signature")
        
        event_data = await request.json()
        event_type = event_data.get("event")
        data = event_data.get("data", {})
        
        # Handle different webhook events
        if event_type == "subscription.create":
            await handle_subscription_created(data, db)
        elif event_type == "subscription.disable":
            await handle_subscription_cancelled(data, db)
        elif event_type == "invoice.create":
            await handle_invoice_created(data, db)
        elif event_type == "invoice.payment_failed":
            await handle_payment_failed(data, db)
        
        return {"status": "success"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Webhook processing failed: {str(e)}")

async def handle_subscription_created(data: dict, db: Session):
    """Handle subscription creation webhook"""
    # Find user by customer code
    customer_code = data.get("customer", {}).get("customer_code")
    user = db.query(models.User).filter(
        models.User.paystack_customer_id == customer_code
    ).first()
    
    if user:
        # Update subscription status
        subscription = db.query(models.Subscription).filter(
            models.Subscription.user_id == user.id,
            models.Subscription.paystack_subscription_code == data.get("subscription_code")
        ).first()
        
        if subscription:
            subscription.status = "active"
            user.subscription_status = "active"
            db.commit()

async def handle_subscription_cancelled(data: dict, db: Session):
    """Handle subscription cancellation webhook"""
    subscription_code = data.get("subscription_code")
    subscription = db.query(models.Subscription).filter(
        models.Subscription.paystack_subscription_code == subscription_code
    ).first()
    
    if subscription:
        subscription.status = "cancelled"
        subscription.cancelled_at = datetime.utcnow()
        
        # Update user
        user = db.query(models.User).filter(models.User.id == subscription.user_id).first()
        if user:
            user.subscription_status = "cancelled"
            user.subscription_tier = "free"
            user.credits_limit = SUBSCRIPTION_PLANS["free"]["credits"]
        
        db.commit()

async def handle_invoice_created(data: dict, db: Session):
    """Handle invoice creation (billing cycle)"""
    # This is where you'd handle monthly billing cycles
    # Reset user credits, etc.
    pass

async def handle_payment_failed(data: dict, db: Session):
    """Handle failed payment"""
    # Update subscription status to past_due
    # Send notification to user
    pass

# Monthly reset task (you'd run this as a cron job)
@router.post("/reset-monthly-usage")
async def reset_monthly_usage(db: Session = Depends(get_db)):
    """Reset monthly usage counters (run via cron job)"""
    try:
        # Reset all users' monthly usage
        users = db.query(models.User).all()
        for user in users:
            user.credits_used_this_month = 0
            user.api_calls_this_month = 0
        
        db.commit()
        
        return {"message": "Monthly usage reset successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to reset usage: {str(e)}")
