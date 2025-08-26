from guild.src.core import llm_client
from typing import Dict, Any
from guild.src.core.agent_helpers import inject_knowledge

@inject_knowledge
def generate_business_strategy(objective: str, target_audience: str, prompt: str) -> Dict[str, Any]:
    """
    Generates a high-level business strategy document using an LLM.
    This function is decorated to automatically inject real-time knowledge.
    The prompt is constructed by the orchestrator and passed in.
    """
    print("Business Strategist Agent: Generating business strategy with injected knowledge...")

    try:
        # The 'prompt' argument here has already been enhanced by the @inject_knowledge decorator

        strategy = llm_client.generate_json(prompt=prompt)
        print("Business Strategist Agent: Successfully generated business strategy.")
        return strategy
    except Exception as e:
        print(f"Business Strategist Agent: Failed to generate strategy. Error: {e}")
        raise
