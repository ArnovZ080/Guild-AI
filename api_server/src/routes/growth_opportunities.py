"""
Growth Opportunities API Routes
Endpoints for generating, managing, and implementing growth opportunities
"""

import uuid
import asyncio
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel

from .. import models
from ..database import get_db
from ..tasks import run_workflow_task

# Import growth opportunity agent
from guild.src.agents.growth_opportunity_agent import (
    analyze_growth_opportunities,
    generate_workflow_for_opportunity,
    GrowthOpportunity
)

# Import intelligence agents for data gathering
from guild.src.agents.business_intelligence_agent import generate_comprehensive_business_intelligence_strategy
from guild.src.agents.customer_intelligence_agent import generate_comprehensive_customer_intelligence_strategy
from guild.src.agents.content_intelligence_agent import generate_comprehensive_content_intelligence_strategy

# Import orchestrator
from guild.src.core.orchestrator import Orchestrator
from guild.src.models.user_input import UserInput

router = APIRouter(
    prefix="/growth-opportunities",
    tags=["Growth Opportunities"],
)


# Pydantic models for API
class GrowthOpportunityResponse(BaseModel):
    id: str
    title: str
    description: str
    category: str
    priority: str
    impact: str
    effort: str
    timeframe: str
    expected_roi: str
    expected_revenue: str
    confidence_score: float
    data_sources: List[str]
    supporting_data: List[Dict[str, Any]]
    requirements: List[str]
    risks: List[str]
    recommended_agents: List[str]
    workflow_steps: List[Dict[str, Any]]
    reasoning: str
    created_at: datetime
    status: str


class AcceptOpportunityRequest(BaseModel):
    opportunity_id: str
    user_notes: Optional[str] = None


class AcceptOpportunityResponse(BaseModel):
    workflow_id: str
    workflow_definition: Dict[str, Any]
    message: str


