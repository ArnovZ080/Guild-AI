"""
Waiting List API Endpoints
Manages waiting list for pre-launch sign-ups and beta tester access control
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime
import os

from ..database import get_db
from .. import models
from .auth import get_current_user
from .admin_auth import get_current_admin, get_current_user_with_admin_check

router = APIRouter(prefix="/api/waitlist", tags=["waitlist"])

# Configuration - Beta tester emails (can be loaded from env or database)
# Support both comma and semicolon separators to avoid gcloud parsing issues
def parse_email_list(email_string):
    """Parse email list supporting both comma and semicolon separators"""
    if not email_string:
        return set()
    
    # Try semicolon first (preferred for gcloud), then comma
    if ";" in email_string:
        emails = email_string.split(";")
    else:
        emails = email_string.split(",")
    
    return set(
        email.strip().lower() 
        for email in emails 
        if email.strip()
    )

BETA_TESTER_EMAILS = parse_email_list(os.getenv("BETA_TESTER_EMAILS", ""))

# Request models
class JoinWaitlistRequest(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    company: Optional[str] = None
    role: Optional[str] = None
    how_heard: Optional[str] = None
    use_case: Optional[str] = None
    utm_source: Optional[str] = None
    utm_medium: Optional[str] = None
    utm_campaign: Optional[str] = None


class CheckBetaAccessRequest(BaseModel):
    email: EmailStr


class GrantBetaAccessRequest(BaseModel):
    email: EmailStr
    notes: Optional[str] = None


# Public endpoints (no auth required)

@router.post("/join")
async def join_waitlist(
    request: JoinWaitlistRequest,
    db: Session = Depends(get_db)
):
    """
    Add user to waiting list
    Public endpoint - anyone can join the waiting list
    """
    try:
        # Check if email already on waiting list
        existing = db.query(models.WaitingList).filter(
            models.WaitingList.email == request.email.lower()
        ).first()
        
        if existing:
            return {
                "success": True,
                "message": "You're already on our waiting list! We'll notify you when we launch.",
                "position": db.query(models.WaitingList).filter(
                    models.WaitingList.created_at < existing.created_at
                ).count() + 1
            }
        
        # Check if email already registered as user
        existing_user = db.query(models.User).filter(
            models.User.email == request.email.lower()
        ).first()
        
        if existing_user:
            return {
                "success": True,
                "message": "You already have an account! Please log in.",
                "has_account": True
            }
        
        # Add to waiting list
        waitlist_entry = models.WaitingList(
            email=request.email.lower(),
            full_name=request.full_name,
            company=request.company,
            role=request.role,
            how_heard=request.how_heard,
            use_case=request.use_case,
            utm_source=request.utm_source,
            utm_medium=request.utm_medium,
            utm_campaign=request.utm_campaign,
            status="pending"
        )
        
        db.add(waitlist_entry)
        db.commit()
        db.refresh(waitlist_entry)
        
        # Calculate position in line
        position = db.query(models.WaitingList).filter(
            models.WaitingList.created_at < waitlist_entry.created_at
        ).count() + 1
        
        return {
            "success": True,
            "message": "Thank you for joining our waiting list! We'll notify you when Guild AI launches.",
            "position": position,
            "email": request.email.lower()
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to join waiting list: {str(e)}")


@router.post("/check-beta-access")
async def check_beta_access(
    request: CheckBetaAccessRequest,
    db: Session = Depends(get_db)
):
    """
    Check if an email has beta access
    Public endpoint - used before signup to determine access
    """
    try:
        email_lower = request.email.lower()
        
        # Check if email is in beta tester list (env var)
        if email_lower in BETA_TESTER_EMAILS:
            return {
                "has_beta_access": True,
                "access_type": "pre_approved"
            }
        
        # Check if user exists and is marked as beta tester
        user = db.query(models.User).filter(
            models.User.email == email_lower
        ).first()
        
        if user and user.is_beta_tester:
            return {
                "has_beta_access": True,
                "access_type": "granted",
                "has_account": True
            }
        
        # No beta access
        return {
            "has_beta_access": False
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to check beta access: {str(e)}")


# Admin endpoints (require authentication)

@router.get("/is-admin")
async def check_admin_status(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Check if current user is an admin
    Returns admin status for conditional UI rendering
    """
    try:
        # Use the existing admin authentication logic
        current_user, is_admin = await get_current_user_with_admin_check(current_user, db)
        
        return {
            "is_admin": is_admin,
            "admin_role": current_user.admin_role if is_admin else None,
            "email": current_user.email
        }
    except Exception as e:
        # If there's any error (like authentication failure), return not admin
        return {
            "is_admin": False,
            "admin_role": None,
            "email": None
        }


