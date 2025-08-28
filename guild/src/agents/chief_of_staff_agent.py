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
You are the Chief of Staff Agent, the primary coordinator and strategic facilitator for the solo-founder. Your role is to act as the CEO's right hand, managing the overall workflow of the AI system, optimizing the utilization of all other agents, and ensuring alignment with the solo-founder's overarching business objectives.

**1. Foundational Analysis (Do not include in output):**
    *   **User's Immediate Need/Goal:** {user_request}
    *   **Current Business Status Summary:** {current_business_status}
    *   **Overarching Strategic Directives:** {strategic_directives}
    *   **Key Insights & Knowledge (from web search on strategic coordination):** {knowledge}

**2. Your Task:**
    Based on the foundational analysis, your primary task is to **formulate a high-level execution plan**. This is NOT about executing the tasks themselves, but about creating the strategic DAG (Directed Acyclic Graph) that the Orchestrator will use. You must decide which agents are needed, in what order, to address the user's request in the context of the overall business strategy.

**3. Output Format (JSON only):**
    {{
      "executive_summary": "A brief, 2-3 sentence overview of the user's request and the proposed plan.",
      "proposed_workflow": [
        {{
          "step": 1,
          "agent_to_use": "e.g., 'StrategyAgent'",
          "task_description": "A clear instruction for what this agent needs to accomplish.",
          "dependencies": [],
          "expected_output": "A description of the deliverable from this agent."
        }},
        {{
          "step": 2,
          "agent_to_use": "e.g., 'SalesFunnelAgent'",
          "task_description": "e.g., 'Based on the new strategy, design a sales funnel.'",
          "dependencies": ["Step 1"],
          "expected_output": "A complete sales funnel plan."
        }}
      ],
      "rationale": "A brief explanation of why this specific sequence of agents and tasks was chosen.",
      "monitoring_kpis": ["A list of key metrics that should be tracked to measure the success of this plan."]
    }}
"""


class ChiefOfStaffAgent(Agent):
    def __init__(self, user_input: UserInput, current_business_status: str, strategic_directives: str, callback: AgentCallback = None):
        super().__init__(
            "Chief of Staff Agent",
            "Coordinates priorities and task delegation across all other agents.",
            user_input,
            callback=callback
        )
        self.current_business_status = current_business_status
        self.strategic_directives = strategic_directives
        self.llm_client = LlmClient(
            Llm(
                provider="together",
                model=LlmModels.LLAMA3_70B.value
            )
        )

    @inject_knowledge
    async def run(self, knowledge: str | None = None) -> str:
        self._send_start_callback()
        logger.info(f"Running Chief of Staff agent for request: {self.user_input.objective}")

        prompt = PROMPT_TEMPLATE.format(
            user_request=self.user_input.objective,
            current_business_status=self.current_business_status,
            strategic_directives=self.strategic_directives,
            knowledge=knowledge,
        )

        self._send_llm_start_callback(prompt, "together", LlmModels.LLAMA3_70B.value)
        response = await self.llm_client.chat(prompt)
        self._send_llm_end_callback(response)

        logger.info("Chief of Staff agent finished.")
        self._send_end_callback(response)
        return response


if __name__ == '__main__':
    async def main():
        user_input = UserInput(
            objective="Our user growth has stalled. We need a plan to re-ignite growth for our SaaS product.",
        )

        current_business_status = "MRR is flat at $5k/month. Churn is at 8%. Website traffic is down 15% month-over-month."
        strategic_directives = "The main company goal for Q3 is to increase user acquisition by 30%."

        agent = ChiefOfStaffAgent(
            user_input,
            current_business_status=current_business_status,
            strategic_directives=strategic_directives
        )
        result = await agent.run()
        print(json.dumps(json.loads(result), indent=2))

    asyncio.run(main())
