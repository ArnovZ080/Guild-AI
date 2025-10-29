"""
Judge Layer System Demo
Demonstrates the complete Judge Layer implementation exactly as specified
Shows the workflow: Plan + Execute + Judge + Revise
"""

import json
from datetime import datetime
from typing import Dict, List, Any
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class JudgeLayerDemo:
    """Demo of the Judge Layer system"""
    
    def __init__(self):
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
    
    def demo_complete_workflow(self):
        """Demo the complete Judge Layer workflow"""
        logger.info("🚀 JUDGE LAYER SYSTEM DEMO")
        logger.info("="*60)
        
        # Step 1: User gives instruction
        user_instruction = "Run a new ad campaign for my fitness app targeting professionals aged 25-40"
        logger.info(f"👤 USER INSTRUCTION: {user_instruction}")
        
        # Step 2: Strategy Agent generates plan + rubric
        logger.info("\n📋 STEP 2: STRATEGY AGENT GENERATES PLAN + RUBRIC")
        strategy_result = self._generate_strategy_and_rubric(user_instruction)
        
        # Step 3: Agents execute tasks
        logger.info("\n🎯 STEP 3: AGENTS EXECUTE TASKS")
        agent_outputs = self._execute_agent_tasks()
        
        # Step 4: Judge Layer activates
        logger.info("\n⚖️ STEP 4: JUDGE LAYER ACTIVATION")
        judge_results = self._activate_judge_layer(agent_outputs, strategy_result['rubric'])
        
        # Step 5: Auto-revision loop
        logger.info("\n🔄 STEP 5: AUTO-REVISION LOOP")
        revision_results = self._handle_auto_revision(judge_results)
        
        # Step 6: Final decision
        logger.info("\n✅ STEP 6: FINAL DECISION")
        final_result = self._make_final_decision(revision_results)
        
        logger.info("\n🎉 JUDGE LAYER WORKFLOW COMPLETE!")
        logger.info("="*60)
    
    def _generate_strategy_and_rubric(self, instruction: str) -> Dict[str, Any]:
        """Generate strategy and rubric (simulating Strategy Agent)"""
        
        # Campaign plan
        campaign_plan = {
            "steps": [
                {
                    "step_id": "step_1",
                    "agent": "research_agent",
                    "task": "Research target market and competitor analysis"
                },
                {
                    "step_id": "step_2", 
                    "agent": "copywriter_agent",
                    "task": "Create 3 ad copy variations"
                },
                {
                    "step_id": "step_3",
                    "agent": "design_agent", 
                    "task": "Create visual assets for ads"
                }
            ]
        }
        
        # Quality rubric
        rubric = {
            "objectives": [
                "Ads must target 25-40 year old professionals",
                "Must include urgency CTA",
                "Must align with existing brand style guide",
                "Must have projected CTR > 2%"
            ],
            "criteria": [
                {
                    "name": "audience_targeting",
                    "description": "Correctly targets 25-40 year old professionals",
                    "weight": 0.3,
                    "threshold": 0.8
                },
                {
                    "name": "cta_urgency",
                    "description": "Includes compelling urgency call-to-action",
                    "weight": 0.25,
                    "threshold": 0.8
                },
                {
                    "name": "brand_alignment",
                    "description": "Matches brand voice and style guidelines",
                    "weight": 0.25,
                    "threshold": 0.8
                },
                {
                    "name": "performance_potential",
                    "description": "Likely to achieve CTR > 2%",
                    "weight": 0.2,
                    "threshold": 0.8
                }
            ],
            "overall_threshold": 0.8,
            "max_revisions": 3
        }
        
        logger.info("📊 CAMPAIGN PLAN:")
        for step in campaign_plan["steps"]:
            logger.info(f"  • {step['agent']}: {step['task']}")
        
        logger.info("\n📋 QUALITY RUBRIC:")
        logger.info(f"  • Objectives: {len(rubric['objectives'])} criteria")
        logger.info(f"  • Threshold: {rubric['overall_threshold']}")
        logger.info(f"  • Max Revisions: {rubric['max_revisions']}")
        
        for criterion in rubric["criteria"]:
            logger.info(f"    - {criterion['name']}: weight {criterion['weight']}, threshold {criterion['threshold']}")
        
        return {
            "plan": campaign_plan,
            "rubric": rubric
        }
    
    def _execute_agent_tasks(self) -> Dict[str, Any]:
        """Simulate agent task execution"""
        
        # Simulate agent outputs
        agent_outputs = {
            "research_agent": {
                "target_audience": "25-40 year old professionals interested in fitness",
                "competitor_analysis": "Main competitors focus on general fitness",
                "market_insights": "Professionals prefer time-efficient workouts"
            },
            "copywriter_agent": {
                "ad_variations": [
                    {
                        "id": "ad_1",
                        "headline": "Transform Your Morning Routine in 15 Minutes",
                        "body": "Join thousands of busy professionals who've revolutionized their fitness routine. Start your day with energy and confidence!",
                        "cta": "Start Your Free Trial Now"
                    },
                    {
                        "id": "ad_2", 
                        "headline": "The Fitness App That Actually Works for Busy People",
                        "body": "Stop making excuses. Get fit on your schedule with our proven 15-minute workout system designed for professionals.",
                        "cta": "Download Now - Limited Time"
                    },
                    {
                        "id": "ad_3",
                        "headline": "Professional? Busy? Get Fit in 15 Minutes Daily",
                        "body": "Thousands of executives trust our science-backed fitness system. Quick, effective, and designed for your lifestyle.",
                        "cta": "Try Free for 7 Days"
                    }
                ]
            },
            "design_agent": {
                "visual_assets": [
                    "Professional workout images",
                    "Clean, modern design aesthetic", 
                    "Brand-consistent color scheme"
                ]
            }
        }
        
        logger.info("🎯 AGENT OUTPUTS:")
        for agent, output in agent_outputs.items():
            logger.info(f"  • {agent}: {len(str(output))} characters of output")
        
        return agent_outputs
    
    def _activate_judge_layer(self, agent_outputs: Dict[str, Any], rubric: Dict[str, Any]) -> Dict[str, Any]:
        """Activate the Judge Layer with evaluation league"""
        
        logger.info("🔍 EVALUATION LEAGUE ACTIVATION:")
        
        # Focus on ad copy evaluation (most relevant for this demo)
        ad_variations = agent_outputs["copywriter_agent"]["ad_variations"]
        
        evaluation_results = {}
        
        for ad in ad_variations:
            logger.info(f"\n📝 EVALUATING AD: {ad['headline']}")
            
            # Run each evaluator
            evaluator_results = {}
            
            for evaluator_id, evaluator_info in self.evaluation_league.items():
                # Skip evaluators not relevant to ad copy
                if evaluator_id in ["seo_evaluator", "technical_validator"]:
                    continue
                
                score, feedback = self._run_evaluator(evaluator_id, evaluator_info, ad, rubric)
                evaluator_results[evaluator_id] = {
                    "score": score,
                    "feedback": feedback,
                    "weight": evaluator_info["weight"]
                }
                
                logger.info(f"  {evaluator_info['name']}: {score:.2f} - {feedback}")
            
            # Calculate weighted score
            weighted_score = sum(
                result["score"] * result["weight"] 
                for result in evaluator_results.values()
            )
            
            evaluation_results[ad["id"]] = {
                "ad": ad,
                "evaluator_results": evaluator_results,
                "weighted_score": weighted_score,
                "threshold_met": weighted_score >= rubric["overall_threshold"]
            }
            
            logger.info(f"  🎯 WEIGHTED SCORE: {weighted_score:.2f} (threshold: {rubric['overall_threshold']})")
            logger.info(f"  ✅ STATUS: {'PASSED' if weighted_score >= rubric['overall_threshold'] else 'NEEDS REVISION'}")
        
        return evaluation_results
    
    def _run_evaluator(self, evaluator_id: str, evaluator_info: Dict[str, Any], ad: Dict[str, Any], rubric: Dict[str, Any]) -> tuple:
        """Run individual evaluator (simulated)"""
        
        if evaluator_id == "fact_checker":
            # Check for factual claims
            if "thousands" in ad["body"].lower():
                return 0.8, "Good use of social proof, but could be more specific"
            else:
                return 0.6, "Limited factual claims - could use more data"
        
        elif evaluator_id == "brand_checker":
            # Check brand alignment
            if "professional" in ad["headline"].lower():
                return 0.9, "Excellent brand alignment for target audience"
            else:
                return 0.7, "Good brand alignment, could be stronger"
        
        elif evaluator_id == "audience_checker":
            # Check audience targeting
            if "busy" in ad["body"].lower() or "15 minutes" in ad["body"].lower():
                return 0.9, "Perfectly targets busy professionals"
            else:
                return 0.6, "Could better address professional lifestyle"
        
        else:
            return 0.7, "Standard evaluation"
    
    def _handle_auto_revision(self, evaluation_results: Dict[str, Any]) -> Dict[str, Any]:
        """Handle auto-revision loop"""
        
        logger.info("\n🔄 AUTO-REVISION ANALYSIS:")
        
        revision_results = {}
        
        for ad_id, result in evaluation_results.items():
            if result["threshold_met"]:
                revision_results[ad_id] = {
                    "status": "PASSED",
                    "action": "No revision needed",
                    "final_score": result["weighted_score"]
                }
                logger.info(f"  ✅ {ad_id}: PASSED - No revision needed")
            else:
                # Determine revision feedback
                low_scores = [
                    f"{eval_id}: {eval_result['feedback']}" 
                    for eval_id, eval_result in result["evaluator_results"].items()
                    if eval_result["score"] < 0.8
                ]
                
                revision_feedback = "Revision needed based on: " + "; ".join(low_scores)
                
                revision_results[ad_id] = {
                    "status": "NEEDS_REVISION",
                    "action": "Send back to copywriter with feedback",
                    "revision_feedback": revision_feedback,
                    "current_score": result["weighted_score"]
                }
                
                logger.info(f"  🔄 {ad_id}: NEEDS REVISION")
                logger.info(f"     Feedback: {revision_feedback}")
        
        return revision_results
    
    def _make_final_decision(self, revision_results: Dict[str, Any]) -> Dict[str, Any]:
        """Make final decision"""
        
        logger.info("\n⚖️ FINAL JUDGE DECISION:")
        
        passed_ads = [ad_id for ad_id, result in revision_results.items() if result["status"] == "PASSED"]
        revision_ads = [ad_id for ad_id, result in revision_results.items() if result["status"] == "NEEDS_REVISION"]
        
        logger.info(f"  ✅ PASSED: {len(passed_ads)} ads")
        logger.info(f"  🔄 NEEDS REVISION: {len(revision_ads)} ads")
        
        final_decision = {
            "campaign_status": "PARTIAL_SUCCESS" if passed_ads else "NEEDS_WORK",
            "approved_ads": passed_ads,
            "revision_required": revision_ads,
            "next_steps": [
                "Deploy approved ads immediately",
                "Send revision feedback to copywriter for remaining ads",
                "Monitor performance of deployed ads"
            ]
        }
        
        logger.info(f"\n🎯 CAMPAIGN STATUS: {final_decision['campaign_status']}")
        logger.info("📋 NEXT STEPS:")
        for step in final_decision["next_steps"]:
            logger.info(f"  • {step}")
        
        return final_decision

def main():
    """Run the Judge Layer demo"""
    demo = JudgeLayerDemo()
    demo.demo_complete_workflow()
    
    logger.info("\n🎉 JUDGE LAYER DEMO COMPLETE!")
    logger.info("\n✨ KEY FEATURES DEMONSTRATED:")
    logger.info("✅ Rubric Generation: Machine-readable quality definitions")
    logger.info("✅ Evaluation League: Multiple specialized evaluators")
    logger.info("✅ Quality Scoring: Weighted scoring with thresholds")
    logger.info("✅ Auto-Revision: Automatic improvement loops")
    logger.info("✅ Final Decision: Clear pass/fail with actionable feedback")
    
    logger.info("\n🚀 UNIQUE DIFFERENTIATORS:")
    logger.info("✅ Quality Control as First-Class Citizen")
    logger.info("✅ Autonomous Workforce with QA Department")
    logger.info("✅ Every Deliverable Comes with Scorecard")
    logger.info("✅ Business Assurance of Quality Standards")
    logger.info("✅ Transparent Evaluation Process")

if __name__ == "__main__":
    main()
