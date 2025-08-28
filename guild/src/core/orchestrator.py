import json
import asyncio
from typing import Dict, Any, Callable

# Use relative imports within the same package
from ..models.user_input import UserInput
from ..models.llm import Llm, LlmModels
from ..llm.llm_client import LlmClient
from ..models.workflow import Workflow, Task
from ..utils.logging_utils import get_logger

# --- Import ALL Agent Classes ---
# Foundational
from ..agents.judge_agent import JudgeAgent
# Executive
from ..agents.chief_of_staff_agent import ChiefOfStaffAgent
from ..agents.strategy_agent import StrategyAgent
from ..agents.strategic_sounding_board_agent import StrategicSoundingBoardAgent
from ..agents.well_being_agent import WellBeingAgent
from ..agents.accountability_coach_agent import AccountabilityCoachAgent
# Marketing & Growth
from ..agents.content_strategist import ContentStrategist
from ..agents.seo_agent import SEOAgent
from ..agents.copywriter import Copywriter
from ..agents.paid_ads_agent import PaidAdsAgent
from ..agents.pr_outreach_agent import PROutreachAgent
from ..agents.community_manager_agent import CommunityManagerAgent
# Sales & Revenue
from ..agents.sales_funnel_agent import SalesFunnelAgent
from ..agents.crm_agent import CRMAgent
from ..agents.outbound_sales_agent import OutboundSalesAgent
from ..agents.partnerships_agent import PartnershipsAgent
# Operations
from ..agents.project_manager_agent import ProjectManagerAgent
from ..agents.hr_agent import HRAgent
from ..agents.training_agent import TrainingAgent
from ..agents.compliance_agent import ComplianceAgent
from ..agents.skill_development_agent import SkillDevelopmentAgent
from ..agents.outsourcing_agent import OutsourcingAgent
# Finance
from ..agents.bookkeeping_agent import BookkeepingAgent
from ..agents.investor_relations_agent import InvestorRelationsAgent
from ..agents.pricing_agent import PricingAgent
# Product & Customer
from ..agents.product_manager_agent import ProductManagerAgent
from ..agents.customer_support_agent import CustomerSupportAgent
from ..agents.ux_ui_tester_agent import UXUITesterAgent
from ..agents.churn_predictor_agent import ChurnPredictorAgent



logger = get_logger(__name__)

# --- The Master Agent Registry ---
AGENT_REGISTRY = {
    # Foundational
    "JudgeAgent": JudgeAgent,
    # Executive
    "ChiefOfStaffAgent": ChiefOfStaffAgent,
    "StrategyAgent": StrategyAgent,
    "StrategicSoundingBoardAgent": StrategicSoundingBoardAgent,
    "WellBeingAgent": WellBeingAgent,
    "AccountabilityCoachAgent": AccountabilityCoachAgent,
    # Marketing & Growth
    "ContentStrategist": ContentStrategist,
    "SEOAgent": SEOAgent,
    "Copywriter": Copywriter,
    "PaidAdsAgent": PaidAdsAgent,
    "PROutreachAgent": PROutreachAgent,
    "CommunityManagerAgent": CommunityManagerAgent,
    # Sales & Revenue
    "SalesFunnelAgent": SalesFunnelAgent,
    "CRMAgent": CRMAgent,
    "OutboundSalesAgent": OutboundSalesAgent,
    "PartnershipsAgent": PartnershipsAgent,
    # Operations
    "ProjectManagerAgent": ProjectManagerAgent,
    "HRAgent": HRAgent,
    "TrainingAgent": TrainingAgent,
    "ComplianceAgent": ComplianceAgent,
    "SkillDevelopmentAgent": SkillDevelopmentAgent,
    "OutsourcingAgent": OutsourcingAgent,
    # Finance
    "BookkeepingAgent": BookkeepingAgent,
    "InvestorRelationsAgent": InvestorRelationsAgent,
    "PricingAgent": PricingAgent,
    # Product & Customer
    "ProductManagerAgent": ProductManagerAgent,
    "CustomerSupportAgent": CustomerSupportAgent,
    "UXUITesterAgent": UXUITesterAgent,
    "ChurnPredictorAgent": ChurnPredictorAgent,
}

