"""
Agent Integration Adapter

This module provides adapters and utilities to integrate existing agents with the new
messaging and orchestration systems without requiring major code changes.
"""

import json
import asyncio
from typing import Dict, Any, List, Optional, Callable, Type
from dataclasses import dataclass
from datetime import datetime, timezone
import inspect
from guild.src.core.messaging.agent_protocol import (
    AgentIntegrationMixin, AgentMessagingProtocol, MessageType, AgentMessage
)
from guild.src.core.messaging.event_bus import EventType, publish_event
from guild.src.core.knowledge.knowledge_graph import NodeType, add_entity
from guild.src.core.orchestration.enhanced_orchestrator import register_agent_capability
from guild.src.utils.logging_utils import get_logger

logger = get_logger(__name__)

@dataclass
class AgentCapabilityMapping:
    """Mapping of agent types to their capabilities"""
    agent_class_name: str
    capabilities: List[str]
    specializations: List[str]
    max_concurrent_tasks: int = 1
    priority: int = 0
    dependencies: List[str] = None
    
    def __post_init__(self):
        if self.dependencies is None:
            self.dependencies = []

# Predefined capability mappings for existing agents
AGENT_CAPABILITY_MAPPINGS = {
    # Executive Layer
    "ChiefOfStaffAgent": AgentCapabilityMapping(
        agent_class_name="ChiefOfStaffAgent",
        capabilities=["strategic_coordination", "delegation", "workflow_optimization", "executive_support"],
        specializations=["executive_management", "strategic_planning"],
        priority=10
    ),
    "StrategyAgent": AgentCapabilityMapping(
        agent_class_name="StrategyAgent",
        capabilities=["strategic_planning", "market_analysis", "business_strategy", "competitive_analysis"],
        specializations=["strategy", "market_research", "business_planning"],
        priority=9
    ),
    "BusinessStrategistAgent": AgentCapabilityMapping(
        agent_class_name="BusinessStrategistAgent",
        capabilities=["business_strategy", "strategic_thinking", "market_analysis", "recommendations"],
        specializations=["business_strategy", "strategic_planning"],
        priority=8
    ),
    
    # Content Creation
    "ContentStrategist": AgentCapabilityMapping(
        agent_class_name="ContentStrategist",
        capabilities=["content_strategy", "content_planning", "calendar_creation", "content_analysis"],
        specializations=["content_strategy", "content_planning"],
        priority=7
    ),
    "Copywriter": AgentCapabilityMapping(
        agent_class_name="Copywriter",
        capabilities=["content_creation", "writing", "copywriting", "content_generation"],
        specializations=["copywriting", "content_creation"],
        priority=6
    ),
    "SEOAgent": AgentCapabilityMapping(
        agent_class_name="SEOAgent",
        capabilities=["seo_analysis", "keyword_research", "content_optimization", "technical_seo"],
        specializations=["seo", "search_optimization"],
        priority=6
    ),
    
    # Finance
    "BookkeepingAgent": AgentCapabilityMapping(
        agent_class_name="BookkeepingAgent",
        capabilities=["financial_management", "transaction_processing", "accounting", "financial_reporting"],
        specializations=["accounting", "bookkeeping", "financial_management"],
        priority=7
    ),
    "AccountingAgent": AgentCapabilityMapping(
        agent_class_name="AccountingAgent",
        capabilities=["accounting", "financial_reporting", "compliance", "audit_support"],
        specializations=["accounting", "financial_reporting"],
        priority=7
    ),
    "PricingAgent": AgentCapabilityMapping(
        agent_class_name="PricingAgent",
        capabilities=["pricing_strategy", "price_optimization", "competitive_pricing", "pricing_analysis"],
        specializations=["pricing", "pricing_strategy"],
        priority=6
    ),
    
    # Research & Intelligence
    "ResearchScraperAgent": AgentCapabilityMapping(
        agent_class_name="ResearchScraperAgent",
        capabilities=["web_scraping", "data_extraction", "research", "data_collection"],
        specializations=["web_scraping", "research", "data_extraction"],
        priority=5
    ),
    "LeadPersonalizationAgent": AgentCapabilityMapping(
        agent_class_name="LeadPersonalizationAgent",
        capabilities=["lead_personalization", "sales_psychology", "outreach_automation", "lead_scoring"],
        specializations=["lead_generation", "sales_automation"],
        priority=6
    ),
    
    # Quality & Evaluation
    "JudgeAgent": AgentCapabilityMapping(
        agent_class_name="JudgeAgent",
        capabilities=["quality_control", "rubric_generation", "output_evaluation", "quality_assessment"],
        specializations=["quality_assessment", "evaluation"],
        priority=8
    ),
    
    # Operations
    "ProjectManagerAgent": AgentCapabilityMapping(
        agent_class_name="ProjectManagerAgent",
        capabilities=["project_management", "task_coordination", "resource_management", "timeline_management"],
        specializations=["project_management", "task_coordination"],
        priority=7
    ),
    "TrainingAgent": AgentCapabilityMapping(
        agent_class_name="TrainingAgent",
        capabilities=["training_creation", "sop_generation", "documentation", "process_documentation"],
        specializations=["training", "documentation", "process_management"],
        priority=6
    ),
    
    # Sales & Customer
    "CRMAgent": AgentCapabilityMapping(
        agent_class_name="CRMAgent",
        capabilities=["crm_management", "customer_relationship", "lead_management", "sales_automation"],
        specializations=["crm", "customer_relationship"],
        priority=7
    ),
    "CustomerSupportAgent": AgentCapabilityMapping(
        agent_class_name="CustomerSupportAgent",
        capabilities=["customer_support", "issue_resolution", "customer_service", "support_automation"],
        specializations=["customer_support", "customer_service"],
        priority=6
    ),
    
    # Creative & Media
    "ImageGenerationAgent": AgentCapabilityMapping(
        agent_class_name="ImageGenerationAgent",
        capabilities=["image_generation", "visual_content", "creative_design", "visual_automation"],
        specializations=["image_generation", "visual_content"],
        priority=5
    ),
    "VideoEditorAgent": AgentCapabilityMapping(
        agent_class_name="VideoEditorAgent",
        capabilities=["video_editing", "video_production", "multimedia_content", "video_automation"],
        specializations=["video_editing", "video_production"],
        priority=5
    ),
    "VoiceAgent": AgentCapabilityMapping(
        agent_class_name="VoiceAgent",
        capabilities=["voice_processing", "text_to_speech", "speech_to_text", "audio_processing"],
        specializations=["voice_processing", "audio_automation"],
        priority=5
    ),
    
    # Automation
    "UnifiedAutomationAgent": AgentCapabilityMapping(
        agent_class_name="UnifiedAutomationAgent",
        capabilities=["automation", "workflow_automation", "process_automation", "task_automation"],
        specializations=["automation", "workflow_automation"],
        priority=6
    ),
    "CRMAutomationAgent": AgentCapabilityMapping(
        agent_class_name="CRMAutomationAgent",
        capabilities=["crm_automation", "sales_automation", "lead_automation", "workflow_automation"],
        specializations=["crm_automation", "sales_automation"],
        priority=6
    ),
    
    # Meta-Agents
    "AgentEvaluator": AgentCapabilityMapping(
        agent_class_name="AgentEvaluator",
        capabilities=["agent_evaluation", "performance_assessment", "quality_analysis", "optimization_recommendations"],
        specializations=["agent_evaluation", "performance_analysis"],
        priority=9
    ),
    "KnowledgeUpdater": AgentCapabilityMapping(
        agent_class_name="KnowledgeUpdater",
        capabilities=["knowledge_management", "data_updates", "information_synthesis", "knowledge_optimization"],
        specializations=["knowledge_management", "information_synthesis"],
        priority=8
    ),
    "SecurityAgent": AgentCapabilityMapping(
        agent_class_name="SecurityAgent",
        capabilities=["security_monitoring", "threat_detection", "security_analysis", "compliance_monitoring"],
        specializations=["security", "compliance", "threat_analysis"],
        priority=10
    )
}

