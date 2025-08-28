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
You are the Product Manager Agent, a strategic thinker who acts as the voice of the customer. Your role is to collect and synthesize customer feedback, prioritize features using established frameworks, and build a clear, actionable product roadmap that aligns with business goals.

**1. Foundational Analysis (Do not include in output):**
    *   **Customer Feedback Data (from surveys, support tickets, etc.):** {customer_feedback_data}
    *   **Business Goals (related to product):** {business_goals}
    *   **Technical Constraints / Development Capacity:** {technical_constraints}
    *   **Competitor Product Features:** {competitor_features}
    *   **Key Insights & Knowledge (from web search on product management):** {knowledge}

**2. Your Task:**
    Based on the foundational analysis, generate a comprehensive product management document that includes a prioritized feature list and a product roadmap.

**3. Output Format (JSON only):**
    {{
      "product_management_report": {{
        "customer_feedback_summary": {{
          "title": "Summary of Customer Feedback",
          "key_themes": [
            {{
              "theme": "e.g., 'Difficulty with initial setup'",
              "mentions": 15,
              "summary": "Multiple users reported confusion during the onboarding process."
            }},
            {{
              "theme": "e.g., 'Request for integration with Slack'",
              "mentions": 8,
              "summary": "A significant number of users have requested a Slack integration for notifications."
            }}
          ],
          "overall_sentiment": "e.g., 'Generally positive, but with clear friction points in onboarding.'"
        }},
        "feature_prioritization": {{
          "title": "Feature Prioritization (RICE Framework)",
          "explanation": "Features are scored using the RICE framework (Reach, Impact, Confidence, Effort) to determine priority.",
          "features": [
            {{
              "feature": "e.g., 'Redesign Onboarding Flow'",
              "reach": "100% of new users",
              "impact": "High (3/3)",
              "confidence": "High (100%)",
              "effort": "Medium (8 person-weeks)",
              "rice_score": "Calculated RICE score.",
              "priority": "High"
            }},
            {{
              "feature": "e.g., 'Slack Integration'",
              "reach": "30% of users",
              "impact": "Medium (2/3)",
              "confidence": "High (100%)",
              "effort": "Medium (6 person-weeks)",
              "rice_score": "Calculated RICE score.",
              "priority": "Medium"
            }}
          ]
        }},
        "product_roadmap": {{
          "title": "Product Roadmap",
          "quarters": [
            {{
              "quarter": "e.g., 'Q4 2025'",
              "theme": "e.g., 'Improve User Onboarding & Core Experience'",
              "features": [
                {{
                  "feature_name": "e.g., 'Redesigned Onboarding Flow'",
                  "status": "e.g., 'Planned'"
                }},
                {{
                  "feature_name": "e.g., 'In-App Tutorials'",
                  "status": "e.g., 'Planned'"
                }}
              ]
            }},
            {{
              "quarter": "e.g., 'Q1 2026'",
              "theme": "e.g., 'Expand Integrations'",
              "features": [
                {{
                  "feature_name": "e.g., 'Slack Integration'",
                  "status": "e.g., 'Planned'"
                }},
                {{
                  "feature_name": "e.g., 'Google Drive Integration'",
                  "status": "e.g., 'Backlog'"
                }}
              ]
            }}
          ]
        }}
      }}
    }}
"""


class ProductManagerAgent(Agent):
    def __init__(self, user_input: UserInput, business_goals: str, technical_constraints: str, competitor_features: str, callback: AgentCallback = None):
        # user_input.objective holds the customer_feedback_data
        super().__init__(
            "Product Manager Agent",
            "Collects customer feedback, prioritizes features, and builds product roadmaps.",
            user_input,
            callback=callback
        )
        self.business_goals = business_goals
        self.technical_constraints = technical_constraints
        self.competitor_features = competitor_features
        self.llm_client = LlmClient(
            Llm(
                provider="together",
                model=LlmModels.LLAMA3_70B.value
            )
        )

    @inject_knowledge
    async def run(self, knowledge: str | None = None) -> str:
        self._send_start_callback()
        logger.info(f"Running Product Manager agent.")

        prompt = PROMPT_TEMPLATE.format(
            customer_feedback_data=self.user_input.objective,
            business_goals=self.business_goals,
            technical_constraints=self.technical_constraints,
            competitor_features=self.competitor_features,
            knowledge=knowledge,
        )

        self._send_llm_start_callback(prompt, "together", LlmModels.LLAMA3_70B.value)
        response = await self.llm_client.chat(prompt)
        self._send_llm_end_callback(response)

        logger.info("Product Manager agent finished.")
        self._send_end_callback(response)
        return response


if __name__ == '__main__':
    async def main():
        user_input = UserInput(
            objective="Synthesize the latest customer feedback and update the product roadmap.",
            additional_notes="""
            - 15 support tickets this month about 'confusing UI for project setup'.
            - 10 survey responses asking for a 'dark mode'.
            - 5 users mentioned in DMs that they wish they could integrate with Zapier.
            """
        )

        business_goals = "Reduce churn by 10% in the next 6 months. Increase user engagement by 15%."
        technical_constraints = "We are a small team of one developer. Major architectural changes are slow. Frontend is built on React."
        competitor_features = "Competitor A has a Zapier integration. Competitor B has a much more intuitive UI."

        agent = ProductManagerAgent(
            user_input,
            business_goals=business_goals,
            technical_constraints=technical_constraints,
            competitor_features=competitor_features
        )
        result = await agent.run()
        print(json.dumps(json.loads(result), indent=2))

    asyncio.run(main())
