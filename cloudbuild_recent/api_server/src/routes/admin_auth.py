"""
Admin Authentication Helpers
Provides admin-only access control for sensitive endpoints
"""

from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session
import os

from ..database import get_db
from .. import models
from .auth import get_current_user

# Admin emails from environment variable
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

ADMIN_EMAILS = parse_email_list(os.getenv("ADMIN_EMAILS", ""))


async def get_current_admin(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> models.User:
    """
    Dependency to require admin access for endpoints
    
    Checks:
    1. User is in ADMIN_EMAILS env var (highest priority)
    2. User has is_admin=True in database
    3. User was the first user created (owner by default)
    
    Raises 403 if not admin
    """
    # Check if user email is in ADMIN_EMAILS env var
    if current_user.email.lower() in ADMIN_EMAILS:
        # Ensure database reflects this
        if not current_user.is_admin:
            current_user.is_admin = True
            current_user.admin_role = "owner"
            db.commit()
        return current_user
    
    # Check if user is marked as admin in database
    if current_user.is_admin:
        return current_user
    
    # Check if user is the first user (owner by default)
    first_user = db.query(models.User).order_by(models.User.created_at.asc()).first()
    if first_user and first_user.id == current_user.id:
        # Mark first user as owner/admin
        current_user.is_admin = True
        current_user.admin_role = "owner"
        db.commit()
        return current_user
    
    # Not an admin
    raise HTTPException(
        status_code=403,
        detail="Admin access required. This endpoint is restricted to platform administrators."
    )


async def get_current_user_with_admin_check(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> tuple[models.User, bool]:
    """
    Returns current user and whether they are an admin
    Useful for conditional UI/features without blocking access
    """
    is_admin = False
    
    # Check admin status
    if current_user.email.lower() in ADMIN_EMAILS:
        is_admin = True
    elif current_user.is_admin:
        is_admin = True
    else:
        # Check if first user
        first_user = db.query(models.User).order_by(models.User.created_at.asc()).first()
        if first_user and first_user.id == current_user.id:
            is_admin = True
    
    return current_user, is_admin

