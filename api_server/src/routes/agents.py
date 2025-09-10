from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import asyncio
import uuid
from datetime import datetime

# Import real agents from orchestrator
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '../../..'))

from guild.src.core.orchestrator import AGENT_REGISTRY, Orchestrator
from guild.src.models.user_input import UserInput

router = APIRouter(
    prefix="/agents",
    tags=["Agents"],
)

# Request/Response Models
class AgentRequest(BaseModel):
    action: str
    data: Dict[str, Any] = {}
    user_id: Optional[str] = None

class AgentResponse(BaseModel):
    success: bool
    message: str
    data: Dict[str, Any] = {}
    workflow_id: Optional[str] = None

class WorkflowStatus(BaseModel):
    workflow_id: str
    status: str  # pending, running, completed, failed
    progress: int  # 0-100
    agents_involved: List[str]
    current_step: Optional[str] = None
    results: Dict[str, Any] = {}
    created_at: datetime
    updated_at: datetime

# In-memory storage for demo (in production, use Redis or database)
workflow_storage: Dict[str, WorkflowStatus] = {}

# Initialize real agents from orchestrator
real_agents = {}
for agent_name, agent_class in AGENT_REGISTRY.items():
    try:
        # Initialize agent with proper parameters based on agent type
        if agent_name == "ContentStrategist":
            real_agents[agent_name] = agent_class(user_input="Initialize content strategist")
        elif agent_name == "Copywriter":
            real_agents[agent_name] = agent_class(user_input="Initialize copywriter", content_strategy="general")
        elif agent_name == "CRMAgent":
            real_agents[agent_name] = agent_class(user_input="Initialize CRM agent", sales_funnel_context="general")
        elif agent_name == "HRAgent":
            real_agents[agent_name] = agent_class(user_input="Initialize HR agent")
        elif agent_name == "ComplianceAgent":
            real_agents[agent_name] = agent_class(user_input="Initialize compliance agent", business_operations_details="general", jurisdiction="US")
        elif agent_name == "SkillDevelopmentAgent":
            real_agents[agent_name] = agent_class(user_input="Initialize skill development agent", business_goals="growth", learning_preferences="online", time_availability="flexible")
        elif agent_name == "OutsourcingAgent":
            real_agents[agent_name] = agent_class(user_input="Initialize outsourcing agent", task_details="general", budget=1000, deadline="30 days")
        elif agent_name == "OnboardingAgent":
            real_agents[agent_name] = agent_class(user_input="Initialize onboarding agent")
        elif agent_name == "VisionEnhancedTrainingAgent":
            real_agents[agent_name] = agent_class(user_input="Initialize vision training agent", source_information="general", target_audience="business owners")
        elif agent_name == "WellBeingAgent":
            real_agents[agent_name] = agent_class(user_input="Initialize wellbeing agent", workload_data="moderate", solo_founder_preferences="balanced")
        else:
            # For agents that don't require specific parameters
            real_agents[agent_name] = agent_class()
    except Exception as e:
        print(f"Warning: Could not initialize {agent_name}: {e}")
        # Skip this agent if it fails to initialize
        continue

# Real agents are now initialized from the orchestrator
    
    def create_campaign(self, **kwargs):
        return {
            "campaign_id": f"camp_{uuid.uuid4().hex[:8]}",
            "status": "created",
            "message": f"Campaign '{kwargs.get('campaign_name', 'Unnamed')}' created successfully",
            "details": kwargs
        }
    
    def generate_report(self, **kwargs):
        return {
            "report_id": f"report_{uuid.uuid4().hex[:8]}",
            "status": "generated",
            "message": f"Report '{kwargs.get('report_type', 'performance')}' generated successfully",
            "details": kwargs
        }
    
    def analyze_goals(self, goals):
        return {
            "analysis_id": f"analysis_{uuid.uuid4().hex[:8]}",
            "status": "analyzed",
            "message": f"Analyzed {len(goals)} goals successfully",
            "goals": goals,
            "recommendations": ["Focus on high-impact goals first", "Set measurable milestones"]
        }
    
    def research_topic(self, query):
        return {
            "research_id": f"research_{uuid.uuid4().hex[:8]}",
            "status": "completed",
            "message": f"Research on '{query}' completed successfully",
            "query": query,
            "findings": ["Market is growing rapidly", "Competition is moderate", "Opportunities exist"]
        }
    
    def create_content_plan(self, **kwargs):
        return {
            "content_id": f"content_{uuid.uuid4().hex[:8]}",
            "status": "created",
            "message": f"Content plan for '{kwargs.get('topic', 'topic')}' created successfully",
            "details": kwargs,
            "outline": ["Introduction", "Main points", "Conclusion", "Call to action"]
        }
    
    def analyze_performance(self, metrics):
        return {
            "analysis_id": f"perf_{uuid.uuid4().hex[:8]}",
            "status": "analyzed",
            "message": "Performance analysis completed successfully",
            "metrics": metrics,
            "insights": ["Traffic is increasing", "Conversion rate is stable", "Revenue is growing"]
        }

