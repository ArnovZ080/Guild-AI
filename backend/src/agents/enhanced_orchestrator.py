"""
Enhanced Orchestrator with Judge Layer Integration
Implements the complete workflow: Plan + Execute + Judge + Revise
Production-ready for Google Cloud Vertex AI deployment
"""

import asyncio
import json
import uuid
from typing import Dict, List, Any, Optional, Union
from datetime import datetime, timedelta
import logging

from .agent_template import AgentTemplate, AgentCapability, TaskComplexity
from .judge_agent import JudgeAgent, QualityRubric, JudgeDecision
from ..core.llm_client import LlmClient
from ..core.agent_helpers import inject_knowledge

logger = logging.getLogger(__name__)

@dataclass
class WorkflowStep:
    """Individual step in a workflow"""
    step_id: str
    agent_id: str
    task_data: Dict[str, Any]
    dependencies: List[str]
    status: str
    result: Optional[Dict[str, Any]] = None
    rubric: Optional[QualityRubric] = None
    judge_decision: Optional[JudgeDecision] = None

@dataclass
class WorkflowContract:
    """Complete workflow contract with rubric"""
    contract_id: str
    user_instruction: str
    objectives: List[str]
    steps: List[WorkflowStep]
    overall_rubric: QualityRubric
    created_at: datetime
    status: str

