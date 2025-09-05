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
You are the Strategic Sounding Board Agent, a high-level strategic partner. Your purpose is to provide objective feedback, challenge assumptions, and offer alternative viewpoints on critical business ideas and decisions. You are a devil's advocate, a brainstorming partner, and a data-driven analyst, all in one.

**1. Foundational Analysis (Do not include in output):**
    *   **Idea or Decision to Review:** {idea_or_decision}
    *   **Solo-Founder's Rationale/Assumptions:** {solo_founder_rationale}
    *   **Relevant Data (Internal Performance, Market Research, etc.):** {relevant_data}
    *   **Key Insights & Knowledge (from web search on critical thinking frameworks):** {knowledge}

**2. Your Task:**
    Based on the foundational analysis, provide a structured and objective critique of the solo-founder's idea. Your goal is not to make the decision, but to empower the founder to make a *better* one by illuminating all angles.

**3. Output Format (JSON only):**
    {{
      "executive_summary": "A brief, neutral statement of the idea being reviewed and a summary of your core feedback.",
      "idea_analysis": {{
        "stated_idea": "A concise restatement of the idea for clarity.",
        "identified_assumptions": [
          "A list of the core assumptions underlying the founder's rationale."
        ]
      }},
      "strengths_and_opportunities": {{
        "title": "Potential Upsides & Strengths",
        "points": [
          "Acknowledge the positive aspects and potential opportunities of the idea, supported by data where possible."
        ]
      }},
      "weaknesses_and_threats": {{
        "title": "Areas for Deeper Consideration / Potential Downsides",
        "points": [
          "A detailed analysis of risks, overlooked factors, challenges, and potential negative consequences. This is the 'devil's advocate' part of your role."
        ]
      }},
      "alternative_perspectives": {{
        "title": "Alternative Perspectives & Questions to Ponder",
        "points": [
          "Propose new angles, alternative strategies, or challenging questions to stimulate further thought and mitigate confirmation bias."
        ]
      }},
      "recommendation_for_next_steps": "Suggest concrete next steps for the founder to take to further validate the idea or mitigate risks (e.g., 'Conduct a small-scale A/B test on pricing before a full rollout', 'Interview 5 potential customers from the new target niche')."
    }}
"""


class StrategicSoundingBoardAgent(Agent):
    def __init__(self, user_input: UserInput, solo_founder_rationale: str, relevant_data: str, callback: AgentCallback = None):
        # The user_input.objective holds the 'idea_or_decision'
        super().__init__(
            "Strategic Sounding Board Agent",
            "Acts as an objective partner to challenge ideas and provide alternative viewpoints.",
            user_input,
            callback=callback
        )
        self.solo_founder_rationale = solo_founder_rationale
        self.relevant_data = relevant_data
        self.llm_client = LlmClient(
            Llm(
                provider="together",
                model=LlmModels.LLAMA3_70B.value
            )
        )

    @inject_knowledge
    async def run(self, knowledge: str | None = None) -> str:
        self._send_start_callback()
        logger.info(f"Running Strategic Sounding Board agent for idea: {self.user_input.objective}")

        prompt = PROMPT_TEMPLATE.format(
            idea_or_decision=self.user_input.objective,
            solo_founder_rationale=self.solo_founder_rationale,
            relevant_data=self.relevant_data,
            knowledge=knowledge,
        )

        self._send_llm_start_callback(prompt, "together", LlmModels.LLAMA3_70B.value)
        response = await self.llm_client.chat(prompt)
        self._send_llm_end_callback(response)

        logger.info("Strategic Sounding Board agent finished.")
        self._send_end_callback(response)
        return response


if __name__ == '__main__':
    async def main():
        user_input = UserInput(
            objective="I want to pivot my SaaS product from targeting small businesses to targeting enterprise clients.",
        )

        solo_founder_rationale = "I believe enterprise clients have bigger budgets and are more stable, which will increase our revenue and reduce churn. I think our current feature set is 'good enough' to get started."
        relevant_data = "Internal Data: Our average revenue per user is $50/month. Sales cycle is currently 14 days. Market Research: The enterprise market has a 9-12 month sales cycle and requires features like SSO, audit logs, and dedicated support, which we don't have."

        agent = StrategicSoundingBoardAgent(
            user_input,
            solo_founder_rationale=solo_founder_rationale,
            relevant_data=relevant_data
        )
        result = await agent.run()
        print(json.dumps(json.loads(result), indent=2))

    asyncio.run(main())
