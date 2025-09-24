from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from uuid import uuid4

router = APIRouter(prefix="/workflows", tags=["workflows"])

EXECUTIONS: Dict[str, Dict[str, Any]] = {}

class NodeDef(BaseModel):
    id: str
    category: str
    config: Dict[str, Any] = {}
    nl: Optional[str] = None

class EdgeDef(BaseModel):
    id: str
    source: str
    target: str
    label: Optional[str] = None

class DagDefinition(BaseModel):
    nodes: List[NodeDef]
    edges: List[EdgeDef]

class EstimateIn(BaseModel):
    dag_definition: DagDefinition

class EstimateOut(BaseModel):
    execution_cost_credits: int
    execution_cost_usd: float

@router.post("/execute/estimate", response_model=EstimateOut)
async def estimate_execution(payload: EstimateIn):
    # Minimal cost model: map categories to base credits
    credit_map = {
        'trigger': 0,
        'action': 1,
        'condition': 0,
        'split': 0,
        'agent': 2,
        'merge': 0,
    }
    credits = 0
    for n in payload.dag_definition.nodes:
        credits += credit_map.get(n.category, 1)
    usd = round(credits * 0.10, 2)
    return EstimateOut(execution_cost_credits=credits, execution_cost_usd=usd)

class ExecuteIn(BaseModel):
    dag_definition: DagDefinition
    approved: bool

class ExecuteOut(BaseModel):
    execution_id: str
    status: str

@router.post("/execute", response_model=ExecuteOut)
async def execute_workflow(payload: ExecuteIn):
    if not payload.approved:
        raise HTTPException(status_code=400, detail="Cost not approved")
    exec_id = str(uuid4())
    EXECUTIONS[exec_id] = {"id": exec_id, "status": "running"}
    # For now, immediately mark completed
    EXECUTIONS[exec_id]["status"] = "completed"
    return ExecuteOut(execution_id=exec_id, status=EXECUTIONS[exec_id]["status"])

class StatusOut(BaseModel):
    id: str
    status: str

@router.get("/executions/{execution_id}", response_model=StatusOut)
async def get_execution_status(execution_id: str):
    if execution_id not in EXECUTIONS:
        raise HTTPException(status_code=404, detail="Execution not found")
    return StatusOut(id=execution_id, status=EXECUTIONS[execution_id]["status"])
