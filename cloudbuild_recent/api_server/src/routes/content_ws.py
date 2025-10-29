from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Set, Dict, Any
import json


router = APIRouter()

_connections: Set[WebSocket] = set()


@router.websocket("/ws/content-intelligence")
async def content_intelligence_ws(websocket: WebSocket):
    await websocket.accept()
    _connections.add(websocket)
    try:
        while True:
            # Keep connection alive; ignore client messages
            await websocket.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        if websocket in _connections:
            _connections.remove(websocket)


async def broadcast_update(event_type: str, payload: Dict[str, Any]):
    if not _connections:
        return
    message = json.dumps({"type": event_type, "payload": payload})
    stale: Set[WebSocket] = set()
    for ws in list(_connections):
        try:
            await ws.send_text(message)
        except Exception:
            stale.add(ws)
    for ws in stale:
        if ws in _connections:
            _connections.remove(ws)


