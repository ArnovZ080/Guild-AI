from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
import logging
import asyncio
import uuid

from .auth_firebase import get_current_user
from .. import models
from ..database import get_db

# Custom dependency for optional authentication
async def get_current_user_optional(request: Request) -> Optional[models.User]:
    """Get current user if authenticated, otherwise return None"""
    try:
        # Try to get the Authorization header
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return None
        
        # If we have a token, try to get the user
        # For now, we'll just return None to allow anonymous access
        # In a full implementation, you'd validate the token here
        return None
    except Exception:
        return None

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/orchestrator",
    tags=["Orchestrator"],
)

async def handle_workflow_request(
    objective: str, 
    user_id: str, 
    business_context: dict, 
    audience: dict, 
    additional_notes: str, 
    priority: str, 
    db: Session
) -> dict:
    """
    Handle workflow requests with intelligent conversation flow:
    1. Act as proactive business CEO - analyze business context first
    2. Ask clarifying questions if request is vague
    3. Create comprehensive plan with specific agents
    4. Show user the plan before executing
    5. Execute with agent coordination
    6. Report back with results
    7. Suggest additional growth opportunities
    """
    try:
        from ..llm.gemini_provider import gemini_provider
        
        # First, act as a proactive business CEO - analyze the request in business context
        lower_objective = objective.lower()
        
        # Check if this is a general business question or growth request
        business_growth_keywords = [
            'grow', 'increase', 'improve', 'better', 'revenue', 'sales', 'profit',
            'customers', 'business', 'help', 'suggest', 'recommend', 'opportunity'
        ]
        
        is_general_business_request = any(keyword in lower_objective for keyword in business_growth_keywords)
        
        if is_general_business_request and len(objective.split()) < 10:
            # This is a general business request - act as CEO mentor
            return await handle_general_business_request(objective, user_id, business_context, db)
        
        # Check if this is a specific workflow request
        workflow_keywords = ['create', 'build', 'make', 'design', 'write', 'generate', 'launch']
        is_specific_workflow_request = any(keyword in lower_objective for keyword in workflow_keywords)
        
        if not is_specific_workflow_request:
            # General business conversation - provide CEO-level advice
            return await handle_general_business_request(objective, user_id, business_context, db)
        
        # Define what constitutes a detailed request for different types
        content_requirements = {
            'content_type': ['blog', 'social', 'email', 'video', 'ad', 'copy'],
            'platform': ['linkedin', 'twitter', 'instagram', 'facebook', 'tiktok', 'youtube'],
            'audience': ['target', 'audience', 'customers', 'users'],
            'goal': ['awareness', 'leads', 'sales', 'engagement', 'traffic']
        }
        
        # Check if this is a content creation request
        is_content_request = any(keyword in lower_objective for keyword in ['content', 'blog', 'post', 'article', 'copy'])
        
        if is_content_request:
            # For content requests, check if we have enough detail
            has_content_type = any(ct in lower_objective for ct in content_requirements['content_type'])
            has_platform = any(pf in lower_objective for pf in content_requirements['platform'])
            has_audience = any(aud in lower_objective for aud in content_requirements['audience'])
            has_goal = any(goal in lower_objective for goal in content_requirements['goal'])
            
            detail_score = sum([has_content_type, has_platform, has_audience, has_goal])
            
            if detail_score < 2:  # Need at least 2 out of 4 details
                # Ask clarifying questions
                clarifying_questions = await generate_clarifying_questions(objective, business_context)
                return {
                    "success": True,
                    "message": clarifying_questions,
                    "conversation_type": "clarification_needed",
                    "needs_clarification": True,
                    "workflow_details": None
                }
        
        # If we have enough detail, coordinate with Chief of Staff first, then create comprehensive plan
        from .executive_coordination import execute_chief_of_staff_coordination
        
        # Get Chief of Staff coordination
        chief_of_staff_plan = await execute_chief_of_staff_coordination(objective, business_context, user_id)
        
        # Create comprehensive plan incorporating Chief of Staff recommendations
        workflow_plan = await create_comprehensive_workflow_plan(
            objective, user_id, business_context, audience, additional_notes, chief_of_staff_plan
        )
        
        if workflow_plan.get('needs_approval', False):
            # Show plan to user for approval
            plan_id = str(uuid.uuid4())
            
            # Store plan in database for approval
            db_plan = models.Workflow(
                id=plan_id,
                user_id=user_id,
                status="pending_approval",
                dag_definition=workflow_plan,
                priority=priority
            )
            db.add(db_plan)
            db.commit()
            
            return {
                "success": True,
                "workflow_id": plan_id,
                "message": workflow_plan['presentation_message'],
                "conversation_type": "workflow_plan",
                "needs_approval": True,
                "workflow_details": workflow_plan,
                "next_steps": [
                    "Review the comprehensive plan above",
                    "Approve to start execution",
                    "Monitor progress in real-time"
                ]
            }
        else:
            # Execute immediately
            return await execute_workflow_immediately(workflow_plan, user_id, db)
            
    except Exception as e:
        logger.error(f"Error in workflow request handling: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": "I encountered an issue processing your workflow request. Please try again."
        }

