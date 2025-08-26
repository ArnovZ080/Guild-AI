from guild.core.models.schemas import OutcomeContract
from typing import Dict, Any, List

def compile_contract_to_dag(contract: OutcomeContract) -> Dict[str, Any]:
    """
    Compiles an OutcomeContract into a Directed Acyclic Graph (DAG) definition.

    This function analyzes the contract's objective and deliverables to
    determine which agents are needed and in what order.

    Args:
        contract: The Pydantic model of the OutcomeContract.

    Returns:
        A dictionary representing the execution DAG.
    """

    # This is a simplified, rule-based compiler. A more advanced version
    # could use an LLM to generate the plan.

    dag = {"nodes": []}
    dependencies = []

    # 1. Always start with a Judge Agent to create a rubric.
    dag["nodes"].append({
        "id": "judge-create-rubric",
        "type": "evaluator",
        "name": "Judge Agent",
        "task": "Create a detailed rubric based on the contract objective and deliverables.",
        "dependencies": []
    })
    dependencies.append("judge-create-rubric")

    # 2. Add a Research Agent if the objective requires external info.
    # Simple keyword check for now.
    if "research" in contract.objective.lower() or "analyze" in contract.objective.lower():
        dag["nodes"].append({
            "id": "research",
            "type": "workforce",
            "name": "Research Agent",
            "task": "Conduct research based on the contract objective.",
            "dependencies": list(dependencies)
        })
        dependencies.append("research")

    # 3. Add a Content Creator for each deliverable.
    for i, deliverable in enumerate(contract.deliverables):
        node_id = f"content-creator-{i}"
        dag["nodes"].append({
            "id": node_id,
            "type": "workforce",
            "name": f"Content Creator ({deliverable})",
            "task": f"Create the '{deliverable}' deliverable based on the contract and prior research.",
            "dependencies": list(dependencies)
        })
        # For simplicity, we make all content creation depend on the same prior steps.
        # A more complex model could have them run in parallel or sequence.

    # 4. For now, we'll skip the final evaluation step in the DAG.
    # That can be added as a separate phase after content creation.

    return dag


from .models.schemas import OutcomeContract

def compile_contract_to_dag(contract: OutcomeContract) -> Dict[str, Any]:
    """
    Compiles an OutcomeContract into a Directed Acyclic Graph (DAG) definition.

    This function analyzes the contract's objective and deliverables to
    determine which agents are needed and in what order.

    Args:
        contract: The Pydantic model of the OutcomeContract.

    Returns:
        A dictionary representing the execution DAG.
    """

    dag = {"nodes": []}
    dependencies = []

    # 1. Always start with a Judge Agent to create a rubric (already done when contract was created).
    # The first *execution* step is now research or strategy.

    # 2. Add a Business Strategist if the objective is high-level.
    if "launch" in contract.objective.lower() or "strategy" in contract.objective.lower():
        dag["nodes"].append({
            "id": "business-strategy",
            "type": "strategist",
            "name": "Business Strategist Agent",
            "task": f"Create a high-level business strategy for the objective: '{contract.objective}'. Consider the target audience: {contract.target_audience}",
            "dependencies": list(dependencies)
        })
        dependencies.append("business-strategy")

    # 3. Add a Scraper or Research Agent based on the objective.
    if "scrape" in contract.objective.lower() or "find leads" in contract.objective.lower():
        dag["nodes"].append({
            "id": "scrape-leads",
            "type": "workforce",
            "name": "Scraper Agent",
            "task": contract.objective, # The objective itself is the query
            "dependencies": list(dependencies)
        })
        dependencies.append("scrape-leads")
    else:
        research_task = f"Conduct research based on the contract objective: '{contract.objective}'."
        if contract.target_audience:
            research_task += f" Focus on the target audience: {contract.target_audience}."

        dag["nodes"].append({
            "id": "research",
            "type": "workforce",
            "name": "Research Agent",
            "task": research_task,
            "dependencies": list(dependencies) # Depends on strategy if it exists
        })
        dependencies.append("research")

    # 4. Add a Content Strategist to plan the deliverables.
    dag["nodes"].append({
        "id": "content-strategy",
        "type": "strategist",
        "name": "Content Strategist Agent",
        "task": f"Create a content calendar and detailed plan for the following deliverables: {', '.join(contract.deliverables)}.",
        "dependencies": list(dependencies)
    })
    dependencies.append("content-strategy")

    # 5. Add Content Creators for each deliverable (this part can be more detailed later).
    dag["nodes"].append({
        "id": "content-creation",
        "type": "workforce",
        "name": "Content Creation Team (Copywriter, etc.)",
        "task": "Generate all content based on the content strategy.",
        "dependencies": list(dependencies)
    })

    return dag


