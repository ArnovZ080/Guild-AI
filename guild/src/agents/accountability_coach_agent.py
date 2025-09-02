import json
import asyncio

from guild.src.models.user_input import UserInput, Audience
from guild.src.models.agent import Agent, AgentCallback
from guild.src.models.llm import Llm, LlmModels
from guild.src.core.llm_client import LlmClient
from guild.src.utils.logging_utils import get_logger
from guild.src.utils.decorators import inject_knowledge

logger = get_logger(__name__)

PROMPT_TEMPLATE = """
You are the Accountability & Motivation Coach Agent, a dedicated virtual partner for the solo-founder. Your role is to provide personalized accountability, track progress towards goals, and offer motivational support to keep the founder focused and inspired.

**1. Foundational Analysis (Do not include in output):**
    *   **Solo-Founder's Stated Goals (SMART):** {solo_founder_goals}
    *   **Real-time Progress Data (from other agents):** {progress_data}
    *   **Founder's Self-Reported Challenges/Successes:** {solo_founder_input}
    *   **Key Insights & Knowledge (from web search on motivational psychology):** {knowledge}

**2. Your Task:**
    Based on the foundational analysis, generate a concise, constructive, and encouraging accountability check-in message. The tone should be supportive and non-judgmental, focusing on progress and effort.

**3. Output Format (JSON only):**
    {{
      "check_in_summary": {{
        "title": "Weekly Accountability Check-in",
        "period": "e.g., 'August 26 - September 1, 2025'"
      }},
      "progress_report": [
        {{
          "goal": "e.g., 'Increase Monthly Recurring Revenue by 5%'",
          "status": "e.g., 'On Track'",
          "current_progress": "e.g., 'MRR has increased by 3.5% so far.'",
          "commentary": "e.g., 'Great momentum here! The new sales funnel seems to be effective.'"
        }},
        {{
          "goal": "e.g., 'Launch New Product Feature'",
          "status": "e.g., 'Needs Attention'",
          "current_progress": "e.g., 'Project Manager reports a 3-day delay on the development task.'",
          "commentary": "e.g., 'This seems to be the main bottleneck. Is there anything I can help with to get this back on track?'"
        }}
      ],
      "key_achievements": [
        "A bulleted list celebrating specific wins and successes from the past week, no matter how small."
      ],
      "areas_for_focus": [
        "A bulleted list of areas or specific tasks that require more attention in the upcoming week."
      ],
      "motivational_message": {{
        "title": "This Week's Focus & Motivation",
        "message": "A personalized and encouraging message. It could be a quote, a reminder of the 'why' behind the goals, or a short reflection on progress.",
        "call_to_action": "A gentle prompt for the week ahead, e.g., 'What is the #1 thing you want to accomplish this week to move the needle on your main goal?'"
      }}
    }}
"""


class AccountabilityCoachAgent(Agent):
    def __init__(self, user_input: UserInput, solo_founder_goals: str, progress_data: str, solo_founder_input: str = "Not provided.", callback: AgentCallback = None):
        super().__init__(
            "Accountability & Motivation Coach Agent",
            "Provides personalized accountability, tracks progress, and offers motivational support.",
            user_input,
            callback=callback
        )
        self.solo_founder_goals = solo_founder_goals
        self.progress_data = progress_data
        self.solo_founder_input = solo_founder_input
        self.llm_client = LlmClient(
            Llm(
                provider="together",
                model=LlmModels.LLAMA3_70B.value
            )
        )

    @inject_knowledge
    async def run(self, knowledge: str | None = None) -> str:
        self._send_start_callback()
        logger.info(f"Running Accountability Coach agent.")

        prompt = PROMPT_TEMPLATE.format(
            solo_founder_goals=self.solo_founder_goals,
            progress_data=self.progress_data,
            solo_founder_input=self.solo_founder_input,
            knowledge=knowledge,
        )

        self._send_llm_start_callback(prompt, "together", LlmModels.LLAMA3_70B.value)
        response = await self.llm_client.chat(prompt)
        self._send_llm_end_callback(response)

        logger.info("Accountability Coach agent finished.")
        self._send_end_callback(response)
        return response


if __name__ == '__main__':
    async def main():
        user_input = UserInput(objective="Weekly accountability check-in.")

        solo_founder_goals = """
        1. Increase MRR by 5% this month.
        2. Launch the 'Advanced Analytics' feature by the 15th.
        3. Publish 4 new blog posts this month.
        """
        progress_data = "Bookkeeping Agent: MRR has increased by 3.5%. Project Manager Agent: 'Advanced Analytics' feature is 3 days behind schedule. Content Strategist Agent: 2 out of 4 blog posts have been published."
        solo_founder_input = "I felt really productive at the start of the week but got bogged down by customer support tickets towards the end."

        agent = AccountabilityCoachAgent(
            user_input,
            solo_founder_goals=solo_founder_goals,
            progress_data=progress_data,
            solo_founder_input=solo_founder_input
        )
        result = await agent.run()
        print(json.dumps(json.loads(result), indent=2))

    asyncio.run(main())
