# Enhanced Orchestration System

## Overview

The Enhanced Orchestration System provides advanced agent coordination capabilities for Guild-AI, including:

- **Agent-to-Agent Messaging Layer**: Redis-based pub/sub event bus for real-time communication
- **Knowledge Graph**: Shared memory system for structured information and relationships
- **Enhanced Orchestration**: Advanced workflow coordination with load balancing and performance monitoring
- **Agent Integration**: Seamless integration of existing agents with the new systems

## 🚀 Key Features

### 1. Event-Driven Communication
- **Pub/Sub Event Bus**: Redis-based messaging system for agent coordination
- **Event Types**: Comprehensive event taxonomy (task events, business events, system events, quality events)
- **Priority Handling**: Priority-based message routing and processing
- **Correlation Tracking**: Track related events across the system

### 2. Shared Knowledge Graph
- **Entity Management**: Store and manage business entities (customers, leads, tasks, workflows)
- **Relationship Tracking**: Model complex relationships between entities
- **Context Sharing**: Agents can access and share contextual information
- **Conflict Resolution**: Automatic conflict detection and resolution

### 3. Advanced Orchestration
- **Dynamic Load Balancing**: Intelligent agent assignment based on capabilities and current load
- **Dependency Management**: Handle complex task dependencies and execution order
- **Performance Monitoring**: Track agent performance and system metrics
- **Adaptive Routing**: Route tasks to the most suitable agents

### 4. Agent Integration
- **Backward Compatibility**: Existing agents work without modification
- **Capability Mapping**: Automatic mapping of agent capabilities
- **Integration Adapters**: Easy integration for new agents
- **Message Protocols**: Standardized communication protocols

## 📁 System Architecture

```
guild/src/core/
├── messaging/
│   ├── event_bus.py          # Redis-based pub/sub event bus
│   ├── agent_protocol.py     # Standardized messaging protocol
│   └── __init__.py
├── knowledge/
│   ├── knowledge_graph.py    # Graph-based knowledge storage
│   └── __init__.py
├── orchestration/
│   ├── enhanced_orchestrator.py  # Advanced workflow coordination
│   └── __init__.py
└── integration/
    ├── agent_adapter.py      # Agent integration utilities
    └── __init__.py
```

## 🔧 Core Components

### Event Bus (`event_bus.py`)

The event bus provides pub/sub messaging for agent communication:

```python
from guild.src.core.messaging.event_bus import publish_event, EventType

# Publish an event
await publish_event(
    EventType.TASK_COMPLETED,
    "agent_name",
    {"task_id": "task_123", "result": "success"}
)

# Subscribe to events
from guild.src.core.messaging.event_bus import subscribe_agent

async def handle_event(event):
    print(f"Received event: {event.type.value}")

await subscribe_agent("agent_name", [EventType.TASK_COMPLETED], handle_event)
```

**Key Features:**
- Redis-based pub/sub with fallback to in-memory storage
- Event persistence with TTL
- Priority-based routing
- Dead letter queue for failed events
- Correlation tracking

### Knowledge Graph (`knowledge_graph.py`)

The knowledge graph stores and manages shared agent memory:

```python
from guild.src.core.knowledge.knowledge_graph import add_entity, link_entities, NodeType, RelationshipType

# Add entities
customer_id = await add_entity(
    NodeType.CUSTOMER,
    "John Doe",
    {"email": "john@example.com", "company": "Acme Corp"},
    "agent_name"
)

lead_id = await add_entity(
    NodeType.LEAD,
    "Sales Lead",
    {"source": "website", "score": 85},
    "agent_name"
)

# Link entities
await link_entities(
    lead_id,
    customer_id,
    RelationshipType.LEADS_TO,
    {"conversion_date": "2024-01-15"},
    "agent_name"
)
```

**Key Features:**
- NetworkX-based graph storage with fallback to dict-based storage
- Entity types: Customer, Lead, Task, Workflow, Agent, etc.
- Relationship types: Leads_To, Contains, Creates, etc.
- Conflict resolution and confidence scoring
- Temporal tracking and agent attribution

### Enhanced Orchestrator (`enhanced_orchestrator.py`)

The enhanced orchestrator provides advanced workflow coordination:

```python
from guild.src.core.orchestration.enhanced_orchestrator import (
    register_agent_capability, create_enhanced_workflow, execute_enhanced_workflow
)

# Register agent capabilities
await register_agent_capability(
    "ContentAgent",
    ["content_creation", "writing"],
    max_concurrent_tasks=2,
    priority=7,
    specializations=["content_creation"]
)

# Create and execute workflow
workflow_id = await create_enhanced_workflow(user_input, tasks)
result = await execute_enhanced_workflow(workflow_id)
```

**Key Features:**
- Dynamic agent load balancing
- Capability-based task assignment
- Performance monitoring and optimization
- Workflow dependency management
- Real-time status tracking

### Agent Integration (`agent_adapter.py`)

