"""
Automation Bridge Agent for Guild-AI
Comprehensive cross-app automation design and orchestration using advanced prompting strategies.
"""

from guild.src.core.llm_client import LlmClient
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime
from guild.src.core.agent_helpers import inject_knowledge
import asyncio
import json


@dataclass
class AppConnector:
    """Represents an application connector capability profile."""
    app: str
    triggers: List[str]
    actions: List[str]
    auth_type: str
    rate_limits: Optional[str]


@dataclass
class AutomationStep:
    """Represents a single automation step."""
    step_id: str
    app: str
    action: str
    inputs: Dict[str, Any]
    outputs: List[str]


@dataclass
class AutomationPlan:
    """Represents an executable automation plan."""
    name: str
    description: str
    steps: List[AutomationStep]
    error_handling: Dict[str, Any]
    monitoring: Dict[str, Any]


@inject_knowledge
async def generate_comprehensive_automation_strategy(
    objectives: Dict[str, Any],
    app_inventory: Dict[str, Any],
    data_flow: Dict[str, Any],
    constraints: Dict[str, Any],
    reliability_requirements: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Generates a comprehensive cross-app automation strategy using advanced prompting.
    """
    print("Automation Bridge Agent: Generating comprehensive automation strategy with injected knowledge...")

    prompt = f"""
# Automation Bridge Agent - Cross-App Automation Orchestration

## Role Definition
You are the **Automation Bridge Agent**, an expert in designing and orchestrating robust cross-application automations. Your role is to map objectives to triggers, actions, and data flows across SaaS tools, with resilience, monitoring, and safe fallbacks.

## Core Expertise
- App connector capability mapping
- Data flow design and transformation
- Error handling and retry strategies
- Idempotency and deduplication
- Monitoring, alerting, and logging
- Security and permission scoping

## Context
- Objectives: {json.dumps(objectives, indent=2)}
- App Inventory: {json.dumps(app_inventory, indent=2)}
- Data Flow: {json.dumps(data_flow, indent=2)}
- Constraints: {json.dumps(constraints, indent=2)}
- Reliability Requirements: {json.dumps(reliability_requirements, indent=2)}

## Tasks
1) Map objectives to triggers/actions across apps.
2) Define data transformations and schemas.
3) Design error handling, retries, and idempotency.
4) Specify monitoring and alerting.
5) Produce an executable automation plan.

