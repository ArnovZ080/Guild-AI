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
You are the Outbound Sales Agent, a specialist in targeted lead generation and personalized outreach. Your mission is to identify high-quality potential leads, gather relevant information for personalization, and craft compelling outreach messages to initiate sales conversations.

**1. Foundational Analysis (Do not include in output):**
    *   **Ideal Customer Profile (ICP):** {ideal_customer_profile}
    *   **Lead Source Preferences:** {lead_source_preferences}
    *   **Outreach Message Template / Core Value Prop:** {outreach_message_template}
    *   **Personalization Data Points to Find:** {personalization_data_points}
    *   **Key Insights & Knowledge (from web search on outbound sales):** {knowledge}

**2. Your Task:**
    Based on the foundational analysis, generate a list of qualified leads and a personalized outreach message for each. This is a simulation; you will identify real-world examples and craft messages as if you were about to send them.

**3. Output Format (JSON only):**
    {{
      "campaign_summary": {{
        "icp_summary": "A brief summary of the Ideal Customer Profile for this campaign.",
        "lead_sources_used": "The sources you will be 'searching' (e.g., 'LinkedIn Sales Navigator, Industry Blogs')."
      }},
      "qualified_leads": [
        {{
          "lead_name": "e.g., 'Jane Doe'",
          "company": "e.g., 'Acme Inc.'",
          "role": "e.g., 'VP of Marketing'",
          "source": "e.g., 'LinkedIn'",
          "contact_info_placeholder": "e.g., 'jane.doe@acmeinc.com' (This is a placeholder, do not generate real contact info).",
          "personalization_data": {{
            "recent_company_news": "e.g., 'Acme Inc. just launched a new product last week.'",
            "shared_connection": "e.g., 'We are both connected to John Smith.'",
            "recent_linkedin_post": "e.g., 'Loved your recent post on the future of marketing.'"
          }},
          "personalized_outreach_message": {{
            "subject": "e.g., 'Idea for Acme Inc.'s new product launch'",
            "body": "A highly personalized email body. Start with the personalization data, then connect it to the value proposition, and end with a clear, low-friction call-to-action."
          }}
        }}
      ]
    }}
"""


class OutboundSalesAgent(Agent):
    def __init__(self, user_input: UserInput, outreach_message_template: str, personalization_data_points: str, callback: AgentCallback = None):
        # user_input.objective should describe the Ideal Customer Profile.
        # user_input.additional_notes can describe lead source preferences.
        super().__init__(
            "Outbound Sales Agent",
            "Identifies potential leads, scrapes contact info, and personalizes outreach.",
            user_input,
            callback=callback
        )
        self.outreach_message_template = outreach_message_template
        self.personalization_data_points = personalization_data_points
        self.llm_client = LlmClient(
            Llm(
                provider="together",
                model=LlmModels.LLAMA3_70B.value
            )
        )

    @inject_knowledge
    async def run(self, knowledge: str | None = None) -> str:
        self._send_start_callback()
        logger.info(f"Running Outbound Sales agent for ICP: {self.user_input.objective}")

        prompt = PROMPT_TEMPLATE.format(
            ideal_customer_profile=self.user_input.objective,
            lead_source_preferences=self.user_input.additional_notes or "LinkedIn, Industry Blogs, Company Websites",
            outreach_message_template=self.outreach_message_template,
            personalization_data_points=self.personalization_data_points,
            knowledge=knowledge,
        )

        self._send_llm_start_callback(prompt, "together", LlmModels.LLAMA3_70B.value)
        response = await self.llm_client.chat(prompt)
        self._send_llm_end_callback(response)

        logger.info("Outbound Sales agent finished.")
        self._send_end_callback(response)
        return response


if __name__ == '__main__':
    async def main():
        user_input = UserInput(
            objective="VPs of Marketing at B2B SaaS companies in North America with 50-200 employees.",
            additional_notes="Focus on leads from LinkedIn Sales Navigator and G2."
        )

        outreach_message_template = "Our AI-powered copywriting tool can help your team reduce content creation time by 90%."
        personalization_data_points = "Find recent company news (like funding or product launches), shared connections on LinkedIn, or recent posts they've made."

        agent = OutboundSalesAgent(
            user_input,
            outreach_message_template=outreach_message_template,
            personalization_data_points=personalization_data_points
        )
        result = await agent.run()
        print(json.dumps(json.loads(result), indent=2))

    asyncio.run(main())
