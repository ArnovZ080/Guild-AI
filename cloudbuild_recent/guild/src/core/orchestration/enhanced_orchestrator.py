"""
Enhanced Orchestration System with Advanced Coordination

This module provides advanced orchestration capabilities that integrate the event bus
and knowledge graph for sophisticated agent coordination and workflow management.
"""

import json
import asyncio
from typing import Dict, Any, List, Optional, Callable, Set
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from enum import Enum
import uuid
from guild.src.core.messaging.event_bus import EventBus, Event, EventType, event_bus
from guild.src.core.knowledge.knowledge_graph import (
    KnowledgeGraph, KnowledgeNode, KnowledgeEdge, NodeType, RelationshipType, 
    knowledge_graph
)
from guild.src.models.user_input import UserInput
from guild.src.models.workflow import Task
from guild.src.utils.logging_utils import get_logger

logger = get_logger(__name__)

class WorkflowStatus(Enum):
    """Workflow execution status"""
    PENDING = "pending"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class AgentStatus(Enum):
    """Agent status for load balancing"""
    IDLE = "idle"
    BUSY = "busy"
    ERROR = "error"
    UNAVAILABLE = "unavailable"

@dataclass
class AgentCapability:
    """Agent capability definition"""
    agent_name: str
    capabilities: List[str]
    max_concurrent_tasks: int = 1
    priority: int = 0  # Higher number = higher priority
    specializations: List[str] = None
    dependencies: List[str] = None  # Other agents this depends on
    
    def __post_init__(self):
        if self.specializations is None:
            self.specializations = []
        if self.dependencies is None:
            self.dependencies = []

@dataclass
class WorkflowContext:
    """Enhanced workflow execution context"""
    workflow_id: str
    user_input: UserInput
    tasks: List[Task]
    status: WorkflowStatus
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    current_task_id: Optional[str] = None
    execution_history: List[Dict[str, Any]] = None
    knowledge_context: Dict[str, Any] = None
    agent_assignments: Dict[str, str] = None  # task_id -> agent_name
    performance_metrics: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.execution_history is None:
            self.execution_history = []
        if self.knowledge_context is None:
            self.knowledge_context = {}
        if self.agent_assignments is None:
            self.agent_assignments = {}
        if self.performance_metrics is None:
            self.performance_metrics = {}

