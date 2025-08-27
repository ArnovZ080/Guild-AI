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
You are the Partnerships Agent, a savvy business development professional who excels at identifying and forging strategic partnerships, joint ventures (JVs), and affiliate relationships to drive growth.

**1. Foundational Analysis (Do not include in output):**
    *   **Partnership Objective:** {partnership_objective}
    *   **Ideal Partner Profile:** {ideal_partner_profile}
    *   **Solo-Founder's Offerings/Resources:** {available_resources}
    *   **Key Insights & Knowledge (from web search on partnership strategy):** {knowledge}

**2. Your Task:**
    Based on the foundational analysis, create a comprehensive strategic plan for identifying and engaging potential partners.

**3. Output Format (JSON only):**
    {{
      "partnership_strategy_summary": {{
        "objective": "A clear restatement of the partnership goal.",
        "ideal_partner_profile_summary": "A summary of the ideal partner type (e.g., 'Complementary SaaS products with a similar audience of solo-founders').",
        "proposed_collaboration_models": ["e.g., 'Affiliate Program', 'Content Swap', 'Joint Webinar', 'Product Integration'"]
      }},
      "target_partner_prospects": [
        {{
          "partner_name": "e.g., 'ProductivityTool.io'",
          "partner_type": "e.g., 'Complementary SaaS'",
          "synergy_analysis": "Why they are a good fit. (e.g., 'Their audience of productivity-focused founders would find our AI copywriting tool highly valuable. We could offer a bundled deal.')"
        }},
        {{
          "partner_name": "e.g., 'The Solo-Founder Podcast'",
          "partner_type": "e.g., 'Media/Influencer'",
          "synergy_analysis": "e.g., 'Sponsoring their podcast or appearing as a guest would give us direct access to our target audience.'"
        }}
      ],
      "outreach_proposal_template": {{
        "subject": "e.g., 'Partnership Idea: [Your Company] + [Partner Company]'",
        "body": "A customizable email template for outreach. It should be concise, highlight the mutual benefit, and propose a clear next step (e.g., a brief 15-minute call)."
      }},
      "affiliate_program_details": {{
        "is_recommended": true,
        "commission_structure": "e.g., '25% recurring commission for the first 12 months.'",
        "payout_terms": "e.g., 'Monthly payouts via PayPal, 30-day cookie window.'",
        "promotional_materials_to_provide": ["e.g., 'Email swipe copy', 'Branded banners', 'Social media templates'"]
      }},
      "key_legal_considerations": "A list of key points to include in any partnership agreement (e.g., 'Commission terms, Exclusivity clause (if any), Termination conditions, Intellectual property rights')."
    }}
"""


class PartnershipsAgent(Agent):
    def __init__(self, user_input: UserInput, ideal_partner_profile: str, available_resources: str, callback: AgentCallback = None):
        # user_input.objective holds the partnership_objective
        super().__init__(
            "Partnerships Agent",
            "Identifies and manages joint venture and affiliate opportunities.",
            user_input,
            callback=callback
        )
        self.ideal_partner_profile = ideal_partner_profile
        self.available_resources = available_resources
        self.llm_client = LlmClient(
            Llm(
                provider="together",
                model=LlmModels.LLAMA3_70B.value
            )
        )

    @inject_knowledge
    async def run(self, knowledge: str | None = None) -> str:
        self._send_start_callback()
        logger.info(f"Running Partnerships agent for objective: {self.user_input.objective}")

        prompt = PROMPT_TEMPLATE.format(
            partnership_objective=self.user_input.objective,
            ideal_partner_profile=self.ideal_partner_profile,
            available_resources=self.available_resources,
            knowledge=knowledge,
        )

        self._send_llm_start_callback(prompt, "together", LlmModels.LLAMA3_70B.value)
        response = await self.llm_client.chat(prompt)
        self._send_llm_end_callback(response)

        logger.info("Partnerships agent finished.")
        self._send_end_callback(response)
        return response


if __name__ == '__main__':
    async def main():
        user_input = UserInput(
            objective="Acquire 500 new trial users for our AI copywriting tool through partnerships.",
        )

        ideal_partner_profile = "Established creators and SaaS companies who serve an audience of solo-founders, marketers, and small business owners. They should have an email list of at least 10,000 subscribers."
        available_resources = "We can offer a generous 30% recurring affiliate commission. We can also provide unique content (blog posts, webinars) for the partner's audience."

        agent = PartnershipsAgent(
            user_input,
            ideal_partner_profile=ideal_partner_profile,
            available_resources=available_resources
        )
        result = await agent.run()
        print(json.dumps(json.loads(result), indent=2))

    asyncio.run(main())
