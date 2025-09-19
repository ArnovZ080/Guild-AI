"""
Agent Factory System
Automatically creates and manages all 104+ agents with class-based structure
"""

from typing import Dict, List, Any, Optional, Type
from ..agents.base_agent import BaseAgent
from ..agents.bookkeeping_agent import BookkeepingAgent
import importlib
import os
from pathlib import Path

class AgentFactory:
    """Factory for creating and managing all agents"""
    
    def __init__(self):
        self.agents: Dict[str, BaseAgent] = {}
        self.agent_registry: Dict[str, Dict[str, Any]] = {}
        self._load_agent_registry()
    
    def _load_agent_registry(self):
        """Load agent registry from generated data"""
        try:
            import json
            registry_path = Path(__file__).parent / 'comprehensive_registry.json'
            if registry_path.exists():
                with open(registry_path, 'r') as f:
                    self.agent_registry = json.load(f).get('agents', {})
        except Exception as e:
            print(f"Error loading agent registry: {e}")
    
    def create_agent(self, agent_id: str) -> Optional[BaseAgent]:
        """Create an agent instance by ID"""
        if agent_id in self.agents:
            return self.agents[agent_id]
        
        # Get agent metadata
        agent_metadata = self._get_agent_metadata(agent_id)
        if not agent_metadata:
            return None
        
        # Create agent based on type
        if agent_metadata.get('category') == 'finance':
            agent = BookkeepingAgent(name=agent_metadata['name'])
        else:
            # Create generic agent with metadata
            agent = self._create_generic_agent(agent_metadata)
        
        self.agents[agent_id] = agent
        return agent
    
    def _get_agent_metadata(self, agent_id: str) -> Optional[Dict[str, Any]]:
        """Get agent metadata from registry"""
        for agent in self.agent_registry:
            if agent['agent_id'] == agent_id:
                return agent
        return None
    
    def _create_generic_agent(self, metadata: Dict[str, Any]) -> BaseAgent:
        """Create a generic agent with metadata"""
        
        class GenericAgent(BaseAgent):
            def __init__(self, metadata):
                super().__init__(
                    agent_id=metadata['agent_id'],
                    name=metadata['name'],
                    description=metadata['description'],
                    capabilities=metadata['capabilities']
                )
                self.category = metadata['category']
                self.icon = metadata['icon']
            
            async def _execute_main_task(self, task: Dict[str, Any], session_id: str) -> Dict[str, Any]:
                """Execute main task for generic agent"""
                await self.send_status_update("working", 10, f"{self.name} is analyzing your request...")
                
                # Simulate task processing
                await asyncio.sleep(2)
                await self.send_status_update("working", 50, f"{self.name} is processing your request...")
                
                await asyncio.sleep(2)
                await self.send_status_update("working", 90, f"{self.name} is finalizing results...")
                
                result = {
                    "success": True,
                    "agent": self.name,
                    "category": self.category,
                    "task_type": task.get('description', 'general'),
                    "capabilities_used": self.capabilities[:3],
                    "result": f"{self.name} has completed the requested task successfully.",
                    "metadata": {
                        "agent_id": self.agent_id,
                        "category": self.category,
                        "capabilities": self.capabilities,
                        "timestamp": datetime.now().isoformat()
                    }
                }
                
                await self.send_response(f"Task completed successfully! {result['result']}")
                return result
            
            def can_handle_task(self, task: Dict[str, Any]) -> bool:
                """Check if agent can handle task"""
                description = task.get('description', '').lower()
                task_keywords = description.split()
                
                # Check if any capability keywords match
                for capability in self.capabilities:
                    if any(keyword in capability.lower() for keyword in task_keywords):
                        return True
                
                return False
            
            def estimate_task_complexity(self, task: Dict[str, Any]) -> 'TaskComplexity':
                """Estimate task complexity"""
                description = task.get('description', '')
                if len(description.split()) < 10:
                    return TaskComplexity.SIMPLE
                elif len(description.split()) < 25:
                    return TaskComplexity.MODERATE
                else:
                    return TaskComplexity.COMPLEX
            
            def get_estimated_duration(self, task: Dict[str, Any]) -> int:
                """Get estimated task duration"""
                complexity = self.estimate_task_complexity(task)
                if complexity == TaskComplexity.SIMPLE:
                    return 5
                elif complexity == TaskComplexity.MODERATE:
                    return 15
                else:
                    return 30
        
        return GenericAgent(metadata)
    
    def get_all_agents(self) -> Dict[str, BaseAgent]:
        """Get all created agents"""
        return self.agents
    
    def get_agent_by_category(self, category: str) -> List[BaseAgent]:
        """Get agents by category"""
        agents = []
        for agent_id, agent in self.agents.items():
            if hasattr(agent, 'category') and agent.category == category:
                agents.append(agent)
        return agents
    
    def register_all_agents(self, orchestrator):
        """Register all agents with orchestrator"""
        for agent_metadata in self.agent_registry:
            agent_id = agent_metadata['agent_id']
            if agent_id not in self.agents:
                agent = self.create_agent(agent_id)
                if agent:
                    orchestrator.register_agent(agent)
                    print(f"✅ Registered {agent.name} ({agent_id})")

# Global factory instance
agent_factory = AgentFactory()
