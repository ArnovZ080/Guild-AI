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
You are the PR & Outreach Agent, a specialist in public relations, media relations, and strategic outreach. Your goal is to build brand visibility, secure media coverage, and acquire high-quality backlinks to enhance brand reputation and organic search authority.

**1. Foundational Analysis (Do not include in output):**
    *   **Outreach Objective:** {outreach_objective}
    *   **Key Message Points:** {key_message_points}
    *   **Target Audience (for media outlets):** {target_audience}
    *   **Relevant Assets (Press kits, product pages, etc.):** {relevant_assets}
    *   **SEO Backlink Targets (Optional):** {seo_backlink_targets}
    *   **Key Insights & Knowledge (from web search on PR best practices):** {knowledge}

**2. Your Task:**
    Based on the foundational analysis, generate a complete PR & Outreach plan. The plan should be highly actionable and tailored to the specific objective.

**3. Output Format (JSON only):**
    {{
      "outreach_strategy_summary": {{
        "objective": "A clear restatement of the outreach goal.",
        "key_angle": "The primary story or angle that will be used for pitching. Why is this newsworthy?",
        "target_media_profile": "A description of the ideal journalist, blogger, or publication to target."
      }},
      "target_prospects": [
        {{
          "name": "e.g., 'TechCrunch'",
          "type": "e.g., 'Media Outlet'",
          "contact_person": "e.g., 'Jane Doe, Startup Reporter'",
          "reason_for_targeting": "e.g., 'They frequently cover early-stage SaaS startups in our niche.'"
        }},
        {{
          "name": "e.g., 'The SaaS Marketing Blog'",
          "type": "e.g., 'Industry Blog'",
          "contact_person": "e.g., 'John Smith, Editor'",
          "reason_for_targeting": "e.g., 'A backlink from this high-authority blog would be valuable for our target keywords.'"
        }}
      ],
      "press_release_draft": {{
        "headline": "A compelling, newsworthy headline.",
        "dateline": "CITY, State – Month Day, Year –",
        "introduction": "The first paragraph, summarizing the most important information (who, what, when, where, why).",
        "body": "Further details, quotes, and background information.",
        "about_section": "A standard boilerplate about the solo-founder's company.",
        "media_contact": "Contact information."
      }},
      "pitch_template": {{
        "subject_line": "A concise and attention-grabbing email subject line.",
        "body": "A customizable email pitch template. It must be personalized, show you've done your research on the recipient, clearly state the story, and explain why it's relevant to their audience. Use placeholders like [Name] and [Publication Name]."
      }},
      "follow_up_plan": "A brief description of the follow-up strategy (e.g., 'Send one follow-up email 3-5 business days after the initial pitch if no response. Do not follow up more than twice.')"
    }}
"""


class PROutreachAgent(Agent):
    def __init__(self, user_input: UserInput, key_message_points: str, relevant_assets: str, seo_backlink_targets: str = "None", callback: AgentCallback = None):
        super().__init__(
            "PR/Outreach Agent",
            "Builds brand visibility and authority through public relations and strategic outreach.",
            user_input,
            callback=callback
        )
        self.key_message_points = key_message_points
        self.relevant_assets = relevant_assets
        self.seo_backlink_targets = seo_backlink_targets
        self.llm_client = LlmClient(
            Llm(
                provider="together",
                model=LlmModels.LLAMA3_70B.value
            )
        )

    @inject_knowledge
    async def run(self, knowledge: str | None = None) -> str:
        self._send_start_callback()
        logger.info(f"Running PR/Outreach agent for objective: {self.user_input.objective}")

        prompt = PROMPT_TEMPLATE.format(
            outreach_objective=self.user_input.objective,
            key_message_points=self.key_message_points,
            target_audience=self.user_input.audience.model_dump_json(indent=2) if self.user_input.audience else "General Audience",
            relevant_assets=self.relevant_assets,
            seo_backlink_targets=self.seo_backlink_targets,
            knowledge=knowledge,
        )

        self._send_llm_start_callback(prompt, "together", LlmModels.LLAMA3_70B.value)
        response = await self.llm_client.chat(prompt)
        self._send_llm_end_callback(response)

        logger.info("PR/Outreach agent finished.")
        self._send_end_callback(response)
        return response


if __name__ == '__main__':
    async def main():
        user_input = UserInput(
            objective="Announce the launch of our new AI-powered SaaS product and secure 3 media placements.",
            audience=Audience(description="Tech journalists, startup bloggers, and SaaS industry influencers.")
        )

        key_message_points = "The product uses a novel AI architecture to cut marketing content creation time by 90%. It's designed specifically for solo-founders. We are opening a free beta."
        relevant_assets = "Press Kit: [link], Product Landing Page: [link]"
        seo_backlink_targets = "Keywords: 'AI content generation', 'SaaS for solo-founders'"

        agent = PROutreachAgent(
            user_input,
            key_message_points=key_message_points,
            relevant_assets=relevant_assets,
            seo_backlink_targets=seo_backlink_targets
        )
        result = await agent.run()
        print(json.dumps(json.loads(result), indent=2))

    asyncio.run(main())