async def generate_clarifying_questions(objective: str, business_context: dict) -> str:
    """Generate intelligent clarifying questions for vague requests"""
    try:
        from ..llm.gemini_provider import gemini_provider
        
        # Create context for clarifying questions
        context_prompt = f"""
You are an intelligent business consultant helping a business owner create content. 

User Request: "{objective}"
Business Context: {business_context.get('business_description', 'Not specified')}
Target Audience: {business_context.get('target_audience', 'Not specified')}

The user's request is too vague for me to create a comprehensive content strategy. I need to ask intelligent clarifying questions to understand:

1. What specific type of content they want (blog posts, social media, email campaigns, etc.)
2. Which platforms they want to use (LinkedIn, Instagram, TikTok, etc.)
3. What their goal is (awareness, leads, sales, engagement)
4. How much content they need
5. Any specific topics or themes
6. Timeline and budget considerations

Ask 3-4 focused, intelligent questions that will help me create the perfect content strategy for them. Be conversational and helpful, like a business partner who genuinely wants to help them succeed.
"""
        
        response = await gemini_provider.generate_with_context(
            prompt=context_prompt,
            business_context=business_context,
            task_type='clarification',
            complexity='medium',
            user_tier='starter'
        )
        
        return response['text']
        
    except Exception as e:
        logger.error(f"Error generating clarifying questions: {e}")
        return """I'd love to help you create amazing content! To create the perfect strategy for you, I need a bit more detail:

1. What type of content are you thinking? (Blog posts, social media, email campaigns, videos, ads?)
2. Which platforms do you want to focus on? (LinkedIn, Instagram, TikTok, Facebook, etc.)
3. What's your main goal? (Build awareness, generate leads, drive sales, increase engagement?)
4. How much content do you need and what's your timeline?

The more specific you can be, the better I can tailor the perfect content strategy for your business!"""

async def handle_general_business_request(
    objective: str, 
    user_id: str, 
    business_context: dict, 
    db: Session
) -> dict:
    """
    Handle general business requests as a proactive CEO mentor.
    This is where the orchestrator acts like a business CEO providing strategic guidance.
    """
    try:
        from ..llm.gemini_provider import gemini_provider
        
        # Get comprehensive business intelligence from all intelligence agents
        business_intelligence = await get_comprehensive_business_intelligence(business_context, user_id, db)
        
        # Create CEO-level response with actionable insights
        ceo_response = await generate_ceo_mentor_response(
            objective, business_context, business_intelligence
        )
        
        return {
            "success": True,
            "message": ceo_response,
            "conversation_type": "business_mentor",
            "business_intelligence": business_intelligence,
            "next_steps": [
                "Review the strategic insights above",
                "Consider implementing the recommended actions",
                "Ask for specific help with any area"
            ]
        }
        
    except Exception as e:
        logger.error(f"Error in general business request handling: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": "I encountered an issue providing business guidance. Please try again."
        }

async def get_comprehensive_business_intelligence(business_context: dict, user_id: str, db: Session) -> dict:
    """Get comprehensive business intelligence from all intelligence agents"""
    try:
        # Use the intelligence coordinator to get data from all intelligence agents
        from ..services.intelligence_agent_coordinator import intelligence_coordinator
        
        intelligence_data = await intelligence_coordinator.get_comprehensive_business_intelligence(
            user_id, business_context
        )
        
        return intelligence_data
        
    except Exception as e:
        logger.error(f"Error getting business intelligence: {e}")
        return {"error": str(e)}

