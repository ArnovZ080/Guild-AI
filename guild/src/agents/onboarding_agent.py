import json
import asyncio

from guild.src.models.user_input import UserInput, Audience
from guild.src.models.agent import Agent, AgentCallback
from guild.src.models.llm import Llm, LlmModels
from guild.src.core.llm_client import LlmClient
from guild.src.utils.logging_utils import get_logger

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
## Agent Profile
**Role:** The Onboarding Agent, synthesizing brand voice preferences into a formal document.

**Expertise:** Brand documentation, voice synthesis, and strategic communication planning.

**Objective:** To create a comprehensive Brand Voice document that will guide all AI agents in maintaining consistent brand communication.

## Task Instructions
**Input:** User's brand voice preferences: "{brand_voice_preferences}"
**Context:** The user has defined their brand voice preferences and now needs a formal document for AI agent alignment
**Constraints:** Create a comprehensive, actionable document that AI agents can follow

**Steps:**
1. **Analyze the user's preferences** for tone, vocabulary, pacing, and personality
2. **Synthesize into clear guidelines** that AI agents can follow
3. **Create a structured document** with actionable style guidelines
4. **Ensure completeness** for comprehensive brand voice guidance

**Output Format (JSON only):**
{{
  "brand_voice_document": {{
    "document_title": "Foundational Document: Brand Voice & Tone",
    "brand_personality_summary": "A one-paragraph summary of the brand's overall personality based on user preferences.",
    "core_attributes": [
      {{ "attribute": "Tone", "description": "Specific tone description based on user preferences" }},
      {{ "attribute": "Vocabulary", "description": "Specific vocabulary guidelines based on user preferences" }},
      {{ "attribute": "Pacing", "description": "Specific pacing guidelines based on user preferences" }},
      {{ "attribute": "Personality", "description": "Specific personality description based on user preferences" }}
    ],
    "style_guidelines": {{
        "do": ["Specific actions to take based on user preferences"],
        "dont": ["Specific actions to avoid based on user preferences"]
    }},
    "ai_agent_instructions": "Clear instructions for how AI agents should apply this brand voice"
  }}
}}

**Quality Criteria:** Comprehensive coverage of all brand voice aspects, clear and actionable guidelines, and specific instructions for AI agent implementation.
"""

class OnboardingAgent(Agent):
    def __init__(self, user_input: UserInput, callback: AgentCallback = None):
        super().__init__(
            "Onboarding Agent",
            "Guides new users through a conversational setup process.",
            user_input,
            callback=callback
        )
        # Use configured provider from environment, fallback to ollama
        import os
        provider = os.getenv("LLM_PROVIDER", "ollama")
        model = os.getenv("OLLAMA_MODEL", "tinyllama")
        self.llm_client = LlmClient(Llm(provider=provider, model=model))
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
