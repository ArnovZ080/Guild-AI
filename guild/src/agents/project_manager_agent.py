from guild.src.core import llm_client
from typing import Dict, Any
from guild.src.core.agent_helpers import inject_knowledge

@inject_knowledge
def create_project_plan(objective: str, deliverables: list, prompt: str = None) -> Dict[str, Any]:
    """
    Creates a detailed project plan based on an objective and deliverables.
    This function is decorated to automatically inject real-time knowledge about project management.
    """
    print("Project Manager Agent: Creating project plan...")

    if not prompt:
        prompt = f"""
        You are a world-class project manager, certified in PMP, Agile, and Scrum. You are an expert with tools like Asana, Jira, and Monday.com. Your task is to create a detailed project plan.

        Project Objective: "{objective}"
        Key Deliverables: {', '.join(deliverables)}

        Based on this, and the project management best practices from the provided web context, generate a project plan as a JSON object. The JSON object must include:
        - "project_name": "A clear and concise name for the project.",
        - "milestones": [
            {{
              "name": "Milestone 1: Planning & Strategy",
              "tasks": [
                {{"task_name": "Define project scope", "assigned_agent": "Business Strategist Agent", "due_date": "End of Week 1"}},
                {{"task_name": "Conduct market research", "assigned_agent": "Research Agent", "due_date": "End of Week 1"}}
              ]
            }},
            {{
              "name": "Milestone 2: Content Creation",
              "tasks": [
                 {{"task_name": "Generate blog post drafts", "assigned_agent": "Copywriter Agent", "due_date": "End of Week 2"}}
              ]
            }}
          ],
        - "risk_assessment": [
            {{"risk": "Potential risk description", "mitigation": "How to mitigate this risk."}}
          ]

        - Assign tasks to the most appropriate agent type (e.g., 'Research Agent', 'Content Strategist Agent', 'Copywriter Agent').
        - Create a logical sequence of milestones and tasks.

        Return ONLY the JSON object.
        """

    try:
        project_plan = llm_client.generate_json(prompt=prompt)
        print("Project Manager Agent: Successfully created project plan.")
        return project_plan
    except Exception as e:
        print(f"Project Manager Agent: Failed to create project plan. Error: {e}")
        raise
