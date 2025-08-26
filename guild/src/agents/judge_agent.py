from guild.core.models.schemas import OutcomeContractCreate, Rubric
from guild.src.core import llm_client
from guild.src.core.models.schemas import OutcomeContractCreate, Rubric

def generate_rubric(contract: OutcomeContractCreate) -> Rubric:
    """
    Analyzes an OutcomeContract and generates a quality rubric by calling the LLM client.

    Args:
        contract: The Pydantic model of the user's contract request.

    Returns:
        A generated Rubric object validated against the Pydantic schema.
    """

    # 1. Construct a detailed prompt for the LLM
    prompt = f"""
    You are an expert project manager and quality assurance specialist. Your task is to create a detailed quality rubric for an AI workforce based on a user's request.

    The user's objective is: "{contract.objective}"
    The required deliverables are: {', '.join(contract.deliverables)}

    Based on this, generate a JSON object that represents a quality rubric. The JSON object must have the following structure:
    {{
      "quality_threshold": 0.8,
      "criteria": [
        {{ "name": "Criterion Name", "description": "Detailed description of what to measure.", "weight": 0.0 to 1.0 }},
        ...
      ],
      "fact_check_required": boolean,
      "brand_compliance_required": boolean,
      "seo_optimization_required": boolean
    }}

    - Create at least 4 relevant criteria.
    - The weights of all criteria must sum to 1.0.
    - Base the criteria on the specific objective and deliverables. For example, if the user asks for 'ad copy', include a criterion for 'Conversion Potential'. If they ask for 'research', include 'Depth of Analysis'.
    - Set the boolean flags based on whether those checks seem relevant to the request.

    Return ONLY the JSON object, with no other text or explanation.
    """

    # 2. Call the LLM to get a JSON response
    print("Judge Agent: Requesting rubric generation from LLM client...")
    try:
        rubric_json = llm_client.generate_json(prompt=prompt)

        # 3. Parse the JSON into our Pydantic model for validation
        # This will raise a ValidationError if the LLM's output doesn't match the schema
        validated_rubric = Rubric.model_validate(rubric_json)

        print("Judge Agent: Successfully generated and validated rubric.")
        return validated_rubric

    except Exception as e:
        print(f"Judge Agent: Failed to generate rubric. Error: {e}")
        # As a fallback, we could return a default rubric, but for now we'll re-raise
        raise

def evaluate_output(content: str, rubric: Rubric) -> dict:
    """
    Evaluates a piece of content against a given rubric using an LLM.

    Args:
        content: The generated content to be evaluated.
        rubric: The Pydantic Rubric object to evaluate against.

    Returns:
        A dictionary containing the evaluation results, including scores and feedback.
    """
    print("Judge Agent: Evaluating content against rubric...")

    prompt = f"""
    You are a strict and fair quality assurance specialist. Your task is to evaluate a piece of content based on a predefined rubric.

    Here is the content to evaluate:
    --- CONTENT START ---
    {content[:2000]}
    --- CONTENT END ---

    Here is the rubric to use for evaluation:
    --- RUBRIC START ---
    {rubric.json()}
    --- RUBRIC END ---

    Please provide your evaluation as a JSON object. The JSON object must have the following structure:
    {{
      "scores": [
        {{ "criterion": "Criterion Name from Rubric", "score": 0.0 to 1.0, "reasoning": "Brief explanation for your score." }}
      ],
      "final_score": 0.0 to 1.0,
      "feedback": "A summary of the content's strengths and weaknesses, with specific suggestions for improvement."
    }}

    - The 'final_score' should be the weighted average of the individual criterion scores.
    - Be critical and objective in your assessment.

    Return ONLY the JSON object, with no other text or explanation.
    """

    try:
        evaluation_result = llm_client.generate_json(prompt=prompt)
        print("Judge Agent: Successfully evaluated content.")
        return evaluation_result
    except Exception as e:
        print(f"Judge Agent: Failed to evaluate content. Error: {e}")
        raise
