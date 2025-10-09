#!/usr/bin/env python3
"""
Complete Registry Update Script
Updates AGENT_REGISTRY, agent_capability_registry.py, and integration_capability_registry.py
with ALL agents and integrations found in the codebase.
"""

import os
import re
import json
from pathlib import Path

def convert_filename_to_class_name(filename):
    """Convert filename to Python class name"""
    # Remove .py extension
    name = filename.replace('.py', '')
    # Split by underscore and capitalize each part
    parts = name.split('_')
    # Handle special cases
    if parts[-1] != 'agent' and not name.endswith(('strategist', 'copywriter')):
        # Files like strategy_agent.py -> StrategyAgent
        class_name = ''.join(word.capitalize() for word in parts)
    else:
        # Files like content_strategist.py -> ContentStrategist
        class_name = ''.join(word.capitalize() for word in parts)
    
    return class_name


def extract_agent_info(filepath):
    """Extract agent information from agent file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Extract docstring
        docstring_match = re.search(r'"""(.*?)"""', content, re.DOTALL)
        description = docstring_match.group(1).strip()[:200] if docstring_match else ""
        
        # Extract capabilities from docstring or class definition
        capabilities = []
        if 'capabilities' in content.lower():
            cap_match = re.search(r'capabilities.*?=.*?\[(.*?)\]', content, re.DOTALL | re.IGNORECASE)
            if cap_match:
                caps_str = cap_match.group(1)
                capabilities = re.findall(r'["\']([^"\']+)["\']', caps_str)
        
        # Categorize agent
        category = "Operations"  # default
        if any(keyword in content.lower() for keyword in ['content', 'social', 'marketing', 'campaign', 'seo', 'copywriting']):
            category = "Content & Marketing"
        elif any(keyword in content.lower() for keyword in ['financial', 'accounting', 'bookkeeping', 'revenue', 'pricing']):
            category = "Financial"
        elif any(keyword in content.lower() for keyword in ['customer', 'crm', 'sales', 'lead', 'churn', 'retention']):
            category = "Sales & Customer"
        elif any(keyword in content.lower() for keyword in ['strategy', 'chief', 'executive', 'business intelligence']):
            category = "Executive"
        elif any(keyword in content.lower() for keyword in ['intelligence', 'research', 'data', 'competitive', 'analysis']):
            category = "Intelligence & Research"
        elif any(keyword in content.lower() for keyword in ['automation', 'scraper', 'visual', 'desktop']):
            category = "Automation"
        elif any(keyword in content.lower() for keyword in ['image', 'video', 'voice', 'media', 'creative']):
            category = "Creative & Media"
        elif any(keyword in content.lower() for keyword in ['judge', 'quality', 'evaluator', 'checker']):
            category = "Quality Assurance"
        
        return {
            'description': description,
            'capabilities': capabilities or ['multi_purpose_agent'],
            'category': category
        }
    except Exception as e:
        return {
            'description': f'Agent for Guild-AI',
            'capabilities': ['multi_purpose_agent'],
            'category': 'Operations'
        }


def scan_all_agents():
    """Scan all agent files and return complete list"""
    agents_dir = Path('guild/src/agents')
    agents = {}
    
    for filepath in sorted(agents_dir.glob('*.py')):
        if filepath.name.startswith('__'):
            continue
        if filepath.name in ['enhanced_prompts.py']:
            continue
            
        filename = filepath.name
        class_name = convert_filename_to_class_name(filename)
        agent_info = extract_agent_info(filepath)
        
        agents[class_name] = {
            'filename': filename,
            'class_name': class_name,
            **agent_info
        }
    
    return agents


def extract_integrations_from_js():
    """Extract all integrations from connectorConfigurations.js"""
    try:
        with open('frontend/src/components/connectors/connectorConfigurations.js', 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extract connector objects
        integrations = {}
        
        # Find all connector definitions
        connector_pattern = r'\{[^}]*id:\s*[\'\"]([\w_-]+)[\'\"][^}]*category:\s*[\'\"]([\w\s&/-]+)[\'\"][^}]*name:\s*[\'\"]([\w\s&/-]+)[\'\"][^}]*\}'
        matches = re.finditer(connector_pattern, content, re.DOTALL)
        
        for match in matches:
            connector_id = match.group(1)
            category = match.group(2)
            name = match.group(3)
            
            # Skip category entries
            if connector_id in ['all', 'advertising', 'project_management', 'payments', 'accounting', 
                                'crm', 'social_media', 'communication', 'productivity', 'automation',
                                'development', 'ecommerce', 'design', 'support', 'human_os']:
                continue
            
            integrations[connector_id] = {
                'id': connector_id,
                'name': name,
                'category': category
            }
        
        return integrations
    except Exception as e:
        print(f"Error extracting integrations: {e}")
        return {}


def main():
    """Main execution"""
    print("="*80)
    print("GUILD-AI COMPLETE REGISTRY UPDATE")
    print("="*80)
    
    # Scan all agents
    print("\n📊 Scanning all agent files...")
    agents = scan_all_agents()
    print(f"✅ Found {len(agents)} agents")
    
    # Extract integrations
    print("\n📊 Extracting all integrations...")
    integrations = extract_integrations_from_js()
    print(f"✅ Found {len(integrations)} integrations")
    
    # Print summary by category
    print("\n" + "="*80)
    print("AGENTS BY CATEGORY")
    print("="*80)
    
    categories = {}
    for agent_name, info in agents.items():
        cat = info['category']
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(agent_name)
    
    for cat, agent_list in sorted(categories.items()):
        print(f"\n{cat} ({len(agent_list)} agents):")
        for agent in sorted(agent_list)[:10]:
            print(f"  - {agent}")
        if len(agent_list) > 10:
            print(f"  ... and {len(agent_list) - 10} more")
    
    # Print integration categories
    print("\n" + "="*80)
    print("INTEGRATIONS BY CATEGORY")
    print("="*80)
    
    int_categories = {}
    for int_id, info in integrations.items():
        cat = info['category']
        if cat not in int_categories:
            int_categories[cat] = []
        int_categories[cat].append(int_id)
    
    for cat, int_list in sorted(int_categories.items()):
        print(f"\n{cat} ({len(int_list)} integrations):")
        for integration in sorted(int_list)[:10]:
            print(f"  - {integration}")
        if len(int_list) > 10:
            print(f"  ... and {len(int_list) - 10} more")
    
    # Save to file for further processing
    output_data = {
        'total_agents': len(agents),
        'total_integrations': len(integrations),
        'agents': agents,
        'integrations': integrations,
        'agent_categories': {cat: len(agent_list) for cat, agent_list in categories.items()},
        'integration_categories': {cat: len(int_list) for cat, int_list in int_categories.items()}
    }
    
    with open('registry_scan_results.json', 'w') as f:
        json.dump(output_data, f, indent=2)
    
    print("\n" + "="*80)
    print(f"✅ Results saved to registry_scan_results.json")
    print("="*80)
    print(f"\nSUMMARY:")
    print(f"  Total Agents: {len(agents)}")
    print(f"  Total Integrations: {len(integrations)}")
    print(f"  Agent Categories: {len(categories)}")
    print(f"  Integration Categories: {len(int_categories)}")


if __name__ == "__main__":
    main()

