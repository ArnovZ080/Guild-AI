"""
Enhanced Orchestrator with Full Agent and Integration Awareness
This orchestrator knows about all 115+ agents and all connected integrations.
"""

import json
import asyncio
from typing import Dict, Any, Callable, List, Optional
from pydantic import BaseModel

from guild.src.models.user_input import UserInput
from guild.src.models.llm import Llm
from guild.src.core.llm_client import LlmClient
from guild.src.models.workflow import Task
from guild.src.utils.logging_utils import get_logger

# Import capability registries
from guild.src.core.agent_capability_registry import (
    get_all_agent_capabilities,
    generate_orchestrator_agent_list,
    generate_agent_capability_descriptions
)
from guild.src.core.integration_capability_registry import (
    get_connected_integrations_summary,
    generate_integration_context_for_orchestrator
)
# CRITICAL FIX: Import complete integration registry (ALL 125 integrations)
from guild.src.core.complete_integration_registry import (
    INTEGRATION_CAPABILITIES as COMPLETE_INTEGRATION_CAPABILITIES,
    generate_integration_list_for_orchestrator as generate_complete_integration_list
)

# Import the complete agent registry (ALL 113 agents)
from guild.src.core.complete_agent_registry import AGENT_REGISTRY

logger = get_logger(__name__)


class SimpleWorkflow(BaseModel):
    """Simple workflow model for orchestrator operations."""
    user_input: UserInput
    tasks: List[Task]


