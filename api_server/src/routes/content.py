from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Any, Dict, List, Optional
import asyncio

# Agent imports
from guild.src.agents.content_intelligence_agent import generate_comprehensive_content_intelligence_strategy
from guild.src.agents.strategy_agent import generate_comprehensive_strategy_plan
from guild.src.agents.copywriter import generate_comprehensive_copywriting_strategy as copywriter_strategy
from guild.src.agents.judge_agent import generate_comprehensive_judgement_rubric as judge_rubric  # type: ignore
from guild.src.agents.crm_agent import generate_comprehensive_crm_strategy
from guild.src.core.orchestrator import Orchestrator
from guild.src.models.user_input import UserInput
from guild.src.agents.unified_automation_agent import UnifiedAutomationAgent
from .content_ws import broadcast_update
from guild.src.agents.facebook_scheduler_adapter import FacebookSchedulerAdapter


router = APIRouter(prefix="/content", tags=["content-intelligence"])


class AnalysisRequest(BaseModel):
    platform_data: Optional[Dict[str, Any]] = None


class CreateContentRequest(BaseModel):
    brief: Dict[str, Any]
    platforms: List[str]
    brand: Optional[Dict[str, Any]] = None


class ScheduleRequest(BaseModel):
    items: List[Dict[str, Any]]
    required_platforms: Optional[List[str]] = None
    connected_platforms: Optional[List[str]] = None


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
    await broadcast_update('content_analysis_update', {"data": strategy})
    return {"success": True, "data": strategy}


@router.get("/calendar")
async def get_calendar(period: str = "30d"):
    # Placeholder: return consistent schema with empty list to avoid stubs that mislead
    return {"success": True, "data": {"period": period, "calendar": []}}


@router.get("/performance")
async def get_performance(platform: str = "all", period: str = "7d"):
    data = {"platform": platform, "period": period, "performance": [], "summary": {}}
    await broadcast_update('content_performance_update', data)
    return {"success": True, "data": data}


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
    # Simple gating: require overall >= 0.8 if present
    approved = True
    threshold = 0.8
    overall = None
    try:
        overall = rubric.get("judge_layer_results", {}).get("overall_score")
    except Exception:
        overall = None
    if isinstance(overall, (int, float)):
        approved = overall >= threshold
    return {
        "success": True,
        "data": {
            "strategy": strategy,
            "copy": copy_plan,
            "judge": rubric,
            "approved": approved,
            "threshold": threshold,
            "overall_score": overall
        }
    }


@router.post("/schedule")
async def schedule_content(req: ScheduleRequest):
    # Preflight: ensure required platforms are connected
    if req.required_platforms:
        connected = set(req.connected_platforms or [])
        missing = [p for p in req.required_platforms if p not in connected]
        if missing:
            raise HTTPException(
                status_code=status.HTTP_412_PRECONDITION_FAILED,
                detail={
                    "message": "Missing required platform connections",
                    "missing": missing,
                    "action": "Please connect platforms in Connections to continue"
                }
            )
    # Call UnifiedAutomationAgent to schedule (placeholder text task per item)
    # Platform-specific: Facebook adapter example
    fb_items = [it for it in req.items if (it.get('platform') or '').lower() == 'facebook']
    other_items = [it for it in req.items if (it.get('platform') or '').lower() != 'facebook']

    scheduled: list = []
    if fb_items:
        fb = FacebookSchedulerAdapter()
        fb_res = await fb.schedule_posts(fb_items)
        for it, res in zip(fb_items, fb_res):
            scheduled.append({"item": it, "result": res})

    if other_items:
        ua = UnifiedAutomationAgent()
        tasks = [ua.run(user_input=f"Schedule {it.get('platform')} {it.get('content_type')} on {it.get('scheduled_date')}") for it in other_items]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        for it, res in zip(other_items, results):
            scheduled.append({"item": it, "result": (res if isinstance(res, dict) else {"error": str(res)})})
    await broadcast_update('campaigns_update', {"action": "update", "scheduled": scheduled})
    return {"success": True, "data": {"scheduled": scheduled}}


@router.post("/execute-workflow")
async def execute_workflow(req: ExecuteWorkflowRequest):
    # Build a real workflow plan with Orchestrator
    objective = req.workflow.replace('_', ' ').title()
    additional_notes = (req.context or {}).get("notes")
    ui = UserInput(objective=objective, additional_notes=additional_notes)
    orch = Orchestrator(ui)
    workflow = await orch.generate_workflow()
    # Optionally kick off execution asynchronously in future
    return {
        "success": True,
        "workflow_id": f"wf_{asyncio.get_event_loop().time()}",
        "accepted": True,
        "workflow_definition": workflow.model_dump() if hasattr(workflow, 'model_dump') else None,
    }


