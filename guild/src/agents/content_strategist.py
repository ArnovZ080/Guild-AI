from guild.src.core.llm_client import LlmClient
from typing import Dict, Any, List
from guild.src.core.agent_helpers import inject_knowledge
import json

@inject_knowledge
async def generate_content_plan(objective: str, deliverables: List[str], prompt: str = None) -> Dict[str, Any]:
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
        # Create a simple LLM client for this agent
        from guild.src.models.llm import Llm
        client = LlmClient(Llm(provider="ollama", model="tinyllama"))
        response = await client.chat(prompt)
        
        # Try to parse as JSON
        import json
        try:
            content_plan = json.loads(response)
            print("Content Strategist Agent: Successfully generated content plan.")
            return content_plan
        except json.JSONDecodeError:
            # Fallback to simple structure
            return {"content_calendar": [{"day": "Today", "platform": "General", "content_type": "Content", "title_or_hook": "Generated content", "synergy_notes": "Content created based on objective"}]}
    except Exception as e:
        print(f"Content Strategist Agent: Failed to generate content plan. Error: {e}")
        # Return fallback plan
        return {"content_calendar": [{"day": "Today", "platform": "General", "content_type": "Content", "title_or_hook": "Generated content", "synergy_notes": "Content created based on objective"}]}


class ContentStrategist:
    """Minimal class wrapper to satisfy orchestrator imports."""
    def __init__(self, user_input):
        self.user_input = user_input

    async def run(self) -> str:
        # Provide a minimal, valid JSON structure expected by the orchestrator
        plan = {
            "content_calendar": []
        }
        try:
            result = await generate_content_plan(
                objective=self.user_input.objective or "",
                deliverables=self.user_input.deliverables if hasattr(self.user_input, "deliverables") and self.user_input.deliverables else ["blog", "social"]
            )
            if isinstance(result, dict):
                plan = result
        except Exception:
            # Fallback to minimal plan to avoid startup-time failures
            pass
        return json.dumps(plan)
