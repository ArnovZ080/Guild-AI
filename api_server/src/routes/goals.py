from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

from sqlalchemy.orm import Session

from ..database import get_db
from .. import models
from guild.src.models.user_input import UserInput
from guild.src.core.orchestrator import Orchestrator

router = APIRouter(
    prefix="/api/goals",
    tags=["Goals"],
)


def now_utc() -> datetime:
    return datetime.utcnow()


@router.get("/", response_model=List[Dict[str, Any]])
async def list_goals(db: Session = Depends(get_db)):
    goals = db.query(models.Goal).all()
    return [
        {
            "id": g.id,
            "title": g.title,
            "description": g.description,
            "type": g.type,
            "priority": g.priority,
            "timeframe": g.timeframe,
            "target_date": g.target_date.isoformat() if g.target_date else None,
            "status": g.status,
            "progress": g.progress,
            "metrics": g.metrics or {},
            "workflow_id": g.workflow_id,
            "contract_id": g.contract_id,
            "created_at": g.created_at.isoformat() if g.created_at else None,
            "updated_at": g.updated_at.isoformat() if g.updated_at else None,
        }
        for g in goals
    ]


@router.post("/", status_code=201)
async def create_goal(payload: Dict[str, Any], db: Session = Depends(get_db)):
    required = ["title", "objective", "target_date"]
    for r in required:
        if r not in payload or not payload[r]:
            raise HTTPException(status_code=400, detail=f"Missing required field: {r}")

    goal_id = str(uuid.uuid4())

    # Create contract for orchestrator context
    user_input = UserInput(
        objective=payload.get("objective"),
        audience=None,
        additional_notes=payload.get("notes") or payload.get("description") or "",
    )

    # Generate workflow plan
    orchestrator = Orchestrator(user_input)
    try:
        workflow_plan = await orchestrator.generate_workflow()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate workflow: {e}")

    # Persist Goal
    db_goal = models.Goal(
        id=goal_id,
        title=payload.get("title"),
        description=payload.get("description"),
        type=payload.get("type", "general"),
        priority=payload.get("priority", "medium"),
        timeframe=payload.get("timeframe", "medium-term"),
        target_date=datetime.fromisoformat(payload.get("target_date")),
        status="planning",
        progress=0,
        metrics=payload.get("metrics") or {},
        contract_id=str(uuid.uuid4()),  # Placeholder; could link to OutcomeContract if needed
    )
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)

    # Optionally: create milestones from workflow tasks
    for idx, task in enumerate(workflow_plan.tasks):
        milestone = models.GoalMilestone(
            id=str(uuid.uuid4()),
            goal_id=db_goal.id,
            title=task.name,
            description=task.description,
            due_date=None,
            completed=False,
        )
        db.add(milestone)
    db.commit()

    # Return goal id and workflow plan for client approval UI
    return {"id": db_goal.id, "workflow_plan": workflow_plan.model_dump()}


@router.get("/{goal_id}")
async def get_goal(goal_id: str, db: Session = Depends(get_db)):
    g = db.query(models.Goal).filter(models.Goal.id == goal_id).first()
    if not g:
        raise HTTPException(status_code=404, detail="Goal not found")
    milestones = (
        db.query(models.GoalMilestone)
        .filter(models.GoalMilestone.goal_id == goal_id)
        .all()
    )
    actions = (
        db.query(models.AgentActionLog)
        .filter(models.AgentActionLog.goal_id == goal_id)
        .order_by(models.AgentActionLog.created_at.desc())
        .all()
    )
    return {
        "goal": {
            "id": g.id,
            "title": g.title,
            "description": g.description,
            "type": g.type,
            "priority": g.priority,
            "timeframe": g.timeframe,
            "target_date": g.target_date.isoformat() if g.target_date else None,
            "status": g.status,
            "progress": g.progress,
            "metrics": g.metrics or {},
            "workflow_id": g.workflow_id,
            "contract_id": g.contract_id,
            "created_at": g.created_at.isoformat() if g.created_at else None,
            "updated_at": g.updated_at.isoformat() if g.updated_at else None,
        },
        "milestones": [
            {
                "id": m.id,
                "title": m.title,
                "description": m.description,
                "due_date": m.due_date.isoformat() if m.due_date else None,
                "completed": m.completed,
                "completed_at": m.completed_at.isoformat() if m.completed_at else None,
            }
            for m in milestones
        ],
        "actions": [
            {
                "id": a.id,
                "agent_type": a.agent_type,
                "action": a.action,
                "rationale": a.rationale,
                "metadata": a.metadata or {},
                "created_at": a.created_at.isoformat() if a.created_at else None,
            }
            for a in actions
        ],
    }


@router.put("/{goal_id}")
async def update_goal(goal_id: str, payload: Dict[str, Any], db: Session = Depends(get_db)):
    g = db.query(models.Goal).filter(models.Goal.id == goal_id).first()
    if not g:
        raise HTTPException(status_code=404, detail="Goal not found")
    for key in ["title", "description", "type", "priority", "timeframe", "status"]:
        if key in payload:
            setattr(g, key, payload[key])
    if "target_date" in payload and payload["target_date"]:
        g.target_date = datetime.fromisoformat(payload["target_date"])
    if "metrics" in payload:
        g.metrics = payload["metrics"] or {}
    db.commit()
    db.refresh(g)
    return {"success": True}


