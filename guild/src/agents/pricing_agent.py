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
You are the Pricing Agent, a specialist in pricing strategy, revenue optimization, and market analysis. Your role is to continuously test and optimize the pricing for the solo-founder's products or services to maximize revenue and profitability while remaining competitive.

**1. Foundational Analysis (Do not include in output):**
    *   **Product/Service Details:** {product_details}
    *   **Current Pricing Model:** {current_pricing}
    *   **Pricing Objective (e.g., maximize profit, maximize market share):** {pricing_objective}
    *   **Competitor Pricing & Value Analysis:** {competitor_pricing_data}
    *   **Customer Feedback on Pricing:** {customer_feedback}
    *   **Key Insights & Knowledge (from web search on pricing models):** {knowledge}

**2. Your Task:**
    Based on the foundational analysis, generate a comprehensive pricing strategy document. The document should analyze the current situation and provide actionable recommendations for testing and optimization.

**3. Output Format (JSON only):**
    {{
      "pricing_strategy_report": {{
        "objective": "A restatement of the primary pricing objective.",
        "current_pricing_analysis": "A brief analysis of the current pricing model's strengths and weaknesses.",
        "competitor_analysis_summary": "Key insights from analyzing competitor pricing. Are we priced high, low, or average? How does our value proposition compare?",
        "customer_value_analysis": "An analysis of customer feedback and perceived value. Are customers price-sensitive? Do they see the product as high-value?",
        "recommended_pricing_strategy": {{
          "strategy_name": "e.g., 'Three-Tier Value-Based Pricing'",
          "description": "A description of the recommended pricing model.",
          "tiers": [
            {{
              "tier_name": "e.g., 'Basic'",
              "price": "e.g., '$19/month'",
              "target_customer": "e.g., 'Hobbyists and beginners'",
              "key_features": ["List of features included in this tier."]
            }},
            {{
              "tier_name": "e.g., 'Pro'",
              "price": "e.g., '$49/month'",
              "target_customer": "e.g., 'Professionals and small businesses'",
              "key_features": ["All features from Basic, plus..."]
            }},
            {{
              "tier_name": "e.g., 'Enterprise'",
              "price": "e.g., 'Contact Us'",
              "target_customer": "e.g., 'Large teams and agencies'",
              "key_features": ["All features from Pro, plus..."]
            }}
          ],
          "psychological_pricing_tactics": ["e.g., 'Use charm pricing ($49 instead of $50)', 'Anchor the Pro plan as the 'Most Popular' option.'"]
        }},
        "ab_testing_plan": {{
          "hypothesis": "e.g., 'We believe that introducing a lower-priced Basic tier will increase new trial signups by 25% without significantly cannibalizing Pro plan subscriptions.'",
          "test_description": "How to run the test (e.g., 'Run a 50/50 split test on the pricing page for 30 days, showing the old pricing to one group and the new three-tier pricing to the other.').",
          "key_metrics_to_track": ["e.g., 'Trial-to-paid conversion rate for each tier', 'Overall revenue per visitor', 'Customer Lifetime Value (LTV) by tier.'"]
        }}
      }}
    }}
"""


class PricingAgent(Agent):
    def __init__(self, user_input: UserInput, product_details: str, current_pricing: str, competitor_pricing_data: str, customer_feedback: str, callback: AgentCallback = None):
        # user_input.objective holds the pricing_objective
        super().__init__(
            "Pricing Agent",
            "Tests and optimizes pricing strategy for products and services.",
            user_input,
            callback=callback
        )
        self.product_details = product_details
        self.current_pricing = current_pricing
        self.competitor_pricing_data = competitor_pricing_data
        self.customer_feedback = customer_feedback
        self.llm_client = LlmClient(
            Llm(
                provider="together",
                model=LlmModels.LLAMA3_70B.value
            )
        )

    @inject_knowledge
    async def run(self, knowledge: str | None = None) -> str:
        self._send_start_callback()
        logger.info(f"Running Pricing agent for objective: {self.user_input.objective}")

        prompt = PROMPT_TEMPLATE.format(
            pricing_objective=self.user_input.objective,
            product_details=self.product_details,
            current_pricing=self.current_pricing,
            competitor_pricing_data=self.competitor_pricing_data,
            customer_feedback=self.customer_feedback,
            knowledge=knowledge,
        )

        self._send_llm_start_callback(prompt, "together", LlmModels.LLAMA3_70B.value)
        response = await self.llm_client.chat(prompt)
        self._send_llm_end_callback(response)

        logger.info("Pricing agent finished.")
        self._send_end_callback(response)
        return response


if __name__ == '__main__':
    async def main():
        user_input = UserInput(
            objective="Maximize revenue for our SaaS product without alienating our existing user base.",
        )

        product_details = "AI copywriting tool with features for generating blog posts, ad copy, and social media content."
        current_pricing = "A single plan at $39/month for unlimited usage."
        competitor_pricing_data = "Competitor A has tiers at $29/$59/$99. Competitor B has a usage-based model."
        customer_feedback = "Some users say it's a great value, while some larger teams have asked for more advanced features and would be willing to pay more."

        agent = PricingAgent(
            user_input,
            product_details=product_details,
            current_pricing=current_pricing,
            competitor_pricing_data=competitor_pricing_data,
            customer_feedback=customer_feedback
        )
        result = await agent.run()
        print(json.dumps(json.loads(result), indent=2))

    asyncio.run(main())
