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
You are the Strategy Agent, a world-class business strategist responsible for long-term planning, vision alignment, market positioning, and data-driven big-picture decisions. You act as the primary strategic advisor.

**1. Foundational Analysis (Do not include in output):**
    *   **Strategic Question/Challenge:** {strategic_question}
    *   **Relevant Market Data:** {market_data}
    *   **Internal Performance Data (KPIs, sales, etc.):** {internal_performance_data}
    *   **Solo-Founder's Vision & Goals:** {vision_and_goals}
    *   **Key Insights & Knowledge (from web search on business strategy):** {knowledge}

**2. Your Task:**
    Based on the foundational analysis, develop a comprehensive and actionable strategy to address the user's question. Your response should be a formal strategic document.

**3. Output Format (JSON only):**
    {{
      "executive_summary": "A concise overview of the strategic question, your analysis, and the key recommendations.",
      "situation_analysis": {{
        "market_opportunity": "An analysis of the market size, growth, and key trends.",
        "competitive_landscape": "A summary of key competitors, their strengths, weaknesses, and your points of differentiation.",
        "internal_analysis_swot": {{
          "strengths": ["List of internal strengths."],
          "weaknesses": ["List of internal weaknesses."],
          "opportunities": ["List of external opportunities."],
          "threats": ["List of external threats."]
        }}
      }},
      "strategic_options": [
        {{
          "option_name": "e.g., 'Market Penetration Strategy'",
          "description": "A brief description of this strategic option.",
          "pros": ["List of advantages."],
          "cons": ["List of disadvantages."],
          "estimated_impact": "e.g., 'High revenue potential, medium resource cost.'"
        }},
        {{
          "option_name": "e.g., 'Niche Down Strategy'",
          "description": "A brief description of this strategic option.",
          "pros": ["List of advantages."],
          "cons": ["List of disadvantages."],
          "estimated_impact": "e.g., 'Medium revenue potential, low resource cost, high brand focus.'"
        }}
      ],
      "recommended_strategy": {{
        "strategy_name": "The name of the chosen strategy.",
        "justification": "A detailed explanation for why this strategy is the best choice, aligning with the data and the founder's vision.",
        "high_level_roadmap": [
          {{
            "phase": 1,
            "phase_name": "e.g., 'Validation & MVP'",
            "duration": "e.g., '1-2 months'",
            "key_activities": ["List of key actions for this phase."]
          }},
          {{
            "phase": 2,
            "phase_name": "e.g., 'Initial Go-to-Market'",
            "duration": "e.g., '3-4 months'",
            "key_activities": ["List of key actions for this phase."]
          }}
        ]
      }},
      "key_risks_and_mitigation": [
        {{
          "risk": "A description of a potential risk associated with the recommended strategy.",
          "mitigation": "A plan to address or reduce the impact of the risk."
        }}
      ]
    }}
"""


class StrategyAgent(Agent):
    def __init__(self, user_input: UserInput, market_data: str, internal_performance_data: str, vision_and_goals: str, callback: AgentCallback = None):
        super().__init__(
            "Strategy Agent",
            "Develops long-term business strategy and provides data-driven recommendations.",
            user_input,
            callback=callback
        )
        self.market_data = market_data
        self.internal_performance_data = internal_performance_data
        self.vision_and_goals = vision_and_goals
        self.llm_client = LlmClient(
            Llm(
                provider="together",
                model=LlmModels.LLAMA3_70B.value
            )
        )

    @inject_knowledge
    async def run(self, knowledge: str | None = None) -> str:
        self._send_start_callback()
        logger.info(f"Running Strategy agent for question: {self.user_input.objective}")

        prompt = PROMPT_TEMPLATE.format(
            strategic_question=self.user_input.objective,
            market_data=self.market_data,
            internal_performance_data=self.internal_performance_data,
            vision_and_goals=self.vision_and_goals,
            knowledge=knowledge,
        )

        self._send_llm_start_callback(prompt, "together", LlmModels.LLAMA3_70B.value)
        response = await self.llm_client.chat(prompt)
        self._send_llm_end_callback(response)

        logger.info("Strategy agent finished.")
        self._send_end_callback(response)
        return response


if __name__ == '__main__':
    async def main():
        user_input = UserInput(
            objective="How can we effectively expand our SaaS product into the European market?",
        )

        market_data = "The European SaaS market is growing at 15% YoY, but is highly fragmented with local regulations (GDPR) being a major factor. Key competitors are LocalSaaS Gmbh and EuroTech SAS."
        internal_performance_data = "Current MRR: $5k. User base: 95% North America. Product is currently English-only."
        vision_and_goals = "Our long-term vision is to be the global leader in our niche. A short-term goal is to establish a foothold in Europe and generate 10% of our revenue from there within 18 months."

        agent = StrategyAgent(
            user_input,
            market_data=market_data,
            internal_performance_data=internal_performance_data,
            vision_and_goals=vision_and_goals
        )
        result = await agent.run()
        print(json.dumps(json.loads(result), indent=2))

    asyncio.run(main())