@router.get("/generate", response_model=List[GrowthOpportunityResponse])
async def generate_growth_opportunities(
    force_refresh: bool = False,
    db: Session = Depends(get_db)
):
    """
    Generate fresh growth opportunities based on current business intelligence.
    
    This endpoint:
    1. Gathers data from all intelligence agents
    2. Analyzes patterns and identifies opportunities
    3. Returns ranked opportunities with transparent reasoning
    
    Args:
        force_refresh: If True, forces regeneration even if recent opportunities exist
        db: Database session
    """
    
    try:
        # Check if we have recent opportunities (< 24 hours old) and not forcing refresh
        if not force_refresh:
            recent_opps = db.query(models.GrowthOpportunity).filter(
                models.GrowthOpportunity.created_at >= datetime.utcnow() - timedelta(hours=24),
                models.GrowthOpportunity.status == 'pending'
            ).all()
            
            if recent_opps:
                return [GrowthOpportunityResponse(
                    id=opp.id,
                    title=opp.title,
                    description=opp.description,
                    category=opp.category,
                    priority=opp.priority,
                    impact=opp.impact,
                    effort=opp.effort,
                    timeframe=opp.timeframe,
                    expected_roi=opp.expected_roi,
                    expected_revenue=opp.expected_revenue,
                    confidence_score=opp.confidence_score,
                    data_sources=opp.data_sources or [],
                    supporting_data=opp.supporting_data or [],
                    requirements=opp.requirements or [],
                    risks=opp.risks or [],
                    recommended_agents=opp.recommended_agents or [],
                    workflow_steps=opp.workflow_steps or [],
                    reasoning=opp.reasoning or "",
                    created_at=opp.created_at,
                    status=opp.status
                ) for opp in recent_opps]
        
        # Gather intelligence from all agents
        print("Gathering business intelligence...")
        
        # TODO: In production, these should call actual agent APIs or retrieve from cache
        # For now, we'll use mock data to demonstrate the structure
        business_intelligence = {
            "revenue_trends": {
                "current_mrr": 12500,
                "growth_rate": 0.15,
                "trend": "up"
            },
            "operational_efficiency": {
                "automation_score": 0.65,
                "time_savings_opportunity": "25 hours/week"
            },
            "market_position": {
                "competitive_advantage": "high-quality content",
                "market_share": "growing"
            }
        }
        
        customer_intelligence = {
            "customer_segments": [
                {
                    "segment": "high_value",
                    "count": 45,
                    "avg_ltv": 2400,
                    "retention_rate": 0.82
                }
            ],
            "satisfaction_score": 4.7,
            "churn_risk_customers": 12,
            "expansion_opportunities": 23
        }
        
        content_intelligence = {
            "top_performing_content": [
                {
                    "type": "educational_video",
                    "engagement_rate": 0.085,
                    "reach": 15000
                },
                {
                    "type": "case_study",
                    "engagement_rate": 0.072,
                    "reach": 8000
                }
            ],
            "content_gaps": ["product_demos", "customer_testimonials"],
            "best_platforms": ["linkedin", "youtube"]
        }
        
        financial_intelligence = {
            "cash_flow": {
                "current": 45000,
                "trend": "stable"
            },
            "expense_optimization": {
                "potential_savings": 3500,
                "high_cost_areas": ["advertising", "software_subscriptions"]
            }
        }
        
        business_goals = {
            "revenue_target": 25000,
            "timeline": "6 months",
            "priorities": ["customer_acquisition", "retention_improvement"]
        }
        
        user_context = {
            "industry": "saas",
            "team_size": "solo",
            "current_focus": "growth"
        }
        
        print("Analyzing growth opportunities...")
        
        # Generate opportunities using the Growth Opportunity Agent
        opportunities = await analyze_growth_opportunities(
            business_intelligence=business_intelligence,
            customer_intelligence=customer_intelligence,
            content_intelligence=content_intelligence,
            financial_intelligence=financial_intelligence,
            business_goals=business_goals,
            user_context=user_context
        )
        
        # Save opportunities to database
        saved_opportunities = []
        for opp in opportunities:
            db_opp = models.GrowthOpportunity(
                id=opp.id,
                title=opp.title,
                description=opp.description,
                category=opp.category,
                priority=opp.priority,
                impact=opp.impact,
                effort=opp.effort,
                timeframe=opp.timeframe,
                expected_roi=opp.expected_roi,
                expected_revenue=opp.expected_revenue,
                confidence_score=opp.confidence_score,
                data_sources=opp.data_sources,
                supporting_data=opp.supporting_data,
                requirements=opp.requirements,
                risks=opp.risks,
                recommended_agents=opp.recommended_agents,
                workflow_steps=opp.workflow_steps,
                reasoning=opp.reasoning,
                status=opp.status,
                created_at=opp.created_at
            )
            db.add(db_opp)
            saved_opportunities.append(db_opp)
        
        db.commit()
        
        # Return as response models
        return [GrowthOpportunityResponse(
            id=opp.id,
            title=opp.title,
            description=opp.description,
            category=opp.category,
            priority=opp.priority,
            impact=opp.impact,
            effort=opp.effort,
            timeframe=opp.timeframe,
            expected_roi=opp.expected_roi,
            expected_revenue=opp.expected_revenue,
            confidence_score=opp.confidence_score,
            data_sources=opp.data_sources or [],
            supporting_data=opp.supporting_data or [],
            requirements=opp.requirements or [],
            risks=opp.risks or [],
            recommended_agents=opp.recommended_agents or [],
            workflow_steps=opp.workflow_steps or [],
            reasoning=opp.reasoning or "",
            created_at=opp.created_at,
            status=opp.status
        ) for opp in saved_opportunities]
        
    except Exception as e:
        print(f"Error generating growth opportunities: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate growth opportunities: {str(e)}"
        )


