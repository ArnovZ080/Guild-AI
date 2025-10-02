from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional


router = APIRouter(prefix="/api", tags=["profile"])


class BusinessProfile(BaseModel):
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


