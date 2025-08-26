from guild.src.core import llm_client
from typing import Dict, Any

def generate_business_strategy(objective: str, target_audience: str) -> Dict[str, Any]:
    """
    Generates a high-level business strategy document using an LLM.

    Args:
        objective: The high-level business objective.
        target_audience: A description of the target audience.

    Returns:
        A dictionary representing the business strategy.
    """
    print("Business Strategist Agent: Generating business strategy...")

    prompt = f"""
    You are a seasoned business strategist and consultant. Your task is to create a high-level business strategy document based on a client's objective.

    Client's Objective: "{objective}"
    Target Audience: "{target_audience}"

    Based on this, generate a JSON object that outlines a business strategy. The JSON object should include:
    - market_analysis: A brief SWOT analysis (Strengths, Weaknesses, Opportunities, Threats).
    - positioning_statement: A clear statement on how the product/service should be positioned in the market.
    - key_initiatives: A list of 3-5 key strategic initiatives to achieve the objective.
    - success_metrics: A list of key performance indicators (KPIs) to measure success.

    Return ONLY the JSON object, with no other text or explanation.
    """

    try:
        strategy = llm_client.generate_json(prompt=prompt)
        print("Business Strategist Agent: Successfully generated business strategy.")
        return strategy
    except Exception as e:
        print(f"Business Strategist Agent: Failed to generate strategy. Error: {e}")
        raise