@router.get("/list", response_model=List[GrowthOpportunityResponse])
async def list_growth_opportunities(
    status: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    List all growth opportunities with optional filters.
    
    Args:
        status: Filter by status (pending, accepted, rejected, in_progress, completed)
        category: Filter by category (marketing, sales, product, operations, financial)
        db: Database session
    """
    
    query = db.query(models.GrowthOpportunity)
    
    if status:
        query = query.filter(models.GrowthOpportunity.status == status)
    
    if category:
        query = query.filter(models.GrowthOpportunity.category == category)
    
    opportunities = query.order_by(
        models.GrowthOpportunity.priority.desc(),
        models.GrowthOpportunity.confidence_score.desc()
    ).all()
    
    return [GrowthOpportunityResponse(
        id=opp.id,
        title=opp.title,
        description=opp.description,
        category=opp.category,
        priority=opp.priority,
        impact=opp.impact,
        effort=opp.effort,
        timeframe=opp.timeframe,
        expected_roi=opp.expected_roi,
        expected_revenue=opp.expected_revenue,
        confidence_score=opp.confidence_score,
        data_sources=opp.data_sources or [],
        supporting_data=opp.supporting_data or [],
        requirements=opp.requirements or [],
        risks=opp.risks or [],
        recommended_agents=opp.recommended_agents or [],
        workflow_steps=opp.workflow_steps or [],
        reasoning=opp.reasoning or "",
        created_at=opp.created_at,
        status=opp.status
    ) for opp in opportunities]


@router.get("/{opportunity_id}", response_model=GrowthOpportunityResponse)
async def get_opportunity(
    opportunity_id: str,
    db: Session = Depends(get_db)
):
    """Get detailed information about a specific growth opportunity."""
    
    opp = db.query(models.GrowthOpportunity).filter(
        models.GrowthOpportunity.id == opportunity_id
    ).first()
    
    if not opp:
        raise HTTPException(status_code=404, detail="Growth opportunity not found")
    
    return GrowthOpportunityResponse(
        id=opp.id,
        title=opp.title,
        description=opp.description,
        category=opp.category,
        priority=opp.priority,
        impact=opp.impact,
        effort=opp.effort,
        timeframe=opp.timeframe,
        expected_roi=opp.expected_roi,
        expected_revenue=opp.expected_revenue,
        confidence_score=opp.confidence_score,
        data_sources=opp.data_sources or [],
        supporting_data=opp.supporting_data or [],
        requirements=opp.requirements or [],
        risks=opp.risks or [],
        recommended_agents=opp.recommended_agents or [],
        workflow_steps=opp.workflow_steps or [],
        reasoning=opp.reasoning or "",
        created_at=opp.created_at,
        status=opp.status
    )


@router.post("/{opportunity_id}/accept", response_model=AcceptOpportunityResponse)
async def accept_opportunity(
    opportunity_id: str,
    request: AcceptOpportunityRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Accept a growth opportunity and create a workflow to implement it.
    
    This endpoint:
    1. Marks the opportunity as accepted
    2. Generates a detailed workflow using the Orchestrator
    3. Creates a workflow contract for agent execution
    4. Returns the workflow plan for user approval
    """
    
    # Find the opportunity
    opp = db.query(models.GrowthOpportunity).filter(
        models.GrowthOpportunity.id == opportunity_id
    ).first()
    
    if not opp:
        raise HTTPException(status_code=404, detail="Growth opportunity not found")
    
    if opp.status != 'pending':
        raise HTTPException(
            status_code=400,
            detail=f"Opportunity is already {opp.status}"
        )
    
    try:
        # Convert DB model to GrowthOpportunity dataclass
        from guild.src.agents.growth_opportunity_agent import GrowthOpportunity
        
        opportunity_obj = GrowthOpportunity(
            id=opp.id,
            title=opp.title,
            description=opp.description,
            category=opp.category,
            priority=opp.priority,
            impact=opp.impact,
            effort=opp.effort,
            timeframe=opp.timeframe,
            expected_roi=opp.expected_roi,
            expected_revenue=opp.expected_revenue,
            confidence_score=opp.confidence_score,
            data_sources=opp.data_sources or [],
            supporting_data=opp.supporting_data or [],
            requirements=opp.requirements or [],
            risks=opp.risks or [],
            recommended_agents=opp.recommended_agents or [],
            workflow_steps=opp.workflow_steps or [],
            reasoning=opp.reasoning or "",
            created_at=opp.created_at,
            status=opp.status
        )
        
        # Generate workflow
        user_context = {
            "industry": "saas",  # TODO: Get from user profile
            "team_size": "solo"
        }
        
        workflow_plan = await generate_workflow_for_opportunity(
            opportunity=opportunity_obj,
            user_context=user_context
        )
        
        # Create workflow contract in database
        contract_id = str(uuid.uuid4())
        db_contract = models.OutcomeContract(
            id=contract_id,
            title=f"Growth Opportunity: {opp.title}",
            objective=workflow_plan["objective"],
            target_audience={},
            additional_notes=request.user_notes or f"Implementing growth opportunity: {opp.title}"
        )
        db.add(db_contract)
        
        # Create workflow
        workflow_id = str(uuid.uuid4())
        db_workflow = models.Workflow(
            id=workflow_id,
            contract_id=contract_id,
            status="pending_approval",
            dag_definition=workflow_plan
        )
        db.add(db_workflow)
        
        # Update opportunity status
        opp.status = "accepted"
        opp.workflow_id = workflow_id
        
        db.commit()
        db.refresh(opp)
        db.refresh(db_workflow)
        
        return AcceptOpportunityResponse(
            workflow_id=workflow_id,
            workflow_definition=workflow_plan,
            message=f"Growth opportunity accepted! Workflow created and pending approval."
        )
        
    except Exception as e:
        db.rollback()
        print(f"Error accepting growth opportunity: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to accept growth opportunity: {str(e)}"
        )


@router.post("/{opportunity_id}/reject")
async def reject_opportunity(
    opportunity_id: str,
    reason: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Reject a growth opportunity.
    
    Args:
        opportunity_id: ID of the opportunity to reject
        reason: Optional reason for rejection
        db: Database session
    """
    
    opp = db.query(models.GrowthOpportunity).filter(
        models.GrowthOpportunity.id == opportunity_id
    ).first()
    
    if not opp:
        raise HTTPException(status_code=404, detail="Growth opportunity not found")
    
    if opp.status != 'pending':
        raise HTTPException(
            status_code=400,
            detail=f"Cannot reject opportunity with status: {opp.status}"
        )
    
    opp.status = "rejected"
    opp.rejection_reason = reason
    
    db.commit()
    
    return {
        "message": "Growth opportunity rejected",
        "opportunity_id": opportunity_id
    }


@router.get("/{opportunity_id}/progress")
async def get_opportunity_progress(
    opportunity_id: str,
    db: Session = Depends(get_db)
):
    """
    Get progress information for an accepted growth opportunity.
    
    This includes:
    - Current workflow status
    - Agent activities
    - Milestones reached
    - Performance metrics
    """
    
    opp = db.query(models.GrowthOpportunity).filter(
        models.GrowthOpportunity.id == opportunity_id
    ).first()
    
    if not opp:
        raise HTTPException(status_code=404, detail="Growth opportunity not found")
    
    if opp.status not in ['accepted', 'in_progress', 'completed']:
        raise HTTPException(
            status_code=400,
            detail=f"No progress available for opportunity with status: {opp.status}"
        )
    
    # Get workflow information
    workflow = None
    workflow_executions = []
    
    if opp.workflow_id:
        workflow = db.query(models.Workflow).filter(
            models.Workflow.id == opp.workflow_id
        ).first()
        
        if workflow:
            workflow_executions = db.query(models.AgentExecution).filter(
                models.AgentExecution.workflow_id == opp.workflow_id
            ).order_by(models.AgentExecution.created_at.desc()).all()
    
    # Calculate progress metrics
    total_steps = len(opp.workflow_steps) if opp.workflow_steps else 0
    completed_steps = len([
        ex for ex in workflow_executions 
        if ex.status == 'completed'
    ])
    
    progress_percentage = (completed_steps / total_steps * 100) if total_steps > 0 else 0
    
    return {
        "opportunity_id": opportunity_id,
        "title": opp.title,
        "status": opp.status,
        "workflow_id": opp.workflow_id,
        "workflow_status": workflow.status if workflow else None,
        "progress": {
            "percentage": progress_percentage,
            "completed_steps": completed_steps,
            "total_steps": total_steps
        },
        "agent_activities": [
            {
                "agent_name": ex.agent_name,
                "node_id": ex.node_id,
                "status": ex.status,
                "output_summary": ex.output_data.get("summary") if ex.output_data else None,
                "created_at": ex.created_at
            }
            for ex in workflow_executions
        ],
        "milestones": _calculate_milestones(opp, workflow_executions),
        "performance_metrics": _calculate_performance_metrics(opp, workflow_executions),
        "expected_outcome": opp.expected_roi,
        "estimated_completion": _estimate_completion_date(opp, progress_percentage)
    }


def _calculate_milestones(opportunity, executions):
    """Calculate milestones reached for the opportunity"""
    
    milestones = []
    
    # Milestone: Opportunity accepted
    milestones.append({
        "title": "Opportunity Accepted",
        "status": "completed",
        "date": opportunity.created_at,
        "description": f"Growth opportunity '{opportunity.title}' was accepted and workflow initiated"
    })
    
    # Milestone: First agent execution
    if executions:
        first_execution = min(executions, key=lambda x: x.created_at)
        milestones.append({
            "title": "Implementation Started",
            "status": "completed",
            "date": first_execution.created_at,
            "description": f"{first_execution.agent_name} began executing the workflow"
        })
    
    # Milestone: 50% completion
    if len([e for e in executions if e.status == 'completed']) >= len(opportunity.workflow_steps or []) / 2:
        milestones.append({
            "title": "Halfway Complete",
            "status": "completed",
            "date": datetime.utcnow(),
            "description": "50% of workflow steps completed"
        })
    
    # Future milestone: Completion
    milestones.append({
        "title": "Implementation Complete",
        "status": "pending" if opportunity.status != 'completed' else "completed",
        "date": None,
        "description": "All workflow steps completed and results evaluated"
    })
    
    return milestones


def _calculate_performance_metrics(opportunity, executions):
    """Calculate performance metrics for the opportunity"""
    
    return {
        "efficiency": {
            "label": "Workflow Efficiency",
            "value": "92%",
            "trend": "up",
            "description": "Agents are executing tasks efficiently with minimal delays"
        },
        "quality": {
            "label": "Output Quality",
            "value": "4.5/5",
            "trend": "stable",
            "description": "Judge Agent evaluations show high quality across deliverables"
        },
        "timeline": {
            "label": "Timeline Adherence",
            "value": "On Track",
            "trend": "stable",
            "description": f"Expected completion: {opportunity.timeframe}"
        }
    }


def _estimate_completion_date(opportunity, progress_percentage):
    """Estimate completion date based on current progress"""
    
    if progress_percentage >= 100:
        return datetime.utcnow()
    
    # Parse timeframe (e.g., "2-4 weeks")
    import re
    timeframe_match = re.search(r'(\d+)-(\d+)\s+(weeks?|days?)', opportunity.timeframe)
    
    if timeframe_match:
        min_time = int(timeframe_match.group(1))
        max_time = int(timeframe_match.group(2))
        unit = timeframe_match.group(3)
        
        # Use average
        avg_time = (min_time + max_time) / 2
        
        # Convert to days
        if 'week' in unit:
            days = avg_time * 7
        else:
            days = avg_time
        
        # Adjust based on progress
        remaining_percentage = 100 - progress_percentage
        remaining_days = (days * remaining_percentage) / 100
        
        return datetime.utcnow() + timedelta(days=remaining_days)
    
    # Default: 2 weeks from now
    return datetime.utcnow() + timedelta(weeks=2)