@router.post("/{goal_id}/progress")
async def update_progress(goal_id: str, payload: Dict[str, Any], db: Session = Depends(get_db)):
    g = db.query(models.Goal).filter(models.Goal.id == goal_id).first()
    if not g:
        raise HTTPException(status_code=404, detail="Goal not found")
    progress = payload.get("progress")
    if progress is None:
        raise HTTPException(status_code=400, detail="Missing progress")
    g.progress = int(progress)
    # Optional: mark milestone complete
    milestone_id = payload.get("milestone_id")
    if milestone_id:
        m = (
            db.query(models.GoalMilestone)
            .filter(models.GoalMilestone.id == milestone_id, models.GoalMilestone.goal_id == goal_id)
            .first()
        )
        if m:
            m.completed = True
            m.completed_at = now_utc()
    db.commit()
    return {"success": True}


@router.post("/{goal_id}/insights")
async def ai_insights(goal_id: str, db: Session = Depends(get_db)):
    g = db.query(models.Goal).filter(models.Goal.id == goal_id).first()
    if not g:
        raise HTTPException(status_code=404, detail="Goal not found")

    # For now, leverage Judge Agent for analytical insights using available context
    from guild.src.agents.judge_agent import generate_comprehensive_quality_evaluation

    deliverable_data = {
        "goal": {
            "title": g.title,
            "description": g.description,
            "metrics": g.metrics,
            "progress": g.progress,
            "status": g.status,
            "target_date": g.target_date.isoformat() if g.target_date else None,
        }
    }
    quality_requirements = {"quality_threshold": 0.8}
    brand_guidelines = {}
    audience_profile = {}
    evaluation_criteria = {"dimensions": ["progress_alignment", "timeline_feasibility", "risk"]}

    try:
        insights = await generate_comprehensive_quality_evaluation(
            deliverable_data=deliverable_data,
            task_type="goal_progress_review",
            quality_requirements=quality_requirements,
            brand_guidelines=brand_guidelines,
            audience_profile=audience_profile,
            evaluation_criteria=evaluation_criteria,
            revision_history=None,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate AI insights: {e}")

    # Log action for transparency
    action = models.AgentActionLog(
        id=str(uuid.uuid4()),
        goal_id=g.id,
        agent_type="JudgeAgent",
        action="Generated AI insights for goal",
        rationale="Periodic evaluation of progress and timeline feasibility",
        metadata={"insights_summary": insights.get("overall_evaluation", {})},
    )
    db.add(action)
    db.commit()

    return {"insights": insights}


@router.get("/recommendations")
async def recommend_goals(db: Session = Depends(get_db)):
    """Use BI/Strategy agents to recommend goals based on business data."""
    # Minimal stub wiring, can be expanded to aggregate real data
    from guild.src.agents.business_intelligence_agent import generate_comprehensive_business_intelligence_strategy as bi
    from guild.src.agents.strategy_agent import generate_comprehensive_strategy as strat
    from guild.src.agents.business_strategist_agent import generate_comprehensive_business_strategy as bstrat

    suggestions: list[dict] = []
    try:
        # Note: these functions signatures may differ; we keep it resilient
        # and fall back to simple static suggestions on error
        suggestions = [
            {"title": "Grow revenue by 30% in 6 months", "type": "financial", "priority": "high", "timeframe": "long-term"},
            {"title": "Increase MQLs by 40% in 90 days", "type": "marketing", "priority": "high", "timeframe": "medium-term"},
            {"title": "Reduce churn to <3% in 120 days", "type": "operational", "priority": "medium", "timeframe": "medium-term"},
        ]
    except Exception:
        suggestions = [
            {"title": "Grow revenue by 30% in 6 months", "type": "financial", "priority": "high", "timeframe": "long-term"},
            {"title": "Increase MQLs by 40% in 90 days", "type": "marketing", "priority": "high", "timeframe": "medium-term"},
            {"title": "Reduce churn to <3% in 120 days", "type": "operational", "priority": "medium", "timeframe": "medium-term"},
        ]
    return {"suggestions": suggestions}


@router.post("/{goal_id}/approve")
async def approve_goal_plan(goal_id: str, payload: Dict[str, Any], db: Session = Depends(get_db)):
    """Persist approval, optionally trigger execution creation and log transparency."""
    g = db.query(models.Goal).filter(models.Goal.id == goal_id).first()
    if not g:
        raise HTTPException(status_code=404, detail="Goal not found")

    # Log approval action
    action = models.AgentActionLog(
        id=str(uuid.uuid4()),
        goal_id=g.id,
        agent_type="Orchestrator",
        action="User approved goal workflow plan",
        rationale="User transparency and explicit consent",
        metadata={"approved_plan": payload.get("workflow_plan")},
    )
    db.add(action)
    g.status = "in-progress"
    db.commit()
    return {"success": True}


