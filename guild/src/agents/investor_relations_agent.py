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
You are the Investor Relations Agent, a specialist in fundraising strategy and investor communication. Your role is to help the solo-founder attract and maintain relationships with potential and existing investors by preparing compelling pitch decks, funding updates, and other communications.

**1. Foundational Analysis (Do not include in output):**
    *   **Communication Objective:** {communication_objective}
    *   **Target Investor Profile:** {target_investor_profile}
    *   **Business Plan Summary:** {business_plan_summary}
    *   **Financial Data & Projections:** {financial_data}
    *   **Traction Data (KPIs, Milestones):** {traction_data}
    *   **Key Insights & Knowledge (from web search on venture capital trends):** {knowledge}

**2. Your Task:**
    Based on the foundational analysis, generate the specific communication material requested. The output should be professional, data-driven, and tailored to an investor audience.

**3. Output Format (JSON only):**
    {{
      "communication_package": {{
        "objective": "A restatement of the communication objective.",
        "target_audience": "A summary of the target investor profile.",
        "key_talking_points": [
          "A bulleted list of the most critical points to convey.",
          "This should highlight the core investment opportunity and strengths."
        ],
        "pitch_deck_structure": {{
            "title": "Pitch Deck: [Company Name] - [Funding Round, e.g., Seed Round]",
            "slides": [
                {{ "slide_number": 1, "title": "Vision / Mission", "content": "A compelling one-liner vision for the company." }},
                {{ "slide_number": 2, "title": "The Problem", "content": "A clear and relatable description of the problem the business solves." }},
                {{ "slide_number": 3, "title": "The Solution", "content": "How your product/service solves the problem in a unique way." }},
                {{ "slide_number": 4, "title": "Market Opportunity", "content": "Data on the market size (TAM, SAM, SOM) and its growth potential." }},
                {{ "slide_number": 5, "title": "Product", "content": "A brief overview of the product, its key features, and a demo link if available." }},
                {{ "slide_number": 6, "title": "Business Model", "content": "How the business makes money (e.g., pricing, revenue streams)." }},
                {{ "slide_number": 7, "title": "Traction", "content": "Key metrics demonstrating progress (e.g., MRR, user growth, key customer logos)." }},
                {{ "slide_number": 8, "title": "Competitive Landscape", "content": "An analysis of competitors and your unique advantages." }},
                {{ "slide_number": 9, "title": "Team", "content": "Highlighting the solo-founder's unique qualifications and any key advisors." }},
                {{ "slide_number": 10, "title": "Financials", "content": "Summary of historical financials and future projections." }},
                {{ "slide_number": 11, "title": "The Ask", "content": "How much funding is being sought and how the funds will be used." }}
            ]
        }},
        "investor_update_email_draft": {{
            "subject": "e.g., 'Monthly Update for [Company Name] Investors'",
            "body": "A template for a monthly update email, including sections for highlights, KPIs, challenges, and asks."
        }}
      }}
    }}
"""


class InvestorRelationsAgent(Agent):
    def __init__(self, user_input: UserInput, target_investor_profile: str, business_plan_summary: str, financial_data: str, traction_data: str, callback: AgentCallback = None):
        # user_input.objective holds the communication_objective
        super().__init__(
            "Investor Relations Agent",
            "Prepares pitch decks, funding updates, and investor communications.",
            user_input,
            callback=callback
        )
        self.target_investor_profile = target_investor_profile
        self.business_plan_summary = business_plan_summary
        self.financial_data = financial_data
        self.traction_data = traction_data
        self.llm_client = LlmClient(
            Llm(
                provider="together",
                model=LlmModels.LLAMA3_70B.value
            )
        )

    @inject_knowledge
    async def run(self, knowledge: str | None = None) -> str:
        self._send_start_callback()
        logger.info(f"Running Investor Relations agent for objective: {self.user_input.objective}")

        prompt = PROMPT_TEMPLATE.format(
            communication_objective=self.user_input.objective,
            target_investor_profile=self.target_investor_profile,
            business_plan_summary=self.business_plan_summary,
            financial_data=self.financial_data,
            traction_data=self.traction_data,
            knowledge=knowledge,
        )

        self._send_llm_start_callback(prompt, "together", LlmModels.LLAMA3_70B.value)
        response = await self.llm_client.chat(prompt)
        self._send_llm_end_callback(response)

        logger.info("Investor Relations agent finished.")
        self._send_end_callback(response)
        return response


if __name__ == '__main__':
    async def main():
        user_input = UserInput(
            objective="Prepare a seed round pitch deck to raise $500,000.",
        )

        target_investor_profile = "Angel investors and early-stage VCs focused on B2B SaaS."
        business_plan_summary = "We are an AI-powered copywriting tool for solo-founders, aiming to capture 5% of a $1B market."
        financial_data = "Currently at $5k MRR, projecting $50k MRR in 12 months post-funding. Healthy gross margins of 90%."
        traction_data = "1,000+ users on the free plan, 100 paying customers. User growth is 20% month-over-month. Positive testimonials from 10 users."

        agent = InvestorRelationsAgent(
            user_input,
            target_investor_profile=target_investor_profile,
            business_plan_summary=business_plan_summary,
            financial_data=financial_data,
            traction_data=traction_data
        )
        result = await agent.run()
        print(json.dumps(json.loads(result), indent=2))

    asyncio.run(main())
