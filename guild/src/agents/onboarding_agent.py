import json
import asyncio

from models.user_input import UserInput, Audience
from models.agent import Agent, AgentCallback
from models.llm import Llm, LlmModels
from llm.llm_client import LlmClient
from utils.logging_utils import get_logger

logger = get_logger(__name__)

# --- Prompts for Conversational Steps ---

GREETING_PROMPT = """
You are the Onboarding Agent, a friendly and strategic business consultant. Your goal is to welcome the new solo-founder and guide them through setting up the foundational knowledge for their AI workforce.

Start the conversation. Welcome the user, introduce yourself, and explain that you're going to ask a few questions to build their business's "Foundation Layer". Explain that this will ensure all other AI agents are perfectly aligned with their brand and strategy.

Ask the first question: "To start, could you describe your business in a few sentences? What do you sell, and to whom?"
"""

BRAND_VOICE_ANALYSIS_PROMPT = """
You are the Onboarding Agent. You are analyzing the user's description of their business to create a Brand Voice document.

**User's Business Description:**
"{business_description}"

**Your Task:**
Based on the user's description, ask clarifying questions to help them define their brand voice. Frame this as a collaborative exercise. Ask them to choose from options or describe their preference for the following attributes:
- **Tone:** (e.g., Formal vs. Casual, Humorous vs. Serious, Scientific vs. Enthusiastic)
- **Vocabulary:** (e.g., Simple & Accessible vs. Industry Jargon & Expert-level)
- **Pacing:** (e.g., Short & Punchy vs. Detailed & Explanatory)
- **Personality:** (e.g., "If your brand was a person, who would it be? A wise mentor, a quirky friend, a trusted authority?")

Conclude by saying once they provide these details, you will generate a formal Brand Voice document for their approval.
"""

GENERATE_BRAND_VOICE_PROMPT = """
You are the Onboarding Agent. The user has provided details about their desired brand voice.

**User's Brand Voice Preferences:**
"{brand_voice_preferences}"

**Your Task:**
Synthesize the user's preferences into a formal Brand Voice document. This document will be stored and used by all other AI agents (especially marketing and sales agents) to ensure consistent communication.

**Output Format (JSON only):**
{{
  "brand_voice_document": {{
    "document_title": "Foundational Document: Brand Voice & Tone",
    "brand_personality_summary": "A one-paragraph summary of the brand's overall personality.",
    "core_attributes": [
      {{ "attribute": "Tone", "description": "e.g., 'Casual, enthusiastic, and slightly humorous.'" }},
      {{ "attribute": "Vocabulary", "description": "e.g., 'Accessible and easy-to-understand. Avoids overly technical jargon.'" }},
      {{ "attribute": "Pacing", "description": "e.g., 'Generally short and punchy, especially for social media. Longer form content should still be broken up with headings and bullet points.'" }}
    ],
    "style_guidelines": {{
        "do": ["A list of things to do (e.g., 'Use emojis to convey emotion', 'Speak directly to the user as 'you'')."],
        "dont": ["A list of things to avoid (e.g., 'Don't be overly formal or corporate', 'Don't use complex sentence structures.')."]
    }}
  }}
}}
"""

class OnboardingAgent(Agent):
    def __init__(self, user_input: UserInput, callback: AgentCallback = None):
        super().__init__(
            "Onboarding Agent",
            "Guides new users through a conversational setup process.",
            user_input,
            callback=callback
        )
        self.llm_client = LlmClient(Llm(provider="together", model=LlmModels.LLAMA3_70B.value))
        self.state = "GREETING" # Initial state
        self.business_description = ""

    async def run_conversational_step(self, user_response: str = "") -> Dict[str, Any]:
        """
        Runs a single step of the conversation based on the current state.
        Returns the agent's next response and whether the process is complete.
        """
        self._send_start_callback()
        agent_response = ""
        is_complete = False
        output_document = None

        if self.state == "GREETING":
            logger.info("Onboarding state: GREETING")
            agent_response = await self.llm_client.chat(GREETING_PROMPT)
            self.state = "AWAITING_BUSINESS_DESCRIPTION"

        elif self.state == "AWAITING_BUSINESS_DESCRIPTION":
            logger.info("Onboarding state: AWAITING_BUSINESS_DESCRIPTION")
            self.business_description = user_response
            prompt = BRAND_VOICE_ANALYSIS_PROMPT.format(business_description=self.business_description)
            agent_response = await self.llm_client.chat(prompt)
            self.state = "AWAITING_BRAND_VOICE_PREFERENCES"

        elif self.state == "AWAITING_BRAND_VOICE_PREFERENCES":
            logger.info("Onboarding state: AWAITING_BRAND_VOICE_PREFERENCES")
            brand_voice_preferences = user_response
            prompt = GENERATE_BRAND_VOICE_PROMPT.format(brand_voice_preferences=brand_voice_preferences)
            generated_json_str = await self.llm_client.chat(prompt)
            output_document = json.loads(generated_json_str)
            agent_response = "Great, I've generated the Brand Voice document. All other agents will now use this to stay perfectly on-brand. We would now move on to defining your target customer..."
            is_complete = True # For this example, we'll end here.

        self._send_end_callback(agent_response)
        return {
            "agent_response": agent_response,
            "is_complete": is_complete,
            "output_document": output_document,
            "next_state": self.state
        }

    async def run(self) -> str:
        # This standard run method is less useful for a conversational agent.
        # We use run_conversational_step instead.
        # However, we can use it to kick off the conversation.
        initial_response = await self.run_conversational_step()
        return json.dumps(initial_response)


if __name__ == '__main__':
    async def main():
        print("--- Starting Onboarding Simulation ---")

        # 1. Kick off the conversation
        onboarding_agent = OnboardingAgent(UserInput(objective="Start onboarding process"))
        response = await onboarding_agent.run()
        data = json.loads(response)
        print(f"Agent: {data['agent_response']}")

        # 2. User provides business description
        user_biz_desc = "We sell high-quality, handcrafted leather journals for creative writers and artists. We want to inspire people to capture their ideas."
        print(f"\nUser: {user_biz_desc}")
        response = await onboarding_agent.run_conversational_step(user_response=user_biz_desc)
        print(f"Agent: {response['agent_response']}")

        # 3. User provides brand voice preferences
        user_voice_prefs = "Tone should be inspiring and a bit artistic. Vocabulary should be evocative but accessible. Personality should be like a wise, encouraging mentor."
        print(f"\nUser: {user_voice_prefs}")
        response = await onboarding_agent.run_conversational_step(user_response=user_voice_prefs)
        print(f"Agent: {response['agent_response']}")
        print("\n--- Generated Document ---")
        print(json.dumps(response['output_document'], indent=2))
        print(f"\nOnboarding complete: {response['is_complete']}")
        print("--- End of Simulation ---")

    asyncio.run(main())
