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
You are the Outsourcing & Freelancer Management Agent, an expert in efficient delegation. Your role is to take tasks identified for outsourcing, find suitable freelancers, and manage the process from hiring to delivery and payment.

**1. Foundational Analysis (Do not include in output):**
    *   **Task to Outsource:** {task_for_outsourcing}
    *   **Detailed Requirements / Scope:** {task_details}
    *   **Budget:** {budget}
    *   **Deadline:** {deadline}
    *   **Preferred Platforms (e.g., Upwork, Fiverr):** {preferred_platforms}
    *   **Key Insights & Knowledge (from web search on effective outsourcing):** {knowledge}

**2. Your Task:**
    Based on the foundational analysis, generate a complete outsourcing plan for the specified task. This includes creating a job post, identifying suitable freelancer profiles (simulated), and outlining the management process.

**3. Output Format (JSON only):**
    {{
      "outsourcing_plan": {{
        "task_name": "The name of the task to be outsourced.",
        "job_posting": {{
          "title": "A clear, attractive title for the job post (e.g., 'Expert Graphic Designer Needed for SaaS Logo').",
          "description": "A detailed description of the project, scope, deliverables, and required skills.",
          "budget_and_timeline": "State the budget and deadline clearly.",
          "screening_questions": [
            "e.g., 'Please provide a link to your portfolio with at least 3 similar logo designs.'",
            "e.g., 'What is your process for logo design and revisions?'"
          ]
        }},
        "freelancer_shortlist_simulation": [
          {{
            "freelancer_profile_name": "e.g., 'CreativeLogos'",
            "platform": "e.g., 'Fiverr'",
            "rating": "e.g., '4.9 stars (1,200 reviews)'",
            "why_a_good_fit": "e.g., 'Specializes in minimalist logos for tech companies. Portfolio shows strong relevant examples. Price is within budget.'"
          }},
          {{
            "freelancer_profile_name": "e.g., 'Jane D.'",
            "platform": "e.g., 'Upwork'",
            "rating": "e.g., 'Top Rated Plus, 100% Job Success'",
            "why_a_good_fit": "e.g., 'Extensive experience with SaaS branding. Higher price point but likely higher quality and better communication.'"
          }}
        ],
        "management_protocol": {{
          "communication_plan": "e.g., 'Daily check-in via platform messages. One kickoff call to align on vision.'",
          "milestone_and_payment_schedule": "e.g., '50% payment upon hiring to start the project. 50% payment upon final delivery and approval.'",
          "quality_assurance_steps": "e.g., '1. Initial concepts review. 2. Mid-project check-in on chosen direction. 3. Final review of all file formats against requirements.'",
          "contract_key_points": "A list of key terms to include in the contract (e.g., '2 rounds of revisions included', 'All intellectual property rights transfer to the client upon final payment')."
        }}
      }}
    }}
"""


class OutsourcingAgent(Agent):
    def __init__(self, user_input: UserInput, task_details: str, budget: str, deadline: str, preferred_platforms: str = "Upwork, Fiverr", callback: AgentCallback = None):
        # user_input.objective holds the task_for_outsourcing
        super().__init__(
            "Outsourcing & Freelancer Management Agent",
            "Simplifies outsourcing by finding freelancers and managing the process.",
            user_input,
            callback=callback
        )
        self.task_details = task_details
        self.budget = budget
        self.deadline = deadline
        self.preferred_platforms = preferred_platforms
        self.llm_client = LlmClient(
            Llm(
                provider="together",
                model=LlmModels.LLAMA3_70B.value
            )
        )

    @inject_knowledge
    async def run(self, knowledge: str | None = None) -> str:
        self._send_start_callback()
        logger.info(f"Running Outsourcing agent for task: {self.user_input.objective}")

        prompt = PROMPT_TEMPLATE.format(
            task_for_outsourcing=self.user_input.objective,
            task_details=self.task_details,
            budget=self.budget,
            deadline=self.deadline,
            preferred_platforms=self.preferred_platforms,
            knowledge=knowledge,
        )

        self._send_llm_start_callback(prompt, "together", LlmModels.LLAMA3_70B.value)
        response = await self.llm_client.chat(prompt)
        self._send_llm_end_callback(response)

        logger.info("Outsourcing agent finished.")
        self._send_end_callback(response)
        return response


if __name__ == '__main__':
    async def main():
        user_input = UserInput(
            objective="Design a new logo for our SaaS product 'Analytica'.",
        )

        task_details = "We need a modern, minimalist logo. It should be clean and professional. Deliverables should include vector files (SVG, AI) and high-res PNGs for web and print. The logo should represent data and clarity."
        budget = "$500"
        deadline = "2 weeks"

        agent = OutsourcingAgent(
            user_input,
            task_details=task_details,
            budget=budget,
            deadline=deadline
        )
        result = await agent.run()
        print(json.dumps(json.loads(result), indent=2))

    asyncio.run(main())
