"""
Workflow Canvas - Core workflow management system

This module provides the canvas for building and managing visual workflows
that combine AI agents with visual automation skills.
"""

import uuid
import asyncio
import logging
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
from dataclasses import dataclass, field

logger = logging.getLogger(__name__)


@dataclass
class WorkflowNode:
    """Represents a node in the workflow canvas"""
    node_id: str
    node_type: str  # 'agent', 'visual_skill', 'logic', 'input', 'output'
    name: str
    description: str
    position: Tuple[int, int] = (0, 0)
    config: Dict[str, Any] = field(default_factory=dict)
    status: str = "pending"  # pending, running, completed, failed
    inputs: List[str] = field(default_factory=list)
    outputs: List[str] = field(default_factory=list)
    dependencies: List[str] = field(default_factory=list)
    estimated_duration: int = 0  # seconds
    actual_duration: Optional[int] = None
    created_at: datetime = field(default_factory=datetime.now)
    last_executed: Optional[datetime] = None


@dataclass
class WorkflowConnection:
    """Represents a connection between workflow nodes"""
    connection_id: str
    source_node_id: str
    target_node_id: str
    source_port: str = "output"
    target_port: str = "input"
    data_type: str = "any"
    condition: Optional[str] = None  # For conditional connections


@dataclass
class WorkflowExecution:
    """Represents a workflow execution instance"""
    execution_id: str
    workflow_id: str
    status: str = "pending"  # pending, running, completed, failed, paused
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    current_node: Optional[str] = None
    execution_log: List[Dict[str, Any]] = field(default_factory=list)
    inputs: Dict[str, Any] = field(default_factory=dict)
    outputs: Dict[str, Any] = field(default_factory=dict)
    error: Optional[str] = None


