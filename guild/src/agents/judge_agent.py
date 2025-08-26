from guild.core.models.schemas import OutcomeContractCreate, Rubric, RubricCriterion
from typing import List

def generate_rubric(contract: OutcomeContractCreate) -> Rubric:
    """
    Analyzes an OutcomeContract and generates a quality rubric.

    This is a simplified, rule-based implementation. A more advanced
    version could use an LLM to generate a more nuanced rubric.

    Args:
        contract: The Pydantic model of the OutcomeContract.

    Returns:
        A generated Rubric object.
    """
    criteria: List[RubricCriterion] = []

    # Basic criteria for all deliverables
    criteria.append(RubricCriterion(name="Clarity", description="Is the content clear, concise, and easy to understand?", weight=0.25))
    criteria.append(RubricCriterion(name="Accuracy", description="Is the information presented factually accurate?", weight=0.25))
    criteria.append(RubricCriterion(name="Brand Voice", description="Does the content align with the brand's tone and voice?", weight=0.25))

    # Add specific criteria based on deliverables in the contract
    for deliverable in contract.deliverables:
        if "ad" in deliverable.lower():
            criteria.append(RubricCriterion(name="Conversion Potential", description="Is the ad copy compelling and likely to convert?", weight=0.25))
        if "blog" in deliverable.lower() or "post" in deliverable.lower():
            criteria.append(RubricCriterion(name="SEO Optimization", description="Is the content optimized for relevant keywords?", weight=0.25))
        if "report" in deliverable.lower() or "analysis" in deliverable.lower():
            criteria.append(RubricCriterion(name="Depth of Analysis", description="Does the report provide deep and actionable insights?", weight=0.25))

    # Normalize weights so they sum to 1.0
    total_weight = sum(c.weight for c in criteria)
    if total_weight > 0:
        for criterion in criteria:
            criterion.weight = round(criterion.weight / total_weight, 2)

    # Ensure weights sum exactly to 1.0 due to rounding by adjusting the last element
    weight_sum = sum(c.weight for c in criteria)
    if weight_sum != 1.0 and criteria:
        criteria[-1].weight += 1.0 - weight_sum
        criteria[-1].weight = round(criteria[-1].weight, 2)


    return Rubric(
        quality_threshold=0.8,
        criteria=criteria,
        fact_check_required="accuracy" in [c.name.lower() for c in criteria],
        brand_compliance_required="brand voice" in [c.name.lower() for c in criteria]
    )
