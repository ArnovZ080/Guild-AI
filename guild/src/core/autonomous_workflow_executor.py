"""
Autonomous Workflow Execution System for Guild-AI
Provides end-to-end autonomous workflow execution with Judge Layer integration and full transparency.
"""

import asyncio
import json
import logging
from typing import Dict, List, Any, Optional, Callable
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from enum import Enum
import uuid
import traceback
from abc import ABC, abstractmethod

# Import Judge Layer and communication system
try:
    from guild.src.core.inter_agent_communication import (
        get_communication_hub, MessageType, MessagePriority, InterAgentMessage
    )
    from guild.src.agents.judge_agent import JudgeAgent
    from guild.src.agents.orchestrator_agent import OrchestratorAgent
    COMMUNICATION_AVAILABLE = True
except ImportError as e:
    logging.warning(f"Judge Layer or communication not available: {e}")
    COMMUNICATION_AVAILABLE = False

class WorkflowStatus(Enum):
    """Workflow execution status"""
    PENDING = "pending"
    RUNNING = "running"
    WAITING_FOR_APPROVAL = "waiting_for_approval"
    APPROVED = "approved"
    REJECTED = "rejected"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class WorkflowStepStatus(Enum):
    """Individual workflow step status"""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    SKIPPED = "skipped"
    REQUIRES_APPROVAL = "requires_approval"

class ApprovalLevel(Enum):
    """Approval levels for workflow steps"""
    AUTOMATIC = "automatic"
    LOW_RISK = "low_risk"
    MEDIUM_RISK = "medium_risk"
    HIGH_RISK = "high_risk"
    CRITICAL = "critical"

@dataclass
class WorkflowStep:
    """Individual step in a workflow"""
    step_id: str
    name: str
    description: str
    agent_name: str
    action: str
    parameters: Dict[str, Any]
    dependencies: List[str]
    approval_level: ApprovalLevel
    estimated_duration: int  # seconds
    timeout: int = 300  # seconds
    retry_count: int = 3
    status: WorkflowStepStatus = WorkflowStepStatus.PENDING
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    judge_score: Optional[float] = None
    judge_feedback: Optional[str] = None

@dataclass
class WorkflowExecution:
    """Complete workflow execution record"""
    workflow_id: str
    workflow_name: str
    workflow_type: str
    customer_id: Optional[str]
    content_id: Optional[str]
    initiated_by: str  # user_id or "system"
    steps: List[WorkflowStep]
    status: WorkflowStatus
    priority: MessagePriority
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    total_duration: Optional[int] = None
    overall_judge_score: Optional[float] = None
    user_approvals: Dict[str, bool] = None
    error_log: List[str] = None
    transparency_log: List[Dict[str, Any]] = None

class WorkflowTemplate:
    """Template for creating workflows"""
    
    def __init__(self, name: str, workflow_type: str, description: str):
        self.name = name
        self.workflow_type = workflow_type
        self.description = description
        self.steps: List[Dict[str, Any]] = []
    
    def add_step(self, name: str, agent: str, action: str, parameters: Dict[str, Any], 
                 approval_level: ApprovalLevel = ApprovalLevel.AUTOMATIC,
                 dependencies: List[str] = None, estimated_duration: int = 60):
        """Add a step to the workflow template"""
        step = {
            "name": name,
            "agent": agent,
            "action": action,
            "parameters": parameters,
            "approval_level": approval_level,
            "dependencies": dependencies or [],
            "estimated_duration": estimated_duration
        }
        self.steps.append(step)
        return self

