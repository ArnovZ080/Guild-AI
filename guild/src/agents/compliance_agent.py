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
You are the Compliance Agent, a specialist in legal and regulatory requirements for online businesses. Your role is to help the solo-founder navigate complex compliance areas like data privacy (GDPR, CCPA), marketing regulations, and industry-specific rules. Your primary function is to provide clear, actionable guidance and proactive alerts.

**Disclaimer:** You are an AI assistant, not a lawyer. Your output is for informational purposes only and does not constitute legal advice. The solo-founder should always consult with a qualified legal professional for critical compliance matters.

**1. Foundational Analysis (Do not include in output):**
    *   **Compliance Area to Address:** {compliance_area}
    *   **Business Operations Details:** {business_operations_details}
    *   **Jurisdiction(s) of Operation:** {jurisdiction}
    *   **Key Insights & Knowledge (from web search on relevant regulations):** {knowledge}

**2. Your Task:**
    Based on the foundational analysis, generate a clear and actionable compliance report for the specified area. The report should simplify complex legal jargon and provide practical steps for the solo-founder to take.

**3. Output Format (JSON only):**
    {{
      "compliance_report": {{
        "title": "e.g., 'GDPR Compliance Audit for Email Marketing'",
        "disclaimer": "You are an AI assistant, not a lawyer. This information is for educational purposes only. Please consult a qualified legal professional.",
        "applicable_regulations": [
            {{
                "regulation": "e.g., 'General Data Protection Regulation (GDPR)'",
                "summary": "A brief, plain-language summary of the regulation's core principles relevant to the compliance area."
            }}
        ],
        "compliance_assessment": [
            {{
                "business_practice": "e.g., 'Using a single-opt-in form for the newsletter.'",
                "risk_level": "e.g., 'High'",
                "finding": "e.g., 'GDPR requires explicit, unambiguous consent, which is best demonstrated through a double-opt-in process. A single-opt-in form may not be sufficient proof of consent.'"
            }},
            {{
                "business_practice": "e.g., 'No clear privacy policy link on the website footer.'",
                "risk_level": "e.g., 'High'",
                "finding": "e.g., 'GDPR Article 13 requires that privacy information be provided at the time of data collection. A privacy policy must be easily accessible.'"
            }}
        ],
        "actionable_recommendations": [
            {{
                "recommendation": "e.g., 'Implement a double-opt-in process for all new email subscribers.'",
                "priority": "e.g., 'High'",
                "implementation_steps": "e.g., '1. Configure email marketing service to send a confirmation email. 2. Update landing page copy to inform users they need to confirm their subscription.'",
                "required_tool": "e.g., 'Email Marketing Software (e.g., Mailchimp, ConvertKit)'"
            }},
            {{
                "recommendation": "e.g., 'Draft and publish a comprehensive privacy policy.'",
                "priority": "e.g., 'High'",
                "implementation_steps": "e.g., '1. Use a reputable privacy policy generator or template. 2. Customize the policy with details about data collected, purpose, and user rights. 3. Add a clear link to the policy in the website footer and on all data collection forms.'",
                "required_tool": "e.g., 'Website CMS'"
            }}
        ],
        "when_to_consult_a_lawyer": "A list of situations where professional legal advice is strongly recommended (e.g., 'Before expanding into a new international market', 'If you receive a data breach notification', 'To get a final review of your privacy policy')."
      }}
    }}
"""


class ComplianceAgent(Agent):
    def __init__(self, user_input: UserInput, business_operations_details: str, jurisdiction: str, callback: AgentCallback = None):
        # user_input.objective holds the compliance_area
        super().__init__(
            "Compliance Agent",
            "Ensures the business meets relevant legal and regulatory requirements.",
            user_input,
            callback=callback
        )
        self.business_operations_details = business_operations_details
        self.jurisdiction = jurisdiction
        self.llm_client = LlmClient(
            Llm(
                provider="together",
                model=LlmModels.LLAMA3_70B.value
            )
        )

    @inject_knowledge
    async def run(self, knowledge: str | None = None) -> str:
        self._send_start_callback()
        logger.info(f"Running Compliance agent for area: {self.user_input.objective}")

        prompt = PROMPT_TEMPLATE.format(
            compliance_area=self.user_input.objective,
            business_operations_details=self.business_operations_details,
            jurisdiction=self.jurisdiction,
            knowledge=knowledge,
        )

        self._send_llm_start_callback(prompt, "together", LlmModels.LLAMA3_70B.value)
        response = await self.llm_client.chat(prompt)
        self._send_llm_end_callback(response)

        logger.info("Compliance agent finished.")
        self._send_end_callback(response)
        return response


if __name__ == '__main__':
    async def main():
        user_input = UserInput(
            objective="Review our email marketing practices for GDPR compliance.",
        )

        business_operations_details = "We collect emails through a lead magnet form on our website. The form has a single checkbox for 'I agree to receive emails'. We send a weekly newsletter and occasional promotional offers. We do not have a formal privacy policy."
        jurisdiction = "We are based in the US but have subscribers and customers in the EU."

        agent = ComplianceAgent(
            user_input,
            business_operations_details=business_operations_details,
            jurisdiction=jurisdiction
        )
        result = await agent.run()
        print(json.dumps(json.loads(result), indent=2))

    asyncio.run(main())
