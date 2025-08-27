from guild.src.core import llm_client
from typing import Dict, Any
from guild.src.core.agent_helpers import inject_knowledge

@inject_knowledge
def draft_job_description(role: str, key_responsibilities: list, prompt: str = None) -> Dict[str, Any]:
    """
    Drafts a comprehensive job description for a given role using an LLM.
    This function is decorated to automatically inject real-time knowledge about hiring best practices.
    """
    print(f"HR Agent: Drafting job description for role: {role}...")

    if not prompt:
        prompt = f"""
        You are a senior HR manager and recruitment specialist at a top tech company. You are an expert in crafting compelling job descriptions that attract top talent.

        Role to Hire: "{role}"
        Key Responsibilities: {', '.join(key_responsibilities)}

        Based on this, and the HR best practices from the provided web context, generate a detailed job description as a JSON object. The JSON object must include:
        - "job_title": "The official job title.",
        - "summary": "A compelling one-paragraph summary of the role and its impact.",
        - "responsibilities": ["A detailed list of day-to-day responsibilities."],
        - "qualifications": {{
            "required": ["List of must-have skills and experience."],
            "preferred": ["List of nice-to-have skills."]
          }},
        - "company_culture_blurb": "A short paragraph about the company culture to attract the right candidates."

        Return ONLY the JSON object.
        """

    try:
        job_description = llm_client.generate_json(prompt=prompt)
        print("HR Agent: Successfully drafted job description.")
        return job_description
    except Exception as e:
        print(f"HR Agent: Failed to draft job description. Error: {e}")
        raise