class AutonomousWorkflowExecutor:
    """
    Executes autonomous workflows with Judge Layer integration and full transparency.
    """
    
    def __init__(self):
        self.active_workflows: Dict[str, WorkflowExecution] = {}
        self.workflow_templates: Dict[str, WorkflowTemplate] = {}
        self.judge_agent = None
        self.orchestrator_agent = None
        self.communication_hub = None
        
        # Transparency and logging
        self.transparency_logs: Dict[str, List[Dict[str, Any]]] = {}
        self.performance_metrics = {
            "workflows_completed": 0,
            "workflows_failed": 0,
            "average_execution_time": 0.0,
            "judge_approval_rate": 0.0,
            "user_approval_rate": 0.0
        }
        
        # Initialize components
        if COMMUNICATION_AVAILABLE:
            self._initialize_components()
        
        # Register workflow templates
        self._register_workflow_templates()
    
    def _initialize_components(self):
        """Initialize Judge Layer and communication components"""
        try:
            self.communication_hub = get_communication_hub()
            self.judge_agent = JudgeAgent()
            self.orchestrator_agent = OrchestratorAgent()
            logging.info("Autonomous Workflow Executor components initialized")
        except Exception as e:
            logging.error(f"Failed to initialize components: {e}")
    
    def _register_workflow_templates(self):
        """Register predefined workflow templates"""
        
        # Customer Retention Workflow
        retention_template = WorkflowTemplate(
            "Customer Retention Campaign",
            "customer_retention",
            "Comprehensive customer retention workflow with sentiment analysis and personalized outreach"
        )
        retention_template.add_step(
            "Analyze Customer Sentiment",
            "customer_intelligence_agent",
            "analyze_customer_sentiment",
            {"customer_id": "{customer_id}", "interaction_data": "{interaction_data}"},
            ApprovalLevel.AUTOMATIC,
            [],
            30
        ).add_step(
            "Enrich Customer Data",
            "scraper_agent", 
            "enrich_customer_profile",
            {"customer_id": "{customer_id}", "enrichment_sources": ["linkedin", "company_data"]},
            ApprovalLevel.AUTOMATIC,
            ["analyze_customer_sentiment"],
            120
        ).add_step(
            "Generate Retention Strategy",
            "strategy_agent",
            "develop_retention_strategy", 
            {"customer_id": "{customer_id}", "sentiment_data": "{sentiment_analysis}"},
            ApprovalLevel.MEDIUM_RISK,
            ["enrich_customer_data"],
            60
        ).add_step(
            "Create Personalized Content",
            "content_intelligence_agent",
            "create_retention_content",
            {"customer_id": "{customer_id}", "strategy": "{retention_strategy}"},
            ApprovalLevel.LOW_RISK,
            ["generate_retention_strategy"],
            180
        ).add_step(
            "Execute Retention Campaign",
            "orchestrator_agent",
            "execute_retention_campaign",
            {"customer_id": "{customer_id}", "content": "{retention_content}"},
            ApprovalLevel.HIGH_RISK,
            ["create_personalized_content"],
            300
        )
        
        self.workflow_templates["customer_retention"] = retention_template
        
        # Customer Onboarding Workflow
        onboarding_template = WorkflowTemplate(
            "Customer Onboarding Automation",
            "customer_onboarding", 
            "Automated customer onboarding with personalized welcome sequence"
        )
        onboarding_template.add_step(
            "Create Customer Profile",
            "customer_intelligence_agent",
            "create_customer_profile",
            {"customer_id": "{customer_id}", "initial_data": "{customer_data}"},
            ApprovalLevel.AUTOMATIC,
            [],
            30
        ).add_step(
            "Enrich Profile Data",
            "scraper_agent",
            "enrich_customer_profile", 
            {"customer_id": "{customer_id}", "enrichment_sources": ["email_domain", "company_data"]},
            ApprovalLevel.AUTOMATIC,
            ["create_customer_profile"],
            90
        ).add_step(
            "Generate Onboarding Content",
            "content_intelligence_agent",
            "create_onboarding_content",
            {"customer_id": "{customer_id}", "profile": "{customer_profile}"},
            ApprovalLevel.AUTOMATIC,
            ["enrich_profile_data"],
            120
        ).add_step(
            "Schedule Welcome Sequence",
            "orchestrator_agent",
            "schedule_onboarding_sequence",
            {"customer_id": "{customer_id}", "content_sequence": "{onboarding_content}"},
            ApprovalLevel.LOW_RISK,
            ["generate_onboarding_content"],
            60
        )
        
        self.workflow_templates["customer_onboarding"] = onboarding_template
        
        # Content Performance Optimization Workflow
        content_optimization_template = WorkflowTemplate(
            "Content Performance Optimization",
            "content_optimization",
            "Analyze and optimize content performance based on customer engagement"
        )
        content_optimization_template.add_step(
            "Analyze Content Performance",
            "content_intelligence_agent",
            "analyze_content_performance",
            {"content_id": "{content_id}", "timeframe": "30d"},
            ApprovalLevel.AUTOMATIC,
            [],
            60
        ).add_step(
            "Get Customer Engagement Data",
            "customer_intelligence_agent",
            "get_customer_engagement_data",
            {"content_id": "{content_id}", "engagement_metrics": "{performance_data}"},
            ApprovalLevel.AUTOMATIC,
            ["analyze_content_performance"],
            45
        ).add_step(
            "Generate Optimization Recommendations",
            "strategy_agent",
            "generate_content_optimization_recommendations",
            {"content_id": "{content_id}", "performance_data": "{performance_data}", "engagement_data": "{engagement_data}"},
            ApprovalLevel.MEDIUM_RISK,
            ["get_customer_engagement_data"],
            90
        ).add_step(
            "Implement Optimizations",
            "orchestrator_agent",
            "implement_content_optimizations",
            {"content_id": "{content_id}", "recommendations": "{optimization_recommendations}"},
            ApprovalLevel.HIGH_RISK,
            ["generate_optimization_recommendations"],
            180
        )
        
        self.workflow_templates["content_optimization"] = content_optimization_template
    
    async def create_workflow(self, template_name: str, parameters: Dict[str, Any], 
                            initiated_by: str = "system", priority: MessagePriority = MessagePriority.MEDIUM) -> str:
        """Create a new workflow from template"""
        try:
            if template_name not in self.workflow_templates:
                raise ValueError(f"Workflow template '{template_name}' not found")
            
            template = self.workflow_templates[template_name]
            workflow_id = str(uuid.uuid4())
            
            # Create workflow steps from template
            steps = []
            for step_template in template.steps:
                step_id = str(uuid.uuid4())
                
                # Replace template parameters with actual values
                processed_parameters = self._process_template_parameters(step_template["parameters"], parameters)
                
                step = WorkflowStep(
                    step_id=step_id,
                    name=step_template["name"],
                    description=f"Execute {step_template['action']} on {step_template['agent']}",
                    agent_name=step_template["agent"],
                    action=step_template["action"],
                    parameters=processed_parameters,
                    dependencies=step_template["dependencies"],
                    approval_level=step_template["approval_level"],
                    estimated_duration=step_template["estimated_duration"]
                )
                steps.append(step)
            
            # Create workflow execution
            workflow = WorkflowExecution(
                workflow_id=workflow_id,
                workflow_name=template.name,
                workflow_type=template.workflow_type,
                customer_id=parameters.get("customer_id"),
                content_id=parameters.get("content_id"),
                initiated_by=initiated_by,
                steps=steps,
                status=WorkflowStatus.PENDING,
                priority=priority,
                created_at=datetime.now(),
                user_approvals={},
                error_log=[],
                transparency_log=[]
            )
            
            self.active_workflows[workflow_id] = workflow
            
            # Log workflow creation
            self._log_transparency_event(workflow_id, "workflow_created", {
                "workflow_name": template.name,
                "template_name": template_name,
                "parameters": parameters,
                "total_steps": len(steps),
                "estimated_duration": sum(step.estimated_duration for step in steps)
            })
            
            logging.info(f"Workflow {workflow_id} created from template {template_name}")
            return workflow_id
            
        except Exception as e:
            logging.error(f"Failed to create workflow: {e}")
            raise
    
    async def execute_workflow(self, workflow_id: str) -> Dict[str, Any]:
        """Execute a workflow with full transparency and Judge Layer integration"""
        try:
            if workflow_id not in self.active_workflows:
                raise ValueError(f"Workflow {workflow_id} not found")
            
            workflow = self.active_workflows[workflow_id]
            workflow.status = WorkflowStatus.RUNNING
            workflow.started_at = datetime.now()
            
            self._log_transparency_event(workflow_id, "workflow_started", {
                "workflow_name": workflow.workflow_name,
                "total_steps": len(workflow.steps)
            })
            
            # Execute steps in dependency order
            completed_steps = []
            failed_steps = []
            
            while len(completed_steps) + len(failed_steps) < len(workflow.steps):
                # Find next executable steps
                executable_steps = self._find_executable_steps(workflow.steps, completed_steps)
                
                if not executable_steps:
                    # Check if we're waiting for approvals
                    pending_approvals = [s for s in workflow.steps if s.status == WorkflowStepStatus.REQUIRES_APPROVAL]
                    if pending_approvals:
                        workflow.status = WorkflowStatus.WAITING_FOR_APPROVAL
                        return {
                            "status": "waiting_for_approval",
                            "workflow_id": workflow_id,
                            "pending_approvals": [
                                {
                                    "step_id": step.step_id,
                                    "step_name": step.name,
                                    "approval_level": step.approval_level.value,
                                    "description": step.description
                                }
                                for step in pending_approvals
                            ]
                        }
                    else:
                        # Deadlock or error
                        workflow.status = WorkflowStatus.FAILED
                        workflow.error_log.append("Workflow execution deadlock - no executable steps")
                        break
                
                # Execute steps in parallel where possible
                execution_tasks = []
                for step in executable_steps:
                    if step.approval_level == ApprovalLevel.AUTOMATIC:
                        execution_tasks.append(self._execute_step(workflow_id, step))
                    else:
                        # Requires approval
                        step.status = WorkflowStepStatus.REQUIRES_APPROVAL
                        self._log_transparency_event(workflow_id, "step_requires_approval", {
                            "step_id": step.step_id,
                            "step_name": step.name,
                            "approval_level": step.approval_level.value,
                            "agent": step.agent_name,
                            "action": step.action
                        })
                
                if execution_tasks:
                    results = await asyncio.gather(*execution_tasks, return_exceptions=True)
                    
                    for i, result in enumerate(results):
                        step = executable_steps[i]
                        if isinstance(result, Exception):
                            step.status = WorkflowStepStatus.FAILED
                            step.error = str(result)
                            failed_steps.append(step.step_id)
                            workflow.error_log.append(f"Step {step.name} failed: {result}")
                        else:
                            step.status = WorkflowStepStatus.COMPLETED
                            step.result = result
                            completed_steps.append(step.step_id)
            
            # Calculate final status
            if failed_steps:
                workflow.status = WorkflowStatus.FAILED
            else:
                workflow.status = WorkflowStatus.COMPLETED
            
            workflow.completed_at = datetime.now()
            if workflow.started_at:
                workflow.total_duration = int((workflow.completed_at - workflow.started_at).total_seconds())
            
            # Judge Layer evaluation
            if self.judge_agent and workflow.status == WorkflowStatus.COMPLETED:
                workflow.overall_judge_score = await self._evaluate_workflow_quality(workflow)
            
            # Update metrics
            self._update_performance_metrics(workflow)
            
            # Log completion
            self._log_transparency_event(workflow_id, "workflow_completed", {
                "status": workflow.status.value,
                "total_duration": workflow.total_duration,
                "completed_steps": len(completed_steps),
                "failed_steps": len(failed_steps),
                "judge_score": workflow.overall_judge_score
            })
            
            return {
                "status": workflow.status.value,
                "workflow_id": workflow_id,
                "total_duration": workflow.total_duration,
                "completed_steps": completed_steps,
                "failed_steps": failed_steps,
                "judge_score": workflow.overall_judge_score,
                "transparency_log": workflow.transparency_log
            }
            
        except Exception as e:
            logging.error(f"Workflow execution failed: {e}")
            if workflow_id in self.active_workflows:
                self.active_workflows[workflow_id].status = WorkflowStatus.FAILED
                self.active_workflows[workflow_id].error_log.append(str(e))
            
            return {
                "status": "failed",
                "workflow_id": workflow_id,
                "error": str(e)
            }
    
    async def approve_workflow_step(self, workflow_id: str, step_id: str, approved: bool, user_id: str) -> Dict[str, Any]:
        """Approve or reject a workflow step"""
        try:
            if workflow_id not in self.active_workflows:
                raise ValueError(f"Workflow {workflow_id} not found")
            
            workflow = self.active_workflows[workflow_id]
            step = next((s for s in workflow.steps if s.step_id == step_id), None)
            
            if not step:
                raise ValueError(f"Step {step_id} not found in workflow {workflow_id}")
            
            if step.status != WorkflowStepStatus.REQUIRES_APPROVAL:
                raise ValueError(f"Step {step_id} is not waiting for approval")
            
            # Record approval
            workflow.user_approvals[step_id] = approved
            
            self._log_transparency_event(workflow_id, "step_approval_decision", {
                "step_id": step_id,
                "step_name": step.name,
                "approved": approved,
                "user_id": user_id,
                "approval_level": step.approval_level.value
            })
            
            if approved:
                step.status = WorkflowStepStatus.PENDING
                # Continue workflow execution
                asyncio.create_task(self._execute_step(workflow_id, step))
                return {"status": "approved", "message": "Step approved, execution continuing"}
            else:
                step.status = WorkflowStepStatus.FAILED
                step.error = "Rejected by user"
                workflow.status = WorkflowStatus.REJECTED
                return {"status": "rejected", "message": "Step rejected, workflow cancelled"}
                
        except Exception as e:
            logging.error(f"Failed to approve workflow step: {e}")
            return {"status": "error", "message": str(e)}
    
    def get_workflow_status(self, workflow_id: str) -> Optional[Dict[str, Any]]:
        """Get current status of a workflow"""
        if workflow_id not in self.active_workflows:
            return None
        
        workflow = self.active_workflows[workflow_id]
        
        return {
            "workflow_id": workflow_id,
            "workflow_name": workflow.workflow_name,
            "status": workflow.status.value,
            "created_at": workflow.created_at.isoformat(),
            "started_at": workflow.started_at.isoformat() if workflow.started_at else None,
            "completed_at": workflow.completed_at.isoformat() if workflow.completed_at else None,
            "total_duration": workflow.total_duration,
            "progress": {
                "total_steps": len(workflow.steps),
                "completed_steps": len([s for s in workflow.steps if s.status == WorkflowStepStatus.COMPLETED]),
                "failed_steps": len([s for s in workflow.steps if s.status == WorkflowStepStatus.FAILED]),
                "pending_approvals": len([s for s in workflow.steps if s.status == WorkflowStepStatus.REQUIRES_APPROVAL])
            },
            "judge_score": workflow.overall_judge_score,
            "transparency_log": workflow.transparency_log,
            "error_log": workflow.error_log
        }
    
    def get_transparency_log(self, workflow_id: str) -> List[Dict[str, Any]]:
        """Get transparency log for a workflow"""
        return self.transparency_logs.get(workflow_id, [])
    
    def get_performance_metrics(self) -> Dict[str, Any]:
        """Get workflow execution performance metrics"""
        return self.performance_metrics.copy()
    
    # Private helper methods
    
    def _process_template_parameters(self, template_params: Dict[str, Any], actual_params: Dict[str, Any]) -> Dict[str, Any]:
        """Replace template parameters with actual values"""
        processed = {}
        for key, value in template_params.items():
            if isinstance(value, str) and value.startswith("{") and value.endswith("}"):
                param_name = value[1:-1]
                processed[key] = actual_params.get(param_name, value)
            else:
                processed[key] = value
        return processed
    
    def _find_executable_steps(self, steps: List[WorkflowStep], completed_steps: List[str]) -> List[WorkflowStep]:
        """Find steps that can be executed (dependencies satisfied)"""
        executable = []
        for step in steps:
            if step.status == WorkflowStepStatus.PENDING:
                # Check if all dependencies are completed
                dependencies_satisfied = all(dep in completed_steps for dep in step.dependencies)
                if dependencies_satisfied:
                    executable.append(step)
        return executable
    
    async def _execute_step(self, workflow_id: str, step: WorkflowStep) -> Dict[str, Any]:
        """Execute a single workflow step"""
        try:
            step.status = WorkflowStepStatus.RUNNING
            step.started_at = datetime.now()
            
            self._log_transparency_event(workflow_id, "step_started", {
                "step_id": step.step_id,
                "step_name": step.name,
                "agent": step.agent_name,
                "action": step.action,
                "parameters": step.parameters
            })
            
            # Execute step via communication hub
            if self.communication_hub:
                # Send coordination message to agent
                coordination_data = {
                    "type": "workflow_step_execution",
                    "step_name": step.name,
                    "action": step.action,
                    "parameters": step.parameters,
                    "workflow_id": workflow_id,
                    "step_id": step.step_id
                }
                
                message = InterAgentMessage(
                    message_id=str(uuid.uuid4()),
                    sender_agent="autonomous_workflow_executor",
                    recipient_agent=step.agent_name,
                    message_type=MessageType.COORDINATION,
                    priority=MessagePriority.HIGH,
                    payload=coordination_data,
                    timestamp=datetime.now(),
                    requires_response=True
                )
                
                success = await self.communication_hub.send_message(message)
                if not success:
                    raise Exception(f"Failed to send coordination message to {step.agent_name}")
                
                # Wait for response
                if message.message_id in self.communication_hub.pending_responses:
                    response = await self.communication_hub.pending_responses[message.message_id]
                    result = response
                else:
                    raise Exception("No response received from agent")
            else:
                # Fallback execution (for testing)
                result = await self._fallback_step_execution(step)
            
            step.completed_at = datetime.now()
            step.result = result
            
            # Judge Layer evaluation of step
            if self.judge_agent:
                step.judge_score = await self._evaluate_step_quality(step)
                step.judge_feedback = await self._get_judge_feedback(step)
            
            self._log_transparency_event(workflow_id, "step_completed", {
                "step_id": step.step_id,
                "step_name": step.name,
                "execution_time": int((step.completed_at - step.started_at).total_seconds()),
                "judge_score": step.judge_score,
                "judge_feedback": step.judge_feedback
            })
            
            return result
            
        except Exception as e:
            step.status = WorkflowStepStatus.FAILED
            step.error = str(e)
            step.completed_at = datetime.now()
            
            self._log_transparency_event(workflow_id, "step_failed", {
                "step_id": step.step_id,
                "step_name": step.name,
                "error": str(e),
                "execution_time": int((step.completed_at - step.started_at).total_seconds()) if step.started_at else 0
            })
            
            raise
    
    async def _fallback_step_execution(self, step: WorkflowStep) -> Dict[str, Any]:
        """Fallback step execution for testing"""
        await asyncio.sleep(1)  # Simulate execution time
        return {
            "status": "completed",
            "agent": step.agent_name,
            "action": step.action,
            "result": f"Mock execution of {step.action}",
            "execution_time": 1
        }
    
    async def _evaluate_step_quality(self, step: WorkflowStep) -> float:
        """Evaluate step quality using Judge Layer"""
        try:
            if not self.judge_agent:
                return 0.8  # Default score
            
            evaluation_prompt = f"""
            Evaluate the quality of this workflow step execution:
            
            Step: {step.name}
            Agent: {step.agent_name}
            Action: {step.action}
            Result: {json.dumps(step.result, indent=2)}
            
            Rate the quality from 0.0 to 1.0 based on:
            - Completeness of execution
            - Quality of result
            - Adherence to parameters
            - Error handling
            
            Return only the numeric score.
            """
            
            score_text = await self.judge_agent.evaluate_quality(evaluation_prompt)
            try:
                return float(score_text.strip())
            except ValueError:
                return 0.8
                
        except Exception as e:
            logging.error(f"Judge evaluation failed: {e}")
            return 0.8
    
    async def _get_judge_feedback(self, step: WorkflowStep) -> str:
        """Get detailed feedback from Judge Layer"""
        try:
            if not self.judge_agent:
                return "Judge Layer not available"
            
            feedback_prompt = f"""
            Provide detailed feedback on this workflow step execution:
            
            Step: {step.name}
            Agent: {step.agent_name}
            Action: {step.action}
            Result: {json.dumps(step.result, indent=2)}
            
            Provide specific feedback on:
            - What was done well
            - Areas for improvement
            - Suggestions for optimization
            """
            
            return await self.judge_agent.generate_feedback(feedback_prompt)
            
        except Exception as e:
            logging.error(f"Judge feedback failed: {e}")
            return "Feedback generation failed"
    
    async def _evaluate_workflow_quality(self, workflow: WorkflowExecution) -> float:
        """Evaluate overall workflow quality"""
        try:
            if not self.judge_agent:
                return 0.8
            
            # Calculate average step scores
            step_scores = [step.judge_score for step in workflow.steps if step.judge_score is not None]
            if step_scores:
                return sum(step_scores) / len(step_scores)
            else:
                return 0.8
                
        except Exception as e:
            logging.error(f"Workflow evaluation failed: {e}")
            return 0.8
    
    def _log_transparency_event(self, workflow_id: str, event_type: str, event_data: Dict[str, Any]):
        """Log transparency event for user visibility"""
        if workflow_id not in self.transparency_logs:
            self.transparency_logs[workflow_id] = []
        
        event = {
            "timestamp": datetime.now().isoformat(),
            "event_type": event_type,
            "data": event_data
        }
        
        self.transparency_logs[workflow_id].append(event)
        
        # Also add to workflow transparency log
        if workflow_id in self.active_workflows:
            self.active_workflows[workflow_id].transparency_log.append(event)
    
    def _update_performance_metrics(self, workflow: WorkflowExecution):
        """Update performance metrics"""
        if workflow.status == WorkflowStatus.COMPLETED:
            self.performance_metrics["workflows_completed"] += 1
        elif workflow.status == WorkflowStatus.FAILED:
            self.performance_metrics["workflows_failed"] += 1
        
        # Update average execution time
        if workflow.total_duration:
            total_workflows = self.performance_metrics["workflows_completed"] + self.performance_metrics["workflows_failed"]
            if total_workflows > 0:
                current_avg = self.performance_metrics["average_execution_time"]
                new_avg = ((current_avg * (total_workflows - 1)) + workflow.total_duration) / total_workflows
                self.performance_metrics["average_execution_time"] = new_avg

# Global workflow executor instance
workflow_executor = AutonomousWorkflowExecutor()

# Convenience functions
async def create_workflow(template_name: str, parameters: Dict[str, Any], 
                         initiated_by: str = "system", priority: MessagePriority = MessagePriority.MEDIUM) -> str:
    """Create a new workflow"""
    return await workflow_executor.create_workflow(template_name, parameters, initiated_by, priority)

async def execute_workflow(workflow_id: str) -> Dict[str, Any]:
    """Execute a workflow"""
    return await workflow_executor.execute_workflow(workflow_id)

async def approve_workflow_step(workflow_id: str, step_id: str, approved: bool, user_id: str) -> Dict[str, Any]:
    """Approve a workflow step"""
    return await workflow_executor.approve_workflow_step(workflow_id, step_id, approved, user_id)

def get_workflow_status(workflow_id: str) -> Optional[Dict[str, Any]]:
    """Get workflow status"""
    return workflow_executor.get_workflow_status(workflow_id)

def get_transparency_log(workflow_id: str) -> List[Dict[str, Any]]:
    """Get transparency log"""
    return workflow_executor.get_transparency_log(workflow_id)
