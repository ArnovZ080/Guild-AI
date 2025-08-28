from guild.src.models.user_input import UserInput
from guild.src.models.agent import Agent, AgentCallback
from guild.src.models.llm import Llm, LlmModels
from guild.src.llm.llm_client import LlmClient
from guild.src.tools.search import search_and_summarize
from guild.src.utils.logging_utils import get_logger
from guild.src.utils.decorators import inject_knowledge

import json

logger = get_logger(__name__)

# This is a complex, multi-step agent. We'll define distinct prompts for each phase.

# Phase 1: Competitor Identification
COMPETITOR_ID_PROMPT = """
You are a world-class SEO strategist. Based on the user's objective, your first task is to identify the top 3-5 direct and indirect competitors.

**User's Core Objective:** {objective}
**Key Product/Service:** {product_service}

**Your Task:**
1.  Analyze the user's objective to understand their market positioning.
2.  Perform a search to find companies offering similar products or services.
3.  List the top 3-5 competitors. For each, provide their website URL and a brief (1-2 sentence) description of their core offering.

**Output Format (JSON only):**
{{
    "competitors": [
        {{
            "name": "Competitor Name",
            "url": "https://competitor.com",
            "description": "Description of their business."
        }}
    ]
}}
"""

# Phase 2: Competitor & Keyword Analysis
ANALYSIS_PROMPT = """
You are a world-class SEO analyst. You will be given a list of competitors. Your task is to perform a deep analysis of their SEO strategy and identify high-opportunity keywords.

**User's Core Objective:** {objective}
**Competitors:**
{competitors}

**Key Insights & Knowledge:**
{knowledge}

**Your Task:**
1.  **Competitor Content Analysis:** For each competitor, analyze the main themes, topics, and angles they use on their website and blog. What questions do they answer? What pain points do they address?
2.  **Keyword Research:** Based on the competitor analysis and the user's objective, generate a list of high-intent keywords. Categorize them into:
    *   **Primary Keywords:** (High volume, high competition - e.g., "CRM software")
    *   **Secondary Keywords:** (Medium volume, more specific - e.g., "best CRM for small business")
    *   **Long-Tail Keywords:** (Low volume, highly specific, often questions - e.g., "how to integrate CRM with email marketing")
3.  **Content Gap Analysis:** Identify topics or keywords the competitors are NOT covering well, representing an opportunity for the user.

**Output Format (JSON only):**
{{
    "competitor_analysis": [
        {{
            "name": "Competitor Name",
            "content_strategy_summary": "Summary of their content themes and angles.",
            "top_keywords_targeted": ["keyword1", "keyword2"]
        }}
    ],
    "keyword_opportunities": {{
        "primary": ["keywordA", "keywordB"],
        "secondary": ["keywordC", "keywordD"],
        "long_tail": ["keywordE", "keywordF"]
    }},
    "content_gap_analysis": "Summary of topics or angles the competition is missing."
}}
"""

