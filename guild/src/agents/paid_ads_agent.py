from guild.src.core import llm_client
from typing import Dict, Any
from guild.src.core.agent_helpers import inject_knowledge

@inject_knowledge
def generate_ad_campaign(objective: str, target_audience: str, prompt: str = None) -> Dict[str, Any]:
    """
    Generates a comprehensive, multi-platform paid advertising campaign plan using an LLM.
    This function is decorated to automatically inject real-time knowledge about ad trends.
    """
    print("Paid Ads Agent: Generating world-class ad campaign...")

    # The prompt is constructed by the orchestrator, but if not provided,
    # we can create a default one here.
    if not prompt:
        prompt = f"""
        You are a world-class digital advertising strategist, on par with top-tier ad agencies. You are tasked with creating a comprehensive paid advertising campaign.

        Client's Objective: "{objective}"
        Target Audience: "{target_audience}"

        Based on this, and the real-time advertising trends provided in the context, generate a detailed ad campaign plan as a JSON object. The JSON object must include:
        - "campaign_name": "A catchy and descriptive name for the campaign.",
        - "target_platforms": ["A list of platforms to target, e.g., 'Meta (Facebook/Instagram)', 'Google Ads (Search)','LinkedIn Ads'"],
        - "ad_creatives": [
            {{
              "platform": "Meta",
              "headline": "A compelling, scroll-stopping headline using the AIDA framework.",
              "body": "Persuasive ad copy using the PAS (Problem-Agitate-Solution) framework.",
              "cta": "A clear call-to-action."
            }},
            {{
              "platform": "Google Ads",
              "headline_1": "Keyword-rich headline 1 (max 30 chars).",
              "headline_2": "Benefit-driven headline 2 (max 30 chars).",
              "description": "A concise description (max 90 chars)."
            }}
          ],
        - "targeting_strategy": {{
            "demographics": "Describe the age, location, and other demographics.",
            "interests_and_behaviors": ["List specific interests or behaviors to target."],
            "retargeting_plan": "Briefly describe a plan to retarget website visitors or past customers."
          }},
        - "performance_estimates": {{
            "estimated_ctr": "e.g., '1.5% - 2.5%'",
            "estimated_cpc": "e.g., '$1.20 - $2.50'",
            "estimated_roas": "Provide a target Return On Ad Spend, e.g., '3:1'"
          }},
        - "compliance_check": "A brief note confirming the ad copy adheres to common platform policies."

        Return ONLY the JSON object.
        """

    try:
        campaign_plan = llm_client.generate_json(prompt=prompt)
        print("Paid Ads Agent: Successfully generated ad campaign plan.")
        return campaign_plan
    except Exception as e:
        print(f"Paid Ads Agent: Failed to generate ad campaign. Error: {e}")
        raise