@router.get("/list")
async def get_waitlist(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    current_admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Get waiting list entries
    Admin only - requires admin authentication
    """
    
    query = db.query(models.WaitingList)
    
    if status:
        query = query.filter(models.WaitingList.status == status)
    
    query = query.order_by(models.WaitingList.created_at.desc())
    
    total = query.count()
    entries = query.offset(skip).limit(limit).all()
    
    return {
        "total": total,
        "entries": [
            {
                "id": entry.id,
                "email": entry.email,
                "full_name": entry.full_name,
                "company": entry.company,
                "role": entry.role,
                "how_heard": entry.how_heard,
                "use_case": entry.use_case,
                "status": entry.status,
                "created_at": entry.created_at.isoformat() if entry.created_at else None,
                "utm_source": entry.utm_source,
                "utm_campaign": entry.utm_campaign
            }
            for entry in entries
        ]
    }


@router.post("/grant-beta-access")
async def grant_beta_access(
    request: GrantBetaAccessRequest,
    current_admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Grant beta access to a waiting list email
    Admin only - requires admin authentication
    """
    try:
        email_lower = request.email.lower()
        
        # Find waiting list entry
        waitlist_entry = db.query(models.WaitingList).filter(
            models.WaitingList.email == email_lower
        ).first()
        
        if waitlist_entry:
            waitlist_entry.status = "invited"
            waitlist_entry.invited_at = datetime.utcnow()
            if request.notes:
                waitlist_entry.admin_notes = request.notes
        
        # Check if user already exists
        user = db.query(models.User).filter(
            models.User.email == email_lower
        ).first()
        
        if user:
            # Mark existing user as beta tester
            user.is_beta_tester = True
            user.beta_access_granted_at = datetime.utcnow()
            user.beta_access_granted_by = current_admin.email
        
        db.commit()
        
        return {
            "success": True,
            "message": f"Beta access granted to {email_lower}",
            "email": email_lower,
            "user_exists": user is not None
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to grant beta access: {str(e)}")


@router.post("/revoke-beta-access")
async def revoke_beta_access(
    request: GrantBetaAccessRequest,
    current_admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Revoke beta access from a user
    Admin only - requires admin authentication
    """
    try:
        email_lower = request.email.lower()
        
        # Find and update user
        user = db.query(models.User).filter(
            models.User.email == email_lower
        ).first()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        user.is_beta_tester = False
        user.beta_access_granted_at = None
        user.beta_access_granted_by = None
        
        # Update waiting list entry if exists
        waitlist_entry = db.query(models.WaitingList).filter(
            models.WaitingList.email == email_lower
        ).first()
        
        if waitlist_entry:
            waitlist_entry.status = "rejected"
            if request.notes:
                waitlist_entry.admin_notes = request.notes
        
        db.commit()
        
        return {
            "success": True,
            "message": f"Beta access revoked for {email_lower}",
            "email": email_lower
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to revoke beta access: {str(e)}")


@router.get("/stats")
async def get_waitlist_stats(
    current_admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Get waiting list statistics
    Admin only - requires admin authentication
    """
    try:
        total = db.query(models.WaitingList).count()
        pending = db.query(models.WaitingList).filter(models.WaitingList.status == "pending").count()
        invited = db.query(models.WaitingList).filter(models.WaitingList.status == "invited").count()
        converted = db.query(models.WaitingList).filter(models.WaitingList.status == "converted").count()
        
        # Get beta tester count
        beta_testers = db.query(models.User).filter(models.User.is_beta_tester == True).count()
        
        return {
            "waiting_list": {
                "total": total,
                "pending": pending,
                "invited": invited,
                "converted": converted
            },
            "beta_testers": {
                "total": beta_testers,
                "from_env": len(BETA_TESTER_EMAILS),
                "from_db": beta_testers
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get stats: {str(e)}")

