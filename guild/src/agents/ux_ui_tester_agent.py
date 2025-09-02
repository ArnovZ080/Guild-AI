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
You are the UX/UI Tester Agent, an expert in user experience, usability, and interface design. Your role is to act as a virtual user, analyzing a product or website to identify friction points and suggest actionable design improvements based on established heuristics and best practices.

**1. Foundational Analysis (Do not include in output):**
    *   **Product URL / Interface to Test:** {product_url}
    *   **Testing Scenario / User Flow:** {testing_scenario}
    *   **Target User Persona:** {target_user_persona}
    *   **Key Insights & Knowledge (from web search on UX heuristics):** {knowledge}

**2. Your Task:**
    Based on the foundational analysis, conduct a heuristic evaluation of the specified interface and user flow. Generate a detailed report of your findings and provide specific, actionable recommendations for improvement.

**3. Output Format (JSON only):**
    {{
      "ux_ui_report": {{
        "test_summary": {{
          "url_tested": "{product_url}",
          "scenario_tested": "{testing_scenario}",
          "user_persona": "{target_user_persona}",
          "overall_finding": "A brief, high-level summary of the user experience (e.g., 'The flow is generally intuitive, but the final checkout step has significant friction.')."
        }},
        "heuristic_evaluation_findings": [
          {{
            "issue_id": "UX-001",
            "heuristic_violated": "e.g., 'Nielsen's Heuristic #4: Consistency and standards'",
            "severity": "e.g., 'High'",
            "description": "A detailed description of the usability issue. (e.g., 'The 'Next' button is styled as a primary action on the first two steps, but as a secondary link on the third step, causing confusion.').",
            "location": "e.g., 'Project Setup - Step 3'",
            "recommendation": "A specific, actionable design recommendation. (e.g., 'Ensure all primary action buttons ('Next', 'Submit', etc.) use a consistent style and placement throughout the entire user flow.')."
          }},
          {{
            "issue_id": "UX-002",
            "heuristic_violated": "e.g., 'Nielsen's Heuristic #6: Recognition rather than recall'",
            "severity": "e.g., 'Medium'",
            "description": "e.g., 'The user is required to remember the project name they entered on Step 1 to find it in a dropdown on Step 4. The project name is not displayed on the screen.'",
            "location": "e.g., 'Task Assignment Screen'",
            "recommendation": "e.g., 'Always display the current project context (e.g., 'Project: My New Project') clearly on the screen so the user does not have to rely on memory.'"
          }}
        ],
        "prioritized_action_plan": [
          "A list of the top 3-5 recommendations, prioritized by severity and potential impact on user experience."
        ]
      }}
    }}
"""


class UXUITesterAgent(Agent):
    def __init__(self, user_input: UserInput, testing_scenario: str, target_user_persona: str, callback: AgentCallback = None):
        # user_input.objective holds the product_url
        super().__init__(
            "UX/UI Tester Agent",
            "Analyzes product usability and suggests design improvements.",
            user_input,
            callback=callback
        )
        self.testing_scenario = testing_scenario
        self.target_user_persona = target_user_persona
        self.llm_client = LlmClient(
            Llm(
                provider="together",
                model=LlmModels.LLAMA3_70B.value
            )
        )

    @inject_knowledge
    async def run(self, knowledge: str | None = None) -> str:
        self._send_start_callback()
        logger.info(f"Running UX/UI Tester agent for URL: {self.user_input.objective}")

        prompt = PROMPT_TEMPLATE.format(
            product_url=self.user_input.objective,
            testing_scenario=self.testing_scenario,
            target_user_persona=self.target_user_persona,
            knowledge=knowledge,
        )

        self._send_llm_start_callback(prompt, "together", LlmModels.LLAMA3_70B.value)
        response = await self.llm_client.chat(prompt)
        self._send_llm_end_callback(response)

        logger.info("UX/UI Tester agent finished.")
        self._send_end_callback(response)
        return response


if __name__ == '__main__':
    async def main():
        user_input = UserInput(
            objective="https://example-saas.com/onboarding",
        )

        testing_scenario = "Evaluate the new user onboarding flow, from initial sign-up to creating the first project."
        target_user_persona = "A busy solo-founder who is moderately tech-savvy but has no time for a steep learning curve."

        agent = UXUITesterAgent(
            user_input,
            testing_scenario=testing_scenario,
            target_user_persona=target_user_persona
        )
        result = await agent.run()
        print(json.dumps(json.loads(result), indent=2))

    asyncio.run(main())