def execute_dag(dag: Dict[str, Any], contract: OutcomeContract):
    """
    Executes a DAG by processing its nodes in order.

    This is a simplified executor that processes nodes sequentially based on
    their order in the list. A real executor would need to handle the
    dependency graph properly.

    Args:
        dag: The DAG definition dictionary.
    """
    print("--- Starting DAG Execution ---")

    if not dag.get("nodes"):
        print("DAG has no nodes to execute.")
        return

from guild.src.agents import research_agent, business_strategist, content_strategist, scraper_agent, judge_agent

    # This is a simple context dictionary to pass results between agents.
    # A real implementation would use a more robust state management system.
    execution_context = {}

    # Simplified sequential execution
    for node in dag["nodes"]:
        agent_name = node.get("name", "Unknown Agent")
        task = node.get("task", "No task defined.")

        print(f"\n[Executing Node: {node.get('id')}]")
        print(f"  Agent: {agent_name}")
        print(f"  Task: {task}")

        # Execute the actual agent logic based on its name
        if "Business Strategist" in agent_name:
            strategy = business_strategist.generate_business_strategy(
                objective=contract.objective,
                target_audience=contract.target_audience
            )
            execution_context['business_strategy'] = strategy
            print(f"  ... Business Strategist produced a strategy document.")

        elif "Research Agent" in agent_name:
            research_result = research_agent.search_web(query=task)
            execution_context['research_findings'] = research_result
            print(f"  ... Research Agent found content from: {research_result.get('url')}")

        elif "Scraper Agent" in agent_name:
            leads = scraper_agent.scrape_leads(query=task)
            execution_context['scraped_leads'] = leads
            print(f"  ... Scraper Agent found {len(leads)} leads.")

        elif "Content Strategist" in agent_name:
            content_plan = content_strategist.generate_content_plan(
                objective=contract.objective,
                deliverables=contract.deliverables
            )
            execution_context['content_plan'] = content_plan
            print(f"  ... Content Strategist produced a content plan.")

        elif "Content Creation" in agent_name:
            # This is a placeholder for a real content creation agent (e.g., copywriter)
            # We'll generate some dummy content to be evaluated.
            dummy_content = f"This is the generated ad copy for the campaign: {contract.objective}."
            execution_context['generated_content'] = dummy_content
            print(f"  ... Content Creation team produced: '{dummy_content[:50]}...'")

            # Immediately call the Judge Agent to evaluate the output
            print("\n  [Evaluating Output...]")
            evaluation = judge_agent.evaluate_output(
                content=dummy_content,
                rubric=contract.rubric
            )
            execution_context['final_evaluation'] = evaluation
            final_score = evaluation.get("final_score", 0)
            print(f"  ... Judge Agent returned a final score of: {final_score:.2f}")

            # Check if the score meets the quality threshold
            if final_score < contract.rubric.quality_threshold:
                print(f"  [QUALITY ALERT] Score {final_score:.2f} is below the threshold of {contract.rubric.quality_threshold}. Revision would be required.")
                # In a real implementation, this would trigger a new task for the content creator.
            else:
                print("  [QUALITY OK] Score meets the threshold.")

        else:
            # Simulate other agents working
            import time
            time.sleep(1)
            print(f"  ... {agent_name} finished task (simulated).")

    print("\n--- DAG Execution Finished ---")

    # After the DAG is finished, push the results to Zapier if a webhook is provided
    if contract.zapier_webhook_url:
        from guild.src.integrations import zapier
        # We can pass the whole execution context to Zapier
        final_result = {
            "status": "success",
            "contract": contract.dict(),
            "results": execution_context
        }
        try:
            zapier.push_to_zapier(contract.zapier_webhook_url, final_result)
        except Exception as e:
            print(f"Orchestrator: Failed to push to Zapier at the end of the workflow. Error: {e}")