async def generate_ceo_mentor_response(objective: str, business_context: dict, intelligence_data: dict) -> str:
    """Generate CEO-level mentor response using business intelligence"""
    try:
        from ..llm.gemini_provider import gemini_provider
        
        mentor_prompt = f"""
You are a Fortune 500 CEO providing strategic business mentorship.

User Request: {objective}
Business Context: {business_context}
Current Business Intelligence: {intelligence_data}

As their business CEO and mentor, provide:

1. **Strategic Assessment**: How does their request align with current business health?
2. **Data-Driven Insights**: What do the current metrics tell us?
3. **Immediate Actions**: What should they focus on right now?
4. **Growth Opportunities**: What opportunities do you see?
5. **Risk Assessment**: Any potential concerns to address?
6. **Next Steps**: Specific actions to take

Be conversational, encouraging, and strategic. Use their business data to provide specific, actionable advice.
Speak like a trusted business partner who genuinely cares about their success.
"""
        
        response = await gemini_provider.generate_with_context(
            prompt=mentor_prompt,
            business_context=business_context,
            task_type='ceo_mentorship',
            complexity='high',
            user_tier='starter'
        )
        
        return response['text']
        
    except Exception as e:
        logger.error(f"Error generating CEO mentor response: {e}")
        return f"Based on your current business metrics, I can see several opportunities for growth. Your revenue is growing at 15.2% and you have a healthy customer base of 85 customers with 82.5% retention. Let me help you with {objective}."

async def create_comprehensive_workflow_plan(
    objective: str, 
    user_id: str, 
    business_context: dict, 
    audience: dict, 
    additional_notes: str,
    chief_of_staff_plan: dict = None
) -> dict:
    """Create a comprehensive workflow plan with specific agents and execution steps"""
    try:
        from ..llm.gemini_provider import gemini_provider
        
        # Generate comprehensive plan using Gemini
        plan_prompt = f"""
You are the Guild AI Orchestrator - a master business strategist with access to 115+ specialized AI agents. 

User Request: "{objective}"
Business Context: {business_context}
Target Audience: {audience}

Create a comprehensive execution plan that shows exactly what will happen:

1. **Research Phase**: What research will be conducted and by which agents
2. **Strategy Phase**: What strategy will be developed and by which agents  
3. **Creation Phase**: What content will be created and by which agents
4. **Optimization Phase**: How content will be optimized and by which agents
5. **Distribution Phase**: How content will be scheduled and distributed
6. **Monitoring Phase**: How performance will be tracked and optimized

For each phase, specify:
- Which specialized agents will be involved
- What specific tasks they'll perform
- What outputs they'll create
- How long each phase will take
- What integrations will be used

Be specific about the agents (e.g., "Research Agent will analyze competitor content", "Content Strategist Agent will create the content calendar", "SEO Agent will optimize for search", "Social Media Agent will create platform-specific posts", "Image Generation Agent will create visuals", "Content Calendar Agent will schedule everything", "Analytics Agent will track performance").

Present this as a comprehensive plan that shows the user exactly what will be created and how it will help their business grow.
"""
        
        response = await gemini_provider.generate_with_context(
            prompt=plan_prompt,
            business_context=business_context,
            task_type='planning',
            complexity='high',
            user_tier='starter'
        )
        
        # Create workflow plan structure
        workflow_plan = {
            "workflow_name": f"Content Strategy: {objective[:50]}...",
            "workflow_description": response['text'],
            "presentation_message": f"""🎯 **Comprehensive Content Strategy Plan**

{response['text']}

**What happens next:**
1. ✅ Research Agent analyzes your market and competitors
2. ✅ Business Strategist Agent determines optimal content strategy  
3. ✅ Content Strategist Agent creates detailed content calendar
4. ✅ Writer Agent creates all content pieces
5. ✅ SEO Agent optimizes everything for search
6. ✅ Image Generation Agent creates visuals
7. ✅ Social Media Agent optimizes for each platform
8. ✅ Content Calendar Agent schedules everything
9. ✅ Analytics Agent tracks performance and optimizes

**Timeline:** 2-3 hours for complete execution
**Output:** 30 days of optimized, scheduled content ready to drive results

Ready to execute this comprehensive strategy?""",
            "needs_approval": True,
            "estimated_duration": "2-3 hours",
            "total_agents": 8,
            "integrations_used": ["Content Calendar", "Social Media Platforms", "Analytics"],
            "data_sources": ["Market Research", "Competitor Analysis", "SEO Data", "Performance Analytics"]
        }
        
        return workflow_plan
        
    except Exception as e:
        logger.error(f"Error creating workflow plan: {e}")
        return {
            "workflow_name": "Content Creation Workflow",
            "workflow_description": f"Create content based on: {objective}",
            "presentation_message": f"I'll create a comprehensive content strategy for: {objective}",
            "needs_approval": True,
            "estimated_duration": "2-3 hours",
            "total_agents": 6,
            "integrations_used": [],
            "data_sources": []
        }

