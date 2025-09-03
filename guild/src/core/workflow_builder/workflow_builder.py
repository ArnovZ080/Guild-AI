"""
Visual Workflow Builder - Main Interface

This module provides the main interface for building and managing workflows.
It integrates the WorkflowCanvas, WorkflowExecutionEngine, and provides
high-level workflow management capabilities.
"""

import uuid
import logging
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime

from .workflow_canvas import WorkflowCanvas, WorkflowNode, WorkflowConnection
from .workflow_engine import WorkflowExecutionEngine
from .node_types import create_node, BaseNode

logger = logging.getLogger(__name__)


class VisualWorkflowBuilder:
    """
    Main interface for building and managing visual workflows.
    
    This class provides a high-level API for:
    - Creating and managing workflows
    - Adding different types of nodes
    - Connecting nodes to build workflows
    - Executing workflows
    - Monitoring execution progress
    """
    
    def __init__(self):
        """Initialize the workflow builder."""
        self.canvas = WorkflowCanvas()
        self.execution_engine = WorkflowExecutionEngine(self.canvas)
        
        # Available node templates
        self.node_templates = self._initialize_node_templates()
        
        logger.info("VisualWorkflowBuilder initialized successfully")
    
    def _initialize_node_templates(self) -> Dict[str, Dict[str, Any]]:
        """Initialize available node templates."""
        return {
            # AI Agent Templates
            "content_strategist": {
                "type": "agent",
                "name": "Content Strategist",
                "description": "AI agent that creates content strategies",
                "config": {"agent_type": "content_strategist"},
                "category": "AI Agents"
            },
            "copywriter": {
                "type": "agent",
                "name": "Copywriter",
                "description": "AI agent that writes compelling copy",
                "config": {"agent_type": "copywriter"},
                "category": "AI Agents"
            },
            "judge": {
                "type": "agent",
                "name": "Judge Agent",
                "description": "AI agent that evaluates quality and generates rubrics",
                "config": {"agent_type": "judge"},
                "category": "AI Agents"
            },
            "onboarding": {
                "type": "agent",
                "name": "Onboarding Agent",
                "description": "AI agent that handles user onboarding",
                "config": {"agent_type": "onboarding"},
                "category": "AI Agents"
            },
            
            # Visual Skill Templates
            "email_navigation": {
                "type": "visual_skill",
                "name": "Email Navigation",
                "description": "Navigate to specific email account and compose",
                "config": {
                    "skill_pattern": {
                        "steps": [
                            {"action_type": "click", "target_element": "email_app_icon"},
                            {"action_type": "wait", "duration": 2},
                            {"action_type": "click", "target_element": "compose_button"}
                        ],
                        "estimated_duration": 30
                    }
                },
                "category": "Visual Skills"
            },
            "form_filling": {
                "type": "visual_skill",
                "name": "Form Filling",
                "description": "Fill out forms automatically",
                "config": {
                    "skill_pattern": {
                        "steps": [
                            {"action_type": "click", "target_element": "form_field"},
                            {"action_type": "type", "target_element": "input_field", "action_data": {"text": "{form_data}"}},
                            {"action_type": "click", "target_element": "submit_button"}
                        ],
                        "estimated_duration": 45
                    }
                },
                "category": "Visual Skills"
            },
            
            # Logic Templates
            "if_else": {
                "type": "logic",
                "name": "If/Else Condition",
                "description": "Conditional branching based on data",
                "config": {
                    "logic_type": "if_else",
                    "condition": "data_quality > 0.8",
                    "if_branch": "high_quality_path",
                    "else_branch": "review_path"
                },
                "category": "Logic & Control"
            },
            "loop": {
                "type": "logic",
                "name": "Loop",
                "description": "Repeat actions multiple times",
                "config": {
                    "logic_type": "loop",
                    "loop_type": "for",
                    "iterations": 5
                },
                "category": "Logic & Control"
            },
            "delay": {
                "type": "logic",
                "name": "Delay",
                "description": "Wait for specified time",
                "config": {
                    "logic_type": "delay",
                    "delay_seconds": 5
                },
                "category": "Logic & Control"
            },
            
            # Input/Output Templates
            "text_input": {
                "type": "input",
                "name": "Text Input",
                "description": "Accept text input from user",
                "config": {"input_type": "text", "default_value": ""},
                "category": "Input/Output"
            },
            "data_output": {
                "type": "output",
                "name": "Data Output",
                "description": "Collect and format final results",
                "config": {"output_type": "json"},
                "category": "Input/Output"
            }
        }
    
    def get_available_templates(self) -> Dict[str, List[Dict[str, Any]]]:
        """Get available node templates organized by category."""
        templates_by_category = {}
        
        for template_id, template in self.node_templates.items():
            category = template["category"]
            if category not in templates_by_category:
                templates_by_category[category] = []
            
            templates_by_category[category].append({
                "template_id": template_id,
                **template
            })
        
        return templates_by_category
    
    def create_workflow(self, name: str, description: str = "") -> str:
        """
        Create a new workflow.
        
        Args:
            name: Name of the workflow
            description: Description of the workflow
            
        Returns:
            Workflow ID
        """
        return self.canvas.create_workflow(name, description)
    
    def add_node_from_template(self, workflow_id: str, template_id: str, position: Tuple[int, int] = (0, 0), custom_config: Dict[str, Any] = None) -> Optional[str]:
        """
        Add a node to a workflow using a template.
        
        Args:
            workflow_id: ID of the workflow
            template_id: ID of the template to use
            position: Position of the node on the canvas
            custom_config: Custom configuration to override template defaults
            
        Returns:
            Node ID if successful, None otherwise
        """
        if template_id not in self.node_templates:
            logger.error(f"Template {template_id} not found")
            return None
        
        template = self.node_templates[template_id]
        
        # Merge template config with custom config
        config = template["config"].copy()
        if custom_config:
            config.update(custom_config)
        
        # Create node
        node = create_node(
            node_type=template["type"],
            node_id=str(uuid.uuid4()),
            name=template["name"],
            **config
        )
        
        # Set position
        node.position = position
        
        # Add to workflow
        if self.canvas.add_node(workflow_id, node):
            logger.info(f"Added node {node.name} to workflow {workflow_id}")
            return node.node_id
        else:
            logger.error(f"Failed to add node {node.name} to workflow {workflow_id}")
            return None
    
    def add_custom_node(self, workflow_id: str, node_type: str, name: str, config: Dict[str, Any], position: Tuple[int, int] = (0, 0)) -> Optional[str]:
        """
        Add a custom node to a workflow.
        
        Args:
            workflow_id: ID of the workflow
            node_type: Type of the node
            name: Name of the node
            config: Node configuration
            position: Position of the node on the canvas
            
        Returns:
            Node ID if successful, None otherwise
        """
        try:
            node = create_node(
                node_type=node_type,
                node_id=str(uuid.uuid4()),
                name=name,
                **config
            )
            
            node.position = position
            
            if self.canvas.add_node(workflow_id, node):
                logger.info(f"Added custom node {name} to workflow {workflow_id}")
                return node.node_id
            else:
                logger.error(f"Failed to add custom node {name} to workflow {workflow_id}")
                return None
                
        except Exception as e:
            logger.error(f"Error creating custom node: {e}")
            return None
    
    def connect_nodes(self, workflow_id: str, source_node_id: str, target_node_id: str, source_port: str = "output", target_port: str = "input", data_type: str = "any", condition: str = None) -> bool:
        """
        Connect two nodes in a workflow.
        
        Args:
            workflow_id: ID of the workflow
            source_node_id: ID of the source node
            target_node_id: ID of the target node
            source_port: Port on source node
            target_port: Port on target node
            data_type: Type of data being passed
            condition: Optional condition for the connection
            
        Returns:
            True if successful
        """
        connection = WorkflowConnection(
            connection_id=str(uuid.uuid4()),
            source_node_id=source_node_id,
            target_node_id=target_node_id,
            source_port=source_port,
            target_port=target_port,
            data_type=data_type,
            condition=condition
        )
        
        return self.canvas.add_connection(workflow_id, connection)
    
    def disconnect_nodes(self, workflow_id: str, source_node_id: str, target_node_id: str) -> bool:
        """
        Disconnect two nodes in a workflow.
        
        Args:
            workflow_id: ID of the workflow
            source_node_id: ID of the source node
            target_node_id: ID of the target node
            
        Returns:
            True if successful
        """
        connections = self.canvas.get_workflow_connections(workflow_id)
        
        for connection in connections:
            if (connection.source_node_id == source_node_id and 
                connection.target_node_id == target_node_id):
                return self.canvas.remove_connection(workflow_id, connection.connection_id)
        
        return False
    
    def remove_node(self, workflow_id: str, node_id: str) -> bool:
        """
        Remove a node from a workflow.
        
        Args:
            workflow_id: ID of the workflow
            node_id: ID of the node to remove
            
        Returns:
            True if successful
        """
        return self.canvas.remove_node(workflow_id, node_id)
    
    def update_node_config(self, workflow_id: str, node_id: str, new_config: Dict[str, Any]) -> bool:
        """
        Update configuration of a node.
        
        Args:
            workflow_id: ID of the workflow
            node_id: ID of the node
            new_config: New configuration
            
        Returns:
            True if successful
        """
        workflow = self.canvas.get_workflow(workflow_id)
        if not workflow or node_id not in workflow["nodes"]:
            return False
        
        node = workflow["nodes"][node_id]
        
        # Update node configuration
        for key, value in new_config.items():
            if hasattr(node, key):
                setattr(node, key, value)
        
        workflow["modified_at"] = datetime.now()
        logger.info(f"Updated node {node_id} configuration")
        return True
    
    def move_node(self, workflow_id: str, node_id: str, new_position: Tuple[int, int]) -> bool:
        """
        Move a node to a new position on the canvas.
        
        Args:
            workflow_id: ID of the workflow
            node_id: ID of the node
            new_position: New position (x, y)
            
        Returns:
            True if successful
        """
        workflow = self.canvas.get_workflow(workflow_id)
        if not workflow or node_id not in workflow["nodes"]:
            return False
        
        node = workflow["nodes"][node_id]
        node.position = new_position
        workflow["modified_at"] = datetime.now()
        
        logger.info(f"Moved node {node_id} to position {new_position}")
        return True
    
    def validate_workflow(self, workflow_id: str) -> Dict[str, Any]:
        """
        Validate a workflow for execution.
        
        Args:
            workflow_id: ID of the workflow
            
        Returns:
            Validation result
        """
        return self.canvas.validate_workflow(workflow_id)
    
    def execute_workflow(self, workflow_id: str, inputs: Dict[str, Any] = None) -> str:
        """
        Execute a workflow.
        
        Args:
            workflow_id: ID of the workflow
            inputs: Input data for the workflow
            
        Returns:
            Execution ID
        """
        return self.execution_engine.execute_workflow(workflow_id, inputs)
    
    def get_execution_status(self, execution_id: str) -> Optional[Dict[str, Any]]:
        """
        Get status of a workflow execution.
        
        Args:
            execution_id: ID of the execution
            
        Returns:
            Execution status
        """
        return self.execution_engine.get_execution_status(execution_id)
    
    def pause_execution(self, execution_id: str) -> bool:
        """Pause a workflow execution."""
        return self.execution_engine.pause_execution(execution_id)
    
    def resume_execution(self, execution_id: str) -> bool:
        """Resume a paused workflow execution."""
        return self.execution_engine.resume_execution(execution_id)
    
    def cancel_execution(self, execution_id: str) -> bool:
        """Cancel a workflow execution."""
        return self.execution_engine.cancel_execution(execution_id)
    
    def wait_for_completion(self, execution_id: str, timeout: float = None) -> Dict[str, Any]:
        """
        Wait for a workflow execution to complete.
        
        Args:
            execution_id: ID of the execution
            timeout: Maximum time to wait in seconds
            
        Returns:
            Final execution status
        """
        return self.execution_engine.wait_for_completion(execution_id, timeout)
    
    def get_workflow(self, workflow_id: str) -> Optional[Dict[str, Any]]:
        """Get workflow by ID."""
        return self.canvas.get_workflow(workflow_id)
    
    def get_workflow_nodes(self, workflow_id: str) -> List[WorkflowNode]:
        """Get all nodes in a workflow."""
        return self.canvas.get_workflow_nodes(workflow_id)
    
    def get_workflow_connections(self, workflow_id: str) -> List[WorkflowConnection]:
        """Get all connections in a workflow."""
        return self.canvas.get_workflow_connections(workflow_id)
    
    def export_workflow(self, workflow_id: str) -> Dict[str, Any]:
        """Export workflow to JSON format."""
        return self.canvas.export_workflow(workflow_id)
    
    def import_workflow(self, workflow_data: Dict[str, Any]) -> str:
        """Import workflow from JSON format."""
        return self.canvas.import_workflow(workflow_data)
    
    def duplicate_workflow(self, workflow_id: str, new_name: str = None) -> str:
        """
        Duplicate an existing workflow.
        
        Args:
            workflow_id: ID of the workflow to duplicate
            new_name: Name for the new workflow
            
        Returns:
            ID of the new workflow
        """
        workflow_data = self.export_workflow(workflow_id)
        
        if new_name:
            workflow_data["name"] = f"{new_name} (Copy)"
        else:
            workflow_data["name"] = f"{workflow_data['name']} (Copy)"
        
        # Generate new IDs for all nodes and connections
        old_to_new_ids = {}
        
        # Update node IDs
        for old_node_id, node_data in workflow_data["nodes"].items():
            new_node_id = str(uuid.uuid4())
            old_to_new_ids[old_node_id] = new_node_id
            node_data["node_id"] = new_node_id
        
        # Update connection IDs and references
        for connection in workflow_data["connections"]:
            connection["connection_id"] = str(uuid.uuid4())
            connection["source_node_id"] = old_to_new_ids[connection["source_node_id"]]
            connection["target_node_id"] = old_to_new_ids[connection["target_node_id"]]
        
        # Import the duplicated workflow
        new_workflow_id = self.import_workflow(workflow_data)
        
        logger.info(f"Duplicated workflow {workflow_id} as {new_workflow_id}")
        return new_workflow_id
    
    def get_workflow_statistics(self, workflow_id: str) -> Dict[str, Any]:
        """
        Get statistics about a workflow.
        
        Args:
            workflow_id: ID of the workflow
            
        Returns:
            Workflow statistics
        """
        workflow = self.get_workflow(workflow_id)
        if not workflow:
            return {}
        
        nodes = workflow["nodes"]
        connections = workflow["connections"]
        
        # Count nodes by type
        node_type_counts = {}
        for node in nodes.values():
            node_type = node.node_type
            node_type_counts[node_type] = node_type_counts.get(node_type, 0) + 1
        
        # Calculate estimated duration
        total_estimated_duration = sum(
            node.estimated_duration for node in nodes.values()
        )
        
        # Get execution history
        executions = [
            exec_data for exec_data in self.execution_engine.get_all_executions()
            if exec_data["workflow_id"] == workflow_id
        ]
        
        execution_stats = {
            "total_executions": len(executions),
            "successful_executions": len([e for e in executions if e["status"] == "completed"]),
            "failed_executions": len([e for e in executions if e["status"] == "failed"]),
            "average_execution_time": None
        }
        
        # Calculate average execution time
        completed_executions = [e for e in executions if e["status"] == "completed"]
        if completed_executions:
            total_time = sum(
                (e["end_time"] - e["start_time"]).total_seconds()
                for e in completed_executions
                if e["end_time"] and e["start_time"]
            )
            execution_stats["average_execution_time"] = total_time / len(completed_executions)
        
        return {
            "workflow_id": workflow_id,
            "name": workflow["name"],
            "node_count": len(nodes),
            "connection_count": len(connections),
            "node_type_distribution": node_type_counts,
            "estimated_duration": total_estimated_duration,
            "execution_statistics": execution_stats,
            "created_at": workflow["created_at"],
            "modified_at": workflow["modified_at"],
            "status": workflow["status"]
        }
    
    def cleanup_old_executions(self, max_age_hours: int = 24):
        """Clean up old completed executions."""
        self.execution_engine.cleanup_completed_executions(max_age_hours)
    
    def get_all_workflows(self) -> List[Dict[str, Any]]:
        """Get list of all workflows with basic information."""
        workflows = []
        
        for workflow_id, workflow_data in self.canvas.workflows.items():
            workflows.append({
                "workflow_id": workflow_id,
                "name": workflow_data["name"],
                "description": workflow_data["description"],
                "node_count": len(workflow_data["nodes"]),
                "connection_count": len(workflow_data["connections"]),
                "status": workflow_data["status"],
                "created_at": workflow_data["created_at"],
                "modified_at": workflow_data["modified_at"]
            })
        
        return workflows
