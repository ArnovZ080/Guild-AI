from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from uuid import uuid4

router = APIRouter(prefix="/api/marketplace", tags=["marketplace"])

# In-memory store as a safe fallback; replace with DB session when available
TEMPLATES: Dict[str, Dict[str, Any]] = {}
PURCHASES: List[Dict[str, Any]] = []

class NodeDef(BaseModel):
    id: str
    category: str
    config: Dict[str, Any] = {}
    nl: Optional[str] = None
    label: Optional[str] = None

class EdgeDef(BaseModel):
    id: str
    source: str
    target: str
    label: Optional[str] = None

class DagDefinition(BaseModel):
    nodes: List[NodeDef]
    edges: List[EdgeDef]

class TemplateIn(BaseModel):
    name: str
    description: str
    category: Optional[str] = None
    tags: Optional[List[str]] = []
    dag_definition: DagDefinition
    required_agents: Optional[List[str]] = []
    estimated_credits: Optional[int] = 0
    execution_cost_credits: Optional[int] = 0
    execution_cost_usd: Optional[float] = 0.0

class TemplateOut(TemplateIn):
    id: str
    creator_id: Optional[str] = None
    is_public: bool = False
    is_premium: bool = False
    price_usd: Optional[float] = None
    status: str = "draft"
    download_count: int = 0
    execution_count: int = 0
    rating: float = 0.0
    review_count: int = 0

@router.post("/templates", response_model=TemplateOut)
async def create_template(payload: TemplateIn):
    template_id = str(uuid4())
    record = {
        **payload.model_dump(),
        "id": template_id,
        "is_public": False,
        "is_premium": False,
        "price_usd": None,
        "status": "draft",
        "download_count": 0,
        "execution_count": 0,
        "rating": 0.0,
        "review_count": 0,
    }
    TEMPLATES[template_id] = record
    return record

@router.put("/templates/{template_id}", response_model=TemplateOut)
async def update_template(template_id: str, payload: TemplateIn):
    if template_id not in TEMPLATES:
        raise HTTPException(status_code=404, detail="Template not found")
    TEMPLATES[template_id].update(payload.model_dump())
    return TEMPLATES[template_id]

@router.get("/templates/{template_id}", response_model=TemplateOut)
async def get_template(template_id: str):
    if template_id not in TEMPLATES:
        raise HTTPException(status_code=404, detail="Template not found")
    return TEMPLATES[template_id]

@router.get("/templates", response_model=List[TemplateOut])
async def list_templates(mine: bool = Query(default=False)):
    # Without auth wired, return all for now
    return list(TEMPLATES.values())

class PublishPayload(BaseModel):
    is_public: bool = True
    is_premium: bool = False
    price_usd: Optional[float] = None

@router.post("/templates/{template_id}/publish", response_model=TemplateOut)
async def publish_template(template_id: str, payload: PublishPayload):
    if template_id not in TEMPLATES:
        raise HTTPException(status_code=404, detail="Template not found")
    TEMPLATES[template_id]["is_public"] = payload.is_public
    TEMPLATES[template_id]["is_premium"] = payload.is_premium
    TEMPLATES[template_id]["price_usd"] = payload.price_usd
    TEMPLATES[template_id]["status"] = "published" if payload.is_public else "draft"
    return TEMPLATES[template_id]

@router.post("/templates/{template_id}/unpublish", response_model=TemplateOut)
async def unpublish_template(template_id: str):
    if template_id not in TEMPLATES:
        raise HTTPException(status_code=404, detail="Template not found")
    TEMPLATES[template_id]["is_public"] = False
    TEMPLATES[template_id]["is_premium"] = False
    TEMPLATES[template_id]["price_usd"] = None
    TEMPLATES[template_id]["status"] = "draft"
    return TEMPLATES[template_id]

@router.get("/browse", response_model=List[TemplateOut])
async def browse_templates(category: Optional[str] = None, premium: Optional[bool] = None):
    results = [t for t in TEMPLATES.values() if t.get("is_public")]
    if category:
        results = [t for t in results if t.get("category") == category]
    if premium is not None:
        results = [t for t in results if t.get("is_premium") == premium]
    return results

class PurchaseOut(BaseModel):
    id: str
    template_id: str
    status: str

@router.post("/templates/{template_id}/purchase", response_model=PurchaseOut)
async def purchase_template(template_id: str):
    if template_id not in TEMPLATES or not TEMPLATES[template_id].get("is_public"):
        raise HTTPException(status_code=404, detail="Template not available")
    pid = str(uuid4())
    PURCHASES.append({"id": pid, "template_id": template_id, "status": "purchased"})
    return {"id": pid, "template_id": template_id, "status": "purchased"}

@router.get("/purchases", response_model=List[TemplateOut])
async def list_purchases():
    # Return purchased templates (joined)
    ids = {p["template_id"] for p in PURCHASES}
    return [TEMPLATES[tid] for tid in ids if tid in TEMPLATES]