The agent integration system provides seamless integration for existing agents:

```python
from guild.src.core.integration.agent_adapter import integrate_existing_agent

# Integrate existing agent
adapter = await integrate_existing_agent(existing_agent, "AgentName")

# Agent now has messaging and knowledge graph access
await adapter.send_message(["other_agent"], "Subject", {"data": "value"})
```

**Key Features:**
- Automatic capability mapping for 50+ existing agents
- Backward compatibility with existing agent interfaces
- Integration adapters for new agents
- Standardized communication protocols

## 🎯 Event Types

### Task Events
- `TASK_STARTED`: Task execution begins
- `TASK_COMPLETED`: Task execution completes successfully
- `TASK_FAILED`: Task execution fails
- `TASK_PROGRESS`: Task execution progress update

### Business Events
- `LEAD_CAPTURED`: New lead captured
- `CUSTOMER_UPDATED`: Customer information updated
- `TRANSACTION_RECORDED`: Financial transaction recorded
- `CAMPAIGN_LAUNCHED`: Marketing campaign launched

### System Events
- `AGENT_READY`: Agent becomes available
- `AGENT_BUSY`: Agent becomes busy
- `AGENT_ERROR`: Agent encounters error
- `WORKFLOW_STARTED`: Workflow execution begins
- `WORKFLOW_COMPLETED`: Workflow execution completes

### Quality Events
- `QUALITY_CHECK_REQUESTED`: Quality check needed
- `QUALITY_CHECK_COMPLETED`: Quality check completed
- `QUALITY_THRESHOLD_BREACHED`: Quality below threshold

## 🧠 Knowledge Graph Schema

### Entity Types
- **CUSTOMER**: Customer information and profiles
- **LEAD**: Sales leads and prospects
- **COMPANY**: Company information
- **CONTACT**: Contact information
- **DOCUMENT**: Documents and files
- **CAMPAIGN**: Marketing campaigns
- **CONTENT**: Content pieces
- **ASSET**: Digital assets
- **TASK**: Workflow tasks
- **WORKFLOW**: Workflow definitions
- **PROCESS**: Business processes
- **GOAL**: Business goals and objectives
- **METRIC**: Performance metrics
- **REPORT**: Reports and analytics
- **ANALYSIS**: Analysis results
- **INSIGHT**: Business insights
- **AGENT**: Agent information
- **EVENT**: System events
- **DECISION**: Business decisions
- **RISK**: Risk assessments

### Relationship Types
- **OWNS**: Ownership relationships
- **WORKS_FOR**: Employment relationships
- **SUPPLIES**: Supplier relationships
- **COMPETES_WITH**: Competitive relationships
- **PARTNERS_WITH**: Partnership relationships
- **CREATES**: Creation relationships
- **REFERENCES**: Reference relationships
- **DEPENDS_ON**: Dependency relationships
- **INFLUENCES**: Influence relationships
- **REPLACES**: Replacement relationships
- **LEADS_TO**: Causal relationships
- **TRIGGERS**: Trigger relationships
- **BLOCKS**: Blocking relationships
- **ENABLES**: Enabling relationships
- **MEASURES**: Measurement relationships
- **CONTAINS**: Containment relationships
- **DERIVED_FROM**: Derivation relationships
- **VALIDATES**: Validation relationships
- **CONTRADICTS**: Contradiction relationships
- **SUPPORTS**: Support relationships

## 🔄 Workflow Example

Here's a complete example of how the enhanced orchestration system works:

```python
import asyncio
from guild.src.core.orchestration.enhanced_orchestrator import (
    enhanced_orchestrator, register_agent_capability
)
from guild.src.core.knowledge.knowledge_graph import add_entity, NodeType
from guild.src.core.messaging.event_bus import publish_event, EventType
from guild.src.models.user_input import UserInput
from guild.src.models.workflow import Task

async def example_workflow():
    # Initialize systems
    await enhanced_orchestrator.initialize()
    
    # Register agents
    await register_agent_capability(
        "ContentAgent",
        ["content_creation", "writing"],
        max_concurrent_tasks=2,
        priority=7
    )
    
    await register_agent_capability(
        "StrategyAgent",
        ["strategic_planning", "strategy"],
        max_concurrent_tasks=1,
        priority=8
    )
    
    # Create customer in knowledge graph
    customer_id = await add_entity(
        NodeType.CUSTOMER,
        "Acme Corp",
        {"industry": "technology", "size": "50-100 employees"},
        "system"
    )
    
    # Create workflow
    user_input = UserInput(
        objective="Create a content marketing strategy for Acme Corp",
        audience={"type": "B2B", "industry": "technology"},
        additional_notes="Focus on thought leadership content"
    )
    
    tasks = [
        Task(
            task_id="strategy_task",
            name="Strategic Analysis",
            description="Analyze market and create strategic foundation",
            agent_type="StrategyAgent",
            dependencies=[],
            expected_output="Strategic analysis report",
            estimated_duration="60 minutes"
        ),
        Task(
            task_id="content_task",
            name="Content Strategy",
            description="Create content strategy based on analysis",
            agent_type="ContentAgent",
            dependencies=["strategy_task"],
            expected_output="Content strategy document",
            estimated_duration="45 minutes"
        )
    ]
    
    # Execute workflow
    workflow_id = await enhanced_orchestrator.create_workflow(user_input, tasks)
    result = await enhanced_orchestrator.execute_workflow(workflow_id)
    
    # Publish completion event
    await publish_event(
        EventType.WORKFLOW_COMPLETED,
        "orchestrator",
        {
            "workflow_id": workflow_id,
            "customer_id": customer_id,
            "result": result
        }
    )
    
    return result

# Run the example
asyncio.run(example_workflow())
```