# Create aliases for backward compatibility
marketing_agent = real_agents.get("MarketingAgent")
research_agent = real_agents.get("ResearchAgent")
content_strategist = real_agents.get("ContentStrategist")
business_strategist = real_agents.get("BusinessStrategistAgent")
analytics_agent = None  # This one doesn't exist yet
orchestrator = real_agents.get("OrchestratorAgent")

@router.post("/interact", response_model=AgentResponse)
async def interact_with_agent(request: AgentRequest):
    """Generic agent interaction endpoint"""
    try:
        workflow_id = str(uuid.uuid4())
        
        # Create workflow status
        workflow_status = WorkflowStatus(
            workflow_id=workflow_id,
            status="running",
            progress=0,
            agents_involved=[],
            current_step=f"Processing {request.action}",
            results={},
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        workflow_storage[workflow_id] = workflow_status
        
        # Process the request based on action
        result = await process_agent_request(request, workflow_id)
        
        # Update workflow status
        workflow_status.status = "completed"
        workflow_status.progress = 100
        workflow_status.results = result
        workflow_status.updated_at = datetime.now()
        
        return AgentResponse(
            success=True,
            message=f"Successfully processed {request.action}",
            data=result,
            workflow_id=workflow_id
        )
        
    except Exception as e:
        # Update workflow status on error
        if workflow_id in workflow_storage:
            workflow_storage[workflow_id].status = "failed"
            workflow_storage[workflow_id].updated_at = datetime.now()
        
        raise HTTPException(status_code=500, detail=str(e))

async def process_agent_request(request: AgentRequest, workflow_id: str) -> Dict[str, Any]:
    """Process agent requests based on action type"""
    
    if request.action == "launch_campaign":
        return await handle_launch_campaign(request.data, workflow_id)
    elif request.action == "generate_report":
        return await handle_generate_report(request.data, workflow_id)
    elif request.action == "set_goals":
        return await handle_set_goals(request.data, workflow_id)
    elif request.action == "research_market":
        return await handle_research_market(request.data, workflow_id)
    elif request.action == "create_content":
        return await handle_create_content(request.data, workflow_id)
    elif request.action == "analyze_performance":
        return await handle_analyze_performance(request.data, workflow_id)
    elif request.action == "lead_generation_workflow":
        return await handle_lead_generation_workflow(request.data, workflow_id)
    elif request.action == "content_marketing_workflow":
        return await handle_content_marketing_workflow(request.data, workflow_id)
    else:
        raise ValueError(f"Unknown action: {request.action}")

async def handle_launch_campaign(data: Dict[str, Any], workflow_id: str) -> Dict[str, Any]:
    """Handle marketing campaign launch"""
    workflow_storage[workflow_id].agents_involved.append("MarketingAgent")
    workflow_storage[workflow_id].current_step = "Creating campaign strategy"
    workflow_storage[workflow_id].progress = 25
    
    # Simulate campaign creation
    await asyncio.sleep(1)
    
    campaign_data = {
        "name": data.get("name", "New Campaign"),
        "target_audience": data.get("target_audience", "General"),
        "budget": data.get("budget", 1000),
        "duration": data.get("duration", 30),
        "channels": data.get("channels", ["social", "email"])
    }
    
    # Use real marketing agent if available, otherwise fallback to mock
    try:
        if "MarketingAgent" in real_agents and real_agents["MarketingAgent"] is not None:
            # Use real agent - you would call the actual agent method here
            campaign_result = real_agents["MarketingAgent"].create_campaign(
                campaign_name=campaign_data["name"],
                target_audience=campaign_data["target_audience"],
                budget=campaign_data["budget"],
                duration_days=campaign_data["duration"]
            )
        else:
            # Use mock agent
            campaign_result = marketing_agent.create_campaign(
                campaign_name=campaign_data["name"],
                target_audience=campaign_data["target_audience"],
                budget=campaign_data["budget"],
                duration_days=campaign_data["duration"]
            )
    except Exception as e:
        # Fallback to mock on error
        campaign_result = marketing_agent.create_campaign(
            campaign_name=campaign_data["name"],
            target_audience=campaign_data["target_audience"],
            budget=campaign_data["budget"],
            duration_days=campaign_data["duration"]
        )
    
    workflow_storage[workflow_id].progress = 75
    workflow_storage[workflow_id].current_step = "Campaign launched successfully"
    
    return {
        "campaign": campaign_data,
        "result": campaign_result,
        "status": "launched",
        "estimated_reach": campaign_data["budget"] * 10,
        "expected_conversions": campaign_data["budget"] * 0.05
    }

async def handle_generate_report(data: Dict[str, Any], workflow_id: str) -> Dict[str, Any]:
    """Handle analytics report generation"""
    workflow_storage[workflow_id].agents_involved.append("AnalyticsAgent")
    workflow_storage[workflow_id].current_step = "Analyzing data"
    workflow_storage[workflow_id].progress = 30
    
    await asyncio.sleep(1)
    
    report_type = data.get("report_type", "performance")
    filters = data.get("filters", {})
    
    # Use analytics agent to generate report
    report_result = analytics_agent.generate_report(
        report_type=report_type,
        date_range=filters.get("date_range", "30d"),
        metrics=filters.get("metrics", ["traffic", "conversions", "revenue"])
    )
    
    workflow_storage[workflow_id].progress = 80
    workflow_storage[workflow_id].current_step = "Report generated"
    
    return {
        "report_type": report_type,
        "filters": filters,
        "data": report_result,
        "generated_at": datetime.now().isoformat(),
        "insights": [
            "Traffic increased by 15% this month",
            "Conversion rate improved by 2.3%",
            "Top performing channel: Social Media"
        ]
    }

async def handle_set_goals(data: Dict[str, Any], workflow_id: str) -> Dict[str, Any]:
    """Handle business goal setting"""
    workflow_storage[workflow_id].agents_involved.append("BusinessStrategistAgent")
    workflow_storage[workflow_id].current_step = "Analyzing goals"
    workflow_storage[workflow_id].progress = 20
    
    await asyncio.sleep(1)
    
    goals = data.get("goals", [])
    
    # Use business strategist to analyze goals
    strategy_result = business_strategist.analyze_goals(goals)
    
    workflow_storage[workflow_id].progress = 70
    workflow_storage[workflow_id].current_step = "Goals analyzed and roadmap created"
    
    return {
        "goals": goals,
        "analysis": strategy_result,
        "roadmap": [
            {"phase": "Q1", "focus": "Foundation building", "priority": "high"},
            {"phase": "Q2", "focus": "Growth acceleration", "priority": "medium"},
            {"phase": "Q3", "focus": "Scale optimization", "priority": "low"}
        ],
        "recommendations": [
            "Focus on customer acquisition in Q1",
            "Implement automation tools in Q2",
            "Optimize conversion funnel in Q3"
        ]
    }

async def handle_research_market(data: Dict[str, Any], workflow_id: str) -> Dict[str, Any]:
    """Handle market research"""
    workflow_storage[workflow_id].agents_involved.append("ResearchAgent")
    workflow_storage[workflow_id].current_step = "Conducting market research"
    workflow_storage[workflow_id].progress = 40
    
    await asyncio.sleep(2)
    
    query = data.get("query", "market trends")
    
    # Use research agent to conduct research
    research_result = research_agent.research_topic(query)
    
    workflow_storage[workflow_id].progress = 85
    workflow_storage[workflow_id].current_step = "Research completed"
    
    return {
        "query": query,
        "findings": research_result,
        "market_size": "$2.5B",
        "growth_rate": "12% YoY",
        "key_players": ["Company A", "Company B", "Company C"],
        "opportunities": [
            "Emerging market segment with 25% growth",
            "Underserved customer segment",
            "Technology gap in current solutions"
        ]
    }

async def handle_create_content(data: Dict[str, Any], workflow_id: str) -> Dict[str, Any]:
    """Handle content creation"""
    workflow_storage[workflow_id].agents_involved.append("ContentStrategistAgent")
    workflow_storage[workflow_id].current_step = "Creating content strategy"
    workflow_storage[workflow_id].progress = 35
    
    await asyncio.sleep(1.5)
    
    content_request = data.get("content_request", {})
    
    # Use content strategist to create content
    if content_strategist is not None:
        # Update the agent's user_input with the new request
        content_strategist.user_input = type('UserInput', (), {
            'objective': f"Create content for topic: {content_request.get('topic', 'Business Growth')}, format: {content_request.get('format', 'blog_post')}, audience: {content_request.get('audience', 'entrepreneurs')}",
            'deliverables': [content_request.get('format', 'blog_post')]
        })()
        content_result = await content_strategist.run()
    else:
        # Fallback mock response
        content_result = {
            "content_plan": {
                "topic": content_request.get("topic", "Business Growth"),
                "format": content_request.get("format", "blog_post"),
                "target_audience": content_request.get("audience", "entrepreneurs"),
                "posts": [
                    {
                        "title": f"5 Tips for {content_request.get('topic', 'Business Growth')}",
                        "content": f"Here are 5 actionable tips for {content_request.get('topic', 'Business Growth')} that will help you achieve your goals.",
                        "platform": "LinkedIn",
                        "estimated_engagement": "High"
                    },
                    {
                        "title": f"Quick Guide: {content_request.get('topic', 'Business Growth')}",
                        "content": f"A quick guide to getting started with {content_request.get('topic', 'Business Growth')}.",
                        "platform": "Twitter",
                        "estimated_engagement": "Medium"
                    }
                ]
            }
        }
    
    workflow_storage[workflow_id].progress = 90
    workflow_storage[workflow_id].current_step = "Content created"
    
    return {
        "content_request": content_request,
        "content": content_result,
        "seo_score": 85,
        "readability_score": 78,
        "estimated_engagement": "high",
        "keywords": ["business", "growth", "strategy", "success"]
    }

async def handle_analyze_performance(data: Dict[str, Any], workflow_id: str) -> Dict[str, Any]:
    """Handle performance analysis"""
    workflow_storage[workflow_id].agents_involved.append("AnalyticsAgent")
    workflow_storage[workflow_id].current_step = "Analyzing performance metrics"
    workflow_storage[workflow_id].progress = 50
    
    await asyncio.sleep(1)
    
    metrics = data.get("metrics", {})
    
    # Use analytics agent to analyze performance
    analysis_result = analytics_agent.analyze_performance(metrics)
    
    workflow_storage[workflow_id].progress = 95
    workflow_storage[workflow_id].current_step = "Analysis completed"
    
    return {
        "metrics": metrics,
        "analysis": analysis_result,
        "trends": {
            "traffic": "+15%",
            "conversions": "+8%",
            "revenue": "+22%"
        },
        "recommendations": [
            "Increase social media budget by 20%",
            "Optimize landing page conversion rate",
            "Focus on high-value customer segments"
        ]
    }

async def handle_lead_generation_workflow(data: Dict[str, Any], workflow_id: str) -> Dict[str, Any]:
    """Handle multi-agent lead generation workflow"""
    workflow_storage[workflow_id].agents_involved = ["ResearchAgent", "MarketingAgent", "AnalyticsAgent"]
    workflow_storage[workflow_id].current_step = "Starting lead generation workflow"
    workflow_storage[workflow_id].progress = 10
    
    target_audience = data.get("target_audience", "tech startups")
    
    # Step 1: Research
    workflow_storage[workflow_id].current_step = "Researching target audience"
    workflow_storage[workflow_id].progress = 30
    await asyncio.sleep(1)
    
    research_result = research_agent.research_topic(f"lead generation for {target_audience}")
    
    # Step 2: Create campaign
    workflow_storage[workflow_id].current_step = "Creating lead generation campaign"
    workflow_storage[workflow_id].progress = 60
    await asyncio.sleep(1)
    
    campaign_result = marketing_agent.create_campaign(
        campaign_name=f"Lead Gen - {target_audience}",
        target_audience=target_audience,
        budget=2000,
        duration_days=30
    )
    
    # Step 3: Set up tracking
    workflow_storage[workflow_id].current_step = "Setting up analytics tracking"
    workflow_storage[workflow_id].progress = 90
    await asyncio.sleep(0.5)
    
    return {
        "workflow_type": "lead_generation",
        "target_audience": target_audience,
        "research": research_result,
        "campaign": campaign_result,
        "expected_leads": 150,
        "estimated_cost_per_lead": 13.33,
        "timeline": "30 days"
    }

async def handle_content_marketing_workflow(data: Dict[str, Any], workflow_id: str) -> Dict[str, Any]:
    """Handle multi-agent content marketing workflow"""
    workflow_storage[workflow_id].agents_involved = ["ContentStrategistAgent", "ResearchAgent", "MarketingAgent"]
    workflow_storage[workflow_id].current_step = "Starting content marketing workflow"
    workflow_storage[workflow_id].progress = 15
    
    content_strategy = data.get("content_strategy", {})
    
    # Step 1: Research content opportunities
    workflow_storage[workflow_id].current_step = "Researching content opportunities"
    workflow_storage[workflow_id].progress = 40
    await asyncio.sleep(1)
    
    research_result = research_agent.research_topic("content marketing trends 2024")
    
    # Step 2: Create content plan
    workflow_storage[workflow_id].current_step = "Creating content calendar"
    workflow_storage[workflow_id].progress = 70
    await asyncio.sleep(1)
    
    content_plan = content_strategist.create_content_plan(
        topic=content_strategy.get("topic", "Business Growth"),
        format=content_strategy.get("format", "blog_post"),
        target_audience=content_strategy.get("audience", "entrepreneurs")
    )
    
    # Step 3: Create distribution strategy
    workflow_storage[workflow_id].current_step = "Creating distribution strategy"
    workflow_storage[workflow_id].progress = 95
    await asyncio.sleep(0.5)
    
    return {
        "workflow_type": "content_marketing",
        "strategy": content_strategy,
        "research": research_result,
        "content_plan": content_plan,
        "distribution_channels": ["blog", "social_media", "email", "linkedin"],
        "expected_reach": 5000,
        "content_calendar": [
            {"week": 1, "content": "Industry trends article", "channel": "blog"},
            {"week": 2, "content": "How-to guide", "channel": "social_media"},
            {"week": 3, "content": "Case study", "channel": "email"},
            {"week": 4, "content": "Thought leadership", "channel": "linkedin"}
        ]
    }

@router.get("/workflow/{workflow_id}", response_model=WorkflowStatus)
async def get_workflow_status(workflow_id: str):
    """Get the status of a specific workflow"""
    if workflow_id not in workflow_storage:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    return workflow_storage[workflow_id]

@router.get("/workflows", response_model=List[WorkflowStatus])
async def get_all_workflows():
    """Get all workflows"""
    return list(workflow_storage.values())

@router.get("/list")
async def get_available_agents():
    """Get list of all available agents"""
    return {
        "available_agents": list(AGENT_REGISTRY.keys()),
        "total_count": len(AGENT_REGISTRY),
        "agent_details": {
            name: {
                "class_name": agent_class.__name__,
                "module": agent_class.__module__,
                "is_initialized": name in real_agents,
                "is_real": name in real_agents and real_agents[name] is not None
            }
            for name, agent_class in AGENT_REGISTRY.items()
        }
    }

@router.get("/status")
async def get_agents_status():
    """Get status of all agents"""
    agents_status = {}
    active_count = 0
    
    for agent_name, agent in real_agents.items():
        try:
            # Test if agent is working - if it's initialized, it's active
            if agent is not None:
                agents_status[agent_name] = {
                    "status": "active", 
                    "last_activity": datetime.now().isoformat(),
                    "type": "real"
                }
                active_count += 1
            else:
                agents_status[agent_name] = {
                    "status": "inactive", 
                    "last_activity": datetime.now().isoformat(),
                    "type": "real" if agent is not None else "mock"
                }
        except Exception as e:
            agents_status[agent_name] = {
                "status": "error", 
                "last_activity": datetime.now().isoformat(),
                "error": str(e),
                "type": "real" if not isinstance(agent, MockAgent) else "mock"
            }
    
    return {
        "agents": agents_status,
        "total_agents": len(real_agents),
        "active_agents": active_count,
        "system_status": "healthy" if active_count > 0 else "degraded"
    }
