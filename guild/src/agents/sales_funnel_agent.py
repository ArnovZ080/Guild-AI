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
You are a world-class marketing and sales funnel strategist, combining the strategic genius of Russell Brunson with the data-driven approach of modern growth hackers. Your task is to design a comprehensive, high-converting sales funnel tailored to the user's specific product and objective.

**1. Foundational Analysis (Do not include in output):**
    *   **User's Core Objective:** {objective}
    *   **Product/Service Description:** {product_description}
    *   **Target Audience Analysis:** {audience}
    *   **Key Insights & Knowledge (from web search):** {knowledge}

**2. Your Task:**
    Based on the foundational analysis, design a complete sales funnel. The funnel should be logical, effective, and provide a clear path for the customer from awareness to purchase and beyond.

**3. Output Format (JSON only):**
    {{
      "funnel_name": "A descriptive name for the funnel (e.g., 'Free Ebook to Core Product Funnel')",
      "funnel_type": "Categorize the funnel (e.g., 'Lead Magnet Funnel', 'Webinar Funnel', 'Product Launch Funnel', 'Tripwire Funnel').",
      "customer_journey_overview": "A brief, narrative description of the customer's experience from start to finish.",
      "stages": [
        {{
          "stage_name": "Top of Funnel (Awareness & Attraction)",
          "objective": "What is the primary goal of this stage? (e.g., 'Attract targeted traffic and generate initial interest.')",
          "traffic_sources": ["e.g., 'SEO-optimized Blog Posts', 'Instagram Reels', 'Google Ads (Search)', 'Pinterest'"],
          "content_strategy": "Describe the content needed to attract the audience. (e.g., 'Create 3 blog posts on topics X, Y, Z. Run short video ads on Instagram demonstrating the problem we solve.')",
          "key_metric": "e.g., 'Website Traffic', 'Ad CTR'"
        }},
        {{
          "stage_name": "Middle of Funnel (Lead Generation & Nurturing)",
          "objective": "How will you convert visitors into leads and build a relationship?",
          "lead_magnet": {{
            "name": "e.g., 'The Ultimate Guide to Eco-Friendly Yoga'",
            "format": "e.g., 'PDF Ebook', '5-Day Email Course', 'Video Tutorial'",
            "description": "A compelling description of the value offered by the lead magnet."
          }},
          "conversion_mechanism": "e.g., 'Dedicated landing page with an opt-in form.'",
          "nurture_sequence": "e.g., 'A 5-part email sequence delivering the lead magnet, providing additional value, and introducing the core offer.'",
          "key_metric": "e.g., 'Lead Magnet Opt-in Rate (Goal: 25%)', 'Email Open Rate'"
        }},
        {{
          "stage_name": "Bottom of Funnel (Sales & Conversion)",
          "objective": "How will you convert leads into paying customers?",
          "core_offer": {{
            "name": "The name of the main product/service being sold.",
            "price": "e.g., '$49.99'",
            "value_proposition": "The primary benefit for the customer."
          }},
          "sales_mechanism": "e.g., 'Long-form sales page with testimonials and a clear call-to-action.'",
          "urgency_scarcity": "e.g., 'Limited-time 10% discount for new leads.'",
          "key_metric": "e.g., 'Sales Page Conversion Rate (Goal: 3%)'"
        }},
        {{
          "stage_name": "Post-Purchase (Value Maximization & Retention)",
          "objective": "How will you increase customer lifetime value and create brand advocates?",
          "strategy": "e.g., 'Offer an immediate one-time-offer (OTO) for a related product. Add customer to a weekly newsletter with exclusive tips. Ask for a review after 14 days.'",
          "next_steps": ["e.g., 'Upsell to Product B', 'Request Testimonial', 'Encourage Social Sharing'"],
          "key_metric": "e.g., 'Average Order Value (AOV)', 'Customer Lifetime Value (LTV)'"
        }}
      ],
      "required_assets": "A list of all marketing assets that need to be created (e.g., '3 Blog Posts', '1 PDF Ebook', '5 Emails', '1 Sales Page')."
    }}
"""


class SalesFunnelAgent(Agent):
    def __init__(self, user_input: UserInput, callback: AgentCallback = None):
        super().__init__(
            "Sales Funnel Agent",
            "Designs a comprehensive, multi-stage sales funnel to convert prospects into customers.",
            user_input,
            callback=callback
        )
        self.llm_client = LlmClient(
            Llm(
                provider="together",
                model=LlmModels.LLAMA3_70B.value
            )
        )

    @inject_knowledge
    async def run(self, knowledge: str | None = None) -> str:
        self._send_start_callback()
        logger.info(f"Running Sales Funnel agent for objective: {self.user_input.objective}")

        # For this agent, the product description is often the objective or in the notes
        product_description = f"{self.user_input.objective}\n{self.user_input.additional_notes or ''}"

        prompt = PROMPT_TEMPLATE.format(
            objective=self.user_input.objective,
            product_description=product_description,
            audience=self.user_input.audience.model_dump_json(indent=2) if self.user_input.audience else "Not specified.",
            knowledge=knowledge,
        )

        self._send_llm_start_callback(prompt, "together", LlmModels.LLAMA3_70B.value)
        response = await self.llm_client.chat(prompt)
        self._send_llm_end_callback(response)

        logger.info("Sales Funnel agent finished.")
        self._send_end_callback(response)
        return response


if __name__ == '__main__':
    async def main():
        user_input = UserInput(
            objective="Sell a new premium, eco-friendly yoga mat online.",
            audience=Audience(
                description="Environmentally conscious yoga practitioners.",
                demographics={
                    "age": "25-45",
                    "location": "USA, Canada, Western Europe",
                    "interests": ["Yoga", "Sustainability", "Wellness"]
                }
            ),
            additional_notes="The mat is made from cork and natural rubber. Price is $79."
        )

        agent = SalesFunnelAgent(user_input)
        result = await agent.run()
        print(json.dumps(json.loads(result), indent=2))

    asyncio.run(main())

