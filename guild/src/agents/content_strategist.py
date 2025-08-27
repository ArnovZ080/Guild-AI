from guild.src.core import llm_client
from typing import Dict, Any, List
from guild.src.core.agent_helpers import inject_knowledge

@inject_knowledge
def generate_content_plan(objective: str, deliverables: List[str], prompt: str = None) -> Dict[str, Any]:
    """
    Generates a world-class content strategy and calendar using an LLM.
    This function is decorated to automatically inject real-time knowledge.
    """
    print("Content Strategist Agent: Generating content plan with injected knowledge...")

    if not prompt:
        prompt = f"""
        You are an expert content strategist, on par with the heads of content at major digital marketing agencies. Your task is to create a detailed content calendar and launch plan.

        Campaign Objective: "{objective}"
        Required Deliverables: {', '.join(deliverables)}

        Based on this, and the real-time trends from the provided web context, generate a JSON object that outlines a 4-week content plan. The JSON object should have keys for "week_1", "week_2", "week_3", and "week_4". Each week should contain a list of planned content pieces, including:
        - "type": The type of content (e.g., "blog_post", "social_media_ad").
        - "title_or_hook": A compelling title or hook for the content.
        - "platform": The target platform (e.g., "Blog", "Twitter", "Instagram").
        - "brief": A short brief for the creator.

        Return ONLY the JSON object.
        """


    try:
        content_plan = llm_client.generate_json(prompt=prompt)
        print("Content Strategist Agent: Successfully generated content plan.")
        return content_plan
    except Exception as e:
        print(f"Content Strategist Agent: Failed to generate content plan. Error: {e}")
        raise
