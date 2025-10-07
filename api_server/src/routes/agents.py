"""
Agent API Routes
Handles agent status, execution, and data integration
"""

from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
import os
import json
import sys

# Allow importing guild package agents
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../..', 'guild'))

try:
    from guild.src.agents.strategy_agent import StrategyAgent  # type: ignore
except Exception:
    StrategyAgent = None  # fallback
try:
    from guild.src.agents.judge_agent import JudgeAgent  # type: ignore
except Exception:
    JudgeAgent = None
try:
    from guild.src.agents.content_intelligence_agent import ContentIntelligenceAgent  # type: ignore
except Exception:
    ContentIntelligenceAgent = None
try:
    from guild.src.agents.enhanced_campaign_agent import EnhancedCampaignAgent  # type: ignore
except Exception:
    EnhancedCampaignAgent = None
try:
    from guild.src.agents.competitive_intelligence_agent import CompetitiveIntelligenceAgent  # type: ignore
except Exception:
    CompetitiveIntelligenceAgent = None
try:
    from guild.src.agents.learning_agent import LearningAgent  # type: ignore
except Exception:
    LearningAgent = None
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


class StrategyRequest(BaseModel):
    action: Optional[str] = None
    campaign: Optional[Dict[str, Any]] = None


class JudgeRequest(BaseModel):
    action: Optional[str] = None
    campaign: Optional[Dict[str, Any]] = None
    rubric: Optional[List[str]] = None


class ContentStrategyRequest(BaseModel):
    campaign_data: Dict[str, Any]
    analysis_type: Optional[str] = None
    request: Optional[Dict[str, Any]] = None


class EnhancedCampaignRequest(BaseModel):
    action: str
    campaign_id: Optional[str] = None
    campaign_data: Optional[Dict[str, Any]] = None


class SentimentRequest(BaseModel):
    texts: List[str] = []

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


@router.post("/strategy")
async def strategy_endpoint(req: StrategyRequest):
    try:
        if StrategyAgent is None:
            # Fallback deterministic suggestions
            return {
                "angles": ["Educational value-first", "Social proof heavy", "Urgency-based"],
                "themes": ["Customer outcomes", "Behind-the-scenes", "Comparison vs status-quo"],
                "audience": ["Primary ICP", "Warm engaged list", "Lookalikes"],
                "why": "Fallback response: provide baseline guidance without model."
            }
        agent = StrategyAgent()
        result = agent.recommend_prelaunch(req.campaign or {}, action=req.action or "prelaunch_recommendations")
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Strategy agent failed: {str(e)}")


