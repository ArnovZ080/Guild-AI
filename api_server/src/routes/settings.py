from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Any, Dict, Optional
import io
import csv

from .auth import get_current_user
from .. import models

router = APIRouter(prefix="/api", tags=["settings"])


class SettingsPayload(BaseModel):
    # Store arbitrary nested settings safely as dict
    data: Dict[str, Any]


# Simple in-memory backing store (replace with DB)
_SETTINGS_STORE: Dict[int, Dict[str, Any]] = {}


@router.get("/settings")
async def get_settings(current_user: models.User = Depends(get_current_user)):
    return {"data": _SETTINGS_STORE.get(current_user.id, {})}


@router.put("/settings")
async def put_settings(payload: SettingsPayload, current_user: models.User = Depends(get_current_user)):
    # Minimal validation gate
    settings = payload.data or {}
    _SETTINGS_STORE[current_user.id] = settings
    return {"success": True}


@router.get("/settings/export")
async def export_settings(format: Optional[str] = "json", current_user: models.User = Depends(get_current_user)):
    data = _SETTINGS_STORE.get(current_user.id, {})
    if format == "csv":
        # Flatten one level for CSV demo
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["key", "value"])
        for k, v in data.items():
            writer.writerow([k, str(v)])
        return {"format": "csv", "content": output.getvalue()}
    # default json
    return {"format": "json", "content": data}


