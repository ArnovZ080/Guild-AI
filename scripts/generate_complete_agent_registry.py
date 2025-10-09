#!/usr/bin/env python3
"""
Generate Complete AGENT_REGISTRY for orchestrator.py
This ensures the orchestrator knows about all 113+ agents in the system.
"""

import json
import os
from pathlib import Path

def load_scan_results():
    """Load the registry scan results"""
    with open('registry_scan_results.json', 'r') as f:
        return json.load(f)

def generate_agent_registry_code():
    """Generate the complete AGENT_REGISTRY code"""
    data = load_scan_results()
    agents = data['agents']
    
    # Generate imports
    imports = []
    registry_entries = []
    
    # Group by category for organization
    categories = {}
    for agent_name, info in agents.items():
        cat = info['category']
        if cat not in categories:
            categories[cat] = []
        categories[cat].append((agent_name, info))
    
    output = []
    output.append('"""')
    output.append('Complete Agent Registry - Auto-generated')
    output.append(f'Total Agents: {len(agents)}')
    output.append('"""')
    output.append('')
    
    # Generate imports by category
    for category in sorted(categories.keys()):
        output.append(f'# {category}')
        for agent_name, info in sorted(categories[category]):
            # Generate import statement
            filename = info['filename'].replace('.py', '')
            output.append(f'from guild.src.agents.{filename} import {agent_name}')
        output.append('')
    
    # Generate AGENT_REGISTRY dictionary
    output.append('# Complete Agent Registry')
    output.append('AGENT_REGISTRY = {')
    
    for category in sorted(categories.keys()):
        output.append(f'    # {category}')
        for agent_name, info in sorted(categories[category]):
            output.append(f'    "{agent_name}": {agent_name},')
        output.append('')
    
    output.append('}')
    output.append('')
    output.append(f'# Total Agents: {len(agents)}')
    
    return '\n'.join(output)

def main():
    print("="*80)
    print("GENERATING COMPLETE AGENT_REGISTRY")
    print("="*80)
    
    code = generate_agent_registry_code()
    
    # Save to file
    output_path = 'guild/src/core/complete_agent_registry.py'
    with open(output_path, 'w') as f:
        f.write(code)
    
    print(f"\n✅ Generated {output_path}")
    print(f"📊 Registry includes all agents from codebase")
    print("\nNext steps:")
    print("1. Review the generated file")
    print("2. Update orchestrator.py to import from complete_agent_registry")
    print("3. Test workflow generation with full agent awareness")

if __name__ == "__main__":
    main()