## 🧪 Testing

The system includes comprehensive testing:

```bash
# Run minimal integration test (no external dependencies)
python3 test_minimal_integration.py

# Run full integration test (requires Redis, NetworkX)
python3 test_enhanced_orchestration.py
```

## 🔧 Configuration

### Environment Variables

```bash
# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
CELERY_BROKER_URL=redis://redis:6379/0

# Agent Configuration
AGENT_MAX_ITERATIONS=3
AGENT_TIMEOUT_MINUTES=30
AGENT_QUALITY_THRESHOLD=0.8
AGENT_CONFIDENCE_THRESHOLD=0.55
```

### Agent Capability Mappings

The system includes predefined capability mappings for 50+ existing agents:

```python
AGENT_CAPABILITY_MAPPINGS = {
    "BookkeepingAgent": AgentCapabilityMapping(
        capabilities=["financial_management", "transaction_processing", "accounting"],
        specializations=["accounting", "bookkeeping"],
        priority=7
    ),
    "ContentStrategist": AgentCapabilityMapping(
        capabilities=["content_strategy", "content_planning", "calendar_creation"],
        specializations=["content_strategy"],
        priority=7
    ),
    # ... 50+ more agents
}
```

## 🚀 Benefits

### For Existing Agents
- **Zero Code Changes**: Existing agents work without modification
- **Enhanced Capabilities**: Access to messaging and knowledge graph
- **Better Coordination**: Improved workflow coordination
- **Performance Monitoring**: Built-in performance tracking

### For New Agents
- **Standardized Protocols**: Consistent communication patterns
- **Rich Context**: Access to shared knowledge and relationships
- **Load Balancing**: Automatic task distribution
- **Quality Control**: Built-in quality assessment

### For the System
- **Scalability**: Handle more complex workflows
- **Reliability**: Better error handling and recovery
- **Observability**: Comprehensive monitoring and logging
- **Flexibility**: Easy to extend and modify

## 🔮 Future Enhancements

### Planned Features
1. **Advanced AI Coordination**: LLM-based agent selection and routing
2. **Predictive Load Balancing**: ML-based capacity planning
3. **Dynamic Agent Creation**: On-demand agent spawning
4. **Cross-System Integration**: External API and service integration
5. **Advanced Analytics**: Deep insights into agent performance and workflow optimization

### Integration Roadmap
1. **External APIs**: QuickBooks, Salesforce, HubSpot integration
2. **Social Platforms**: LinkedIn, Twitter, Instagram APIs
3. **Analytics Tools**: Google Analytics, Mixpanel integration
4. **Communication Tools**: Slack, Teams, Discord integration
5. **Project Management**: Notion, Asana, Trello integration

## 📚 API Reference

### Event Bus API

```python
# Publish event
await publish_event(event_type, source_agent, data, target_agents, priority)

# Subscribe to events
subscription_id = await subscribe_agent(agent_name, event_types, handler)

# Get event history
events = await event_bus.get_event_history(agent_name, event_type, limit)
```

### Knowledge Graph API

```python
# Add entity
entity_id = await add_entity(node_type, name, properties, created_by)

# Link entities
link_id = await link_entities(source_id, target_id, relationship, properties, created_by)

# Query entities
entities = await knowledge_graph.query_nodes(node_type, filters, limit)

# Get agent context
context = await get_agent_context(agent_name)
```

### Orchestrator API

```python
# Register agent
await register_agent_capability(agent_name, capabilities, max_concurrent_tasks, priority)

# Create workflow
workflow_id = await create_enhanced_workflow(user_input, tasks)

# Execute workflow
result = await execute_enhanced_workflow(workflow_id)

# Get system status
status = enhanced_orchestrator.get_system_status()
```

## 🤝 Contributing

To contribute to the enhanced orchestration system:

1. **Follow the Architecture**: Maintain separation between messaging, knowledge, and orchestration
2. **Add Tests**: Include tests for new functionality
3. **Update Documentation**: Keep this README and API docs current
4. **Consider Backward Compatibility**: Ensure existing agents continue to work
5. **Performance**: Monitor and optimize system performance

## 📄 License

This enhanced orchestration system is part of the Guild-AI project and follows the same MIT license.
