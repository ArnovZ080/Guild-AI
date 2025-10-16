from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import Dict, Any, Optional
import os
from datetime import datetime


router = APIRouter(prefix="/api", tags=["profile"])


UPLOADS_BASE = os.getenv("UPLOADS_DIR", os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "uploads")))
AVATARS_DIR = os.path.join(UPLOADS_BASE, "avatars")
LOGOS_DIR = os.path.join(UPLOADS_BASE, "logos")

os.makedirs(AVATARS_DIR, exist_ok=True)
os.makedirs(LOGOS_DIR, exist_ok=True)


class BusinessProfile(BaseModel):
    # Personal/contact
    name: Optional[str] = None
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    countryOrRegion: Optional[str] = None
    city: Optional[str] = None
    officeAddress: Optional[str] = None
    addressLine1: Optional[str] = None
    addressLine2: Optional[str] = None
    stateProvince: Optional[str] = None
    postalCode: Optional[str] = None
    phoneNumber: Optional[str] = None
    email: Optional[str] = None
    profilePictureUrl: Optional[str] = None
    # Business
    company_name: Optional[str] = None
    description: Optional[str] = None
    team_size: Optional[int] = None
    years_active: Optional[int] = None
    ideal_client: Optional[str] = None
    products_services: Optional[str] = None
    pricing_strategy: Optional[str] = None
    turnover_current: Optional[str] = None
    turnover_goals_6m: Optional[str] = None
    turnover_goals_12m: Optional[str] = None
    pain_points: Optional[str] = None
    platforms: Optional[Dict[str, Any]] = None
    brand_voice: Optional[str] = None
    brand_colors: Optional[list] = None
    brand_fonts: Optional[list] = None
    long_term_vision: Optional[str] = None
    guidelines: Optional[Dict[str, Any]] = None


# Simple in-memory storage for development. Replace with DB later.
_PROFILE_STORE: Dict[str, Any] = {}


@router.get("/profile")
async def get_profile():
    return {"data": _PROFILE_STORE}


@router.put("/profile")
async def put_profile(profile: BusinessProfile):
    _PROFILE_STORE.update({k: v for k, v in profile.dict().items() if v is not None})
    return {"success": True, "data": _PROFILE_STORE}


@router.post("/create-profile")
async def create_profile(profile: BusinessProfile):
    """Create a new business profile"""
    try:
        # Initialize profile with provided data
        profile_data = profile.dict()
        _PROFILE_STORE.update({k: v for k, v in profile_data.items() if v is not None})
        
        # Set default values if not provided
        if "created_at" not in _PROFILE_STORE:
            _PROFILE_STORE["created_at"] = datetime.utcnow().isoformat()
        if "updated_at" not in _PROFILE_STORE:
            _PROFILE_STORE["updated_at"] = datetime.utcnow().isoformat()
            
        return {
            "success": True, 
            "data": _PROFILE_STORE,
            "message": "Profile created successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create profile: {str(e)}")


@router.post("/save")
async def save_profile(profile: BusinessProfile):
    """Save/update business profile"""
    try:
        # Update profile with provided data
        profile_data = profile.dict()
        _PROFILE_STORE.update({k: v for k, v in profile_data.items() if v is not None})
        
        # Update timestamp
        _PROFILE_STORE["updated_at"] = datetime.utcnow().isoformat()
        
        return {
            "success": True, 
            "data": _PROFILE_STORE,
            "message": "Profile saved successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save profile: {str(e)}")

@router.post("/profile/avatar")
async def upload_avatar(file: UploadFile = File(...)):
    try:
        ext = os.path.splitext(file.filename)[1] or ".png"
        fname = f"avatar_{datetime.utcnow().strftime('%Y%m%d%H%M%S%f')}{ext}"
        path = os.path.join(AVATARS_DIR, fname)
        with open(path, "wb") as f:
            f.write(await file.read())
        url = f"/uploads/avatars/{fname}"
        _PROFILE_STORE["profilePictureUrl"] = url
        return {"success": True, "url": url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/profile/logo")
async def upload_logo(file: UploadFile = File(...)):
    try:
        ext = os.path.splitext(file.filename)[1] or ".png"
        fname = f"logo_{datetime.utcnow().strftime('%Y%m%d%H%M%S%f')}{ext}"
        path = os.path.join(LOGOS_DIR, fname)
        with open(path, "wb") as f:
            f.write(await file.read())
        url = f"/uploads/logos/{fname}"
        # Ensure nested structure exists
        brand = _PROFILE_STORE.get("brand", {})
        brand["logoUrl"] = url
        _PROFILE_STORE["brand"] = brand
        return {"success": True, "url": url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