# Phase 3: SEO Strategy Synthesis
STRATEGY_PROMPT = """
You are a world-class SEO Director. Using the provided competitor and keyword analysis, your final task is to create a comprehensive, actionable SEO strategy.

**Analysis & Research Data:**
{analysis_data}

**Your Task:**
Create a holistic SEO strategy that includes:
1.  **On-Page SEO Recommendations:**
    *   **Target Keywords:** Which primary and secondary keywords should be the main focus?
    *   **Content Plan:** Suggest 3-5 specific content ideas (e.g., blog posts, guides, landing pages) that target the identified keyword opportunities and content gaps. For each idea, provide a compelling title and a brief outline.
    *   **Website Structure:** Recommend key pages the website should have (e.g., "Features," "Pricing," "Integrations," "Blog").
2.  **Off-Page SEO Recommendations:**
    *   **Backlink Strategy:** Suggest types of websites to target for backlinks (e.g., industry blogs, software review sites, news publications).
    *   **Social Media Signals:** How can social media be used to amplify content and signal relevance to search engines?
3.  **Technical SEO Recommendations:**
    *   List 3-5 critical technical SEO checkpoints (e.g., mobile-friendliness, site speed, SSL certificate, XML sitemap).

**Output Format (JSON only):**
{{
    "on_page_seo": {{
        "target_keywords": ["primary_keyword1", "secondary_keyword1"],
        "content_plan": [
            {{
                "title": "Content Idea 1 Title",
                "outline": "Brief outline of the content piece."
            }}
        ],
        "website_structure_recommendations": ["Homepage", "About Us", "Contact", "Blog"]
    }},
    "off_page_seo": {{
        "backlink_strategy": "Summary of the backlink strategy.",
        "social_media_amplification": "How to use social media."
    }},
    "technical_seo_checklist": ["Mobile-Friendliness", "Site Speed (Core Web Vitals)", "HTTPS/SSL", "XML Sitemap Submission"]
}}
"""


class SEOAgent(Agent):
    def __init__(self, user_input: UserInput, callback: AgentCallback = None):
        super().__init__(
            "SEO Agent",
            "Develops a comprehensive SEO strategy by analyzing competitors and identifying keyword opportunities.",
            user_input,
            callback=callback
        )
        self.llm_client = LlmClient(
            Llm(
                provider="together",
                model=LlmModels.LLAMA3_70B.value
            )
        )

    @inject_knowledge
    async def run(self, knowledge: str | None = None) -> str:
        self._send_start_callback()
        logger.info(f"Running SEO agent for objective: {self.user_input.objective}")

        # Step 1: Identify Competitors
        self._send_step_callback("Identifying competitors...")
        product_service = self.user_input.objective # A simple heuristic for now
        comp_id_prompt = COMPETITOR_ID_PROMPT.format(
            objective=self.user_input.objective,
            product_service=product_service
        )
        self._send_llm_start_callback(comp_id_prompt, "together", LlmModels.LLAMA3_70B.value)
        competitors_json_str = await self.llm_client.chat(comp_id_prompt)
        self._send_llm_end_callback(competitors_json_str)
        competitors = json.loads(competitors_json_str)
        logger.info(f"Identified competitors: {competitors}")

        # Step 2: Analyze Competitors and Keywords
        self._send_step_callback("Analyzing competitors and researching keywords...")
        analysis_prompt = ANALYSIS_PROMPT.format(
            objective=self.user_input.objective,
            competitors=json.dumps(competitors['competitors'], indent=2),
            knowledge=knowledge
        )
        self._send_llm_start_callback(analysis_prompt, "together", LlmModels.LLAMA3_70B.value)
        analysis_json_str = await self.llm_client.chat(analysis_prompt)
        self._send_llm_end_callback(analysis_json_str)
        analysis_data = json.loads(analysis_json_str)
        logger.info("Completed competitor and keyword analysis.")

        # Step 3: Synthesize SEO Strategy
        self._send_step_callback("Synthesizing SEO strategy...")
        strategy_prompt = STRATEGY_PROMPT.format(
            analysis_data=json.dumps(analysis_data, indent=2)
        )
        self._send_llm_start_callback(strategy_prompt, "together", LlmModels.LLAMA3_70B.value)
        strategy_json_str = await self.llm_client.chat(strategy_prompt)
        self._send_llm_end_callback(strategy_json_str)
        logger.info("Generated final SEO strategy.")

        self._send_end_callback(strategy_json_str)
        return strategy_json_str

if __name__ == '__main__':
    import asyncio

    async def main():
        user_input = UserInput(
            objective="Become the #1 online resource for sustainable home gardening.",
            audience=None,
            additional_notes="Focus on beginners in urban environments."
        )

        agent = SEOAgent(user_input)
        result = await agent.run()
        print(json.dumps(json.loads(result), indent=2))

    asyncio.run(main())