class EnhancedOrchestrator:
    """
    Enhanced orchestration system with advanced coordination capabilities.
    
    Features:
    - Event-driven workflow execution
    - Knowledge graph integration for context sharing
    - Dynamic agent load balancing
    - Conflict resolution and dependency management
    - Performance monitoring and optimization
    - Adaptive workflow routing
    """
    
    def __init__(self):
        self.event_bus = event_bus
        self.knowledge_graph = knowledge_graph
        self.active_workflows: Dict[str, WorkflowContext] = {}
        self.agent_capabilities: Dict[str, AgentCapability] = {}
        self.agent_status: Dict[str, AgentStatus] = {}
        self.agent_load: Dict[str, int] = {}  # Current task count per agent
        self.performance_history: List[Dict[str, Any]] = []
        
        # Initialize event handlers
        self._setup_event_handlers()
    
    async def initialize(self):
        """Initialize the enhanced orchestrator"""
        await self.event_bus.connect()
        
        # Register for system events
        await self.event_bus.subscribe(
            "orchestrator",
            [EventType.AGENT_READY, EventType.AGENT_BUSY, EventType.AGENT_ERROR],
            self._handle_agent_status_event
        )
        
        # Register for workflow events
        await self.event_bus.subscribe(
            "orchestrator",
            [EventType.TASK_COMPLETED, EventType.TASK_FAILED, EventType.TASK_PROGRESS],
            self._handle_task_event
        )
        
        logger.info("Enhanced orchestrator initialized")
    
    def _setup_event_handlers(self):
        """Setup event handlers for orchestration"""
        self.event_handlers = {
            EventType.AGENT_READY: self._handle_agent_ready,
            EventType.AGENT_BUSY: self._handle_agent_busy,
            EventType.AGENT_ERROR: self._handle_agent_error,
            EventType.TASK_STARTED: self._handle_task_started,
            EventType.TASK_COMPLETED: self._handle_task_completed,
            EventType.TASK_FAILED: self._handle_task_failed,
            EventType.DATA_CREATED: self._handle_data_created,
            EventType.DATA_UPDATED: self._handle_data_updated,
            EventType.QUALITY_CHECK_REQUESTED: self._handle_quality_check_requested
        }
    
    async def register_agent(self, capability: AgentCapability):
        """Register an agent with its capabilities"""
        self.agent_capabilities[capability.agent_name] = capability
        self.agent_status[capability.agent_name] = AgentStatus.IDLE
        self.agent_load[capability.agent_name] = 0
        
        # Add agent to knowledge graph
        agent_id = await self.knowledge_graph.add_node(
            NodeType.AGENT,
            capability.agent_name,
            {
                "capabilities": capability.capabilities,
                "max_concurrent_tasks": capability.max_concurrent_tasks,
                "priority": capability.priority,
                "specializations": capability.specializations,
                "dependencies": capability.dependencies
            },
            "orchestrator"
        )
        
        # Publish agent registration event
        await self.event_bus.publish(Event(
            id=str(uuid.uuid4()),
            type=EventType.AGENT_READY,
            source_agent="orchestrator",
            data={
                "agent_name": capability.agent_name,
                "agent_id": agent_id,
                "capabilities": capability.capabilities
            }
        ))
        
        logger.info(f"Registered agent: {capability.agent_name}")
    
    async def create_workflow(self, user_input: UserInput, tasks: List[Task]) -> str:
        """Create a new workflow with enhanced context"""
        workflow_id = str(uuid.uuid4())
        
        # Create workflow context
        context = WorkflowContext(
            workflow_id=workflow_id,
            user_input=user_input,
            tasks=tasks,
            status=WorkflowStatus.PENDING,
            created_at=datetime.now(timezone.utc)
        )
        
        # Store in knowledge graph
        workflow_node_id = await self.knowledge_graph.add_node(
            NodeType.WORKFLOW,
            f"Workflow {workflow_id[:8]}",
            {
                "objective": user_input.objective,
                "audience": user_input.audience.model_dump() if user_input.audience else None,
                "additional_notes": user_input.additional_notes,
                "task_count": len(tasks)
            },
            "orchestrator"
        )
        
        # Link tasks to workflow
        for task in tasks:
            task_node_id = await self.knowledge_graph.add_node(
                NodeType.TASK,
                task.name,
                {
                    "description": task.description,
                    "expected_output": task.expected_output,
                    "dependencies": task.dependencies,
                    "estimated_duration": task.estimated_duration
                },
                "orchestrator"
            )
            
            await self.knowledge_graph.add_edge(
                workflow_node_id,
                task_node_id,
                RelationshipType.CONTAINS,
                {"task_id": task.task_id},
                "orchestrator"
            )
        
        # Store workflow context
        self.active_workflows[workflow_id] = context
        
        # Publish workflow creation event
        await self.event_bus.publish(Event(
            id=str(uuid.uuid4()),
            type=EventType.WORKFLOW_STARTED,
            source_agent="orchestrator",
            data={
                "workflow_id": workflow_id,
                "task_count": len(tasks),
                "objective": user_input.objective
            }
        ))
        
        logger.info(f"Created workflow {workflow_id} with {len(tasks)} tasks")
        return workflow_id
    
    async def execute_workflow(self, workflow_id: str) -> Dict[str, Any]:
        """Execute a workflow with enhanced coordination"""
        if workflow_id not in self.active_workflows:
            raise ValueError(f"Workflow {workflow_id} not found")
        
        context = self.active_workflows[workflow_id]
        context.status = WorkflowStatus.RUNNING
        context.started_at = datetime.now(timezone.utc)
        
        # Get knowledge context for the workflow
        context.knowledge_context = await self._gather_knowledge_context(context)
        
        # Start execution
        await self._execute_workflow_tasks(context)
        
        return {
            "workflow_id": workflow_id,
            "status": context.status.value,
            "execution_history": context.execution_history,
            "performance_metrics": context.performance_metrics
        }
    
    async def _execute_workflow_tasks(self, context: WorkflowContext):
        """Execute workflow tasks with enhanced coordination"""
        completed_tasks = set()
        
        while len(completed_tasks) < len(context.tasks):
            # Find ready tasks (dependencies satisfied)
            ready_tasks = [
                task for task in context.tasks
                if (task.task_id not in completed_tasks and 
                    all(dep in completed_tasks for dep in task.dependencies))
            ]
            
            if not ready_tasks and len(completed_tasks) < len(context.tasks):
                # Check for circular dependencies or deadlock
                await self._handle_workflow_deadlock(context)
                break
            
            # Assign agents to ready tasks
            task_assignments = await self._assign_agents_to_tasks(ready_tasks, context)
            
            # Execute tasks in parallel
            execution_tasks = []
            for task, agent_name in task_assignments.items():
                context.agent_assignments[task.task_id] = agent_name
                execution_tasks.append(self._execute_single_task(task, agent_name, context))
            
            if execution_tasks:
                results = await asyncio.gather(*execution_tasks, return_exceptions=True)
                
                # Process results
                for task, result in zip(task_assignments.keys(), results):
                    if isinstance(result, Exception):
                        await self._handle_task_failure(task, result, context)
                    else:
                        completed_tasks.add(task.task_id)
                        await self._handle_task_completion(task, result, context)
        
        # Workflow completion
        context.status = WorkflowStatus.COMPLETED
        context.completed_at = datetime.now(timezone.utc)
        
        # Publish completion event
        await self.event_bus.publish(Event(
            id=str(uuid.uuid4()),
            type=EventType.WORKFLOW_COMPLETED,
            source_agent="orchestrator",
            data={
                "workflow_id": context.workflow_id,
                "completion_time": context.completed_at.isoformat(),
                "total_tasks": len(context.tasks),
                "completed_tasks": len(completed_tasks)
            }
        ))
        
        logger.info(f"Workflow {context.workflow_id} completed")
    
    async def _assign_agents_to_tasks(self, 
                                    tasks: List[Task], 
                                    context: WorkflowContext) -> Dict[Task, str]:
        """Assign agents to tasks using load balancing and capability matching"""
        assignments = {}
        
        for task in tasks:
            # Find suitable agents
            suitable_agents = await self._find_suitable_agents(task, context)
            
            if not suitable_agents:
                # No suitable agents found - use fallback
                suitable_agents = await self._find_fallback_agents(task)
            
            if suitable_agents:
                # Select best agent using load balancing and priority
                selected_agent = await self._select_best_agent(suitable_agents, context)
                assignments[task] = selected_agent
            else:
                logger.error(f"No agents available for task: {task.name}")
        
        return assignments
    
    async def _find_suitable_agents(self, task: Task, context: WorkflowContext) -> List[str]:
        """Find agents suitable for a specific task"""
        suitable_agents = []
        
        for agent_name, capability in self.agent_capabilities.items():
            # Check if agent is available
            if self.agent_status[agent_name] != AgentStatus.IDLE:
                continue
            
            # Check if agent is at capacity
            if self.agent_load[agent_name] >= capability.max_concurrent_tasks:
                continue
            
            # Check if agent has required capabilities
            task_requirements = self._extract_task_requirements(task)
            if not self._agent_has_capabilities(agent_name, task_requirements):
                continue
            
            # Check dependencies
            if not await self._check_agent_dependencies(agent_name, context):
                continue
            
            suitable_agents.append(agent_name)
        
        return suitable_agents
    
    def _extract_task_requirements(self, task: Task) -> List[str]:
        """Extract capability requirements from a task"""
        requirements = []
        
        # Simple heuristic - could be enhanced with ML
        task_lower = task.name.lower()
        task_desc_lower = task.description.lower()
        
        if any(word in task_lower for word in ['content', 'write', 'copy', 'blog']):
            requirements.extend(['content_creation', 'writing'])
        if any(word in task_lower for word in ['research', 'analysis', 'data']):
            requirements.extend(['research', 'analysis'])
        if any(word in task_lower for word in ['strategy', 'plan', 'coordinate']):
            requirements.extend(['strategy', 'planning'])
        if any(word in task_lower for word in ['quality', 'review', 'evaluate']):
            requirements.extend(['quality_assessment', 'evaluation'])
        if any(word in task_lower for word in ['financial', 'accounting', 'bookkeeping']):
            requirements.extend(['financial_management', 'accounting'])
        
        return requirements
    
    def _agent_has_capabilities(self, agent_name: str, requirements: List[str]) -> bool:
        """Check if agent has required capabilities"""
        if agent_name not in self.agent_capabilities:
            return False
        
        agent_capabilities = self.agent_capabilities[agent_name].capabilities
        return any(req in agent_capabilities for req in requirements)
    
    async def _check_agent_dependencies(self, agent_name: str, context: WorkflowContext) -> bool:
        """Check if agent dependencies are satisfied"""
        capability = self.agent_capabilities[agent_name]
        
        for dep_agent in capability.dependencies:
            if dep_agent not in self.agent_status:
                return False
            
            if self.agent_status[dep_agent] == AgentStatus.ERROR:
                return False
        
        return True
    
    async def _find_fallback_agents(self, task: Task) -> List[str]:
        """Find fallback agents when no specific agents are available"""
        # Return agents with general capabilities
        fallback_agents = []
        
        for agent_name, capability in self.agent_capabilities.items():
            if (self.agent_status[agent_name] == AgentStatus.IDLE and
                self.agent_load[agent_name] < capability.max_concurrent_tasks and
                'general' in capability.capabilities):
                fallback_agents.append(agent_name)
        
        return fallback_agents
    
    async def _select_best_agent(self, candidates: List[str], context: WorkflowContext) -> str:
        """Select the best agent from candidates using multiple criteria"""
        if not candidates:
            return None
        
        if len(candidates) == 1:
            return candidates[0]
        
        # Score agents based on multiple criteria
        scores = {}
        
        for agent_name in candidates:
            score = 0
            capability = self.agent_capabilities[agent_name]
            
            # Priority score
            score += capability.priority * 10
            
            # Load balancing score (prefer less loaded agents)
            max_load = capability.max_concurrent_tasks
            current_load = self.agent_load[agent_name]
            load_score = (max_load - current_load) / max_load * 20
            score += load_score
            
            # Historical performance score
            perf_score = await self._get_agent_performance_score(agent_name)
            score += perf_score * 10
            
            scores[agent_name] = score
        
        # Return highest scoring agent
        return max(scores.items(), key=lambda x: x[1])[0]
    
    async def _get_agent_performance_score(self, agent_name: str) -> float:
        """Get historical performance score for an agent"""
        # Simple implementation - could be enhanced with detailed metrics
        if not self.performance_history:
            return 0.5  # Neutral score
        
        agent_performance = [
            perf for perf in self.performance_history
            if perf.get('agent_name') == agent_name
        ]
        
        if not agent_performance:
            return 0.5
        
        # Calculate average success rate
        success_count = sum(1 for perf in agent_performance if perf.get('success', False))
        return success_count / len(agent_performance)
    
    async def _execute_single_task(self, task: Task, agent_name: str, context: WorkflowContext):
        """Execute a single task with an assigned agent"""
        # Update agent status
        self.agent_status[agent_name] = AgentStatus.BUSY
        self.agent_load[agent_name] += 1
        
        # Publish task start event
        await self.event_bus.publish(Event(
            id=str(uuid.uuid4()),
            type=EventType.TASK_STARTED,
            source_agent="orchestrator",
            target_agents=[agent_name],
            data={
                "task_id": task.task_id,
                "task_name": task.name,
                "agent_name": agent_name,
                "workflow_id": context.workflow_id
            }
        ))
        
        try:
            # Execute task (this would integrate with actual agent execution)
            result = await self._run_agent_task(agent_name, task, context)
            
            # Update performance metrics
            self.performance_history.append({
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "agent_name": agent_name,
                "task_id": task.task_id,
                "success": True,
                "duration": result.get("duration", 0)
            })
            
            return result
            
        except Exception as e:
            # Update performance metrics
            self.performance_history.append({
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "agent_name": agent_name,
                "task_id": task.task_id,
                "success": False,
                "error": str(e)
            })
            
            raise
        finally:
            # Update agent status
            self.agent_status[agent_name] = AgentStatus.IDLE
            self.agent_load[agent_name] = max(0, self.agent_load[agent_name] - 1)
    
    async def _run_agent_task(self, agent_name: str, task: Task, context: WorkflowContext) -> Dict[str, Any]:
        """Run a task with a specific agent"""
        # This would integrate with the actual agent execution system
        # For now, simulate task execution
        
        start_time = datetime.now(timezone.utc)
        
        # Simulate work
        await asyncio.sleep(0.1)  # Simulate processing time
        
        end_time = datetime.now(timezone.utc)
        duration = (end_time - start_time).total_seconds()
        
        return {
            "task_id": task.task_id,
            "agent_name": agent_name,
            "result": f"Task {task.name} completed by {agent_name}",
            "duration": duration,
            "timestamp": end_time.isoformat()
        }
    
    async def _gather_knowledge_context(self, context: WorkflowContext) -> Dict[str, Any]:
        """Gather relevant knowledge context for a workflow"""
        knowledge_context = {}
        
        # Get relevant entities from knowledge graph
        relevant_entities = await self.knowledge_graph.query_nodes(
            properties={"workflow_id": context.workflow_id}
        )
        
        # Get related entities through relationships
        related_entities = []
        for entity in relevant_entities:
            relationships = await self.knowledge_graph.traverse_relationships(
                entity.id, max_depth=2
            )
            for rel_type, connected_entities in relationships.items():
                related_entities.extend(connected_entities)
        
        knowledge_context = {
            "relevant_entities": [entity.to_dict() for entity in relevant_entities],
            "related_entities": [entity.to_dict() for entity in related_entities],
            "context_summary": self._summarize_knowledge_context(relevant_entities, related_entities)
        }
        
        return knowledge_context
    
    def _summarize_knowledge_context(self, relevant_entities: List[KnowledgeNode], 
                                   related_entities: List[KnowledgeNode]) -> str:
        """Create a summary of the knowledge context"""
        summary_parts = []
        
        if relevant_entities:
            summary_parts.append(f"Found {len(relevant_entities)} relevant entities")
        
        if related_entities:
            summary_parts.append(f"Found {len(related_entities)} related entities")
        
        # Group by type
        entity_types = {}
        for entity in relevant_entities + related_entities:
            entity_type = entity.type.value
            entity_types[entity_type] = entity_types.get(entity_type, 0) + 1
        
        if entity_types:
            type_summary = ", ".join([f"{count} {type_name}" for type_name, count in entity_types.items()])
            summary_parts.append(f"Entity types: {type_summary}")
        
        return "; ".join(summary_parts) if summary_parts else "No relevant context found"
    
    async def _handle_agent_status_event(self, event: Event):
        """Handle agent status events"""
        agent_name = event.data.get("agent_name")
        if not agent_name:
            return
        
        if event.type == EventType.AGENT_READY:
            self.agent_status[agent_name] = AgentStatus.IDLE
        elif event.type == EventType.AGENT_BUSY:
            self.agent_status[agent_name] = AgentStatus.BUSY
        elif event.type == EventType.AGENT_ERROR:
            self.agent_status[agent_name] = AgentStatus.ERROR
    
    async def _handle_task_event(self, event: Event):
        """Handle task-related events"""
        task_id = event.data.get("task_id")
        workflow_id = event.data.get("workflow_id")
        
        if workflow_id in self.active_workflows:
            context = self.active_workflows[workflow_id]
            context.execution_history.append({
                "timestamp": event.timestamp.isoformat(),
                "event_type": event.type.value,
                "task_id": task_id,
                "data": event.data
            })
    
    async def _handle_agent_ready(self, event: Event):
        """Handle agent ready event"""
        pass  # Already handled in _handle_agent_status_event
    
    async def _handle_agent_busy(self, event: Event):
        """Handle agent busy event"""
        pass  # Already handled in _handle_agent_status_event
    
    async def _handle_agent_error(self, event: Event):
        """Handle agent error event"""
        agent_name = event.data.get("agent_name")
        error_message = event.data.get("error", "Unknown error")
        
        logger.error(f"Agent {agent_name} encountered error: {error_message}")
        
        # Could implement error recovery logic here
    
    async def _handle_task_started(self, event: Event):
        """Handle task started event"""
        pass  # Already handled in _handle_task_event
    
    async def _handle_task_completed(self, event: Event):
        """Handle task completed event"""
        pass  # Already handled in _handle_task_event
    
    async def _handle_task_failed(self, event: Event):
        """Handle task failed event"""
        task_id = event.data.get("task_id")
        error = event.data.get("error")
        
        logger.error(f"Task {task_id} failed: {error}")
        
        # Could implement retry logic or alternative routing here
    
    async def _handle_data_created(self, event: Event):
        """Handle data creation events"""
        data_type = event.data.get("type")
        data_id = event.data.get("id")
        
        # Add to knowledge graph
        node_type = self._map_data_type_to_node_type(data_type)
        if node_type:
            await self.knowledge_graph.add_node(
                node_type,
                f"{data_type} {data_id}",
                event.data,
                event.source_agent
            )
    
    async def _handle_data_updated(self, event: Event):
        """Handle data update events"""
        data_id = event.data.get("id")
        
        # Update in knowledge graph
        nodes = await self.knowledge_graph.query_nodes(
            properties={"id": data_id}
        )
        
        for node in nodes:
            await self.knowledge_graph.update_node(
                node.id,
                event.data,
                event.source_agent
            )
    
    async def _handle_quality_check_requested(self, event: Event):
        """Handle quality check requests"""
        # Route to appropriate quality assessment agents
        quality_agents = [
            name for name, cap in self.agent_capabilities.items()
            if 'quality' in cap.capabilities or 'evaluation' in cap.capabilities
        ]
        
        if quality_agents:
            # Assign to best available quality agent
            best_agent = await self._select_best_agent(quality_agents, None)
            if best_agent:
                await self.event_bus.publish(Event(
                    id=str(uuid.uuid4()),
                    type=EventType.QUALITY_CHECK_REQUESTED,
                    source_agent="orchestrator",
                    target_agents=[best_agent],
                    data=event.data
                ))
    
    def _map_data_type_to_node_type(self, data_type: str) -> Optional[NodeType]:
        """Map data types to knowledge graph node types"""
        mapping = {
            "customer": NodeType.CUSTOMER,
            "lead": NodeType.LEAD,
            "company": NodeType.COMPANY,
            "document": NodeType.DOCUMENT,
            "campaign": NodeType.CAMPAIGN,
            "content": NodeType.CONTENT,
            "task": NodeType.TASK,
            "workflow": NodeType.WORKFLOW,
            "metric": NodeType.METRIC,
            "report": NodeType.REPORT,
            "analysis": NodeType.ANALYSIS,
            "insight": NodeType.INSIGHT
        }
        return mapping.get(data_type.lower())
    
    async def _handle_task_completion(self, task: Task, result: Dict[str, Any], context: WorkflowContext):
        """Handle task completion"""
        context.execution_history.append({
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "event": "task_completed",
            "task_id": task.task_id,
            "result": result
        })
        
        # Update knowledge graph with task completion
        task_nodes = await self.knowledge_graph.query_nodes(
            NodeType.TASK,
            {"task_id": task.task_id}
        )
        
        for task_node in task_nodes:
            await self.knowledge_graph.update_node(
                task_node.id,
                {
                    "status": "completed",
                    "completion_time": datetime.now(timezone.utc).isoformat(),
                    "result": result
                },
                "orchestrator"
            )
    
    async def _handle_task_failure(self, task: Task, error: Exception, context: WorkflowContext):
        """Handle task failure"""
        context.execution_history.append({
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "event": "task_failed",
            "task_id": task.task_id,
            "error": str(error)
        })
        
        # Update knowledge graph with task failure
        task_nodes = await self.knowledge_graph.query_nodes(
            NodeType.TASK,
            {"task_id": task.task_id}
        )
        
        for task_node in task_nodes:
            await self.knowledge_graph.update_node(
                task_node.id,
                {
                    "status": "failed",
                    "error": str(error),
                    "failure_time": datetime.now(timezone.utc).isoformat()
                },
                "orchestrator"
            )
    
    async def _handle_workflow_deadlock(self, context: WorkflowContext):
        """Handle workflow deadlock situations"""
        logger.warning(f"Workflow {context.workflow_id} encountered deadlock")
        
        context.status = WorkflowStatus.FAILED
        context.completed_at = datetime.now(timezone.utc)
        
        # Could implement deadlock resolution strategies here
    
    async def get_workflow_status(self, workflow_id: str) -> Optional[Dict[str, Any]]:
        """Get status of a workflow"""
        if workflow_id not in self.active_workflows:
            return None
        
        context = self.active_workflows[workflow_id]
        return {
            "workflow_id": workflow_id,
            "status": context.status.value,
            "progress": len([h for h in context.execution_history if h.get("event") == "task_completed"]) / len(context.tasks) * 100,
            "current_task": context.current_task_id,
            "agent_assignments": context.agent_assignments,
            "execution_history": context.execution_history[-10:],  # Last 10 events
            "performance_metrics": context.performance_metrics
        }
    
    async def pause_workflow(self, workflow_id: str) -> bool:
        """Pause a running workflow"""
        if workflow_id not in self.active_workflows:
            return False
        
        context = self.active_workflows[workflow_id]
        if context.status == WorkflowStatus.RUNNING:
            context.status = WorkflowStatus.PAUSED
            return True
        
        return False
    
    async def resume_workflow(self, workflow_id: str) -> bool:
        """Resume a paused workflow"""
        if workflow_id not in self.active_workflows:
            return False
        
        context = self.active_workflows[workflow_id]
        if context.status == WorkflowStatus.PAUSED:
            context.status = WorkflowStatus.RUNNING
            # Continue execution
            asyncio.create_task(self._execute_workflow_tasks(context))
            return True
        
        return False
    
    async def cancel_workflow(self, workflow_id: str) -> bool:
        """Cancel a workflow"""
        if workflow_id not in self.active_workflows:
            return False
        
        context = self.active_workflows[workflow_id]
        context.status = WorkflowStatus.CANCELLED
        context.completed_at = datetime.now(timezone.utc)
        
        return True
    
    def get_system_status(self) -> Dict[str, Any]:
        """Get overall system status"""
        return {
            "active_workflows": len([w for w in self.active_workflows.values() if w.status == WorkflowStatus.RUNNING]),
            "total_agents": len(self.agent_capabilities),
            "available_agents": len([a for a, s in self.agent_status.items() if s == AgentStatus.IDLE]),
            "busy_agents": len([a for a, s in self.agent_status.items() if s == AgentStatus.BUSY]),
            "error_agents": len([a for a, s in self.agent_status.items() if s == AgentStatus.ERROR]),
            "knowledge_graph_stats": self.knowledge_graph.get_statistics(),
            "recent_performance": self.performance_history[-10:] if self.performance_history else []
        }

# Global enhanced orchestrator instance
enhanced_orchestrator = EnhancedOrchestrator()

# Convenience functions
async def register_agent_capability(agent_name: str, 
                                  capabilities: List[str],
                                  max_concurrent_tasks: int = 1,
                                  priority: int = 0,
                                  specializations: List[str] = None,
                                  dependencies: List[str] = None):
    """Convenience function to register agent capabilities"""
    capability = AgentCapability(
        agent_name=agent_name,
        capabilities=capabilities,
        max_concurrent_tasks=max_concurrent_tasks,
        priority=priority,
        specializations=specializations or [],
        dependencies=dependencies or []
    )
    await enhanced_orchestrator.register_agent(capability)

async def create_enhanced_workflow(user_input: UserInput, tasks: List[Task]) -> str:
    """Convenience function to create an enhanced workflow"""
    return await enhanced_orchestrator.create_workflow(user_input, tasks)

async def execute_enhanced_workflow(workflow_id: str) -> Dict[str, Any]:
    """Convenience function to execute an enhanced workflow"""
    return await enhanced_orchestrator.execute_workflow(workflow_id)