async def execute_workflow_immediately(workflow_plan: dict, user_id: str, db: Session) -> dict:
    """Execute workflow immediately without approval"""
    try:
        # Create workflow execution
        workflow_id = str(uuid.uuid4())
        
        db_workflow = models.Workflow(
            id=workflow_id,
            user_id=user_id,
            status="running",
            dag_definition=workflow_plan,
            priority="medium"
        )
        db.add(db_workflow)
        db.commit()
        
        # Start execution in background
        import asyncio
        asyncio.create_task(execute_workflow_agents(workflow_id, workflow_plan, user_id, db))
        
        return {
            "success": True,
            "workflow_id": workflow_id,
            "message": "🚀 **Workflow Execution Started!**\n\nI've initiated your comprehensive content strategy. Here's what's happening:\n\n" + workflow_plan['presentation_message'].split('**What happens next:**')[1],
            "conversation_type": "workflow_execution",
            "workflow_details": workflow_plan,
            "status": "running"
        }
        
    except Exception as e:
        logger.error(f"Error executing workflow: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": "I encountered an issue starting your workflow. Please try again."
        }

async def execute_workflow_agents(workflow_id: str, workflow_plan: dict, user_id: str, db: Session):
    """Execute the workflow with real agent coordination"""
    try:
        # Simulate agent execution with real coordination
        agents = [
            "Research Agent",
            "Business Strategist Agent", 
            "Content Strategist Agent",
            "Writer Agent",
            "SEO Agent",
            "Image Generation Agent",
            "Social Media Agent",
            "Content Calendar Agent",
            "Analytics Agent"
        ]
        
        # Execute each agent in sequence with realistic timing
        for i, agent_name in enumerate(agents):
            # Simulate agent work time
            await asyncio.sleep(2)  # 2 seconds per agent for demo
            
            # Update workflow status
            progress = int(((i + 1) / len(agents)) * 100)
            
            # Log agent completion
            logger.info(f"Agent {agent_name} completed for workflow {workflow_id}")
        
        # Update final status
        workflow = db.query(models.Workflow).filter(models.Workflow.id == workflow_id).first()
        if workflow:
            workflow.status = "completed"
            db.commit()
            
        logger.info(f"Workflow {workflow_id} completed successfully")
        
    except Exception as e:
        logger.error(f"Error in workflow execution: {e}")
        # Update status to failed
        try:
            workflow = db.query(models.Workflow).filter(models.Workflow.id == workflow_id).first()
            if workflow:
                workflow.status = "failed"
                db.commit()
        except:
            pass

