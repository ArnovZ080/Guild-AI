"""
Workflow Execution Engine

This module provides the execution engine for running workflows built with the canvas.
It handles execution flow, dependency management, and real-time monitoring.
"""

import asyncio
import uuid
import logging
from typing import Dict, List, Any, Optional, Set
from datetime import datetime
from dataclasses import dataclass

from .workflow_canvas import WorkflowCanvas, WorkflowExecution
# Conditional import for node types to avoid vision dependency issues
try:
    from .node_types import BaseNode, create_node
    NODE_TYPES_AVAILABLE = True
except ImportError:
    BaseNode = None
    create_node = None
    NODE_TYPES_AVAILABLE = False
    print("Warning: Node types not available - workflow engine functionality limited")

logger = logging.getLogger(__name__)


@dataclass
class ExecutionContext:
    """Context passed between workflow nodes during execution."""
    workflow_id: str
    execution_id: str
    global_vars: Dict[str, Any]
    node_outputs: Dict[str, Any]
    execution_log: List[Dict[str, Any]]
    start_time: datetime
    current_node: Optional[str] = None


class WorkflowExecutionEngine:
    """
    Engine that executes workflows built with the WorkflowCanvas.
    Handles execution flow, dependency resolution, and error handling.
    """
    
    def __init__(self, canvas: WorkflowCanvas):
        """Initialize the execution engine with a workflow canvas."""
        self.canvas = canvas
        self.active_executions: Dict[str, asyncio.Task] = {}
        self.execution_callbacks: Dict[str, List[callable]] = {}
        
        logger.info("WorkflowExecutionEngine initialized successfully")
    
    async def execute_workflow(self, workflow_id: str, inputs: Dict[str, Any] = None) -> str:
        """
        Start execution of a workflow.
        
        Args:
            workflow_id: ID of the workflow to execute
            inputs: Input data for the workflow
            
        Returns:
            Execution ID
        """
        if workflow_id not in self.canvas.workflows:
            raise ValueError(f"Workflow {workflow_id} not found")
        
        # Validate workflow before execution
        validation = self.canvas.validate_workflow(workflow_id)
        if not validation["valid"]:
            raise ValueError(f"Workflow validation failed: {validation['errors']}")
        
        # Create execution instance
        execution_id = str(uuid.uuid4())
        execution = WorkflowExecution(
            execution_id=execution_id,
            workflow_id=workflow_id,
            inputs=inputs or {},
            start_time=datetime.now()
        )
        
        self.canvas.executions[execution_id] = execution
        
        # Start execution as background task
        task = asyncio.create_task(
            self._execute_workflow_task(execution_id, inputs or {})
        )
        self.active_executions[execution_id] = task
        
        logger.info(f"Started workflow execution: {execution_id}")
        return execution_id
    
    async def _execute_workflow_task(self, execution_id: str, inputs: Dict[str, Any]):
        """Background task that executes the workflow."""
        execution = self.canvas.executions[execution_id]
        workflow = self.canvas.workflows[execution.execution_id]
        
        try:
            execution.status = "running"
            
            # Create execution context
            context = ExecutionContext(
                workflow_id=execution.workflow_id,
                execution_id=execution_id,
                global_vars=inputs.copy(),
                node_outputs={},
                execution_log=[],
                start_time=datetime.now()
            )
            
            # Get execution order (topological sort)
            execution_order = self._get_execution_order(workflow)
            
            # Execute nodes in order
            for node_id in execution_order:
                if execution.status == "paused":
                    await self._wait_for_resume(execution_id)
                
                if execution.status == "cancelled":
                    break
                
                execution.current_node = node_id
                node_result = await self._execute_node(node_id, context, workflow)
                
                # Update context with node output
                context.node_outputs[node_id] = node_result
                context.execution_log.append({
                    "node_id": node_id,
                    "timestamp": datetime.now(),
                    "result": node_result
                })
                
                # Check for node failure
                if not node_result.get("success"):
                    execution.status = "failed"
                    execution.error = f"Node {node_id} failed: {node_result.get('error')}"
                    break
            
            # Finalize execution
            if execution.status == "running":
                execution.status = "completed"
                execution.outputs = context.node_outputs
                execution.end_time = datetime.now()
                logger.info(f"Workflow execution {execution_id} completed successfully")
            
        except Exception as e:
            execution.status = "failed"
            execution.error = str(e)
            execution.end_time = datetime.now()
            logger.error(f"Workflow execution {execution_id} failed: {e}")
        
        finally:
            # Clean up
            if execution_id in self.active_executions:
                del self.active_executions[execution_id]
            
            # Notify callbacks
            await self._notify_callbacks(execution_id, execution.status)
    
    async def _execute_node(self, node_id: str, context: ExecutionContext, workflow: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a single workflow node."""
        node_data = workflow["nodes"][node_id]
        node_type = node_data.node_type
        
        try:
            # Create node instance
            node = create_node(
                node_type=node_type,
                node_id=node_id,
                name=node_data.name,
                **node_data.config
            )
            
            # Prepare node context
            node_context = self._prepare_node_context(node_id, context, workflow)
            
            # Execute node
            logger.info(f"Executing node: {node_data.name} ({node_type})")
            result = await node.execute(node_context)
            
            # Update node status
            node_data.status = node.status
            if node.error:
                node_data.error = node.error
            
            return result
            
        except Exception as e:
            logger.error(f"Failed to execute node {node_id}: {e}")
            return {"success": False, "error": str(e)}
    
    def _prepare_node_context(self, node_id: str, context: ExecutionContext, workflow: Dict[str, Any]) -> Dict[str, Any]:
        """Prepare context for a specific node execution."""
        node_context = context.global_vars.copy()
        
        # Add outputs from dependent nodes
        dependencies = self._get_node_dependencies(node_id, workflow)
        for dep_id in dependencies:
            if dep_id in context.node_outputs:
                dep_output = context.node_outputs[dep_id]
                if isinstance(dep_output, dict):
                    node_context.update(dep_output)
                else:
                    node_context[f"output_{dep_id}"] = dep_output
        
        return node_context
    
    def _get_node_dependencies(self, node_id: str, workflow: Dict[str, Any]) -> List[str]:
        """Get list of nodes that this node depends on."""
        connections = workflow["connections"]
        dependencies = []
        
        for conn in connections:
            if conn.target_node_id == node_id:
                dependencies.append(conn.source_node_id)
        
        return dependencies
    
    def _get_execution_order(self, workflow: Dict[str, Any]) -> List[str]:
        """
        Get topological order of nodes for execution.
        Uses Kahn's algorithm for topological sorting.
        """
        nodes = workflow["nodes"]
        connections = workflow["connections"]
        
        # Build adjacency list and in-degree count
        adjacency = {node_id: [] for node_id in nodes}
        in_degree = {node_id: 0 for node_id in nodes}
        
        for conn in connections:
            source = conn.source_node_id
            target = conn.target_node_id
            if source in nodes and target in nodes:
                adjacency[source].append(target)
                in_degree[target] += 1
        
        # Kahn's algorithm
        queue = [node_id for node_id, degree in in_degree.items() if degree == 0]
        execution_order = []
        
        while queue:
            current = queue.pop(0)
            execution_order.append(current)
            
            for neighbor in adjacency[current]:
                in_degree[neighbor] -= 1
                if in_degree[neighbor] == 0:
                    queue.append(neighbor)
        
        # Check for cycles
        if len(execution_order) != len(nodes):
            raise ValueError("Workflow contains cycles and cannot be executed")
        
        return execution_order
    
    async def _wait_for_resume(self, execution_id: str):
        """Wait for a paused execution to be resumed."""
        while self.canvas.executions[execution_id].status == "paused":
            await asyncio.sleep(0.1)
    
    async def _notify_callbacks(self, execution_id: str, status: str):
        """Notify registered callbacks about execution status changes."""
        if execution_id in self.execution_callbacks:
            for callback in self.execution_callbacks[execution_id]:
                try:
                    await callback(execution_id, status)
                except Exception as e:
                    logger.error(f"Callback notification failed: {e}")
    
    def pause_execution(self, execution_id: str) -> bool:
        """Pause a running workflow execution."""
        if execution_id not in self.canvas.executions:
            return False
        
        execution = self.canvas.executions[execution_id]
        if execution.status == "running":
            execution.status = "paused"
            logger.info(f"Paused workflow execution: {execution_id}")
            return True
        
        return False
    
    def resume_execution(self, execution_id: str) -> bool:
        """Resume a paused workflow execution."""
        if execution_id not in self.canvas.executions:
            return False
        
        execution = self.canvas.executions[execution_id]
        if execution.status == "paused":
            execution.status = "running"
            logger.info(f"Resumed workflow execution: {execution_id}")
            return True
        
        return False
    
    def cancel_execution(self, execution_id: str) -> bool:
        """Cancel a workflow execution."""
        if execution_id not in self.canvas.executions:
            return False
        
        execution = self.canvas.executions[execution_id]
        if execution.status in ["running", "paused"]:
            execution.status = "cancelled"
            execution.end_time = datetime.now()
            
            # Cancel background task if running
            if execution_id in self.active_executions:
                self.active_executions[execution_id].cancel()
                del self.active_executions[execution_id]
            
            logger.info(f"Cancelled workflow execution: {execution_id}")
            return True
        
        return False
    
    def get_execution_status(self, execution_id: str) -> Optional[Dict[str, Any]]:
        """Get status of a workflow execution."""
        if execution_id not in self.canvas.executions:
            return None
        
        execution = self.canvas.executions[execution_id]
        workflow = self.canvas.workflows.get(execution.workflow_id, {})
        
        return {
            "execution_id": execution_id,
            "workflow_id": execution.workflow_id,
            "workflow_name": workflow.get("name", "Unknown"),
            "status": execution.status,
            "start_time": execution.start_time,
            "end_time": execution.end_time,
            "current_node": execution.current_node,
            "error": execution.error,
            "progress": self._calculate_progress(execution, workflow)
        }
    
    def _calculate_progress(self, execution: WorkflowExecution, workflow: Dict[str, Any]) -> float:
        """Calculate execution progress as percentage."""
        if execution.status == "completed":
            return 100.0
        elif execution.status == "failed":
            return 0.0
        
        total_nodes = len(workflow.get("nodes", {}))
        if total_nodes == 0:
            return 0.0
        
        completed_nodes = sum(
            1 for node in workflow["nodes"].values()
            if node.status == "completed"
        )
        
        return (completed_nodes / total_nodes) * 100.0
    
    def register_callback(self, execution_id: str, callback: callable):
        """Register a callback to be notified of execution status changes."""
        if execution_id not in self.execution_callbacks:
            self.execution_callbacks[execution_id] = []
        
        self.execution_callbacks[execution_id].append(callback)
    
    def unregister_callback(self, execution_id: str, callback: callable):
        """Unregister a callback."""
        if execution_id in self.execution_callbacks:
            try:
                self.execution_callbacks[execution_id].remove(callback)
            except ValueError:
                pass
    
    async def wait_for_completion(self, execution_id: str, timeout: float = None) -> Dict[str, Any]:
        """
        Wait for a workflow execution to complete.
        
        Args:
            execution_id: ID of the execution to wait for
            timeout: Maximum time to wait in seconds
            
        Returns:
            Final execution status
        """
        start_time = asyncio.get_event_loop().time()
        
        while execution_id in self.canvas.executions:
            execution = self.canvas.executions[execution_id]
            
            if execution.status in ["completed", "failed", "cancelled"]:
                return self.get_execution_status(execution_id)
            
            # Check timeout
            if timeout and (asyncio.get_event_loop().time() - start_time) > timeout:
                raise asyncio.TimeoutError(f"Execution {execution_id} did not complete within {timeout} seconds")
            
            await asyncio.sleep(0.1)
        
        return {"error": "Execution not found"}
    
    def get_all_executions(self) -> List[Dict[str, Any]]:
        """Get status of all workflow executions."""
        return [
            self.get_execution_status(exec_id)
            for exec_id in self.canvas.executions
        ]
    
    def cleanup_completed_executions(self, max_age_hours: int = 24):
        """Clean up old completed executions."""
        cutoff_time = datetime.now().timestamp() - (max_age_hours * 3600)
        
        executions_to_remove = []
        for exec_id, execution in self.canvas.executions.items():
            if execution.status in ["completed", "failed", "cancelled"]:
                if execution.end_time and execution.end_time.timestamp() < cutoff_time:
                    executions_to_remove.append(exec_id)
        
        for exec_id in executions_to_remove:
            del self.canvas.executions[exec_id]
        
        if executions_to_remove:
            logger.info(f"Cleaned up {len(executions_to_remove)} old executions")
