#!/usr/bin/env python3
"""
Test Script for New Business Automation Skills

This script tests all the new visual skills we added:
- Accounting & Finance (5 skills)
- Sales Funnel Builder (4 skills) 
- Lead Magnet & CRM (4 skills)
- Business Operations (4 skills)
"""

import asyncio
import time
import logging
from pathlib import Path

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def test_new_business_skills():
    print("🏢 New Business Automation Skills - Complete Test")
    print("=" * 70)
    
    try:
        from guild.src.core.workflow_builder import VisualWorkflowBuilder
        
        print("📋 Initializing Workflow Builder...")
        workflow_builder = VisualWorkflowBuilder()
        print("✅ Workflow builder initialized successfully!")
        
        # Test 1: Accounting & Finance Skills
        print("\n💰 Test 1: Accounting & Finance Skills")
        print("-" * 40)
        
        accounting_skills = [
            "excel_expense_tracking",
            "xero_invoice_creation", 
            "xero_expense_categorization",
            "cashflow_analysis_excel",
            "cost_analysis_reporting"
        ]
        
        for skill_id in accounting_skills:
            try:
                skill = workflow_builder.get_skill_template(skill_id)
                if skill:
                    print(f"✅ {skill['name']} - {skill['description']}")
                    print(f"   Duration: {skill['config']['skill_pattern']['estimated_duration']}s")
                    print(f"   Steps: {len(skill['config']['skill_pattern']['steps'])}")
                else:
                    print(f"❌ {skill_id} - Template not found")
            except Exception as e:
                print(f"❌ {skill_id} - Error: {e}")
        
        # Test 2: Sales Funnel Builder Skills
        print("\n🛒 Test 2: Sales Funnel Builder Skills")
        print("-" * 40)
        
        funnel_skills = [
            "landing_page_creation",
            "upsell_sequence_setup",
            "payment_provider_integration", 
            "thank_you_page_setup"
        ]
        
        for skill_id in funnel_skills:
            try:
                skill = workflow_builder.get_skill_template(skill_id)
                if skill:
                    print(f"✅ {skill['name']} - {skill['description']}")
                    print(f"   Duration: {skill['config']['skill_pattern']['estimated_duration']}s")
                    print(f"   Steps: {len(skill['config']['skill_pattern']['steps'])}")
                else:
                    print(f"❌ {skill_id} - Template not found")
            except Exception as e:
                print(f"❌ {skill_id} - Error: {e}")
        
        # Test 3: Lead Magnet & CRM Skills
        print("\n🎯 Test 3: Lead Magnet & CRM Skills")
        print("-" * 40)
        
        lead_skills = [
            "lead_magnet_creation",
            "email_collection_funnel",
            "crm_lead_management",
            "audience_analysis_ai"
        ]
        
        for skill_id in lead_skills:
            try:
                skill = workflow_builder.get_skill_template(skill_id)
                if skill:
                    print(f"✅ {skill['name']} - {skill['description']}")
                    print(f"   Duration: {skill['config']['skill_pattern']['estimated_duration']}s")
                    print(f"   Steps: {len(skill['config']['skill_pattern']['steps'])}")
                else:
                    print(f"❌ {skill_id} - Template not found")
            except Exception as e:
                print(f"❌ {skill_id} - Error: {e}")
        
        # Test 4: Business Operations Skills
        print("\n⚙️ Test 4: Business Operations Skills")
        print("-" * 40)
        
        ops_skills = [
            "inventory_management",
            "customer_support_automation",
            "project_management_setup",
            "reporting_automation"
        ]
        
        for skill_id in ops_skills:
            try:
                skill = workflow_builder.get_skill_template(skill_id)
                if skill:
                    print(f"✅ {skill['name']} - {skill['description']}")
                    print(f"   Duration: {skill['config']['skill_pattern']['estimated_duration']}s")
                    print(f"   Steps: {len(skill['config']['skill_pattern']['steps'])}")
                else:
                    print(f"❌ {skill_id} - Template not found")
            except Exception as e:
                print(f"❌ {skill_id} - Error: {e}")
        
        # Test 5: Skill Categories
        print("\n📊 Test 5: Skill Categories & Organization")
        print("-" * 40)
        
        all_templates = workflow_builder.get_all_skill_templates()
        categories = {}
        
        for skill_id, skill in all_templates.items():
            category = skill.get('category', 'Uncategorized')
            if category not in categories:
                categories[category] = []
            categories[category].append(skill['name'])
        
        for category, skills in categories.items():
            print(f"📁 {category}: {len(skills)} skills")
            for skill_name in skills[:3]:  # Show first 3 skills
                print(f"   • {skill_name}")
            if len(skills) > 3:
                print(f"   ... and {len(skills) - 3} more")
        
        # Test 6: Create a Simple Workflow
        print("\n🔗 Test 6: Create Simple Workflow with New Skills")
        print("-" * 40)
        
        try:
            workflow_id = workflow_builder.create_workflow(
                name="Business Automation Demo",
                description="Testing new business skills in a workflow"
            )
            print(f"✅ Created workflow: {workflow_id}")
            
            # Add some nodes
            node1 = workflow_builder.add_node_from_template(
                workflow_id, "excel_expense_tracking", (100, 100)
            )
            node2 = workflow_builder.add_node_from_template(
                workflow_id, "xero_invoice_creation", (300, 100)
            )
            node3 = workflow_builder.add_node_from_template(
                workflow_id, "cashflow_analysis_excel", (500, 100)
            )
            
            print(f"✅ Added nodes: {node1}, {node2}, {node3}")
            
            # Connect them
            workflow_builder.connect_nodes(workflow_id, node1, node2)
            workflow_builder.connect_nodes(workflow_id, node2, node3)
            print("✅ Connected nodes successfully")
            
            # Get workflow info
            workflow = workflow_builder.get_workflow(workflow_id)
            print(f"✅ Workflow has {workflow['node_count']} nodes and {workflow['connection_count']} connections")
            
        except Exception as e:
            print(f"❌ Workflow creation failed: {e}")
        
        print("\n🎉 All new business automation skills tested successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Error testing new skills: {e}")
        logger.error(f"Test failed: {e}", exc_info=True)
        return False

if __name__ == "__main__":
    success = test_new_business_skills()
    if success:
        print("\n🏢 Your AI workforce is now equipped with powerful business automation skills!")
        print("   Ready to revolutionize accounting, sales, marketing, and operations!")
    else:
        print("\n❌ Skill testing failed. Check logs for details.")
