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
You are a senior HR Manager and Recruitment Specialist at a top tech company. You are an expert in crafting compelling job descriptions, developing objective screening criteria, creating structured interview questions, and building effective onboarding plans to attract and retain top talent.

**1. Foundational Analysis (Do not include in output):**
    *   **Hiring Need / Role:** {hiring_need}
    *   **Key Responsibilities:** {key_responsibilities}
    *   **Required Skills & Experience:** {required_skills}
    *   **Company Culture & Values:** {company_culture}
    *   **Key Insights & Knowledge (from web search on HR best practices):** {knowledge}

**2. Your Task:**
    Based on the foundational analysis, generate a complete hiring package for the specified role. The package should be comprehensive, professional, and designed to attract the right candidates while ensuring a fair and effective hiring process.

**3. Output Format (JSON only):**
    {{
      "job_description": {{
        "job_title": "The official job title.",
        "summary": "A compelling, one-paragraph summary of the role, its impact on the company, and what makes the position exciting.",
        "responsibilities": [
          "A detailed, bulleted list of day-to-day responsibilities and duties."
        ],
        "qualifications": {{
          "required": [
            "A bulleted list of non-negotiable skills, experience, and qualifications."
          ],
          "preferred": [
            "A bulleted list of 'nice-to-have' skills and qualifications that would make a candidate stand out."
          ]
        }},
        "company_culture_blurb": "A short, authentic paragraph about the company culture, values, and work environment to attract candidates who will thrive."
      }},
      "screening_criteria": [
        {{
          "criteria": "e.g., 'Minimum 3 years of experience in social media management'",
          "weight": "High"
        }},
        {{
          "criteria": "e.g., 'Proven experience with TikTok video creation'",
          "weight": "High"
        }},
        {{
          "criteria": "e.g., 'Experience with HubSpot CRM'",
          "weight": "Medium"
        }}
      ],
      "interview_plan": {{
        "stages": [
          {{
            "stage_name": "Initial Screening Call (15-30 mins)",
            "objective": "To assess basic qualifications, interest in the role, and communication skills.",
            "sample_questions": [
              "Tell me about your understanding of this role and what attracted you to it.",
              "Can you briefly walk me through your most relevant experience from your resume?",
              "What are your salary expectations?"
            ]
          }},
          {{
            "stage_name": "Technical/Portfolio Review (45-60 mins)",
            "objective": "To dive deep into the candidate's skills and past work.",
            "sample_questions": [
              "Walk me through a campaign you're particularly proud of. What was your specific role and what was the outcome?",
              "How do you approach [specific task relevant to the role, e.g., 'developing a content calendar']?",
              "Describe a time you had to adapt your strategy based on performance data."
            ]
          }}
        ]
      }},
      "onboarding_plan_outline": {{
        "week_1": "Focus on company introduction, tool setup, and initial small tasks. Key goal: Acclimatization.",
        "first_30_days": "Focus on taking ownership of core responsibilities and achieving a first small win. Key goal: Integration and first impact.",
        "first_90_days": "Focus on full autonomy, proactive contributions, and alignment with strategic goals. Key goal: Full productivity and strategic contribution."
      }}
    }}
"""


class HRAgent(Agent):
    def __init__(self, user_input: UserInput, callback: AgentCallback = None):
        # The UserInput for this agent is repurposed. 'objective' is the role, 'notes' are responsibilities.
        super().__init__(
            "HR Agent",
            "Creates detailed job descriptions, interview plans, and onboarding processes.",
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
        logger.info(f"Running HR agent for role: {self.user_input.objective}")

        prompt = PROMPT_TEMPLATE.format(
            hiring_need=self.user_input.objective,
            key_responsibilities=self.user_input.additional_notes or "Not specified.",
            required_skills="Not specified, please infer from role and responsibilities.",
            company_culture="A dynamic, results-oriented startup culture that values autonomy and proactive problem-solving.",
            knowledge=knowledge,
        )

        self._send_llm_start_callback(prompt, "together", LlmModels.LLAMA3_70B.value)
        response = await self.llm_client.chat(prompt)
        self._send_llm_end_callback(response)

        logger.info("HR agent finished.")
        self._send_end_callback(response)
        return response


if __name__ == '__main__':
    async def main():
        # Example of how this agent would be used.
        # The 'objective' field of UserInput holds the role to be hired.
        # The 'additional_notes' field holds the key responsibilities.
        user_input_for_hr = UserInput(
            objective="Social Media Manager",
            additional_notes="Manage Instagram and TikTok channels. Create and schedule daily content. Engage with the community. Track and report on key metrics."
        )

        agent = HRAgent(user_input=user_input_for_hr)
        result = await agent.run()
        print(json.dumps(json.loads(result), indent=2))

    asyncio.run(main())
