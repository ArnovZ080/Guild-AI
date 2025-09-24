from fastapi import APIRouter
from typing import List, Dict

router = APIRouter(prefix="/subscription", tags=["subscription"])

@router.get("/agents")
async def list_entitled_agents() -> List[Dict[str, str]]:
    # TODO: replace with entitlement logic based on subscription tier
    return [
        {"id": "research_agent", "name": "Research Agent"},
        {"id": "marketing_agent", "name": "Marketing Agent"},
        {"id": "sales_agent", "name": "Sales Agent"},
        {"id": "operations_agent", "name": "Operations Agent"},
    ]