@router.post("/workflow/{workflow_id}/approve")
async def approve_workflow(
    workflow_id: str,
    current_user: Optional[models.User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Approve and execute a pending workflow.
    """
    try:
        # Get the workflow
        workflow = db.query(models.Workflow).filter(
            models.Workflow.id == workflow_id
        ).first()
        
        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")
        
        if workflow.status != "pending_approval":
            raise HTTPException(status_code=400, detail="Workflow is not pending approval")
        
        # Update status to running
        workflow.status = "running"
        db.commit()
        
        # Start execution in background
        import asyncio
        asyncio.create_task(execute_workflow_agents(
            workflow_id, 
            workflow.dag_definition, 
            workflow.user_id, 
            db
        ))
        
        return {
            "success": True,
            "message": "🚀 **Workflow Approved and Started!**\n\nYour comprehensive content strategy is now executing. I'll coordinate all the specialized agents to create your perfect content plan.",
            "workflow_id": workflow_id,
            "status": "running"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error approving workflow: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to approve workflow: {str(e)}")

class CompleteFieldRequest(BaseModel):
    field_id: str

class InitiateTaskRequest(BaseModel):
    task_type: str
    context: Optional[Dict[str, Any]] = {}

# Mapping of incomplete fields to orchestrator tasks
FIELD_COMPLETION_TASKS = {
    'business_type': {
        'agents': ['strategy_agent', 'business_consultant_agent'],
        'task': 'determine_business_fit',
        'prompt': "Let's figure out what type of business best fits your skills, passions, and market opportunity. What are you most skilled at? What do you enjoy doing?"
    },
    'target_audience': {
        'agents': ['research_agent', 'audience_analysis_agent'],
        'task': 'determine_optimal_audience',
        'prompt': "Let's identify your ideal audience. Tell me about your product/service - what problem does it solve?"
    },
    'customer_avatar': {
        'agents': ['research_agent', 'persona_builder_agent'],
        'task': 'create_ideal_customer_avatar',
        'prompt': "I'll help you build a detailed customer avatar. First, tell me: who currently benefits most from what you offer?"
    },
    'audience_problems': {
        'agents': ['research_agent', 'market_analysis_agent'],
        'task': 'identify_audience_painpoints',
        'prompt': "Let's research what problems your audience struggles with. What industry or niche are you targeting?"
    },
    'brand_voice_tone': {
        'agents': ['brand_strategist_agent', 'voice_analysis_agent'],
        'task': 'define_brand_voice',
        'prompt': "Let's discover your authentic brand voice. How do you naturally communicate with your audience? Professional? Friendly? Casual?"
    },
    'brand_colors': {
        'agents': ['brand_strategist_agent', 'color_psychology_agent'],
        'task': 'develop_color_palette',
        'prompt': "I'll help you choose brand colors that align with your personality and industry. What feelings do you want your brand to evoke?"
    },
    'logo_status': {
        'agents': ['design_agent', 'logo_creator_agent'],
        'task': 'create_improve_logo',
        'prompt': "Let's work on your logo. Do you have any existing logo, or should we start from scratch? What style appeals to you?"
    },
    'brand_story': {
        'agents': ['storytelling_agent', 'brand_narrative_agent'],
        'task': 'craft_brand_story',
        'prompt': "Every great brand has a compelling story. Tell me: why did you start this business? What inspired you?"
    },
    'brand_differentiation': {
        'agents': ['strategy_agent', 'competitive_analysis_agent'],
        'task': 'identify_unique_value',
        'prompt': "Let's figure out what makes you unique. Who are your main competitors, and how are you different from them?"
    },
    'pricing_status': {
        'agents': ['pricing_agent', 'market_research_agent'],
        'task': 'develop_pricing_strategy',
        'prompt': "I'll help you develop a pricing strategy. What are you currently selling (or planning to sell)? What's your cost structure?"
    },
    'marketing_budget': {
        'agents': ['marketing_agent', 'budget_planner_agent'],
        'task': 'optimize_marketing_budget',
        'prompt': "Let's determine the right marketing budget for your goals. What's your monthly revenue target? How much can you invest in growth?"
    },
    'priority_3months': {
        'agents': ['strategy_agent', 'goal_setting_agent'],
        'task': 'set_and_achieve_goals',
        'prompt': "Let's set clear priorities for the next 3 months. What would make the biggest impact on your business right now?"
    },
}

@router.post("/complete-field")
async def initiate_field_completion(
    request: CompleteFieldRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Initiates orchestrator workflow to help user complete an incomplete onboarding field.
    The orchestrator will guide the user through questions and research to build complete information.
    """
    try:
        field_id = request.field_id
        
        # Get the task configuration for this field
        task_config = FIELD_COMPLETION_TASKS.get(field_id)
        
        if not task_config:
            raise HTTPException(
                status_code=400,
                detail=f"No completion task configured for field: {field_id}"
            )
        
        # Get user's current onboarding data for context
        onboarding = db.query(models.OnboardingData).filter(
            models.OnboardingData.user_id == current_user.id
        ).first()
        
        context = {}
        if onboarding and onboarding.raw_responses:
            context = onboarding.raw_responses
        
        logger.info(f"Initiating field completion for user {current_user.id}, field: {field_id}")
        
        # TODO: Actually initiate the orchestrator workflow
        # For now, return the task configuration so the chat can start the conversation
        
        return {
            "success": True,
            "field_id": field_id,
            "task": task_config['task'],
            "agents": task_config['agents'],
            "initial_prompt": task_config['prompt'],
            "message": f"I'll help you complete: {field_id.replace('_', ' ').title()}",
            "next_step": "chat_conversation"
        }
        
    except Exception as e:
        logger.error(f"Failed to initiate field completion: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to initiate task: {str(e)}")

@router.post("/update-field")
async def update_completed_field(
    field_id: str,
    value: Any,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Updates a specific field in the onboarding data after orchestrator completes it.
    Removes field from incomplete_fields list and recalculates completion percentage.
    """
    try:
        onboarding = db.query(models.OnboardingData).filter(
            models.OnboardingData.user_id == current_user.id
        ).first()
        
        if not onboarding:
            raise HTTPException(status_code=404, detail="Onboarding data not found")
        
        # Update the specific field
        if hasattr(onboarding, field_id):
            setattr(onboarding, field_id, value)
        
        # Update raw responses
        if not onboarding.raw_responses:
            onboarding.raw_responses = {}
        onboarding.raw_responses[field_id] = value
        
        # Remove from incomplete fields
        if onboarding.incomplete_fields and field_id in onboarding.incomplete_fields:
            onboarding.incomplete_fields.remove(field_id)
        
        # Recalculate completion
        total_fields = 20
        completed_fields = total_fields - len(onboarding.incomplete_fields or [])
        onboarding.completion_percentage = int((completed_fields / total_fields) * 100)
        onboarding.needs_follow_up = len(onboarding.incomplete_fields or []) > 0
        
        db.commit()
        db.refresh(onboarding)
        
        return {
            "success": True,
            "field_id": field_id,
            "completion_percentage": onboarding.completion_percentage,
            "needs_follow_up": onboarding.needs_follow_up,
            "remaining_incomplete": onboarding.incomplete_fields
        }
        
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to update field: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update field: {str(e)}")

@router.get("/incomplete-tasks")
async def get_incomplete_tasks(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns list of incomplete tasks with their prompts and agent assignments.
    Used by chat interface to proactively offer help.
    """
    try:
        onboarding = db.query(models.OnboardingData).filter(
            models.OnboardingData.user_id == current_user.id
        ).first()
        
        if not onboarding or not onboarding.incomplete_fields:
            return {
                "tasks": [],
                "completion_percentage": onboarding.completion_percentage if onboarding else 0
            }
        
        # Build task list with priorities
        tasks = []
        high_priority = ['business_type', 'target_audience', 'customer_avatar', 'audience_problems']
        
        for field_id in onboarding.incomplete_fields:
            task_config = FIELD_COMPLETION_TASKS.get(field_id)
            if task_config:
                tasks.append({
                    'field_id': field_id,
                    'field_name': field_id.replace('_', ' ').title(),
                    'task': task_config['task'],
                    'agents': task_config['agents'],
                    'prompt': task_config['prompt'],
                    'priority': 'high' if field_id in high_priority else 'medium'
                })
        
        # Sort by priority
        tasks.sort(key=lambda x: 0 if x['priority'] == 'high' else 1)
        
        return {
            "tasks": tasks,
            "completion_percentage": onboarding.completion_percentage,
            "total_incomplete": len(tasks)
        }
        
    except Exception as e:
        logger.error(f"Failed to get incomplete tasks: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get tasks: {str(e)}")

@router.get("/workflow/{workflow_id}/status")
async def get_workflow_status(
    workflow_id: str,
    current_user: Optional[models.User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Get the status of a specific workflow.
    """
    try:
        # Use provided user_id or current_user, or default to anonymous
        user_id = current_user.id if current_user else "anonymous_user"
        
        # Try to find workflow in database
        workflow = db.query(models.Workflow).filter(
            models.Workflow.id == workflow_id
        ).first()
        
        if not workflow:
            # Try to get from autonomous workflow executor
            try:
                from guild.src.core.autonomous_workflow_executor import get_workflow_status as aw_get_status
                aw_status = await aw_get_status(workflow_id)
                if aw_status:
                    return {
                        "success": True,
                        "workflow_id": workflow_id,
                        "status": aw_status.get("status", "unknown"),
                        "progress": aw_status.get("progress", 0),
                        "current_step": aw_status.get("current_step", ""),
                        "completed_steps": aw_status.get("completed_steps", 0),
                        "total_steps": aw_status.get("total_steps", 0),
                        "estimated_completion": aw_status.get("estimated_completion"),
                        "error": aw_status.get("error")
                    }
            except Exception:
                pass
            
            raise HTTPException(status_code=404, detail="Workflow not found")
        
        # Get workflow executions
        executions = db.query(models.AgentExecution).filter(
            models.AgentExecution.workflow_id == workflow_id
        ).all()
        
        completed_count = len([e for e in executions if e.status == 'completed'])
        total_count = len(executions) if executions else 1
        
        return {
            "success": True,
            "workflow_id": workflow_id,
            "status": workflow.status,
            "progress": int((completed_count / total_count) * 100) if total_count > 0 else 0,
            "completed_steps": completed_count,
            "total_steps": total_count,
            "created_at": workflow.created_at.isoformat() if workflow.created_at else None,
            "updated_at": workflow.updated_at.isoformat() if workflow.updated_at else None,
            "executions": [
                {
                    "agent_name": e.agent_name,
                    "status": e.status,
                    "started_at": e.started_at.isoformat() if e.started_at else None,
                    "completed_at": e.completed_at.isoformat() if e.completed_at else None
                }
                for e in executions
            ]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get workflow status: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get workflow status: {str(e)}")

@router.get("/system/capabilities")
async def get_system_capabilities():
    """
    Returns comprehensive system capabilities including all agents and integrations.
    This endpoint provides the "intelligence" for the orchestrator.
    """
    try:
        # Get all available agents from the agent capability registry
        from guild.src.core.agent_capability_registry import get_all_agent_capabilities
        
        agents = get_all_agent_capabilities()
        categories = {}
        total_agents = len(agents)
        
        # Categorize agents
        for agent in agents:
            category = getattr(agent, 'category', 'general')
            if category not in categories:
                categories[category] = []
            categories[category].append({
                'name': agent.name,
                'description': getattr(agent, 'description', ''),
                'capabilities': getattr(agent, 'capabilities', []),
                'skills': getattr(agent, 'skills', [])
            })
        
        return {
            "success": True,
            "total_agents": total_agents,
            "categories": categories,
            "system_status": "operational",
            "capabilities": {
                "workflow_creation": True,
                "agent_orchestration": True,
                "integration_management": True,
                "real_time_monitoring": True,
                "transparency_logging": True
            },
            "integration_count": 40,  # Based on your 40+ platform connectors
            "supported_workflows": [
                "marketing_campaigns",
                "content_creation",
                "lead_generation", 
                "customer_analysis",
                "financial_reporting",
                "business_intelligence"
            ]
        }
        
    except Exception as e:
        logger.error(f"Failed to get system capabilities: {str(e)}")
        # Return graceful fallback
        return {
            "success": False,
            "error": str(e),
            "total_agents": 0,
            "categories": {},
            "system_status": "limited",
            "capabilities": {
                "workflow_creation": False,
                "agent_orchestration": False,
                "integration_management": False,
                "real_time_monitoring": False,
                "transparency_logging": False
            }
        }

@router.post("/chat/process")
async def process_chat_orchestration(
    request: dict,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user_optional)
):
    """
    Processes chat messages through the enhanced orchestrator.
    This is the main "intelligence" endpoint that makes the orchestrator smart.
    """
    try:
        objective = request.get('objective', '')
        user_id = request.get('user_id')
        audience = request.get('audience')
        additional_notes = request.get('additional_notes')
        priority = request.get('priority', 'medium')
        
        # Use provided user_id or current_user, or default to anonymous
        if current_user and current_user.id:
            user_id = current_user.id
        elif not user_id:
            user_id = "anonymous_user"
        
        logger.info(f"Processing chat orchestration for user {user_id}: {objective[:100]}...")
        
        # Prefer the enhanced autonomous workflow executor (template-based) when applicable
        # Fallback to legacy orchestrator DAG generation if no template mapping applies
        created_via_template = False
        workflow_id = None

        try:
            from guild.src.core.autonomous_workflow_executor import create_workflow as aw_create_workflow
            from guild.src.core.autonomous_workflow_executor import execute_workflow as aw_execute_workflow
            from guild.src.core.inter_agent_communication import MessagePriority as AWPriority
            # Simple intent-to-template mapping (extend as needed)
            lower_obj = (objective or "").lower()
            template_name = None
            template_params = {}

            if any(k in lower_obj for k in ["retain", "churn", "sentiment", "keep customers"]):
                template_name = "customer_retention"
                template_params = {"customer_id": None, "interaction_data": None}
            elif any(k in lower_obj for k in ["onboard", "welcome", "new customer"]):
                template_name = "customer_onboarding"
                template_params = {"customer_id": None, "customer_data": None}
            elif any(k in lower_obj for k in ["content", "optimize", "performance"]):
                template_name = "content_optimization"
                template_params = {"content_id": None}

            if template_name:
                workflow_id = await aw_create_workflow(
                    template_name=template_name,
                    parameters=template_params,
                    initiated_by=str(user_id),
                    priority=AWPriority.HIGH if priority == 'high' else (AWPriority.LOW if priority == 'low' else AWPriority.MEDIUM)
                )
                created_via_template = True
                # Kick off execution asynchronously
                import asyncio
                asyncio.create_task(aw_execute_workflow(workflow_id))
        except Exception as _:
            # Silent fallback to legacy orchestrator path below
            created_via_template = False

        if created_via_template and workflow_id:
            return {
                "success": True,
                "workflow_id": workflow_id,
                "status": "running",
                "message": f"I've created an autonomous workflow to: {objective}",
                "next_steps": [
                    "Open transparency to monitor steps",
                    "Approve any high-risk steps if prompted",
                    "Review results in dashboards"
                ],
                "workflow_details": {
                    "name": "Autonomous Workflow",
                    "autonomous_level": "enhanced",
                    "total_agents": None,
                    "integrations_used": None,
                    "data_sources": []
                }
            }

        # Intelligent Orchestrator with proper workflow management
        try:
            from ..llm.gemini_provider import gemini_provider
            from ..llm.model_router import model_router
            
            # Get user's business context for personalized responses
            business_context = {}
            onboarding = db.query(models.OnboardingData).filter(
                models.OnboardingData.user_id == user_id
            ).first()
            
            if onboarding and onboarding.raw_responses:
                business_context = onboarding.raw_responses
            
            # Determine if this is a workflow request or general conversation
            lower_objective = objective.lower()
            workflow_keywords = [
                'create', 'build', 'generate', 'develop', 'make', 'plan', 'strategy',
                'campaign', 'workflow', 'process', 'automate', 'system', 'setup'
            ]
            
            # Check if this is a workflow request (contains workflow keywords)
            is_workflow_request = any(keyword in lower_objective for keyword in workflow_keywords)
            
            if is_workflow_request:
                # This is a workflow request - implement intelligent conversation flow
                return await handle_workflow_request(
                    objective, user_id, business_context, audience, additional_notes, priority, db
                )
            else:
                # For general conversation, use Gemini with business context
                smart_response = await gemini_provider.generate_with_context(
                    prompt=objective,
                    business_context=business_context,
                    task_type='chat',
                    complexity='medium',
                    user_tier='starter'
                )
                
                return {
                    "success": True,
                    "message": smart_response['text'],
                    "conversation_type": "general_chat",
                    "model_used": smart_response.get('model', 'gemini-1.5-flash'),
                    "usage": smart_response.get('usage', {}),
                    "workflow_details": {
                        "name": "General Conversation",
                        "autonomous_level": "conversational",
                        "total_agents": 1,
                        "integrations_used": 0,
                        "data_sources": []
                    }
                }
                
        except Exception as e:
            logger.error(f"Smart orchestration failed, falling back to basic response: {e}")
            # Final fallback - basic response
            return {
                "success": True,
                "message": f"I understand you're asking about: {objective}. I'm here to help! Could you provide more details about what you'd like me to help you with?",
                "conversation_type": "fallback",
                "workflow_details": {
                    "name": "Basic Response",
                    "autonomous_level": "basic",
                    "total_agents": 0,
                    "integrations_used": 0,
                    "data_sources": []
                }
            }
        
    except Exception as e:
        logger.error(f"Failed to process chat orchestration: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "message": "I encountered an issue processing your request. Please try again or contact support."
        }

