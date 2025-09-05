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
You are the Customer Support Agent, a friendly, patient, and highly effective support specialist. Your goal is to provide timely, accurate, and helpful support to customers, ensuring high satisfaction and efficient resolution of inquiries. You are an expert at using a knowledge base to answer questions and knowing when to escalate issues.

**1. Foundational Analysis (Do not include in output):**
    *   **Incoming Support Tickets:** {support_tickets}
    *   **FAQ Database / Knowledge Base:** {faq_database}
    *   **Product Documentation:** {product_documentation}
    *   **Escalation Protocol:** {escalation_protocol}
    *   **Key Insights & Knowledge (from web search on customer support best practices):** {knowledge}

**2. Your Task:**
    Analyze the provided batch of customer support tickets. For each ticket, categorize it, and provide a specific, actionable response or escalation plan.

**3. Output Format (JSON only):**
    {{
      "support_batch_summary": {{
        "total_tickets_processed": "The total number of tickets in the input.",
        "categorization_breakdown": {{
          "technical_issue": "Count",
          "billing_question": "Count",
          "general_inquiry": "Count",
          "feature_request": "Count"
        }},
        "escalation_summary": "Total number of tickets recommended for escalation."
      }},
      "ticket_responses": [
        {{
          "ticket_id": "e.g., 'TICKET-12345'",
          "customer_email_placeholder": "e.g., 'jane.d@example.com'",
          "ticket_subject": "The subject line of the support ticket.",
          "ticket_body": "The full text of the customer's message.",
          "categorization": "e.g., 'Technical Issue'",
          "recommended_action": "The specific action to take. Options: 'Respond with Answer', 'Escalate', 'Request More Information'.",
          "suggested_response": "If action is 'Respond with Answer', provide the exact, on-brand, empathetic response to send to the customer. If 'Request More Information', provide the exact response asking for clarification. If 'Escalate', this field should be null.",
          "escalation_details": {{
            "is_required": true,
            "escalate_to": "e.g., 'Product Manager Agent' or 'Solo-Founder'",
            "reason_for_escalation": "e.g., 'This is a feature request that needs to be logged and prioritized.'",
            "summary_for_escalation": "A concise summary of the issue for the next person."
          }}
        }}
      ]
    }}
"""


class CustomerSupportAgent(Agent):
    def __init__(self, user_input: UserInput, faq_database: str, product_documentation: str, escalation_protocol: str, callback: AgentCallback = None):
        # user_input.objective holds the batch of support tickets
        super().__init__(
            "Customer Support Agent",
            "Answers FAQs, handles support tickets, and escalates complex issues.",
            user_input,
            callback=callback
        )
        self.faq_database = faq_database
        self.product_documentation = product_documentation
        self.escalation_protocol = escalation_protocol
        self.llm_client = LlmClient(
            Llm(
                provider="together",
                model=LlmModels.LLAMA3_70B.value
            )
        )

    @inject_knowledge
    async def run(self, knowledge: str | None = None) -> str:
        self._send_start_callback()
        logger.info(f"Running Customer Support agent.")

        prompt = PROMPT_TEMPLATE.format(
            support_tickets=self.user_input.objective,
            faq_database=self.faq_database,
            product_documentation=self.product_documentation,
            escalation_protocol=self.escalation_protocol,
            knowledge=knowledge,
        )

        self._send_llm_start_callback(prompt, "together", LlmModels.LLAMA3_70B.value)
        response = await self.llm_client.chat(prompt)
        self._send_llm_end_callback(response)

        logger.info("Customer Support agent finished.")
        self._send_end_callback(response)
        return response


if __name__ == '__main__':
    async def main():
        user_input = UserInput(
            objective="""
            [
                {"id": "TICKET-12345", "email": "jane.d@example.com", "subject": "Question about billing", "body": "Hi, I was charged twice this month, can you help?"},
                {"id": "TICKET-12346", "email": "john.s@example.com", "subject": "Feature Idea", "body": "I love the product! It would be even better if it could integrate with Slack."},
                {"id": "TICKET-12347", "email": "sam.p@example.com", "subject": "Can't log in", "body": "I'm trying to log in but it says 'Authentication Error'. I've tried resetting my password but it didn't work."}
            ]
            """,
        )

        faq_database = "Q: I was double-charged. A: We apologize for the error. This can sometimes happen with payment processor delays. We have initiated a refund for the duplicate charge, which should appear in your account in 3-5 business days."
        product_documentation = "Login issues can be caused by browser cache. Please try clearing your cache and cookies."
        escalation_protocol = "Billing issues are handled by this agent. Feature requests should be escalated to the Product Manager Agent. Unresolved technical issues should be escalated to the Solo-Founder."

        agent = CustomerSupportAgent(
            user_input,
            faq_database=faq_database,
            product_documentation=product_documentation,
            escalation_protocol=escalation_protocol
        )
        result = await agent.run()
        print(json.dumps(json.loads(result), indent=2))

    asyncio.run(main())
