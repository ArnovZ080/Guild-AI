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
You are a world-class CRM and Marketing Automation expert, skilled in platforms like HubSpot, ActiveCampaign, and Systeme.io. Your task is to design a complete CRM setup and automation strategy to manage leads and customers effectively.

**1. Foundational Analysis (Do not include in output):**
    *   **User's Core Objective:** {objective}
    *   **Target Audience Analysis:** {audience}
    *   **Sales Funnel Plan:** {sales_funnel_context}
    *   **Key Insights & Knowledge (from web search):** {knowledge}

**2. Your Task:**
    Based on the foundational analysis, particularly the sales funnel plan, design a detailed CRM and automation plan. The plan should be practical for a solo-founder, focusing on efficiency and scalability.

**3. Output Format (JSON only):**
    {{
      "recommended_crm_platform": "e.g., 'HubSpot (Free Tier)', 'Brevo', 'Systeme.io'. Justify the choice based on the user's needs and funnel complexity.",
      "lead_capture_setup": {{
        "source": "Where will leads come from? (e.g., 'Opt-in form on the lead magnet landing page').",
        "data_points_to_capture": ["e.g., 'Email', 'First Name', 'Lead Source (hidden field)', 'Lead Magnet Downloaded (tag)']"
      }},
      "contact_properties": "List of custom properties to create in the CRM to store important customer data (e.g., 'Primary Interest', 'Last Purchase Date', 'Lifecycle Stage').",
      "lead_scoring_model": {{
        "description": "A simple lead scoring model to identify the most engaged prospects.",
        "criteria": [
          {{ "action": "Opened an email", "points": 1 }},
          {{ "action": "Clicked a link in an email", "points": 3 }},
          {{ "action": "Visited the pricing page", "points": 5 }},
          {{ "action": "Downloaded a lead magnet", "points": 10 }}
        ],
        "thresholds": [
          {{ "score": 20, "status": "Marketing Qualified Lead (MQL)", "action": "Notify solo-founder to review." }},
          {{ "score": 50, "status": "Sales Qualified Lead (SQL)", "action": "Trigger a personalized outreach task." }}
        ]
      }},
      "segmentation_strategy": [
        {{
          "segment_name": "New Subscribers",
          "criteria": "Contacts who downloaded the initial lead magnet in the last 7 days."
        }},
        {{
          "segment_name": "Engaged Leads",
          "criteria": "Contacts with a lead score above 20 who have not yet purchased."
        }},
        {{
          "segment_name": "Customers",
          "criteria": "Contacts who have made at least one purchase."
        }}
      ],
      "automation_workflows": [
        {{
          "name": "New Lead Nurture Sequence",
          "trigger": "Contact is added to the 'New Subscribers' segment.",
          "steps": [
            "Wait 1 hour, send Email 1: Welcome & deliver lead magnet.",
            "Wait 2 days, send Email 2: Provide additional value related to the lead magnet.",
            "Wait 2 days, send Email 3: Introduce the core offer and share a case study.",
            "Wait 1 day, send Email 4: Final call-to-action with urgency."
          ]
        }},
        {{
          "name": "Post-Purchase Follow-up",
          "trigger": "Contact makes a purchase.",
          "steps": [
            "Immediately send Email 1: Order confirmation and thank you.",
            "Wait 7 days, send Email 2: Ask for a review or testimonial.",
            "Wait 30 days, send Email 3: Offer a discount on their next purchase or introduce a complementary product."
          ]
        }}
      ]
    }}
"""


class CRMAgent(Agent):
    def __init__(self, user_input: UserInput, sales_funnel_context: str, callback: AgentCallback = None):
        super().__init__(
            "CRM Agent",
            "Designs a CRM setup and marketing automation strategy.",
            user_input,
            callback=callback
        )
        self.sales_funnel_context = sales_funnel_context
        self.llm_client = LlmClient(
            Llm(
                provider="together",
                model=LlmModels.LLAMA3_70B.value
            )
        )

    @inject_knowledge
    async def run(self, knowledge: str | None = None) -> str:
        self._send_start_callback()
        logger.info(f"Running CRM agent for objective: {self.user_input.objective}")

        prompt = PROMPT_TEMPLATE.format(
            objective=self.user_input.objective,
            audience=self.user_input.audience.model_dump_json(indent=2) if self.user_input.audience else "Not specified.",
            sales_funnel_context=self.sales_funnel_context,
            knowledge=knowledge,
        )

        self._send_llm_start_callback(prompt, "together", LlmModels.LLAMA3_70B.value)
        response = await self.llm_client.chat(prompt)
        self._send_llm_end_callback(response)

        logger.info("CRM agent finished.")
        self._send_end_callback(response)
        return response


if __name__ == '__main__':
    async def main():
        user_input = UserInput(
            objective="Sell a new premium, eco-friendly yoga mat online.",
            audience=Audience(
                description="Environmentally conscious yoga practitioners.",
                demographics={"age": "25-45", "interests": ["Yoga", "Sustainability"]}
            ),
        )

        # This context would come from the SalesFunnelAgent in a real run
        sales_funnel_context = """
        {
          "funnel_name": "Free Ebook to Core Product Funnel",
          "funnel_type": "Lead Magnet Funnel",
          "stages": [
            {
              "stage_name": "Middle of Funnel (Lead Generation & Nurturing)",
              "lead_magnet": {
                "name": "The Ultimate Guide to Eco-Friendly Yoga",
                "format": "PDF Ebook"
              }
            },
            {
              "stage_name": "Bottom of Funnel (Sales & Conversion)",
              "core_offer": {
                "name": "The 'Aura' Cork Yoga Mat"
              }
            }
          ]
        }
        """

        agent = CRMAgent(user_input, sales_funnel_context=sales_funnel_context)
        result = await agent.run()
        print(json.dumps(json.loads(result), indent=2))

    asyncio.run(main())
