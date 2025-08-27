from guild.core.models.schemas import OutcomeContract
from typing import Dict, Any, List, Callable
from guild.src.agents import (
    research_agent,
    business_strategist,
    content_strategist,
    scraper_agent,
    judge_agent,
    seo_agent,
    paid_ads_agent,
    copywriter_agent,
    sales_funnel_agent,
    project_manager_agent,
    hr_agent
)
import json

def compile_contract_to_dag(contract: OutcomeContract) -> Dict[str, Any]:
    """
    Compiles an OutcomeContract into a Directed Acyclic Graph (DAG) definition.
    """
    dag = {"nodes": []}
    dependencies = []

    # --- High-Level Strategy Agents ---
    if "strategy" in contract.objective.lower():
        dag["nodes"].append({"id": "business-strategy", "name": "Business Strategist Agent", "dependencies": list(dependencies)})
        dependencies.append("business-strategy")
    if "sales funnel" in contract.objective.lower():
        dag["nodes"].append({"id": "sales-funnel-design", "name": "Sales Funnel Agent", "dependencies": list(dependencies)})
        dependencies.append("sales-funnel-design")
    if "project plan" in contract.objective.lower():
        dag["nodes"].append({"id": "project-plan", "name": "Project Manager Agent", "dependencies": list(dependencies)})
        dependencies.append("project-plan")

    # --- Research & Data Gathering Agents ---
    if "scrape" in contract.objective.lower() or "find leads" in contract.objective.lower():
        dag["nodes"].append({"id": "scrape-leads", "name": "Scraper Agent", "task": contract.objective, "dependencies": list(dependencies)})
        dependencies.append("scrape-leads")
    else:
        dag["nodes"].append({"id": "research", "name": "Research Agent", "task": f"Conduct research on '{contract.objective}'.", "dependencies": list(dependencies)})
        dependencies.append("research")

    # --- Content & Marketing Planning ---
    web_content_deliverables = ['blog_post', 'sales_page', 'landing_page', 'ad_copy']
    if any(d in contract.deliverables for d in web_content_deliverables):
        dag["nodes"].append({"id": "seo-analysis", "name": "SEO Agent", "task": f"Perform SEO analysis for '{contract.objective}'", "dependencies": list(dependencies)})
        dependencies.append("seo-analysis")

    dag["nodes"].append({"id": "content-strategy", "name": "Content Strategist Agent", "dependencies": list(dependencies)})
    dependencies.append("content-strategy")

    if "ad_copy" in contract.deliverables:
        dag["nodes"].append({"id": "paid-ads-strategy", "name": "Paid Ads Agent", "dependencies": list(dependencies)})
        dependencies.append("paid-ads-strategy")

    # --- Content Creation & HR ---
    dag["nodes"].append({"id": "content-creation", "name": "Content Creation Team (Copywriter)", "dependencies": list(dependencies)})
    if "job description" in contract.objective.lower():
         dag["nodes"].append({"id": "hr-job-description", "name": "HR Agent", "dependencies": list(dependencies)})

    return dag


def execute_dag(dag: Dict[str, Any], contract: OutcomeContract, save_step_callback: Callable):
    """
    Executes a DAG by processing its nodes sequentially and saving each step's result.
    """
    print("--- Starting DAG Execution ---")
    if not dag.get("nodes"):
        print("DAG has no nodes to execute.")
        return

    execution_context = {}

    for node in dag["nodes"]:
        node_id = node.get("id")
        agent_name = node.get("name", "Unknown Agent")
        output_data = {}

        print(f"\n[Executing Node: {node_id}]")
        print(f"  Agent: {agent_name}")

        try:
            # --- STRATEGY AGENTS ---
            if "Business Strategist" in agent_name:
                prompt = f"Objective: {contract.objective}, Audience: {contract.target_audience}"
                output_data = business_strategist.generate_business_strategy(
                    objective=contract.objective, target_audience=contract.target_audience, prompt=prompt)

            elif "Sales Funnel Agent" in agent_name:
                prompt = f"Objective: {contract.objective}, Product: {contract.context}"
                output_data = sales_funnel_agent.design_sales_funnel(
                    objective=contract.objective, product_description=contract.context, prompt=prompt)

            elif "Project Manager Agent" in agent_name:
                prompt = f"Objective: {contract.objective}, Deliverables: {contract.deliverables}"
                output_data = project_manager_agent.create_project_plan(
                    objective=contract.objective, deliverables=contract.deliverables, prompt=prompt)

            # --- RESEARCH & DATA ---
            elif "Research Agent" in agent_name:
                output_data = research_agent.search_web(query=node.get("task"))
            elif "Scraper Agent" in agent_name:
                output_data = {"leads": scraper_agent.scrape_leads(query=node.get("task"))}

            # --- MARKETING & CONTENT ---
            elif "SEO Agent" in agent_name:
                output_data = seo_agent.analyze_seo_opportunity(topic=contract.objective)

            elif "Content Strategist" in agent_name:
                seo_results = execution_context.get("seo-analysis", {})
                prompt = f"Objective: {contract.objective}, SEO Insights: {json.dumps(seo_results)}"
                output_data = content_strategist.generate_content_plan(
                    objective=contract.objective, deliverables=contract.deliverables, prompt=prompt)

            elif "Paid Ads Agent" in agent_name:
                prompt = f"Objective: {contract.objective}, Audience: {contract.target_audience}"
                output_data = paid_ads_agent.generate_ad_campaign(
                    objective=contract.objective, target_audience=contract.target_audience, prompt=prompt)

            elif "Content Creation" in agent_name:
                plan = execution_context.get("content-strategy", {})
                prompt = f"Product: {contract.objective}, Plan: {json.dumps(plan)}"
                output_data = copywriter_agent.generate_ad_copy(
                    product_description=contract.objective, key_messaging=[], target_channel="Meta", prompt=prompt)

            # --- OPERATIONS ---
            elif "HR Agent" in agent_name:
                prompt = f"Role: {contract.objective}, Responsibilities: {contract.context}"
                output_data = hr_agent.draft_job_description(
                    role=contract.objective, key_responsibilities=[contract.context], prompt=prompt)

            # --- Save Step ---
            save_step_callback(node_id=node_id, agent_name=agent_name, output_data=output_data, status="completed")
            execution_context[node_id] = output_data
            print(f"  ... {agent_name} finished task successfully.")

        except Exception as e:
            error_message = f"Agent {agent_name} failed on node {node_id}: {e}"
            print(f"  [ERROR] {error_message}")
            save_step_callback(node_id=node_id, agent_name=agent_name, output_data={"error": error_message}, status="failed")
            print("--- Halting DAG Execution due to error ---")
            raise

    print("\n--- DAG Execution Finished ---")

    if contract.zapier_webhook_url:
        from guild.src.integrations import zapier
        final_result = {"status": "success", "contract": contract.dict(), "results": execution_context}
        try:
            zapier.push_to_zapier(contract.zapier_webhook_url, final_result)
        except Exception as e:
            print(f"Orchestrator: Failed to push to Zapier. Error: {e}")
