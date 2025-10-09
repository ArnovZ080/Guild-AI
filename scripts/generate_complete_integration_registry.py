#!/usr/bin/env python3
"""
Generate Complete Integration Registry from connectorConfigurations.js
Ensures orchestrator knows about all 125 integrations.
"""

import json
import re

def parse_connector_configurations():
    """Parse the connectorConfigurations.js file"""
    with open('frontend/src/components/connectors/connectorConfigurations.js', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract the connectorConfigurations object
    # Find all connector definitions
    integrations = []
    
    # Split by connector definitions - look for pattern "id: 'name',"
    lines = content.split('\n')
    current_connector = None
    in_connector = False
    brace_count = 0
    
    for line in lines:
        # Start of connector
        if re.match(r'\s+\w+:\s*{', line) and not re.match(r'\s+(api_key_instructions|transparency_info|capabilities|use_cases):', line):
            in_connector = True
            brace_count = 1
            current_connector = {}
        
        # Parse fields
        if in_connector and current_connector is not None:
            # Track braces
            brace_count += line.count('{') - line.count('}')
            
            # Extract id
            id_match = re.search(r"id:\s*['\"]([\\w_-]+)['\"]", line)
            if id_match:
                current_connector['id'] = id_match.group(1)
            
            # Extract name
            name_match = re.search(r"name:\s*['\"]([^'\"]+)['\"]", line)
            if name_match:
                current_connector['name'] = name_match.group(1)
            
            # Extract category
            cat_match = re.search(r"category:\s*['\"]([^'\"]+)['\"]", line)
            if cat_match:
                current_connector['category'] = cat_match.group(1)
            
            # Extract description
            desc_match = re.search(r"description:\s*['\"]([^'\"]+)['\"]", line)
            if desc_match and 'description' not in current_connector:
                current_connector['description'] = desc_match.group(1)
            
            # Extract capabilities
            if 'capabilities:' in line:
                cap_match = re.search(r"capabilities:\s*\[([^\]]+)\]", line)
                if cap_match:
                    caps_str = cap_match.group(1)
                    capabilities = re.findall(r"['\"]([^'\"]+)['\"]", caps_str)
                    current_connector['capabilities'] = capabilities
            
            # End of connector
            if brace_count == 0 and 'id' in current_connector:
                # Skip category entries
                if current_connector['id'] not in [
                    'all', 'advertising', 'project_management', 'payments', 'accounting', 
                    'crm', 'social_media', 'communication', 'productivity', 'automation',
                    'development', 'ecommerce', 'design', 'support', 'human_os', 'analytics'
                ]:
                    integrations.append(current_connector)
                current_connector = None
                in_connector = False
    
    return integrations


def generate_integration_registry_code(integrations):
    """Generate Python code for integration registry"""
    
    # Group by category
    categories = {}
    for integration in integrations:
        cat = integration.get('category', 'other')
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(integration)
    
    output = []
    output.append('"""')
    output.append('Complete Integration Capability Registry - Auto-generated')
    output.append(f'Total Integrations: {len(integrations)}')
    output.append('"""')
    output.append('')
    output.append('from dataclasses import dataclass')
    output.append('from typing import List, Dict, Any, Optional')
    output.append('from enum import Enum')
    output.append('')
    output.append('class IntegrationCategory(Enum):')
    output.append('    """Integration categories"""')
    for cat in sorted(set(i.get('category', 'other') for i in integrations)):
        cat_const = cat.upper().replace(' ', '_').replace('&', 'AND')
        output.append(f'    {cat_const} = "{cat}"')
    output.append('')
    output.append('@dataclass')
    output.append('class IntegrationCapability:')
    output.append('    """Integration capability definition"""')
    output.append('    integration_id: str')
    output.append('    integration_name: str')
    output.append('    category: IntegrationCategory')
    output.append('    capabilities: List[str]')
    output.append('    data_provides: List[str]')
    output.append('    actions_available: List[str]')
    output.append('    required_credentials: List[str]')
    output.append('    api_documentation: str = ""')
    output.append('    description: str = ""')
    output.append('')
    output.append('# Complete Integration Registry')
    output.append('INTEGRATION_CAPABILITIES = {')
    
    for category in sorted(categories.keys()):
        output.append(f'    # {category.upper()}')
        for integration in sorted(categories[category], key=lambda x: x.get('id', '')):
            int_id = integration.get('id', 'unknown')
            int_name = integration.get('name', int_id.title())
            int_cat = integration.get('category', 'other')
            int_desc = integration.get('description', f'{int_name} integration')[:200]
            capabilities = integration.get('capabilities', ['data_sync'])
            
            # Map category to enum
            cat_enum = int_cat.upper().replace(' ', '_').replace('&', 'AND')
            
            output.append(f'    "{int_id}": IntegrationCapability(')
            output.append(f'        integration_id="{int_id}",')
            output.append(f'        integration_name="{int_name}",')
            output.append(f'        category=IntegrationCategory.{cat_enum},')
            output.append(f'        capabilities={capabilities},')
            output.append(f'        data_provides={capabilities},')
            output.append(f'        actions_available=["sync", "read", "write"],')
            output.append(f'        required_credentials=["api_key"],')
            output.append(f'        description="{int_desc}"')
            output.append(f'    ),')
        output.append('')
    
    output.append('}')
    output.append('')
    output.append(f'# Total Integrations: {len(integrations)}')
    
    return '\n'.join(output)


def main():
    print("="*80)
    print("GENERATING COMPLETE INTEGRATION REGISTRY")
    print("="*80)
    
    print("\n📊 Parsing connectorConfigurations.js...")
    integrations = parse_connector_configurations()
    print(f"✅ Found {len(integrations)} integrations")
    
    print("\n📊 Generating Python registry code...")
    code = generate_integration_registry_code(integrations)
    
    # Save to file
    output_path = 'guild/src/core/complete_integration_registry.py'
    with open(output_path, 'w') as f:
        f.write(code)
    
    print(f"✅ Generated {output_path}")
    
    # Save JSON for reference
    with open('integrations_complete.json', 'w') as f:
        json.dump(integrations, f, indent=2)
    print(f"✅ Saved integration list to integrations_complete.json")
    
    # Print summary
    print("\n" + "="*80)
    print("INTEGRATION SUMMARY")
    print("="*80)
    
    categories = {}
    for integration in integrations:
        cat = integration.get('category', 'other')
        categories[cat] = categories.get(cat, 0) + 1
    
    for cat, count in sorted(categories.items()):
        print(f"{cat}: {count} integrations")
    
    print(f"\nTotal: {len(integrations)} integrations ready for orchestrator use")

if __name__ == "__main__":
    main()

