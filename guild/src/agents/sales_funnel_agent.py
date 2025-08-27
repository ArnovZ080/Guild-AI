from guild.src.core import llm_client
from typing import Dict, Any
from guild.src.core.agent_helpers import inject_knowledge

@inject_knowledge
def design_sales_funnel(objective: str, product_description: str, prompt: str = None) -> Dict[str, Any]:
    """
    Designs a sales funnel for a given product and objective using an LLM.
    This function is decorated to automatically inject real-time knowledge about funnel strategies.
    """
    print("Sales Funnel Agent: Designing sales funnel...")

    if not prompt:
        prompt = f"""
        You are a world-class marketing funnel expert, combining the knowledge of Russell Brunson and modern growth hackers. You are tasked with designing a high-converting sales funnel.

        Client's Objective: "{objective}"
        Product Description: "{product_description}"

        Based on this, and the real-time marketing trends from the provided web context, generate a detailed sales funnel plan as a JSON object. The JSON object must include:
        - "funnel_type": "e.g., 'Lead Magnet Funnel', 'Webinar Funnel', 'Product Launch Funnel'",
        - "stages": [
            {{
              "name": "Top of Funnel (Awareness)",
              "strategy": "Describe the strategy to attract visitors (e.g., 'Run targeted Facebook Ads leading to a blog post').",
              "content_needed": ["e.g., 'Ad copy', 'Blog post about X'"]
            }},
            {{
              "name": "Middle of Funnel (Consideration)",
              "strategy": "Describe how to capture leads (e.g., 'Offer a free PDF checklist as a lead magnet').",
              "content_needed": ["e.g., 'Lead magnet PDF', 'Landing page copy', 'Email nurture sequence (3 emails)']
            }},
            {{
              "name": "Bottom of Funnel (Conversion)",
              "strategy": "Describe the core offer and conversion mechanism (e.g., 'Direct users to a sales page with a video sales letter (VSL)').",
              "content_needed": ["e.g., 'Sales page copy', 'VSL script', 'Checkout page copy']
            }}
          ],
        - "key_metrics_to_track": ["e.g., 'Lead magnet opt-in rate', 'Sales page conversion rate', 'Average order value'"]

        Return ONLY the JSON object.
        """

    try:
        funnel_plan = llm_client.generate_json(prompt=prompt)
        print("Sales Funnel Agent: Successfully designed sales funnel.")
        return funnel_plan
    except Exception as e:
        print(f"Sales Funnel Agent: Failed to design sales funnel. Error: {e}")
        raise
