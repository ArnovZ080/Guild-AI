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
You are a world-class Project Manager AI, certified in PMP, Agile, and Scrum, and an expert with tools like Asana, Jira, and Monday.com. Your key capability is **Intelligent Task Breakdown & Estimation**. You excel at taking a high-level goal and breaking it down into a granular, actionable project plan, complete with realistic timelines and resource allocation.

**1. Foundational Analysis (Do not include in output):**
    *   **User's Core Objective / Project Goal:** {objective}
    *   **High-level Deliverables/Tasks:** {high_level_tasks}
    *   **Context from other agents (e.g., Marketing or Sales Strategy):** {strategy_context}
    *   **Key Insights & Knowledge (from web search on project management best practices):** {knowledge}

**2. Your Task:**
    Based on the foundational analysis, create a comprehensive and structured project plan. The plan must be highly detailed, breaking down high-level tasks into specific, actionable sub-tasks.

**3. Output Format (JSON only):**
    {{
      "project_name": "A clear and concise name for the project.",
      "project_summary": "A brief, 2-3 sentence summary of the project's goal and scope.",
      "milestones": [
        {{
          "milestone_name": "Milestone 1: Planning & Foundational Strategy",
          "milestone_summary": "The key outcome of this phase of the project.",
          "tasks": [
            {{
              "task_id": "M1T1",
              "task_name": "e.g., Define detailed project scope and requirements",
              "description": "A brief explanation of what this task entails.",
              "assigned_to": "e.g., 'Solo-Founder' or a specific Agent like 'ContentStrategist'",
              "estimated_hours": "A realistic estimate of hours required (e.g., 4).",
              "dependencies": [],
              "outsourcing_recommendation": {{
                "is_recommended": false,
                "rationale": "This task is strategic and requires founder input."
              }}
            }},
            {{
              "task_id": "M1T2",
              "task_name": "e.g., Conduct initial keyword research",
              "description": "Perform keyword research to inform the content strategy.",
              "assigned_to": "SEOAgent",
              "estimated_hours": 6,
              "dependencies": ["M1T1"],
              "outsourcing_recommendation": {{
                "is_recommended": false,
                "rationale": "Best handled by the specialized SEOAgent."
              }}
            }}
          ]
        }},
        {{
          "milestone_name": "Milestone 2: Execution & Implementation",
          "milestone_summary": "The key outcome of this phase.",
          "tasks": [
            {{
              "task_id": "M2T1",
              "task_name": "e.g., Write 5 blog posts based on keyword research",
              "description": "Draft, edit, and finalize 5 blog posts.",
              "assigned_to": "Copywriter",
              "estimated_hours": 20,
              "dependencies": ["M1T2"],
              "outsourcing_recommendation": {{
                "is_recommended": true,
                "rationale": "This is a time-consuming task that can be effectively delegated to a freelance writer with clear instructions."
              }}
            }}
          ]
        }}
      ],
      "risk_assessment": [
        {{
          "risk": "e.g., Scope creep leading to project delays.",
          "impact": "e.g., 'High'",
          "mitigation_plan": "e.g., 'Strictly adhere to the defined project scope. Any changes require a formal change request and impact analysis.'"
        }}
      ],
      "tool_recommendations": ["e.g., 'Trello for task tracking', 'Slack for communication', 'Google Docs for collaboration'"]
    }}
"""


class ProjectManagerAgent(Agent):
    def __init__(self, user_input: UserInput, strategy_context: str, callback: AgentCallback = None):
        super().__init__(
            "Project Manager Agent",
            "Breaks down high-level goals into a structured project plan with tasks, milestones, and timelines.",
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
        logger.info(f"Running Project Manager agent for objective: {self.user_input.objective}")

        # The high-level tasks can be derived from the objective and notes
        high_level_tasks = f"{self.user_input.objective}\n{self.user_input.additional_notes or ''}"

        prompt = PROMPT_TEMPLATE.format(
            objective=self.user_input.objective,
            high_level_tasks=high_level_tasks,
            strategy_context=self.strategy_context,
            knowledge=knowledge,
        )

        self._send_llm_start_callback(prompt, "together", LlmModels.LLAMA3_70B.value)
        response = await self.llm_client.chat(prompt)
        self._send_llm_end_callback(response)

        logger.info("Project Manager agent finished.")
        self._send_end_callback(response)
        return response


if __name__ == '__main__':
    async def main():
        user_input = UserInput(
            objective="Launch a new version of our SaaS product by the end of Q3.",
            audience=None, # Not directly relevant for PM
            additional_notes="The launch includes a new marketing website, an updated onboarding flow, and a social media campaign."
        )

        # In a real run, this context might come from a Business Strategist agent
        strategy_context = "The primary goal is to increase user activation rate by 15%."

        agent = ProjectManagerAgent(user_input, strategy_context=strategy_context)
        result = await agent.run()
        print(json.dumps(json.loads(result), indent=2))

    asyncio.run(main())
