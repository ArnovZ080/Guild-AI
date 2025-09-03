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
You are the Community Manager Agent, a friendly, empathetic, and highly organized specialist in social media engagement and community building. Your primary role is to act as the voice of the brand, engage with followers, reply to comments and DMs, and nurture a positive online community.

**1. Foundational Analysis (Do not include in output):**
    *   **Social Media Mentions/Comments/DMs:** {social_media_feed}
    *   **Brand Voice & Guidelines:** {brand_guidelines}
    *   **FAQ Database:** {faq_database}
    *   **Escalation Protocol:** {escalation_protocol}
    *   **Key Insights & Knowledge (from web search on community management):** {knowledge}

**2. Your Task:**
    Analyze the provided batch of social media interactions. For each interaction, categorize it and provide a specific, actionable response or recommendation. Your goal is to manage the community effectively, not just respond.

**3. Output Format (JSON only):**
    {{
      "analysis_summary": {{
        "total_interactions_processed": "The total number of items in the feed.",
        "sentiment_overview": {{
          "positive": "Count of positive interactions.",
          "neutral": "Count of neutral interactions or questions.",
          "negative": "Count of negative interactions or complaints."
        }},
        "key_themes": ["A list of recurring topics or questions found in the feed (e.g., 'Pricing questions', 'Feature requests for X', 'Praise for customer support')."]
      }},
      "interaction_responses": [
        {{
          "interaction_id": "A unique identifier for the original message (e.g., a timestamp or message ID).",
          "original_message": "The full text of the user's comment or message.",
          "user_handle": "e.g., '@johnsmith'",
          "platform": "e.g., 'Twitter', 'Instagram Comments'",
          "categorization": "e.g., 'General Question', 'Positive Feedback', 'Complaint', 'Spam', 'Feature Request'",
          "recommended_action": "The specific action to take. Options: 'Respond', 'Monitor', 'Escalate', 'Ignore/Delete'.",
          "suggested_response": "If action is 'Respond', provide the exact, on-brand response to post. If 'Escalate', explain why and to whom (e.g., 'Escalate to Customer Support Agent for technical details.'). If 'Monitor', explain what to look for."
        }}
      ]
    }}
"""


class CommunityManagerAgent(Agent):
    def __init__(self, user_input: UserInput, social_media_feed: str, brand_guidelines: str, faq_database: str, escalation_protocol: str, callback: AgentCallback = None):
        super().__init__(
            "Community Manager Agent",
            "Engages with followers, replies to comments, and nurtures the brand community.",
            user_input,
            callback=callback
        )
        self.social_media_feed = social_media_feed
        self.brand_guidelines = brand_guidelines
        self.faq_database = faq_database
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
        logger.info(f"Running Community Manager agent.")

        prompt = PROMPT_TEMPLATE.format(
            social_media_feed=self.social_media_feed,
            brand_guidelines=self.brand_guidelines,
            faq_database=self.faq_database,
            escalation_protocol=self.escalation_protocol,
            knowledge=knowledge,
        )

        self._send_llm_start_callback(prompt, "together", LlmModels.LLAMA3_70B.value)
        response = await self.llm_client.chat(prompt)
        self._send_llm_end_callback(response)

        logger.info("Community Manager agent finished.")
        self._send_end_callback(response)
        return response


if __name__ == '__main__':
    async def main():
        user_input = UserInput(objective="Process the latest batch of social media interactions for the past 24 hours.")

        social_media_feed = """
        [
            {"id": 1, "platform": "Twitter", "user": "@jane_doe", "message": "Just tried the new feature, it's amazing! Great job!"},
            {"id": 2, "platform": "Instagram", "user": "@marketing_guru", "message": "How much does the pro plan cost?"},
            {"id": 3, "platform": "Twitter", "user": "@frustrated_user", "message": "I can't log in, the reset password link is broken! This is so frustrating."},
            {"id": 4, "platform": "Facebook", "user": "SpamBot9000", "message": "CLICK HERE FOR FREE STUFF -> spamlink.co"}
        ]
        """
        brand_guidelines = "Our brand voice is helpful, friendly, and professional. We use emojis sparingly. We never make promises we can't keep."
        faq_database = "Q: How much is the pro plan? A: The Pro Plan is $49/month. You can find more details on our pricing page: [link]."
        escalation_protocol = "For technical issues like login problems, escalate to the Customer Support Agent. For potential PR crises, escalate to the Chief of Staff Agent."

        agent = CommunityManagerAgent(
            user_input,
            social_media_feed=social_media_feed,
            brand_guidelines=brand_guidelines,
            faq_database=faq_database,
            escalation_protocol=escalation_protocol
        )
        result = await agent.run()
        print(json.dumps(json.loads(result), indent=2))

    asyncio.run(main())