def generate_enhanced_dag_prompt(user_input: UserInput, user_id: str = None) -> str:
    """Generate enhanced DAG generation prompt with full agent and integration awareness"""
    
    # Get all agent capabilities
    agent_list = generate_orchestrator_agent_list()
    agent_descriptions = generate_agent_capability_descriptions()
    
    # Get integration context for user
    integration_context = ""
    if user_id:
        integration_context = generate_integration_context_for_orchestrator(user_id)
    else:
        integration_context = "**No user ID provided** - Cannot determine connected integrations."
    
    prompt = f"""
## Enhanced Orchestrator Task: Create Intelligent Multi-Agent Workflow

**User Request:** {user_input.objective}
**Target Audience:** {user_input.audience.model_dump_json(indent=2) if user_input.audience else "Not specified"}
**Additional Context:** {user_input.additional_notes or "None"}
**User ID:** {user_id or "anonymous"}

---

## YOUR ROLE

You are the **Enhanced Orchestrator Agent**, the central intelligence of the Guild-AI autonomous workforce system. You have access to 115+ specialized AI agents and all connected external platform integrations. Your job is to analyze user requests and create comprehensive, multi-agent workflows that autonomously accomplish business objectives.

---

## AVAILABLE AGENTS

{agent_list}

## DETAILED AGENT CAPABILITIES

{agent_descriptions}

---

## CONNECTED INTEGRATIONS & DATA SOURCES

{integration_context}

---

## ORCHESTRATION PRINCIPLES

### 1. **Intelligent Agent Selection**
- Choose agents based on their specific capabilities and specializations
- Consider which agents have access to required integrations
- Select agents that can work together efficiently

### 2. **Data Grounding**
- Use connected integrations as data sources
- Ensure agents have access to real business data
- Prioritize real-time data over mock data

### 3. **Workflow Optimization**
- Start with strategy/analysis agents
- Use specialized agents for specific tasks
- End with quality assurance (Judge Agent)
- Enable parallel execution where possible

### 4. **Quality Assurance**
- Always include Judge Agent for final evaluation
- Set quality thresholds
- Plan for revision cycles if needed

### 5. **Autonomous Execution**
- Design workflows that require minimal human intervention
- Use automation agents where appropriate
- Leverage integrations for direct platform actions

---

## TASK INSTRUCTIONS

1. **Analyze User Request**: Understand the business objective, required outcomes, and success criteria
2. **Identify Required Capabilities**: Determine what capabilities are needed (e.g., content creation, data analysis, automation)
3. **Select Optimal Agents**: Choose the best agents for each capability from the 115+ available
4. **Plan Integration Usage**: Identify which connected integrations agents should use
5. **Create Execution DAG**: Build a logical workflow with proper dependencies
6. **Define Quality Criteria**: Set clear success metrics and quality standards

---

## OUTPUT FORMAT (JSON ONLY)

```json
{{
  "workflow_name": "Descriptive name for this workflow",
  "workflow_description": "Comprehensive overview of what this workflow accomplishes",
  "integration_requirements": [
    {{
      "integration_id": "quickbooks",
      "purpose": "Retrieve financial data for analysis",
      "required_by_agents": ["BusinessIntelligenceAgent", "FinancialIntelligenceAgent"]
    }}
  ],
  "tasks": [
    {{
      "id": "task1",
      "name": "Descriptive task name",
      "agent_type": "AgentClassName",
      "description": "Detailed description of what this task accomplishes",
      "dependencies": [],
      "required_integrations": ["integration_id"],
      "expected_output": "What this task should produce",
      "estimated_duration": "Estimated time in minutes",
      "data_sources": ["Where this task gets its data"]
    }}
  ],
  "quality_criteria": "What defines success for this workflow",
  "success_metrics": ["Metric 1", "Metric 2"],
  "autonomous_level": "full|partial|manual",
  "estimated_total_duration": "Total workflow duration"
}}
```

---

## WORKFLOW PATTERNS

### Pattern 1: Business Intelligence Generation
1. **Data Aggregation**: Use Intelligence Agents to gather data from integrations
2. **Analysis**: Process data with appropriate analytical agents
3. **Insight Generation**: Create actionable insights
4. **Dashboard Update**: Update relevant dashboards
5. **Quality Check**: Judge Agent validates insights

### Pattern 2: Marketing Campaign Execution
1. **Strategy Development**: Strategy/Marketing agents create campaign plan
2. **Content Creation**: Content agents produce creative assets
3. **Platform Execution**: Automation agents deploy to platforms
4. **Performance Monitoring**: Analytics agents track results
5. **Optimization**: Adjust based on performance data

### Pattern 3: Customer Engagement
1. **Customer Analysis**: Customer Intelligence Agent analyzes sentiment
2. **Personalization**: Lead Personalization Agent crafts messages
3. **Multi-Channel Outreach**: Communication agents execute
4. **Response Tracking**: CRM agents track interactions
5. **Follow-up Automation**: Automated nurture sequences

### Pattern 4: Financial Operations
1. **Data Sync**: Bookkeeping Agent syncs from accounting platforms
2. **Analysis**: Financial Intelligence Agent analyzes data
3. **Reporting**: Generate comprehensive financial reports
4. **Alerts**: Flag issues and opportunities
5. **Action Items**: Create tasks for financial management

---

## IMPORTANT RULES

1. **Use Specific Agent Names**: Reference agents by their exact class names (e.g., "BusinessIntelligenceAgent", not "business intelligence")
2. **Leverage Integrations**: When integrations are connected, use them for data and actions
3. **Enable Automation**: Use automation agents (UnifiedAutomationAgent, CRMAutomationAgent, etc.) for platform actions
4. **Ensure Data Flow**: Each task should clearly state its data sources
5. **Quality Gate**: Always include quality check as final or intermediate step
6. **Realistic Estimates**: Provide realistic time estimates for each task
7. **Autonomous Design**: Design for maximum autonomy with minimal human intervention

---

## EXAMPLE WORKFLOWS

### Example 1: "Increase my revenue by 50% in 3 months"

```json
{{
  "workflow_name": "Comprehensive Revenue Growth Strategy & Execution",
  "workflow_description": "Multi-agent workflow to analyze current revenue, identify growth opportunities, execute growth strategies, and track progress toward 50% increase",
  "integration_requirements": [
    {{"integration_id": "stripe", "purpose": "Current revenue data and trends"}},
    {{"integration_id": "google_analytics", "purpose": "Traffic and conversion analysis"}},
    {{"integration_id": "salesforce", "purpose": "Sales pipeline and customer data"}}
  ],
  "tasks": [
    {{
      "id": "revenue_analysis",
      "name": "Current Revenue Analysis",
      "agent_type": "FinancialIntelligenceAgent",
      "description": "Analyze current revenue streams, identify trends, and establish baseline metrics",
      "dependencies": [],
      "required_integrations": ["stripe", "quickbooks"],
      "expected_output": "Revenue analysis report with baseline metrics",
      "estimated_duration": "30",
      "data_sources": ["stripe_revenue_data", "quickbooks_financial_data"]
    }},
    {{
      "id": "growth_opportunities",
      "name": "Identify Growth Opportunities",
      "agent_type": "GrowthOpportunityAgent",
      "description": "Identify specific revenue growth opportunities based on current business data",
      "dependencies": ["revenue_analysis"],
      "required_integrations": ["google_analytics", "salesforce"],
      "expected_output": "Prioritized list of growth opportunities with revenue potential",
      "estimated_duration": "45",
      "data_sources": ["revenue_analysis_output", "market_trends", "customer_data"]
    }},
    {{
      "id": "growth_strategy",
      "name": "Develop Growth Strategy",
      "agent_type": "StrategyAgent",
      "description": "Create comprehensive growth strategy to achieve 50% revenue increase",
      "dependencies": ["growth_opportunities"],
      "required_integrations": [],
      "expected_output": "Detailed growth strategy with tactics and timeline",
      "estimated_duration": "60",
      "data_sources": ["growth_opportunities_output"]
    }},
    {{
      "id": "execute_campaigns",
      "name": "Execute Marketing Campaigns",
      "agent_type": "EnhancedCampaignAgent",
      "description": "Launch optimized marketing campaigns across connected ad platforms",
      "dependencies": ["growth_strategy"],
      "required_integrations": ["google_ads", "meta_ads"],
      "expected_output": "Active campaigns with performance tracking",
      "estimated_duration": "90",
      "data_sources": ["growth_strategy_output", "ad_platform_data"]
    }},
    {{
      "id": "monitor_progress",
      "name": "Monitor Revenue Progress",
      "agent_type": "BusinessIntelligenceAgent",
      "description": "Track revenue growth against 50% target and provide weekly updates",
      "dependencies": ["execute_campaigns"],
      "required_integrations": ["stripe", "google_analytics"],
      "expected_output": "Weekly progress reports with adjustments",
      "estimated_duration": "ongoing",
      "data_sources": ["stripe_revenue_data", "campaign_performance"]
    }}
  ],
  "quality_criteria": "Achieve or exceed 50% revenue growth within 3 months",
  "success_metrics": ["Revenue increase %", "New customer acquisition", "Average order value increase"],
  "autonomous_level": "full",
  "estimated_total_duration": "3 months (with ongoing monitoring)"
}}
```

---

Now, analyze the user's request and create an optimal workflow using the available agents and integrations.

**OUTPUT ONLY VALID JSON** - No explanations, no markdown, just the JSON workflow.
"""
    
    return prompt


