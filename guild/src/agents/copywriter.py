from guild.src.models.user_input import UserInput
from guild.src.models.agent import Agent, AgentCallback
from guild.src.models.llm import Llm, LlmModels
from guild.src.core.llm_client import LlmClient
from guild.src.tools.search import search_and_summarize
from guild.src.utils.logging_utils import get_logger
from guild.src.utils.decorators import inject_knowledge

import json

logger = get_logger(__name__)

PROMPT_TEMPLATE = """
You are a world-class Copywriter AI agent. Your mission is to create compelling, high-converting copy that resonates with the target audience and achieves the user's primary objective.

**1. Foundational Analysis (Do not include in output):**
    *   **User's Core Objective:** {objective}
    *   **Target Audience Analysis:** {audience}
    *   **Key Insights & Knowledge:** {knowledge}
    *   **Content Strategy:** {content_strategy}

**2. Your Task:**
    Based on the foundational analysis, write the copy required by the user. Adapt your tone, style, and format to the specific requirements of the content strategy and user request.

**3. Output Format:**
    *   **Title:** A compelling, attention-grabbing title.
    *   **Body:** The main copy, structured for readability with clear headings, bullet points, and strong calls-to-action.
    *   **Key Takeaways:** A concise summary of the most important points.
    *   **Tone of Voice:** Describe the tone used (e.g., "Professional and Authoritative," "Enthusiastic and Conversational").
"""

class Copywriter(Agent):
    def __init__(self, user_input: UserInput, content_strategy: str, callback: AgentCallback = None):
        super().__init__(
            "Copywriter",
            "Writes compelling copy based on a content strategy.",
            user_input,
            callback=callback
        )
        self.content_strategy = content_strategy
        self.llm_client = LlmClient(
            Llm(
                provider="together",
                model=LlmModels.LLAMA3_70B.value
            )
        )

    @inject_knowledge
    async def run(self, knowledge: str | None = None) -> str:
        self._send_start_callback()
        logger.info(f"Running Copywriter agent for objective: {self.user_input.objective}")

        prompt = PROMPT_TEMPLATE.format(
            objective=self.user_input.objective,
            audience=self.user_input.audience,
            knowledge=knowledge,
            content_strategy=self.content_strategy
        )

        self._send_llm_start_callback(prompt, "together", LlmModels.LLAMA3_70B.value)
        response = await self.llm_client.chat(prompt)
        self._send_llm_end_callback(response)

        logger.info(f"Copywriter agent finished. Output: {response}")
        self._send_end_callback(response)
        return response

if __name__ == '__main__':
    import asyncio
    from guild.src.models.user_input import Audience

    async def main():
        user_input = UserInput(
            objective="Launch a new AI-powered copywriting tool.",
            audience=Audience(
                description="Marketing professionals and small business owners.",
                demographics={
                    "age": "25-55",
                    "location": "Global",
                    "interests": ["Digital Marketing", "AI", "Content Creation"]
                }
            ),
            additional_notes="The tool should be positioned as a time-saver and a creativity booster."
        )

        content_strategy_output = """
        {
            "content_pillars": ["AI in Marketing", "Content Creation Efficiency", "Boosting Creativity"],
            "target_keywords": ["AI copywriting tool", "automated content generation", "marketing AI"],
            "suggested_formats": ["Blog Post", "Social Media Campaign"],
            "strategic_recommendations": "Focus on educational content (how-to guides, case studies) to build trust. Use a confident and forward-looking tone."
        }
        """

        agent = Copywriter(user_input, content_strategy=content_strategy_output)
        result = await agent.run()
        print(result)

    asyncio.run(main())
