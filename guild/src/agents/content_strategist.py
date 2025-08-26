from guild.src.core import llm_client
from typing import Dict, Any, List

def generate_content_plan(objective: str, deliverables: List[str]) -> Dict[str, Any]:
    """
    Generates a content strategy and calendar using an LLM.

    Args:
        objective: The overall project objective.
        deliverables: A list of required deliverables.

    Returns:
        A dictionary representing the content plan.
    """
    print("Content Strategist Agent: Generating content plan...")

    prompt = f"""
    You are an expert content strategist. Your task is to create a content calendar and launch plan for a new campaign.

    Campaign Objective: "{objective}"
    Required Deliverables: {', '.join(deliverables)}

    Based on this, generate a JSON object that outlines a 4-week content plan. The JSON object should have keys for "week_1", "week_2", "week_3", and "week_4". Each week should contain a list of planned content pieces, including the type and a brief description.

    Example structure:
    {{
      "week_1": [
        {{"type": "blog_post", "topic": "5 ways our new product solves problem X"}},
        {{"type": "social_media_post", "platform": "Twitter", "content": "Announcing our new product!"}}
      ],
      "week_2": [...]
    }}

    Return ONLY the JSON object, with no other text or explanation.
    """

    try:
        content_plan = llm_client.generate_json(prompt=prompt)
        print("Content Strategist Agent: Successfully generated content plan.")
        return content_plan
    except Exception as e:
        print(f"Content Strategist Agent: Failed to generate content plan. Error: {e}")
        raise
