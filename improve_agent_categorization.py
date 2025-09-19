#!/usr/bin/env python3
"""
Script to improve agent categorization based on the repo-specific rules.
"""

import json
from typing import Dict, List, Any

def recategorize_agents(agents: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Recategorize agents based on the repo-specific rules."""
    
    # Define the proper categories from the repo rules
    categories = {
        "Executive Layer": {
            "keywords": ["chief", "strategy", "business_strategist", "board_advisor"],
            "icon": "👑"
        },
        "Content Creation": {
            "keywords": ["content", "copywriter", "writer", "social_media", "ad_copy", "brief_generator"],
            "icon": "📝"
        },
        "Research & Data": {
            "keywords": ["research", "scraper", "data", "analytics", "lead_personalization", "data_enrichment"],
            "icon": "🔍"
        },
        "Financial & Business": {
            "keywords": ["accounting", "bookkeeping", "investor", "pricing", "financial", "expense"],
            "icon": "💰"
        },
        "Creative & Media": {
            "keywords": ["image", "voice", "video", "document_processing", "design", "creative"],
            "icon": "🎨"
        },
        "Automation": {
            "keywords": ["automation", "visual", "crm_automation", "unified_automation"],
            "icon": "🤖"
        },
        "Evaluator League": {
            "keywords": ["judge", "fact_checker", "brand_checker", "seo_evaluator", "evaluator"],
            "icon": "⚖️"
        },
        "Orchestration & Management": {
            "keywords": ["workflow", "orchestrator", "pre_flight", "contract_compiler", "quality_controller"],
            "icon": "🎯"
        },
        "Business Operations": {
            "keywords": ["project_manager", "hr", "training", "crm", "outbound_sales"],
            "icon": "🏢"
        },
        "Human & Psychological": {
            "keywords": ["wellness", "learning", "community", "celebration", "motivation", "accountability"],
            "icon": "🧠"
        },
        "Meta-Agents": {
            "keywords": ["agent_evaluator", "knowledge_updater", "security", "scalability", "orchestration_tuner"],
            "icon": "🔧"
        },
        "Campaign & Marketing": {
            "keywords": ["campaign", "marketing", "enhanced_campaign", "pricing_intelligence"],
            "icon": "🚀"
        }
    }
    
    def categorize_agent(agent: Dict[str, Any]) -> str:
        """Categorize an agent based on its ID and name."""
        agent_id = agent["id"].lower()
        agent_name = agent["name"].lower()
        
        # Check each category
        for category, config in categories.items():
            for keyword in config["keywords"]:
                if keyword.lower() in agent_id or keyword.lower() in agent_name:
                    return category
        
        # Default categorization based on content
        if "financial" in agent_id or "accounting" in agent_id or "bookkeeping" in agent_id:
            return "Financial & Business"
        elif "marketing" in agent_id or "content" in agent_id or "copywriter" in agent_id:
            return "Content Creation"
        elif "research" in agent_id or "data" in agent_id or "analytics" in agent_id:
            return "Research & Data"
        elif "automation" in agent_id or "workflow" in agent_id:
            return "Automation"
        elif "creative" in agent_id or "design" in agent_id or "video" in agent_id or "image" in agent_id:
            return "Creative & Media"
        elif "wellness" in agent_id or "learning" in agent_id or "community" in agent_id:
            return "Human & Psychological"
        else:
            return "Business Operations"
    
    # Recategorize all agents
    for agent in agents:
        new_category = categorize_agent(agent)
        agent["type"] = new_category
        agent["icon"] = categories.get(new_category, {}).get("icon", "🤖")
    
    return agents

def improve_agent_descriptions(agents: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Improve agent descriptions based on their actual capabilities."""
    
    # Define better descriptions based on agent types
    description_improvements = {
        "accounting_agent": "Comprehensive financial data processing, reporting, and analysis for business intelligence and compliance.",
        "marketing_agent": "Strategic marketing campaign development, brand positioning, and multi-channel marketing optimization.",
        "research_agent": "Advanced web research, data gathering, and market intelligence for informed decision-making.",
        "wellness_agent": "Holistic wellness coaching, stress management, and work-life balance optimization.",
        "automation_agent": "Process automation, workflow optimization, and intelligent task delegation.",
        "seo_agent": "Search engine optimization, content strategy, and organic traffic growth.",
        "content_strategist": "Comprehensive content strategy, calendar development, and multi-platform content planning.",
        "lead_personalization_agent": "Sales psychology-based outreach, personalized messaging, and conversion optimization.",
        "orchestrator_agent": "Multi-agent coordination, workflow orchestration, and intelligent task distribution.",
        "judge_agent": "Quality assessment, evaluation rubrics, and performance scoring for deliverables.",
        "chief_of_staff_agent": "Executive support, strategic coordination, and high-level task prioritization.",
        "business_strategist_agent": "Strategic planning, market analysis, and long-term business development.",
        "customer_support_agent": "Customer service automation, issue resolution, and relationship management.",
        "sales_funnel_agent": "Sales process optimization, funnel analysis, and conversion rate improvement.",
        "project_manager_agent": "Project planning, execution tracking, and resource management.",
        "hr_agent": "Human resources management, talent acquisition, and employee development.",
        "training_agent": "Training material creation, skill development, and knowledge transfer.",
        "crm_agent": "Customer relationship management, lead tracking, and sales pipeline optimization.",
        "outbound_sales_agent": "Proactive sales outreach, lead generation, and conversion optimization.",
        "image_generation_agent": "AI-powered image creation, visual content generation, and creative asset production.",
        "voice_agent": "Text-to-speech, speech-to-text, and voice interaction capabilities.",
        "video_editor_agent": "Video creation, editing, and multimedia content production.",
        "document_processing_agent": "Multi-format document handling, processing, and content extraction.",
        "unified_automation_agent": "Visual and web automation, cross-platform task automation.",
        "visual_automation_tool": "Computer vision-based UI automation and desktop task automation.",
        "crm_automation_agent": "Customer relationship management automation and workflow optimization.",
        "fact_checker_agent": "Information accuracy validation, source verification, and content fact-checking.",
        "brand_checker_agent": "Brand compliance verification, consistency checking, and guideline enforcement.",
        "seo_evaluator_agent": "SEO performance analysis, optimization recommendations, and search ranking improvement.",
        "workflow_manager_agent": "Multi-agent coordination, workflow optimization, and task orchestration.",
        "pre_flight_planner_agent": "Workflow planning, approval processes, and execution preparation.",
        "contract_compiler_agent": "Outcome contract processing, agreement compilation, and legal document handling.",
        "quality_controller_agent": "Iterative improvement management, quality assurance, and performance optimization.",
        "agent_evaluator": "Performance monitoring, optimization recommendations, and system health analysis.",
        "knowledge_updater": "Continuous learning, knowledge management, and information integration.",
        "security_agent": "System security monitoring, threat detection, and access control management.",
        "scalability_agent": "Performance monitoring, capacity planning, and scaling optimization.",
        "orchestration_tuner": "Workflow optimization, efficiency tuning, and system performance enhancement.",
        "enhanced_campaign_agent": "Advanced campaign management, direct API access, and autonomous optimization.",
        "pricing_intelligence_agent": "Dynamic pricing strategy, competitive analysis, and pricing optimization."
    }
    
    # Apply description improvements
    for agent in agents:
        agent_id = agent["id"]
        if agent_id in description_improvements:
            agent["description"] = description_improvements[agent_id]
        elif agent["description"] == "AI agent for business automation and optimization.":
            # Generate a better default description
            agent_type = agent["type"]
            if agent_type == "Financial & Business":
                agent["description"] = "Financial analysis, reporting, and business intelligence for informed decision-making."
            elif agent_type == "Content Creation":
                agent["description"] = "Content strategy, creation, and optimization for brand growth and engagement."
            elif agent_type == "Research & Data":
                agent["description"] = "Data analysis, market research, and intelligence gathering for strategic insights."
            elif agent_type == "Automation":
                agent["description"] = "Process automation, workflow optimization, and intelligent task delegation."
            elif agent_type == "Creative & Media":
                agent["description"] = "Creative content production, media generation, and visual asset creation."
            elif agent_type == "Human & Psychological":
                agent["description"] = "Wellness support, learning facilitation, and psychological optimization."
            elif agent_type == "Evaluator League":
                agent["description"] = "Quality assessment, evaluation, and performance optimization."
            elif agent_type == "Orchestration & Management":
                agent["description"] = "Workflow orchestration, task management, and system coordination."
            elif agent_type == "Business Operations":
                agent["description"] = "Business operations management, process optimization, and operational excellence."
            elif agent_type == "Meta-Agents":
                agent["description"] = "System monitoring, optimization, and meta-level business intelligence."
            elif agent_type == "Campaign & Marketing":
                agent["description"] = "Advanced campaign management, marketing optimization, and growth strategies."
    
    return agents

def main():
    """Main function to improve agent categorization."""
    # Load the existing data
    with open("agent_marketplace_data.json", "r", encoding="utf-8") as f:
        data = json.load(f)
    
    agents = data["agents"]
    
    # Improve categorization and descriptions
    agents = recategorize_agents(agents)
    agents = improve_agent_descriptions(agents)
    
    # Regroup by type
    agents_by_type = {}
    for agent in agents:
        agent_type = agent["type"]
        if agent_type not in agents_by_type:
            agents_by_type[agent_type] = []
        agents_by_type[agent_type].append(agent)
    
    # Update the data structure
    data["agents"] = agents
    data["categories"] = list(agents_by_type.keys())
    data["agents_by_type"] = agents_by_type
    
    # Save the improved data
    with open("agent_marketplace_data.json", "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"Improved categorization for {len(agents)} agents:")
    for category, category_agents in agents_by_type.items():
        print(f"  {category}: {len(category_agents)} agents")
    
    # Print sample of each category
    print("\nSample agents by category:")
    for category, category_agents in agents_by_type.items():
        print(f"\n{category}:")
        for agent in category_agents[:3]:  # Show first 3 in each category
            print(f"  - {agent['name']}: {agent['description']}")

if __name__ == "__main__":
    main()

