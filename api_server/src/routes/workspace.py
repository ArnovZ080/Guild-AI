"""
Workspace routes for simple profile persistence.
Writes JSON to a local workspace folder (can be swapped to MinIO later).
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any, Dict, Optional
import os
import json

router = APIRouter(
    prefix="/workspace",
    tags=["Workspace"],
)


class ProfilePayload(BaseModel):
    brand_voice: Optional[str] = None
    brand_colors: Optional[str] = None
    preferences: Dict[str, Any] = {}
    business: Dict[str, Any] = {}
    user_id: Optional[str] = "default"


@router.post("/profile/save")
async def save_profile(payload: ProfilePayload):
    try:
        base_dir = "/app/data/workspace"
        user_dir = os.path.join(base_dir, payload.user_id or "default", "profile")
        os.makedirs(user_dir, exist_ok=True)

        profile_path = os.path.join(user_dir, "user_profile.json")
        with open(profile_path, "w", encoding="utf-8") as f:
            json.dump({
                "brand_voice": payload.brand_voice,
                "brand_colors": payload.brand_colors,
                "preferences": payload.preferences,
                "business": payload.business,
            }, f, ensure_ascii=False, indent=2)

        return {"success": True, "path": profile_path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save profile: {str(e)}")


@router.get("/profile/get")
async def get_profile(user_id: str = "default"):
    try:
        base_dir = "/app/data/workspace"
        user_dir = os.path.join(base_dir, user_id or "default", "profile")
        profile_path = os.path.join(user_dir, "user_profile.json")
        if not os.path.exists(profile_path):
            return {"success": True, "profile": None}

        with open(profile_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return {"success": True, "profile": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read profile: {str(e)}")


