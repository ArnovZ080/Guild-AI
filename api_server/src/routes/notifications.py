from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Dict, Any
from .auth import get_current_user
from .. import models

router = APIRouter(prefix="/api", tags=["notifications"])

class NotificationPrefs(BaseModel):
    data: Dict[str, Any]

_STORE: Dict[int, Dict[str, Any]] = {}

@router.get("/notifications/prefs")
async def get_prefs(current_user: models.User = Depends(get_current_user)):
    return {"data": _STORE.get(current_user.id, {})}

@router.put("/notifications/prefs")
async def put_prefs(payload: NotificationPrefs, current_user: models.User = Depends(get_current_user)):
    _STORE[current_user.id] = payload.data or {}
    return {"success": True}
