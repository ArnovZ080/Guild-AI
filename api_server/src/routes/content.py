from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any, Dict, List, Optional
import asyncio

# Agent imports
from guild.src.agents.content_intelligence_agent import generate_comprehensive_content_intelligence_strategy
from guild.src.agents.strategy_agent import generate_comprehensive_strategy_plan
from guild.src.agents.copywriter import generate_comprehensive_copywriting_strategy as copywriter_strategy
from guild.src.agents.judge_agent import generate_comprehensive_judgement_rubric as judge_rubric  # type: ignore
from guild.src.agents.crm_agent import generate_comprehensive_crm_strategy


router = APIRouter(prefix="/content", tags=["content-intelligence"])


class AnalysisRequest(BaseModel):
    platform_data: Optional[Dict[str, Any]] = None


class CreateContentRequest(BaseModel):
    brief: Dict[str, Any]
    platforms: List[str]
    brand: Optional[Dict[str, Any]] = None


class ScheduleRequest(BaseModel):
    items: List[Dict[str, Any]]


class ExecuteWorkflowRequest(BaseModel):
    workflow: str
    content: Optional[Dict[str, Any]] = None
    actions: Optional[List[str]] = None
    agents: Optional[List[str]] = None
    context: Optional[Dict[str, Any]] = None


@router.post("/analysis")
async def content_analysis(req: AnalysisRequest):
    # Call CIA to generate/aggregate strategy and analysis
    strategy = await generate_comprehensive_content_intelligence_strategy(
        content_objective="Content Overview Analysis",
        content_sources=req.platform_data or {},
        platform_integrations={"connected": True},
        campaign_requirements={},
        performance_targets={},
        brand_guidelines={}
    )
    return {"success": True, "data": strategy}


@router.get("/calendar")
async def get_calendar(period: str = "30d"):
    # Placeholder: return consistent schema with empty list to avoid stubs that mislead
    return {"success": True, "data": {"period": period, "calendar": []}}


@router.get("/performance")
async def get_performance(platform: str = "all", period: str = "7d"):
    # Placeholder consistent schema
    return {"success": True, "data": {"platform": platform, "period": period, "performance": [], "summary": {}}}


@router.get("/campaigns")
async def get_campaigns():
    # Placeholder consistent schema
    return {"success": True, "data": {"campaigns": []}}


@router.get("/email-performance")
async def get_email_performance(period: str = "30d"):
    return {"success": True, "data": {"period": period, "email_metrics": {}, "trends": {}}}


@router.get("/assets")
async def get_assets():
    return {"success": True, "data": {"assets": [], "categories": [], "total_assets": 0}}


@router.post("/create")
async def create_content(req: CreateContentRequest):
    # Strategy + Copywriter + Judge rubric sequence
    strategy = await generate_comprehensive_strategy_plan(
        strategic_objective=req.brief.get("objective", "Content creation"),
        market_context={}, internal_capabilities={}, competitive_landscape={},
        business_goals=req.brief.get("goals", {}), resource_constraints={}
    )
    copy_plan = await copywriter_strategy(
        content_request=req.brief.get("topic", ""),
        target_audience=req.brief.get("audience", {}),
        brand_guidelines=req.brand or {},
        content_types=req.platforms
    )
    rubric = await judge_rubric(
        evaluation_objective="Content quality gate",
        quality_criteria={"clarity": 0.8, "brand_alignment": 0.85},
        content_samples=copy_plan
    )
    return {"success": True, "data": {"strategy": strategy, "copy": copy_plan, "judge": rubric}}


@router.post("/schedule")
async def schedule_content(req: ScheduleRequest):
    # For now, return items untouched; later call UnifiedAutomationAgent per connector
    return {"success": True, "data": {"scheduled": req.items}}


@router.post("/execute-workflow")
async def execute_workflow(req: ExecuteWorkflowRequest):
    # Defer to orchestrator via simple echo for now with clear structure; frontend hooks will receive id
    execution_id = f"wf_{asyncio.get_event_loop().time()}"
    return {"success": True, "workflow_id": execution_id, "accepted": True, "request": req.dict()}