@router.post("/judge")
async def judge_endpoint(req: JudgeRequest):
    try:
        if JudgeAgent is None:
            return {
                "scores": {"clarity": 8.0, "persuasion": 7.5, "compliance": 9.0, "tone": 8.0},
                "feedback": [
                    "Clarify primary value prop in first line",
                    "Tighten CTA to a single action"
                ]
            }
        agent = JudgeAgent()
        result = agent.evaluate_creative(req.campaign or {}, req.rubric or ["clarity","persuasion","compliance","tone"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Judge agent failed: {str(e)}")


@router.post("/content-strategy")
async def content_strategy_endpoint(req: ContentStrategyRequest):
    try:
        if ContentIntelligenceAgent is None:
            # Fallback basic predictions
            return {
                "confidence_scores": {"overall": 85, "audience_match": 90, "budget_efficiency": 76},
                "predictions": {
                    "expected_reach": {"min": 10000, "max": 18000},
                    "estimated_clicks": {"min": 350, "max": 650},
                    "predicted_ctr": {"min": 2.5, "max": 4.1},
                    "expected_conversions": {"min": 20, "max": 40},
                    "roi_prediction": {"min": 250, "max": 420}
                },
                "insights": ["Audience shows strong engagement potential"]
            }
        agent = ContentIntelligenceAgent()
        result = agent.analyze_campaign(req.campaign_data, analysis_type=req.analysis_type or "campaign_prediction")
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Content strategy failed: {str(e)}")


@router.post("/enhanced-campaign")
async def enhanced_campaign_endpoint(req: EnhancedCampaignRequest):
    try:
        if EnhancedCampaignAgent is None:
            return {"status": "queued", "message": "Fallback: no agent wired, accepted action", "action": req.action}
        agent = EnhancedCampaignAgent()
        result = agent.handle_action(req.action, req.campaign_data or {}, req.campaign_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Enhanced campaign agent failed: {str(e)}")


@router.get("/benchmarks")
async def get_benchmarks():
    # Centralize ads/email benchmarks for frontend
    return {
        "ads": {"ctr_min": 1.2, "roas_min": 2.5, "cpa_max": 60},
        "email": {"delivery_min": 97, "open_rate_min": 22, "click_rate_min": 2.5, "unsubscribe_max": 0.4, "bounce_max": 1.0}
    }


@router.get("/competitive")
async def get_competitive():
    try:
        if CompetitiveIntelligenceAgent is None:
            return {
                "facebook": {"cpa_avg": 40, "ctr_avg": 1.5, "roas_avg": 2.8},
                "instagram": {"cpa_avg": 45, "ctr_avg": 1.7, "roas_avg": 3.0},
                "google": {"cpa_avg": 55, "ctr_avg": 2.5, "roas_avg": 3.2},
                "tiktok": {"cpa_avg": 35, "ctr_avg": 2.2, "roas_avg": 2.6},
                "linkedin": {"cpa_avg": 80, "ctr_avg": 0.9, "roas_avg": 2.2},
                "twitter": {"cpa_avg": 50, "ctr_avg": 1.2, "roas_avg": 2.0}
            }
        agent = CompetitiveIntelligenceAgent()
        return agent.get_platform_benchmarks()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Competitive agent failed: {str(e)}")


@router.post("/sentiment")
async def analyze_sentiment_endpoint(req: SentimentRequest):
    # Simple inline analyzer as fallback; can be replaced by NLP agent
    texts = req.texts or []
    scores = []
    for t in texts:
        s = (t or "").lower()
        if any(k in s for k in ["love","great","amazing","awesome","fantastic"]):
            scores.append(0.8)
        elif any(k in s for k in ["bad","hate","terrible","awful"]):
            scores.append(0.2)
        else:
            scores.append(0.5)
    avg = sum(scores)/len(scores) if scores else 0.5
    return {
        "average": avg,
        "distribution": {
            "positive": len([x for x in scores if x>0.66]),
            "neutral": len([x for x in scores if 0.33<=x<=0.66]),
            "negative": len([x for x in scores if x<0.33])
        }
    }


# Lightweight server-side persistence for campaign activity and AB results (in-memory fallback)
_activity_log: Dict[str, List[Dict[str, Any]]] = {}
_ab_results: Dict[str, Dict[str, Any]] = {}
_attribution: Dict[str, List[str]] = {}


@router.post("/campaigns/{campaign_id}/activity")
async def append_activity(campaign_id: str, entry: Dict[str, Any]):
    arr = _activity_log.setdefault(campaign_id, [])
    entry = {**entry, "ts": entry.get("ts") or __import__("datetime").datetime.utcnow().isoformat()}
    arr.append(entry)
    return {"success": True}


@router.get("/campaigns/{campaign_id}/activity")
async def get_activity(campaign_id: str):
    return _activity_log.get(campaign_id, [])


@router.post("/campaigns/{campaign_id}/ab_results")
async def save_ab_results(campaign_id: str, results: Dict[str, Any]):
    _ab_results[campaign_id] = results
    return {"success": True}


@router.get("/campaigns/{campaign_id}/ab_results")
async def load_ab_results(campaign_id: str):
    return _ab_results.get(campaign_id, {})


def _normalize_ab_payload(payload: Dict[str, Any]) -> Dict[str, Any]:
    # Accepts various shapes; normalizes to { A: { ctr, conversions }, B: { ... } }
    def pick(side: Any) -> Dict[str, Any]:
        if not isinstance(side, dict):
            return {}
        ctr = side.get("ctr") or side.get("click_through_rate") or side.get("click_rate")
        conv = side.get("conversions") or side.get("purchases") or side.get("leads")
        try:
            ctr = float(ctr) if ctr is not None else None
        except Exception:
            ctr = None
        try:
            conv = int(conv) if conv is not None else None
        except Exception:
            try:
                conv = int(float(conv)) if conv is not None else None
            except Exception:
                conv = None
        result: Dict[str, Any] = {}
        if ctr is not None:
            result["ctr"] = ctr
        if conv is not None:
            result["conversions"] = conv
        return result
    out: Dict[str, Any] = {}
    if "A" in payload or "B" in payload:
        out["A"] = pick(payload.get("A"))
        out["B"] = pick(payload.get("B"))
    else:
        # Maybe keys like variant_a / variant_b
        out["A"] = pick(payload.get("variant_a", {}))
        out["B"] = pick(payload.get("variant_b", {}))
    return out


@router.post("/campaigns/{campaign_id}/ab_ingest")
async def ingest_ab_results(campaign_id: str, payload: Dict[str, Any]):
    try:
        normalized = _normalize_ab_payload(payload)
        existing = _ab_results.get(campaign_id, {})
        merged = { **existing, **normalized }
        _ab_results[campaign_id] = merged
        return { "success": True, "ab_results": merged }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid A/B payload: {str(e)}")


@router.post("/campaigns/{campaign_id}/attribution")
async def save_attribution(campaign_id: str, touches: List[str]):
    # touches should be an ordered list of channel keys
    _attribution[campaign_id] = touches
    return {"success": True}


@router.get("/campaigns/{campaign_id}/attribution")
async def get_attribution(campaign_id: str):
    return {"touches": _attribution.get(campaign_id, [])}


# --- Cross-agent learning loop ---

class LearningSignal(BaseModel):
    campaign_id: Optional[str] = None
    metrics: Dict[str, Any] = {}
    context: Optional[Dict[str, Any]] = None


@router.post("/learning/ingest")
async def learning_ingest(signal: LearningSignal):
    try:
        if LearningAgent is None:
            # Fallback: accept and echo
            return {"accepted": True, "stored": False, "message": "Learning agent unavailable; signal accepted"}
        agent = LearningAgent()
        agent.ingest_signal(signal.metrics, context=signal.context or {}, campaign_id=signal.campaign_id)
        return {"accepted": True, "stored": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Learning ingest failed: {str(e)}")


@router.get("/learning/recommendations")
async def learning_recommendations(campaign_id: Optional[str] = None):
    try:
        if LearningAgent is None:
            return {
                "recommendations": [
                    {"action": "increase_budget", "reason": "Sustained ROAS > 3x over 7 days", "confidence": 0.82},
                    {"action": "refresh_creatives", "reason": "CTR decay detected vs benchmark", "confidence": 0.74}
                ]
            }
        agent = LearningAgent()
        recs = agent.get_recommendations(campaign_id=campaign_id)
        return {"recommendations": recs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Learning recommendations failed: {str(e)}")


@router.get("/learning/updates/{campaign_id}")
async def learning_updates(campaign_id: str):
    try:
        if LearningAgent is None:
            return {"updates": []}
        agent = LearningAgent()
        updates = agent.get_recent_updates(campaign_id)
        return {"updates": updates}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Learning updates failed: {str(e)}")

import uuid
from datetime import datetime

_orchestrate_execs: Dict[str, List[Dict[str, Any]]] = {}

@router.post("/orchestrate/launch")
async def orchestrate_launch(payload: Dict[str, Any]):
    """
    Initiate an orchestrated workflow to implement AI recommendations for a document/task.
    Lightweight implementation that records an execution log in-memory and returns identifiers.
    """
    try:
        workflow_id = payload.get("workflow_id") or f"wf-{uuid.uuid4()}"
        execution_id = f"exec-{uuid.uuid4()}"
        recommendations = payload.get("recommendations") or []
        now = datetime.utcnow().isoformat() + "Z"
        log = _orchestrate_execs.setdefault(workflow_id, [])
        log.append({
            "execution_id": execution_id,
            "ts": now,
            "agent_name": "Orchestrator",
            "agent_type": "orchestrator",
            "status": "started",
            "result": {"message": "Recommendations intake", "count": len(recommendations)}
        })
        for rec in recommendations[:10]:
            log.append({
                "execution_id": execution_id,
                "ts": datetime.utcnow().isoformat() + "Z",
                "agent_name": "AutomationAgent",
                "agent_type": "automation",
                "status": "queued",
                "result": {"action": rec}
            })
        return {"status": "started", "workflow_id": workflow_id, "execution_id": execution_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to launch orchestration: {str(e)}")

@router.get("/orchestrate/executions/{workflow_id}")
async def orchestrate_executions(workflow_id: str):
    """
    Retrieve in-memory execution log for an orchestrated recommendations run.
    """
    return _orchestrate_execs.get(workflow_id, [])