class WorkflowCanvas:
    """
    Core workflow canvas that manages nodes, connections, and execution.
    This is the heart of the visual workflow building system.
    """
    
    def __init__(self):
        """Initialize the workflow canvas."""
        self.workflows: Dict[str, Dict[str, Any]] = {}
        self.executions: Dict[str, WorkflowExecution] = {}
        self.node_registry: Dict[str, Any] = {}
        self.connection_registry: Dict[str, WorkflowConnection] = {}
        
        logger.info("WorkflowCanvas initialized successfully")
    
    def create_workflow(self, name: str, description: str = "") -> str:
        """
        Create a new workflow.
        
        Args:
            name: Name of the workflow
            description: Description of the workflow
            
        Returns:
            Workflow ID
        """
        workflow_id = str(uuid.uuid4())
        
        self.workflows[workflow_id] = {
            "workflow_id": workflow_id,
            "name": name,
            "description": description,
            "nodes": {},
            "connections": [],
            "created_at": datetime.now(),
            "modified_at": datetime.now(),
            "version": "1.0.0",
            "status": "draft"  # draft, active, archived
        }
        
        logger.info(f"Created workflow: {name} (ID: {workflow_id})")
        return workflow_id
    
    def add_node(self, workflow_id: str, node: WorkflowNode) -> bool:
        """
        Add a node to a workflow.
        
        Args:
            workflow_id: ID of the workflow
            node: Node to add
            
        Returns:
            True if successful
        """
        if workflow_id not in self.workflows:
            logger.error(f"Workflow {workflow_id} not found")
            return False
        
        # Validate node
        if not self._validate_node(node):
            logger.error(f"Invalid node: {node.name}")
            return False
        
        # Add node to workflow
        self.workflows[workflow_id]["nodes"][node.node_id] = node
        self.workflows[workflow_id]["modified_at"] = datetime.now()
        
        # Register node globally
        self.node_registry[node.node_id] = node
        
        logger.info(f"Added node {node.name} to workflow {workflow_id}")
        return True
    
    def remove_node(self, workflow_id: str, node_id: str) -> bool:
        """
        Remove a node from a workflow.
        
        Args:
            workflow_id: ID of the workflow
            node_id: ID of the node to remove
            
        Returns:
            True if successful
        """
        if workflow_id not in self.workflows:
            return False
        
        workflow = self.workflows[workflow_id]
        
        if node_id not in workflow["nodes"]:
            return False
        
        # Remove node
        del workflow["nodes"][node_id]
        workflow["modified_at"] = datetime.now()
        
        # Remove from global registry
        if node_id in self.node_registry:
            del self.node_registry[node_id]
        
        # Remove connections involving this node
        workflow["connections"] = [
            conn for conn in workflow["connections"]
            if conn.source_node_id != node_id and conn.target_node_id != node_id
        ]
        
        logger.info(f"Removed node {node_id} from workflow {workflow_id}")
        return True
    
    def add_connection(self, workflow_id: str, connection: WorkflowConnection) -> bool:
        """
        Add a connection between nodes.
        
        Args:
            workflow_id: ID of the workflow
            connection: Connection to add
            
        Returns:
            True if successful
        """
        if workflow_id not in self.workflows:
            return False
        
        workflow = self.workflows[workflow_id]
        
        # Validate connection
        if not self._validate_connection(connection, workflow):
            logger.error(f"Invalid connection: {connection.source_node_id} -> {connection.target_node_id}")
            return False
        
        # Add connection
        workflow["connections"].append(connection)
        workflow["modified_at"] = datetime.now()
        
        # Register connection globally
        self.connection_registry[connection.connection_id] = connection
        
        logger.info(f"Added connection {connection.source_node_id} -> {connection.target_node_id}")
        return True
    
    def remove_connection(self, workflow_id: str, connection_id: str) -> bool:
        """
        Remove a connection from a workflow.
        
        Args:
            workflow_id: ID of the workflow
            connection_id: ID of the connection to remove
            
        Returns:
            True if successful
        """
        if workflow_id not in self.workflows:
            return False
        
        workflow = self.workflows[workflow_id]
        
        # Remove connection
        workflow["connections"] = [
            conn for conn in workflow["connections"]
            if conn.connection_id != connection_id
        ]
        workflow["modified_at"] = datetime.now()
        
        # Remove from global registry
        if connection_id in self.connection_registry:
            del self.connection_registry[connection_id]
        
        logger.info(f"Removed connection {connection_id}")
        return True
    
    def get_workflow(self, workflow_id: str) -> Optional[Dict[str, Any]]:
        """Get workflow by ID."""
        return self.workflows.get(workflow_id)
    
    def get_workflow_nodes(self, workflow_id: str) -> List[WorkflowNode]:
        """Get all nodes in a workflow."""
        if workflow_id not in self.workflows:
            return []
        
        return list(self.workflows[workflow_id]["nodes"].values())
    
    def get_workflow_connections(self, workflow_id: str) -> List[WorkflowConnection]:
        """Get all connections in a workflow."""
        if workflow_id not in self.workflows:
            return []
        
        return self.workflows[workflow_id]["connections"]
    
    def validate_workflow(self, workflow_id: str) -> Dict[str, Any]:
        """
        Validate a workflow for execution.
        
        Args:
            workflow_id: ID of the workflow to validate
            
        Returns:
            Validation result
        """
        if workflow_id not in self.workflows:
            return {"valid": False, "error": "Workflow not found"}
        
        workflow = self.workflows[workflow_id]
        nodes = workflow["nodes"]
        connections = workflow["connections"]
        
        errors = []
        warnings = []
        
        # Check for cycles
        if self._has_cycles(nodes, connections):
            errors.append("Workflow contains cycles")
        
        # Check for disconnected nodes
        disconnected = self._find_disconnected_nodes(nodes, connections)
        if disconnected:
            warnings.append(f"Disconnected nodes: {', '.join(disconnected)}")
        
        # Check for missing dependencies
        missing_deps = self._check_missing_dependencies(nodes, connections)
        if missing_deps:
            errors.append(f"Missing dependencies: {missing_deps}")
        
        # Check for input/output compatibility
        compatibility_issues = self._check_io_compatibility(nodes, connections)
        if compatibility_issues:
            warnings.append(f"IO compatibility issues: {compatibility_issues}")
        
        return {
            "valid": len(errors) == 0,
            "errors": errors,
            "warnings": warnings,
            "node_count": len(nodes),
            "connection_count": len(connections)
        }
    
    def _validate_node(self, node: WorkflowNode) -> bool:
        """Validate a workflow node."""
        if not node.node_id or not node.name:
            return False
        
        if node.node_type not in ['agent', 'visual_skill', 'logic', 'input', 'output']:
            return False
        
        return True
    
    def _validate_connection(self, connection: WorkflowConnection, workflow: Dict[str, Any]) -> bool:
        """Validate a workflow connection."""
        nodes = workflow["nodes"]
        
        # Check if source and target nodes exist
        if connection.source_node_id not in nodes:
            return False
        
        if connection.target_node_id not in nodes:
            return False
        
        # Check for self-connection
        if connection.source_node_id == connection.target_node_id:
            return False
        
        # Check for duplicate connections
        existing_connections = workflow["connections"]
        for existing in existing_connections:
            if (existing.source_node_id == connection.source_node_id and
                existing.target_node_id == connection.target_node_id and
                existing.source_port == connection.source_port and
                existing.target_port == connection.target_port):
                return False
        
        return True
    
    def _has_cycles(self, nodes: Dict[str, WorkflowNode], connections: List[WorkflowConnection]) -> bool:
        """Check if workflow has cycles using DFS."""
        visited = set()
        rec_stack = set()
        
        def dfs(node_id):
            visited.add(node_id)
            rec_stack.add(node_id)
            
            # Find all outgoing connections
            for conn in connections:
                if conn.source_node_id == node_id:
                    neighbor = conn.target_node_id
                    if neighbor not in visited:
                        if dfs(neighbor):
                            return True
                    elif neighbor in rec_stack:
                        return True
            
            rec_stack.remove(node_id)
            return False
        
        for node_id in nodes:
            if node_id not in visited:
                if dfs(node_id):
                    return True
        
        return False
    
    def _find_disconnected_nodes(self, nodes: Dict[str, WorkflowNode], connections: List[WorkflowConnection]) -> List[str]:
        """Find nodes that have no connections."""
        connected_nodes = set()
        
        for conn in connections:
            connected_nodes.add(conn.source_node_id)
            connected_nodes.add(conn.target_node_id)
        
        return [node_id for node_id in nodes if node_id not in connected_nodes]
    
    def _check_missing_dependencies(self, nodes: Dict[str, WorkflowNode], connections: List[WorkflowConnection]) -> List[str]:
        """Check for missing dependencies."""
        missing = []
        
        for node in nodes.values():
            for dep in node.dependencies:
                if dep not in nodes:
                    missing.append(f"{node.name} -> {dep}")
        
        return missing
    
    def _check_io_compatibility(self, nodes: Dict[str, WorkflowNode], connections: List[WorkflowConnection]) -> List[str]:
        """Check input/output compatibility between connected nodes."""
        issues = []
        
        for conn in connections:
            source_node = nodes[conn.source_node_id]
            target_node = nodes[conn.target_node_id]
            
            # Basic compatibility check (can be enhanced)
            if source_node.node_type == "output" and target_node.node_type == "input":
                issues.append(f"Output node {source_node.name} connected to input node {target_node.name}")
        
        return issues
    
    def export_workflow(self, workflow_id: str) -> Dict[str, Any]:
        """Export workflow to JSON format."""
        if workflow_id not in self.workflows:
            return {}
        
        workflow = self.workflows[workflow_id]
        
        return {
            "workflow_id": workflow_id,
            "name": workflow["name"],
            "description": workflow["description"],
            "version": workflow["version"],
            "nodes": {
                node_id: {
                    "node_id": node.node_id,
                    "node_type": node.node_type,
                    "name": node.name,
                    "description": node.description,
                    "position": node.position,
                    "config": node.config,
                    "inputs": node.inputs,
                    "outputs": node.outputs,
                    "dependencies": node.dependencies,
                    "estimated_duration": node.estimated_duration
                }
                for node_id, node in workflow["nodes"].items()
            },
            "connections": [
                {
                    "connection_id": conn.connection_id,
                    "source_node_id": conn.source_node_id,
                    "target_node_id": conn.target_node_id,
                    "source_port": conn.source_port,
                    "target_port": conn.target_port,
                    "data_type": conn.data_type,
                    "condition": conn.condition
                }
                for conn in workflow["connections"]
            ],
            "metadata": {
                "created_at": workflow["created_at"].isoformat(),
                "modified_at": workflow["modified_at"].isoformat(),
                "status": workflow["status"]
            }
        }
    
    def import_workflow(self, workflow_data: Dict[str, Any]) -> str:
        """Import workflow from JSON format."""
        workflow_id = workflow_data.get("workflow_id", str(uuid.uuid4()))
        
        # Create workflow
        self.workflows[workflow_id] = {
            "workflow_id": workflow_id,
            "name": workflow_data.get("name", "Imported Workflow"),
            "description": workflow_data.get("description", ""),
            "nodes": {},
            "connections": [],
            "created_at": datetime.fromisoformat(workflow_data["metadata"]["created_at"]),
            "modified_at": datetime.now(),
            "version": workflow_data.get("version", "1.0.0"),
            "status": "draft"
        }
        
        # Import nodes
        for node_data in workflow_data["nodes"].values():
            node = WorkflowNode(
                node_id=node_data["node_id"],
                node_type=node_data["node_type"],
                name=node_data["name"],
                description=node_data["description"],
                position=tuple(node_data["position"]),
                config=node_data["config"],
                inputs=node_data["inputs"],
                outputs=node_data["outputs"],
                dependencies=node_data["dependencies"],
                estimated_duration=node_data["estimated_duration"]
            )
            self.add_node(workflow_id, node)
        
        # Import connections
        for conn_data in workflow_data["connections"]:
            connection = WorkflowConnection(
                connection_id=conn_data["connection_id"],
                source_node_id=conn_data["source_node_id"],
                target_node_id=conn_data["target_node_id"],
                source_port=conn_data["source_port"],
                target_port=conn_data["target_port"],
                data_type=conn_data["data_type"],
                condition=conn_data.get("condition")
            )
            self.add_connection(workflow_id, connection)
        
        logger.info(f"Imported workflow: {workflow_data['name']} (ID: {workflow_id})")
        return workflow_id
