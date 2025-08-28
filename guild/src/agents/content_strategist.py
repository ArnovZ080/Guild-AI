from guild.src.core import llm_client
from typing import Dict, Any, List
from guild.src.core.agent_helpers import inject_knowledge

@inject_knowledge
def generate_content_plan(objective: str, deliverables: List[str], prompt: str = None) -> Dict[str, Any]:
    """
    Generates a world-class, holistic content strategy and calendar using an LLM.
    This function is decorated to automatically inject real-time knowledge.
    """
    print("Content Strategist Agent: Generating holistic content plan with injected knowledge...")

    if not prompt:
        prompt = f"""
        You are an expert content strategist, responsible for planning holistic content calendars that align blog, video, podcast, and social media efforts for maximum impact.

        **Campaign Objective:** "{objective}"
        **Key Deliverables to Plan For:** {', '.join(deliverables)}

        Based on this, and the real-time trends from the provided web context, generate a JSON object that outlines a **holistic 2-week content plan**.

        The JSON object should have a `content_calendar` key, which is a list of content items. Each item must include:
        - `day`: e.g., "Monday, Week 1".
        - `platform`: The primary platform for the content (e.g., "Blog", "YouTube", "Twitter").
        - `content_type`: The specific format (e.g., "In-depth Guide", "Short-form Video", "Thread").
        - `title_or_hook`: A compelling title or hook.
        - `synergy_notes`: Crucially, explain how this piece of content relates to or repurposes other content in the plan (e.g., "This Twitter thread will promote the key findings from the Week 1 blog post.").

        Return ONLY the JSON object.
        """

    try:
        content_plan = llm_client.generate_json(prompt=prompt)
        print("Content Strategist Agent: Successfully generated content plan.")
        return content_plan
    except Exception as e:
        print(f"Content Strategist Agent: Failed to generate content plan. Error: {e}")
        raise