class EnhancedOrchestrator:
    """
    Enhanced Orchestrator with full agent and integration awareness.
    """
    
    def __init__(self, user_input: UserInput, user_id: str = None):
        self.user_input = user_input
        self.user_id = user_id
        
        # Use configured provider from environment
        import os
        provider = os.getenv("LLM_PROVIDER", "ollama")
        model = os.getenv("OLLAMA_MODEL", "tinyllama")
        self.llm_client = LlmClient(Llm(provider=provider, model=model))
        
        # Get available agents
        self.available_agents = list(AGENT_REGISTRY.keys())
        self.agent_capabilities = get_all_agent_capabilities()
        
        # Get user's connected integrations
        if user_id:
            self.connected_integrations = get_connected_integrations_summary(user_id)
        else:
            self.connected_integrations = {"total_connected": 0, "by_category": {}}
    
    async def generate_workflow(self) -> SimpleWorkflow:
        """Generate workflow using enhanced orchestration with full agent awareness"""
        logger.info(f"Generating enhanced workflow with {len(self.available_agents)} available agents and {self.connected_integrations['total_connected']} connected integrations...")
        
        prompt = generate_enhanced_dag_prompt(self.user_input, self.user_id)
        response_str = await self.llm_client.chat(prompt)
        
        try:
            # Clean JSON response
            if response_str.startswith("```json"):
                response_str = response_str[7:]
            if response_str.endswith("```"):
                response_str = response_str[:-3]
            response_str = response_str.strip()
            
            workflow_data = json.loads(response_str)
            tasks = [Task(**task_data) for task_data in workflow_data.get("tasks", [])]
            workflow = SimpleWorkflow(user_input=self.user_input, tasks=tasks)
            
            logger.info(f"Successfully generated enhanced workflow with {len(tasks)} tasks")
            logger.info(f"Workflow: {workflow_data.get('workflow_name', 'Unnamed')}")
            logger.info(f"Integration requirements: {len(workflow_data.get('integration_requirements', []))}")
            
            return workflow
            
        except (json.JSONDecodeError, TypeError) as e:
            logger.error(f"Failed to parse LLM response into JSON. Error: {e}. Response: {response_str}")
            raise ValueError(f"Could not generate a valid workflow from the LLM response: {str(e)}")
    
    async def execute_workflow(self, workflow: SimpleWorkflow, on_step_complete: Callable) -> Dict[str, Any]:
        """Execute workflow with full agent coordination"""
        logger.info(f"Starting enhanced workflow execution for: {workflow.user_input.objective}")
        execution_context: Dict[str, Any] = {}
        
        completed_tasks = set()
        while len(completed_tasks) < len(workflow.tasks):
            # Find tasks ready to execute
            tasks_to_run = [
                task for task in workflow.tasks
                if task.task_id not in completed_tasks and all(dep in completed_tasks for dep in task.dependencies)
            ]
            
            if not tasks_to_run and len(completed_tasks) < len(workflow.tasks):
                raise RuntimeError("Workflow has a cycle or unresolved dependencies.")
            
            # Execute tasks in parallel
            results = await asyncio.gather(
                *(self._execute_task(task, execution_context, on_step_complete) for task in tasks_to_run)
            )
            
            for task, result in zip(tasks_to_run, results):
                execution_context[task.task_id] = result
                completed_tasks.add(task.task_id)
        
        logger.info("Enhanced workflow execution finished.")
        return execution_context
    
    async def _execute_task(self, task: Task, context: Dict[str, Any], on_step_complete: Callable) -> Any:
        """Execute individual task with agent"""
        logger.info(f"Executing task: {task.task_id} with agent: {task.agent}")
        
        agent_class = AGENT_REGISTRY.get(task.agent)
        if not agent_class:
            raise ValueError(f"Unknown agent '{task.agent}' specified in workflow.")
        
        # Gather context from dependencies
        strategy_context = ""
        if task.dependencies:
            dep_outputs = [json.dumps(context.get(dep_id, {})) for dep_id in task.dependencies]
            strategy_context = "\n---\n".join(dep_outputs)
        
        # Instantiate agent with appropriate parameters
        try:
            if task.agent in ["Copywriter", "PaidAdsAgent", "CRMAgent", "ProjectManagerAgent"]:
                agent = agent_class(self.user_input, strategy_context=strategy_context)
            elif task.agent == "JudgeAgent":
                agent = agent_class(self.user_input, content_to_evaluate=strategy_context)
            else:
                agent = agent_class(self.user_input)
        except TypeError:
            logger.warning(f"Could not instantiate {task.agent} with context. Falling back to user_input only.")
            agent = agent_class(self.user_input)
        
        # Execute agent
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


# Convenience function
async def create_enhanced_workflow(user_input: UserInput, user_id: str = None) -> SimpleWorkflow:
    """Create an enhanced workflow with full agent and integration awareness"""
    orchestrator = EnhancedOrchestrator(user_input, user_id)
    return await orchestrator.generate_workflow()

