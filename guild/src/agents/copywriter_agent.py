from guild.src.core import llm_client
from typing import Dict, Any, List
from guild.src.core.agent_helpers import inject_knowledge

@inject_knowledge
def generate_ad_copy(
    product_description: str,
    key_messaging: List[str],
    target_channel: str,
    prompt: str = None
) -> Dict[str, Any]:
    """
    Generates world-class advertising copy using an LLM.
    This function is decorated to automatically inject real-time knowledge.
    """
    print(f"Copywriter Agent: Generating ad copy for {target_channel} with injected knowledge...")

    if not prompt:
        prompt = f"""
        You are an expert direct response copywriter, combining the skills of legends like David Ogilvy and modern experts from top ad agencies. Your task is to write compelling ad copy that converts.

        Product Description: "{product_description}"
        Key Messaging to Emphasize: {', '.join(key_messaging)}
        Target Ad Channel: {target_channel}

        Based on this, and the real-time trends from the provided web context, generate a JSON object containing three distinct creative variations for the ad copy. Each variation should have a 'headline' and a 'body'. Apply a different psychological persuasion framework (e.g., AIDA, PAS) to each variation.

        Return ONLY the JSON object.
        """

    try:
        ad_copy = llm_client.generate_json(prompt=prompt)

        print("Copywriter Agent: Successfully generated ad copy.")
        return ad_copy
    except Exception as e:
        print(f"Copywriter Agent: Failed to generate ad copy. Error: {e}")
        raise