class AgentIntegrationAdapter:
    """
    Adapter class to integrate existing agents with the enhanced orchestration system.
    
    This adapter provides a bridge between existing agent implementations and the new
    messaging and orchestration systems without requiring major refactoring.
    """
    
    def __init__(self, agent_instance: Any, agent_name: str = None):
        self.agent_instance = agent_instance
        self.agent_name = agent_name or agent_instance.__class__.__name__
        self.original_methods = {}
        self.messaging_protocol: Optional[AgentMessagingProtocol] = None
        self.is_initialized = False
        
    async def initialize(self):
        """Initialize the adapter and integrate the agent"""
        if self.is_initialized:
            return
        
        # Initialize messaging protocol
        self.messaging_protocol = AgentMessagingProtocol(self.agent_name)
        await self.messaging_protocol.initialize()
        
        # Register agent capabilities
        await self._register_capabilities()
        
        # Wrap agent methods
        await self._wrap_agent_methods()
        
        # Initialize agent if it has an initialize method
        if hasattr(self.agent_instance, 'initialize'):
            await self.agent_instance.initialize()
        
        self.is_initialized = True
        logger.info(f"Agent adapter initialized for {self.agent_name}")
    
    async def _register_capabilities(self):
        """Register agent capabilities with the orchestrator"""
        mapping = AGENT_CAPABILITY_MAPPINGS.get(self.agent_name)
        
        if mapping:
            await register_agent_capability(
                self.agent_name,
                mapping.capabilities,
                mapping.max_concurrent_tasks,
                mapping.priority,
                mapping.specializations,
                mapping.dependencies
            )
        else:
            # Default capabilities based on agent name
            capabilities = self._infer_capabilities()
            await register_agent_capability(
                self.agent_name,
                capabilities,
                1,  # Default max concurrent tasks
                5,  # Default priority
                [],
                []
            )
        
        # Add agent to knowledge graph
        await add_entity(
            NodeType.AGENT,
            self.agent_name,
            {
                "class_name": self.agent_instance.__class__.__name__,
                "capabilities": mapping.capabilities if mapping else self._infer_capabilities(),
                "status": "active",
                "integration_adapter": True
            },
            "integration_adapter"
        )
    
    def _infer_capabilities(self) -> List[str]:
        """Infer capabilities from agent name and methods"""
        capabilities = []
        agent_name_lower = self.agent_name.lower()
        
        # Basic capability inference
        if "strategy" in agent_name_lower:
            capabilities.extend(["strategic_planning", "strategy"])
        if "content" in agent_name_lower:
            capabilities.extend(["content_creation", "content_strategy"])
        if "writing" in agent_name_lower or "copy" in agent_name_lower:
            capabilities.extend(["writing", "content_creation"])
        if "research" in agent_name_lower:
            capabilities.extend(["research", "data_collection"])
        if "finance" in agent_name_lower or "accounting" in agent_name_lower:
            capabilities.extend(["financial_management", "accounting"])
        if "automation" in agent_name_lower:
            capabilities.extend(["automation", "workflow_automation"])
        if "quality" in agent_name_lower or "judge" in agent_name_lower:
            capabilities.extend(["quality_assessment", "evaluation"])
        
        # Add general capability if none found
        if not capabilities:
            capabilities.append("general")
        
        return capabilities
    
    async def _wrap_agent_methods(self):
        """Wrap agent methods to integrate with messaging system"""
        # Wrap the main run method if it exists
        if hasattr(self.agent_instance, 'run'):
            original_run = self.agent_instance.run
            
            async def wrapped_run(*args, **kwargs):
                # Notify task start
                await self._notify_task_start()
                
                try:
                    result = await original_run(*args, **kwargs)
                    await self._notify_task_completion(result)
                    return result
                except Exception as e:
                    await self._notify_task_error(e)
                    raise
            
            self.agent_instance.run = wrapped_run
            self.original_methods['run'] = original_run
        
        # Wrap other important methods
        methods_to_wrap = ['execute', 'process', 'handle', 'generate']
        for method_name in methods_to_wrap:
            if hasattr(self.agent_instance, method_name):
                original_method = getattr(self.agent_instance, method_name)
                
                async def wrapped_method(*args, **kwargs):
                    method_name = method_name  # Capture in closure
                    await self._notify_method_call(method_name)
                    
                    try:
                        if asyncio.iscoroutinefunction(original_method):
                            result = await original_method(*args, **kwargs)
                        else:
                            result = original_method(*args, **kwargs)
                        await self._notify_method_completion(method_name, result)
                        return result
                    except Exception as e:
                        await self._notify_method_error(method_name, e)
                        raise
                
                setattr(self.agent_instance, method_name, wrapped_method)
                self.original_methods[method_name] = original_method
    
    async def _notify_task_start(self):
        """Notify system of task start"""
        await publish_event(
            EventType.TASK_STARTED,
            self.agent_name,
            {
                "agent": self.agent_name,
                "task_type": "agent_execution",
                "start_time": datetime.now(timezone.utc).isoformat()
            }
        )
    
    async def _notify_task_completion(self, result: Any):
        """Notify system of task completion"""
        await publish_event(
            EventType.TASK_COMPLETED,
            self.agent_name,
            {
                "agent": self.agent_name,
                "task_type": "agent_execution",
                "result": str(result)[:1000] if result else None,  # Truncate large results
                "completion_time": datetime.now(timezone.utc).isoformat()
            }
        )
    
    async def _notify_task_error(self, error: Exception):
        """Notify system of task error"""
        await publish_event(
            EventType.TASK_FAILED,
            self.agent_name,
            {
                "agent": self.agent_name,
                "task_type": "agent_execution",
                "error": str(error),
                "error_time": datetime.now(timezone.utc).isoformat()
            }
        )
    
    async def _notify_method_call(self, method_name: str):
        """Notify system of method call"""
        await publish_event(
            EventType.TASK_PROGRESS,
            self.agent_name,
            {
                "agent": self.agent_name,
                "method": method_name,
                "status": "started",
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        )
    
    async def _notify_method_completion(self, method_name: str, result: Any):
        """Notify system of method completion"""
        await publish_event(
            EventType.TASK_PROGRESS,
            self.agent_name,
            {
                "agent": self.agent_name,
                "method": method_name,
                "status": "completed",
                "result": str(result)[:500] if result else None,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        )
    
    async def _notify_method_error(self, method_name: str, error: Exception):
        """Notify system of method error"""
        await publish_event(
            EventType.TASK_PROGRESS,
            self.agent_name,
            {
                "agent": self.agent_name,
                "method": method_name,
                "status": "error",
                "error": str(error),
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        )
    
    async def send_message(self, to_agents: List[str], subject: str, content: Dict[str, Any]):
        """Send a message to other agents"""
        if self.messaging_protocol:
            await self.messaging_protocol.send_notification(to_agents, subject, content)
    
    async def request_help(self, help_type: str, description: str) -> List[AgentMessage]:
        """Request help from other agents"""
        if self.messaging_protocol:
            return await self.messaging_protocol.query_agents(
                f"Help needed: {help_type} - {description}"
            )
        return []
    
    async def get_agent_status(self) -> Dict[str, Any]:
        """Get agent status"""
        status = {
            "agent_name": self.agent_name,
            "is_initialized": self.is_initialized,
            "original_methods": list(self.original_methods.keys())
        }
        
        if self.messaging_protocol:
            status.update(await self.messaging_protocol.get_agent_status())
        
        return status

class IntegratedAgent(AgentIntegrationMixin):
    """
    Base class for agents that want full integration with the enhanced orchestration system.
    
    This class combines the AgentIntegrationMixin with additional integration features.
    """
    
    def __init__(self, agent_name: str):
        super().__init__(agent_name)
        self.adapter: Optional[AgentIntegrationAdapter] = None
    
    async def initialize_integration(self):
        """Initialize full integration"""
        await self.initialize_messaging()
        
        # Create and initialize adapter
        self.adapter = AgentIntegrationAdapter(self, self.agent_name)
        await self.adapter.initialize()
    
    async def run_with_integration(self, *args, **kwargs):
        """Run method with full integration"""
        # Notify start
        await self.notify_completion("start", {"status": "starting"})
        
        try:
            # Run original method
            result = await self.run(*args, **kwargs)
            
            # Notify completion
            await self.notify_completion("complete", {"result": result})
            
            return result
        except Exception as e:
            # Notify error
            await self.notify_error("error", str(e))
            raise

# Convenience functions
async def integrate_existing_agent(agent_instance: Any, agent_name: str = None) -> AgentIntegrationAdapter:
    """Integrate an existing agent with the enhanced orchestration system"""
    adapter = AgentIntegrationAdapter(agent_instance, agent_name)
    await adapter.initialize()
    return adapter

async def create_integrated_agent(agent_name: str, 
                                capabilities: List[str],
                                specializations: List[str] = None,
                                max_concurrent_tasks: int = 1,
                                priority: int = 5) -> IntegratedAgent:
    """Create a new integrated agent"""
    agent = IntegratedAgent(agent_name)
    await agent.initialize_integration()
    await agent.register_with_orchestrator(
        capabilities, max_concurrent_tasks, priority, specializations
    )
    return agent

# Auto-integration decorator
def auto_integrate(agent_name: str = None, 
                  capabilities: List[str] = None,
                  specializations: List[str] = None,
                  max_concurrent_tasks: int = 1,
                  priority: int = 5):
    """Decorator to automatically integrate an agent class"""
    def decorator(cls):
        class AutoIntegratedAgent(cls, AgentIntegrationMixin):
            def __init__(self, *args, **kwargs):
                cls.__init__(self, *args, **kwargs)
                AgentIntegrationMixin.__init__(self, agent_name or cls.__name__)
                
            async def initialize(self):
                await self.initialize_messaging()
                await self.register_with_orchestrator(
                    capabilities or [],
                    max_concurrent_tasks,
                    priority,
                    specializations or []
                )
                if hasattr(super(), 'initialize'):
                    await super().initialize()
        
        return AutoIntegratedAgent
    
    return decorator
