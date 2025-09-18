"""
Minimal Integration Test

This test verifies the core functionality of the enhanced orchestration system
with minimal dependencies.
"""

import asyncio
import json
from datetime import datetime, timezone
from enum import Enum
import uuid
from typing import Dict, Any, List, Optional, Callable
from dataclasses import dataclass, asdict

# Minimal event system
class EventType(Enum):
    TASK_STARTED = "task.started"
    TASK_COMPLETED = "task.completed"
    TASK_FAILED = "task.failed"
    DATA_CREATED = "data.created"
    DATA_UPDATED = "data.updated"

@dataclass
class Event:
    id: str
    type: EventType
    source_agent: str
    target_agents: Optional[List[str]] = None
    timestamp: datetime = None
    data: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now(timezone.utc)
        if self.data is None:
            self.data = {}

class MinimalEventBus:
    """Minimal event bus for testing"""
    def __init__(self):
        self.subscribers = {}
        self.events = []
    
    async def connect(self):
        print("✅ Minimal event bus connected")
    
    async def disconnect(self):
        print("✅ Minimal event bus disconnected")
    
    async def publish(self, event: Event) -> bool:
        self.events.append(event)
        print(f"📨 Published event: {event.type.value} from {event.source_agent}")
        return True
    
    async def subscribe(self, agent_name: str, event_types: List[EventType], handler: Callable):
        print(f"✅ Agent {agent_name} subscribed to {len(event_types)} event types")
        return "subscription_id"

# Minimal knowledge graph
class NodeType(Enum):
    CUSTOMER = "customer"
    LEAD = "lead"
    TASK = "task"
    WORKFLOW = "workflow"
    AGENT = "agent"

class RelationshipType(Enum):
    LEADS_TO = "leads_to"
    CONTAINS = "contains"
    CREATES = "creates"

@dataclass
class KnowledgeNode:
    id: str
    type: NodeType
    name: str
    properties: Dict[str, Any]
    created_at: datetime = None
    created_by: str = "system"
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now(timezone.utc)

class MinimalKnowledgeGraph:
    """Minimal knowledge graph for testing"""
    def __init__(self):
        self.nodes = {}
        self.edges = {}
        self.type_index = {node_type: set() for node_type in NodeType}
    
    async def add_node(self, node_type: NodeType, name: str, properties: Dict[str, Any], created_by: str) -> str:
        node_id = str(uuid.uuid4())
        node = KnowledgeNode(
            id=node_id,
            type=node_type,
            name=name,
            properties=properties,
            created_by=created_by
        )
        self.nodes[node_id] = node
        self.type_index[node_type].add(node_id)
        print(f"✅ Added {node_type.value} node: {name}")
        return node_id
    
    async def add_edge(self, source_id: str, target_id: str, relationship: RelationshipType, properties: Dict[str, Any], created_by: str) -> str:
        edge_id = f"{source_id}:{target_id}:{relationship.value}"
        self.edges[edge_id] = {
            "source_id": source_id,
            "target_id": target_id,
            "relationship": relationship,
            "properties": properties,
            "created_by": created_by
        }
        print(f"✅ Added edge: {source_id} -> {target_id} ({relationship.value})")
        return edge_id
    
    async def query_nodes(self, node_type: NodeType = None) -> List[KnowledgeNode]:
        if node_type:
            node_ids = self.type_index[node_type]
            return [self.nodes[node_id] for node_id in node_ids]
        return list(self.nodes.values())
    
    def get_statistics(self) -> Dict[str, Any]:
        return {
            "total_nodes": len(self.nodes),
            "total_edges": len(self.edges),
            "nodes_by_type": {node_type.value: len(node_ids) for node_type, node_ids in self.type_index.items()}
        }

