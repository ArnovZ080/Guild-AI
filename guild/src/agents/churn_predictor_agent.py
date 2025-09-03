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
You are the Churn Predictor Agent, a data analyst specializing in customer retention and predictive modeling. Your role is to monitor customer behavior, identify patterns that indicate a high risk of churn, and flag at-risk users to enable proactive retention efforts.

**1. Foundational Analysis (Do not include in output):**
    *   **Customer Behavior Data (Usage, logins, support tickets, etc.):** {customer_behavior_data}
    *   **Customer Segmentation Data:** {customer_segmentation_data}
    *   **Definition of 'Churn' for this business:** {churn_definition}
    *   **Key Insights & Knowledge (from web search on churn prediction models):** {knowledge}

**2. Your Task:**
    Based on the foundational analysis, process the customer data to identify users who are at a high risk of churning. For each at-risk user, provide their risk score, the key contributing factors, and a recommended intervention strategy.

**3. Output Format (JSON only):**
    {{
      "churn_prediction_report": {{
        "period": "e.g., 'August 2025'",
        "summary": {{
            "total_customers_analyzed": "The total number of customers in the dataset.",
            "at_risk_customers_identified": "The number of customers flagged as high-risk.",
            "overall_churn_risk": "e.g., 'Low', 'Moderate', 'High'",
            "common_churn_indicators": ["e.g., 'Significant drop in login frequency', 'Failure to adopt key feature X', 'Multiple unresolved support tickets'"]
        }},
        "at_risk_customer_list": [
            {{
                "customer_id_placeholder": "e.g., 'CUST-00123'",
                "customer_segment": "e.g., 'Small Business'",
                "churn_probability_score": "e.g., 0.85",
                "key_contributing_factors": [
                    "Login frequency dropped from daily to weekly in the last month.",
                    "Has not used the 'Reporting' feature, a key sticky feature for this segment.",
                    "Submitted a support ticket 2 weeks ago that remains open."
                ],
                "recommended_intervention_strategy": "e.g., 'Proactive outreach from Customer Support to check in and offer a personalized tutorial on the 'Reporting' feature. Escalate their open support ticket with high priority.'"
            }},
            {{
                "customer_id_placeholder": "e.g., 'CUST-00456'",
                "customer_segment": "e.g., 'Solo-Founder'",
                "churn_probability_score": "e.g., 0.72",
                "key_contributing_factors": [
                    "Credit card on file is expiring in 7 days.",
                    "Usage has remained flat for 3 months."
                ],
                "recommended_intervention_strategy": "e.g., 'Trigger an automated 'Update Your Billing' email sequence. Offer a 10% discount for switching to an annual plan.'"
            }}
        ]
      }}
    }}
"""


class ChurnPredictorAgent(Agent):
    def __init__(self, user_input: UserInput, customer_segmentation_data: str, churn_definition: str, callback: AgentCallback = None):
        # user_input.objective holds the customer_behavior_data
        super().__init__(
            "Churn Predictor Agent",
            "Monitors customer behavior and flags at-risk users before they cancel.",
            user_input,
            callback=callback
        )
        self.customer_segmentation_data = customer_segmentation_data
        self.churn_definition = churn_definition
        self.llm_client = LlmClient(
            Llm(
                provider="together",
                model=LlmModels.LLAMA3_70B.value
            )
        )

    @inject_knowledge
    async def run(self, knowledge: str | None = None) -> str:
        self._send_start_callback()
        logger.info(f"Running Churn Predictor agent.")

        prompt = PROMPT_TEMPLATE.format(
            customer_behavior_data=self.user_input.objective,
            customer_segmentation_data=self.customer_segmentation_data,
            churn_definition=self.churn_definition,
            knowledge=knowledge,
        )

        self._send_llm_start_callback(prompt, "together", LlmModels.LLAMA3_70B.value)
        response = await self.llm_client.chat(prompt)
        self._send_llm_end_callback(response)

        logger.info("Churn Predictor agent finished.")
        self._send_end_callback(response)
        return response


if __name__ == '__main__':
    async def main():
        user_input = UserInput(
            objective="""
            [
                {"id": "CUST-00123", "logins_last_30_days": 4, "key_features_used": 1, "open_tickets": 1, "billing_status": "Active"},
                {"id": "CUST-00789", "logins_last_30_days": 28, "key_features_used": 5, "open_tickets": 0, "billing_status": "Active"},
                {"id": "CUST-00456", "logins_last_30_days": 15, "key_features_used": 3, "open_tickets": 0, "billing_status": "Card Expiring Soon"}
            ]
            """,
        )

        customer_segmentation_data = "CUST-00123 is 'Small Business'. CUST-00789 is 'Power User'. CUST-00456 is 'Solo-Founder'."
        churn_definition = "Churn is defined as a customer not logging in for 30 consecutive days or cancelling their subscription."

        agent = ChurnPredictorAgent(
            user_input,
            customer_segmentation_data=customer_segmentation_data,
            churn_definition=churn_definition
        )
        result = await agent.run()
        print(json.dumps(json.loads(result), indent=2))

    asyncio.run(main())