# --- The Master Orchestrator Prompt ---
DAG_GENERATION_PROMPT = """
You are an expert AI Orchestrator, the central "brain" of a large AI workforce. Your role is to analyze a user's request and create a logical workflow (a Directed Acyclic Graph - DAG) of specialized AI agents to achieve the user's goal. You have a wide array of agents at your disposal.

**1. Available Agents & Their Capabilities:**

*   **Executive Layer:**
    *   `ChiefOfStaffAgent`: High-level coordinator. Use for complex, multi-departmental goals.
    *   `StrategyAgent`: For deep strategic questions about market positioning, expansion, or business models.
    *   `StrategicSoundingBoardAgent`: To critique or validate a new idea or decision.
    *   `WellBeingAgent`: For tasks related to workload management and burnout prevention.
    *   `AccountabilityCoachAgent`: For tasks related to goal tracking and motivation.

*   **Marketing & Growth Layer:**
    *   `ContentStrategist`: Plans content calendars and high-level content themes.
    *   `SEOAgent`: For all tasks related to organic search, keywords, and technical SEO.
    *   `Copywriter`: Writes final copy (website, emails, ads) based on a strategy. Requires input from a strategy agent.
    *   `PaidAdsAgent`: Manages and optimizes paid ad campaigns.
    *   `PROutreachAgent`: For public relations, media outreach, and securing press.
    *   `CommunityManagerAgent`: Manages social media engagement and community interactions.

*   **Sales & Revenue Layer:**
    *   `SalesFunnelAgent`: Designs sales funnels (lead magnets, VSLs, checkout pages).
    *   `CRMAgent`: Sets up CRM, lead scoring, and email automation. Depends on `SalesFunnelAgent`.
    *   `OutboundSalesAgent`: For generating lead lists and drafting personalized cold outreach.
    *   `PartnershipsAgent`: For identifying and planning affiliate or JV partnerships.

*   **Operations Layer:**
    *   `ProjectManagerAgent`: Breaks down any large goal into a detailed project plan with tasks and timelines.
    *   `HRAgent`: For any hiring-related task (job descriptions, interview plans).
    *   `TrainingAgent`: Creates Standard Operating Procedures (SOPs) for business processes.
    *   `ComplianceAgent`: For legal and regulatory questions (e.g., GDPR, CCPA).
    *   `SkillDevelopmentAgent`: Creates personalized learning plans for the user.
    *   `OutsourcingAgent`: Creates a plan for hiring and managing freelancers for a specific task.

*   **Finance Layer:**
    *   `BookkeepingAgent`: Processes transactions and creates financial reports.
    *   `InvestorRelationsAgent`: For creating pitch decks and investor updates.
    *   `PricingAgent`: Analyzes and recommends pricing strategies for products/services.

*   **Product & Customer Layer:**
    *   `ProductManagerAgent`: Gathers feedback and creates product roadmaps.
    *   `CustomerSupportAgent`: Manages and responds to customer support tickets.
    *   `UXUITesterAgent`: Analyzes a website/app for usability issues and suggests improvements.
    *   `ChurnPredictorAgent`: Analyzes customer data to identify at-risk users.

*   **Foundational Layer:**
    *   `JudgeAgent`: **Crucial for quality control.** Should be the final step for most major deliverables to evaluate the quality of the primary agent's work.


**2. User's Request:**
*   **Primary Objective:** {objective}
*   **Target Audience:** {audience}
*   **Additional Notes:** {additional_notes}

**3. Your Task:**
    Based on the user's request, create a JSON object representing the workflow. The JSON must have a single key: "tasks", which is a list of task objects. Each task object must have `task_id`, `agent`, `description`, `dependencies`, and `expected_output`.

**4. Important Rules:**
*   **Logical Order:** Ensure dependencies create a logical flow (e.g., `Copywriter` depends on `ContentStrategist`).
*   **Relevance:** Only include agents that are directly relevant to the user's objective.
*   **Start with Strategy:** Most workflows should begin with a high-level strategy agent.
*   **End with Quality Control:** Always include a `JudgeAgent` as the final step to evaluate the primary deliverable.


**Now, generate the workflow for the user request above. Output JSON only.**
"""


