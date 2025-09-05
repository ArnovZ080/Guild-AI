"""
Visual Workflow Builder for Guild-AI

This module provides the core workflow building capabilities that integrate
learned visual skills with existing AI agents to create powerful automations.
"""

from .workflow_canvas import WorkflowCanvas
from .workflow_engine import WorkflowExecutionEngine
from .workflow_builder import VisualWorkflowBuilder

# Conditional import for node types to avoid vision dependency issues
try:
    from .node_types import AgentNode, VisualSkillNode, LogicNode
    NODE_TYPES_AVAILABLE = True
except ImportError:
    AgentNode = None
    VisualSkillNode = None
    LogicNode = None
    NODE_TYPES_AVAILABLE = False
    print("Warning: Node types not available - workflow builder functionality limited")

__all__ = [
    "WorkflowCanvas",
    "WorkflowExecutionEngine", 
    "VisualWorkflowBuilder",
    "AgentNode",
    "VisualSkillNode",
    "LogicNode"
]
