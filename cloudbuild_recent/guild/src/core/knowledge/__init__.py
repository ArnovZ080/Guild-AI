"""
Knowledge Module

This module provides knowledge graph capabilities for shared agent memory including:
- Graph-based knowledge storage
- Entity relationship management
- Context sharing between agents
"""

from .knowledge_graph import (
    KnowledgeGraph, KnowledgeNode, KnowledgeEdge, NodeType, RelationshipType, knowledge_graph,
    add_entity, link_entities, get_agent_context, find_entities
)

__all__ = [
    'KnowledgeGraph', 'KnowledgeNode', 'KnowledgeEdge', 'NodeType', 'RelationshipType', 'knowledge_graph',
    'add_entity', 'link_entities', 'get_agent_context', 'find_entities'
]
