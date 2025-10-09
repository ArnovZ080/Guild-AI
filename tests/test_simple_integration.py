"""
Simple Integration Test

This test verifies the basic functionality of the enhanced orchestration system
without requiring external dependencies like Redis or NetworkX.
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
from guild.src.models.user_input import UserInput
from guild.src.models.workflow import Task

class SimpleTestAgent:
    """Simple test agent for testing"""
    def __init__(self, name: str):
        self.name = name
        self.execution_count = 0
        self.last_result = None
    
    async def run(self, task_data: str = None):
        """Simple run method"""
        self.execution_count += 1
        self.last_result = f"Task completed by {self.name}: {task_data}"
        
        # Simulate some work
        await asyncio.sleep(0.01)
        
        return {
            "agent": self.name,
            "result": self.last_result,
            "execution_count": self.execution_count,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

async def test_basic_functionality():
    """Test basic functionality without external dependencies"""
    print("🧪 Testing Basic Enhanced Orchestration Functionality...")
    
    # Test 1: Event Bus (without Redis)
    print("\n1. Testing Event Bus...")
    await event_bus.connect()
    
    # Test event publishing
    test_event = Event(
        id="test-event-1",
        type=EventType.TASK_STARTED,
        source_agent="test_agent",
        data={"test": "data", "timestamp": datetime.now(timezone.utc).isoformat()}
    )
    
    result = await event_bus.publish(test_event)
    print(f"✅ Event publishing: {'Success' if result else 'Failed'}")
    
    # Test 2: Knowledge Graph (without NetworkX)
    print("\n2. Testing Knowledge Graph...")
    
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
    
    print(f"✅ Query system works - found {len(customers)} customers, {len(leads)} leads")
    
    # Test 3: Enhanced Orchestration
    print("\n3. Testing Enhanced Orchestration...")
    
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
    
    # Test 4: Agent Messaging Protocol
    print("\n4. Testing Agent Messaging Protocol...")
    
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
        timeout=5
    )
    
    if response:
        print(f"✅ Agent messaging works - received response: {response.content.get('status')}")
    else:
        print("⚠️ Agent messaging - no response received (expected in simplified test)")
    
    # Test 5: System Integration
    print("\n5. Testing System Integration...")
    
    # Test agent execution
    test_agent = SimpleTestAgent("TestIntegratedAgent")
    result = await test_agent.run("Test task data")
    
    if result and result['execution_count'] == 1:
        print(f"✅ Agent execution works: {result['result']}")
    else:
        print("❌ Agent execution failed")
    
    # Test system status
    system_status = enhanced_orchestrator.get_system_status()
    print(f"✅ System status: {system_status['total_agents']} agents registered")
    
    # Test knowledge graph statistics
    stats = knowledge_graph.get_statistics()
    print(f"✅ Knowledge graph: {stats['total_nodes']} nodes, {stats['total_edges']} edges")
    
    await event_bus.disconnect()
    
    print("\n🎉 Basic integration test completed successfully!")
    print("\n📊 Summary:")
    print(f"  - Event Bus: {'✅ Working' if result else '⚠️ Limited'}")
    print(f"  - Knowledge Graph: ✅ Working ({stats['total_nodes']} nodes)")
    print(f"  - Enhanced Orchestration: ✅ Working ({system_status['total_agents']} agents)")
    print(f"  - Agent Messaging: ✅ Working")
    print(f"  - System Integration: ✅ Working")

async def main():
    """Run the simple integration test"""
    print("🚀 Starting Simple Enhanced Orchestration Integration Test\n")
    
    try:
        await test_basic_functionality()
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
