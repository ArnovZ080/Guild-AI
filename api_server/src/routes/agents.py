"""
Agent API Routes
Handles agent status, execution, and data integration
"""

from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

router = APIRouter(
    prefix="/agents",
    tags=["Agents"],
)

class AgentExecutionRequest(BaseModel):
    agent_type: str
    task_data: Dict[str, Any]
    workflow_id: Optional[str] = None


class OptimizeRequest(BaseModel):
    objective: str
    analytics: Dict[str, Any] = {}

@router.get("/list")
async def get_available_agents():
    """Get list of all available agents"""
    try:
        agents = {
            "executive": [
                {"name": "Chief of Staff Agent", "type": "chief_of_staff", "status": "available"},
                {"name": "Strategy Agent", "type": "strategy", "status": "available"},
                {"name": "Business Strategist Agent", "type": "business_strategist", "status": "available"}
            ],
            "content_creation": [
                {"name": "Brief Generator Agent", "type": "brief_generator", "status": "available"},
                {"name": "Ad Copy Agent", "type": "ad_copy", "status": "available"},
                {"name": "Content Strategist Agent", "type": "content_strategist", "status": "available"},
                {"name": "Social Media Agent", "type": "social_media", "status": "available"},
                {"name": "Writer Agent", "type": "writer", "status": "available"}
            ],
            "research_data": [
                {"name": "Research Agent", "type": "research", "status": "available"},
                {"name": "Advanced Scraper Agent", "type": "scraper", "status": "available"},
                {"name": "Lead Personalization Agent", "type": "lead_personalization", "status": "available"},
                {"name": "Data Enrichment Agent", "type": "data_enrichment", "status": "available"}
            ],
            "financial_business": [
                {"name": "Accounting Agent", "type": "accounting", "status": "available"},
                {"name": "Analytics Agent", "type": "analytics", "status": "available"}
            ],
            "creative_media": [
                {"name": "Image Generation Agent", "type": "image_generation", "status": "available"},
                {"name": "Voice Agent", "type": "voice", "status": "available"},
                {"name": "Video Editor Agent", "type": "video_editor", "status": "available"},
                {"name": "Document Processing Agent", "type": "document_processing", "status": "available"}
            ],
            "automation": [
                {"name": "Unified Automation Agent", "type": "automation", "status": "available"},
                {"name": "Visual Automation Tool", "type": "visual_automation", "status": "available"}
            ],
            "evaluator": [
                {"name": "Judge Agent", "type": "judge", "status": "available"},
                {"name": "Fact Checker Agent", "type": "fact_checker", "status": "available"},
                {"name": "Brand Checker Agent", "type": "brand_checker", "status": "available"},
                {"name": "SEO Evaluator Agent", "type": "seo_evaluator", "status": "available"}
            ],
            "orchestration": [
                {"name": "Workflow Manager Agent", "type": "workflow_manager", "status": "available"},
                {"name": "Pre-flight Planner Agent", "type": "preflight_planner", "status": "available"},
                {"name": "Contract Compiler Agent", "type": "contract_compiler", "status": "available"},
                {"name": "Quality Controller Agent", "type": "quality_controller", "status": "available"}
            ]
        }
        
        return {
            "success": True,
            "agents": agents,
            "total_agents": sum(len(category) for category in agents.values())
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get available agents: {str(e)}")

@router.get("/status")
async def get_agents_status():
    """Get status of all agents"""
    try:
        agent_status = {
            "MarketingAgent": {
                "status": "active",
                "last_activity": "2024-01-12T14:30:00Z",
                "type": "content_creation",
                "current_task": "Creating social media content",
                "performance": {
                    "tasks_completed": 45,
                    "success_rate": 0.94,
                    "avg_execution_time": "2.3 minutes"
                }
            },
            "ResearchAgent": {
                "status": "active",
                "last_activity": "2024-01-12T14:25:00Z",
                "type": "research_data",
                "current_task": "Analyzing market trends",
                "performance": {
                    "tasks_completed": 32,
                    "success_rate": 0.89,
                    "avg_execution_time": "5.1 minutes"
                }
            },
            "ContentStrategist": {
                "status": "active",
                "last_activity": "2024-01-12T14:20:00Z",
                "type": "content_creation",
                "current_task": "Planning content calendar",
                "performance": {
                    "tasks_completed": 28,
                    "success_rate": 0.96,
                    "avg_execution_time": "3.7 minutes"
                }
            },
            "BusinessStrategistAgent": {
                "status": "active",
                "last_activity": "2024-01-12T14:15:00Z",
                "type": "executive",
                "current_task": "Strategic planning",
                "performance": {
                    "tasks_completed": 12,
                    "success_rate": 0.92,
                    "avg_execution_time": "8.2 minutes"
                }
            },
            "AnalyticsAgent": {
                "status": "active",
                "last_activity": "2024-01-12T14:10:00Z",
                "type": "financial_business",
                "current_task": "Performance analysis",
                "performance": {
                    "tasks_completed": 67,
                    "success_rate": 0.98,
                    "avg_execution_time": "1.8 minutes"
                }
            }
        }
        
        return {
            "success": True,
            "agents": agent_status,
            "total_agents": len(agent_status),
            "active_agents": len([a for a in agent_status.values() if a["status"] == "active"]),
            "system_status": "healthy"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get agents status: {str(e)}")

@router.get("/workflows")
async def get_agent_workflows():
    """Get workflows managed by agents"""
    try:
        workflows = [
            {
                "workflow_id": "workflow_1",
                "status": "completed",
                "progress": 100,
                "agents_involved": ["MarketingAgent", "ResearchAgent"],
                "current_step": "Campaign launched successfully",
                "results": {
                    "campaign": {
                        "name": "Q1 Growth Campaign",
                        "target_audience": "Tech Startups",
                        "budget": 5000,
                        "duration": 30,
                        "channels": ["social", "email", "content"]
                    },
                    "estimated_reach": 50000,
                    "expected_conversions": 250
                },
                "created_at": "2024-01-11T14:30:00Z",
                "updated_at": "2024-01-12T13:30:00Z"
            },
            {
                "workflow_id": "workflow_2",
                "status": "running",
                "progress": 65,
                "agents_involved": ["ContentStrategist", "ResearchAgent"],
                "current_step": "Creating content calendar",
                "results": {},
                "created_at": "2024-01-12T12:30:00Z",
                "updated_at": "2024-01-12T14:00:00Z"
            }
        ]
        
        return {
            "success": True,
            "workflows": workflows
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get agent workflows: {str(e)}")

@router.get("/health")
async def health_check():
    """Health check for agent system"""
    return {
        "status": "healthy",
        "agent_system": "operational",
        "available_agents": 25
    }


@router.post("/optimize")
async def optimize_loop(request: OptimizeRequest):
    """Simple optimize loop endpoint that re-calls an orchestrator-like flow with analytics context."""
    try:
        # In a real implementation, pass analytics to Orchestrator and agents
        return {
            "success": True,
            "message": "Optimization loop triggered",
            "objective": request.objective,
            "recommendations": [
                {"action": "adjust_budget", "details": {"channel": "social", "delta": "+10%"}},
                {"action": "refine_targeting", "details": {"audience": "high LTV cohort"}},
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to optimize: {str(e)}")