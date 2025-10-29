#!/usr/bin/env python3
"""
Script to extract all agent information from the backend and create a comprehensive marketplace catalog.
"""

import os
import re
import json
from pathlib import Path
from typing import Dict, List, Any

def extract_agent_info(file_path: str) -> Dict[str, Any]:
    """Extract agent information from a Python file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extract agent name from filename
        agent_name = Path(file_path).stem.replace('_agent', '').replace('_', ' ').title()
        
        # Extract agent type from class definition or docstring
        agent_type = "General"
        if "Human & Psychological" in content:
            agent_type = "Human & Psychological"
        elif "Financial" in content or "accounting" in content or "bookkeeping" in content:
            agent_type = "Financial & Business"
        elif "marketing" in content or "content" in content or "social" in content:
            agent_type = "Content Creation"
        elif "research" in content or "data" in content or "analytics" in content:
            agent_type = "Research & Data"
        elif "automation" in content or "workflow" in content:
            agent_type = "Automation"
        elif "creative" in content or "design" in content or "video" in content or "image" in content:
            agent_type = "Creative & Media"
        elif "evaluation" in content or "quality" in content or "judge" in content:
            agent_type = "Evaluator League"
        elif "orchestration" in content or "management" in content or "coordination" in content:
            agent_type = "Orchestration & Management"
        elif "operations" in content or "hr" in content or "training" in content:
            agent_type = "Business Operations"
        elif "meta" in content or "security" in content or "scalability" in content:
            agent_type = "Meta-Agents"
        
        # Extract description from docstring
        description = "AI agent for business automation and optimization."
        if '"""' in content:
            docstring_match = re.search(r'"""([^"]+)"""', content, re.DOTALL)
            if docstring_match:
                description = docstring_match.group(1).strip().split('\n')[0]
        
        # Extract capabilities from the agent class
        capabilities = []
        if 'capabilities = [' in content:
            cap_match = re.search(r'capabilities = \[(.*?)\]', content, re.DOTALL)
            if cap_match:
                cap_text = cap_match.group(1)
                capabilities = [cap.strip().strip('"\'') for cap in re.findall(r'"([^"]+)"', cap_text)]
        
        # If no capabilities found, create some based on the agent type
        if not capabilities:
            if agent_type == "Financial & Business":
                capabilities = ["Financial analysis", "Budget planning", "Expense tracking"]
            elif agent_type == "Content Creation":
                capabilities = ["Content strategy", "Creative writing", "Brand messaging"]
            elif agent_type == "Research & Data":
                capabilities = ["Data analysis", "Market research", "Trend analysis"]
            elif agent_type == "Automation":
                capabilities = ["Process automation", "Workflow optimization", "Task automation"]
            elif agent_type == "Creative & Media":
                capabilities = ["Visual design", "Media creation", "Creative content"]
            elif agent_type == "Human & Psychological":
                capabilities = ["Wellness coaching", "Stress management", "Work-life balance"]
            else:
                capabilities = ["Business optimization", "Process improvement", "Strategic planning"]
        
        return {
            "id": Path(file_path).stem,
            "name": agent_name,
            "type": agent_type,
            "description": description,
            "capabilities": capabilities,
            "status": "available",
            "icon": get_agent_icon(agent_type, agent_name)
        }
    
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return None

def get_agent_icon(agent_type: str, agent_name: str) -> str:
    """Get appropriate icon for agent based on type and name."""
    icon_map = {
        "Financial & Business": "💰",
        "Content Creation": "📝",
        "Research & Data": "🔍",
        "Automation": "⚙️",
        "Creative & Media": "🎨",
        "Human & Psychological": "🧠",
        "Evaluator League": "⚖️",
        "Orchestration & Management": "🎯",
        "Business Operations": "🏢",
        "Meta-Agents": "🔧"
    }
    
    # Special cases for specific agents
    special_icons = {
        "Wellness": "🌱",
        "Accounting": "📊",
        "Marketing": "📈",
        "Research": "🔬",
        "Automation": "🤖",
        "Voice": "🎤",
        "Video": "🎬",
        "Image": "🖼️",
        "Security": "🔒",
        "Learning": "📚",
        "Community": "👥",
        "Celebration": "🎉"
    }
    
    for keyword, icon in special_icons.items():
        if keyword.lower() in agent_name.lower():
            return icon
    
    return icon_map.get(agent_type, "🤖")

def main():
    """Main function to extract all agent information."""
    agents_dir = Path("guild/src/agents")
    
    if not agents_dir.exists():
        print(f"Agents directory not found: {agents_dir}")
        return
    
    agents = []
    agent_files = list(agents_dir.glob("*.py"))
    agent_files = [f for f in agent_files if not f.name.startswith("__")]
    
    print(f"Found {len(agent_files)} agent files")
    
    for agent_file in agent_files:
        agent_info = extract_agent_info(str(agent_file))
        if agent_info:
            agents.append(agent_info)
    
    # Group agents by type
    agents_by_type = {}
    for agent in agents:
        agent_type = agent["type"]
        if agent_type not in agents_by_type:
            agents_by_type[agent_type] = []
        agents_by_type[agent_type].append(agent)
    
    # Create the marketplace data structure
    marketplace_data = {
        "agents": agents,
        "categories": list(agents_by_type.keys()),
        "total_agents": len(agents),
        "agents_by_type": agents_by_type
    }
    
    # Save to JSON file
    with open("agent_marketplace_data.json", "w", encoding="utf-8") as f:
        json.dump(marketplace_data, f, indent=2, ensure_ascii=False)
    
    print(f"\nExtracted {len(agents)} agents:")
    for category, category_agents in agents_by_type.items():
        print(f"  {category}: {len(category_agents)} agents")
    
    print(f"\nData saved to agent_marketplace_data.json")
    
    # Print sample agents
    print("\nSample agents:")
    for i, agent in enumerate(agents[:5]):
        print(f"  {i+1}. {agent['name']} ({agent['type']}) - {agent['description']}")

if __name__ == "__main__":
    main()

