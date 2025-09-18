"""
Knowledge Graph System for Shared Agent Memory

This module provides a graph-based knowledge storage system that enables agents to share
structured information, track relationships, and maintain context across the Guild-AI system.
"""

import json
import asyncio
from typing import Dict, Any, List, Optional, Set, Union
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from enum import Enum
import uuid
try:
    import networkx as nx
except ImportError:
    # Fallback for environments without networkx
    nx = None
from guild.src.core.config import settings
from guild.src.utils.logging_utils import get_logger

logger = get_logger(__name__)

class NodeType(Enum):
    """Types of nodes in the knowledge graph"""
    # Business Entities
    CUSTOMER = "customer"
    LEAD = "lead"
    COMPANY = "company"
    CONTACT = "contact"
    
    # Content & Assets
    DOCUMENT = "document"
    CAMPAIGN = "campaign"
    CONTENT = "content"
    ASSET = "asset"
    
    # Tasks & Processes
    TASK = "task"
    WORKFLOW = "workflow"
    PROCESS = "process"
    GOAL = "goal"
    
    # Data & Analytics
    METRIC = "metric"
    REPORT = "report"
    ANALYSIS = "analysis"
    INSIGHT = "insight"
    
    # System
    AGENT = "agent"
    EVENT = "event"
    DECISION = "decision"
    RISK = "risk"

class RelationshipType(Enum):
    """Types of relationships between nodes"""
    # Business Relationships
    OWNS = "owns"
    WORKS_FOR = "works_for"
    SUPPLIES = "supplies"
    COMPETES_WITH = "competes_with"
    PARTNERS_WITH = "partners_with"
    
    # Content Relationships
    CREATES = "creates"
    REFERENCES = "references"
    DEPENDS_ON = "depends_on"
    INFLUENCES = "influences"
    REPLACES = "replaces"
    
    # Process Relationships
    LEADS_TO = "leads_to"
    TRIGGERS = "triggers"
    BLOCKS = "blocks"
    ENABLES = "enables"
    MEASURES = "measures"
    
    # Data Relationships
    CONTAINS = "contains"
    DERIVED_FROM = "derived_from"
    VALIDATES = "validates"
    CONTRADICTS = "contradicts"
    SUPPORTS = "supports"