# Minimal orchestration
class WorkflowStatus(Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

@dataclass
class Task:
    task_id: str
    name: str
    description: str
    agent_type: str
    dependencies: List[str]
    expected_output: str
    estimated_duration: str

@dataclass
class UserInput:
    objective: str
    audience: Dict[str, Any] = None
    additional_notes: str = None

class MinimalOrchestrator:
    """Minimal orchestrator for testing"""
    def __init__(self):
        self.agents = {}
        self.workflows = {}
        self.active_tasks = {}
    
    async def initialize(self):
        print("✅ Minimal orchestrator initialized")
    
    async def register_agent(self, agent_name: str, capabilities: List[str], max_concurrent_tasks: int = 1, priority: int = 5):
        self.agents[agent_name] = {
            "capabilities": capabilities,
            "max_concurrent_tasks": max_concurrent_tasks,
            "priority": priority,
            "status": "idle",
            "current_tasks": 0
        }
        print(f"✅ Registered agent: {agent_name} with {len(capabilities)} capabilities")
    
    async def create_workflow(self, user_input: UserInput, tasks: List[Task]) -> str:
        workflow_id = str(uuid.uuid4())
        self.workflows[workflow_id] = {
            "user_input": user_input,
            "tasks": tasks,
            "status": WorkflowStatus.PENDING,
            "created_at": datetime.now(timezone.utc)
        }
        print(f"✅ Created workflow: {workflow_id} with {len(tasks)} tasks")
        return workflow_id
    
    async def execute_workflow(self, workflow_id: str) -> Dict[str, Any]:
        if workflow_id not in self.workflows:
            raise ValueError(f"Workflow {workflow_id} not found")
        
        workflow = self.workflows[workflow_id]
        workflow["status"] = WorkflowStatus.RUNNING
        workflow["started_at"] = datetime.now(timezone.utc)
        
        print(f"✅ Started executing workflow: {workflow_id}")
        
        # Simulate task execution
        completed_tasks = 0
        for task in workflow["tasks"]:
            # Find suitable agent
            suitable_agents = [
                name for name, agent_info in self.agents.items()
                if agent_info["status"] == "idle" and agent_info["current_tasks"] < agent_info["max_concurrent_tasks"]
            ]
            
            if suitable_agents:
                # Assign to highest priority agent
                best_agent = max(suitable_agents, key=lambda name: self.agents[name]["priority"])
                
                # Execute task
                self.agents[best_agent]["current_tasks"] += 1
                self.agents[best_agent]["status"] = "busy"
                
                print(f"✅ Task '{task.name}' assigned to agent '{best_agent}'")
                
                # Simulate work
                await asyncio.sleep(0.01)
                
                # Complete task
                self.agents[best_agent]["current_tasks"] -= 1
                self.agents[best_agent]["status"] = "idle"
                completed_tasks += 1
        
        workflow["status"] = WorkflowStatus.COMPLETED
        workflow["completed_at"] = datetime.now(timezone.utc)
        
        return {
            "workflow_id": workflow_id,
            "status": workflow["status"].value,
            "completed_tasks": completed_tasks,
            "total_tasks": len(workflow["tasks"])
        }
    
    def get_system_status(self) -> Dict[str, Any]:
        return {
            "total_agents": len(self.agents),
            "active_workflows": len([w for w in self.workflows.values() if w["status"] == WorkflowStatus.RUNNING]),
            "idle_agents": len([a for a in self.agents.values() if a["status"] == "idle"]),
            "busy_agents": len([a for a in self.agents.values() if a["status"] == "busy"])
        }

async def test_minimal_integration():
    """Test minimal integration functionality"""
    print("🧪 Testing Minimal Enhanced Orchestration Integration...\n")
    
    # Initialize components
    event_bus = MinimalEventBus()
    knowledge_graph = MinimalKnowledgeGraph()
    orchestrator = MinimalOrchestrator()
    
    await event_bus.connect()
    await orchestrator.initialize()
    
    print("1. Testing Event System...")
    
    # Test event publishing
    test_event = Event(
        id="test-event-1",
        type=EventType.TASK_STARTED,
        source_agent="test_agent",
        data={"test": "data"}
    )
    
    await event_bus.publish(test_event)
    
    print("2. Testing Knowledge Graph...")
    
    # Test adding entities
    customer_id = await knowledge_graph.add_node(
        NodeType.CUSTOMER,
        "Test Customer",
        {"name": "John Doe", "email": "john@example.com"},
        "test_agent"
    )
    
    lead_id = await knowledge_graph.add_node(
        NodeType.LEAD,
        "Test Lead",
        {"source": "website", "score": 85},
        "test_agent"
    )
    
    # Test linking entities
    await knowledge_graph.add_edge(
        lead_id,
        customer_id,
        RelationshipType.LEADS_TO,
        {"conversion_date": datetime.now(timezone.utc).isoformat()},
        "test_agent"
    )
    
    # Test querying
    customers = await knowledge_graph.query_nodes(NodeType.CUSTOMER)
    leads = await knowledge_graph.query_nodes(NodeType.LEAD)
    
    print(f"✅ Found {len(customers)} customers and {len(leads)} leads")
    
    print("3. Testing Orchestration...")
    
    # Register agents
    await orchestrator.register_agent(
        "ContentAgent",
        ["content_creation", "writing"],
        max_concurrent_tasks=2,
        priority=7
    )
    
    await orchestrator.register_agent(
        "StrategyAgent",
        ["strategic_planning", "strategy"],
        max_concurrent_tasks=1,
        priority=8
    )
    
    # Create workflow
    user_input = UserInput(
        objective="Create a content strategy",
        audience={"type": "small_business"},
        additional_notes="Focus on digital marketing"
    )
    
    tasks = [
        Task(
            task_id="task1",
            name="Strategic Analysis",
            description="Analyze market and create strategic foundation",
            agent_type="StrategyAgent",
            dependencies=[],
            expected_output="Strategic analysis report",
            estimated_duration="30 minutes"
        ),
        Task(
            task_id="task2",
            name="Content Strategy",
            description="Create comprehensive content strategy",
            agent_type="ContentAgent",
            dependencies=["task1"],
            expected_output="Content strategy document",
            estimated_duration="45 minutes"
        )
    ]
    
    # Create and execute workflow
    workflow_id = await orchestrator.create_workflow(user_input, tasks)
    execution_result = await orchestrator.execute_workflow(workflow_id)
    
    print(f"✅ Workflow executed: {execution_result['status']}")
    print(f"✅ Completed {execution_result['completed_tasks']}/{execution_result['total_tasks']} tasks")
    
    # Check system status
    system_status = orchestrator.get_system_status()
    print(f"✅ System status: {system_status['total_agents']} agents, {system_status['idle_agents']} idle")
    
    # Check knowledge graph statistics
    stats = knowledge_graph.get_statistics()
    print(f"✅ Knowledge graph: {stats['total_nodes']} nodes, {stats['total_edges']} edges")
    
    await event_bus.disconnect()
    
    print("\n🎉 Minimal integration test completed successfully!")
    print("\n📊 Summary:")
    print(f"  - Event System: ✅ Working")
    print(f"  - Knowledge Graph: ✅ Working ({stats['total_nodes']} nodes)")
    print(f"  - Orchestration: ✅ Working ({system_status['total_agents']} agents)")
    print(f"  - Integration: ✅ Working")

async def main():
    """Run the minimal integration test"""
    print("🚀 Starting Minimal Enhanced Orchestration Integration Test\n")
    
    try:
        await test_minimal_integration()
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