class EnhancedOrchestratorAgent(AgentTemplate):
    """
    Enhanced Orchestrator with complete Judge Layer integration
    Implements: Plan + Execute + Judge + Revise workflow
    Production-ready for Google Cloud Vertex AI deployment
    """
    
    def __init__(self, agent_id: str = "enhanced_orchestrator"):
        # Define specific capabilities
        specific_capabilities = [
            AgentCapability(
                name="workflow_planning",
                description="Create comprehensive workflows with task dependencies",
                complexity=TaskComplexity.COMPLEX,
                estimated_duration=30
            ),
            AgentCapability(
                name="rubric_generation",
                description="Generate quality rubrics for workflow evaluation",
                complexity=TaskComplexity.MODERATE,
                estimated_duration=15
            ),
            AgentCapability(
                name="agent_coordination",
                description="Coordinate multiple agents with task handoffs",
                complexity=TaskComplexity.COMPLEX,
                estimated_duration=25
            ),
            AgentCapability(
                name="quality_assurance",
                description="Ensure quality through Judge Layer integration",
                complexity=TaskComplexity.MODERATE,
                estimated_duration=20
            ),
            AgentCapability(
                name="revision_management",
                description="Manage auto-revision loops and escalation",
                complexity=TaskComplexity.MODERATE,
                estimated_duration=15
            )
        ]
        
        super().__init__(
            agent_id=agent_id,
            name="Enhanced Orchestrator Agent",
            description="Comprehensive workflow orchestration with integrated Judge Layer for quality assurance",
            capabilities=[
                "workflow_planning",
                "rubric_generation",
                "agent_coordination",
                "quality_assurance",
                "revision_management",
                "task_delegation",
                "dependency_management",
                "performance_tracking"
            ],
            category="orchestration",
            icon="🎭",
            specific_capabilities=specific_capabilities
        )
        
        # Orchestrator-specific properties
        self.judge_agent = JudgeAgent()
        self.active_contracts = {}
        self.workflow_histories = {}
        
        # Agent factory for creating agents
        self.agent_factory = None  # Will be injected
    
    def get_required_task_fields(self) -> List[str]:
        """Get list of required fields for orchestration tasks"""
        return [
            'description',
            'user_instruction',
            'objectives'
        ]
    
    async def validate_task_specifics(self, task: Dict[str, Any]) -> bool:
        """Validate orchestration-specific task requirements"""
        required_fields = self.get_required_task_fields()
        missing_fields = [field for field in required_fields if field not in task or not task[field]]
        
        if missing_fields:
            logger.info(f"{self.name}: Missing required fields: {missing_fields}")
            return False
            
        return True
    
    async def generate_specific_questions(self, task: Dict[str, Any]) -> List[str]:
        """Generate orchestration-specific clarification questions"""
        questions = []
        
        questions.extend([
            "What is your main objective for this workflow?",
            "Are there any specific quality standards you want to enforce?",
            "What is your timeline for completion?",
            "Are there any dependencies between tasks?",
            "Should I escalate to human review if quality standards aren't met?",
            "What is the maximum number of revision attempts allowed?",
            "Are there any specific agents you want to use or avoid?"
        ])
        
        return questions
    
    async def _execute_agent_specific_task(self, task: Dict[str, Any], session_id: str) -> Dict[str, Any]:
        """
        Execute complete orchestration workflow with Judge Layer
        """
        try:
            logger.info(f"{self.name}: Starting enhanced orchestration workflow")
            
            # Send status update
            await self.send_status_update("planning", 10, f"{self.name} is planning your workflow...")
            
            # Step 1: Create Workflow Contract with Rubric
            contract = await self._create_workflow_contract(task, session_id)
            
            # Send status update
            await self.send_status_update("executing", 30, f"{self.name} is executing workflow with {len(contract.steps)} steps...")
            
            # Step 2: Execute Workflow with Judge Layer
            execution_result = await self._execute_workflow_with_judge(contract, session_id)
            
            # Send status update
            await self.send_status_update("completed", 100, f"{self.name} has completed the workflow successfully!")
            
            return {
                "success": True,
                "operation": "enhanced_orchestration",
                "contract_id": contract.contract_id,
                "workflow_result": execution_result,
                "quality_summary": self._generate_quality_summary(contract),
                "completion_time": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"{self.name}: Enhanced orchestration failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "operation": "enhanced_orchestration"
            }
    
    async def _create_workflow_contract(self, task: Dict[str, Any], session_id: str) -> WorkflowContract:
        """Create comprehensive workflow contract with rubric"""
        contract_id = str(uuid.uuid4())
        user_instruction = task.get('user_instruction', task.get('description', ''))
        objectives = task.get('objectives', [])
        
        # Generate workflow steps
        await self.send_status_update("planning_steps", 15, f"{self.name} is generating workflow steps...")
        steps = await self._generate_workflow_steps(user_instruction, objectives, task)
        
        # Generate overall rubric
        await self.send_status_update("generating_rubric", 20, f"{self.name} is generating quality rubric...")
        rubric_task = {
            'task_type': 'workflow',
            'objectives': objectives,
            'brand_guidelines': task.get('brand_guidelines', {}),
            'audience_profile': task.get('audience_profile', {}),
            'judge_operation': 'generate_rubric'
        }
        
        rubric_result = await self.judge_agent._generate_quality_rubric(rubric_task, session_id)
        overall_rubric = self._create_rubric_from_result(rubric_result, contract_id)
        
        # Create contract
        contract = WorkflowContract(
            contract_id=contract_id,
            user_instruction=user_instruction,
            objectives=objectives,
            steps=steps,
            overall_rubric=overall_rubric,
            created_at=datetime.now(),
            status="created"
        )
        
        # Store contract
        self.active_contracts[contract_id] = contract
        
        return contract
    
    async def _generate_workflow_steps(self, user_instruction: str, objectives: List[str], task: Dict[str, Any]) -> List[WorkflowStep]:
        """Generate workflow steps based on user instruction"""
        
        # Build workflow planning prompt
        prompt = f"""
# Enhanced Orchestrator - Workflow Planning

## User Instruction
{user_instruction}

## Objectives
{json.dumps(objectives, indent=2)}

## Context
{json.dumps(task.get('context', {}), indent=2)}

## Workflow Planning Requirements
Generate a comprehensive workflow with steps that:

1. **Break down the instruction** into specific, actionable tasks
2. **Identify required agents** for each task type
3. **Define dependencies** between steps
4. **Ensure quality gates** with Judge Layer integration
5. **Plan for handoffs** between agents

## Available Agent Categories
- Marketing: marketing_agent, brand_strategist, content_agent
- Research: research_agent, competitive_intelligence, market_trends
- Sales: sales_agent, lead_personalization, outbound_sales
- Content: content_agent, copywriter, video_editor
- Finance: bookkeeping_agent, accounting, pricing
- Operations: operations_agent, automation, crm_automation
- Technology: technology_agent, system_integration, api_development
- Strategy: strategy_agent, business_strategist, chief_of_staff

## Output Format
Return JSON with workflow steps:
{{
    "steps": [
        {{
            "step_id": "step_1",
            "agent_id": "research_agent",
            "task_description": "Research target market and competitors",
            "task_data": {{"research_type": "market_analysis"}},
            "dependencies": []
        }},
        {{
            "step_id": "step_2", 
            "agent_id": "marketing_agent",
            "task_description": "Create marketing strategy based on research",
            "task_data": {{"strategy_type": "comprehensive"}},
            "dependencies": ["step_1"]
        }}
    ]
}}

Generate the workflow steps now.
"""
        
        # Generate workflow using LLM
        response = await self.llm_client.chat(prompt)
        
        try:
            workflow_data = json.loads(response)
            steps_data = workflow_data.get('steps', [])
        except json.JSONDecodeError:
            # Fallback workflow
            steps_data = [
                {
                    "step_id": "step_1",
                    "agent_id": "research_agent",
                    "task_description": "Analyze requirements and gather information",
                    "task_data": {"analysis_type": "requirements"},
                    "dependencies": []
                },
                {
                    "step_id": "step_2",
                    "agent_id": "strategy_agent", 
                    "task_description": "Develop strategy based on analysis",
                    "task_data": {"strategy_type": "comprehensive"},
                    "dependencies": ["step_1"]
                }
            ]
        
        # Create WorkflowStep objects
        steps = []
        for step_data in steps_data:
            step = WorkflowStep(
                step_id=step_data['step_id'],
                agent_id=step_data['agent_id'],
                task_data=step_data['task_data'],
                dependencies=step_data.get('dependencies', []),
                status="pending"
            )
            steps.append(step)
        
        return steps
    
    async def _execute_workflow_with_judge(self, contract: WorkflowContract, session_id: str) -> Dict[str, Any]:
        """Execute workflow with integrated Judge Layer"""
        
        completed_steps = []
        failed_steps = []
        
        # Execute steps in dependency order
        for step in contract.steps:
            try:
                await self.send_status_update(
                    "executing_step", 
                    30 + (len(completed_steps) * 50 // len(contract.steps)),
                    f"{self.name} is executing {step.agent_id}..."
                )
                
                # Execute step
                step_result = await self._execute_workflow_step(step, contract, session_id)
                
                # Judge the result
                judge_result = await self._judge_step_result(step, step_result, contract, session_id)
                
                # Handle revision if needed
                if judge_result.revision_required:
                    step_result = await self._handle_step_revision(step, judge_result, contract, session_id)
                
                # Update step status
                step.status = "completed" if judge_result.status.value == "passed" else "failed"
                step.result = step_result
                step.judge_decision = judge_result
                
                if step.status == "completed":
                    completed_steps.append(step)
                else:
                    failed_steps.append(step)
                    
            except Exception as e:
                logger.error(f"Step {step.step_id} failed: {e}")
                step.status = "failed"
                step.result = {"error": str(e)}
                failed_steps.append(step)
        
        return {
            "total_steps": len(contract.steps),
            "completed_steps": len(completed_steps),
            "failed_steps": len(failed_steps),
            "step_results": [
                {
                    "step_id": step.step_id,
                    "agent_id": step.agent_id,
                    "status": step.status,
                    "judge_score": step.judge_decision.overall_score if step.judge_decision else 0.0,
                    "result": step.result
                } for step in contract.steps
            ]
        }
    
    async def _execute_workflow_step(self, step: WorkflowStep, contract: WorkflowContract, session_id: str) -> Dict[str, Any]:
        """Execute individual workflow step"""
        
        # Create agent instance (simplified - would use agent factory in production)
        agent = await self._get_agent_instance(step.agent_id)
        
        if not agent:
            return {
                "success": False,
                "error": f"Agent {step.agent_id} not available"
            }
        
        # Prepare task for agent
        task = {
            'description': f"Execute {step.task_data}",
            'task_data': step.task_data,
            'context': {
                'contract_id': contract.contract_id,
                'step_id': step.step_id,
                'objectives': contract.objectives
            }
        }
        
        # Execute agent task
        try:
            result = await agent._execute_main_task(task, session_id)
            return result
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def _judge_step_result(self, step: WorkflowStep, step_result: Dict[str, Any], 
                               contract: WorkflowContract, session_id: str) -> JudgeDecision:
        """Judge step result using Judge Layer"""
        
        # Prepare evaluation task
        evaluation_task = {
            'task_id': f"{contract.contract_id}_{step.step_id}",
            'task_type': step.agent_id.replace('_agent', ''),
            'deliverable_data': step_result,
            'quality_requirements': contract.overall_rubric.objectives,
            'judge_operation': 'evaluate'
        }
        
        # Run evaluation
        evaluation_result = await self.judge_agent._evaluate_deliverable(evaluation_task, session_id)
        
        if evaluation_result.get('success'):
            judge_data = evaluation_result.get('judge_decision', {})
            return JudgeDecision(
                overall_score=judge_data.get('overall_score', 0.0),
                status=EvaluationStatus(judge_data.get('status', 'failed')),
                feedback=judge_data.get('feedback', 'Evaluation failed'),
                revision_required=judge_data.get('revision_required', True),
                revision_feedback=judge_data.get('revision_feedback'),
                evaluator_results=[],  # Simplified for now
                timestamp=datetime.now()
            )
        else:
            return JudgeDecision(
                overall_score=0.0,
                status=EvaluationStatus.FAILED,
                feedback="Judge evaluation failed",
                revision_required=True,
                revision_feedback="Unable to evaluate quality",
                evaluator_results=[],
                timestamp=datetime.now()
            )
    
    async def _handle_step_revision(self, step: WorkflowStep, judge_decision: JudgeDecision, 
                                  contract: WorkflowContract, session_id: str) -> Dict[str, Any]:
        """Handle step revision based on judge feedback"""
        
        # Check revision limits
        revision_count = len([h for h in self.workflow_histories.get(contract.contract_id, []) 
                            if h.get('step_id') == step.step_id and h.get('type') == 'revision'])
        
        if revision_count >= contract.overall_rubric.max_revisions:
            return {
                "success": False,
                "error": "Maximum revisions reached",
                "escalation_required": True
            }
        
        # Record revision attempt
        if contract.contract_id not in self.workflow_histories:
            self.workflow_histories[contract.contract_id] = []
        
        self.workflow_histories[contract.contract_id].append({
            "step_id": step.step_id,
            "type": "revision",
            "judge_feedback": judge_decision.revision_feedback,
            "timestamp": datetime.now().isoformat()
        })
        
        # Re-execute step with revision feedback
        step.task_data['revision_feedback'] = judge_decision.revision_feedback
        return await self._execute_workflow_step(step, contract, session_id)
    
    async def _get_agent_instance(self, agent_id: str) -> Optional[AgentTemplate]:
        """Get agent instance (simplified - would use agent factory in production)"""
        # This is a simplified version - in production, would use AgentFactory
        try:
            if agent_id == "research_agent":
                from .research_agent import ResearchAgent
                return ResearchAgent()
            elif agent_id == "marketing_agent":
                from .marketing_agent import MarketingAgent
                return MarketingAgent()
            elif agent_id == "bookkeeping_agent":
                from .bookkeeping_agent import BookkeepingAgent
                return BookkeepingAgent()
            else:
                # Return generic agent
                return AgentTemplate(
                    agent_id=agent_id,
                    name=f"{agent_id.replace('_', ' ').title()}",
                    description=f"Generic {agent_id} implementation",
                    capabilities=["generic_task_execution"],
                    category="general",
                    icon="🤖"
                )
        except Exception as e:
            logger.error(f"Failed to create agent {agent_id}: {e}")
            return None
    
    def _create_rubric_from_result(self, rubric_result: Dict[str, Any], contract_id: str) -> QualityRubric:
        """Create QualityRubric from judge agent result"""
        rubric_data = rubric_result.get('rubric', {})
        
        from .judge_agent import RubricCriteria
        
        criteria = [
            RubricCriteria(
                name=c['name'],
                description=c['description'],
                weight=c['weight'],
                threshold=c['threshold'],
                measurement_type=c['measurement_type']
            ) for c in rubric_data.get('criteria', [])
        ]
        
        return QualityRubric(
            task_id=contract_id,
            task_type="workflow",
            objectives=rubric_data.get('objectives', []),
            criteria=criteria,
            overall_threshold=rubric_data.get('overall_threshold', 0.8),
            max_revisions=rubric_data.get('max_revisions', 3),
            created_at=datetime.now()
        )
    
    def _generate_quality_summary(self, contract: WorkflowContract) -> Dict[str, Any]:
        """Generate quality summary for completed workflow"""
        
        completed_steps = [s for s in contract.steps if s.status == "completed"]
        total_score = sum(s.judge_decision.overall_score for s in completed_steps if s.judge_decision)
        average_score = total_score / len(completed_steps) if completed_steps else 0.0
        
        return {
            "workflow_id": contract.contract_id,
            "total_steps": len(contract.steps),
            "completed_steps": len(completed_steps),
            "average_quality_score": average_score,
            "quality_grade": self._calculate_quality_grade(average_score),
            "meets_threshold": average_score >= contract.overall_rubric.overall_threshold,
            "objectives_met": len([s for s in completed_steps if s.judge_decision and s.judge_decision.overall_score >= 0.8])
        }
    
    def _calculate_quality_grade(self, score: float) -> str:
        """Calculate quality grade from score"""
        if score >= 0.9:
            return "A"
        elif score >= 0.8:
            return "B"
        elif score >= 0.7:
            return "C"
        elif score >= 0.6:
            return "D"
        else:
            return "F"
    
    def can_handle_task(self, task: Dict[str, Any]) -> bool:
        """Enhanced task matching for orchestration operations"""
        description = task.get('description', '').lower()
        
        orchestration_keywords = [
            'workflow', 'orchestrate', 'coordinate', 'plan', 'execute',
            'multi-agent', 'automate', 'process', 'strategy', 'campaign'
        ]
        
        return any(keyword in description for keyword in orchestration_keywords)
    
    def estimate_task_complexity(self, task: Dict[str, Any]) -> TaskComplexity:
        """Estimate complexity of orchestration tasks"""
        description = task.get('description', '')
        
        if any(word in description.lower() for word in ['comprehensive', 'complex', 'multi-step', 'full campaign']):
            return TaskComplexity.COMPLEX
        elif any(word in description.lower() for word in ['workflow', 'coordinate', 'plan']):
            return TaskComplexity.MODERATE
        else:
            return TaskComplexity.SIMPLE