## Output JSON
{{
  "connectors": [{{"app":"","triggers":[""],"actions":[""],"auth_type":"oauth|api_key|none","rate_limits":""}}],
  "plans": [{{
     "name":"","description":"",
     "steps":[{{"step_id":"","app":"","action":"","inputs":{{}},"outputs":[""]}}],
     "error_handling":{{"retry_policy":"","dead_letter_queue":true,"idempotency_key":""}},
     "monitoring":{{"logs":true,"alerts":[""],"dashboards":[""]}}
  }}]
}}
Return only JSON.
"""

    try:
        from guild.src.models.llm import Llm
        client = LlmClient(Llm(provider="ollama", model="tinyllama"))
        response = await client.chat(prompt)
        try:
            strategy = json.loads(response)
            print("Automation Bridge Agent: Successfully generated strategy.")
            return strategy
        except json.JSONDecodeError as e:
            print(f"Automation Bridge Agent: JSON parse error: {e}")
            # Robust fallback
            return {
                "connectors": [
                    {"app": "Gmail", "triggers": ["new_email"], "actions": ["send_email"], "auth_type": "oauth", "rate_limits": "moderate"},
                    {"app": "Slack", "triggers": ["new_message"], "actions": ["post_message"], "auth_type": "oauth", "rate_limits": "moderate"}
                ],
                "plans": [
                    {
                        "name": "Lead Intake to CRM",
                        "description": "Capture leads from email and post to CRM with Slack alert",
                        "steps": [
                            {"step_id": "s1", "app": "Gmail", "action": "parse_email", "inputs": {"label": "Leads"}, "outputs": ["lead_name", "lead_email"]},
                            {"step_id": "s2", "app": "HubSpot", "action": "create_contact", "inputs": {"email": "{{lead_email}}", "name": "{{lead_name}}"}, "outputs": ["contact_id"]},
                            {"step_id": "s3", "app": "Slack", "action": "post_message", "inputs": {"channel": "#leads", "text": "New lead: {{lead_name}}"}, "outputs": []}
                        ],
                        "error_handling": {"retry_policy": "exponential_backoff", "dead_letter_queue": True, "idempotency_key": "email+timestamp"},
                        "monitoring": {"logs": True, "alerts": ["step_failures"], "dashboards": ["throughput", "latency"]}
                    }
                ]
            }
    except Exception as e:
        print(f"Automation Bridge Agent: Execution error: {e}")
        return {
            "connectors": [],
            "plans": [],
            "error": str(e)
        }


class AutomationBridgeAgent:
    """
    Automation Bridge Agent - Designs resilient cross-app automations with monitoring and fallbacks.
    """

    def __init__(self, user_input: Optional[str] = None):
        self.user_input = user_input
        self.agent_name = "Automation Bridge Agent"
        self.agent_type = "Automation & Productivity Enhancement"
        self.capabilities = [
            "Connector mapping",
            "Data flow design",
            "Error handling",
            "Idempotency",
            "Monitoring & alerting"
        ]
        from guild.src.models.llm import Llm
        self.llm_client = LlmClient(Llm(provider="ollama", model="tinyllama"))

    async def run(self, user_input: Optional[str] = None) -> Dict[str, Any]:
        try:
            print("Automation Bridge Agent: Starting comprehensive automation design...")

            objectives = {"goal": "Automate lead intake from email to CRM with Slack alerts"}
            app_inventory = {"apps": ["Gmail", "Slack", "HubSpot", "Google Sheets"]}
            data_flow = {"fields": ["name", "email", "company"], "schemas": {"lead": {"name": "str", "email": "str"}}}
            constraints = {"security": "oauth_preferred", "rate_limits": "respect_provider_limits"}
            reliability_requirements = {"retries": "exponential_backoff", "idempotency": True}

            strategy = await generate_comprehensive_automation_strategy(
                objectives=objectives,
                app_inventory=app_inventory,
                data_flow=data_flow,
                constraints=constraints,
                reliability_requirements=reliability_requirements
            )

            execution = await self._execute_automation_workflow(strategy)

            result = {
                "agent": self.agent_name,
                "strategy_type": "comprehensive_automation_bridge",
                "automation_strategy": strategy,
                "execution_result": execution,
                "timestamp": datetime.now().isoformat(),
                "status": "completed"
            }
            print("Automation Bridge Agent: Completed.")
            return result
        except Exception as e:
            print(f"Automation Bridge Agent: Error: {e}")
            return {
                "agent": self.agent_name,
                "status": "error",
                "message": str(e),
                "timestamp": datetime.now().isoformat()
            }

    async def _execute_automation_workflow(self, strategy: Dict[str, Any]) -> Dict[str, Any]:
        try:
            connectors = await self._normalize_connectors(strategy.get("connectors", []))
            plans = await self._normalize_plans(strategy.get("plans", []))
            validations = await self._validate_plans(plans, connectors)
            return {
                "connectors": connectors,
                "plans": plans,
                "validations": validations
            }
        except Exception as e:
            print(f"Automation Bridge Agent: Workflow error: {e}")
            return {"connectors": [], "plans": [], "validations": [], "error": str(e)}

    async def _normalize_connectors(self, raw: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        try:
            out = []
            for c in raw:
                out.append(AppConnector(
                    app=str(c.get("app", "app")),
                    triggers=[str(x) for x in c.get("triggers", [])],
                    actions=[str(x) for x in c.get("actions", [])],
                    auth_type=str(c.get("auth_type", "oauth")),
                    rate_limits=c.get("rate_limits")
                ).__dict__)
            return out
        except Exception as e:
            print(f"Automation Bridge Agent: Normalize connectors error: {e}")
            return []

    async def _normalize_plans(self, raw: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        try:
            normalized = []
            for p in raw:
                steps: List[Dict[str, Any]] = []
                for s in p.get("steps", []):
                    steps.append(AutomationStep(
                        step_id=str(s.get("step_id", "s1")),
                        app=str(s.get("app", "")),
                        action=str(s.get("action", "")),
                        inputs=s.get("inputs", {}),
                        outputs=[str(x) for x in s.get("outputs", [])]
                    ).__dict__)
                normalized.append(AutomationPlan(
                    name=str(p.get("name", "automation")),
                    description=str(p.get("description", "")),
                    steps=steps,
                    error_handling=p.get("error_handling", {"retry_policy": "exponential_backoff", "dead_letter_queue": True, "idempotency_key": "id"}),
                    monitoring=p.get("monitoring", {"logs": True, "alerts": ["failures"], "dashboards": ["latency"]})
                ).__dict__)
            return normalized
        except Exception as e:
            print(f"Automation Bridge Agent: Normalize plans error: {e}")
            return []

    async def _validate_plans(self, plans: List[Dict[str, Any]], connectors: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        try:
            validations = []
            app_to_caps = {c["app"].lower(): c for c in connectors}
            for plan in plans:
                issues = []
                for step in plan.get("steps", []):
                    app_caps = app_to_caps.get(step.get("app", "").lower())
                    if not app_caps:
                        issues.append(f"No connector for app: {step.get('app')}")
                    else:
                        if step.get("action") not in app_caps.get("actions", []):
                            issues.append(f"Action not supported: {step.get('app')}::{step.get('action')}")
                validations.append({"plan": plan.get("name"), "issues": issues, "valid": len(issues) == 0})
            return validations
        except Exception as e:
            print(f"Automation Bridge Agent: Validate plans error: {e}")
            return []
