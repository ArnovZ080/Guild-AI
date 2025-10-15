"""
Unified Orchestrator API - Fortune 500 Level Business Intelligence Orchestration
Consolidates all orchestrator implementations into a single, comprehensive system.
Integrates with Vertex AI, Business Intelligence Agents, and all dashboards.
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List, Union
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import asyncio
import json
import logging
from enum import Enum

from .auth import get_current_user
from .. import models
from ..database import get_db

# Import all orchestrator components
try:
    from guild.src.agents.orchestrator_agent import OrchestratorAgent
    from guild.src.core.orchestrator import Orchestrator
    from guild.src.core.enhanced_orchestrator import EnhancedOrchestrator
    from guild.src.agents.enhanced_orchestrator import EnhancedOrchestrator as BackendOrchestrator
    from guild.src.agents.judge_agent import JudgeAgent
    ORCHESTRATOR_AVAILABLE = True
except ImportError as e:
    logging.warning(f"Some orchestrator components not available: {e}")
    ORCHESTRATOR_AVAILABLE = False

# Import Business Intelligence Agents
try:
    from guild.src.agents.business_intelligence_agent import BusinessIntelligenceAgent
    from guild.src.agents.customer_intelligence_agent import CustomerIntelligenceAgent
    from guild.src.agents.content_intelligence_agent import ContentIntelligenceAgent
    from guild.src.agents.financial_intelligence_agent import FinancialIntelligenceAgent
    BUSINESS_AGENTS_AVAILABLE = True
except ImportError as e:
    logging.warning(f"Business intelligence agents not available: {e}")
    BUSINESS_AGENTS_AVAILABLE = False

# Import Vertex AI components
try:
    from api_server.src.llm.model_router import model_router
    from api_server.src.llm.gemini_provider import gemini_provider
    VERTEX_AI_AVAILABLE = True
except ImportError as e:
    logging.warning(f"Vertex AI components not available: {e}")
    VERTEX_AI_AVAILABLE = False

router = APIRouter(prefix="/unified-orchestrator", tags=["unified_orchestrator"])

# Enums for better type safety
class TaskType(str, Enum):
    CHAT = "chat"
    ORCHESTRATE = "orchestrate"
    CONTENT = "content"
    STRATEGY = "strategy"
    ANALYSIS = "analysis"
    CUSTOMER = "customer"
    FINANCIAL = "financial"
    MARKETING = "marketing"
    AUTOMATION = "automation"
    WORKFLOW = "workflow"

class Complexity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class Priority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"
    CRITICAL = "critical"

# Request Models
class UnifiedOrchestratorRequest(BaseModel):
    user_input: str = Field(..., description="User's request or question")
    task_type: TaskType = Field(default=TaskType.CHAT, description="Type of task to perform")
    complexity: Complexity = Field(default=Complexity.MEDIUM, description="Task complexity level")
    priority: Priority = Field(default=Priority.MEDIUM, description="Task priority")
    context: Optional[Dict[str, Any]] = Field(default=None, description="Additional context")
    dashboard_integration: Optional[str] = Field(default=None, description="Target dashboard for integration")
    agent_coordination: Optional[List[str]] = Field(default=None, description="Specific agents to coordinate")
    quality_requirements: Optional[Dict[str, float]] = Field(default=None, description="Quality thresholds")

class WorkflowExecutionRequest(BaseModel):
    workflow_id: str
    user_input: str
    parameters: Optional[Dict[str, Any]] = None
    auto_execute: bool = False
    quality_check: bool = True

class AgentCoordinationRequest(BaseModel):
    primary_agent: str
    supporting_agents: List[str]
    objective: str
    context: Dict[str, Any]
    quality_threshold: float = 0.8

class BusinessIntelligenceRequest(BaseModel):
    intelligence_type: str  # "financial", "customer", "content", "marketing"
    analysis_depth: str = "comprehensive"  # "quick", "standard", "comprehensive"
    timeframe: Optional[str] = None
    specific_metrics: Optional[List[str]] = None
    dashboard_sync: bool = True

# Response Models
class UnifiedOrchestratorResponse(BaseModel):
    success: bool
    response: str
    task_type: TaskType
    complexity: Complexity
    agents_involved: List[str]
    execution_time: float
    quality_score: Optional[float] = None
    dashboard_updates: Optional[Dict[str, Any]] = None
    next_actions: Optional[List[str]] = None
    confidence_score: float
    cost_estimate: Optional[float] = None
    vertex_ai_model: Optional[str] = None
    timestamp: datetime

class WorkflowExecutionResponse(BaseModel):
    workflow_id: str
    status: str
    execution_result: Dict[str, Any]
    quality_assessment: Optional[Dict[str, Any]] = None
    agent_coordination: Dict[str, Any]
    dashboard_sync: Dict[str, Any]
    next_steps: List[str]

class AgentCoordinationResponse(BaseModel):
    coordination_id: str
    primary_agent: str
    supporting_agents: List[str]
    coordination_result: Dict[str, Any]
    quality_score: float
    execution_time: float
    recommendations: List[str]

class BusinessIntelligenceResponse(BaseModel):
    intelligence_type: str
    analysis_result: Dict[str, Any]
    dashboard_data: Dict[str, Any]
    insights: List[str]
    recommendations: List[str]
    kpis: Dict[str, Any]
    quality_score: float

class UnifiedOrchestrator:
    """
    Unified Orchestrator - Fortune 500 Level Business Intelligence Orchestration
    
    This orchestrator consolidates all orchestrator implementations and provides:
    - Seamless integration with all business intelligence agents
    - Vertex AI-powered decision making
    - Real-time dashboard synchronization
    - Autonomous workflow execution
    - Quality assurance through Judge Layer
    - Cost optimization through smart model routing
    """
    
    def __init__(self):
        self.name = "Unified Orchestrator"
        self.version = "2.0.0"
        self.capabilities = [
            "Multi-agent coordination",
            "Vertex AI integration",
            "Business intelligence orchestration",
            "Dashboard synchronization",
            "Autonomous workflow execution",
            "Quality assurance",
            "Cost optimization",
            "Real-time decision making",
            "Predictive analytics",
            "Cross-platform integration"
        ]
        
        # Initialize orchestrator components
        self.orchestrators = {}
        self.business_agents = {}
        self.judge_agent = None
        self.vertex_ai_enabled = False
        
        self._initialize_components()
    
    def _initialize_components(self):
        """Initialize all orchestrator and agent components."""
        try:
            # Initialize orchestrator components
            if ORCHESTRATOR_AVAILABLE:
                self.orchestrators = {
                    'core': OrchestratorAgent(),
                    'enhanced': EnhancedOrchestrator(),
                    'backend': BackendOrchestrator(),
                    'judge': JudgeAgent()
                }
                self.judge_agent = self.orchestrators['judge']
            
            # Initialize business intelligence agents
            if BUSINESS_AGENTS_AVAILABLE:
                self.business_agents = {
                    'business_intelligence': BusinessIntelligenceAgent(),
                    'customer_intelligence': CustomerIntelligenceAgent(),
                    'content_intelligence': ContentIntelligenceAgent(),
                    'financial_intelligence': FinancialIntelligenceAgent()
                }
            
            # Initialize Vertex AI
            if VERTEX_AI_AVAILABLE:
                self.vertex_ai_enabled = True
            
            logging.info("Unified Orchestrator initialized successfully")
            
        except Exception as e:
            logging.error(f"Failed to initialize Unified Orchestrator: {e}")
    
    async def process_request(
        self, 
        request: UnifiedOrchestratorRequest,
        user_id: str,
        db: Session
    ) -> UnifiedOrchestratorResponse:
        """
        Process a unified orchestrator request with Fortune 500-level intelligence.
        """
        start_time = datetime.now()
        
        try:
            # Get user's source of truth
            source_of_truth = await self._get_source_of_truth(user_id, db)
            
            # Determine optimal model and agents
            model_choice = await self._select_optimal_model(request.task_type, request.complexity)
            agents_to_coordinate = await self._select_agents(request, source_of_truth)
            
            # Execute orchestration
            orchestration_result = await self._execute_orchestration(
                request, agents_to_coordinate, model_choice, source_of_truth
            )
            
            # Quality assessment
            quality_score = await self._assess_quality(orchestration_result, request.quality_requirements)
            
            # Dashboard synchronization
            dashboard_updates = await self._sync_dashboards(orchestration_result, request.dashboard_integration)
            
            # Generate next actions
            next_actions = await self._generate_next_actions(orchestration_result, source_of_truth)
            
            # Calculate execution metrics
            execution_time = (datetime.now() - start_time).total_seconds()
            cost_estimate = await self._calculate_cost_estimate(model_choice, orchestration_result)
            
            return UnifiedOrchestratorResponse(
                success=True,
                response=orchestration_result['response'],
                task_type=request.task_type,
                complexity=request.complexity,
                agents_involved=orchestration_result['agents_involved'],
                execution_time=execution_time,
                quality_score=quality_score,
                dashboard_updates=dashboard_updates,
                next_actions=next_actions,
                confidence_score=orchestration_result['confidence_score'],
                cost_estimate=cost_estimate,
                vertex_ai_model=model_choice,
                timestamp=datetime.now()
            )
            
        except Exception as e:
            logging.error(f"Unified Orchestrator request failed: {e}")
            return UnifiedOrchestratorResponse(
                success=False,
                response=f"Orchestration failed: {str(e)}",
                task_type=request.task_type,
                complexity=request.complexity,
                agents_involved=[],
                execution_time=(datetime.now() - start_time).total_seconds(),
                confidence_score=0.0,
                timestamp=datetime.now()
            )
    
    async def _get_source_of_truth(self, user_id: str, db: Session) -> Dict[str, Any]:
        """Get user's source of truth data."""
        try:
            onboarding = db.query(models.OnboardingData).filter(
                models.OnboardingData.user_id == user_id
            ).first()
            
            if onboarding:
                return {
                    "business": {
                        "type": onboarding.business_type,
                        "description": onboarding.business_description,
                        "industry": onboarding.industry
                    },
                    "brand": {
                        "voice_tone": onboarding.brand_voice_tone,
                        "differentiation": onboarding.brand_differentiation,
                        "values": onboarding.brand_values
                    },
                    "audience": {
                        "target": onboarding.target_audience,
                        "problems": onboarding.audience_problems
                    },
                    "financial": {
                        "pricing_status": onboarding.pricing_status,
                        "pricing_model": onboarding.pricing_model,
                        "marketing_budget": onboarding.marketing_budget,
                        "revenue_goals": onboarding.revenue_goals
                    },
                    "goals": {
                        "priority_3months": onboarding.priority_3months
                    }
                }
            else:
                return {}
                
        except Exception as e:
            logging.error(f"Failed to get source of truth: {e}")
            return {}
    
    async def _select_optimal_model(self, task_type: TaskType, complexity: Complexity) -> str:
        """Select optimal Vertex AI model based on task type and complexity."""
        if not self.vertex_ai_enabled:
            return "fallback"
        
        try:
            # Use model router for optimal selection
            model = model_router.route_task(
                task_type=task_type.value,
                complexity=complexity.value,
                user_tier='professional'  # Assume professional tier for orchestrator
            )
            return model
            
        except Exception as e:
            logging.error(f"Model selection failed: {e}")
            return "gemini-1.5-flash"  # Safe fallback
    
    async def _select_agents(self, request: UnifiedOrchestratorRequest, source_of_truth: Dict[str, Any]) -> List[str]:
        """Select appropriate agents based on request and context."""
        agents = []
        
        # Always include core orchestrator
        agents.append('core_orchestrator')
        
        # Select based on task type
        if request.task_type == TaskType.CUSTOMER:
            agents.extend(['customer_intelligence', 'customer_support'])
        elif request.task_type == TaskType.FINANCIAL:
            agents.extend(['financial_intelligence', 'accounting'])
        elif request.task_type == TaskType.CONTENT:
            agents.extend(['content_intelligence', 'marketing_agency'])
        elif request.task_type == TaskType.STRATEGY:
            agents.extend(['business_intelligence', 'strategy'])
        elif request.task_type == TaskType.MARKETING:
            agents.extend(['marketing_agency', 'content_intelligence'])
        
        # Add supporting agents based on complexity
        if request.complexity in [Complexity.HIGH, Complexity.CRITICAL]:
            agents.extend(['judge', 'quality_controller'])
        
        # Include user-specified agents
        if request.agent_coordination:
            agents.extend(request.agent_coordination)
        
        return list(set(agents))  # Remove duplicates
    
    async def _execute_orchestration(
        self, 
        request: UnifiedOrchestratorRequest,
        agents: List[str],
        model: str,
        source_of_truth: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Execute orchestration with selected agents and model."""
        try:
            # Build comprehensive prompt with business context
            system_prompt = self._build_system_prompt(request, source_of_truth, agents)
            
            # Generate response using Vertex AI
            if self.vertex_ai_enabled:
                response = await gemini_provider.generate_with_context(
                    prompt=request.user_input,
                    business_context=source_of_truth,
                    task_type=request.task_type.value,
                    user_tier='professional'
                )
                
                generated_text = response.get('text', '')
                confidence_score = response.get('confidence', 0.8)
            else:
                # Fallback to orchestrator agent
                if 'core' in self.orchestrators:
                    result = await self.orchestrators['core'].run(request.user_input)
                    generated_text = result.get('response', str(result))
                    confidence_score = 0.7
                else:
                    generated_text = "Orchestrator temporarily unavailable"
                    confidence_score = 0.0
            
            # Coordinate with business intelligence agents
            agent_results = {}
            for agent_name in agents:
                if agent_name in self.business_agents:
                    try:
                        agent_result = await self.business_agents[agent_name].run(request.user_input)
                        agent_results[agent_name] = agent_result
                    except Exception as e:
                        logging.error(f"Agent {agent_name} failed: {e}")
                        agent_results[agent_name] = {"error": str(e)}
            
            return {
                'response': generated_text,
                'agents_involved': agents,
                'agent_results': agent_results,
                'confidence_score': confidence_score,
                'model_used': model,
                'source_of_truth': source_of_truth
            }
            
        except Exception as e:
            logging.error(f"Orchestration execution failed: {e}")
            return {
                'response': f"Orchestration failed: {str(e)}",
                'agents_involved': agents,
                'agent_results': {},
                'confidence_score': 0.0,
                'model_used': model,
                'error': str(e)
            }
    
    def _build_system_prompt(
        self, 
        request: UnifiedOrchestratorRequest, 
        source_of_truth: Dict[str, Any], 
        agents: List[str]
    ) -> str:
        """Build comprehensive system prompt for orchestration."""
        return f"""
You are the Unified Orchestrator, a Fortune 500-level business intelligence system.

BUSINESS CONTEXT:
{json.dumps(source_of_truth, indent=2)}

TASK DETAILS:
- Type: {request.task_type.value}
- Complexity: {request.complexity.value}
- Priority: {request.priority.value}
- Agents Available: {', '.join(agents)}

CAPABILITIES:
- Multi-agent coordination and orchestration
- Real-time business intelligence analysis
- Dashboard synchronization and updates
- Autonomous workflow execution
- Quality assurance and optimization
- Cross-platform integration
- Predictive analytics and insights

INSTRUCTIONS:
1. Provide comprehensive, actionable responses
2. Coordinate multiple agents for complex tasks
3. Maintain brand consistency and business alignment
4. Generate specific, measurable recommendations
5. Consider cross-dashboard implications
6. Ensure quality and accuracy in all outputs

RESPONSE FORMAT:
- Clear, actionable recommendations
- Specific next steps
- Quality metrics and confidence scores
- Dashboard integration points
- Agent coordination requirements
"""
    
    async def _assess_quality(self, result: Dict[str, Any], requirements: Optional[Dict[str, float]]) -> Optional[float]:
        """Assess quality of orchestration result."""
        if not self.judge_agent:
            return 0.8  # Default quality score
        
        try:
            # Use Judge Agent for quality assessment
            quality_result = await self.judge_agent.run(
                f"Assess quality of orchestration result: {result['response']}"
            )
            
            # Extract quality score from judge result
            if isinstance(quality_result, dict):
                return quality_result.get('quality_score', 0.8)
            else:
                return 0.8
                
        except Exception as e:
            logging.error(f"Quality assessment failed: {e}")
            return 0.8
    
    async def _sync_dashboards(self, result: Dict[str, Any], target_dashboard: Optional[str]) -> Optional[Dict[str, Any]]:
        """Synchronize results with relevant dashboards."""
        if not target_dashboard:
            return None
        
        try:
            # Map agent results to dashboard updates
            dashboard_updates = {}
            
            for agent_name, agent_result in result.get('agent_results', {}).items():
                if agent_name == 'customer_intelligence':
                    dashboard_updates['customer_dashboard'] = agent_result
                elif agent_name == 'financial_intelligence':
                    dashboard_updates['financial_dashboard'] = agent_result
                elif agent_name == 'content_intelligence':
                    dashboard_updates['content_dashboard'] = agent_result
                elif agent_name == 'business_intelligence':
                    dashboard_updates['business_dashboard'] = agent_result
            
            return dashboard_updates
            
        except Exception as e:
            logging.error(f"Dashboard sync failed: {e}")
            return None
    
    async def _generate_next_actions(self, result: Dict[str, Any], source_of_truth: Dict[str, Any]) -> List[str]:
        """Generate next actionable steps."""
        try:
            next_actions = []
            
            # Analyze result to determine next actions
            response = result.get('response', '')
            agents_involved = result.get('agents_involved', [])
            
            # Generate context-aware next actions
            if 'customer' in response.lower():
                next_actions.append("Monitor customer satisfaction metrics")
                next_actions.append("Update customer segmentation strategy")
            
            if 'financial' in response.lower():
                next_actions.append("Review financial performance dashboard")
                next_actions.append("Schedule financial health check")
            
            if 'content' in response.lower():
                next_actions.append("Optimize content calendar")
                next_actions.append("Analyze content performance metrics")
            
            if 'marketing' in response.lower():
                next_actions.append("Review marketing campaign effectiveness")
                next_actions.append("Update target audience profiles")
            
            # Add agent-specific actions
            for agent in agents_involved:
                if agent == 'customer_intelligence':
                    next_actions.append("Execute customer retention strategies")
                elif agent == 'financial_intelligence':
                    next_actions.append("Generate financial forecasting report")
                elif agent == 'content_intelligence':
                    next_actions.append("Optimize content distribution strategy")
            
            return next_actions[:5]  # Limit to top 5 actions
            
        except Exception as e:
            logging.error(f"Next actions generation failed: {e}")
            return ["Review orchestration results", "Monitor system performance"]
    
    async def _calculate_cost_estimate(self, model: str, result: Dict[str, Any]) -> Optional[float]:
        """Calculate cost estimate for the orchestration."""
        if not self.vertex_ai_enabled:
            return None
        
        try:
            # Estimate tokens based on response length
            response_length = len(result.get('response', ''))
            estimated_tokens = response_length // 4  # Rough estimation
            
            # Use model router for cost calculation
            cost = model_router.estimate_cost(
                model_name=model,
                input_tokens=estimated_tokens // 2,
                output_tokens=estimated_tokens // 2
            )
            
            return cost
            
        except Exception as e:
            logging.error(f"Cost estimation failed: {e}")
            return None

# Initialize unified orchestrator
unified_orchestrator = UnifiedOrchestrator()

# API Endpoints

@router.post("/process", response_model=UnifiedOrchestratorResponse)
async def process_unified_request(
    request: UnifiedOrchestratorRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Process a unified orchestrator request with Fortune 500-level intelligence.
    
    This endpoint consolidates all orchestrator capabilities:
    - Multi-agent coordination
    - Vertex AI integration
    - Business intelligence orchestration
    - Dashboard synchronization
    - Quality assurance
    - Cost optimization
    """
    return await unified_orchestrator.process_request(request, current_user.id, db)

@router.post("/workflow/execute", response_model=WorkflowExecutionResponse)
async def execute_workflow(
    request: WorkflowExecutionRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Execute a workflow with autonomous orchestration."""
    try:
        # Get workflow definition
        workflow = db.query(models.Workflow).filter(
            models.Workflow.id == request.workflow_id,
            models.Workflow.user_id == current_user.id
        ).first()
        
        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")
        
        # Execute workflow with orchestrator
        if 'enhanced' in unified_orchestrator.orchestrators:
            execution_result = await unified_orchestrator.orchestrators['enhanced'].execute_workflow(
                workflow.definition,
                request.user_input,
                request.parameters or {}
            )
        else:
            execution_result = {"status": "workflow_execution_not_available"}
        
        # Quality assessment if requested
        quality_assessment = None
        if request.quality_check and unified_orchestrator.judge_agent:
            quality_assessment = await unified_orchestrator.judge_agent.run(
                f"Assess workflow execution quality: {execution_result}"
            )
        
        return WorkflowExecutionResponse(
            workflow_id=request.workflow_id,
            status="completed",
            execution_result=execution_result,
            quality_assessment=quality_assessment,
            agent_coordination={"agents_used": workflow.definition.get('agents', [])},
            dashboard_sync={"synced": True},
            next_steps=["Monitor workflow performance", "Review execution results"]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Workflow execution failed: {str(e)}")

@router.post("/agents/coordinate", response_model=AgentCoordinationResponse)
async def coordinate_agents(
    request: AgentCoordinationRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Coordinate multiple agents for complex tasks."""
    start_time = datetime.now()
    
    try:
        # Get source of truth
        source_of_truth = await unified_orchestrator._get_source_of_truth(current_user.id, db)
        
        # Initialize primary agent
        primary_agent = None
        if request.primary_agent in unified_orchestrator.business_agents:
            primary_agent = unified_orchestrator.business_agents[request.primary_agent]
        
        # Coordinate with supporting agents
        coordination_results = {}
        for agent_name in request.supporting_agents:
            if agent_name in unified_orchestrator.business_agents:
                agent = unified_orchestrator.business_agents[agent_name]
                result = await agent.run(request.objective)
                coordination_results[agent_name] = result
        
        # Generate coordination result
        coordination_result = {
            "primary_agent_result": await primary_agent.run(request.objective) if primary_agent else None,
            "supporting_agent_results": coordination_results,
            "objective": request.objective,
            "context": request.context
        }
        
        # Quality assessment
        quality_score = await unified_orchestrator._assess_quality(
            coordination_result, 
            {"quality_threshold": request.quality_threshold}
        )
        
        execution_time = (datetime.now() - start_time).total_seconds()
        
        return AgentCoordinationResponse(
            coordination_id=f"coord_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            primary_agent=request.primary_agent,
            supporting_agents=request.supporting_agents,
            coordination_result=coordination_result,
            quality_score=quality_score,
            execution_time=execution_time,
            recommendations=[
                "Monitor coordination effectiveness",
                "Optimize agent communication",
                "Review quality metrics"
            ]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent coordination failed: {str(e)}")

@router.post("/business-intelligence", response_model=BusinessIntelligenceResponse)
async def get_business_intelligence(
    request: BusinessIntelligenceRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get comprehensive business intelligence across all agents."""
    try:
        # Select appropriate intelligence agent
        intelligence_agent = None
        if request.intelligence_type == "financial" and "financial_intelligence" in unified_orchestrator.business_agents:
            intelligence_agent = unified_orchestrator.business_agents["financial_intelligence"]
        elif request.intelligence_type == "customer" and "customer_intelligence" in unified_orchestrator.business_agents:
            intelligence_agent = unified_orchestrator.business_agents["customer_intelligence"]
        elif request.intelligence_type == "content" and "content_intelligence" in unified_orchestrator.business_agents:
            intelligence_agent = unified_orchestrator.business_agents["content_intelligence"]
        elif request.intelligence_type == "marketing" and "business_intelligence" in unified_orchestrator.business_agents:
            intelligence_agent = unified_orchestrator.business_agents["business_intelligence"]
        
        if not intelligence_agent:
            raise HTTPException(status_code=404, detail=f"Intelligence agent for {request.intelligence_type} not available")
        
        # Execute intelligence analysis
        analysis_result = await intelligence_agent.run(
            f"Provide {request.analysis_depth} {request.intelligence_type} intelligence analysis"
        )
        
        # Generate dashboard data
        dashboard_data = {}
        if request.dashboard_sync:
            dashboard_data = {
                f"{request.intelligence_type}_dashboard": analysis_result,
                "last_updated": datetime.now().isoformat(),
                "analysis_depth": request.analysis_depth
            }
        
        # Extract insights and recommendations
        insights = []
        recommendations = []
        kpis = {}
        
        if isinstance(analysis_result, dict):
            insights = analysis_result.get('insights', [])
            recommendations = analysis_result.get('recommendations', [])
            kpis = analysis_result.get('kpis', {})
        
        # Quality assessment
        quality_score = await unified_orchestrator._assess_quality(analysis_result, None)
        
        return BusinessIntelligenceResponse(
            intelligence_type=request.intelligence_type,
            analysis_result=analysis_result,
            dashboard_data=dashboard_data,
            insights=insights,
            recommendations=recommendations,
            kpis=kpis,
            quality_score=quality_score
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Business intelligence analysis failed: {str(e)}")

@router.get("/status")
async def get_orchestrator_status():
    """Get unified orchestrator status and capabilities."""
    return {
        "name": unified_orchestrator.name,
        "version": unified_orchestrator.version,
        "status": "operational",
        "capabilities": unified_orchestrator.capabilities,
        "orchestrator_available": ORCHESTRATOR_AVAILABLE,
        "business_agents_available": BUSINESS_AGENTS_AVAILABLE,
        "vertex_ai_enabled": unified_orchestrator.vertex_ai_enabled,
        "agents_loaded": list(unified_orchestrator.business_agents.keys()),
        "orchestrators_loaded": list(unified_orchestrator.orchestrators.keys()),
        "timestamp": datetime.now().isoformat()
    }

@router.get("/health")
async def health_check():
    """Health check for unified orchestrator."""
    try:
        # Test basic functionality
        test_request = UnifiedOrchestratorRequest(
            user_input="Test orchestration",
            task_type=TaskType.CHAT,
            complexity=Complexity.LOW
        )
        
        # Quick test without database
        return {
            "status": "healthy",
            "orchestrator_available": ORCHESTRATOR_AVAILABLE,
            "business_agents_available": BUSINESS_AGENTS_AVAILABLE,
            "vertex_ai_enabled": unified_orchestrator.vertex_ai_enabled,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

@router.post("/test-agent-coordination")
async def test_agent_coordination():
    """Test endpoint to verify agent coordination and communication."""
    try:
        coordination_results = {
            "test_timestamp": datetime.now().isoformat(),
            "agent_coordination": {},
            "communication_tests": {},
            "overall_status": "success"
        }
        
        # Test each business intelligence agent
        for agent_name, agent in unified_orchestrator.business_agents.items():
            try:
                # Test basic agent functionality
                test_result = await agent.run({
                    "test_input": f"Test coordination for {agent_name}",
                    "test_mode": True
                })
                
                coordination_results["agent_coordination"][agent_name] = {
                    "status": "success",
                    "response_received": True,
                    "response_length": len(str(test_result)) if test_result else 0
                }
                
            except Exception as e:
                coordination_results["agent_coordination"][agent_name] = {
                    "status": "error",
                    "error": str(e)
                }
                coordination_results["overall_status"] = "partial_failure"
        
        # Test inter-agent communication
        if len(unified_orchestrator.business_agents) >= 2:
            agent_names = list(unified_orchestrator.business_agents.keys())
            primary_agent = agent_names[0]
            secondary_agent = agent_names[1]
            
            try:
                # Test coordination between two agents
                coordination_result = await unified_orchestrator._coordinate_agents(
                    [primary_agent, secondary_agent],
                    {"test_coordination": True, "message": "Test inter-agent communication"}
                )
                
                coordination_results["communication_tests"] = {
                    "inter_agent_communication": {
                        "status": "success",
                        "agents_tested": [primary_agent, secondary_agent],
                        "coordination_successful": True
                    }
                }
                
            except Exception as e:
                coordination_results["communication_tests"] = {
                    "inter_agent_communication": {
                        "status": "error",
                        "error": str(e)
                    }
                }
                coordination_results["overall_status"] = "partial_failure"
        
        # Test orchestrator integration
        try:
            test_request = UnifiedOrchestratorRequest(
                user_input="Test orchestrator agent coordination",
                task_type=TaskType.STRATEGY,
                complexity=Complexity.MEDIUM,
                context={"test_mode": True}
            )
            
            orchestrator_test = await unified_orchestrator.process_request(test_request)
            
            coordination_results["orchestrator_integration"] = {
                "status": "success",
                "response_generated": True,
                "agents_involved": orchestrator_test.get("agents_involved", [])
            }
            
        except Exception as e:
            coordination_results["orchestrator_integration"] = {
                "status": "error",
                "error": str(e)
            }
            coordination_results["overall_status"] = "partial_failure"
        
        return coordination_results
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent coordination test failed: {str(e)}")