@dataclass
class KnowledgeNode:
    """A node in the knowledge graph"""
    id: str
    type: NodeType
    name: str
    properties: Dict[str, Any]
    created_at: datetime = None
    updated_at: datetime = None
    created_by: str = "system"
    confidence: float = 1.0  # Confidence in the information (0-1)
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now(timezone.utc)
        if self.updated_at is None:
            self.updated_at = self.created_at
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert node to dictionary"""
        return {
            "id": self.id,
            "type": self.type.value,
            "name": self.name,
            "properties": self.properties,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "created_by": self.created_by,
            "confidence": self.confidence
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'KnowledgeNode':
        """Create node from dictionary"""
        data['type'] = NodeType(data['type'])
        data['created_at'] = datetime.fromisoformat(data['created_at'])
        data['updated_at'] = datetime.fromisoformat(data['updated_at'])
        return cls(**data)

@dataclass
class KnowledgeEdge:
    """An edge (relationship) in the knowledge graph"""
    source_id: str
    target_id: str
    relationship: RelationshipType
    properties: Dict[str, Any]
    created_at: datetime = None
    created_by: str = "system"
    confidence: float = 1.0
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now(timezone.utc)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert edge to dictionary"""
        return {
            "source_id": self.source_id,
            "target_id": self.target_id,
            "relationship": self.relationship.value,
            "properties": self.properties,
            "created_at": self.created_at.isoformat(),
            "created_by": self.created_by,
            "confidence": self.confidence
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'KnowledgeEdge':
        """Create edge from dictionary"""
        data['relationship'] = RelationshipType(data['relationship'])
        data['created_at'] = datetime.fromisoformat(data['created_at'])
        return cls(**data)

class KnowledgeGraph:
    """
    Graph-based knowledge storage system for agent coordination.
    
    Features:
    - Node and edge storage with properties
    - Relationship traversal and querying
    - Confidence scoring and conflict resolution
    - Temporal tracking of knowledge evolution
    - Agent attribution and provenance
    """
    
    def __init__(self):
        if nx is not None:
            self.graph = nx.MultiDiGraph()
        else:
            self.graph = None  # Fallback to simple dict-based storage
        self.node_index: Dict[str, KnowledgeNode] = {}
        self.edge_index: Dict[str, KnowledgeEdge] = {}
        self.type_index: Dict[NodeType, Set[str]] = {node_type: set() for node_type in NodeType}
        self.agent_context: Dict[str, Dict[str, Any]] = {}  # Agent-specific context
    
    async def add_node(self, 
                      node_type: NodeType, 
                      name: str, 
                      properties: Dict[str, Any] = None,
                      created_by: str = "system",
                      confidence: float = 1.0) -> str:
        """
        Add a node to the knowledge graph.
        
        Args:
            node_type: Type of the node
            name: Human-readable name
            properties: Additional properties
            created_by: Agent that created the node
            confidence: Confidence in the information
            
        Returns:
            str: Node ID
        """
        node_id = str(uuid.uuid4())
        
        # Check for existing similar nodes
        existing_node = await self.find_similar_node(node_type, name, properties or {})
        if existing_node:
            # Update existing node instead of creating duplicate
            await self.update_node(existing_node.id, properties or {}, created_by)
            return existing_node.id
        
        node = KnowledgeNode(
            id=node_id,
            type=node_type,
            name=name,
            properties=properties or {},
            created_by=created_by,
            confidence=confidence
        )
        
        # Add to graph and indices
        self.graph.add_node(node_id, **node.to_dict())
        self.node_index[node_id] = node
        self.type_index[node_type].add(node_id)
        
        logger.info(f"Added {node_type.value} node: {name} (ID: {node_id})")
        return node_id
    
    async def add_edge(self, 
                      source_id: str, 
                      target_id: str, 
                      relationship: RelationshipType,
                      properties: Dict[str, Any] = None,
                      created_by: str = "system",
                      confidence: float = 1.0) -> str:
        """
        Add an edge (relationship) between nodes.
        
        Args:
            source_id: Source node ID
            target_id: Target node ID
            relationship: Type of relationship
            properties: Additional properties
            created_by: Agent that created the edge
            confidence: Confidence in the relationship
            
        Returns:
            str: Edge ID
        """
        if source_id not in self.node_index or target_id not in self.node_index:
            raise ValueError(f"Source or target node not found")
        
        edge_id = f"{source_id}:{target_id}:{relationship.value}"
        
        # Check for existing edge
        if edge_id in self.edge_index:
            # Update existing edge
            edge = self.edge_index[edge_id]
            edge.properties.update(properties or {})
            edge.confidence = max(edge.confidence, confidence)  # Keep highest confidence
            return edge_id
        
        edge = KnowledgeEdge(
            source_id=source_id,
            target_id=target_id,
            relationship=relationship,
            properties=properties or {},
            created_by=created_by,
            confidence=confidence
        )
        
        # Add to graph and index
        self.graph.add_edge(source_id, target_id, key=edge_id, **edge.to_dict())
        self.edge_index[edge_id] = edge
        
        logger.info(f"Added edge: {source_id} -> {target_id} ({relationship.value})")
        return edge_id
    
    async def update_node(self, 
                         node_id: str, 
                         properties: Dict[str, Any],
                         updated_by: str = "system") -> bool:
        """Update node properties"""
        if node_id not in self.node_index:
            return False
        
        node = self.node_index[node_id]
        node.properties.update(properties)
        node.updated_at = datetime.now(timezone.utc)
        
        # Update graph
        self.graph.nodes[node_id].update(node.to_dict())
        
        logger.info(f"Updated node {node_id}")
        return True
    
    async def find_similar_node(self, 
                               node_type: NodeType, 
                               name: str, 
                               properties: Dict[str, Any]) -> Optional[KnowledgeNode]:
        """Find similar existing nodes to avoid duplicates"""
        for node_id in self.type_index[node_type]:
            node = self.node_index[node_id]
            
            # Check name similarity
            if node.name.lower() == name.lower():
                return node
            
            # Check key property matches
            for key, value in properties.items():
                if key in node.properties and str(node.properties[key]).lower() == str(value).lower():
                    return node
        
        return None
    
    async def query_nodes(self, 
                         node_type: Optional[NodeType] = None,
                         properties: Optional[Dict[str, Any]] = None,
                         limit: int = 100) -> List[KnowledgeNode]:
        """Query nodes by type and properties"""
        results = []
        
        # Filter by type if specified
        node_ids = self.type_index[node_type] if node_type else list(self.node_index.keys())
        
        for node_id in node_ids:
            node = self.node_index[node_id]
            
            # Filter by properties if specified
            if properties:
                match = True
                for key, value in properties.items():
                    if key not in node.properties or node.properties[key] != value:
                        match = False
                        break
                if not match:
                    continue
            
            results.append(node)
            
            if len(results) >= limit:
                break
        
        return results
    
    async def traverse_relationships(self, 
                                   start_node_id: str,
                                   relationship_types: Optional[List[RelationshipType]] = None,
                                   max_depth: int = 3) -> Dict[str, List[KnowledgeNode]]:
        """Traverse relationships from a starting node"""
        results = {}
        
        def traverse(current_id: str, depth: int, visited: Set[str]):
            if depth > max_depth or current_id in visited:
                return
            
            visited.add(current_id)
            
            # Get neighbors
            for neighbor_id in self.graph.neighbors(current_id):
                edge_data = self.graph.get_edge_data(current_id, neighbor_id)
                
                for edge_key, edge_props in edge_data.items():
                    relationship = RelationshipType(edge_props['relationship'])
                    
                    # Filter by relationship type if specified
                    if relationship_types and relationship not in relationship_types:
                        continue
                    
                    # Add to results
                    if relationship.value not in results:
                        results[relationship.value] = []
                    
                    neighbor_node = self.node_index.get(neighbor_id)
                    if neighbor_node:
                        results[relationship.value].append(neighbor_node)
                    
                    # Recursively traverse
                    traverse(neighbor_id, depth + 1, visited.copy())
        
        traverse(start_node_id, 0, set())
        return results
    
    async def get_context_for_agent(self, agent_name: str) -> Dict[str, Any]:
        """Get relevant context for a specific agent"""
        context = {
            "recent_activities": [],
            "related_entities": [],
            "pending_tasks": [],
            "insights": []
        }
        
        # Get agent-specific context if available
        if agent_name in self.agent_context:
            context.update(self.agent_context[agent_name])
        
        # Find recent nodes created by this agent
        recent_nodes = []
        for node in self.node_index.values():
            if node.created_by == agent_name:
                recent_nodes.append(node)
        
        # Sort by creation time
        recent_nodes.sort(key=lambda n: n.created_at, reverse=True)
        context["recent_activities"] = recent_nodes[:10]
        
        # Find related entities (nodes connected to recent activities)
        related_entities = set()
        for node in recent_nodes[:5]:
            relationships = await self.traverse_relationships(node.id, max_depth=2)
            for rel_type, connected_nodes in relationships.items():
                related_entities.update(connected_nodes)
        
        context["related_entities"] = list(related_entities)[:20]
        
        return context
    
    async def set_agent_context(self, agent_name: str, context: Dict[str, Any]):
        """Set agent-specific context"""
        self.agent_context[agent_name] = context
    
    async def resolve_conflicts(self, node_id: str, new_properties: Dict[str, Any], 
                               source_agent: str) -> Dict[str, Any]:
        """Resolve conflicts when updating node properties"""
        if node_id not in self.node_index:
            return new_properties
        
        node = self.node_index[node_id]
        resolved_properties = node.properties.copy()
        conflicts = []
        
        for key, new_value in new_properties.items():
            if key in node.properties and node.properties[key] != new_value:
                # Conflict detected
                conflicts.append({
                    "property": key,
                    "existing_value": node.properties[key],
                    "new_value": new_value,
                    "existing_agent": node.created_by,
                    "new_agent": source_agent
                })
                
                # Simple conflict resolution: use the most recent value
                # In a more sophisticated system, this could use confidence scores,
                # agent authority levels, or user intervention
                resolved_properties[key] = new_value
        
        if conflicts:
            logger.warning(f"Resolved {len(conflicts)} conflicts for node {node_id}")
        
        return resolved_properties
    
    async def export_subgraph(self, 
                            start_node_id: str, 
                            max_depth: int = 2) -> Dict[str, Any]:
        """Export a subgraph for sharing with other agents"""
        subgraph_data = {
            "nodes": [],
            "edges": [],
            "metadata": {
                "export_time": datetime.now(timezone.utc).isoformat(),
                "start_node": start_node_id,
                "max_depth": max_depth
            }
        }
        
        # Get relationships
        relationships = await self.traverse_relationships(start_node_id, max_depth=max_depth)
        
        # Collect all relevant nodes
        relevant_node_ids = {start_node_id}
        for rel_type, nodes in relationships.items():
            for node in nodes:
                relevant_node_ids.add(node.id)
        
        # Export nodes
        for node_id in relevant_node_ids:
            if node_id in self.node_index:
                subgraph_data["nodes"].append(self.node_index[node_id].to_dict())
        
        # Export edges
        for edge_id, edge in self.edge_index.items():
            if edge.source_id in relevant_node_ids and edge.target_id in relevant_node_ids:
                subgraph_data["edges"].append(edge.to_dict())
        
        return subgraph_data
    
    async def import_subgraph(self, subgraph_data: Dict[str, Any], importing_agent: str):
        """Import a subgraph from another source"""
        imported_nodes = 0
        imported_edges = 0
        
        # Import nodes
        for node_data in subgraph_data.get("nodes", []):
            node = KnowledgeNode.from_dict(node_data)
            node.created_by = importing_agent
            
            # Check if node already exists
            existing_node = await self.find_similar_node(node.type, node.name, node.properties)
            if not existing_node:
                self.graph.add_node(node.id, **node.to_dict())
                self.node_index[node.id] = node
                self.type_index[node.type].add(node.id)
                imported_nodes += 1
        
        # Import edges
        for edge_data in subgraph_data.get("edges", []):
            edge = KnowledgeEdge.from_dict(edge_data)
            edge.created_by = importing_agent
            
            edge_id = f"{edge.source_id}:{edge.target_id}:{edge.relationship.value}"
            if edge_id not in self.edge_index:
                self.graph.add_edge(edge.source_id, edge.target_id, key=edge_id, **edge.to_dict())
                self.edge_index[edge_id] = edge
                imported_edges += 1
        
        logger.info(f"Imported {imported_nodes} nodes and {imported_edges} edges from {importing_agent}")
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get knowledge graph statistics"""
        return {
            "total_nodes": len(self.node_index),
            "total_edges": len(self.edge_index),
            "nodes_by_type": {node_type.value: len(node_ids) for node_type, node_ids in self.type_index.items()},
            "relationships_by_type": self._count_relationships_by_type(),
            "agents": list(set(node.created_by for node in self.node_index.values())),
            "graph_density": nx.density(self.graph) if self.graph.number_of_nodes() > 0 else 0
        }
    
    def _count_relationships_by_type(self) -> Dict[str, int]:
        """Count relationships by type"""
        counts = {}
        for edge in self.edge_index.values():
            rel_type = edge.relationship.value
            counts[rel_type] = counts.get(rel_type, 0) + 1
        return counts

# Global knowledge graph instance
knowledge_graph = KnowledgeGraph()

# Convenience functions
async def add_entity(entity_type: NodeType, 
                    name: str, 
                    properties: Dict[str, Any] = None,
                    agent: str = "system") -> str:
    """Convenience function to add an entity to the knowledge graph"""
    return await knowledge_graph.add_node(entity_type, name, properties, agent)

async def link_entities(source_id: str, 
                       target_id: str, 
                       relationship: RelationshipType,
                       properties: Dict[str, Any] = None,
                       agent: str = "system") -> str:
    """Convenience function to link entities in the knowledge graph"""
    return await knowledge_graph.add_edge(source_id, target_id, relationship, properties, agent)

async def get_agent_context(agent_name: str) -> Dict[str, Any]:
    """Convenience function to get agent context"""
    return await knowledge_graph.get_context_for_agent(agent_name)

async def find_entities(entity_type: NodeType, 
                       filters: Dict[str, Any] = None,
                       limit: int = 100) -> List[KnowledgeNode]:
    """Convenience function to find entities"""
    return await knowledge_graph.query_nodes(entity_type, filters, limit)
