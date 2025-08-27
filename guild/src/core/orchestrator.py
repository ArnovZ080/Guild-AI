import json
import asyncio
from typing import Dict, Any, Callable

# Use relative imports within the same package
from ..models.user_input import UserInput
from ..models.llm import Llm, LlmModels
from ..llm.llm_client import LlmClient
from ..models.workflow import Workflow, Task
from ..utils.logging_utils import get_logger

# Import all available agents using relative paths
from ..agents.content_strategist import ContentStrategist
from ..agents.copywriter import Copywriter
from ..agents.seo_agent import SEOAgent
from ..agents.paid_ads_agent import PaidAdsAgent
from ..agents.judge_agent import JudgeAgent
from ..agents.sales_funnel_agent import SalesFunnelAgent
from ..agents.crm_agent import CRMAgent
from ..agents.project_manager_agent import ProjectManagerAgent
from ..agents.hr_agent import HRAgent


logger = get_logger(__name__)

# A mapping from agent names (as the LLM knows them) to their actual classes
AGENT_REGISTRY = {
    "ContentStrategist": ContentStrategist,
    "Copywriter": Copywriter,
    "SEOAgent": SEOAgent,
    "PaidAdsAgent": PaidAdsAgent,
    "JudgeAgent": JudgeAgent,
    "SalesFunnelAgent": SalesFunnelAgent,
    "CRMAgent": CRMAgent,
    "ProjectManagerAgent": ProjectManagerAgent,
    "HRAgent": HRAgent,

}

DAG_GENERATION_PROMPT = """
You are an expert AI Orchestrator. Your role is to analyze a user's request and create a logical workflow (a Directed Acyclic Graph - DAG) of specialized AI agents to achieve the user's goal.

**1. Available Agents:**
You have the following agents at your disposal:
*   **ContentStrategist:** Analyzes the user's goal and creates a high-level content strategy (pillars, formats, keywords). This should usually be the first step for any content-related goal.
*   **SEOAgent:** Performs deep competitor analysis and keyword research to create a comprehensive SEO strategy. Essential for any goal related to organic traffic or online visibility.
*   **Copywriter:** Writes compelling copy based on a provided strategy. It requires input from the ContentStrategist.
*   **PaidAdsAgent:** Creates a multi-platform paid advertising campaign plan. It works best with input from the ContentStrategist or SEOAgent.
*   **SalesFunnelAgent:** Designs a comprehensive, multi-stage sales funnel to convert prospects into customers. Crucial for any objective involving direct sales.
*   **CRMAgent:** Designs a CRM setup and marketing automation strategy (lead scoring, nurture sequences) to manage customer relationships. Depends on a SalesFunnelAgent's output.
*   **ProjectManagerAgent:** Takes a high-level goal and breaks it down into a structured project plan with tasks, milestones, and timelines. Useful for complex, multi-part objectives.
*   **HRAgent:** Creates detailed job descriptions, interview plans, and onboarding processes. Use only when the user's objective explicitly mentions hiring.
*   **JudgeAgent:** Evaluates the output of another agent based on a quality rubric. This should be the final step to ensure the quality of the main deliverable.

**2. User's Request:**
*   **Primary Objective:** {objective}
*   **Target Audience:** {audience}
*   **Additional Notes:** {additional_notes}

**3. Your Task:**
Based on the user's request, create a JSON object representing the workflow.
*   The JSON should have a single key: "tasks".
*   "tasks" is a list of task objects.
*   Each task object must have:
    *   `task_id`: A unique, descriptive ID (e.g., "create-content-strategy").
    *   `agent`: The name of the agent to use (must be one from the "Available Agents" list).
    *   `description`: A brief description of what the agent should do in this task.
    *   `dependencies`: A list of `task_id`s that must be completed before this task can start. An empty list `[]` means it's a starting task.
    *   `expected_output`: A description of what this task is expected to produce.

**4. Important Rules:**
*   **Logical Order:** Ensure the dependencies create a logical flow. For example, `Copywriter` must depend on `ContentStrategist`, and `CRMAgent` must depend on `SalesFunnelAgent`.
*   **Relevance:** Only include agents that are relevant to the user's objective. If the goal is to write a blog post, you probably don't need a `SalesFunnelAgent` or `HRAgent`.
*   **Start with Strategy:** Most workflows should begin with a high-level strategy agent like `ContentStrategist`, `SEOAgent`, or `SalesFunnelAgent`.

*   **End with Quality Control:** Always include a `JudgeAgent` as the final step to evaluate the primary deliverable.

**Example Output:**
{{
  "tasks": [
    {{
      "task_id": "design-sales-funnel",
      "agent": "SalesFunnelAgent",
      "description": "Design a sales funnel to sell the user's product.",
      "dependencies": [],
      "expected_output": "A JSON object detailing the sales funnel stages and strategy."
    }},
    {{
      "task_id": "setup-crm-automation",
      "agent": "CRMAgent",
      "description": "Create a CRM and automation plan based on the sales funnel.",
      "dependencies": ["design-sales-funnel"],
      "expected_output": "A JSON object with CRM setup, lead scoring, and automation workflows."
    }}
  ]
}}

**Now, generate the workflow for the user request above. Output JSON only.**
"""


