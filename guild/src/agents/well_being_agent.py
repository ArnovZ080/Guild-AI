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
You are the Well-being & Workload Optimization Agent, a dedicated personal coach and efficiency expert for the solo-founder. Your primary objective is to prevent burnout by analyzing workload, promoting healthy work habits, and ensuring sustainable productivity.

**1. Foundational Analysis (Do not include in output):**
    *   **Workload Data:** {workload_data}
    *   **Solo-Founder's Preferences (Work hours, breaks, etc.):** {solo_founder_preferences}
    *   **Solo-Founder's Self-Reported Stress/Overwhelm (Optional):** {solo_founder_self_report}
    *   **Key Insights & Knowledge (from web search on burnout prevention and productivity):** {knowledge}

**2. Your Task:**
    Based on the foundational analysis, generate a concise and actionable well-being report. The report should be supportive, data-informed, and respectful of the founder's autonomy.

**3. Output Format (JSON only):**
    {{
      "workload_summary": {{
        "title": "Recent Workload Analysis",
        "total_tasks_completed": "e.g., 15",
        "total_hours_tracked": "e.g., 55",
        "average_daily_hours": "e.g., 9.2",
        "work_pattern_insight": "e.g., 'Workload was heaviest on Tuesday and Wednesday. There were few breaks scheduled during focus blocks.'"
      }},
      "burnout_risk_assessment": {{
        "title": "Burnout Risk Assessment",
        "risk_level": "e.g., 'Low', 'Moderate', 'High'",
        "key_indicators": [
          "e.g., 'Consistently working beyond preferred hours.'",
          "e.g., 'Increasing number of overdue tasks.'",
          "e.g., 'Self-reported stress level is high.'"
        ],
        "assessment_summary": "A brief, empathetic summary of the current risk level and why."
      }},
      "workload_optimization_recommendations": {{
        "title": "Workload Optimization Suggestions",
        "recommendations": [
          {{
            "suggestion": "e.g., 'Delegate the 'Data Entry' task to the Outsourcing Agent.'",
            "rationale": "e.g., 'This is a low-leverage task that is consuming significant time.'"
          }},
          {{
            "suggestion": "e.g., 'Push the deadline for the 'Website Redesign' project by one week.'",
            "rationale": "e.g., 'This will create more breathing room and allow for higher quality work without rushing.'"
          }}
        ]
      }},
      "well_being_interventions": {{
        "title": "Well-being Nudges & Reminders",
        "recommendations": [
          "e.g., 'Schedule a mandatory 30-minute walk every day at lunchtime.'",
          "e.g., 'Block out 'No Meeting Fridays' to allow for deep work and reduce context switching.'",
          "e.g., 'Consider using a mindfulness app for 5 minutes before starting the workday.'"
        ]
      }}
    }}
"""


class WellBeingAgent(Agent):
    def __init__(self, user_input: UserInput, workload_data: str, solo_founder_preferences: str, solo_founder_self_report: str = "Not provided.", callback: AgentCallback = None):
        super().__init__(
            "Well-being & Workload Optimization Agent",
            "Monitors workload and suggests interventions to prevent solo-founder burnout.",
            user_input,
            callback=callback
        )
        self.workload_data = workload_data
        self.solo_founder_preferences = solo_founder_preferences
        self.solo_founder_self_report = solo_founder_self_report
        self.llm_client = LlmClient(
            Llm(
                provider="together",
                model=LlmModels.LLAMA3_70B.value
            )
        )

    @inject_knowledge
    async def run(self, knowledge: str | None = None) -> str:
        self._send_start_callback()
        logger.info(f"Running Well-being agent.")

        prompt = PROMPT_TEMPLATE.format(
            workload_data=self.workload_data,
            solo_founder_preferences=self.solo_founder_preferences,
            solo_founder_self_report=self.solo_founder_self_report,
            knowledge=knowledge,
        )

        self._send_llm_start_callback(prompt, "together", LlmModels.LLAMA3_70B.value)
        response = await self.llm_client.chat(prompt)
        self._send_llm_end_callback(response)

        logger.info("Well-being agent finished.")
        self._send_end_callback(response)
        return response


if __name__ == '__main__':
    async def main():
        # This agent doesn't use a typical UserInput objective. It's triggered by data.
        user_input = UserInput(objective="Weekly well-being check-in.")

        workload_data = "Project Manager Data: 25 tasks assigned, 18 completed, 7 overdue. Time Tracker Data: 62 hours worked this week. Calendar Data: 12 meetings scheduled, only 2 personal blocks."
        solo_founder_preferences = "Preferred work hours: 9am-6pm Mon-Fri (45 hours/week). Desired breaks: 1 hour lunch, two 15-min breaks. Personal time: Evenings and weekends free."
        solo_founder_self_report = "Feeling a bit stressed this week, deadlines are piling up."

        agent = WellBeingAgent(
            user_input,
            workload_data=workload_data,
            solo_founder_preferences=solo_founder_preferences,
            solo_founder_self_report=solo_founder_self_report
        )
        result = await agent.run()
        print(json.dumps(json.loads(result), indent=2))

    asyncio.run(main())
