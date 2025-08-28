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
You are the Training Agent, an expert in instructional design and technical writing. Your role is to create and update an internal library of Standard Operating Procedures (SOPs) and to deliver micro-trainings. Your goal is to ensure consistent processes and effective knowledge transfer within the business.

**1. Foundational Analysis (Do not include in output):**
    *   **Training/SOP Need:** {training_need}
    *   **Source Information / Process Steps:** {source_information}
    *   **Target Audience (for this SOP):** {target_audience}
    *   **Key Insights & Knowledge (from web search on instructional design):** {knowledge}

**2. Your Task:**
    Based on the foundational analysis, generate a comprehensive and easy-to-understand Standard Operating Procedure (SOP) document.

**3. Output Format (JSON only):**
    {{
      "sop_document": {{
        "title": "A clear, descriptive title for the SOP (e.g., 'SOP: How to Onboard a New Client').",
        "document_id": "e.g., 'SOP-CLIENT-001'",
        "version": "1.0",
        "purpose": "A brief, one-sentence explanation of what this process achieves.",
        "scope": "Clearly define what is covered and what is not covered by this SOP.",
        "roles_and_responsibilities": [
            {{
                "role": "e.g., 'Solo-Founder'",
                "responsibilities": ["e.g., 'Final approval of client contract.'"]
            }},
            {{
                "role": "e.g., 'Virtual Assistant'",
                "responsibilities": ["e.g., 'Setting up client in the project management tool.'"]
            }}
        ],
        "procedure": [
            {{
                "step": 1,
                "title": "e.g., 'Initial Client Call'",
                "instruction": "A detailed, step-by-step instruction for this part of the process.",
                "quality_check": "A specific point to verify before moving to the next step (e.g., 'Confirm client has signed the proposal.')."
            }},
            {{
                "step": 2,
                "title": "e.g., 'Create Client Folder in Google Drive'",
                "instruction": "Provide the exact steps, including naming conventions (e.g., 'Navigate to 'Clients' folder. Create new folder named [Client Name] - [YYYY-MM-DD]').",
                "quality_check": "e.g., 'Ensure folder structure matches the standard template.'"
            }}
        ],
        "troubleshooting_and_faqs": [
            {{
                "question": "e.g., 'What if the client asks for a discount?'",
                "answer": "e.g., 'Refer to the 'Pricing Agent's' latest guidelines. Do not approve discounts without consulting the solo-founder.'"
            }}
        ],
        "related_documents": ["List any other SOPs or documents that are referenced (e.g., 'SOP-CONTRACT-002: Contract Generation')."]
      }}
    }}
"""


class TrainingAgent(Agent):
    def __init__(self, user_input: UserInput, source_information: str, target_audience: str, callback: AgentCallback = None):
        # user_input.objective holds the training_need
        super().__init__(
            "Training Agent",
            "Builds and updates internal Standard Operating Procedure (SOP) libraries.",
            user_input,
            callback=callback
        )
        self.source_information = source_information
        self.target_audience = target_audience
        self.llm_client = LlmClient(
            Llm(
                provider="together",
                model=LlmModels.LLAMA3_70B.value
            )
        )

    @inject_knowledge
    async def run(self, knowledge: str | None = None) -> str:
        self._send_start_callback()
        logger.info(f"Running Training agent for need: {self.user_input.objective}")

        prompt = PROMPT_TEMPLATE.format(
            training_need=self.user_input.objective,
            source_information=self.source_information,
            target_audience=self.target_audience,
            knowledge=knowledge,
        )

        self._send_llm_start_callback(prompt, "together", LlmModels.LLAMA3_70B.value)
        response = await self.llm_client.chat(prompt)
        self._send_llm_end_callback(response)

        logger.info("Training agent finished.")
        self._send_end_callback(response)
        return response


if __name__ == '__main__':
    async def main():
        user_input = UserInput(
            objective="Create an SOP for publishing a new blog post.",
        )

        source_information = """
        The process is:
        1. Get the final draft from the Copywriter Agent.
        2. Create a new post in WordPress.
        3. Paste the content and format it with headings, bold text, etc.
        4. Run it through the SEO Agent to get metadata and keyword suggestions.
        5. Add the meta description and title.
        6. Find a relevant stock photo and upload it as the featured image.
        7. Schedule the post to be published.
        """
        target_audience = "A new Virtual Assistant who is not familiar with our specific workflow."

        agent = TrainingAgent(
            user_input,
            source_information=source_information,
            target_audience=target_audience
        )
        result = await agent.run()
        print(json.dumps(json.loads(result), indent=2))

    asyncio.run(main())