class Orchestrator:
    def __init__(self, user_input: UserInput):
        self.user_input = user_input
        self.llm_client = LlmClient(Llm(provider="together", model=LlmModels.LLAMA3_70B.value))

    async def generate_workflow(self) -> Workflow:
        """
        Analyzes the user input and generates a Workflow object with a task DAG.
        """
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
        """
        Executes a workflow's DAG of tasks.
        """
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
        """
        Executes a single task.
        """
        logger.info(f"Executing task: {task.task_id} with agent: {task.agent}")

        agent_class = AGENT_REGISTRY.get(task.agent)
        if not agent_class:
            raise ValueError(f"Unknown agent '{task.agent}' specified in workflow.")

        strategy_context = ""
        content_to_judge = ""

        if task.dependencies:
            dep_outputs = [json.dumps(context.get(dep_id, {})) for dep_id in task.dependencies]
            strategy_context = "\n---\n".join(dep_outputs)
            if task.agent == "JudgeAgent" and task.dependencies:
                content_to_judge = strategy_context

        try:
            # Dynamically instantiate agent based on its needs
            if task.agent in ["Copywriter", "PaidAdsAgent", "CRMAgent", "ProjectManagerAgent"]:
                agent = agent_class(self.user_input, strategy_context=strategy_context)
            elif task.agent == "JudgeAgent":
                agent = agent_class(self.user_input, content_to_evaluate=content_to_judge)
            else: # Covers ContentStrategist, SEOAgent, SalesFunnelAgent, HRAgent which only need UserInput

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
        except Exception as e:
            logger.error(f"Task {task.task_id} failed: {e}", exc_info=True)
            on_step_complete(
                node_id=task.task_id,
                agent_name=task.agent,
                output_data={"error": str(e)},
                status="failed"
            )
            raise

if __name__ == '__main__':
    from ..models.user_input import Audience

    async def main():
        user_input = UserInput(
            objective="Launch a new course on 'Productivity for Solo-Founders' and get 100 paying customers.",
            audience=Audience(
                description="Solo-founders and entrepreneurs feeling overwhelmed.",
            ),
            additional_notes="The course price is $199. We need a full funnel and a project plan to execute this."

        )

        def dummy_callback(node_id, agent_name, output_data, status):
            print("\n" + "="*50)
            print(f"Callback Received:")
            print(f"  Task ID: {node_id}")
            print(f"  Agent: {agent_name}")
            print(f"  Status: {status}")
            print(f"  Output: {json.dumps(output_data, indent=2)}")
            print("="*50 + "\n")

        orchestrator = Orchestrator(user_input)

        workflow = await orchestrator.generate_workflow()
        print("--- Generated Workflow ---")
        print(workflow.model_dump_json(indent=2))

        if workflow and workflow.tasks:
            final_results = await orchestrator.execute_workflow(workflow, on_step_complete=dummy_callback)
            print("\n--- Final Workflow Execution Results ---")
            print(json.dumps(final_results, indent=2))
        else:
            print("No tasks in the generated workflow to execute.")

    asyncio.run(main())

