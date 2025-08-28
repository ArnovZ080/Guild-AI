import json
import asyncio

from models.user_input import UserInput, Audience
from models.agent import Agent, AgentCallback
from models.llm import Llm, LlmModels
from llm.llm_client import LlmClient
from utils.logging_utils import get_logger
from utils.decorators import inject_knowledge

logger = get_logger(__name__)

PROMPT_TEMPLATE = """
You are the Skill Development & Learning Agent, a personalized learning and development coach for the solo-founder. Your purpose is to identify the founder's skill gaps, recommend relevant learning resources, and curate industry news to empower them with the knowledge needed to grow their business.

**1. Foundational Analysis (Do not include in output):**
    *   **Identified Skill Gaps / Learning Goals:** {skill_gaps}
    *   **Founder's Business Goals:** {business_goals}
    *   **Founder's Learning Preferences (e.g., video, articles, courses):** {learning_preferences}
    *   **Time Available for Learning per Week:** {time_availability}
    *   **Key Insights & Knowledge (from web search on relevant skills and resources):** {knowledge}

**2. Your Task:**
    Based on the foundational analysis, generate a personalized and actionable learning plan for the solo-founder.

**3. Output Format (JSON only):**
    {{
      "learning_plan_summary": {{
        "primary_skill_focus": "The main skill to focus on this period.",
        "alignment_with_business_goal": "Explain how learning this skill directly helps achieve a specific business goal."
      }},
      "curated_learning_resources": [
        {{
          "skill_component": "e.g., 'Understanding Financial Statements'",
          "resource_type": "e.g., 'Video Course'",
          "resource_name": "e.g., 'Finance for Non-Financial Managers on Coursera'",
          "link_placeholder": "A placeholder for the link.",
          "estimated_time": "e.g., '8 hours'",
          "cost": "e.g., 'Free' or '$49'",
          "rationale": "Why this specific resource is recommended (e.g., 'Comprehensive, highly rated, and includes practical exercises.')."
        }},
        {{
          "skill_component": "e.g., 'Basics of Google Ads'",
          "resource_type": "e.g., 'Article Series'",
          "resource_name": "e.g., 'Ahrefs' Guide to Google Ads'",
          "link_placeholder": "A placeholder for the link.",
          "estimated_time": "e.g., '3 hours'",
          "cost": "e.g., 'Free'",
          "rationale": "e.g., 'A practical, text-based guide for quick learning and implementation.'"
        }}
      ],
      "practical_application_project": {{
        "title": "Hands-On Project to Apply Your New Skill",
        "project_description": "A small, manageable project where the founder can immediately apply their new knowledge (e.g., 'Set up a single, low-budget Google Ads campaign for your main product and track its performance for one week.').",
        "success_metric": "How to measure the success of the project (e.g., 'Successfully launch the campaign and achieve a Click-Through Rate (CTR) of over 2%.')."
      }},
      "curated_industry_insights": [
        {{
          "insight": "A summary of a recent, relevant industry trend or best practice.",
          "source": "The name of the source publication or website.",
          "takeaway": "The key actionable takeaway for the solo-founder's business."
        }}
      ]
    }}
"""


class SkillDevelopmentAgent(Agent):
    def __init__(self, user_input: UserInput, business_goals: str, learning_preferences: str, time_availability: str, callback: AgentCallback = None):
        # user_input.objective holds the skill_gaps/learning goals
        super().__init__(
            "Skill Development & Learning Agent",
            "Identifies solo-founder's skill gaps and curates a personalized learning plan.",
            user_input,
            callback=callback
        )
        self.business_goals = business_goals
        self.learning_preferences = learning_preferences
        self.time_availability = time_availability
        self.llm_client = LlmClient(
            Llm(
                provider="together",
                model=LlmModels.LLAMA3_70B.value
            )
        )

    @inject_knowledge
    async def run(self, knowledge: str | None = None) -> str:
        self._send_start_callback()
        logger.info(f"Running Skill Development agent for gaps: {self.user_input.objective}")

        prompt = PROMPT_TEMPLATE.format(
            skill_gaps=self.user_input.objective,
            business_goals=self.business_goals,
            learning_preferences=self.learning_preferences,
            time_availability=self.time_availability,
            knowledge=knowledge,
        )

        self._send_llm_start_callback(prompt, "together", LlmModels.LLAMA3_70B.value)
        response = await self.llm_client.chat(prompt)
        self._send_llm_end_callback(response)

        logger.info("Skill Development agent finished.")
        self._send_end_callback(response)
        return response


if __name__ == '__main__':
    async def main():
        user_input = UserInput(
            objective="I need to get better at financial management and paid advertising.",
        )

        business_goals = "Increase profitability by 10% in the next quarter. Acquire 100 new customers through paid channels."
        learning_preferences = "I prefer short video courses and practical, hands-on projects. I don't have much time for long books."
        time_availability = "I can dedicate about 3-5 hours per week to learning."

        agent = SkillDevelopmentAgent(
            user_input,
            business_goals=business_goals,
            learning_preferences=learning_preferences,
            time_availability=time_availability
        )
        result = await agent.run()
        print(json.dumps(json.loads(result), indent=2))

    asyncio.run(main())
