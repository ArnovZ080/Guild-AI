from guild.src.core import llm
from typing import Dict, Any, List

def generate_ad_copy(
    product_description: str,
    key_messaging: List[str],
    target_channel: str
) -> Dict[str, Any]:
    """
    Generates advertising copy using an LLM.

    Args:
        product_description: A description of the product.
        key_messaging: Key messages from the marketing plan.
        target_channel: The channel the ad is for (e.g., 'Facebook', 'Google').

    Returns:
        A dictionary containing different versions of the ad copy.
    """
    print(f"Copywriter Agent: Generating ad copy for {target_channel}...")

    prompt = f"""
    You are an expert direct response copywriter. Your task is to write compelling ad copy that converts.

    Product Description: "{product_description}"
    Key Messaging to Emphasize: {', '.join(key_messaging)}
    Target Ad Channel: {target_channel}

    Based on this, generate a JSON object containing three variations of ad copy. Each variation should have a 'headline' and a 'body'.

    Return ONLY the JSON object, with no other text or explanation.
    """

    try:
        ad_copy = llm.generate_json(prompt=prompt)
        print("Copywriter Agent: Successfully generated ad copy.")
        return ad_copy
    except Exception as e:
        print(f"Copywriter Agent: Failed to generate ad copy. Error: {e}")
        raise
