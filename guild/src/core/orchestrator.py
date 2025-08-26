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

from guild.src.agents import research_agent # Import the agent module

    # Simplified sequential execution
    for node in dag["nodes"]:
        agent_name = node.get("name", "Unknown Agent")
        task = node.get("task", "No task defined.")

        print(f"\n[Executing Node: {node.get('id')}]")
        print(f"  Agent: {agent_name}")
        print(f"  Task: {task}")

        # Execute the actual agent logic if it's the Research Agent
        if "Research Agent" in agent_name:
            # The "task" field from the DAG can serve as the query
            research_result = research_agent.search_web(query=task)
            print(f"  ... Research Agent found content from: {research_result.get('url')}")
        else:
            # Simulate other agents working
            import time
            time.sleep(1)
            print(f"  ... {agent_name} finished task (simulated).")

    print("\n--- DAG Execution Finished ---")

    # After the DAG is finished, push a summary result to n8n
    from guild.src.integrations import n8n_connector
    final_result = {
        "status": "success",
        "message": "The AI workforce has completed the workflow.",
        "contract_id": contract.id if contract else "unknown", # Assuming contract is available
        "deliverables_summary": [f"Completed: {d}" for d in contract.deliverables] if contract else []
    }
    try:
        n8n_connector.push_to_n8n(final_result)
    except Exception as e:
        print(f"Orchestrator: Failed to push to n8n at the end of the workflow. Error: {e}")
