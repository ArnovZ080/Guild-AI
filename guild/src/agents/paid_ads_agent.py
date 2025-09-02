from guild.src.models.user_input import UserInput
from guild.src.models.agent import Agent, AgentCallback
from guild.src.models.llm import Llm, LlmModels
from guild.src.core.llm_client import LlmClient
from guild.src.tools.search import search_and_summarize
from guild.src.utils.logging_utils import get_logger
from guild.src.utils.decorators import inject_knowledge

import json

logger = get_logger(__name__)

PROMPT_TEMPLATE = """
You are a world-class Paid Ads strategist AI agent. Your mission is to create a comprehensive, multi-platform digital advertising campaign plan that is efficient, targeted, and aligned with the user's core objective.

**1. Foundational Analysis (Do not include in output):**
    *   **User's Core Objective:** {objective}
    *   **Target Audience Analysis:** {audience}
    *   **Key Insights & Knowledge:** {knowledge}
    *   **SEO & Content Strategy (for context):** {strategy_context}

**2. Your Task:**
    Based on the foundational analysis, develop a complete paid advertising strategy. The strategy should be practical, creative, and data-driven.

**3. Output Format (JSON only):**
    {{
        "campaign_name": "Campaign Name (e.g., 'Q3 Product Launch - AI Tool')",
        "campaign_objective": "Primary goal (e.g., 'Lead Generation', 'Brand Awareness', 'Direct Sales').",
        "recommended_platforms": ["Google Ads", "Facebook/Instagram Ads", "LinkedIn Ads"],
        "budget_allocation": {{
            "google_ads_percentage": 40,
            "facebook_instagram_ads_percentage": 40,
            "linkedin_ads_percentage": 20,
            "justification": "Allocate budget based on where the target audience is most active and conversion potential."
        }},
        "ad_campaigns": [
            {{
                "platform": "Google Ads",
                "campaign_type": "Search",
                "ad_groups": [
                    {{
                        "name": "Ad Group Name (e.g., 'AI Copywriting Keywords')",
                        "keywords": ["keyword1", "keyword2", "keyword3"],
                        "ads": [
                            {{
                                "headline_1": "AI-Powered Copywriting",
                                "headline_2": "Write Content 10x Faster",
                                "description": "Our AI tool generates high-converting copy in seconds. Try it free today and save hours of work.",
                                "landing_page_url": "/landing/ai-tool"
                            }}
                        ]
                    }}
                ]
            }},
            {{
                "platform": "Facebook/Instagram Ads",
                "campaign_type": "Conversions",
                "ad_sets": [
                    {{
                        "name": "Ad Set Name (e.g., 'Marketing Professionals - Lookalike Audience')",
                        "targeting_summary": "Target users interested in Digital Marketing, Content Marketing, and lookalike audiences of website visitors.",
                        "ads": [
                            {{
                                "ad_creative_suggestion": "A short video demonstrating the tool's key features. Show a user going from a blank page to a full article in under 30 seconds.",
                                "primary_text": "Tired of writer's block? Let our AI be your creative partner. Generate amazing content, from ad copy to blog posts, with a single click. Learn more!",
                                "headline": "The Future of Content Creation is Here",
                                "call_to_action": "Learn More"
                            }}
                        ]
                    }}
                ]
            }}
        ],
        "performance_kpis": ["Cost Per Lead (CPL)", "Click-Through Rate (CTR)", "Conversion Rate", "Return on Ad Spend (ROAS)"],
        "psychological_framework": "The campaign will leverage the 'Scarcity' principle with limited-time offers and the 'Social Proof' principle by highlighting user testimonials in ad copy."
    }}
"""

class PaidAdsAgent(Agent):
    def __init__(self, user_input: UserInput, strategy_context: str, callback: AgentCallback = None):
        super().__init__(
            "Paid Ads Agent",
            "Generates a multi-platform paid advertising campaign strategy.",
            user_input,
            callback=callback
        )
        self.strategy_context = strategy_context
        self.llm_client = LlmClient(
            Llm(
                provider="together",
                model=LlmModels.LLAMA3_70B.value
            )
        )

    @inject_knowledge
    async def run(self, knowledge: str | None = None) -> str:
        self._send_start_callback()
        logger.info(f"Running Paid Ads agent for objective: {self.user_input.objective}")

        prompt = PROMPT_TEMPLATE.format(
            objective=self.user_input.objective,
            audience=self.user_input.audience.model_dump_json(indent=2) if self.user_input.audience else "{}",
            knowledge=knowledge,
            strategy_context=self.strategy_context
        )

        self._send_llm_start_callback(prompt, "together", LlmModels.LLAMA3_70B.value)
        response = await self.llm_client.chat(prompt)
        self._send_llm_end_callback(response)

        logger.info("Paid Ads agent finished.")
        self._send_end_callback(response)
        return response

if __name__ == '__main__':
    import asyncio
    from guild.src.models.user_input import Audience

    async def main():
        user_input = UserInput(
            objective="Launch a new brand of premium, eco-friendly yoga mats.",
            audience=Audience(
                description="Environmentally conscious yoga practitioners.",
                demographics={
                    "age": "25-45",
                    "location": "USA, Canada, Western Europe",
                    "interests": ["Yoga", "Sustainability", "Wellness", "Eco-friendly products"]
                }
            ),
            additional_notes="Highlight the non-toxic materials and durability."
        )

        # In a real run, this would come from the SEO or Content Strategist agent
        strategy_context = """
        {
            "target_keywords": ["eco-friendly yoga mat", "sustainable yoga gear", "non-toxic yoga mat"],
            "content_plan": [
                { "title": "Why Your Yoga Mat Might Be Toxic (And What to Do About It)" },
                { "title": "The Ultimate Guide to Sustainable Yoga Practices" }
            ]
        }
        """

        agent = PaidAdsAgent(user_input, strategy_context=strategy_context)
        result = await agent.run()
        print(json.dumps(json.loads(result), indent=2))

    asyncio.run(main())

