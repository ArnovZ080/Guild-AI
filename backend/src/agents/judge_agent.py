"""
Enhanced Judge Agent - Production Ready for Google Cloud Vertex AI
Complete Judge Layer implementation with rubric generation, evaluation league, and auto-revision loop.
Implements the exact specification for quality assurance and evaluation.
"""

import asyncio
import json
import uuid
from typing import Dict, List, Any, Optional, Union
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum
import logging

from .agent_template import AgentTemplate, AgentCapability, TaskComplexity
from ..core.llm_client import LlmClient
from ..core.agent_helpers import inject_knowledge

logger = logging.getLogger(__name__)

class EvaluationStatus(Enum):
    PASSED = "passed"
    FAILED = "failed"
    NEEDS_REVISION = "needs_revision"
    ESCALATED = "escalated"

@dataclass
class RubricCriteria:
    """Individual rubric criterion"""
    name: str
    description: str
    weight: float  # 0.0 to 1.0
    threshold: float  # Minimum score to pass (0.0 to 1.0)
    measurement_type: str  # "binary", "scale", "percentage"

@dataclass
class QualityRubric:
    """Complete quality rubric for task evaluation"""
    task_id: str
    task_type: str
    objectives: List[str]
    criteria: List[RubricCriteria]
    overall_threshold: float  # Minimum overall score to pass
    max_revisions: int
    created_at: datetime

@dataclass
class EvaluationResult:
    """Result from an individual evaluator"""
    evaluator_id: str
    evaluator_name: str
    score: float  # 0.0 to 1.0
    feedback: str
    confidence: float
    timestamp: datetime

@dataclass
class JudgeDecision:
    """Final decision from Judge Agent"""
    overall_score: float
    status: EvaluationStatus
    feedback: str
    revision_required: bool
    revision_feedback: Optional[str]
    evaluator_results: List[EvaluationResult]
    timestamp: datetime

