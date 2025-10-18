import json
import asyncio
from typing import Dict, Any, Callable, List
from pydantic import BaseModel

# Use absolute imports for clarity and robustness
from guild.src.models.user_input import UserInput
from guild.src.models.llm import Llm, LlmModels
from guild.src.core.llm_client import LlmClient
from guild.src.models.workflow import Task
from guild.src.utils.logging_utils import get_logger

# --- Import ALL Agent Classes from Complete Registry ---
# CRITICAL FIX: Using complete agent registry with all 113 agents
from guild.src.core.complete_agent_registry import AGENT_REGISTRY as COMPLETE_AGENT_REGISTRY

# Re-export for backward compatibility
JudgeAgent = COMPLETE_AGENT_REGISTRY.get('JudgeAgent')
ChiefOfStaffAgent = COMPLETE_AGENT_REGISTRY.get('ChiefOfStaffAgent')
StrategyAgent = COMPLETE_AGENT_REGISTRY.get('StrategyAgent')
ContentStrategist = COMPLETE_AGENT_REGISTRY.get('ContentStrategist')
Copywriter = COMPLETE_AGENT_REGISTRY.get('Copywriter')
TrainingAgent = COMPLETE_AGENT_REGISTRY.get('TrainingAgent')

logger = get_logger(__name__)

# Simple workflow model for orchestrator (not database model)
class SimpleWorkflow(BaseModel):
    """Simple workflow model for orchestrator operations."""
    user_input: UserInput
    tasks: List[Task]

# --- The Master Agent Registry ---
# CRITICAL FIX: Now includes ALL 113 agents from complete registry
AGENT_REGISTRY = COMPLETE_AGENT_REGISTRY

# --- The Master Orchestrator Prompt ---
DAG_GENERATION_PROMPT = """
## Orchestrator Task: Create Intelligent Multi-Agent Workflow

**User Request:** {objective}
**Additional Context:** {additional_notes}
**Available Agents:** JudgeAgent, ContentStrategist, Copywriter, TrainingAgent, ChiefOfStaffAgent, StrategyAgent

**Your Role:** You are the Intelligent Orchestrator Agent, the central manager of the AI system. 
Analyze the user request and create a step-by-step execution plan involving multiple AI agents.

**Available Agent Capabilities:**
- **JudgeAgent**: Quality control, rubric generation, and output evaluation
- **ContentStrategist**: Content strategy, planning, and calendar creation
- **Copywriter**: Content creation, writing, and copy generation
- **TrainingAgent**: SOP creation, training materials, and process documentation
- **ChiefOfStaffAgent**: Strategic coordination, delegation, and workflow optimization
- **StrategyAgent**: Long-term planning, market analysis, and strategic decision-making

**Task Instructions:**
1. **Interpret User Request**: Understand the underlying goals and required outcomes
2. **Identify Required Agents**: Select the most appropriate agents for each sub-task
3. **Create Execution Plan**: Generate a logical, efficient DAG with clear dependencies
4. **Define Task Sequence**: Ensure tasks flow logically from planning to execution to quality control

**Output Format (JSON only):**
{{
  "workflow_name": "Descriptive name for this workflow",
  "workflow_description": "Brief overview of what this workflow accomplishes",
  "tasks": [
    {{
      "id": "task1",
      "name": "Descriptive task name",
      "agent_type": "AgentClassName",
      "description": "Detailed description of what this task accomplishes",
      "dependencies": [],
      "expected_output": "What this task should produce",
      "estimated_duration": "Estimated time to complete"
    }}
  ],
  "quality_criteria": "What defines success for this workflow",
  "success_metrics": ["Metric 1", "Metric 2"]
}}

**Rules:**
- Start with planning/strategy agents (ContentStrategist, StrategyAgent)
- Include execution agents for content creation (Copywriter, TrainingAgent)
- End with JudgeAgent for quality control and evaluation
- Keep it simple but comprehensive (3-5 tasks max)
- Ensure logical flow and dependencies
- Consider the user's business context and goals

Output ONLY valid JSON.
"""


class Orchestrator:
    """
    The Intelligent Orchestrator Agent acts as the central manager of the entire AI system.
    It analyzes user requests, autonomously decides which specialist agents are needed, 
    and creates a step-by-step execution plan (Directed Acyclic Graph - DAG) for complex tasks.
    """
    
    def __init__(self, user_input: UserInput):
        self.user_input = user_input
        # Use configured provider from environment, prefer vertex_ai for production
        import os
        provider = os.getenv("LLM_PROVIDER", "vertex_ai")  # Default to vertex_ai
        
        # Set model based on provider
        if provider == "vertex_ai":
            model = os.getenv("VERTEX_AI_MODEL", "gemini-1.5-flash")
        elif provider == "ollama":
            model = os.getenv("OLLAMA_MODEL", "tinyllama")
        else:
            model = "default"
        
        logger.info(f"Initializing Orchestrator with provider={provider}, model={model}")
        
        try:
            self.llm_client = LlmClient(Llm(provider=provider, model=model))
            logger.info("Orchestrator LLM client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize LLM client with {provider}: {e}")
            # Fallback to ollama if vertex_ai fails
            if provider == "vertex_ai":
                logger.warning("Falling back to ollama provider")
                provider = "ollama"
                model = os.getenv("OLLAMA_MODEL", "tinyllama")
                self.llm_client = LlmClient(Llm(provider=provider, model=model))
            else:
                raise
        
        # Available agents for orchestration
        self.available_agents = list(AGENT_REGISTRY.keys())
        self.system_status = "ready"
        self.active_tasks = []

    async def generate_workflow(self) -> SimpleWorkflow:

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
            workflow = SimpleWorkflow(user_input=self.user_input, tasks=tasks)
            logger.info(f"Successfully generated workflow with {len(tasks)} tasks.")
            return workflow
        except (json.JSONDecodeError, TypeError) as e:
            logger.error(f"Failed to decode or process LLM response into JSON. Error: {e}. Response: {response_str}")
            raise ValueError("Could not generate a valid workflow from the LLM response.")

    async def execute_workflow(self, workflow: SimpleWorkflow, on_step_complete: Callable) -> Dict[str, Any]:
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

