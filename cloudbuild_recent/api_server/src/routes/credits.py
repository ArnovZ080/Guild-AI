from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, timedelta
import uuid
import httpx

from .auth import get_current_user
from .subscription import get_current_exchange_rate, calculate_zar_price, make_paystack_request
from .. import models
from ..database import get_db

router = APIRouter(prefix="/api/credits", tags=["credits"])

# Credit package configuration (more expensive than subscription credits)
CREDIT_PACKAGES = {
    "credits_100": {
        "credits": 100,
        "bonus_credits": 0,
        "usd_price": 8,      # $0.08 per credit vs $0.039 in starter
        "description": "Perfect for small tasks",
        "popular": False
    },
    "credits_250": {
        "credits": 250,
        "bonus_credits": 25,  # 10% bonus
        "usd_price": 18,     # $0.072 per credit (with bonus)
        "description": "Most popular top-up",
        "popular": True
    },
    "credits_500": {
        "credits": 500,
        "bonus_credits": 75,  # 15% bonus
        "usd_price": 32,     # $0.056 per credit (with bonus)
        "description": "Great value for power users",
        "popular": False
    },
    "credits_1000": {
        "credits": 1000,
        "bonus_credits": 200, # 20% bonus
        "usd_price": 55,     # $0.046 per credit (with bonus)
        "description": "Best value - almost subscription rate",
        "popular": False
    }
}

# Pydantic models
class PurchaseCreditsRequest(BaseModel):
    package_id: str
    email: EmailStr

class VerifyCreditPurchaseRequest(BaseModel):
    reference: str

class CreditPurchaseResponse(BaseModel):
    reference: str
    zar_amount: int
    credits: int
    bonus_credits: int
    total_credits: int
    package_name: str

class CreditTransactionModel(BaseModel):
    id: str
    user_id: str
    package_id: str
    credits_purchased: int
    bonus_credits: int
    usd_amount: float
    zar_amount: float
    exchange_rate: float
    paystack_reference: str
    status: str
    created_at: datetime

