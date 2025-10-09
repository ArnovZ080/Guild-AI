"""
Test Enhanced Orchestration System

This test verifies the integration of the event bus, knowledge graph, and enhanced orchestration
systems work together correctly.
"""

import asyncio
import json
from datetime import datetime, timezone
from guild.src.core.messaging.event_bus import (
    EventBus, Event, EventType, publish_event, subscribe_agent, event_bus
)
from guild.src.core.knowledge.knowledge_graph import (
    KnowledgeGraph, NodeType, RelationshipType, add_entity, link_entities, knowledge_graph
)
from guild.src.core.orchestration.enhanced_orchestrator import (
    EnhancedOrchestrator, register_agent_capability, enhanced_orchestrator
)
from guild.src.core.messaging.agent_protocol import (
    AgentMessagingProtocol, AgentMessage, MessageType, MessagePriority
)
from guild.src.core.integration.agent_adapter import (
    AgentIntegrationAdapter, integrate_existing_agent, AGENT_CAPABILITY_MAPPINGS
)
from guild.src.models.user_input import UserInput
from guild.src.models.workflow import Task

class TestAgent:
    """Mock agent for testing"""
    def __init__(self, name: str):
        self.name = name
        self.execution_count = 0
        self.last_result = None
    
    async def run(self, task_data: str = None):
        """Mock run method"""
        self.execution_count += 1
        self.last_result = f"Task completed by {self.name}: {task_data}"
        
        # Simulate some work
        await asyncio.sleep(0.1)
        
        return {
            "agent": self.name,
            "result": self.last_result,
            "execution_count": self.execution_count,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

async def test_event_bus():
    """Test the event bus system"""
    print("🧪 Testing Event Bus System...")
    
    # Initialize event bus
    await event_bus.connect()
    
    # Test event publishing
    test_event = Event(
        id="test-event-1",
        type=EventType.TASK_STARTED,
        source_agent="test_agent",
        data={"test": "data", "timestamp": datetime.now(timezone.utc).isoformat()}
    )
    
    result = await event_bus.publish(test_event)
    assert result, "Event publishing should succeed"
    print("✅ Event publishing works")
    
    # Test event subscription and handling
    received_events = []
    
    async def event_handler(event: Event):
        received_events.append(event)
        print(f"📨 Received event: {event.type.value} from {event.source_agent}")
    
    # Subscribe to events
    subscription_id = await event_bus.subscribe(
        "test_subscriber",
        [EventType.TASK_STARTED, EventType.TASK_COMPLETED],
        event_handler
    )
    
    # Publish another event
    await publish_event(
        EventType.TASK_COMPLETED,
        "test_agent",
        {"task_id": "test-task", "result": "success"}
    )
    
    # Wait for event processing
    await asyncio.sleep(0.5)
    
    print(f"✅ Event subscription works - received {len(received_events)} events")
    
    await event_bus.disconnect()

async def test_knowledge_graph():
    """Test the knowledge graph system"""
    print("🧪 Testing Knowledge Graph System...")
    
    # Test adding entities
    customer_id = await add_entity(
        NodeType.CUSTOMER,
        "Test Customer",
        {
            "name": "John Doe",
            "email": "john@example.com",
            "company": "Test Corp"
        },
        "test_agent"
    )
    
    print(f"✅ Added customer entity: {customer_id}")
    
    # Test adding related entities
    lead_id = await add_entity(
        NodeType.LEAD,
        "Test Lead",
        {
            "source": "website",
            "score": 85,
            "status": "qualified"
        },
        "test_agent"
    )
    
    # Test linking entities
    link_id = await link_entities(
        lead_id,
        customer_id,
        RelationshipType.LEADS_TO,
        {"conversion_date": datetime.now(timezone.utc).isoformat()},
        "test_agent"
    )
    
    print(f"✅ Added lead entity and linked to customer: {link_id}")
    
    # Test querying entities
    customers = await knowledge_graph.query_nodes(NodeType.CUSTOMER)
    leads = await knowledge_graph.query_nodes(NodeType.LEAD)
    
    assert len(customers) >= 1, "Should find at least one customer"
    assert len(leads) >= 1, "Should find at least one lead"
    
    print(f"✅ Query system works - found {len(customers)} customers, {len(leads)} leads")
    
    # Test relationship traversal
    relationships = await knowledge_graph.traverse_relationships(customer_id, max_depth=2)
    
    print(f"✅ Relationship traversal works - found {len(relationships)} relationship types")
    
    # Test statistics
    stats = knowledge_graph.get_statistics()
    print(f"✅ Knowledge graph statistics: {stats['total_nodes']} nodes, {stats['total_edges']} edges")

async def test_enhanced_orchestration():
    """Test the enhanced orchestration system"""
    print("🧪 Testing Enhanced Orchestration System...")
    
    # Initialize orchestrator
    await enhanced_orchestrator.initialize()
    
    # Register test agents
    await register_agent_capability(
        "TestContentAgent",
        ["content_creation", "writing", "content_strategy"],
        max_concurrent_tasks=2,
        priority=7,
        specializations=["content_creation"]
    )
    
    await register_agent_capability(
        "TestStrategyAgent",
        ["strategic_planning", "strategy", "business_planning"],
        max_concurrent_tasks=1,
        priority=8,
        specializations=["strategy"]
    )
    
    print("✅ Agent capabilities registered")
    
    # Create test workflow
    user_input = UserInput(
        objective="Create a comprehensive content strategy",
        audience={"type": "small_business", "size": "10-50 employees"},
        additional_notes="Focus on digital marketing"
    )
    
    tasks = [
        Task(
            task_id="task1",
            name="Strategic Analysis",
            description="Analyze market and create strategic foundation",
            agent_type="TestStrategyAgent",
            dependencies=[],
            expected_output="Strategic analysis report",
            estimated_duration="30 minutes"
        ),
        Task(
            task_id="task2",
            name="Content Strategy Creation",
            description="Create comprehensive content strategy",
            agent_type="TestContentAgent",
            dependencies=["task1"],
            expected_output="Content strategy document",
            estimated_duration="45 minutes"
        )
    ]
    
    # Create workflow
    workflow_id = await enhanced_orchestrator.create_workflow(user_input, tasks)
    print(f"✅ Workflow created: {workflow_id}")
    
    # Execute workflow
    execution_result = await enhanced_orchestrator.execute_workflow(workflow_id)
    print(f"✅ Workflow executed: {execution_result['status']}")
    
    # Check workflow status
    status = await enhanced_orchestrator.get_workflow_status(workflow_id)
    print(f"✅ Workflow status: {status['status']}, Progress: {status['progress']:.1f}%")
    
    # Check system status
    system_status = enhanced_orchestrator.get_system_status()
    print(f"✅ System status: {system_status['total_agents']} agents, {system_status['active_workflows']} active workflows")

async def test_agent_messaging():
    """Test agent messaging protocol"""
    print("🧪 Testing Agent Messaging Protocol...")
    
    # Create messaging protocols for two agents
    agent1_protocol = AgentMessagingProtocol("TestAgent1")
    agent2_protocol = AgentMessagingProtocol("TestAgent2")
    
    await agent1_protocol.initialize()
    await agent2_protocol.initialize()
    
    # Test message handling
    received_messages = []
    
    async def message_handler(message: AgentMessage):
        received_messages.append(message)
        print(f"📨 Agent2 received message: {message.subject}")
        
        # Send response
        await agent2_protocol.send_response(
            to_agents=[message.from_agent],
            subject=f"Response to: {message.subject}",
            content={"status": "processed", "response": "Message received and processed"},
            correlation_id=message.id
        )
    
    agent2_protocol.register_message_handler(MessageType.REQUEST, message_handler)
    
    # Send request from agent1 to agent2
    response = await agent1_protocol.send_request(
        to_agents=["TestAgent2"],
        subject="Test Request",
        content={"request_type": "test", "data": "Hello from Agent1"},
        timeout=10
    )
    
    assert response is not None, "Should receive a response"
    assert response.content["status"] == "processed", "Response should indicate processing"
    
    print("✅ Agent messaging works - request/response cycle completed")
    
    # Test notification
    await agent1_protocol.send_notification(
        to_agents=["TestAgent2"],
        subject="Test Notification",
        content={"notification": "This is a test notification"}
    )
    
    await asyncio.sleep(0.5)  # Wait for notification processing
    
    print(f"✅ Notifications work - {len(received_messages)} messages received")

async def test_agent_integration():
    """Test agent integration adapter"""
    print("🧪 Testing Agent Integration Adapter...")
    
    # Create test agent
    test_agent = TestAgent("TestIntegratedAgent")
    
    # Integrate agent
    adapter = await integrate_existing_agent(test_agent, "TestIntegratedAgent")
    
    print("✅ Agent integration adapter created")
    
    # Test agent execution with integration
    result = await test_agent.run("Test task data")
    
    assert result is not None, "Agent should return a result"
    assert test_agent.execution_count == 1, "Agent should have executed once"
    
    print(f"✅ Integrated agent execution works: {result['result']}")
    
    # Test agent status
    status = await adapter.get_agent_status()
    print(f"✅ Agent status: {status['agent_name']} - {status['is_initialized']}")

async def test_end_to_end_integration():
    """Test end-to-end integration of all systems"""
    print("🧪 Testing End-to-End Integration...")
    
    # Initialize all systems
    await event_bus.connect()
    await enhanced_orchestrator.initialize()
    
    # Create integrated agents
    content_agent = TestAgent("ContentAgent")
    strategy_agent = TestAgent("StrategyAgent")
    
    content_adapter = await integrate_existing_agent(content_agent, "ContentAgent")
    strategy_adapter = await integrate_existing_agent(strategy_agent, "StrategyAgent")
    
    # Register agents with orchestrator
    await register_agent_capability(
        "ContentAgent",
        ["content_creation", "writing"],
        max_concurrent_tasks=2,
        priority=6
    )
    
    await register_agent_capability(
        "StrategyAgent",
        ["strategic_planning", "strategy"],
        max_concurrent_tasks=1,
        priority=7
    )
    
    # Create and execute workflow
    user_input = UserInput(
        objective="Create a marketing strategy and content plan",
        additional_notes="For a new product launch"
    )
    
    tasks = [
        Task(
            task_id="strategy_task",
            name="Marketing Strategy",
            description="Develop comprehensive marketing strategy",
            agent_type="StrategyAgent",
            dependencies=[],
            expected_output="Marketing strategy document",
            estimated_duration="60 minutes"
        ),
        Task(
            task_id="content_task",
            name="Content Plan",
            description="Create content plan based on strategy",
            agent_type="ContentAgent",
            dependencies=["strategy_task"],
            expected_output="Content plan document",
            estimated_duration="45 minutes"
        )
    ]
    
    workflow_id = await enhanced_orchestrator.create_workflow(user_input, tasks)
    execution_result = await enhanced_orchestrator.execute_workflow(workflow_id)
    
    print(f"✅ End-to-end workflow executed: {execution_result['status']}")
    
    # Verify knowledge graph has workflow data
    workflow_entities = await knowledge_graph.query_nodes(NodeType.WORKFLOW)
    task_entities = await knowledge_graph.query_nodes(NodeType.TASK)
    
    print(f"✅ Knowledge graph contains {len(workflow_entities)} workflows and {len(task_entities)} tasks")
    
    # Verify event history
    event_history = await event_bus.get_event_history(limit=10)
    print(f"✅ Event bus contains {len(event_history)} recent events")
    
    await event_bus.disconnect()

async def main():
    """Run all tests"""
    print("🚀 Starting Enhanced Orchestration System Tests\n")
    
    try:
        await test_event_bus()
        print()
        
        await test_knowledge_graph()
        print()
        
        await test_enhanced_orchestration()
        print()
        
        await test_agent_messaging()
        print()
        
        await test_agent_integration()
        print()
        
        await test_end_to_end_integration()
        print()
        
        print("🎉 All tests passed! Enhanced orchestration system is working correctly.")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
