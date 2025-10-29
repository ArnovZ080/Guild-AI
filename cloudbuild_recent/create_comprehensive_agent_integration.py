#!/usr/bin/env python3
"""
Create Comprehensive Agent Integration
Creates frontend integration for all 104+ agents using their actual structure
"""

import os
import json
import re
from pathlib import Path

def extract_agent_info_from_file(file_path):
    """Extract agent information from file based on actual structure"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Get file name without extension
        file_name = os.path.basename(file_path).replace('.py', '')
        
        # Extract agent name from docstring or function name
        agent_name = extract_agent_name(content, file_name)
        
        # Extract description from docstring
        description = extract_description(content, agent_name)
        
        # Determine capabilities based on content analysis
        capabilities = extract_capabilities(content, agent_name)
        
        # Determine category
        category = determine_category_from_content(content, file_name)
        
        # Determine icon
        icon = determine_icon_for_category(category)
        
        # Create agent ID from file name
        agent_id = file_name.replace('_agent', '').replace('agent', '')
        
        return {
            'agent_id': agent_id,
            'name': agent_name,
            'description': description,
            'capabilities': capabilities,
            'category': category,
            'icon': icon,
            'file_name': file_name,
            'type': 'function_based'  # Indicates this is a function-based agent
        }
        
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return None

def extract_agent_name(content, file_name):
    """Extract agent name from content"""
    # Look for agent name in docstring
    docstring_match = re.search(r'"""(.*?)"""', content, re.DOTALL)
    if docstring_match:
        docstring = docstring_match.group(1)
        # Look for "Agent for" pattern
        name_match = re.search(r'(\w+)\s+Agent\s+for', docstring)
        if name_match:
            return f"{name_match.group(1)} Agent"
    
    # Look for function name pattern
    func_match = re.search(r'async def generate_comprehensive_(\w+)_', content)
    if func_match:
        func_name = func_match.group(1).replace('_', ' ').title()
        return f"{func_name} Agent"
    
    # Fallback to file name
    return file_name.replace('_', ' ').title().replace(' Agent', '') + ' Agent'

def extract_description(content, agent_name):
    """Extract description from content"""
    # Look for comprehensive description in docstring
    docstring_match = re.search(r'"""(.*?)"""', content, re.DOTALL)
    if docstring_match:
        docstring = docstring_match.group(1)
        lines = docstring.split('\n')
        for line in lines:
            line = line.strip()
            if line and not line.startswith(agent_name.split()[0]) and len(line) > 20:
                return line
    
    # Generate description based on agent name
    descriptions = {
        'orchestrator': 'Comprehensive workflow orchestration and multi-agent coordination',
        'marketing': 'Marketing strategy and campaign management',
        'sales': 'Sales strategy and revenue optimization',
        'content': 'Content creation and strategy',
        'research': 'Research and data analysis',
        'automation': 'Process automation and optimization',
        'analytics': 'Data analytics and insights',
        'customer': 'Customer success and support',
        'finance': 'Financial management and analysis',
        'hr': 'Human resources and talent management',
        'product': 'Product management and development',
        'design': 'Design and user experience',
        'security': 'Security and compliance',
        'operations': 'Operations and process management'
    }
    
    for key, desc in descriptions.items():
        if key in agent_name.lower():
            return desc
    
    return f"Specialized {agent_name.lower()} for business automation and optimization"

def extract_capabilities(content, agent_name):
    """Extract capabilities from content analysis"""
    capabilities = []
    
    # Common capability patterns
    capability_patterns = {
        'strategy': ['strategy', 'planning', 'analysis'],
        'automation': ['automation', 'workflow', 'process'],
        'content': ['content', 'writing', 'copy', 'creative'],
        'analytics': ['analytics', 'data', 'metrics', 'reporting'],
        'communication': ['communication', 'email', 'messaging', 'social'],
        'research': ['research', 'scraping', 'intelligence', 'monitoring'],
        'sales': ['sales', 'revenue', 'conversion', 'leads'],
        'marketing': ['marketing', 'campaign', 'brand', 'promotion'],
        'customer': ['customer', 'support', 'success', 'retention'],
        'finance': ['finance', 'accounting', 'budget', 'financial'],
        'hr': ['hr', 'hiring', 'training', 'human resources'],
        'product': ['product', 'development', 'management', 'roadmap'],
        'design': ['design', 'ui', 'ux', 'visual'],
        'security': ['security', 'compliance', 'risk', 'protection'],
        'operations': ['operations', 'process', 'efficiency', 'optimization']
    }
    
    content_lower = content.lower()
    
    for category, keywords in capability_patterns.items():
        if any(keyword in content_lower for keyword in keywords):
            capabilities.append(category)
    
    # Add specific capabilities based on agent name
    name_lower = agent_name.lower()
    if 'orchestrator' in name_lower:
        capabilities.extend(['workflow_management', 'agent_coordination', 'task_delegation'])
    elif 'marketing' in name_lower:
        capabilities.extend(['campaign_development', 'brand_strategy', 'digital_marketing'])
    elif 'sales' in name_lower:
        capabilities.extend(['lead_generation', 'revenue_optimization', 'customer_acquisition'])
    elif 'content' in name_lower:
        capabilities.extend(['content_creation', 'copywriting', 'creative_strategy'])
    elif 'research' in name_lower:
        capabilities.extend(['data_collection', 'market_research', 'competitive_analysis'])
    elif 'automation' in name_lower:
        capabilities.extend(['process_automation', 'workflow_optimization', 'task_automation'])
    
    # Remove duplicates and limit to top capabilities
    capabilities = list(set(capabilities))[:8]
    
    return capabilities if capabilities else ['general_automation']

def determine_category_from_content(content, file_name):
    """Determine category from content analysis"""
    content_lower = content.lower()
    file_lower = file_name.lower()
    
    # Category mapping based on content and file names
    if any(word in file_lower for word in ['orchestrator', 'coordinator', 'manager']):
        return 'orchestration'
    elif any(word in file_lower for word in ['marketing', 'campaign', 'brand', 'promotion']):
        return 'marketing'
    elif any(word in file_lower for word in ['sales', 'revenue', 'conversion', 'leads']):
        return 'sales'
    elif any(word in file_lower for word in ['content', 'copy', 'writing', 'creative']):
        return 'content'
    elif any(word in file_lower for word in ['research', 'scraper', 'intelligence', 'trends']):
        return 'research'
    elif any(word in file_lower for word in ['automation', 'workflow', 'process']):
        return 'automation'
    elif any(word in file_lower for word in ['analytics', 'data', 'metrics', 'reporting']):
        return 'analytics'
    elif any(word in file_lower for word in ['customer', 'support', 'success', 'service']):
        return 'customer'
    elif any(word in file_lower for word in ['finance', 'accounting', 'budget', 'financial']):
        return 'finance'
    elif any(word in file_lower for word in ['hr', 'hiring', 'training', 'human']):
        return 'hr'
    elif any(word in file_lower for word in ['product', 'development', 'management']):
        return 'product'
    elif any(word in file_lower for word in ['design', 'ui', 'ux', 'visual']):
        return 'design'
    elif any(word in file_lower for word in ['security', 'compliance', 'risk']):
        return 'security'
    elif any(word in file_lower for word in ['operations', 'process', 'efficiency']):
        return 'operations'
    elif any(word in file_lower for word in ['wellness', 'wellbeing', 'health']):
        return 'wellness'
    elif any(word in file_lower for word in ['coach', 'training', 'development']):
        return 'coaching'
    else:
        return 'general'

def determine_icon_for_category(category):
    """Determine icon based on category"""
    icon_map = {
        'orchestration': '🎭',
        'marketing': '📢',
        'sales': '💰',
        'content': '✍️',
        'research': '🔍',
        'automation': '🤖',
        'analytics': '📊',
        'customer': '👥',
        'finance': '💳',
        'hr': '👔',
        'product': '📦',
        'design': '🎨',
        'security': '🔒',
        'operations': '⚙️',
        'wellness': '💚',
        'coaching': '🏆',
        'general': '🤖'
    }
    return icon_map.get(category, '🤖')

def create_comprehensive_agent_data():
    """Create comprehensive agent data for all agents"""
    agents_dir = Path('guild/src/agents')
    agents = []
    
    print("🔍 Scanning all agents...")
    
    # Process all Python files in agents directory
    for file_path in agents_dir.glob('*.py'):
        if file_path.name.startswith('__') or file_path.name == 'base_agent.py':
            continue
            
        print(f"Processing: {file_path.name}")
        agent_info = extract_agent_info_from_file(file_path)
        
        if agent_info:
            agents.append(agent_info)
            print(f"✅ {agent_info['name']} ({agent_info['category']})")
        else:
            print(f"❌ Failed to extract info from {file_path.name}")
    
    print(f"\n📊 Found {len(agents)} agents")
    
    # Group by category
    categories = {}
    for agent in agents:
        category = agent['category']
        if category not in categories:
            categories[category] = []
        categories[category].append(agent)
    
    return agents, categories

def create_frontend_integration(agents, categories):
    """Create frontend integration files"""
    
    # Create comprehensive agent data file
    with open('frontend/src/data/all_agents.js', 'w') as f:
        f.write('// Comprehensive Agent Data - Auto-generated\n')
        f.write('// All 104+ agents integrated for frontend\n\n')
        
        f.write('export const allAgents = ')
        f.write(json.dumps(agents, indent=2))
        f.write(';\n\n')
        
        f.write('export const agentCategories = ')
        f.write(json.dumps(categories, indent=2))
        f.write(';\n\n')
        
        # Create category metadata
        category_metadata = {}
        for category, category_agents in categories.items():
            category_metadata[category] = {
                'name': category.title(),
                'count': len(category_agents),
                'description': get_category_description(category),
                'icon': determine_icon_for_category(category)
            }
        
        f.write('export const categoryMetadata = ')
        f.write(json.dumps(category_metadata, indent=2))
        f.write(';\n\n')
        
        # Create stats
        stats = {
            'total_agents': len(agents),
            'total_categories': len(categories),
            'function_based_agents': len([a for a in agents if a.get('type') == 'function_based']),
            'categories_list': list(categories.keys())
        }
        
        f.write('export const agentStats = ')
        f.write(json.dumps(stats, indent=2))
        f.write(';\n')
    
    print("📁 Created frontend/src/data/all_agents.js")

def get_category_description(category):
    """Get description for category"""
    descriptions = {
        'orchestration': 'Workflow management and multi-agent coordination',
        'marketing': 'Marketing strategy, campaigns, and brand promotion',
        'sales': 'Sales strategy, revenue optimization, and lead generation',
        'content': 'Content creation, copywriting, and creative strategy',
        'research': 'Research, data collection, and competitive intelligence',
        'automation': 'Process automation and workflow optimization',
        'analytics': 'Data analytics, reporting, and business intelligence',
        'customer': 'Customer success, support, and relationship management',
        'finance': 'Financial management, accounting, and budget optimization',
        'hr': 'Human resources, talent management, and training',
        'product': 'Product management and development strategy',
        'design': 'Design, user experience, and visual strategy',
        'security': 'Security, compliance, and risk management',
        'operations': 'Operations management and process optimization',
        'wellness': 'Employee wellness and work-life balance',
        'coaching': 'Coaching, training, and skill development',
        'general': 'General business automation and optimization'
    }
    return descriptions.get(category, 'Business automation and optimization')

def create_backend_registry(agents):
    """Create backend agent registry"""
    registry = {
        'agents': agents,
        'registry_version': '2.0.0',
        'integration_type': 'comprehensive',
        'total_agents': len(agents),
        'last_updated': '2024-01-01T00:00:00Z',
        'notes': 'All agents integrated with frontend communication system'
    }
    
    with open('backend/src/agents/comprehensive_registry.json', 'w') as f:
        json.dump(registry, f, indent=2)
    
    print("📁 Created backend/src/agents/comprehensive_registry.json")

def main():
    """Main function"""
    print("🚀 Creating Comprehensive Agent Integration")
    print("=" * 60)
    
    # Create agent data
    agents, categories = create_comprehensive_agent_data()
    
    # Create frontend integration
    create_frontend_integration(agents, categories)
    
    # Create backend registry
    create_backend_registry(agents)
    
    # Print summary
    print(f"\n🎉 Comprehensive Agent Integration Complete!")
    print(f"   Total Agents: {len(agents)}")
    print(f"   Categories: {len(categories)}")
    print(f"   Categories: {', '.join(categories.keys())}")
    print(f"   Frontend Data: ✅")
    print(f"   Backend Registry: ✅")
    
    return agents, categories

if __name__ == "__main__":
    agents, categories = main()
