#!/usr/bin/env python3
"""
Integrate All 104+ Agents into Frontend
Extracts agent information and creates frontend integration
"""

import os
import json
import re
from pathlib import Path

def extract_agent_info(file_path):
    """Extract agent information from Python file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extract class name
        class_match = re.search(r'class\s+(\w+)\s*\(', content)
        if not class_match:
            return None
        
        class_name = class_match.group(1)
        
        # Extract agent ID (usually in __init__ method)
        agent_id_match = re.search(r'agent_id\s*=\s*["\']([^"\']+)["\']', content)
        agent_id = agent_id_match.group(1) if agent_id_match else class_name.lower().replace('_agent', '').replace('agent', '')
        
        # Extract name
        name_match = re.search(r'name\s*=\s*["\']([^"\']+)["\']', content)
        name = name_match.group(1) if name_match else class_name.replace('_', ' ').title()
        
        # Extract description
        desc_match = re.search(r'description\s*=\s*["\']([^"\']+)["\']', content)
        description = desc_match.group(1) if desc_match else f"{name} for business automation and optimization"
        
        # Extract capabilities
        capabilities_match = re.search(r'capabilities\s*=\s*\[(.*?)\]', content, re.DOTALL)
        capabilities = []
        if capabilities_match:
            caps_text = capabilities_match.group(1)
            caps = re.findall(r'["\']([^"\']+)["\']', caps_text)
            capabilities = caps
        
        # Determine category based on agent name
        category = determine_category(agent_id, name)
        
        # Determine icon
        icon = determine_icon(agent_id, category)
        
        return {
            'agent_id': agent_id,
            'name': name,
            'description': description,
            'capabilities': capabilities,
            'category': category,
            'icon': icon,
            'class_name': class_name,
            'file_name': os.path.basename(file_path)
        }
        
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return None

def determine_category(agent_id, name):
    """Determine agent category based on ID and name"""
    category_map = {
        # Executive & Strategy
        'chief_of_staff': 'executive',
        'business_strategist': 'strategy',
        'strategy_agent': 'strategy',
        'board_advisor': 'executive',
        'scenario_planner': 'strategy',
        'strategic_sounding_board': 'strategy',
        
        # Content & Marketing
        'content_strategist': 'content',
        'content_repurposer': 'content',
        'copywriter': 'content',
        'marketing_agent': 'marketing',
        'enhanced_marketing': 'marketing',
        'event_marketing': 'marketing',
        'paid_ads': 'marketing',
        'seo_agent': 'marketing',
        'pr_outreach': 'marketing',
        'influencer_outreach': 'marketing',
        'brand_strategist': 'brand',
        
        # Sales & Revenue
        'outbound_sales': 'sales',
        'sales_funnel': 'sales',
        'upsell_cross_sell': 'sales',
        'pricing_agent': 'sales',
        'pricing_intelligence': 'sales',
        'affiliate_partnerships': 'sales',
        'partnerships_agent': 'sales',
        'churn_predictor': 'sales',
        
        # Customer & Support
        'customer_success': 'customer',
        'customer_support': 'customer',
        'onboarding_agent': 'customer',
        'feedback_collector': 'customer',
        'community_manager': 'customer',
        'community_connector': 'customer',
        
        # Operations & HR
        'hr_agent': 'hr',
        'hiring_hr': 'hr',
        'project_manager': 'operations',
        'automation_agent': 'automation',
        'unified_automation': 'automation',
        'desktop_automation': 'automation',
        'crm_automation': 'automation',
        'sop_agent': 'operations',
        'training_agent': 'training',
        'skill_development': 'training',
        'vision_enhanced_training': 'training',
        
        # Finance & Accounting
        'accounting_agent': 'finance',
        'bookkeeping': 'finance',
        'tax_advisor': 'finance',
        'expense_optimizer': 'finance',
        'investor_relations': 'finance',
        'investor_update': 'finance',
        'grant_funding': 'finance',
        'risk_management': 'finance',
        
        # Research & Analytics
        'research_agent': 'research',
        'research_scraper': 'research',
        'scraper_agent': 'research',
        'competitive_intelligence': 'research',
        'market_trends': 'research',
        'trend_spotter': 'research',
        'lead_personalization': 'research',
        'icp_evolution': 'research',
        'supplier_research': 'research',
        
        # Technology & Development
        'product_manager': 'product',
        'design_qa': 'design',
        'ux_ui_tester': 'design',
        'image_generation': 'creative',
        'video_editor': 'creative',
        'voice_agent': 'creative',
        'voice_persona': 'creative',
        'visual_agent': 'creative',
        
        # Management & Leadership
        'orchestrator_agent': 'orchestration',
        'agent_evaluator': 'meta',
        'knowledge_updater': 'meta',
        'orchestration_tuner': 'meta',
        'scalability_agent': 'meta',
        'security_agent': 'security',
        'compliance_agent': 'compliance',
        'storage_agent': 'infrastructure',
        'data_hygiene': 'infrastructure',
        
        # Wellness & Coaching
        'wellness_agent': 'wellness',
        'wellbeing_agent': 'wellness',
        'wellbeing_workload': 'wellness',
        'well_being': 'wellness',
        'motivation_coach': 'coaching',
        'accountability_coach': 'coaching',
        
        # Communication & Tools
        'calendar_harmony': 'communication',
        'meeting_notes': 'communication',
        'telephony_voice': 'communication',
        'multi_channel_inbox': 'communication',
        'connector_agent': 'integration',
        'automation_bridge': 'integration',
        
        # Specialized
        'contract_analyzer': 'legal',
        'vendor_management': 'procurement',
        'outsourcing_agent': 'procurement',
        'localization_agent': 'localization',
        'okr_goal_tracking': 'goals',
        'celebration_narrator': 'culture',
        'ad_performance_optimizer': 'advertising',
        'enhanced_campaign': 'advertising'
    }
    
    for key, category in category_map.items():
        if key in agent_id.lower() or key.replace('_', ' ') in name.lower():
            return category
    
    return 'general'

def determine_icon(agent_id, category):
    """Determine icon based on agent ID and category"""
    icon_map = {
        # Executive & Strategy
        'executive': '🎯',
        'strategy': '🧠',
        'orchestration': '🎭',
        
        # Content & Marketing
        'content': '✍️',
        'marketing': '📢',
        'brand': '🏷️',
        'advertising': '📺',
        
        # Sales & Revenue
        'sales': '💰',
        'customer': '👥',
        
        # Operations
        'operations': '⚙️',
        'automation': '🤖',
        'hr': '👔',
        'training': '🎓',
        
        # Finance
        'finance': '💳',
        'research': '🔍',
        'analytics': '📊',
        
        # Technology
        'product': '📦',
        'design': '🎨',
        'creative': '🎬',
        'technology': '💻',
        
        # Meta & Infrastructure
        'meta': '🔮',
        'security': '🔒',
        'compliance': '📋',
        'infrastructure': '🏗️',
        
        # Wellness & Coaching
        'wellness': '💚',
        'coaching': '🏆',
        
        # Communication
        'communication': '💬',
        'integration': '🔗',
        
        # Specialized
        'legal': '⚖️',
        'procurement': '🛒',
        'localization': '🌍',
        'goals': '🎯',
        'culture': '🎉',
        
        'general': '🤖'
    }
    
    return icon_map.get(category, '🤖')

def main():
    """Main function to integrate all agents"""
    agents_dir = Path('guild/src/agents')
    agents = []
    
    print("🔍 Scanning for agents...")
    
    # Process all Python files in agents directory
    for file_path in agents_dir.glob('*.py'):
        if file_path.name.startswith('__'):
            continue
            
        print(f"Processing: {file_path.name}")
        agent_info = extract_agent_info(file_path)
        
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
    
    # Create frontend data file
    frontend_data = {
        'agents': agents,
        'categories': categories,
        'total_agents': len(agents),
        'categories_count': len(categories)
    }
    
    # Write to frontend data file
    with open('frontend/src/data/all_agents.js', 'w') as f:
        f.write('// Auto-generated agent data\n')
        f.write('export const allAgents = ')
        f.write(json.dumps(agents, indent=2))
        f.write(';\n\n')
        
        f.write('export const agentCategories = ')
        f.write(json.dumps(categories, indent=2))
        f.write(';\n\n')
        
        f.write('export const agentStats = ')
        f.write(json.dumps({
            'total': len(agents),
            'categories': len(categories),
            'categories_list': list(categories.keys())
        }, indent=2))
        f.write(';\n')
    
    print(f"\n📁 Created frontend/src/data/all_agents.js")
    print(f"📊 Categories: {', '.join(categories.keys())}")
    
    # Create backend agent registry
    backend_data = {
        'agents': agents,
        'registry_version': '1.0.0',
        'last_updated': '2024-01-01T00:00:00Z'
    }
    
    with open('backend/src/agents/agent_registry.json', 'w') as f:
        json.dump(backend_data, f, indent=2)
    
    print(f"📁 Created backend/src/agents/agent_registry.json")
    
    # Create summary
    print(f"\n🎉 Agent Integration Summary:")
    print(f"   Total Agents: {len(agents)}")
    print(f"   Categories: {len(categories)}")
    print(f"   Frontend Data: ✅")
    print(f"   Backend Registry: ✅")
    
    return agents, categories

if __name__ == "__main__":
    agents, categories = main()