class Orchestrator:
    def __init__(self, user_input: UserInput):
        self.user_input = user_input
        self.llm_client = LlmClient(Llm(provider="together", model=LlmModels.LLAMA3_70B.value))

    async def generate_workflow(self) -> Workflow:

        logger.info("Generating workflow by analyzing user input...")
        prompt = DAG_GENERATION_PROMPT.format(
            objective=self.user_input.objective,
            audience=self.user_input.audience.model_dump_json(indent=2) if self.user_input.audience else "Not specified.",
            additional_notes=self.user_input.additional_notes or "None"
        )
        response_str = await self.llm_client.chat(prompt)
        try:

            if response_str.startswith("```json"):
                response_str = response_str[7:]
            if response_str.endswith("```"):
                response_str = response_str[:-3]

            workflow_data = json.loads(response_str)
            tasks = [Task(**task_data) for task_data in workflow_data.get("tasks", [])]
            workflow = Workflow(user_input=self.user_input, tasks=tasks)
            logger.info(f"Successfully generated workflow with {len(tasks)} tasks.")
            return workflow
        except (json.JSONDecodeError, TypeError) as e:
            logger.error(f"Failed to decode or process LLM response into JSON. Error: {e}. Response: {response_str}")
            raise ValueError("Could not generate a valid workflow from the LLM response.")

    async def execute_workflow(self, workflow: Workflow, on_step_complete: Callable) -> Dict[str, Any]:
        logger.info(f"Starting execution of workflow for objective: {workflow.user_input.objective}")
        execution_context: Dict[str, Any] = {}

        completed_tasks = set()
        while len(completed_tasks) < len(workflow.tasks):
            tasks_to_run = [
                task for task in workflow.tasks
                if task.task_id not in completed_tasks and all(dep in completed_tasks for dep in task.dependencies)
            ]
            if not tasks_to_run and len(completed_tasks) < len(workflow.tasks):
                raise RuntimeError("Workflow has a cycle or unresolved dependencies.")
            results = await asyncio.gather(
                *(self._execute_task(task, execution_context, on_step_complete) for task in tasks_to_run)
            )
            for task, result in zip(tasks_to_run, results):
                execution_context[task.task_id] = result
                completed_tasks.add(task.task_id)

        logger.info("Workflow execution finished.")
        return execution_context

    async def _execute_task(self, task: Task, context: Dict[str, Any], on_step_complete: Callable) -> Any:
        logger.info(f"Executing task: {task.task_id} with agent: {task.agent}")

        agent_class = AGENT_REGISTRY.get(task.agent)
        if not agent_class:
            raise ValueError(f"Unknown agent '{task.agent}' specified in workflow.")

        # --- Dynamic Agent Instantiation ---
        # This logic needs to be aware of the different signatures of agent constructors.
        # We can inspect the required inputs later, for now, we'll use a simple mapping.

        # Gather context from dependencies
        strategy_context = ""
        if task.dependencies:
            dep_outputs = [json.dumps(context.get(dep_id, {})) for dep_id in task.dependencies]
            strategy_context = "\n---\n".join(dep_outputs)

        # A simple way to handle different constructor signatures
        # This is brittle and could be improved with inspection, but works for now.
        try:
            if task.agent in ["Copywriter", "PaidAdsAgent", "CRMAgent", "ProjectManagerAgent"]:
                agent = agent_class(self.user_input, strategy_context=strategy_context)
            elif task.agent == "JudgeAgent":
                agent = agent_class(self.user_input, content_to_evaluate=strategy_context)
            # Add more complex agents here as needed based on their __init__ signature
            # For now, assume others only need user_input
            else:
                agent = agent_class(self.user_input)
        except TypeError:
             # Fallback for agents that might have more complex signatures not yet handled
             # This is a simplifying assumption for this context. A real implementation
             # would need a more robust dependency injection system.
             logger.warning(f"Could not instantiate {task.agent} with context. Falling back to user_input only.")
             agent = agent_class(self.user_input)


        result_str = await agent.run()
        try:
            output_data = json.loads(result_str)
        except json.JSONDecodeError:
            output_data = {"result": result_str}

        logger.info(f"Task {task.task_id} completed successfully.")
        on_step_complete(
            node_id=task.task_id,
            agent_name=task.agent,
            output_data=output_data,
            status="completed"
        )
        return output_data

