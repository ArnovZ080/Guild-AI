from guild.core.models.schemas import OutcomeContract
from typing import Dict, Any, List, Callable
from guild.src.agents import research_agent, business_strategist, content_strategist, scraper_agent, judge_agent, seo_agent
import json

def compile_contract_to_dag(contract: OutcomeContract) -> Dict[str, Any]:
    """
    Compiles an OutcomeContract into a Directed Acyclic Graph (DAG) definition.
    """
    dag = {"nodes": []}
    dependencies = []

    if "launch" in contract.objective.lower() or "strategy" in contract.objective.lower():
        dag["nodes"].append({
            "id": "business-strategy", "type": "strategist", "name": "Business Strategist Agent",
            "task": f"Create a high-level business strategy for the objective: '{contract.objective}'. Consider the target audience: {contract.target_audience}",
            "dependencies": list(dependencies)
        })
        dependencies.append("business-strategy")

    if "scrape" in contract.objective.lower() or "find leads" in contract.objective.lower():
        dag["nodes"].append({
            "id": "scrape-leads", "type": "workforce", "name": "Scraper Agent",
            "task": contract.objective, "dependencies": list(dependencies)
        })
        dependencies.append("scrape-leads")
    else:
        research_task = f"Conduct research based on the contract objective: '{contract.objective}'."
        if contract.target_audience:
            research_task += f" Focus on the target audience: {contract.target_audience}."
        dag["nodes"].append({
            "id": "research", "type": "workforce", "name": "Research Agent",
            "task": research_task, "dependencies": list(dependencies)
        })
        dependencies.append("research")

    web_content_deliverables = ['blog_post', 'sales_page', 'landing_page', 'ad_copy']
    if any(d in contract.deliverables for d in web_content_deliverables):
        dag["nodes"].append({
            "id": "seo-analysis", "type": "strategist", "name": "SEO Agent",
            "task": f"Perform a full SEO analysis for the primary topic: '{contract.objective}'",
            "dependencies": list(dependencies)
        })
        dependencies.append("seo-analysis")

    content_strategy_task = f"Create a content calendar and detailed plan for the following deliverables: {', '.join(contract.deliverables)}."
    if "seo-analysis" in dependencies:
        content_strategy_task += " You MUST use the SEO analysis from the previous step to inform your content plan, including keywords and competitor insights."

    dag["nodes"].append({
        "id": "content-strategy", "type": "strategist", "name": "Content Strategist Agent",
        "task": content_strategy_task, "dependencies": list(dependencies)
    })
    dependencies.append("content-strategy")

    dag["nodes"].append({
        "id": "content-creation", "type": "workforce", "name": "Content Creation Team (Copywriter, etc.)",
        "task": "Generate all content based on the content strategy.", "dependencies": list(dependencies)
    })

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
        task = node.get("task", "No task defined.")
        output_data = {}

        print(f"\n[Executing Node: {node_id}]")
        print(f"  Agent: {agent_name}")

        try:
            if "Business Strategist" in agent_name:
                prompt = f"""You are a seasoned business strategist...""" # Prompt is long, keeping it brief here
                output_data = business_strategist.generate_business_strategy(
                    objective=contract.objective, target_audience=contract.target_audience, prompt=prompt)

            elif "SEO Agent" in agent_name:
                output_data = seo_agent.analyze_seo_opportunity(topic=contract.objective)

            elif "Content Strategist" in agent_name:
                seo_results = execution_context.get("seo-analysis", {})
                prompt = f"""
                You are an expert content strategist...
                You MUST use the following SEO analysis to inform your plan:
                {json.dumps(seo_results, indent=2)}
                """
                output_data = content_strategist.generate_content_plan(
                    objective=contract.objective, deliverables=contract.deliverables)
                # This agent should also be updated to accept the full prompt.

            elif "Research Agent" in agent_name:
                output_data = research_agent.search_web(query=task)
            elif "Scraper Agent" in agent_name:
                output_data = {"leads": scraper_agent.scrape_leads(query=task)}
            elif "Content Creation" in agent_name:
                dummy_content = f"This is the generated ad copy for the campaign: {contract.objective}."
                output_data = {"content": dummy_content}

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