@router.get("/packages")
async def get_credit_packages():
    """Get available credit packages with current ZAR pricing"""
    try:
        packages_list = []
        current_rate = await get_current_exchange_rate()
        
        for package_id, package_data in CREDIT_PACKAGES.items():
            # Calculate current ZAR price
            current_zar_price = await calculate_zar_price(package_data["usd_price"])
            total_credits = package_data["credits"] + package_data["bonus_credits"]
            
            package_info = {
                "id": package_id,
                "credits": package_data["credits"],
                "bonus_credits": package_data["bonus_credits"],
                "total_credits": total_credits,
                "usd_price": package_data["usd_price"],
                "zar_price": current_zar_price,
                "usd_display": f"${package_data['usd_price']}",
                "zar_display": f"R{current_zar_price:,}",
                "description": package_data["description"],
                "popular": package_data["popular"],
                "cost_per_credit_usd": round(package_data["usd_price"] / total_credits, 3),
                "cost_per_credit_zar": round(current_zar_price / total_credits, 2),
                "exchange_rate": current_rate,
                "savings_vs_individual": max(0, round((1 - (package_data["usd_price"] / total_credits) / 0.08) * 100))
            }
            packages_list.append(package_info)
        
        return {
            "packages": packages_list,
            "exchange_rate": current_rate,
            "last_updated": datetime.utcnow().isoformat(),
            "note": "Credit packages are priced higher than subscription credits. For regular usage, consider upgrading your plan."
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get credit packages: {str(e)}")

@router.post("/purchase", response_model=CreditPurchaseResponse)
async def purchase_credits(
    request: PurchaseCreditsRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Initialize a credit purchase"""
    try:
        # Validate package
        package = CREDIT_PACKAGES.get(request.package_id)
        if not package:
            raise HTTPException(status_code=404, detail="Package not found")
        
        # Calculate current pricing
        current_zar_price = await calculate_zar_price(package["usd_price"])
        current_exchange_rate = await get_current_exchange_rate()
        total_credits = package["credits"] + package["bonus_credits"]
        
        # Generate reference
        reference = f"guild_credits_{uuid.uuid4().hex[:12]}"
        
        # Create credit transaction record
        transaction = models.CreditTransaction(
            user_id=current_user.id,
            package_id=request.package_id,
            credits_purchased=package["credits"],
            bonus_credits=package["bonus_credits"],
            total_credits=total_credits,
            usd_amount=package["usd_price"],
            zar_amount=current_zar_price,
            exchange_rate=current_exchange_rate,
            paystack_reference=reference,
            status="pending",
            extra_data={
                "user_email": request.email,
                "package_name": f"{package['credits']} Credits" + (f" + {package['bonus_credits']} bonus" if package["bonus_credits"] > 0 else ""),
                "pricing_date": datetime.utcnow().isoformat()
            }
        )
        
        db.add(transaction)
        db.commit()
        db.refresh(transaction)
        
        return CreditPurchaseResponse(
            reference=reference,
            zar_amount=current_zar_price,
            credits=package["credits"],
            bonus_credits=package["bonus_credits"],
            total_credits=total_credits,
            package_name=transaction.extra_data["package_name"]
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to initialize credit purchase: {str(e)}")

@router.post("/verify")
async def verify_credit_purchase(
    request: VerifyCreditPurchaseRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Verify credit purchase and add credits to user account"""
    try:
        # Get transaction record
        transaction = db.query(models.CreditTransaction).filter(
            models.CreditTransaction.paystack_reference == request.reference,
            models.CreditTransaction.user_id == current_user.id
        ).first()
        
        if not transaction:
            raise HTTPException(status_code=404, detail="Transaction not found")
        
        if transaction.status == "completed":
            return {
                "success": True,
                "message": "Credits already added",
                "credits_added": transaction.total_credits
            }
        
        # Verify with Paystack
        verification = await make_paystack_request("GET", f"transaction/verify/{request.reference}")
        
        if verification["data"]["status"] != "success":
            transaction.status = "failed"
            db.commit()
            raise HTTPException(status_code=400, detail="Payment verification failed")
        
        # Add credits to user account
        # Note: We add credits that don't expire to a separate balance
        current_user.bonus_credits = getattr(current_user, 'bonus_credits', 0) + transaction.total_credits
        
        # Update transaction
        transaction.status = "completed"
        transaction.completed_at = datetime.utcnow()
        transaction.paystack_transaction_id = verification["data"]["id"]
        
        # Create usage log entry
        credit_log = models.UsageLog(
            user_id=current_user.id,
            action_type="credit_purchase",
            credits_consumed=-transaction.total_credits,  # Negative because we're adding credits
            extra_data={
                "transaction_id": transaction.id,
                "package_id": transaction.package_id,
                "credits_purchased": transaction.credits_purchased,
                "bonus_credits": transaction.bonus_credits,
                "zar_amount": float(transaction.zar_amount),
                "purchase_type": "topup"
            }
        )
        
        db.add(credit_log)
        db.commit()
        
        return {
            "success": True,
            "credits_added": transaction.total_credits,
            "new_bonus_balance": current_user.bonus_credits,
            "transaction_id": transaction.id
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to verify credit purchase: {str(e)}")

@router.get("/balance")
async def get_credit_balance(
    current_user: models.User = Depends(get_current_user)
):
    """Get user's current credit balance"""
    try:
        # Calculate remaining monthly credits
        monthly_remaining = max(0, current_user.credits_limit - current_user.credits_used_this_month)
        
        # Get bonus credits (purchased credits that don't expire)
        bonus_credits = getattr(current_user, 'bonus_credits', 0)
        
        # Total available credits
        total_available = monthly_remaining + bonus_credits
        
        return {
            "monthly_credits": {
                "limit": current_user.credits_limit,
                "used": current_user.credits_used_this_month,
                "remaining": monthly_remaining
            },
            "bonus_credits": bonus_credits,
            "total_available": total_available,
            "subscription_tier": current_user.subscription_tier
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get credit balance: {str(e)}")

@router.get("/history")
async def get_credit_history(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 20,
    offset: int = 0
):
    """Get user's credit purchase history"""
    try:
        # Get credit transactions
        transactions = db.query(models.CreditTransaction).filter(
            models.CreditTransaction.user_id == current_user.id
        ).order_by(models.CreditTransaction.created_at.desc()).offset(offset).limit(limit).all()
        
        # Get credit usage logs
        usage_logs = db.query(models.UsageLog).filter(
            models.UsageLog.user_id == current_user.id,
            models.UsageLog.action_type.in_(["credit_purchase", "chat_message", "workflow_execution", "content_generation"])
        ).order_by(models.UsageLog.created_at.desc()).offset(offset).limit(limit).all()
        
        # Combine and format history
        history = []
        
        # Add transactions
        for transaction in transactions:
            history.append({
                "id": transaction.id,
                "type": "purchase",
                "description": f"Purchased {transaction.total_credits} credits",
                "credits_change": transaction.total_credits,
                "amount_zar": float(transaction.zar_amount),
                "amount_usd": float(transaction.usd_amount),
                "status": transaction.status,
                "date": transaction.created_at.isoformat(),
                "reference": transaction.paystack_reference
            })
        
        # Add usage logs (for context)
        for log in usage_logs:
            if log.action_type == "credit_purchase":
                continue  # Already added above
                
            history.append({
                "id": log.id,
                "type": "usage",
                "description": f"Used {log.credits_consumed} credits for {log.action_type.replace('_', ' ')}",
                "credits_change": -log.credits_consumed,
                "amount_zar": None,
                "amount_usd": None,
                "status": "completed",
                "date": log.created_at.isoformat(),
                "reference": None
            })
        
        # Sort by date
        history.sort(key=lambda x: x["date"], reverse=True)
        
        return {
            "history": history[:limit],
            "total_items": len(history),
            "has_more": len(history) > limit
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get credit history: {str(e)}")

@router.get("/pricing-comparison")
async def get_pricing_comparison(
    current_user: models.User = Depends(get_current_user)
):
    """Compare credit package pricing with subscription plans"""
    try:
        current_rate = await get_current_exchange_rate()
        
        # Subscription credit rates (for comparison)
        subscription_rates = {
            "starter": {"credits": 1000, "usd_price": 39, "rate_per_credit": 0.039},
            "professional": {"credits": 5000, "usd_price": 99, "rate_per_credit": 0.0198},
            "enterprise": {"credits": 25000, "usd_price": 199, "rate_per_credit": 0.00796}
        }
        
        # Calculate package rates
        package_comparison = []
        for package_id, package_data in CREDIT_PACKAGES.items():
            total_credits = package_data["credits"] + package_data["bonus_credits"]
            rate_per_credit = package_data["usd_price"] / total_credits
            zar_price = await calculate_zar_price(package_data["usd_price"])
            
            # Compare with user's current plan
            user_plan = subscription_rates.get(current_user.subscription_tier, {"rate_per_credit": 0.08})
            premium_vs_subscription = ((rate_per_credit / user_plan["rate_per_credit"]) - 1) * 100
            
            package_comparison.append({
                "package_id": package_id,
                "credits": package_data["credits"],
                "bonus_credits": package_data["bonus_credits"],
                "total_credits": total_credits,
                "usd_price": package_data["usd_price"],
                "zar_price": zar_price,
                "rate_per_credit_usd": round(rate_per_credit, 4),
                "premium_vs_subscription_pct": round(premium_vs_subscription, 1),
                "is_good_value": premium_vs_subscription < 100,  # Less than double subscription rate
                "recommendation": "good_value" if premium_vs_subscription < 50 else 
                                "fair" if premium_vs_subscription < 100 else "expensive"
            })
        
        return {
            "user_plan": current_user.subscription_tier,
            "user_plan_rate": subscription_rates.get(current_user.subscription_tier, {"rate_per_credit": 0.08})["rate_per_credit"],
            "packages": package_comparison,
            "recommendation": {
                "message": "For regular usage, upgrading your subscription plan offers much better value than buying credit packages.",
                "suggested_action": "upgrade_plan" if current_user.subscription_tier == "free" else "consider_upgrade"
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get pricing comparison: {str(e)}")

# Modified credit consumption function that uses bonus credits first
async def consume_credits(
    user: models.User,
    credits_needed: int,
    action_type: str,
    db: Session,
    extra_data: dict = None
) -> dict:
    """
    Consume credits from user's account, using bonus credits first, then monthly allowance
    """
    try:
        bonus_credits = getattr(user, 'bonus_credits', 0)
        monthly_remaining = max(0, user.credits_limit - user.credits_used_this_month)
        total_available = bonus_credits + monthly_remaining
        
        if total_available < credits_needed:
            return {
                "success": False,
                "error": "insufficient_credits",
                "available": total_available,
                "needed": credits_needed,
                "shortfall": credits_needed - total_available
            }
        
        # Use bonus credits first
        credits_from_bonus = min(credits_needed, bonus_credits)
        credits_from_monthly = credits_needed - credits_from_bonus
        
        # Update user balances
        if credits_from_bonus > 0:
            user.bonus_credits = bonus_credits - credits_from_bonus
            
        if credits_from_monthly > 0:
            user.credits_used_this_month += credits_from_monthly
        
        # Log the usage
        usage_log = models.UsageLog(
            user_id=user.id,
            action_type=action_type,
            credits_consumed=credits_needed,
            extra_data={
                **(extra_data or {}),
                "credits_from_bonus": credits_from_bonus,
                "credits_from_monthly": credits_from_monthly,
                "remaining_bonus": user.bonus_credits,
                "remaining_monthly": user.credits_limit - user.credits_used_this_month
            }
        )
        
        db.add(usage_log)
        db.commit()
        
        return {
            "success": True,
            "credits_consumed": credits_needed,
            "breakdown": {
                "from_bonus": credits_from_bonus,
                "from_monthly": credits_from_monthly
            },
            "remaining": {
                "bonus": user.bonus_credits,
                "monthly": user.credits_limit - user.credits_used_this_month,
                "total": user.bonus_credits + (user.credits_limit - user.credits_used_this_month)
            }
        }
        
    except Exception as e:
        db.rollback()
        return {
            "success": False,
            "error": "consumption_failed",
            "message": str(e)
        }
