from guild.src.core import llm
from typing import Dict, Any

def generate_campaign_plan(product_description: str, audience: str) -> Dict[str, Any]:
    """
    Generates a marketing campaign plan using an LLM.

    Args:
        product_description: A description of the product to be marketed.
        audience: A description of the target audience.

    Returns:
        A dictionary representing the campaign plan.
    """
    print("Marketing Agent: Generating campaign plan...")

    prompt = f"""
    You are a master marketing strategist. Your task is to create a high-level marketing campaign plan.

    Product Description: "{product_description}"
    Target Audience: "{audience}"

    Based on this, generate a JSON object that outlines a marketing campaign. The JSON object should include:
    - campaign_title: A catchy title for the campaign.
    - key_messaging: A list of 3-5 key messages or value propositions.
    - recommended_channels: A list of recommended marketing channels (e.g., 'Facebook Ads', 'Content Marketing', 'Email Marketing').
    - high_level_timeline: A brief, week-by-week timeline of activities for the first month.

    Return ONLY the JSON object, with no other text or explanation.
    """

    try:
        campaign_plan = llm.generate_json(prompt=prompt)
        print("Marketing Agent: Successfully generated campaign plan.")
        return campaign_plan
    except Exception as e:
        print(f"Marketing Agent: Failed to generate campaign plan. Error: {e}")
        raise