class JudgeAgent(AgentTemplate):
    """
    Enhanced Judge Agent with complete Judge Layer implementation
    Production-ready for Google Cloud Vertex AI deployment
    """
    
    def __init__(self, agent_id: str = "judge_agent"):
        # Define specific capabilities
        specific_capabilities = [
            AgentCapability(
                name="rubric_generation",
                description="Generate comprehensive quality rubrics for any task type",
                complexity=TaskComplexity.MODERATE,
                estimated_duration=10
            ),
            AgentCapability(
                name="quality_evaluation",
                description="Evaluate deliverables against rubrics with scoring",
                complexity=TaskComplexity.MODERATE,
                estimated_duration=15
            ),
            AgentCapability(
                name="revision_management",
                description="Manage auto-revision loops and escalation",
                complexity=TaskComplexity.MODERATE,
                estimated_duration=20
            ),
            AgentCapability(
                name="evaluation_league_coordination",
                description="Coordinate multiple evaluator agents for comprehensive assessment",
                complexity=TaskComplexity.COMPLEX,
                estimated_duration=25
            ),
            AgentCapability(
                name="quality_assurance",
                description="Ensure consistent quality standards across all outputs",
                complexity=TaskComplexity.MODERATE,
                estimated_duration=15
            )
        ]
        
        super().__init__(
            agent_id=agent_id,
            name="Judge Agent",
            description="Comprehensive quality assurance and evaluation specialist with rubric generation and evaluation league coordination",
            capabilities=[
                "rubric_generation",
                "quality_evaluation",
                "revision_management",
                "evaluation_league_coordination",
                "quality_assurance",
                "scoring_system",
                "feedback_generation",
                "threshold_enforcement"
            ],
            category="evaluation",
            icon="⚖️",
            specific_capabilities=specific_capabilities
        )
        
        # Judge-specific properties
        self.evaluation_league = {}
        self.active_rubrics = {}
        self.revision_histories = {}
        
        # Initialize evaluation league
        self._initialize_evaluation_league()
    
    def _initialize_evaluation_league(self):
        """Initialize the evaluation league with specialized evaluators"""
        self.evaluation_league = {
            "fact_checker": {
                "name": "Fact Checker Agent",
                "description": "Validates factual claims and statistics",
                "specialization": "factual_accuracy",
                "weight": 0.25
            },
            "brand_checker": {
                "name": "Brand Checker Agent", 
                "description": "Ensures brand compliance and voice consistency",
                "specialization": "brand_compliance",
                "weight": 0.20
            },
            "seo_evaluator": {
                "name": "SEO Evaluator Agent",
                "description": "Evaluates SEO optimization and content structure",
                "specialization": "seo_optimization",
                "weight": 0.15
            },
            "audience_checker": {
                "name": "Audience Alignment Agent",
                "description": "Ensures content aligns with target audience",
                "specialization": "audience_alignment",
                "weight": 0.20
            },
            "technical_validator": {
                "name": "Technical Validator Agent",
                "description": "Validates technical accuracy and implementation",
                "specialization": "technical_accuracy",
                "weight": 0.20
            }
        }
    
    def get_required_task_fields(self) -> List[str]:
        """Get list of required fields for judge tasks"""
        return [
            'description',
            'task_type',
            'deliverable_data',
            'quality_requirements'
        ]
    
    async def validate_task_specifics(self, task: Dict[str, Any]) -> bool:
        """Validate judge-specific task requirements"""
        required_fields = self.get_required_task_fields()
        missing_fields = [field for field in required_fields if field not in task or not task[field]]
        
        if missing_fields:
            logger.info(f"{self.name}: Missing required fields: {missing_fields}")
            return False
            
        return True
    
    async def generate_specific_questions(self, task: Dict[str, Any]) -> List[str]:
        """Generate judge-specific clarification questions"""
        questions = []
        
        questions.extend([
            "What specific quality standards should I apply to this task?",
            "What are the key success criteria for this deliverable?",
            "Are there any brand guidelines or compliance requirements?",
            "What is the target audience for this content?",
            "What level of quality is acceptable (minimum threshold)?",
            "Should I escalate to human review if quality standards aren't met?",
            "Are there any specific technical requirements to validate?"
        ])
        
        return questions
    
    async def _execute_agent_specific_task(self, task: Dict[str, Any], session_id: str) -> Dict[str, Any]:
        """
        Execute judge-specific task logic
        """
        try:
            logger.info(f"{self.name}: Starting judge task execution")
            
            # Send status update
            await self.send_status_update("processing", 30, f"{self.name} is processing quality evaluation...")
            
            # Extract task parameters
            task_type = task.get('task_type', 'general')
            deliverable_data = task.get('deliverable_data', {})
            quality_requirements = task.get('quality_requirements', {})
            
            # Route to appropriate judge operation
            judge_operation = task.get('judge_operation', 'evaluate').lower()
            
            if judge_operation == 'generate_rubric':
                result = await self._generate_quality_rubric(task, session_id)
            elif judge_operation == 'evaluate':
                result = await self._evaluate_deliverable(task, session_id)
            elif judge_operation == 'manage_revision':
                result = await self._manage_revision_cycle(task, session_id)
            else:
                result = await self._comprehensive_judge_solution(task, session_id)
            
            return result
            
        except Exception as e:
            logger.error(f"{self.name}: Judge task execution failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "operation": "judge_execution"
            }
    
    async def _generate_quality_rubric(self, task: Dict[str, Any], session_id: str) -> Dict[str, Any]:
        """Generate comprehensive quality rubric for task"""
        await self.send_status_update("generating_rubric", 50, f"{self.name} is generating quality rubric...")
        
        task_id = str(uuid.uuid4())
        task_type = task.get('task_type', 'general')
        objectives = task.get('objectives', [])
        brand_guidelines = task.get('brand_guidelines', {})
        audience_profile = task.get('audience_profile', {})
        
        # Build rubric generation prompt
        prompt = self._build_rubric_generation_prompt(task_id, task_type, objectives, brand_guidelines, audience_profile)
        
        # Generate rubric using LLM
        response = await self.llm_client.chat(prompt)
        
        # Parse and create rubric
        rubric = self._parse_rubric_response(task_id, task_type, response)
        
        # Store rubric
        self.active_rubrics[task_id] = rubric
        
        return {
            "success": True,
            "operation": "rubric_generation",
            "task_id": task_id,
            "rubric": {
                "task_id": rubric.task_id,
                "task_type": rubric.task_type,
                "objectives": rubric.objectives,
                "criteria": [
                    {
                        "name": c.name,
                        "description": c.description,
                        "weight": c.weight,
                        "threshold": c.threshold,
                        "measurement_type": c.measurement_type
                    } for c in rubric.criteria
                ],
                "overall_threshold": rubric.overall_threshold,
                "max_revisions": rubric.max_revisions,
                "created_at": rubric.created_at.isoformat()
            },
            "rubric_time": datetime.now().isoformat()
        }
    
    async def _evaluate_deliverable(self, task: Dict[str, Any], session_id: str) -> Dict[str, Any]:
        """Evaluate deliverable against rubric using evaluation league"""
        await self.send_status_update("evaluating", 60, f"{self.name} is coordinating evaluation league...")
        
        task_id = task.get('task_id')
        deliverable_data = task.get('deliverable_data', {})
        
        # Get rubric for this task
        rubric = self.active_rubrics.get(task_id)
        if not rubric:
            return {
                "success": False,
                "error": "No rubric found for task_id",
                "operation": "evaluation"
            }
        
        # Activate evaluation league
        await self.send_status_update("evaluation_league", 70, f"{self.name} is activating evaluation league...")
        evaluation_results = await self._activate_evaluation_league(deliverable_data, rubric, task)
        
        # Judge makes final decision
        await self.send_status_update("final_judgment", 85, f"{self.name} is making final judgment...")
        decision = await self._make_final_judgment(evaluation_results, rubric)
        
        # Handle revision if needed
        if decision.revision_required:
            revision_result = await self._handle_revision_requirement(task, decision, session_id)
            decision.revision_feedback = revision_result.get('revision_feedback')
        
        return {
            "success": True,
            "operation": "deliverable_evaluation",
            "task_id": task_id,
            "judge_decision": {
                "overall_score": decision.overall_score,
                "status": decision.status.value,
                "feedback": decision.feedback,
                "revision_required": decision.revision_required,
                "revision_feedback": decision.revision_feedback,
                "evaluator_results": [
                    {
                        "evaluator_id": r.evaluator_id,
                        "evaluator_name": r.evaluator_name,
                        "score": r.score,
                        "feedback": r.feedback,
                        "confidence": r.confidence,
                        "timestamp": r.timestamp.isoformat()
                    } for r in decision.evaluator_results
                ],
                "timestamp": decision.timestamp.isoformat()
            },
            "evaluation_time": datetime.now().isoformat()
        }
    
    async def _activate_evaluation_league(self, deliverable_data: Dict[str, Any], rubric: QualityRubric, task: Dict[str, Any]) -> List[EvaluationResult]:
        """Activate the evaluation league for comprehensive assessment"""
        evaluation_results = []
        
        # Run evaluations in parallel
        evaluation_tasks = []
        
        for evaluator_id, evaluator_info in self.evaluation_league.items():
            # Skip evaluators not relevant to task type
            if not self._is_evaluator_relevant(evaluator_id, rubric.task_type):
                continue
                
            evaluation_tasks.append(
                self._run_evaluator(evaluator_id, evaluator_info, deliverable_data, rubric, task)
            )
        
        # Execute all evaluations in parallel
        results = await asyncio.gather(*evaluation_tasks, return_exceptions=True)
        
        # Process results
        for result in results:
            if isinstance(result, EvaluationResult):
                evaluation_results.append(result)
            elif isinstance(result, Exception):
                logger.error(f"Evaluator failed: {result}")
        
        return evaluation_results
    
    async def _run_evaluator(self, evaluator_id: str, evaluator_info: Dict[str, Any], 
                           deliverable_data: Dict[str, Any], rubric: QualityRubric, task: Dict[str, Any]) -> EvaluationResult:
        """Run individual evaluator"""
        try:
            # Build evaluator-specific prompt
            prompt = self._build_evaluator_prompt(evaluator_id, evaluator_info, deliverable_data, rubric, task)
            
            # Generate evaluation using LLM
            response = await self.llm_client.chat(prompt)
            
            # Parse evaluation result
            evaluation_data = self._parse_evaluation_response(response)
            
            return EvaluationResult(
                evaluator_id=evaluator_id,
                evaluator_name=evaluator_info['name'],
                score=evaluation_data['score'],
                feedback=evaluation_data['feedback'],
                confidence=evaluation_data['confidence'],
                timestamp=datetime.now()
            )
            
        except Exception as e:
            logger.error(f"Evaluator {evaluator_id} failed: {e}")
            return EvaluationResult(
                evaluator_id=evaluator_id,
                evaluator_name=evaluator_info['name'],
                score=0.0,
                feedback=f"Evaluation failed: {str(e)}",
                confidence=0.0,
                timestamp=datetime.now()
            )
    
    async def _make_final_judgment(self, evaluation_results: List[EvaluationResult], rubric: QualityRubric) -> JudgeDecision:
        """Make final judgment based on evaluation results"""
        
        if not evaluation_results:
            return JudgeDecision(
                overall_score=0.0,
                status=EvaluationStatus.FAILED,
                feedback="No evaluations completed successfully",
                revision_required=True,
                revision_feedback="System error - no evaluations available",
                evaluator_results=evaluation_results,
                timestamp=datetime.now()
            )
        
        # Calculate weighted overall score
        weighted_score = 0.0
        total_weight = 0.0
        
        for result in evaluation_results:
            evaluator_info = self.evaluation_league.get(result.evaluator_id, {})
            weight = evaluator_info.get('weight', 0.1)
            
            weighted_score += result.score * weight
            total_weight += weight
        
        overall_score = weighted_score / total_weight if total_weight > 0 else 0.0
        
        # Determine status and revision requirement
        if overall_score >= rubric.overall_threshold:
            status = EvaluationStatus.PASSED
            revision_required = False
            feedback = f"Deliverable passed quality standards with score {overall_score:.2f}"
            revision_feedback = None
        else:
            status = EvaluationStatus.NEEDS_REVISION
            revision_required = True
            feedback = f"Deliverable needs revision. Score {overall_score:.2f} below threshold {rubric.overall_threshold}"
            revision_feedback = self._generate_revision_feedback(evaluation_results, rubric)
        
        return JudgeDecision(
            overall_score=overall_score,
            status=status,
            feedback=feedback,
            revision_required=revision_required,
            revision_feedback=revision_feedback,
            evaluator_results=evaluation_results,
            timestamp=datetime.now()
        )
    
    async def _handle_revision_requirement(self, task: Dict[str, Any], decision: JudgeDecision, session_id: str) -> Dict[str, Any]:
        """Handle revision requirement and auto-revision loop"""
        task_id = task.get('task_id')
        
        # Check revision history
        if task_id not in self.revision_histories:
            self.revision_histories[task_id] = []
        
        revision_count = len(self.revision_histories[task_id])
        rubric = self.active_rubrics.get(task_id)
        
        if not rubric:
            return {
                "success": False,
                "error": "No rubric found for revision",
                "revision_feedback": "Cannot proceed with revision - no rubric available"
            }
        
        # Check if max revisions reached
        if revision_count >= rubric.max_revisions:
            return {
                "success": False,
                "status": "max_revisions_reached",
                "revision_feedback": f"Maximum revisions ({rubric.max_revisions}) reached. Escalating to human review.",
                "escalation_required": True
            }
        
        # Record revision attempt
        self.revision_histories[task_id].append({
            "attempt": revision_count + 1,
            "decision": decision,
            "timestamp": datetime.now().isoformat()
        })
        
        return {
            "success": True,
            "status": "revision_required",
            "revision_count": revision_count + 1,
            "max_revisions": rubric.max_revisions,
            "revision_feedback": decision.revision_feedback,
            "escalation_required": False
        }
    
    async def _comprehensive_judge_solution(self, task: Dict[str, Any], session_id: str) -> Dict[str, Any]:
        """Provide comprehensive judge solution (generate rubric + evaluate)"""
        await self.send_status_update("comprehensive_judgment", 80, f"{self.name} is providing comprehensive judge solution...")
        
        # First generate rubric if not exists
        if 'task_id' not in task:
            rubric_result = await self._generate_quality_rubric(task, session_id)
            if not rubric_result.get('success'):
                return rubric_result
            task['task_id'] = rubric_result['task_id']
        
        # Then evaluate deliverable
        evaluation_result = await self._evaluate_deliverable(task, session_id)
        
        return {
            "success": True,
            "operation": "comprehensive_judge_solution",
            "rubric": rubric_result.get('rubric') if 'rubric_result' in locals() else None,
            "evaluation": evaluation_result.get('judge_decision') if evaluation_result.get('success') else None,
            "completion_time": datetime.now().isoformat()
        }
    
    def _build_rubric_generation_prompt(self, task_id: str, task_type: str, objectives: List[str], 
                                      brand_guidelines: Dict[str, Any], audience_profile: Dict[str, Any]) -> str:
        """Build rubric generation prompt"""
        return f"""
# Judge Agent - Quality Rubric Generation

## Task Context
**Task ID:** {task_id}
**Task Type:** {task_type}
**Objectives:** {json.dumps(objectives, indent=2)}
**Brand Guidelines:** {json.dumps(brand_guidelines, indent=2)}
**Audience Profile:** {json.dumps(audience_profile, indent=2)}

## Rubric Generation Requirements
Generate a comprehensive quality rubric for this task type including:

1. **Objectives:** Clear definition of what success means
2. **Criteria:** Specific measurable checkpoints with:
   - Name and description
   - Weight (0.0 to 1.0)
   - Threshold (minimum score to pass)
   - Measurement type (binary, scale, percentage)
3. **Overall Threshold:** Minimum overall score (0.0 to 1.0)
4. **Max Revisions:** Maximum number of revision attempts (2-3)

## Criteria Categories to Consider
- Content Quality & Accuracy
- Brand Compliance & Voice
- Audience Alignment
- Technical Requirements
- SEO Optimization (if applicable)
- Compliance & Standards

## Output Format
Return JSON with complete rubric structure:
{{
    "objectives": ["objective1", "objective2"],
    "criteria": [
        {{
            "name": "criteria_name",
            "description": "detailed description",
            "weight": 0.25,
            "threshold": 0.8,
            "measurement_type": "scale"
        }}
    ],
    "overall_threshold": 0.8,
    "max_revisions": 3
}}

Generate the quality rubric now.
"""
    
    def _build_evaluator_prompt(self, evaluator_id: str, evaluator_info: Dict[str, Any], 
                              deliverable_data: Dict[str, Any], rubric: QualityRubric, task: Dict[str, Any]) -> str:
        """Build evaluator-specific prompt"""
        specialization = evaluator_info.get('specialization', 'general_evaluation')
        
        return f"""
# {evaluator_info['name']} - {specialization.title()} Evaluation

## Evaluator Role
**Specialization:** {specialization}
**Description:** {evaluator_info['description']}

## Deliverable Data
{json.dumps(deliverable_data, indent=2)}

## Quality Rubric
**Task Type:** {rubric.task_type}
**Objectives:** {json.dumps(rubric.objectives, indent=2)}
**Criteria:** {json.dumps([{"name": c.name, "description": c.description, "weight": c.weight} for c in rubric.criteria], indent=2)}

## Evaluation Requirements
Evaluate the deliverable specifically for {specialization}:

1. **Score:** Provide score from 0.0 to 1.0
2. **Feedback:** Specific feedback on strengths and areas for improvement
3. **Confidence:** Your confidence in this evaluation (0.0 to 1.0)
4. **Evidence:** Specific examples from the deliverable

## Output Format
Return JSON:
{{
    "score": 0.85,
    "feedback": "Detailed feedback with specific examples",
    "confidence": 0.9,
    "evidence": ["specific example 1", "specific example 2"]
}}

Evaluate now focusing on {specialization}.
"""
    
    def _parse_rubric_response(self, task_id: str, task_type: str, response: str) -> QualityRubric:
        """Parse rubric generation response"""
        try:
            rubric_data = json.loads(response)
        except json.JSONDecodeError:
            # Fallback rubric
            rubric_data = {
                "objectives": ["Deliver high-quality output", "Meet basic requirements"],
                "criteria": [
                    {
                        "name": "content_quality",
                        "description": "Overall content quality and accuracy",
                        "weight": 0.4,
                        "threshold": 0.8,
                        "measurement_type": "scale"
                    },
                    {
                        "name": "brand_compliance",
                        "description": "Adherence to brand guidelines",
                        "weight": 0.3,
                        "threshold": 0.8,
                        "measurement_type": "scale"
                    },
                    {
                        "name": "audience_alignment",
                        "description": "Alignment with target audience",
                        "weight": 0.3,
                        "threshold": 0.8,
                        "measurement_type": "scale"
                    }
                ],
                "overall_threshold": 0.8,
                "max_revisions": 3
            }
        
        criteria = [
            RubricCriteria(
                name=c['name'],
                description=c['description'],
                weight=c['weight'],
                threshold=c['threshold'],
                measurement_type=c['measurement_type']
            ) for c in rubric_data.get('criteria', [])
        ]
        
        return QualityRubric(
            task_id=task_id,
            task_type=task_type,
            objectives=rubric_data.get('objectives', []),
            criteria=criteria,
            overall_threshold=rubric_data.get('overall_threshold', 0.8),
            max_revisions=rubric_data.get('max_revisions', 3),
            created_at=datetime.now()
        )
    
    def _parse_evaluation_response(self, response: str) -> Dict[str, Any]:
        """Parse evaluation response"""
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            return {
                "score": 0.5,
                "feedback": "Evaluation parsing failed",
                "confidence": 0.0,
                "evidence": []
            }
    
    def _is_evaluator_relevant(self, evaluator_id: str, task_type: str) -> bool:
        """Check if evaluator is relevant to task type"""
        relevance_map = {
            "fact_checker": ["research", "content", "marketing", "general"],
            "brand_checker": ["marketing", "content", "sales", "general"],
            "seo_evaluator": ["content", "marketing", "web", "general"],
            "audience_checker": ["marketing", "content", "sales", "general"],
            "technical_validator": ["technology", "development", "integration", "general"]
        }
        
        relevant_types = relevance_map.get(evaluator_id, ["general"])
        return task_type.lower() in relevant_types or "general" in relevant_types
    
    def _generate_revision_feedback(self, evaluation_results: List[EvaluationResult], rubric: QualityRubric) -> str:
        """Generate structured revision feedback"""
        feedback_parts = []
        
        for result in evaluation_results:
            if result.score < 0.8:  # Low score threshold
                feedback_parts.append(f"{result.evaluator_name}: {result.feedback}")
        
        if not feedback_parts:
            return "General improvement needed to meet quality standards."
        
        return "Revision required based on: " + "; ".join(feedback_parts)
    
    def can_handle_task(self, task: Dict[str, Any]) -> bool:
        """Enhanced task matching for judge operations"""
        description = task.get('description', '').lower()
        
        judge_keywords = [
            'evaluate', 'quality', 'rubric', 'judge', 'assessment',
            'review', 'validate', 'check', 'score', 'feedback'
        ]
        
        return any(keyword in description for keyword in judge_keywords)
    
    def estimate_task_complexity(self, task: Dict[str, Any]) -> TaskComplexity:
        """Estimate complexity of judge tasks"""
        task_type = task.get('task_type', '')
        judge_operation = task.get('judge_operation', '')
        
        if 'comprehensive' in task_type.lower() or 'comprehensive' in judge_operation.lower():
            return TaskComplexity.COMPLEX
        elif 'rubric' in judge_operation.lower() or 'evaluate' in judge_operation.lower():
            return TaskComplexity.MODERATE
        else:
            return TaskComplexity.SIMPLE
