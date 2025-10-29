"""
Auto-generated Agent Integration Script
Registers all 104 agents with the orchestrator
"""

import asyncio
from .agent_factory import agent_factory
from .agent_orchestrator import agent_orchestrator

async def integrate_all_agents():
    """Integrate all agents with the orchestrator"""
    print("🚀 Integrating all agents with orchestrator...")
    
    # Register all agents
    agent_factory.register_all_agents(agent_orchestrator)
    
    print(f"✅ Successfully integrated {len(agent_orchestrator.agents)} agents")
    
    # Print summary
    categories = {}
    for agent in agent_orchestrator.agents.values():
        category = getattr(agent, 'category', 'general')
        if category not in categories:
            categories[category] = 0
        categories[category] += 1
    
    print("\n📊 Agent Integration Summary:")
    for category, count in categories.items():
        print(f"   {category.title()}: {count} agents")
    
    return agent_orchestrator

# Auto-run integration
if __name__ == "__main__":
    asyncio.run(integrate_all_agents())
