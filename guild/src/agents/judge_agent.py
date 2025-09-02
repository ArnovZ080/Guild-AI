from guild.src.core.models.schemas import OutcomeContractCreate, Rubric
from guild.src.core import llm_client


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
    ## Agent Profile
    **Role:** The Judge Agent, responsible for creating task-specific quality rubrics and evaluating all outputs against them.
    
    **Expertise:** Quality assurance, rubric design, evaluation frameworks, and objective assessment.
    
    **Objective:** To generate comprehensive quality rubrics that define success metrics for AI workforce deliverables, ensuring consistent quality control across all agent outputs.

    ## Task Instructions
    **Input:** Outcome contract with objective: "{contract.objective}" and deliverables: {', '.join(contract.deliverables)}
    **Context:** Creating a quality rubric for AI workforce deliverables to ensure consistent quality standards
    **Constraints:** Rubric must be specific, measurable, and relevant to the specific request

    **Steps:**
    1. **Analyze the objective** to understand what success looks like
    2. **Review deliverables** to identify quality dimensions
    3. **Design evaluation criteria** that are specific and measurable
    4. **Set appropriate weights** for balanced evaluation
    5. **Determine required checks** based on content type and objectives

    **Output Format (JSON only):**
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

    **Quality Criteria:**
    - Create at least 4 relevant criteria specific to the objective
    - The weights of all criteria must sum to 1.0
    - Base criteria on the specific objective and deliverables
    - For 'ad copy', include 'Conversion Potential'
    - For 'research', include 'Depth of Analysis'
    - For 'content strategy', include 'Strategic Alignment'
    - Set boolean flags based on content type relevance

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
    ## Agent Profile
    **Role:** The Judge Agent, responsible for evaluating content against predefined quality rubrics.
    
    **Expertise:** Quality assessment, objective evaluation, feedback generation, and scoring methodologies.
    
    **Objective:** To provide fair, objective, and constructive evaluation of AI-generated content against established quality criteria.

    ## Task Instructions
    **Input:** Content to evaluate and quality rubric for assessment
    **Context:** Evaluating AI-generated content against predefined quality standards to ensure consistent output quality
    **Constraints:** Must be objective, fair, and provide actionable feedback

    **Steps:**
    1. **Analyze the content** against each rubric criterion
    2. **Score each criterion** objectively (0.0 to 1.0 scale)
    3. **Calculate final score** as weighted average
    4. **Generate constructive feedback** with specific improvement suggestions
    5. **Ensure objectivity** in all assessments

    **Content to Evaluate:**
    --- CONTENT START ---
    {content[:2000]}
    --- CONTENT END ---

    **Rubric for Evaluation:**
    --- RUBRIC START ---
    {rubric.json()}
    --- RUBRIC END ---

    **Output Format (JSON only):**
    {{
      "scores": [
        {{ "criterion": "Criterion Name from Rubric", "score": 0.0 to 1.0, "reasoning": "Brief explanation for your score." }}
      ],
      "final_score": 0.0 to 1.0,
      "feedback": "A summary of the content's strengths and weaknesses, with specific suggestions for improvement."
    }}

    **Evaluation Guidelines:**
    - Score each criterion objectively on a 0.0 to 1.0 scale
    - The 'final_score' should be the weighted average of individual criterion scores
    - Be critical but fair in your assessment
    - Provide specific, actionable feedback for improvement
    - Focus on the content's alignment with the rubric criteria

    Return ONLY the JSON object, with no other text or explanation.
    """

    try:
        evaluation_result = llm_client.generate_json(prompt=prompt)
        print("Judge Agent: Successfully evaluated content.")
        return evaluation_result
    except Exception as e:
        print(f"Judge Agent: Failed to evaluate content. Error: {e}")
        raise


class JudgeAgent:
    """Class wrapper to satisfy imports expecting a JudgeAgent with methods."""

    @staticmethod
    def generate_rubric(contract: OutcomeContractCreate) -> Rubric:
        return generate_rubric(contract)

    @staticmethod
    def evaluate_output(content: str, rubric: Rubric) -> dict:
        return evaluate_output(content, rubric)
